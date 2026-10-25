import { signal } from '@preact/signals';
import { creature } from '../data/creatures';
import { STARTER_DECK } from '../data/supportCards';
import { addXp, DUPLICATE_XP, evolutionAt, maxHpAt } from '../engine/progression';
import type { BattleState, TeamMember } from '../engine/battle/types';
import { SAVE_VERSION, TEAM_MAX, type SaveData } from '../save/schema';

const KEY = 'atelier-bestioles.save';

export const save = signal<SaveData | null>(null);

export function hasSave(): boolean {
  try {
    return !!localStorage.getItem(KEY);
  } catch {
    return false;
  }
}

function migrate(raw: unknown): SaveData | null {
  if (!raw || typeof raw !== 'object') return null;
  const s = raw as SaveData;
  if (s.version !== SAVE_VERSION) return null;
  return s;
}

export function loadSave(): SaveData | null {
  try {
    const raw = localStorage.getItem(KEY);
    const s = raw ? migrate(JSON.parse(raw)) : null;
    save.value = s;
    return s;
  } catch {
    return null;
  }
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
}

export function newGame(name: string, avatar: number): SaveData {
  const s: SaveData = {
    version: SAVE_VERSION,
    createdAt: Date.now(),
    playMs: 0,
    player: { name, avatar, map: 'maison', x: 4, y: 5, facing: 'down' },
    respawn: { map: 'maison', x: 4, y: 5 },
    flags: {},
    collection: {},
    hp: {},
    team: [],
    deck: [],
    supplies: {},
    items: { blank: 0 },
    coins: 300,
    glitter: 0,
    pity: { creature: 0, support: 0 },
    run: null,
    badges: [],
    seen: [],
    stats: { wins: 0, captures: 0, pulls: 0, runs: 0, runsWon: 0 },
  };
  save.value = s;
  persist();
  requestPersistentStorage();
  return s;
}

function requestPersistentStorage() {
  try {
    navigator.storage?.persist?.();
  } catch {
    // not supported
  }
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

// ---------------------------------------------------------------- collection helpers (mutate the draft)

export interface AddResult {
  isNew: boolean;
  levelsGained: number;
  xp: number;
}

/** Adds a creature card; a duplicate turns into XP for the copy you own. */
export function addCreature(s: SaveData, defId: string, level = 1): AddResult {
  if (!s.seen.includes(defId)) s.seen.push(defId);
  const owned = s.collection[defId];
  if (!owned) {
    s.collection[defId] = { level, xp: 0, copies: 1 };
    if (s.team.length < TEAM_MAX) s.team.push(defId);
    return { isNew: true, levelsGained: 0, xp: 0 };
  }
  owned.copies++;
  const xp = DUPLICATE_XP[creature(defId).rarity];
  const r = addXp(owned, xp);
  owned.level = r.level;
  owned.xp = r.xp;
  return { isNew: false, levelsGained: r.gained, xp };
}

export function addSupply(s: SaveData, id: string, n = 1) {
  s.supplies[id] = (s.supplies[id] ?? 0) + n;
}

export function giveStarterKit(s: SaveData) {
  for (const id of STARTER_DECK) addSupply(s, id);
  s.deck = [...STARTER_DECK];
}

export function teamMembers(s: SaveData): TeamMember[] {
  return s.team.map((defId) => {
    const o = s.collection[defId];
    return { defId, level: o.level, hp: s.hp[defId] ?? maxHpAt(defId, o.level) };
  });
}

export function teamAlive(s: SaveData): boolean {
  return teamMembers(s).some((m) => (m.hp ?? 1) > 0);
}

export function healTeam(s: SaveData) {
  s.hp = {};
}

/** Writes HP back after an overworld battle and hands out XP. Returns level-ups for the UI. */
export function applyBattleOutcome(s: SaveData, st: BattleState, xpEach: number): { defId: string; gained: number }[] {
  const ups: { defId: string; gained: number }[] = [];
  st.sides[0].fighters.forEach((f) => {
    if (!s.collection[f.defId]) return;
    s.hp[f.defId] = f.ko ? 0 : f.hp;
    if (f.hp >= f.maxHp) delete s.hp[f.defId];
    if (xpEach > 0 && !f.ko) {
      const r = addXp(s.collection[f.defId], xpEach);
      const before = s.collection[f.defId].level;
      s.collection[f.defId].level = r.level;
      s.collection[f.defId].xp = r.xp;
      if (r.gained) {
        ups.push({ defId: f.defId, gained: r.gained });
        // level-ups also raise max HP; keep the same missing amount
        if (s.hp[f.defId] !== undefined) s.hp[f.defId] += (r.level - before) * 5;
      }
    }
  });
  return ups;
}

/** Creatures in the collection ready to evolve. */
export function pendingEvolutions(s: SaveData): { from: string; to: string }[] {
  return Object.entries(s.collection)
    .map(([id, o]) => ({ from: id, to: evolutionAt(id, o.level) }))
    .filter((e): e is { from: string; to: string } => !!e.to && !s.collection[e.to]);
}

/** Replaces `from` by its evolution, keeping level/XP; extra copies of the baby stay. */
export function evolve(s: SaveData, from: string, to: string) {
  const o = s.collection[from];
  s.collection[to] = { level: o.level, xp: o.xp, copies: 1 };
  if (!s.seen.includes(to)) s.seen.push(to);
  if (o.copies > 1) {
    o.copies--;
    o.level = 1;
    o.xp = 0;
  } else {
    delete s.collection[from];
  }
  s.team = s.team.map((id) => (id === from ? to : id));
  if (!s.collection[from]) s.team = s.team.filter((id, i, a) => a.indexOf(id) === i);
  delete s.hp[from];
}
