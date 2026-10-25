import { signal } from '@preact/signals';
import { L, tr, type LText } from '../i18n';
import { MAPS } from '../data/maps';
import { TRAINERS, trainerParty, type TrainerDef } from '../data/trainers';
import { creature } from '../data/creatures';
import { ITEM_BY_ID, item } from '../data/items';
import { badgeDef } from '../data/badges';
import { move } from '../data/moves';
import { newSeed, nextRandom, pickWeighted } from '../engine/rng';
import type { BattleKind, BattleResult, BattleState } from '../engine/pk/battle';
import { createMon, evolutionOf, evolve, learnMove, type Mon } from '../engine/pk/creature';
import { addItem, addMon, healParty, partyAlive, persist, save, see, takeItem, update } from '../state/game';
import { go, screen, type Screen } from '../state/router';
import type { SaveData } from '../save/schema';
import type { Backdrop } from '../data/schema';
import { ask, closeDialog, dialog, say, sayAll } from './dialog';
import { DIRS, Game, type Actor } from './game';
import type { MapBuilding, MapDef, NpcDef, PickupDef, WarpTarget } from './mapTypes';
import { applyPatches } from './patches';
import { AVATARS, LOOKS, type Look } from './sprites';
import { tile } from './tiles';
import { berryFlag, isRipe, localDay } from './berries';
import { sfx } from '../audio/sfx';

let game: Game | null = null;
let stepsSinceSave = 0;

/** Creatures shown big over the world (starter pick, evolutions, gifts). */
export const monOverlay = signal<{ ids: string[]; title?: string; pick: boolean; resolve: (i: number) => void } | null>(null);
export const menuOpen = signal(false);
export const toast = signal<string | null>(null);

export function showToast(msg: string) {
  toast.value = msg;
  setTimeout(() => {
    if (toast.value === msg) toast.value = null;
  }, 2200);
}

export function getGame(): Game {
  if (!game) game = new Game({ onStep, onInteract, onDoor, onMenu: () => (menuOpen.value = true) });
  return game;
}

const s = (): SaveData => save.value!;
export const flag = (name: string) => !!save.value?.flags[name];
/** Set when a flag changes, so the map (patches, NPCs) is rebuilt once the script ends. */
let mapDirty = false;
export function setFlag(name: string, v = 1) {
  update((d) => (d.flags[name] = v));
  mapDirty = true;
}

function visibleNpc(n: NpcDef): boolean {
  if (n.showIf && !flag(n.showIf)) return false;
  if (n.hideIf && flag(n.hideIf)) return false;
  if (n.fromMap && !n.fromMap.includes(save.value?.player.returnTo?.map ?? '')) return false;
  return true;
}

const pickupFlag = (map: string, p: PickupDef) => `item:${map}:${p.x},${p.y}`;
/** Hidden items of the current map, found with A. */
let hiddenPickups: PickupDef[] = [];

function patched(def: MapDef): MapDef {
  let out = def;
  if (def.patches?.length) out = { ...out, rows: applyPatches(def.rows, def.patches, flag) };
  if (def.tintUnless && flag(def.tintUnless)) out = { ...out, tint: undefined };
  return out;
}

function loadMap(id: string) {
  const g = getGame();
  const def = MAPS[id] ?? MAPS.maison;
  const free = (p: PickupDef) => !flag(pickupFlag(def.id, p));
  g.setMap(patched(def), visibleNpc, (p) => !p.hidden && free(p), (b) => isRipe(save.value?.flags[berryFlag(def.id, b)]));
  hiddenPickups = (def.items ?? []).filter((p) => p.hidden && free(p));
}

/** Rebuilds the current map after story flags changed (erased areas, people coming and going). */
export function refreshMap() {
  mapDirty = false;
  const g = getGame();
  if (!g.map) return;
  const keep = new Map(g.npcs.map((n) => [n.id, n]));
  loadMap(g.map.def.id);
  g.npcs = g.npcs.map((n) => {
    const old = keep.get(n.id);
    return old && old.npc ? old : n;
  });
}

/** Builds the world from the save and shows it. */
export function enterWorld() {
  const g = getGame();
  const d = s();
  g.setPlayer(AVATARS[d.player.avatar] ?? AVATARS[0], d.player.x, d.player.y, d.player.facing);
  loadMap(d.player.map);
  g.lock = 0;
  g.fade = 0;
  go({ id: 'overworld' });
  const onEnter = g.map.def.onEnter;
  if (onEnter) void runScript(onEnter);
}

function savePosition() {
  const g = getGame();
  if (!save.value) return;
  save.value.player.map = g.map.def.id;
  save.value.player.x = g.player.x;
  save.value.player.y = g.player.y;
  save.value.player.facing = g.player.dir;
  persist();
}

/** Resolves 'back' (leaving a shared interior) to the door the player came in by. */
function target(to: WarpTarget | 'back'): WarpTarget {
  if (to !== 'back') return to;
  const r = save.value?.player.returnTo;
  return r ? { map: r.map, x: r.x, y: r.y, facing: r.facing ?? 'down' } : { map: 'bourg', x: 9, y: 14, facing: 'down' };
}

export async function warpTo(dest: WarpTarget | 'back', opts: { keepFade?: boolean } = {}) {
  const to = target(dest);
  const g = getGame();
  g.lock++;
  sfx.door();
  await g.fadeTo(1, 180);
  loadMap(to.map);
  g.player.x = to.x;
  g.player.y = to.y;
  g.player.fromX = to.x;
  g.player.fromY = to.y;
  g.player.moving = false;
  if (to.facing) g.player.dir = to.facing;
  savePosition();
  if (!opts.keepFade) await g.fadeTo(0, 180);
  g.lock--;
  const onEnter = g.map.def.onEnter;
  if (onEnter) await runScript(onEnter);
}

export async function runScript(id: string) {
  const fn = scripts[id];
  if (!fn) return;
  await locked(fn);
}

async function locked(fn: () => Promise<void>) {
  const g = getGame();
  g.lock++;
  try {
    await fn();
  } finally {
    if (mapDirty) refreshMap();
    g.lock--;
    g.input.clear();
  }
}

// ------------------------------------------------------------------ world hooks

function onStep(x: number, y: number): boolean {
  const g = getGame();
  if (++stepsSinceSave >= 12) {
    stepsSinceSave = 0;
    savePosition();
  } else if (save.value) {
    save.value.player.x = x;
    save.value.player.y = y;
    save.value.player.facing = g.player.dir;
  }
  const wp = g.map.warps.get(y * g.map.w + x);
  if (wp) {
    void warpTo(wp.to);
    return true;
  }
  const trig = g.map.def.triggers?.find((tg) =>
    x >= tg.x && x < tg.x + (tg.w ?? 1) && y >= tg.y && y < tg.y + (tg.h ?? 1)
    && (!tg.if || flag(tg.if)) && (!tg.unless || !flag(tg.unless)));
  if (trig && scripts[trig.script]) {
    void runScript(trig.script);
    return true;
  }
  const spotter = trainerSpotting();
  if (spotter) {
    void locked(() => trainerApproach(spotter));
    return true;
  }
  const enc = g.map.def.encounters;
  const grassy = enc && (enc.anyTile || tile(g.map.tiles[y * g.map.w + x]).encounter);
  if (enc && grassy && partyAlive(s()) && Math.random() < enc.rate) {
    const st = { rng: newSeed() };
    const e = pickWeighted(st, enc.table, (r) => r.w);
    const level = e.min + Math.floor(nextRandom(st) * (e.max - e.min + 1));
    void locked(() => wildBattle(e.id, level));
    return true;
  }
  return false;
}

function onInteract(target: { npc?: Actor; sign?: { text: LText }; pickup?: PickupDef; tileId?: string; x: number; y: number }) {
  const g = getGame();
  if (target.npc) {
    const npc = target.npc;
    if (npc.npc) g.faceToward(npc, g.player);
    const def = npc.npc;
    if (!def) return;
    if (def.trainer && !flag(`tr:${def.trainer}`)) return void locked(() => trainerBattle(def.trainer!, npc));
    if (def.trainer && TRAINERS[def.trainer].badge && flag('ending')) return void locked(() => rematch(def.trainer!, npc));
    if (def.trainer) return void locked(() => sayAll(TRAINERS[def.trainer!].after, TRAINERS[def.trainer!].name));
    if (def.script && scripts[def.script]) return void runScript(def.script);
    if (def.text) return void locked(() => sayAll(def.text!));
    return;
  }
  if (target.pickup) {
    const p = target.pickup;
    return void locked(async () => {
      const n = p.count ?? 1;
      update((d) => {
        addItem(d, p.item, n);
        d.flags[pickupFlag(g.map.def.id, p)] = 1;
      });
      g.removePickup(p);
      sfx.confirm();
      await say(L('Tu trouves {i}{n} !', 'You found {i}{n}!'), undefined, { i: tr(item(p.item).name), n: n > 1 ? ` ×${n}` : '' });
    });
  }
  if (target.sign) return void locked(() => say(target.sign!.text));
  const bush = g.map.def.berries?.find((b) => b.x === target.x && b.y === target.y);
  if (bush) {
    return void locked(async () => {
      const key = berryFlag(g.map.def.id, bush);
      if (!isRipe(s().flags[key])) {
        await say(L('Il n’y a plus de baies sur ce buisson. Elles repousseront demain !', 'There are no berries left on this bush. They’ll grow back tomorrow!'));
        return;
      }
      const n = 1 + Math.floor(Math.random() * 3);
      update((d) => {
        addItem(d, bush.item, n);
        d.flags[key] = localDay();
      });
      g.pickBerries(bush);
      sfx.confirm();
      await say(L('Tu cueilles {i}{n} !', 'You picked {i}{n}!'), undefined, { i: tr(item(bush.item).name), n: n > 1 ? ` ×${n}` : '' });
    });
  }
  const spot = g.map.def.interact?.find((it) => it.x === target.x && it.y === target.y);
  if (spot && scripts[spot.script]) return void runScript(spot.script);
  const hidden = hiddenPickups.find((p) => p.x === target.x && p.y === target.y);
  if (hidden) {
    hiddenPickups = hiddenPickups.filter((p) => p !== hidden);
    return void locked(async () => {
      const n = hidden.count ?? 1;
      update((d) => {
        addItem(d, hidden.item, n);
        d.flags[pickupFlag(g.map.def.id, hidden)] = 1;
      });
      sfx.sparkle();
      await say(L('Tiens ? Il y a quelque chose ici… Tu trouves {i} !', 'Huh? There’s something here… You found {i}!'), undefined, { i: tr(item(hidden.item).name) });
      if (hidden.item.startsWith('page-')) await runScript('pageFound');
    });
  }
  if (target.tileId === 'pc') return void runScript('pc');
  if (target.tileId === 'bookshelf') return void locked(() => say(L('Des livres pleins de dessins de Bestioles.', 'Books full of Critter drawings.')));
  if (target.tileId === 'tv') return void locked(() => say(L('À la télé : « Les Bestioles dessinées envahissent le pays ! »', 'On TV: "Drawn Critters are taking over the country!"')));
}

function onDoor(b: MapBuilding) {
  if (b.to && (!b.script || !scripts[b.script])) {
    // shared interiors (Healing Centers, shops) remember which town's door was used
    if (MAPS[b.to.map]?.generic && save.value) {
      const g = getGame();
      save.value.player.returnTo = { map: g.map.def.id, x: b.x + b.door, y: b.y + b.h, facing: 'down' };
    }
    return void warpTo(b.to);
  }
  void locked(async () => {
    if (b.script && scripts[b.script]) await scripts[b.script]();
    else if (b.lockedText) await say(b.lockedText);
    const g = getGame();
    if (screen.value.id === 'overworld' && g.map.doors.get(g.player.y * g.map.w + g.player.x) === b) await g.walk(g.player, ['down'], 160);
  });
}

// ------------------------------------------------------------------ trainers

function trainerSpotting(): Actor | null {
  const g = getGame();
  for (const n of g.npcs) {
    const def = n.npc;
    if (!def?.trainer || flag(`tr:${def.trainer}`) || !partyAlive(s())) continue;
    const [dx, dy] = DIRS[n.dir];
    for (let i = 1; i <= (def.sight ?? 3); i++) {
      const x = n.x + dx * i, y = n.y + dy * i;
      if (g.player.x === x && g.player.y === y) return n;
      if (g.blocked(x, y, g.player)) break;
    }
  }
  return null;
}

async function trainerApproach(n: Actor) {
  const g = getGame();
  n.bubble = '!';
  sfx.encounter();
  await wait(700);
  n.bubble = undefined;
  const dir = n.dir;
  const [dx, dy] = DIRS[dir];
  while (!(n.x + dx === g.player.x && n.y + dy === g.player.y)) {
    if (!g.tryMove(n, dir)) break;
    await new Promise<void>((r) => (n.resolveMove = r));
  }
  g.faceToward(g.player, n);
  await trainerBattle(n.npc!.trainer!, n);
}

export async function trainerBattle(id: string, actor?: Actor) {
  const tdef = TRAINERS[id];
  if (!partyAlive(s())) {
    await say(L('Tes Bestioles sont épuisées… Va vite les soigner au Centre de soin !', 'Your Critters are worn out… Go heal them at the Healing Center!'), tdef.name);
    return;
  }
  if (actor) getGame().faceToward(actor, getGame().player);
  await sayAll(tdef.before, tdef.name);
  const out = await fight('trainer', tdef.name, trainerParty(tdef, newSeed()), { trainer: tdef, look: actor?.npc?.look, grey: tdef.grey });
  if (out.result === 'win') {
    // everything the win unlocks is saved at once, before any dialog: closing the app during the
    // cut-scene that follows can't block the story (the map itself changes when the scene ends)
    const newBadge = !!tdef.badge && !s().badges.includes(tdef.badge);
    update((d) => {
      d.flags[`tr:${id}`] = 1;
      if (tdef.storyFlag) d.flags[tdef.storyFlag] = 1;
      if (newBadge) {
        d.badges.push(tdef.badge!);
        d.flags[`badge:${tdef.badge}`] = 1;
      }
    });
    mapDirty = true;
    // the first defeat line is said in battle, like the GBA games
    await sayAll(tdef.after.slice(1, tdef.badge ? 1 : undefined), tdef.name);
    if (newBadge && tdef.badge) {
      sfx.victory();
      await say(L('{name} reçoit le {b} de {l} !', '{name} received the {b} from {l}!'), undefined, { b: tr(badgeDef(tdef.badge)?.name ?? L('Badge', 'Badge')), l: tr(badgeDef(tdef.badge)?.leader ?? tdef.name) });
      // like FireRed, the leader adds a technical capsule
      const tm = badgeDef(tdef.badge)?.tm;
      if (tm && !s().bag[tm]) {
        const first = !Object.keys(s().bag).some((k) => ITEM_BY_ID[k]?.kind === 'tm');
        giveItem(tm);
        sfx.confirm();
        await say(L('{l} te donne {i} !', '{l} gave you {i}!'), undefined, { l: tr(badgeDef(tdef.badge)?.leader ?? tdef.name), i: tr(item(tm).name) });
        if (first) await say(L('Une capsule technique apprend une capacité à une Bestiole compatible, autant de fois que tu veux ! Regarde dans ton Sac, poche CAPSULES.', 'A technical capsule teaches a move to a compatible Critter, as many times as you like! Look in your Bag, CAPSULES pocket.'), tdef.name);
      }
      // leaders explain what comes next after giving the badge
      await sayAll(tdef.after.slice(1), tdef.name);
    }
    if (tdef.afterScript && scripts[tdef.afterScript]) await scripts[tdef.afterScript]();
  }
}

/** After the ending, Atelier Masters accept rematches with stronger teams. */
async function rematch(id: string, actor: Actor) {
  const tdef = TRAINERS[id];
  const c = await ask(L('Te revoilà ! Une revanche ? Cette fois, je ne retiens pas mes coups.', 'You’re back! A rematch? This time I won’t hold back.'), [L('Oui', 'Yes'), L('Non', 'No')], tdef.name);
  if (c !== 0) return;
  if (!partyAlive(s())) {
    await say(L('Tes Bestioles sont épuisées… Va d’abord les soigner !', 'Your Critters are worn out… Heal them first!'), tdef.name);
    return;
  }
  const party = tdef.party.map((m) => ({ ...m, level: Math.min(50, m.level + 12) }));
  const strong: TrainerDef = { ...tdef, id: `${id}:rematch`, badge: undefined, afterScript: undefined, money: tdef.money * 2, party };
  const out = await fight('trainer', tdef.name, trainerParty(strong, newSeed()), { trainer: strong, look: actor.npc?.look });
  if (out.result === 'win') {
    // remembered for the Town Map's list of things left to do
    setFlag(`rematch:${id}`);
    await say(L('Incroyable… Tu dessines de mieux en mieux !', 'Incredible… You draw better and better!'), tdef.name);
  }
}

// ------------------------------------------------------------------ battles

export interface FightOptions {
  trainer?: TrainerDef;
  /** First lab battle: losing is fine, no blackout. */
  friendly?: boolean;
  backdrop?: Backdrop;
  tutorial?: boolean;
  /** How the opponent trainer looks (battle intro). */
  look?: Look;
  /** Team Gomme: their Bestioles are greyed out. */
  grey?: boolean;
}

/** Runs a battle from the world and applies its outcome to the save. */
export async function fight(kind: BattleKind, enemyName: LText, enemy: Mon[], opts: FightOptions = {}): Promise<{ result: BattleResult; state: BattleState }> {
  const d = s();
  const money = opts.trainer ? opts.trainer.money : 0;
  update((x) => enemy.forEach((m) => see(x, m.species)));
  const g = getGame();
  await g.wipeTo(1, kind === 'wild' ? 480 : 620, opts.grey ? 'eraser' : 'pencil');
  const res = await new Promise<{ result: BattleResult; state: BattleState }>((resolve) => {
    go({
      id: 'battle',
      props: {
        setup: {
          kind, seed: newSeed(),
          player: { name: L(d.player.name, d.player.name), party: d.party, isAI: false },
          enemy: { name: enemyName, party: enemy, isAI: true },
        },
        bag: d.bag,
        onUseItem: (id) => update((x) => void takeItem(x, id)),
        backdrop: opts.backdrop ?? getGame().map.def.backdrop ?? 'grass',
        tutorial: opts.tutorial,
        playerLook: AVATARS[d.player.avatar] ?? AVATARS[0],
        music: opts.trainer?.id === 'effaceur' ? 'final' : opts.trainer?.badge || opts.trainer?.id.endsWith(':rematch') ? 'leader' : opts.grey ? 'gomme' : kind === 'trainer' ? 'trainer' : 'wild',
        trainer: kind === 'trainer' ? {
          title: tr(enemyName),
          look: opts.look ?? LOOKS.kid,
          quote: opts.trainer?.after[0] ? tr(opts.trainer.after[0], { name: d.player.name }) : undefined,
          grey: opts.grey,
        } : undefined,
        rewardLines: (result) => (result === 'win' && money ? [tr(L('Tu gagnes {n} ₽.', 'You got ₽{n} for winning!'), { n: money })] : []),
        onEnd: (result, state) => resolve({ result, state }),
      },
    });
  });
  update((x) => {
    // the battle worked on copies: bring back HP, XP, levels, moves and statuses
    x.party = res.state.sides[0].party.map((m) => ({ ...m }));
    x.stats.battles++;
    if (res.result === 'win') x.money += money;
    if (res.result === 'capture') {
      const wild = res.state.sides[1].party[res.state.sides[1].active];
      wild.sleepTurns = wild.status === 'sleep' ? wild.sleepTurns : 0;
      const where = addMon(x, { ...wild });
      x.stats.captures++;
      if (where === 'box') showToast(tr(L('{n} est envoyé dans le PC.', '{n} was sent to the PC.'), { n: tr(creature(wild.species).name) }));
    }
  });
  go({ id: 'overworld' });
  g.wipe = 0;
  g.fade = 1;
  void g.fadeTo(0, 320, 'black');
  await wait(250);
  await checkEvolutions();
  if (res.result === 'lose' && !opts.friendly) await blackout();
  if (opts.friendly) update((x) => healParty(x));
  return res;
}

/** Evolution scene shown over the world (or null). */
export const evoOverlay = signal<{ from: string; to: string; resolve: (evolved: boolean) => void } | null>(null);

export async function checkEvolutions() {
  for (let i = 0; i < s().party.length; i++) {
    const m = s().party[i];
    const into = evolutionOf(m);
    // stopped with B: asked again at the next level
    if (!into || s().flags[`noevo:${m.uid}`] === m.level) continue;
    const evolved = await new Promise<boolean>((resolve) => (evoOverlay.value = { from: m.species, to: into, resolve }));
    evoOverlay.value = null;
    if (!evolved) {
      setFlag(`noevo:${m.uid}`, m.level);
      continue;
    }
    update((x) => {
      evolve(x.party[i], into);
      see(x, into);
      if (!x.dex.caught.includes(into)) x.dex.caught.push(into);
    });
    // like the GBA games, the new form learns its moves of the current level right away
    const lvl = s().party[i].level;
    for (const [at, id] of creature(into).learnset) {
      if (at === lvl && !s().party[i].moves.some((mv) => mv.id === id)) await teachMove(i, id);
    }
  }
}

async function teachMove(i: number, id: string) {
  const m = s().party[i];
  const vars = { n: tr(creature(m.species).name), m: tr(move(id).name) };
  if (m.moves.length < 4) {
    update((x) => learnMove(x.party[i], x.party[i].moves.length, id));
    sfx.levelUp();
    await say(L('{n} apprend {m} !', '{n} learned {m}!'), undefined, vars);
    return;
  }
  const c = await ask(L('{n} veut apprendre {m}. Oublier quelle capacité ?', '{n} wants to learn {m}. Forget which move?'),
    [...m.moves.map((mv) => move(mv.id).name), L('Ne pas apprendre', 'Don’t learn it')], undefined, vars);
  if (c >= m.moves.length) {
    await say(L('{n} n’a pas appris {m}.', '{n} did not learn {m}.'), undefined, vars);
    return;
  }
  const old = tr(move(m.moves[c].id).name);
  update((x) => learnMove(x.party[i], c, id));
  await say(L('{n} oublie {o} et apprend {m} !', '{n} forgot {o} and learned {m}!'), undefined, { ...vars, o: old });
}

async function blackout() {
  const d = s();
  const lost = Math.floor(d.money / 2);
  await say(L('Tu n’as plus de Bestiole en forme… Tu perds {n} ₽ et tu cours te reposer.', 'You have no more Critters that can fight… You drop ₽{n} and hurry back to rest.'), undefined, { n: lost });
  update((x) => {
    x.money -= lost;
    healParty(x);
  });
  if (save.value) save.value.player.returnTo = d.respawn.returnTo;
  await warpTo({ map: d.respawn.map, x: d.respawn.x, y: d.respawn.y, facing: 'down' });
}

async function wildBattle(species: string, level: number) {
  if (!s().party.length) return;
  sfx.encounter();
  const g = getGame();
  // two white flashes, then the pencil scribbles over the screen
  for (let i = 0; i < 2; i++) {
    await g.fadeTo(0.8, 90, 'white');
    await g.fadeTo(0, 90);
  }
  const wild = createMon(species, level, { rng: newSeed() });
  // like the GBA games, some wild creatures carry an item (kept when caught)
  const held = creature(species).wildItem;
  if (held && Math.random() * 100 < held.pct) wild.item = held.id;
  await fight('wild', creature(species).name, [wild]);
}

// ------------------------------------------------------------------ helpers for scripts

/** Quick white (or black) flash of the screen. */
export async function flash(color: 'white' | 'black' = 'white', ms = 140) {
  const g = getGame();
  await g.fadeTo(0.9, ms / 2, color);
  await g.fadeTo(0, ms);
}

export async function shake(ms = 500) {
  getGame().shakeUntil = performance.now() + ms;
  await wait(ms);
}

/** Shows a bubble over someone ('!', '?', '…', '♪', '♥', 'zz') for a moment. */
export async function bubble(id: string, kind: string, ms = 900) {
  const g = getGame();
  const a = id === 'player' ? g.player : g.npc(id);
  if (!a) return;
  a.bubble = kind;
  await wait(ms);
  a.bubble = undefined;
}

export const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Shows creatures big; with `pick`, the player chooses one and its index is returned. */
export function showMons(ids: string[], title?: string, pick = false): Promise<number> {
  return new Promise((resolve) => (monOverlay.value = { ids, title, pick, resolve }));
}

/** Opens a full screen (shop, PC…) and resolves when it goes back to the world. */
export function openScreen(sc: Screen): Promise<void> {
  return new Promise((resolve) => {
    returnResolver = resolve;
    go(sc);
  });
}
let returnResolver: (() => void) | null = null;
export function backToWorld() {
  go({ id: 'overworld' });
  const r = returnResolver;
  returnResolver = null;
  r?.();
}

export { ask, say, sayAll };

// story scripts register themselves here (see src/story/scripts.ts)
export const scripts: Record<string, () => Promise<void>> = {};

/** Gives a new creature (party first, then PC). */
export function giveMon(species: string, level: number): Mon {
  const m = createMon(species, level, { rng: newSeed() });
  update((x) => void addMon(x, m));
  return m;
}

export function giveItem(id: string, n = 1) {
  update((x) => addItem(x, id, n));
}

if (import.meta.env.DEV && typeof window !== 'undefined') {
  // debugging handle for playtesting from the console
  (window as unknown as Record<string, unknown>).__ab = { getGame, save, update, warpTo, runScript, scripts, flag, setFlag, dialog, closeDialog, monOverlay, screen, fight, createMon, checkEvolutions, refreshMap, trainerBattle };
}
