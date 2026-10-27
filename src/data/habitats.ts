import { creature } from './creatures';
import { MAPS } from './maps';

export type HabitatHow = 'grass' | 'cave' | 'surf' | 'old' | 'good' | 'super' | 'gift' | 'tombola';

export interface Habitat {
  map: string;
  how: HabitatHow;
  min?: number;
  max?: number;
  /** Only by day or only at night there. */
  time?: 'day' | 'night';
}

/** Bestioles given by someone (not found in the wild). */
const GIFTS: Record<string, string[]> = { '001': ['labo'], '002': ['labo'], '003': ['labo'], '016': ['ville'], '073': ['bois'] };
/** Bestioles waiting somewhere, met once: where, at what level, in what kind of place, at what time. */
const STATIC: Record<string, { map: string; level: number; how: HabitatHow; time?: 'night' }[]> = {
  '011': [{ map: 'grotteEchos', level: 36, how: 'cave' }],
  // after the ending, the one Coconfus did not become (before it, only visions: src/story/legends.ts)
  '071': [{ map: 'boisPerdu', level: 55, how: 'grass', time: 'night' }],
  '072': [{ map: 'ratures3', level: 55, how: 'cave' }],
};

/**
 * Where a species can be met: every encounter table (tall grass or cave, sailing, each fishing
 * rod), gifts, and the Tombola, which can draw any Bestiole but the legendaries.
 */
export function habitatsOf(species: string): Habitat[] {
  const out: Habitat[] = [];
  const add = (map: string, how: HabitatHow, rows: { id: string; min: number; max: number; time?: 'day' | 'night' }[] | undefined) => {
    const mine = (rows ?? []).filter((r) => r.id === species);
    if (!mine.length) return;
    const time = mine.every((r) => r.time === mine[0].time) ? mine[0].time : undefined;
    out.push({ map, how, min: Math.min(...mine.map((r) => r.min)), max: Math.max(...mine.map((r) => r.max)), ...(time ? { time } : {}) });
  };
  for (const m of Object.values(MAPS)) {
    add(m.id, m.encounters?.anyTile ? 'cave' : 'grass', m.encounters?.table);
    add(m.id, 'surf', m.surf?.table);
    for (const rod of ['old', 'good', 'super'] as const) add(m.id, rod, m.fishing?.[rod]);
  }
  for (const map of GIFTS[species] ?? []) out.push({ map, how: 'gift' });
  for (const s of STATIC[species] ?? []) out.push({ map: s.map, how: s.how, min: s.level, max: s.level, ...(s.time ? { time: s.time } : {}) });
  // the machine never draws the dream legendaries or their cocoon
  if (creature(species).rarity !== 'legendary') out.push({ map: 'tombola', how: 'tombola' });
  return out;
}
