import { effect, signal } from '@preact/signals';
import { L, tr, type LText } from '../i18n';
import { MAPS } from '../data/maps';
import { DIFFICULTY, TRAINERS, partyOf, rematchParty, teamLevel, trainerParty, type TrainerDef } from '../data/trainers';
import { creature, monLabel } from '../data/creatures';
import { ITEM_BY_ID, item } from '../data/items';
import { badgeDef } from '../data/badges';
import { waiting } from '../data/progress';
import { catchBoost, glowingSpots, moneyBoost, shinyChance, xpBoost } from '../data/realLife';
import { BORD_REMATCHES, REPENT_GIFTS, REPENT_GIFT_LINE, RETIRED, rematchesWon, repentLine, repentLook, repentant } from '../data/afterStory';
import { move } from '../data/moves';
import { newSeed, nextRandom, pickWeighted } from '../engine/rng';
import type { BattleKind, BattleResult, BattleState } from '../engine/pk/battle';
import { BASE_FRIENDSHIP, SHINY_CHANCE, createMon, evolutionMoves, evolutionOf, evolve, growLevel, learnMove, MAX_LEVEL, maxHp, type LevelUp, type Mon } from '../engine/pk/creature';
import { addItem, addMon, allMons, autosave, blackoutLoss, healParty, partyAlive, save, see, takeItem, update } from '../state/game';
import type { MetHow } from '../engine/pk/creature';
import { go, screen, type Screen } from '../state/router';
import type { SaveData } from '../save/schema';
import type { Backdrop } from '../data/schema';
import { ask, closeDialog, dialog, say, sayAll } from './dialog';
import { DIRS, Game, miniFor, sheetFor, type Actor } from './game';
import type { FresqueDef, MapBuilding, MapDef, NpcDef, ObstacleDef, PickupDef, WarpTarget } from './mapTypes';
import { flipBarriers, solvedPuzzles } from './puzzles';
import { applyPatches } from './patches';
import { LOOKS, lookOf, type Look } from './sprites';
import { OLD_AVATARS } from '../data/appearance';
import { isWater, tile } from './tiles';
import { calm, missed, wildOdds, wildStep } from './encounterRate';
import { berryFlag, isRipe, localDay } from './berries';
import { daycareStep } from '../state/daycare';
import { prefs } from '../state/prefs';
import { hourNow, meetsTime, phaseAt, type DayPhase } from '../state/clock';
import { sfx } from '../audio/sfx';
import { playJingle, playMusic, type TrackId } from '../audio/music';
import { trackForMap } from '../audio/mapMusic';

let game: Game | null = null;
let stepsSinceSave = 0;
/** The calm after a battle and the odds growing step after step (FireRed's way). */
const odds = wildOdds();

/** Creatures shown big over the world (starter pick, evolutions, gifts). */
export const monOverlay = signal<{ ids: string[]; title?: string; pick: boolean; resolve: (i: number) => void } | null>(null);
/** Nickname entry shown over the world (resolves with the name, or null for none). */
export const nameOverlay = signal<{ mon: Mon; resolve: (name: string | null) => void } | null>(null);
export const menuOpen = signal(false);
export const toast = signal<string | null>(null);

export function showToast(msg: string) {
  toast.value = msg;
  setTimeout(() => {
    if (toast.value === msg) toast.value = null;
  }, 2200);
}

export function getGame(): Game {
  if (!game) {
    game = new Game({ onStep, onInteract, onDoor, onMenu: () => (menuOpen.value = true), onPush, onDrop, canFall, onFollower: () => void locked(talkFollower) });
    game.canRun = () => !!save.value?.bag.baskets;
    // the sky follows the clock
    setInterval(updateTime, 30000);
    // the follower changes with the party's first Bestiole (and the option)
    effect(() => {
      void save.value;
      void prefs.value;
      refreshFollower();
    });
    effect(tellRewards);
  }
  return game;
}

/** The rewards waiting on the trainer card at the last look, for the game being played. */
let rewardsSeen: { game: number; n: number } | null = null;
/** Back in the world, a toast says when a Progress reward is waiting (and once after loading a game that has some). */
function tellRewards() {
  const d = save.value;
  if (!d || screen.value.id !== 'overworld') return;
  const n = waiting(d);
  const seen = rewardsSeen?.game === d.createdAt ? rewardsSeen.n : 0;
  if (n > seen) showToast(tr(L('Une récompense t’attend sur ta carte !', 'A reward is waiting on your card!')));
  rewardsSeen = { game: d.createdAt, n };
}

const s = (): SaveData => save.value!;

const TIME_TINT: Record<DayPhase, string | null> = { day: null, evening: 'rgb(255, 200, 165)', night: 'rgb(105, 120, 200)' };
/** Morning, evening or night in Papeterre (the device's clock, shifted by naps at home). */
export const dayPhase = (): DayPhase => phaseAt(hourNow(save.value?.clockShift ?? 0));
export function updateTime() {
  if (game) game.timeTint = TIME_TINT[dayPhase()];
}
export const flag = (name: string) => !!save.value?.flags[name];
/** Set when a flag changes, so the map (patches, NPCs) is rebuilt once the script ends. */
let mapDirty = false;
export function setFlag(name: string, v = 1) {
  update((d) => (d.flags[name] = v));
  mapDirty = true;
}

function visibleNpc(n: NpcDef): boolean {
  if (n.showIf && !flag(n.showIf)) return false;
  // after the ending, Team Gomme's admins wait at the fortress top only
  if (n.trainer && RETIRED.includes(n.trainer) && flag('ending')) return false;
  if (n.hideIf && flag(n.hideIf)) return false;
  const back = save.value?.player.returnTo;
  if (n.fromMap && !n.fromMap.includes(back?.map ?? '')) return false;
  if (n.fromDoor && !n.fromDoor.some(([m, x, y]) => back?.map === m && back.x === x && back.y === y)) return false;
  return true;
}

const pickupFlag = (map: string, p: PickupDef) => `item:${map}:${p.x},${p.y}`;
/** Hidden items of the current map, found with A. */
let hiddenPickups: PickupDef[] = [];

/** Pushables that only exist while a flag is (not) set; one that fell through a pit is gone for good. */
function visibleObstacle(o: ObstacleDef): boolean {
  if (o.showIf && !flag(o.showIf)) return false;
  if (o.hideIf && flag(o.hideIf)) return false;
  return !(o.id && flag(`fell:${o.id}`));
}

export const holeFlag = (map: string, x: number, y: number) => `hole:${map}:${x},${y}`;
/** Crayon barriers: flipped by a switch for the rest of the visit (they reset on the next one). */
let barriersFlipped = false;
let visiting = '';

function patched(def: MapDef): MapDef {
  let out = def;
  if (def.patches?.length) out = { ...out, rows: applyPatches(def.rows, def.patches, flag) };
  // pits a boulder or block fell into are filled for good
  const filled = (def.holes ?? []).filter((h) => flag(holeFlag(def.id, h.x, h.y)));
  if (filled.length) out = { ...out, rows: out.rows.map((r, y) => [...r].map((c, x) => (filled.some((h) => h.x === x && h.y === y) ? '0' : c)).join('')) };
  if (barriersFlipped) out = { ...out, rows: flipBarriers(out.rows, true) };
  if (def.obstacles?.some((o) => o.showIf || o.hideIf || o.id)) out = { ...out, obstacles: def.obstacles.filter(visibleObstacle) };
  if (def.tintUnless && flag(def.tintUnless)) out = { ...out, tint: undefined, drained: undefined };
  if (def.recolour && flag(def.recolour.if)) out = { ...out, border: def.recolour.border ?? out.border, backdrop: def.recolour.backdrop ?? out.backdrop };
  // after the ending, Team Gomme wear uniforms they coloured in themselves
  if (def.npcs?.some((n) => repentant(n.trainer, !!flag('ending')))) {
    out = { ...out, npcs: def.npcs.map((n) => (repentant(n.trainer, true) ? { ...n, look: repentLook(n.id, n.look) } : n)) };
  }
  if (def.buildings?.some((b) => b.sketchUnless)) out = { ...out, buildings: def.buildings.map((b) => (b.sketchUnless ? { ...b, sketch: !flag(b.sketchUnless) } : b)) };
  // the Inn and the shop of a town only sketched in pencil are sketched too
  const town = def.generic ? MAPS[save.value?.player.returnTo?.map ?? ''] : undefined;
  if (town?.sketchUnless && !flag(town.sketchUnless)) out = { ...out, sketch: true };
  return out;
}

function loadMap(id: string) {
  const g = getGame();
  const def = MAPS[id] ?? MAPS.maison;
  // a new visit puts the crayon barriers back (a refresh of the same map keeps them)
  if (def.id !== visiting) barriersFlipped = false;
  visiting = def.id;
  const free = (p: PickupDef) => !flag(pickupFlag(def.id, p)) && (!p.showIf || flag(p.showIf));
  g.setMap(patched(def), visibleNpc, (p) => !p.hidden && free(p), (b) => isRipe(save.value?.flags[berryFlag(def.id, b)]));
  hiddenPickups = (def.items ?? []).filter((p) => p.hidden && free(p));
  // the people of the map as shown (Papa is not in the bedroom any more)
  g.glows = glowingSpots({ interact: def.interact, npcs: g.npcs.flatMap((n) => (n.npc ? [n.npc] : [])) }, save.value?.flags ?? {});
  // places visited (the Bestiodex only names habitats you have been to)
  if (save.value) save.value.flags[`seen:${def.id}`] = 1;
  updateTime();
  markRematches();
}

/** Rebuilds the current map after story flags changed (erased areas, people coming and going). */
export function refreshMap() {
  mapDirty = false;
  const g = getGame();
  if (!g.map) return;
  const keep = new Map(g.npcs.map((n) => [n.id, n]));
  // a refresh keeps the boat, the gloves and what was cleared on this visit
  const field = { surfing: g.surfing, strength: g.strength, obstacles: g.obstacles, biking: g.biking };
  loadMap(g.map.def.id);
  Object.assign(g, field);
  g.npcs = g.npcs.map((n) => {
    const old = keep.get(n.id);
    return old && old.npc ? old : n;
  });
}

/** Builds the world from the save and shows it. */
export function enterWorld() {
  const g = getGame();
  const d = s();
  g.setPlayer(lookOf(playerLook()), d.player.x, d.player.y, d.player.facing);
  loadMap(d.player.map);
  g.unstick();
  refreshFollower();
  g.placeFollower();
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
  autosave();
}

/** Resolves 'back' (leaving a shared interior) to the door the player came in by. */
function target(to: WarpTarget | 'back'): WarpTarget {
  if (to !== 'back') return to;
  const r = save.value?.player.returnTo;
  return r ? { map: r.map, x: r.x, y: r.y, facing: r.facing ?? 'down' } : { map: 'bourg', x: 9, y: 14, facing: 'down' };
}

export async function warpTo(dest: WarpTarget | 'back', opts: { keepFade?: boolean; sail?: boolean } = {}) {
  const to = target(dest);
  const g = getGame();
  // sailing from one map onto the water of the next (a river into the lake), or coming up from a dive
  const sailing = g.surfing || !!opts.sail;
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
  if (sailing && isWater(g.tileAt(to.x, to.y))) g.surfing = true;
  g.placeFollower();
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
  if (save.value) {
    save.value.steps = (save.value.steps ?? 0) + 1;
    // walking together makes friends
    if (save.value.steps % 128 === 0) for (const m of save.value.party) m.friendship = Math.min(255, (m.friendship ?? 70) + 1);
    // the Pension: XP for the Bestioles left there, and sometimes an egg
    if (daycareStep(save.value, save.value.steps, { rng: newSeed() })) showToast(tr(L('La Pension Crayonnée a une surprise pour toi !', 'The Pencil Day Care has a surprise for you!')));
    // eggs carried in the party hatch after enough steps
    for (const m of save.value.party) if (m.egg) m.egg.steps--;
    const ready = save.value.party.find((m) => m.egg && m.egg.steps <= 0);
    if (ready) {
      void locked(() => hatch(ready.uid));
      return true;
    }
    if (save.value.repel) {
      save.value.repel--;
      if (!save.value.repel) {
        void locked(() => say(L('L’effet du Spray Anti-Gribouille s’est dissipé.', 'The Shoo Spray wore off.')));
        return true;
      }
    }
  }
  // stepped into a pit: down to the floor below
  const pit = g.tileAt(x, y) === 'hole' && g.map.def.holes?.find((h) => h.x === x && h.y === y && h.to && h.fall);
  if (pit && pit.to) {
    void locked(() => fallTo(pit.to!));
    return true;
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
  // sliding on glossy paper: nothing jumps out until the slide ends
  if (g.tileAt(x, y) === 'glossy') return false;
  const spotter = trainerSpotting();
  if (spotter) {
    void locked(() => trainerApproach(spotter));
    return true;
  }
  // sailing: wild Bestioles of the water table, on water only
  const here = g.map.tiles[y * g.map.w + x];
  const onWater = g.surfing && isWater(here);
  const enc = onWater ? g.map.def.surf : g.surfing ? undefined : g.map.def.encounters;
  // a cave's whole floor counts as one ground, like the GBA's
  const ground = !enc ? '' : onWater ? 'water' : enc.anyTile ? 'cave' : tile(here).encounter ? here : '';
  const repel = (s().repel ?? 0) > 0;
  if (!enc) odds.ground = '';
  if (enc && wildStep(odds, enc.rate, ground, { bike: g.biking, repel }) && partyAlive(s())) {
    const st = { rng: newSeed() };
    // some Bestioles only come out at night (or by day), or once the story is over
    const phase = dayPhase();
    const table = enc.table.filter((r) => meetsTime(r.time, phase) && (!r.if || flag(r.if)));
    if (!table.length) return false;
    const e = pickWeighted(st, table, (r) => r.w);
    const level = e.min + Math.floor(nextRandom(st) * (e.max - e.min + 1));
    // the spray keeps away wild Bestioles weaker than the first one able to fight
    const lead = s().party.find((m) => m.hp > 0 && !m.egg);
    if (repel && lead && level < lead.level) {
      missed(odds, enc.rate, true);
      return false;
    }
    void locked(async () => void (await wildBattle(e.id, level)));
    return true;
  }
  return false;
}

function onInteract(target: { npc?: Actor; sign?: { text: LText }; pickup?: PickupDef; obstacle?: ObstacleDef; tileId?: string; x: number; y: number }) {
  const g = getGame();
  // diving down from a dark patch of water, or coming back up through a circle of light
  const here = g.tileAt(g.player.x, g.player.y);
  if (!target.npc && !target.sign && g.surfing && here === 'deep' && g.map.def.dive) return void locked(diveDown);
  if (!target.npc && !target.sign && here === 'lightshaft' && g.map.def.underwater) return void locked(surfaceUp);
  if (target.npc) {
    const npc = target.npc;
    if (npc.npc) g.faceToward(npc, g.player);
    const def = npc.npc;
    if (!def) return;
    if (repentant(def.trainer, !!flag('ending'))) return void locked(() => repentTalk(def.trainer!));
    if (def.trainer && !flag(`tr:${def.trainer}`)) return void locked(() => trainerBattle(def.trainer!, npc));
    if (def.trainer && TRAINERS[def.trainer].badge && flag('ending')) return void locked(() => rematch(def.trainer!, npc));
    if (def.trainer && routeRematchReady(def.trainer)) return void locked(() => routeRematch(def.trainer!, npc));
    if (def.trainer) return void locked(() => sayAll(TRAINERS[def.trainer!].after, TRAINERS[def.trainer!].name));
    if (def.afterStory && flag('ending')) return void locked(() => afterStoryTalk(def));
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
      playJingle('item', { fallback: sfx.confirm });
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
      playJingle('item', { fallback: sfx.sparkle });
      await say(L('Tiens ? Il y a quelque chose ici… Tu trouves {i} !', 'Huh? There’s something here… You found {i}!'), undefined, { i: tr(item(hidden.item).name) });
      if (hidden.item.startsWith('page-')) await runScript('pageFound');
    });
  }
  if (target.obstacle) return void locked(() => clearObstacle(target.obstacle!));
  const fresque = g.map.def.fresques?.find((f) => f.x === target.x && f.y === target.y);
  if (fresque) return void locked(() => examineFresque(fresque));
  if (target.tileId === 'leverred' || target.tileId === 'leverblue') return void locked(toggleBarriers);
  const look = PUZZLE_LOOKS[target.tileId ?? ''];
  if (look) return void locked(() => say(look));
  if (isWater(target.tileId)) return void locked(waterSide);
  if (target.tileId === 'pc') return void runScript('pc');
  if (target.tileId === 'bookshelf') return void locked(() => say(L('Des livres pleins de dessins de Bestioles.', 'Books full of Critter drawings.')));
  if (target.tileId === 'tv') return void locked(() => say(L('À la télé : « Les Bestioles dessinées envahissent le pays ! »', 'On TV: "Drawn Critters are taking over the country!"')));
}

/** How the player looks (older saves are repaired on load, this is only a fallback). */
export const playerLook = () => save.value?.player.look ?? OLD_AVATARS[save.value?.player.avatar ?? 0] ?? OLD_AVATARS[0];

/** Redraws the player's chibi after the look changed (trainer card). */
export function refreshPlayerLook() {
  const p = game?.player;
  if (p) p.sheet = sheetFor(lookOf(playerLook()));
}

// ------------------------------------------------------------------ the Bestiole that follows you

const followerLead = () => save.value?.party.find((m) => !m.egg && m.hp > 0);

/** Keeps the follower in step with the first Bestiole of the party able to walk. */
export function refreshFollower() {
  const g = game;
  if (!g?.player) return;
  const lead = followerLead();
  if (!prefs.value.follower || !lead) {
    g.follower = null;
    return;
  }
  const img = miniFor(lead.species, lead.shiny);
  if (g.follower?.img === img) return;
  const p = g.player;
  const had = g.follower;
  const look = { img, faces: creature(lead.species).faces, shiny: !!lead.shiny };
  g.follower = had ? { ...had, ...look } : { x: p.x, y: p.y, fromX: p.x, fromY: p.y, t: 0, ms: 200, moving: false, dir: p.dir, ...look };
  if (!had) g.placeFollower();
}

/** Things the follower might find on a walk (once a day). */
const FOLLOWER_FINDS = ['baie-bleue', 'baie-cerise', 'potion', 'crayon-ball', 'baie-menthe', 'baie-doree'];

async function talkFollower() {
  const lead = followerLead();
  if (!lead) return;
  sfx.cry(lead.species);
  const vars = { n: monLabel(lead) };
  // once a day, it may have found something
  if (save.value!.flags.followerFind !== localDay() && Math.random() < 0.2) {
    const id = FOLLOWER_FINDS[Math.floor(Math.random() * FOLLOWER_FINDS.length)];
    update((d) => {
      addItem(d, id, 1);
      d.flags.followerFind = localDay();
    });
    playJingle('item', { fallback: sfx.confirm });
    return say(L('Oh ? {n} tient quelque chose dans sa bouche… Tu trouves {i} !', 'Oh? {n} is holding something in its mouth… You found {i}!'), undefined, { ...vars, i: tr(item(id).name) });
  }
  const def = getGame().map.def;
  const fr = lead.friendship ?? BASE_FRIENDSHIP;
  const lines: LText[] = lead.hp * 3 < maxHp(lead)
    ? [L('{n} a besoin de repos… Un petit tour à l’Auberge ?', '{n} needs a rest… A quick stop at the Inn?')]
    : fr >= 200
      ? [L('{n} se blottit contre toi, débordant de bonheur.', '{n} snuggles up to you, overflowing with happiness.'), L('{n} danse autour de toi de joie !', '{n} dances around you with joy!'), L('{n} te regarde avec des cœurs plein les yeux.', '{n} looks at you with hearts in its eyes.')]
      : fr >= 120
        ? [L('{n} te sourit.', '{n} smiles at you.'), L('{n} sautille à côté de toi.', '{n} hops along beside you.'), L('{n} renifle l’air avec curiosité.', '{n} sniffs the air curiously.')]
        : [L('{n} te regarde, un peu timide.', '{n} looks at you, a little shy.'), L('{n} te suit en silence.', '{n} follows you quietly.')];
  if (def.backdrop === 'cave' || def.border === 'cavewall') lines.push(L('{n} se serre contre toi : il fait un peu noir ici…', '{n} huddles close to you: it’s a little dark in here…'));
  else if (def.onEnter === 'visitTown') lines.push(L('{n} regarde les maisons avec de grands yeux.', '{n} stares at the houses with big eyes.'));
  else if (!def.indoor) lines.push(L('{n} hume l’odeur de l’herbe et des crayons.', '{n} breathes in the smell of grass and crayons.'));
  await say(lines[Math.floor(Math.random() * lines.length)], undefined, vars);
}

// ------------------------------------------------------------------ puzzles

const PUZZLE_LOOKS: Record<string, LText> = {
  hole: L('Un trou tout noir. On ne voit pas le fond…', 'A pitch-black hole. You can’t see the bottom…'),
  plate: L('Une dalle de pierre avec un dessin de poids. Elle ne bouge pas : tu es trop {g:légère|léger} !', 'A stone plate with a weight drawn on it. It doesn’t budge: you’re too light!'),
  gate: L('Une grille bien fermée. Un mécanisme doit l’ouvrir, quelque part…', 'A gate, shut tight. Some mechanism must open it, somewhere…'),
  redup: L('Des crayons rouges géants plantés dans le sol. Un interrupteur doit les abaisser.', 'Giant red pencils stuck in the ground. A switch must lower them.'),
  blueup: L('Des crayons bleus géants plantés dans le sol. Un interrupteur doit les abaisser.', 'Giant blue pencils stuck in the ground. A switch must lower them.'),
  glossy: L('Du papier glacé, tout lisse et tout brillant. Attention, ça glisse !', 'Glossy paper, all smooth and shiny. Careful, it’s slippery!'),
};

const pushName = (o: ObstacleDef) => (o.kind === 'block' ? L('Le bloc de gomme', 'The eraser block') : L('Le rocher', 'The boulder'));

/** A pushed boulder or block: maybe every plate of a mechanism is covered now. */
function onPush() {
  const g = getGame();
  const done = solvedPuzzles(g.map.def, g.obstacles).filter((f) => !flag(f));
  if (!done.length) return;
  void locked(async () => {
    for (const f of done) setFlag(f);
    await shake(400);
    sfx.sparkle();
    await say(L('Clac ! Un mécanisme s’est déclenché !', 'Clunk! A mechanism was set off!'));
  });
}

/** A boulder or block fell into a pit: the pit is filled, the pushable lands on the floor below. */
function onDrop(o: ObstacleDef, x: number, y: number) {
  const def = getGame().map.def;
  const hole = def.holes?.find((h) => h.x === x && h.y === y);
  update((d) => {
    d.flags[holeFlag(def.id, x, y)] = 1;
    if (o.id) d.flags[`fell:${o.id}`] = 1;
  });
  mapDirty = true;
  void locked(async () => {
    sfx.hit();
    await shake(350);
    const name = tr(pushName(o));
    await say(hole?.to
      ? L('{o} tombe dans le trou… BOUM ! Il a atterri à l’étage du dessous.', '{o} drops into the hole… THUD! It landed on the floor below.')
      : L('{o} bouche le trou. On peut passer dessus !', '{o} fills the hole. You can walk over it now!'), undefined, { o: name });
    // the floor below may have a mechanism waiting for it
    const below = hole?.to && MAPS[hole.to.map];
    if (!below) return;
    const done = solvedPuzzles(below, (below.obstacles ?? []).filter(visibleObstacle)).filter((f) => !flag(f));
    if (!done.length) return;
    for (const f of done) setFlag(f);
    sfx.sparkle();
    await say(L('Quelque part en dessous, un mécanisme s’est déclenché…', 'Somewhere below, a mechanism was set off…'));
  });
}

function canFall(x: number, y: number): boolean {
  return !!getGame().map.def.holes?.some((h) => h.x === x && h.y === y && h.to && h.fall);
}

async function fallTo(to: WarpTarget) {
  const g = getGame();
  // a pit that brings you back to the door of the same room (the ink blots of Atelier Encre)
  const sameRoom = to.map === g.map.def.id;
  sfx.hit();
  await g.fadeTo(1, 260);
  await warpTo(to, { keepFade: true });
  await g.fadeTo(0, 200);
  await shake(250);
  showToast(tr(sameRoom
    ? L('Splatch ! Tu as glissé dans l’encre… et te revoilà à l’entrée.', 'Splosh! You slipped into the ink… and you’re back at the door.')
    : L('Aïe ! Tu es {g:tombée|tombé} à l’étage du dessous.', 'Ouch! You fell to the floor below.')));
}

/** A switch: the red and blue crayon barriers swap (until the next visit). */
async function toggleBarriers() {
  barriersFlipped = !barriersFlipped;
  sfx.blip();
  refreshMap();
  await shake(150);
  await say(barriersFlipped
    ? L('Clac ! Les crayons rouges s’abaissent… et les bleus se dressent !', 'Click! The red pencils drop… and the blue ones spring up!')
    : L('Clac ! Les crayons bleus s’abaissent… et les rouges se dressent !', 'Click! The blue pencils drop… and the red ones spring up!'));
}

/** A fresque: put the pieces of the drawing back to open a secret passage. */
async function examineFresque(f: FresqueDef) {
  const n = tr(creature(f.species).name);
  if (flag(`fresque:${f.id}`)) return say(L('La fresque de {n} est complète. On dirait qu’elle sourit.', 'The fresque of {n} is complete. It seems to be smiling.'), undefined, { n });
  if ((await ask(L('Une fresque peinte sur la paroi… mais les morceaux sont tout mélangés ! Les remettre en place ?', 'A fresque painted on the wall… but the pieces are all mixed up! Put them back in place?'), [L('Oui', 'Yes'), L('Non', 'No')])) !== 0) return;
  let solved = false;
  await openScreen({ id: 'fresque', species: f.species, size: f.size ?? 3, onEnd: (ok) => (solved = ok) });
  if (!solved) return;
  setFlag(`fresque:${f.id}`);
  sfx.sparkle();
  if (f.script && scripts[f.script]) await scripts[f.script]();
  else if (f.reward) {
    const { item: id, count = 1 } = f.reward;
    update((d) => addItem(d, id, count));
    await say(L('C’est {n} ! … Derrière la toile, tu trouves {i}{c} !', 'It’s {n}! … Behind the canvas, you find {i}{c}!'), undefined, { n, i: tr(item(id).name), c: count > 1 ? ` ×${count}` : '' });
  } else {
    await shake(500);
    await say(L('C’est {n} ! … La paroi tremble : un passage secret s’ouvre !', 'It’s {n}! … The wall rumbles: a secret passage opens!'), undefined, { n });
  }
  if (scripts.fresqueDone) await scripts.fresqueDone();
}

// ------------------------------------------------------------------ field tools

const has = (id: string) => !!save.value?.bag[id];

/** A facing obstacle: cut the bush, put the gloves on for the boulder, break the rock. */
async function clearObstacle(o: ObstacleDef) {
  const g = getGame();
  if (o.kind === 'bush') {
    if (!has('ciseaux')) return say(L('Un petit buisson tout touffu bloque le passage. Des ciseaux pourraient le couper…', 'A thin, bushy shrub blocks the way. Scissors could cut it…'));
    if ((await ask(L('Ce petit buisson gêne. Le couper avec les Ciseaux ?', 'This thin bush is in the way. Cut it with the Scissors?'), [L('Oui', 'Yes'), L('Non', 'No')])) !== 0) return;
    sfx.blip();
    g.removeObstacle(o);
    return say(L('Clic-clac ! Le buisson est coupé.', 'Snip-snip! The bush is cut.'));
  }
  if (o.kind === 'rock') {
    if (!has('maillet')) return say(L('Un rocher tout fissuré. Un bon coup de maillet le casserait…', 'A rock full of cracks. A good whack with a mallet would break it…'));
    if ((await ask(L('Ce rocher est fissuré. Le casser avec le Maillet ?', 'This rock is cracked. Break it with the Mallet?'), [L('Oui', 'Yes'), L('Non', 'No')])) !== 0) return;
    await shake(300);
    sfx.hit();
    g.removeObstacle(o);
    return say(L('Bong ! Le rocher tombe en miettes.', 'Bonk! The rock crumbles.'));
  }
  if (o.kind === 'block') return say(L('Un gros bloc de gomme rose. Il a l’air léger : marche dedans pour le pousser !', 'A big pink eraser block. It looks light: walk into it to push it!'));
  if (g.strength) return say(L('Tu as les Gants Costauds : marche dans le rocher pour le pousser !', 'You have the Strong Gloves on: walk into the boulder to push it!'));
  if (!has('gants')) return say(L('Un gros rocher rond. Il est bien trop lourd à pousser…', 'A big round boulder. It’s far too heavy to push…'));
  if ((await ask(L('Un gros rocher rond. Enfiler les Gants Costauds ?', 'A big round boulder. Put on the Strong Gloves?'), [L('Oui', 'Yes'), L('Non', 'No')])) !== 0) return;
  g.strength = true;
  await say(L('Tu enfiles les Gants Costauds. Tu peux pousser les rochers !', 'You put on the Strong Gloves. You can push boulders now!'));
}

/** The best fishing rod in the bag (null without one). */
function bestRod(): 'old' | 'good' | 'super' | null {
  return has('super-canne') ? 'super' : has('bonne-canne') ? 'good' : has('canne-bois') ? 'old' : null;
}

/** Facing water: fish, sail, or just look. */
async function waterSide() {
  const g = getGame();
  const rod = bestRod();
  const canSail = has('bateau') && !g.surfing;
  if (!rod && !canSail) return say(L('L’eau est calme et brille au soleil.', 'The water is calm and sparkles in the sun.'));
  const choices: { label: LText; act: () => Promise<void> }[] = [];
  if (rod) choices.push({ label: L('Pêcher', 'Fish'), act: () => fish(rod) });
  if (canSail) choices.push({ label: L('Naviguer', 'Sail'), act: sail });
  const c = await ask(L('L’eau est calme. Que faire ?', 'The water is calm. What will you do?'), [...choices.map((x) => x.label), L('Rien', 'Nothing')]);
  if (c < choices.length) await choices[c].act();
}

/** On a dark patch of water: with the Bocal-Scaphandre, dive to the depths below (the same spot on the map underneath). */
async function diveDown() {
  const g = getGame();
  if (!has('bocal')) return say(L('L’eau est très sombre ici… On ne voit pas le fond.', 'The water is very dark here… You can’t see the bottom.'));
  const c = await ask(L('Plonger avec le Bocal-Scaphandre ?', 'Dive with the Jar Helmet?'), [L('Oui', 'Yes'), L('Non', 'No')]);
  if (c !== 0) return;
  await say(L('Tu enfiles ton Bocal-Scaphandre… et tu plonges !', 'You put on your Jar Helmet… and dive!'));
  g.biking = false;
  await warpTo({ map: g.map.def.dive!, x: g.player.x, y: g.player.y, facing: 'down' });
  if (!flag('plongee')) {
    setFlag('plongee');
    await say(L('(Pour remonter, appuie sur A dans un rond de lumière.)', '(To come back up, press A in a circle of light.)'));
  }
}

/** In a circle of light under water: back up to the surface, in the boat. */
async function surfaceUp() {
  const g = getGame();
  const c = await ask(L('Remonter à la surface ?', 'Go back up to the surface?'), [L('Oui', 'Yes'), L('Non', 'No')]);
  if (c !== 0) return;
  await warpTo({ map: g.map.def.underwater!, x: g.player.x, y: g.player.y, facing: 'down' }, { sail: true });
}

async function sail() {
  const g = getGame();
  g.biking = false;
  g.surfing = true;
  await say(L('Tu déplies ton Bateau en Papier et tu montes dessus !', 'You unfold your Paper Boat and climb aboard!'));
  await g.walk(g.player, [g.player.dir], 210);
}

async function fish(rod: 'old' | 'good' | 'super') {
  const g = getGame();
  const table = g.map.def.fishing?.[rod];
  sfx.blip();
  await bubble('player', '…', 900 + Math.floor(Math.random() * 900));
  // a bite three times in four, when something lives here
  if (!table?.length || Math.random() > 0.75) return say(L('Rien ne mord…', 'Not even a nibble…'));
  await bubble('player', '!', 500);
  await say(L('Oh ! Ça mord !', 'Oh! A bite!'));
  const st = { rng: newSeed() };
  const e = pickWeighted(st, table, (r) => r.w);
  await wildBattle(e.id, e.min + Math.floor(nextRandom(st) * (e.max - e.min + 1)));
}

/** Gets on or off the Pencil Bike (outdoors only). Returns a reason when it can't. */
export function toggleBike(): LText | null {
  const g = getGame();
  if (!has('velo')) return L('Tu n’as pas de vélo.', 'You don’t have a bike.');
  if (g.map.def.indoor || g.map.def.dungeon) return L('Pas de vélo à l’intérieur !', 'No cycling indoors!');
  if (g.surfing) return L('Pas de vélo sur l’eau !', 'No cycling on water!');
  g.biking = !g.biking;
  sfx.confirm();
  return null;
}

function onDoor(b: MapBuilding) {
  if (b.to && (!b.script || !scripts[b.script])) {
    // shared interiors (Inns, shops) remember which town's door was used
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
    if (!def?.trainer || flag(`tr:${def.trainer}`) || !partyAlive(s()) || repentant(def.trainer, !!flag('ending'))) continue;
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

export async function trainerBattle(id: string, actor?: Actor, look?: Look) {
  const tdef = TRAINERS[id];
  if (!partyAlive(s())) {
    await say(L('Tes Bestioles sont épuisées… Va vite les reposer à l’Auberge !', 'Your Critters are worn out… Go rest them at the Inn!'), tdef.name);
    return;
  }
  if (actor) getGame().faceToward(actor, getGame().player);
  await sayAll(tdef.before, tdef.name);
  const out = await fight('trainer', tdef.name, trainerParty(tdef, newSeed()), { trainer: tdef, look: actor?.npc?.look ?? look, grey: tdef.grey });
  if (out.result === 'win') {
    // everything the win unlocks is saved at once, before any dialog: closing the app during the
    // cut-scene that follows can't block the story (the map itself changes when the scene ends)
    const newBadge = !!tdef.badge && !s().badges.includes(tdef.badge);
    update((d) => {
      d.flags[`tr:${id}`] = 1;
      // route trainers want a rematch from tomorrow on
      d.flags[`re:${id}`] = localDay();
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
      playJingle('badge', { fallback: sfx.victory });
      await say(L('{name} reçoit le {b} de {l} !', '{name} received the {b} from {l}!'), undefined, { b: tr(badgeDef(tdef.badge)?.name ?? L('Badge', 'Badge')), l: tr(badgeDef(tdef.badge)?.leader ?? tdef.name) });
      // like FireRed, the leader adds a move to teach: a stencil
      const stencil = badgeDef(tdef.badge)?.stencil;
      if (stencil && !s().bag[stencil]) {
        const first = !Object.keys(s().bag).some((k) => ITEM_BY_ID[k]?.kind === 'stencil');
        giveItem(stencil);
        sfx.confirm();
        await say(L('{l} te donne {i} !', '{l} gave you {i}!'), undefined, { l: tr(badgeDef(tdef.badge)?.leader ?? tdef.name), i: tr(item(stencil).name) });
        if (first) await say(L('Un pochoir apprend sa capacité à une Bestiole compatible, autant de fois que tu veux ! Regarde dans ton Sac, poche POCHOIRS.', 'A stencil teaches its move to a compatible Critter, as many times as you like! Look in your Bag, STENCILS pocket.'), tdef.name);
      }
      // leaders explain what comes next after giving the badge
      await sayAll(tdef.after.slice(1), tdef.name);
    }
    if (tdef.afterScript && scripts[tdef.afterScript]) await scripts[tdef.afterScript]();
  }
}

/**
 * Route and cave trainers already beaten want a rematch once a day (not Atelier trainers, Team
 * Gomme or story fights), with a team that keeps up with the player's badges but stays at or under the
 * player's own level (`rematchParty`).
 */
export function routeRematchReady(id: string): boolean {
  const t = TRAINERS[id];
  const map = game?.map?.def.id ?? '';
  if (!t || t.badge || t.grey || t.storyFlag || t.afterScript || !flag(`tr:${id}`)) return false;
  if (map.startsWith('atelier') || map === 'concours') return false;
  return s().flags[`re:${id}`] !== localDay();
}

async function routeRematch(id: string, actor: Actor) {
  const t = TRAINERS[id];
  const c = await ask(L('Hé ! J’ai entraîné mes Bestioles depuis la dernière fois. Une revanche ?', 'Hey! I’ve been training my Critters since last time. A rematch?'), [L('Oui', 'Yes'), L('Non', 'No')], t.name);
  if (c !== 0) return;
  if (!partyAlive(s())) {
    await say(L('Tes Bestioles sont épuisées… Va d’abord les soigner !', 'Your Critters are worn out… Heal them first!'), t.name);
    return;
  }
  // they keep up with your badges, but never outgrow your team (Hard's extra levels included)
  const level = teamLevel(s().party);
  const strong: TrainerDef = { ...t, id: `${id}:re`, money: Math.round(t.money * 1.5), party: rematchParty(t, s().badges.length + (flag('ending') ? 1 : 0), level) };
  const out = await fight('trainer', t.name, partyOf(strong.party, newSeed(), prefs.value.difficulty, level), { trainer: strong, look: actor.npc?.look });
  if (out.result !== 'win') return;
  update((d) => (d.flags[`re:${id}`] = localDay()));
  actor.bubble = undefined;
  await say(L('Tu progresses vite ! On remet ça demain ?', 'You’re improving fast! Same time tomorrow?'), t.name);
}

/** A ♪ over the route trainers who want a rematch today. */
function markRematches() {
  for (const a of game?.npcs ?? []) if (a.npc?.trainer && routeRematchReady(a.npc.trainer)) a.bubble = '♪';
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
  const party = tdef.party.map((m) => ({ ...m, level: Math.min(MAX_LEVEL, m.level + 12) }));
  const strong: TrainerDef = { ...tdef, id: `${id}:rematch`, badge: undefined, afterScript: undefined, money: tdef.money * 2, party };
  const out = await fight('trainer', tdef.name, trainerParty(strong, newSeed()), { trainer: strong, look: actor.npc?.look });
  if (out.result === 'win') {
    // remembered for the Town Map's list of things left to do
    setFlag(`rematch:${id}`);
    const colours = !flag('couleurs:bord') && rematchesWon(s().flags) >= BORD_REMATCHES;
    if (colours) setFlag('couleurs:bord');
    await say(L('Incroyable… Tu dessines de mieux en mieux !', 'Incredible… You draw better and better!'), tdef.name);
    if (colours) showToast(tr(L('Les couleurs gagnent le Bord de la Page…', 'Colours are spreading to the Edge of the Page…')));
  }
}

/** Gives a present once (its flag is set first), with a line from the giver. */
async function giftOnce(flagName: string, gift: { item: string; n?: number }, line: LText, speaker?: LText) {
  if (flag(flagName)) return;
  const n = gift.n ?? 1;
  setFlag(flagName);
  giveItem(gift.item, n);
  await say(line, speaker);
  playJingle('item', { fallback: sfx.confirm });
  await say(L('{name} reçoit {i}{n} !', '{name} received {i}{n}!'), undefined, { i: tr(item(gift.item).name), n: n > 1 ? ` ×${n}` : '' });
}

/** After the story: an old grunt of Team Gomme talks, and a few give back an eraser. */
async function repentTalk(id: string) {
  const who = id.startsWith('rature') || id.startsWith('buvard') || id.startsWith('blanche') ? TRAINERS[id].name : L('Ancien sbire', 'Former grunt');
  await sayAll(repentLine(id), who);
  if (REPENT_GIFTS[id]) await giftOnce(`cadeau:${id}`, REPENT_GIFTS[id], REPENT_GIFT_LINE, who);
}

/** A resident's lines once the story is over, and their present the first time. */
async function afterStoryTalk(def: NpcDef) {
  const a = def.afterStory!;
  await sayAll(a.text);
  if (a.gift) await giftOnce(`cadeau:${def.id}`, a.gift, a.gift.text);
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
  music?: TrackId;
  /**
   * Fights with these copies instead of the party (Tour des Défis): nothing comes back to the save,
   * no bag, no prize money and no blackout.
   */
  borrowed?: Mon[];
  /** A vision: Crayon-balls go right through it. */
  noCatch?: boolean;
}

/** Runs a battle from the world and applies its outcome to the save. */
export async function fight(kind: BattleKind, enemyName: LText, enemy: Mon[], opts: FightOptions = {}): Promise<{ result: BattleResult; state: BattleState }> {
  const d = s();
  // pocket money from the real house adds to the prize
  const money = opts.trainer ? Math.round(opts.trainer.money * (opts.borrowed ? 1 : moneyBoost(d.flags))) : 0;
  // met before this battle: their weak spots get marked on the moves (Easy and Normal)
  const met = [...d.dex.seen];
  update((x) => enemy.forEach((m) => see(x, m.species)));
  calm(odds);
  const g = getGame();
  await g.wipeTo(1, kind === 'wild' ? 480 : 620, opts.grey ? 'eraser' : 'pencil');
  let caught: string | null = null;
  const res = await new Promise<{ result: BattleResult; state: BattleState }>((resolve) => {
    go({
      id: 'battle',
      props: {
        setup: {
          kind, seed: newSeed(), night: dayPhase() === 'night', noCatch: opts.noCatch,
          ...(opts.borrowed ? {} : { boosts: { catch: catchBoost(d.flags) * DIFFICULTY[prefs.value.difficulty].catch, xp: xpBoost(d.flags) } }),
          // eggs stay out of battles
          player: { name: L(d.player.name, d.player.name), party: opts.borrowed ?? d.party.filter((m) => !m.egg), isAI: false, fairCopy: d.bag['feutre-or'] ? 'light' : undefined },
          enemy: { name: enemyName, party: enemy, isAI: true, fairCopy: opts.trainer?.fairCopy === 'dark' ? 'dark' : opts.trainer?.fairCopy ? 'light' : undefined },
        },
        bag: opts.borrowed ? {} : d.bag,
        onUseItem: (id) => update((x) => void takeItem(x, id)),
        backdrop: opts.backdrop ?? getGame().map.def.backdrop ?? 'grass',
        tutorial: opts.tutorial,
        playerLook: playerLook(),
        fought: met,
        music: opts.music ?? (opts.trainer?.id === 'effaceur' ? 'final' : opts.trainer?.badge || opts.trainer?.id.endsWith(':rematch') ? 'leader' : opts.grey ? 'gommeBattle' : kind === 'trainer' ? 'trainer' : 'wild'),
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
    x.stats.battles++;
    // fair copies seen, for the Bestiodex
    for (const side of res.state.sides) for (const m of side.party) if (m.fair) x.flags[`fair:${m.species}`] = 1;
    if (opts.borrowed) return;
    // a fair copy lasts for the battle only
    const fought = new Map(res.state.sides[0].party.map(({ fair: _fair, ...m }) => [m.uid, m]));
    x.party = x.party.map((m) => (fought.has(m.uid) ? { ...fought.get(m.uid)! } : m));
    if (res.result === 'win') x.money += money;
    if (res.result === 'capture') {
      const wild = res.state.sides[1].party[res.state.sides[1].active];
      wild.sleepTurns = wild.status === 'sleep' ? wild.sleepTurns : 0;
      caught = wild.uid;
      const where = addMon(x, { ...wild }, 'caught', g.map.def.id);
      x.stats.captures++;
      if (where === 'box') showToast(tr(L('{n} est envoyé dans le PC.', '{n} was sent to the PC.'), { n: monLabel(wild) }));
    }
  });
  go({ id: 'overworld' });
  g.wipe = 0;
  g.fade = 1;
  void g.fadeTo(0, 320, 'black');
  await wait(250);
  if (caught) await offerNickname(caught);
  await checkEvolutions();
  if (res.result === 'lose' && !opts.friendly && !opts.borrowed) await blackout();
  if (opts.friendly) update((x) => healParty(x));
  return res;
}

/** A picture shown first: it stays `hold` ms, then fades into the next one over `fade` ms. */
export interface PictureStep { src: string; hold: number; fade: number }

/** A picture shown big over the world with its caption (the museum's frames). */
export const pictureOverlay = signal<{ src: string; caption: string; before?: PictureStep[]; resolve: () => void } | null>(null);

/** Shows a picture; `before`: pictures fading one into the next before it, the caption coming last. */
export function showPicture(src: string, caption: string, before?: PictureStep[]): Promise<void> {
  return new Promise((resolve) => (pictureOverlay.value = { src, caption, before, resolve }));
}

/** Evolution scene shown over the world (or null). */
/** An egg hatching, drawn over the world. */
export const hatchOverlay = signal<{ mon: Mon; resolve: () => void } | null>(null);
export const evoOverlay = signal<{ mon: Mon; to: string; resolve: (evolved: boolean) => void } | null>(null);

export async function checkEvolutions() {
  for (let i = 0; i < s().party.length; i++) {
    const m = s().party[i];
    const into = evolutionOf(m);
    // stopped with B: asked again at the next level
    if (!into || s().flags[`noevo:${m.uid}`] === m.level) continue;
    const evolved = await new Promise<boolean>((resolve) => (evoOverlay.value = { mon: m, to: into, resolve }));
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
    // the new form learns its evolution moves and its moves of the current level right away
    for (const id of evolutionMoves(into, s().party[i].level)) {
      if (!s().party[i].moves.some((mv) => mv.id === id)) await teachMove(i, id);
    }
  }
}

/** The moves page of a Bestiole learning a fifth move, shown over the world (as in battle and in the bag). */
export const learnOverlay = signal<{ mon: Mon; move: string; resolve: (forget: number | null) => void } | null>(null);

/**
 * Teaches a move to the party creature `i`. When it knows four, it asks whether to forget one, then shows its moves
 * page with the new one as a fifth row, each with its type, power, accuracy and description, to pick which to forget.
 */
export async function teachMove(i: number, id: string) {
  const m = s().party[i];
  const vars = { n: monLabel(m), m: tr(move(id).name) };
  if (m.moves.length < 4) {
    update((x) => learnMove(x.party[i], x.party[i].moves.length, id));
    sfx.levelUp();
    await say(L('{n} apprend {m} !', '{n} learned {m}!'), undefined, vars);
    return;
  }
  const yes = await ask(L('{n} veut apprendre {m}, mais connaît déjà 4 capacités. En oublier une ?', '{n} wants to learn {m}, but already knows 4 moves. Forget one?'),
    [L('Oui', 'Yes'), L('Non', 'No')], undefined, vars);
  const c = yes === 0 ? await new Promise<number | null>((resolve) => (learnOverlay.value = { mon: m, move: id, resolve })) : null;
  learnOverlay.value = null;
  if (c === null) {
    await say(L('{n} n’a pas appris {m}.', '{n} did not learn {m}.'), undefined, vars);
    return;
  }
  const old = tr(move(m.moves[c].id).name);
  update((x) => learnMove(x.party[i], c, id));
  await say(L('{n} oublie {o} et apprend {m} !', '{n} forgot {o} and learned {m}!'), undefined, { ...vars, o: old });
}

async function blackout() {
  const d = s();
  const lost = blackoutLoss(d);
  await say(L('Tu n’as plus de Bestiole en forme… Tu perds {n} ₽ et tu cours te reposer.', 'You have no more Critters that can fight… You drop ₽{n} and hurry back to rest.'), undefined, { n: lost });
  update((x) => {
    x.money -= lost;
    healParty(x);
  });
  if (save.value) save.value.player.returnTo = d.respawn.returnTo;
  await warpTo({ map: d.respawn.map, x: d.respawn.x, y: d.respawn.y, facing: 'down' });
}

/** A wild battle (random encounters, fishing, or a Bestiole waiting somewhere); returns how it ended. */
export async function wildBattle(species: string, level: number, opts: { music?: TrackId; noCatch?: boolean } = {}): Promise<BattleResult | null> {
  if (!s().party.length) return null;
  sfx.encounter();
  const g = getGame();
  // two white flashes, then the pencil scribbles over the screen
  for (let i = 0; i < 2; i++) {
    await g.fadeTo(0.8, 90, 'white');
    await g.fadeTo(0, 90);
  }
  const wild = createMon(species, level, { rng: newSeed() });
  // daydreaming at the real window makes sparkly ones a little less rare
  const extra = (shinyChance(s().flags) - SHINY_CHANCE) / (1 - SHINY_CHANCE);
  if (!wild.shiny && extra > 0 && Math.random() < extra) wild.shiny = true;
  // like the GBA games, some wild creatures carry an item (kept when caught)
  const held = creature(species).wildItem;
  if (held && Math.random() * 100 < held.pct) wild.item = held.id;
  return (await fight('wild', creature(species).name, [wild], { music: opts.music, noCatch: opts.noCatch })).result;
}

// ------------------------------------------------------------------ helpers for scripts

/** Quick white (or black) flash of the screen. */
export async function flash(color: 'white' | 'black' = 'white', ms = 140) {
  const g = getGame();
  await g.fadeTo(0.9, ms / 2, color);
  await g.fadeTo(0, ms);
}

/** Back to the current map's tune (after a scene with its own music). */
export function mapMusic() {
  const g = getGame();
  if (g.map) playMusic(trackForMap(g.map.def, save.value?.player.returnTo));
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
/** Why a field item can't be used right now (null when it can). */
export function fieldItemProblem(id: string): LText | null {
  const def = ITEM_BY_ID[id];
  if (def?.field === 'escape' && !getGame().map?.def.dungeon) return L('Le Fil d’Ariane ne sert que dans les grottes, les tours et les repaires.', 'The Ariadne Thread only works in caves, towers and hideouts.');
  if (def?.field === 'repel' && (save.value?.repel ?? 0) > 0) return L('Un Spray fait encore effet.', 'A Shoo Spray is still working.');
  return null;
}

/** Uses a field item from the bag: back to the map, then its effect. */
export async function useFieldItem(id: string) {
  const def = ITEM_BY_ID[id];
  if (!def?.field || fieldItemProblem(id)) return;
  update((x) => void takeItem(x, id));
  backToWorld();
  await locked(async () => {
    await wait(200);
    if (def.field === 'repel') {
      update((x) => void (x.repel = def.amount));
      playJingle('heal', { fallback: sfx.heal });
      await say(L('Pschitt ! Les Bestioles sauvages plus faibles t’éviteront pendant {n} pas.', 'Pssht! Weaker wild Critters will stay away for {n} steps.'), undefined, { n: def.amount });
    } else {
      await say(L('Tu suis le Fil d’Ariane jusqu’à la dernière Auberge…', 'You follow the Ariadne Thread back to the last Inn…'));
      const d = s();
      if (save.value) save.value.player.returnTo = d.respawn.returnTo;
      await warpTo({ map: d.respawn.map, x: d.respawn.x, y: d.respawn.y, facing: 'down' });
    }
  });
}

/**
 * A Magic Lollipop from the bag: party creature `i` grows a level, learns that level's moves (asking which
 * to forget when it knows four) and evolves if it's time; then another one, if the player wants.
 */
export async function useLollipop(i: number) {
  const LOLLIPOP = 'sucette-magique';
  backToWorld();
  await locked(async () => {
    await wait(200);
    for (;;) {
      const m = s().party[i];
      if (!m || m.egg || m.level >= MAX_LEVEL || !(s().bag[LOLLIPOP] > 0)) return;
      let ups: LevelUp[] = [];
      update((x) => {
        takeItem(x, LOLLIPOP);
        ups = growLevel(x.party[i]);
      });
      sfx.levelUp();
      const vars = { n: monLabel(s().party[i]) };
      await say(L('Crounch ! {n} monte au niveau {l} !', 'Crunch! {n} grew to level {l}!'), undefined, { ...vars, l: s().party[i].level });
      for (const id of ups.flatMap((u) => u.learned)) await say(L('{n} apprend {m} !', '{n} learned {m}!'), undefined, { ...vars, m: tr(move(id).name) });
      for (const id of ups.flatMap((u) => u.pending)) await teachMove(i, id);
      await checkEvolutions();
      const left = s().bag[LOLLIPOP] ?? 0;
      if (!left || s().party[i].level >= MAX_LEVEL) return;
      const again = await ask(L('Encore une Sucette Magique ? (Il t’en reste {k}.)', 'Another Magic Lollipop? ({k} left.)'), [L('Oui', 'Yes'), L('Non', 'No')], undefined, { k: left });
      if (again !== 0) return;
    }
  });
}

export function backToWorld() {
  go({ id: 'overworld' });
  const r = returnResolver;
  returnResolver = null;
  r?.();
}

export { ask, say, sayAll };

// story scripts register themselves here (see src/story/scripts.ts)
export const scripts: Record<string, () => Promise<void>> = {};

/** Gives a new creature (party first, then PC), noting where it was received. */
export function giveMon(species: string, level: number, how: MetHow = 'gift'): Mon {
  const m = createMon(species, level, { rng: newSeed() });
  update((x) => void addMon(x, m, how, placeHere(x)));
  return m;
}

/** The place to remember for an event here: the town outside when inside a shared interior. */
function placeHere(x: SaveData): string {
  return MAPS[x.player.map]?.generic ? x.player.returnTo?.map ?? x.player.map : x.player.map;
}

/** An egg in the party hatches: a little scene, then the Bestiole joins (and can get a nickname). */
async function hatch(uid: string) {
  const egg = save.value?.party.find((p) => p.uid === uid);
  if (!egg) return;
  await new Promise<void>((resolve) => (hatchOverlay.value = { mon: egg, resolve }));
  hatchOverlay.value = null;
  update((x) => {
    const m = x.party.find((p) => p.uid === uid);
    if (!m) return;
    delete m.egg;
    m.met = { level: m.level, map: placeHere(x), how: 'egg' };
    see(x, m.species);
    if (!x.dex.caught.includes(m.species)) x.dex.caught.push(m.species);
  });
  await offerNickname(uid);
}

/** « Donner un surnom ? », then the nickname entry. `askFirst: false` goes straight to the entry. */
export async function offerNickname(uid: string, askFirst = true) {
  const m = save.value && allMons(save.value).find((x) => x.uid === uid);
  if (!m) return;
  if (askFirst) {
    const c = await ask(L('Donner un surnom à {n} ?', 'Give a nickname to {n}?'), [L('Oui', 'Yes'), L('Non', 'No')], undefined, { n: tr(creature(m.species).name) });
    if (c !== 0) return;
  }
  const name = await new Promise<string | null>((resolve) => (nameOverlay.value = { mon: m, resolve }));
  nameOverlay.value = null;
  update((x) => {
    const t = allMons(x).find((y) => y.uid === uid);
    if (!t) return;
    if (name) t.nickname = name;
    else delete t.nickname;
  });
}

export function giveItem(id: string, n = 1) {
  update((x) => addItem(x, id, n));
}

if (import.meta.env.DEV && typeof window !== 'undefined') {
  // debugging handle for playtesting from the console
  (window as unknown as Record<string, unknown>).__ab = { getGame, save, update, warpTo, runScript, scripts, flag, setFlag, dialog, closeDialog, monOverlay, evoOverlay, learnOverlay, hatchOverlay, nameOverlay, pictureOverlay, offerNickname, teachMove, useFieldItem, toggleBike, screen, fight, createMon, checkEvolutions, refreshMap, trainerBattle };
}
