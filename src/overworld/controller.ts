import { signal } from '@preact/signals';
import { L, tr, type LText } from '../i18n';
import { MAPS } from '../data/maps';
import { TRAINERS, trainerParty, type TrainerDef } from '../data/trainers';
import { creature } from '../data/creatures';
import { item } from '../data/items';
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
import type { MapBuilding, NpcDef, PickupDef, WarpTarget } from './mapTypes';
import { AVATARS } from './sprites';
import { tile } from './tiles';
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
export function setFlag(name: string, v = 1) {
  update((d) => (d.flags[name] = v));
}

function visibleNpc(n: NpcDef): boolean {
  if (n.showIf && !flag(n.showIf)) return false;
  if (n.hideIf && flag(n.hideIf)) return false;
  return true;
}

const pickupFlag = (map: string, p: PickupDef) => `item:${map}:${p.x},${p.y}`;

function loadMap(id: string) {
  const g = getGame();
  const def = MAPS[id] ?? MAPS.maison;
  g.setMap(def, visibleNpc, (p) => !flag(pickupFlag(def.id, p)));
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

export async function warpTo(to: WarpTarget) {
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
  await g.fadeTo(0, 180);
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
  const trig = g.map.def.triggers?.find((tg) => x >= tg.x && x < tg.x + (tg.w ?? 1) && y >= tg.y && y < tg.y + (tg.h ?? 1));
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
  const map = g.map.def.id;
  if (target.tileId === 'pc') return void runScript('pc');
  if (target.tileId === 'machine' && map === 'invocations') return void runScript('machine');
  if (target.tileId === 'table' && map === 'labo') return void runScript('labTable');
  if (target.tileId === 'bookshelf') return void locked(() => say(L('Des livres pleins de dessins de Bestioles.', 'Books full of Critter drawings.')));
  if (target.tileId === 'tv') return void locked(() => say(L('À la télé : « Les Bestioles dessinées envahissent le pays ! »', 'On TV: "Drawn Critters are taking over the country!"')));
}

function onDoor(b: MapBuilding) {
  if (b.to && (!b.script || !scripts[b.script])) return void warpTo(b.to);
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
  const out = await fight('trainer', tdef.name, trainerParty(tdef, newSeed()), { trainer: tdef });
  if (out.result === 'win') {
    setFlag(`tr:${id}`);
    await sayAll(tdef.after, tdef.name);
    if (tdef.badge && !s().badges.includes(tdef.badge)) {
      update((d) => {
        d.badges.push(tdef.badge!);
        d.flags[`badge:${tdef.badge}`] = 1;
      });
      sfx.victory();
      await say(L('Tu obtiens le {b} !', 'You received the {b}!'), undefined, { b: tr(tdef.badgeName ?? L('Badge', 'Badge')) });
    }
  }
}

// ------------------------------------------------------------------ battles

export interface FightOptions {
  trainer?: TrainerDef;
  /** First lab battle: losing is fine, no blackout. */
  friendly?: boolean;
  backdrop?: Backdrop;
  tutorial?: boolean;
}

/** Runs a battle from the world and applies its outcome to the save. */
export async function fight(kind: BattleKind, enemyName: LText, enemy: Mon[], opts: FightOptions = {}): Promise<{ result: BattleResult; state: BattleState }> {
  const d = s();
  const money = opts.trainer ? opts.trainer.money : 0;
  update((x) => enemy.forEach((m) => see(x, m.species)));
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
  await wait(250);
  await checkEvolutions();
  if (res.result === 'lose' && !opts.friendly) await blackout();
  if (opts.friendly) update((x) => healParty(x));
  return res;
}

export async function checkEvolutions() {
  for (let i = 0; i < s().party.length; i++) {
    const m = s().party[i];
    const into = evolutionOf(m);
    if (!into) continue;
    await say(L('Quoi ? {n} évolue !', 'What? {n} is evolving!'), undefined, { n: tr(creature(m.species).name) });
    update((x) => {
      evolve(x.party[i], into);
      see(x, into);
      if (!x.dex.caught.includes(into)) x.dex.caught.push(into);
    });
    sfx.levelUp();
    await showMons([into], tr(L('{n} a évolué en {to} !', '{n} evolved into {to}!'), { n: tr(creature(m.species).name), to: tr(creature(into).name) }));
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
  await warpTo({ map: d.respawn.map, x: d.respawn.x, y: d.respawn.y, facing: 'down' });
}

async function wildBattle(species: string, level: number) {
  if (!s().party.length) return;
  sfx.encounter();
  const g = getGame();
  await g.fadeTo(0.85, 120);
  await g.fadeTo(0, 120);
  await g.fadeTo(0.85, 120);
  g.fade = 0;
  await fight('wild', creature(species).name, [createMon(species, level, { rng: newSeed() })]);
}

// ------------------------------------------------------------------ helpers for scripts

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
  (window as unknown as Record<string, unknown>).__ab = { getGame, save, update, warpTo, runScript, scripts, flag, setFlag, dialog, closeDialog, monOverlay, screen, fight, createMon, checkEvolutions };
}
