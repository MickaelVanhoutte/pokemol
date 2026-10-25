import { effect, signal } from '@preact/signals';
import { gender, locale, setGlobalVars } from '../i18n';
import { healMon, type Mon } from '../engine/pk/creature';
import { PARTY_MAX, SAVE_VERSION, type SaveData } from '../save/schema';

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
  if (v === 2) return migrateV2(raw as V2Save);
  return v === SAVE_VERSION ? (raw as SaveData) : null;
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
  s.box = [...old.party, ...old.box].map((m) => ({ ...m }));
  s.box.forEach((m) => healMon(m));
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

/** Mutates a copy of the save, publishes it and writes it to storage. */
export function update(fn: (s: SaveData) => void) {
  if (!save.value) return;
  const next = structuredClone(save.value);
  fn(next);
  save.value = next;
  persist();
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
    player: { name, avatar, gender, map: 'maison', x: 7, y: 2, facing: 'down' },
    rivalName,
    respawn: { map: 'maison', x: 4, y: 5 },
    flags: {},
    party: [],
    box: [],
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
  persist();
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

/** Puts a new creature in the party, or in the PC box when the party is full. Returns where it went. */
export function addMon(s: SaveData, m: Mon): 'party' | 'box' {
  see(s, m.species);
  if (!s.dex.caught.includes(m.species)) s.dex.caught.push(m.species);
  if (s.party.length < PARTY_MAX) {
    s.party.push(m);
    return 'party';
  }
  s.box.push(m);
  return 'box';
}

export function healParty(s: SaveData) {
  s.party.forEach(healMon);
}

export const partyAlive = (s: SaveData) => s.party.some((m) => m.hp > 0);

export function addItem(s: SaveData, id: string, n = 1) {
  s.bag[id] = (s.bag[id] ?? 0) + n;
}

export function takeItem(s: SaveData, id: string, n = 1): boolean {
  if ((s.bag[id] ?? 0) < n) return false;
  s.bag[id] -= n;
  if (s.bag[id] <= 0) delete s.bag[id];
  return true;
}
