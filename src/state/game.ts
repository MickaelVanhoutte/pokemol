import { signal } from '@preact/signals';
import { healMon, type Mon } from '../engine/pk/creature';
import { PARTY_MAX, SAVE_VERSION, type SaveData } from '../save/schema';

const KEY = 'atelier-bestioles.save';

export const save = signal<SaveData | null>(null);
/** A save from an older version of the game was found (it can't be loaded). */
export const outdatedSave = signal(false);

function readRaw(): unknown {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function migrate(raw: unknown): SaveData | null {
  if (!raw || typeof raw !== 'object') return null;
  const s = raw as SaveData;
  return s.version === SAVE_VERSION ? s : null;
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

export function newGame(name: string, avatar: number): SaveData {
  const s: SaveData = {
    version: SAVE_VERSION,
    createdAt: Date.now(),
    playMs: 0,
    player: { name, avatar, map: 'maison', x: 4, y: 5, facing: 'down' },
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
