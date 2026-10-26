import { effect, signal } from '@preact/signals';
import { gender, locale, setGlobalVars } from '../i18n';
import { BASE_FRIENDSHIP, healMon, noStats, type MetHow, type Mon } from '../engine/pk/creature';
import { natureFromUid } from '../data/natures';
import { talentFromUid } from '../data/talents';
import { BOX_COUNT, BOX_SIZE, PARTY_MAX, SAVE_VERSION, type SaveData } from '../save/schema';
import { BADGES } from '../data/badges';
import { TRAINERS } from '../data/trainers';
import { prefs } from './prefs';

const KEY = 'atelier-bestioles.save';

export const save = signal<SaveData | null>(null);
/** A save from an older version of the game was found (it can't be loaded). */
export const outdatedSave = signal(false);

// texts use {name} and agree with the player's gender
effect(() => {
  const d = save.value;
  if (!d) return;
  setGlobalVars({ name: d.player.name, rival: d.rivalName || (locale.value === 'fr' ? 'Feutre' : 'Marker') });
  gender.value = d.player.gender;
});

function readRaw(): unknown {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/** Upgrades an older save, or returns null if it can't be used. */
export function migrate(raw: unknown): SaveData | null {
  if (!raw || typeof raw !== 'object') return null;
  const v = (raw as { version?: number }).version;
  const s = v === 2 ? migrateV2(raw as V2Save) : v === 3 || v === 4 || v === SAVE_VERSION ? (raw as SaveData) : null;
  if (!s) return null;
  s.version = SAVE_VERSION;
  return repair(s);
}

/**
 * Fills what newer versions added (v4: effort points, held items, leaders' stencils, Town Map) and
 * unsticks stories cut short by older versions, so an old save plays like a new one. Safe to run
 * on every load.
 */
export function repair(s: SaveData): SaveData {
  // v5: several PC boxes instead of one
  const legacy = (s as SaveData & { box?: Mon[] }).box;
  s.boxes ??= [];
  while (s.boxes.length < BOX_COUNT) s.boxes.push([]);
  if (legacy) {
    for (const m of legacy) storeInBox(s, m);
    delete (s as SaveData & { box?: Mon[] }).box;
  }
  s.party.forEach(repairMon);
  s.boxes.forEach((b) => b.forEach(repairMon));
  s.daycare?.slots.forEach((x) => repairMon(x.mon));
  // older versions saved a win before what it unlocks: closing the app during the cut-scene left
  // the road blocked (a grunt in the woods, Zélie never freed…) or the badge missing
  for (const t of Object.values(TRAINERS)) {
    if (!s.flags[`tr:${t.id}`]) continue;
    if (t.storyFlag) s.flags[t.storyFlag] ??= 1;
    if (t.badge && !s.badges.includes(t.badge)) {
      s.badges.push(t.badge);
      s.flags[`badge:${t.badge}`] = 1;
      s.badges.sort((a, b) => BADGES.findIndex((x) => x.id === a) - BADGES.findIndex((x) => x.id === b));
    }
  }
  // the starter was given but the app closed during the lab battle
  if (s.party.length && !s.flags.rival1) Object.assign(s.flags, { intro: 1, rival1: 1, dex: 1 });
  // Mom now hands out the Town Map at the start
  if (s.flags.intro && !s.bag.carte) s.bag.carte = 1;
  // and the running shoes when you leave town: players already past it get them directly
  if (s.flags.rival1 && !s.flags.shoes && !['bourg', 'labo', 'maison', 'maisonRival'].includes(s.player.map)) {
    s.bag.baskets = 1;
    s.flags.shoes = 1;
  }
  // stencils the Atelier Masters now give with their badge
  for (const b of BADGES) if (b.stencil && s.badges.includes(b.id) && !s.bag[b.stencil]) s.bag[b.stencil] = 1;
  return s;
}

function repairMon(m: Mon) {
  m.evs ??= noStats();
  m.item ??= null;
  // natures came later: older Bestioles get a fixed one from their id
  m.nature ??= natureFromUid(m.uid);
  // and talents too (1 in 4 hidden)
  m.talent ??= talentFromUid(m.uid);
  m.friendship ??= BASE_FRIENDSHIP;
}

interface V2Save {
  createdAt: number;
  playMs: number;
  player: { name: string; avatar: number };
  party: Mon[];
  box: Mon[];
  bag: Record<string, number>;
  money: number;
  dex: { seen: string[]; caught: string[] };
  stats: SaveData['stats'];
}

/**
 * The story was rewritten (Papeterre): the adventure starts over, but the old Bestioles wait
 * in the PC box, and the Bestiodex and money are kept.
 */
export function migrateV2(old: V2Save): SaveData {
  const s = freshSave(old.player.name, old.player.avatar, old.player.avatar % 2 === 0 ? 'f' : 'm', '');
  s.createdAt = old.createdAt;
  s.playMs = old.playMs;
  for (const m of [...old.party, ...old.box]) {
    const copy = { ...m };
    repairMon(copy);
    healMon(copy);
    storeInBox(s, copy);
  }
  s.money = Math.max(s.money, old.money);
  s.dex = { seen: [...old.dex.seen], caught: [...old.dex.caught] };
  s.stats = { ...old.stats };
  s.flags.migrated = 1;
  return s;
}

export function hasSave(): boolean {
  const raw = readRaw();
  outdatedSave.value = !!raw && !migrate(raw);
  return !!migrate(raw);
}

export function loadSave(): SaveData | null {
  const s = migrate(readRaw());
  save.value = s;
  return s;
}

export function persist() {
  if (!save.value) return;
  try {
    localStorage.setItem(KEY, JSON.stringify(save.value));
  } catch {
    // quota or private mode: the game keeps running in memory
  }
}

/** Writes the save only if the player turned auto-save on; otherwise SAUVER in the menu does it. */
export function autosave() {
  if (prefs.value.autosave) persist();
}

/** Mutates a copy of the save and publishes it (written to storage only with auto-save). */
export function update(fn: (s: SaveData) => void) {
  if (!save.value) return;
  const next = structuredClone(save.value);
  fn(next);
  save.value = next;
  autosave();
}

export function deleteSave() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
  save.value = null;
  outdatedSave.value = false;
}

function freshSave(name: string, avatar: number, gender: 'f' | 'm', rivalName: string): SaveData {
  return {
    version: SAVE_VERSION,
    createdAt: Date.now(),
    playMs: 0,
    // you wake up next to your bed
    player: { name, avatar, gender, map: 'maison', x: 6, y: 4, facing: 'down' },
    rivalName,
    respawn: { map: 'maison', x: 4, y: 5 },
    flags: {},
    party: [],
    boxes: Array.from({ length: BOX_COUNT }, () => []),
    bag: { potion: 1 },
    money: 3000,
    dex: { seen: [], caught: [] },
    badges: [],
    stats: { battles: 0, captures: 0 },
  };
}

export function newGame(name: string, avatar: number, gender: 'f' | 'm', rivalName: string): SaveData {
  const s = freshSave(name, avatar, gender, rivalName);
  save.value = s;
  outdatedSave.value = false;
  // like the GBA games, a new adventure only replaces the old save once the player saves
  autosave();
  try {
    navigator.storage?.persist?.();
  } catch {
    // not supported
  }
  return s;
}

export function exportSave() {
  if (!save.value) return;
  const blob = new Blob([JSON.stringify(save.value, null, 1)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `atelier-bestioles-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

export async function importSave(file: File): Promise<boolean> {
  try {
    const s = migrate(JSON.parse(await file.text()));
    if (!s) return false;
    save.value = s;
    persist();
    return true;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------- helpers (mutate the draft)

export function see(s: SaveData, species: string) {
  if (!s.dex.seen.includes(species)) s.dex.seen.push(species);
}

/** Puts a creature in the first PC box with room (a new box after the last one if all are full). */
export function storeInBox(s: SaveData, m: Mon) {
  const box = s.boxes.find((b) => b.length < BOX_SIZE);
  if (box) box.push(m);
  else s.boxes.push([m]);
}

/** Every creature the player owns (party first, then the boxes). */
export const allMons = (s: SaveData): Mon[] => [...s.party, ...s.boxes.flat()];

/**
 * Puts a new creature in the party, or in the PC when the party is full, and notes where and how
 * it was met. Returns where it went.
 */
export function addMon(s: SaveData, m: Mon, how: MetHow = 'caught', place = s.player.map): 'party' | 'box' {
  see(s, m.species);
  if (!s.dex.caught.includes(m.species)) s.dex.caught.push(m.species);
  m.met ??= { level: m.level, map: place, how };
  if (s.party.length < PARTY_MAX) {
    s.party.push(m);
    return 'party';
  }
  storeInBox(s, m);
  return 'box';
}

export function healParty(s: SaveData) {
  s.party.forEach(healMon);
}

/** Someone in the party can fight (eggs can't). */
export const partyAlive = (s: SaveData) => s.party.some((m) => m.hp > 0 && !m.egg);

export function addItem(s: SaveData, id: string, n = 1) {
  s.bag[id] = (s.bag[id] ?? 0) + n;
}

export function takeItem(s: SaveData, id: string, n = 1): boolean {
  if ((s.bag[id] ?? 0) < n) return false;
  s.bag[id] -= n;
  if (s.bag[id] <= 0) delete s.bag[id];
  return true;
}

/** The creature holds `id` from the bag; what it held goes back to the bag. False if the bag has none. */
export function giveHeld(s: SaveData, m: Mon, id: string): boolean {
  if (!takeItem(s, id)) return false;
  if (m.item) addItem(s, m.item);
  m.item = id;
  return true;
}

/** Puts the creature's held item back in the bag. Returns it (null if it held nothing). */
export function takeHeld(s: SaveData, m: Mon): string | null {
  const id = m.item;
  if (!id) return null;
  addItem(s, id);
  m.item = null;
  return id;
}
