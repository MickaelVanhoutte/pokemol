import { signal } from '@preact/signals';
import { L, t, tr, type LText } from '../i18n';
import { MAPS } from '../data/maps';
import { TRAINERS, type TrainerDef } from '../data/trainers';
import { creature } from '../data/creatures';
import { newSeed, nextRandom, pickWeighted } from '../engine/rng';
import type { BattleKind, BattleResult, BattleState, SideSetup, TeamMember } from '../engine/battle/types';
import {
  addCreature, applyBattleOutcome, evolve, healTeam, pendingEvolutions, persist, save, teamAlive, teamMembers, update,
} from '../state/game';
import { go, screen, type Screen } from '../state/router';
import type { SaveData } from '../save/schema';
import { ask, closeDialog, dialog, say, sayAll } from './dialog';
import { DIRS, Game, type Actor } from './game';
import type { MapBuilding, NpcDef, WarpTarget } from './mapTypes';
import { AVATARS } from './sprites';
import { tile } from './tiles';
import { sfx } from '../audio/sfx';

let game: Game | null = null;
let stepsSinceSave = 0;

/** Card shown full-screen over the world (starter pick, evolutions, gifts). */
export const cardOverlay = signal<{ ids: string[]; title?: string; pick: boolean; resolve: (i: number) => void } | null>(null);
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

/** Builds the world from the save and shows it. */
export function enterWorld() {
  const g = getGame();
  const d = s();
  g.setPlayer(AVATARS[d.player.avatar] ?? AVATARS[0], d.player.x, d.player.y, d.player.facing);
  g.setMap(MAPS[d.player.map] ?? MAPS.maison, visibleNpc);
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
  g.setMap(MAPS[to.map], visibleNpc);
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
    void runScript2(() => trainerApproach(spotter));
    return true;
  }
  const enc = g.map.def.encounters;
  if (enc && tile(g.map.tiles[y * g.map.w + x]).encounter && teamAlive(s()) && Math.random() < enc.rate) {
    const st = { rng: newSeed() };
    const e = pickWeighted(st, enc.table, (r) => r.w);
    const level = e.min + Math.floor(nextRandom(st) * (e.max - e.min + 1));
    void runScript2(() => wildBattle(e.id, level));
    return true;
  }
  return false;
}

async function runScript2(fn: () => Promise<void>) {
  const g = getGame();
  g.lock++;
  try {
    await fn();
  } finally {
    g.lock--;
    g.input.clear();
  }
}

function onInteract(target: { npc?: Actor; sign?: { text: LText }; tileId?: string; x: number; y: number }) {
  const g = getGame();
  if (target.npc) {
    const npc = target.npc;
    if (npc.npc) g.faceToward(npc, g.player);
    const def = npc.npc;
    if (!def) return;
    if (def.trainer && !flag(`tr:${def.trainer}`)) return void runScript2(() => trainerBattle(def.trainer!, npc));
    if (def.trainer) return void runScript2(() => sayAll(TRAINERS[def.trainer!].after, TRAINERS[def.trainer!].name));
    if (def.script && scripts[def.script]) return void runScript(def.script);
    if (def.text) return void runScript2(() => sayAll(def.text!));
    return;
  }
  if (target.sign) return void runScript2(() => say(target.sign!.text));
  const map = g.map.def.id;
  if (target.tileId === 'pc') return void runScript('pc');
  if (target.tileId === 'machine' && map === 'invocations') return void runScript('gacha');
  if (target.tileId === 'table' && map === 'labo') return void runScript('labTable');
  if (target.tileId === 'bookshelf') return void runScript2(() => say(L('Des livres pleins de dessins de Bestioles.', 'Books full of Critter drawings.')));
  if (target.tileId === 'tv') return void runScript2(() => say(L('À la télé : « Les Bestioles dessinées envahissent le pays ! »', 'On TV: "Drawn Critters are taking over the country!"')));
}

function onDoor(b: MapBuilding) {
  if (b.to) return void warpTo(b.to);
  void runScript2(async () => {
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
    if (!def?.trainer || flag(`tr:${def.trainer}`) || !teamAlive(s())) continue;
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
  while (Math.abs(g.player.x - (n.x + dx)) + Math.abs(g.player.y - (n.y + dy)) > 0 && !(n.x + dx === g.player.x && n.y + dy === g.player.y)) {
    if (!g.tryMove(n, dir)) break;
    await new Promise<void>((r) => (n.resolveMove = r));
  }
  g.faceToward(g.player, n);
  await trainerBattle(n.npc!.trainer!, n);
}

export async function trainerBattle(id: string, actor?: Actor) {
  const tdef = TRAINERS[id];
  if (!teamAlive(s())) {
    await say(L('Tes Bestioles sont épuisées… Va vite les soigner au Centre de soin !', 'Your Critters are worn out… Go heal them at the Healing Center!'), tdef.name);
    return;
  }
  if (actor) getGame().faceToward(actor, getGame().player);
  await sayAll(tdef.before, tdef.name);
  const out = await fight(trainerSetup(tdef), { trainer: tdef });
  if (out.result === 'win') {
    setFlag(`tr:${id}`);
    await sayAll(tdef.after, tdef.name);
  }
}

function trainerSetup(tdef: TrainerDef): { kind: BattleKind; enemy: SideSetup } {
  return { kind: 'trainer', enemy: { name: tdef.name, team: tdef.team, deck: tdef.deck, isAI: true } };
}

// ------------------------------------------------------------------ battles

export function playerSide(d: SaveData): SideSetup {
  return { name: L(d.player.name, d.player.name), team: teamMembers(d), deck: d.deck, isAI: false };
}

export interface FightOptions {
  trainer?: TrainerDef;
  /** First lab battle: losing is fine, no blackout, no healing needed. */
  friendly?: boolean;
  backdrop?: 'grass' | 'cave' | 'tower' | 'lab' | 'forest';
  team?: TeamMember[];
  tutorial?: boolean;
}

export function avgLevel(team: TeamMember[]) {
  return team.reduce((n, m) => n + m.level, 0) / Math.max(1, team.length);
}

/** Runs a battle from the world and applies its outcome to the save. */
export async function fight(setup: { kind: BattleKind; enemy: SideSetup }, opts: FightOptions = {}): Promise<{ result: BattleResult; state: BattleState }> {
  const d = s();
  const lvl = avgLevel(setup.enemy.team);
  const xpEach = setup.kind === 'wild' ? 8 + 4 * lvl : 15 + 6 * lvl;
  const coins = opts.trainer ? opts.trainer.coins : setup.kind === 'wild' ? Math.round(6 * lvl) : 0;
  const glitter = opts.trainer?.glitter ?? (setup.kind === 'wild' ? 2 : 0);
  const back = screen.value;
  const res = await new Promise<{ result: BattleResult; state: BattleState }>((resolve) => {
    go({
      id: 'battle',
      props: {
        setup: { kind: setup.kind, seed: newSeed(), player: { ...playerSide(d), team: opts.team ?? teamMembers(d) }, enemy: setup.enemy },
        blankCards: setup.kind === 'wild' ? d.items.blank : 0,
        onUseBlank: () => update((x) => (x.items.blank = Math.max(0, x.items.blank - 1))),
        backdrop: opts.backdrop ?? getGame().map.def.backdrop ?? 'grass',
        tutorial: opts.tutorial,
        rewardLines: (result) =>
          result === 'win' || result === 'capture'
            ? [
                coins ? t('battle.reward.coins', { n: coins }) : '',
                glitter ? t('battle.reward.glitter', { n: glitter }) : '',
                t('battle.xp', { n: Math.round(xpEach) }),
              ].filter(Boolean)
            : [],
        onEnd: (result, state) => resolve({ result, state }),
      },
    });
  });
  let ups: { defId: string; gained: number }[] = [];
  update((x) => {
    const won = res.result === 'win' || res.result === 'capture';
    ups = applyBattleOutcome(x, res.state, won ? Math.round(xpEach) : 0);
    if (won) {
      x.coins += coins;
      x.glitter += glitter;
      x.stats.wins++;
    }
    if (res.result === 'capture') {
      const wild = res.state.sides[1].fighters[0];
      addCreature(x, wild.defId, wild.level);
      x.stats.captures++;
    }
    if (setup.kind === 'wild') for (const f of setup.enemy.team) if (!x.seen.includes(f.defId)) x.seen.push(f.defId);
  });
  go(back.id === 'battle' ? { id: 'overworld' } : back);
  await wait(250);
  for (const u of ups) {
    const lvl2 = s().collection[u.defId]?.level;
    if (lvl2) {
      sfx.levelUp();
      await say(t('battle.levelUp', { name: tr(creature(u.defId).name), n: lvl2 }));
    }
  }
  await checkEvolutions();
  if (res.result === 'lose' && !opts.friendly) await blackout();
  if (opts.friendly) update((x) => healTeam(x));
  return res;
}

export async function checkEvolutions() {
  for (const e of pendingEvolutions(s())) {
    await say(L('Quoi ? {name} évolue !', 'What? {name} is evolving!'), undefined, { name: tr(creature(e.from).name) });
    update((x) => evolve(x, e.from, e.to));
    await showCards([e.to], tr(L('{name} est devenu {to} !', '{name} became {to}!'), { name: tr(creature(e.from).name), to: tr(creature(e.to).name) }));
  }
}

async function blackout() {
  const d = s();
  const lost = Math.floor(d.coins / 2);
  await say(L('Toutes tes Bestioles sont épuisées… Tu perds {n} pièces et tu cours te reposer.', 'All your Critters are worn out… You drop {n} coins and hurry back to rest.'), undefined, { n: lost });
  update((x) => {
    x.coins -= lost;
    healTeam(x);
  });
  await warpTo({ map: d.respawn.map, x: d.respawn.x, y: d.respawn.y, facing: 'down' });
}

async function wildBattle(defId: string, level: number) {
  if (!s().team.length) return;
  sfx.encounter();
  const g = getGame();
  await g.fadeTo(0.85, 120);
  await g.fadeTo(0, 120);
  await g.fadeTo(0.85, 120);
  g.fade = 0;
  await fight({ kind: 'wild', enemy: { name: creature(defId).name, team: [{ defId, level }], deck: [], isAI: true } });
}

// ------------------------------------------------------------------ helpers for scripts

export const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Shows creature cards full screen; with `pick`, the player chooses one and its index is returned. */
export function showCards(ids: string[], title?: string, pick = false): Promise<number> {
  return new Promise((resolve) => (cardOverlay.value = { ids, title, pick, resolve }));
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

export function giveCreature(defId: string, level = 1) {
  let r: ReturnType<typeof addCreature> | null = null;
  update((x) => (r = addCreature(x, defId, level)));
  return r!;
}

if (import.meta.env.DEV && typeof window !== 'undefined') {
  // debugging handle for playtesting from the console
  (window as unknown as Record<string, unknown>).__ab = { getGame, save, update, warpTo, runScript, scripts, flag, setFlag, dialog, closeDialog, cardOverlay, screen };
}
