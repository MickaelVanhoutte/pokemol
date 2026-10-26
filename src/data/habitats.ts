import { MAPS } from './maps';

export type HabitatHow = 'grass' | 'cave' | 'surf' | 'old' | 'good' | 'super' | 'gift' | 'tombola';

export interface Habitat {
  map: string;
  how: HabitatHow;
  min?: number;
  max?: number;
}

/** Bestioles given by someone (not found in the wild). */
const GIFTS: Record<string, string[]> = { '001': ['labo'], '002': ['labo'], '003': ['labo'], '016': ['ville'] };
/** Bestioles waiting somewhere, met once: [map, level]. */
const STATIC: Record<string, [string, number][]> = { '011': [['grotteEchos', 45]] };

/**
 * Where a species can be met: every encounter table (tall grass or cave, sailing, each fishing
 * rod), gifts, and the Tombola, which can draw any Bestiole.
 */
export function habitatsOf(species: string): Habitat[] {
  const out: Habitat[] = [];
  const add = (map: string, how: HabitatHow, rows: { id: string; min: number; max: number }[] | undefined) => {
    const mine = (rows ?? []).filter((r) => r.id === species);
    if (!mine.length) return;
    out.push({ map, how, min: Math.min(...mine.map((r) => r.min)), max: Math.max(...mine.map((r) => r.max)) });
  };
  for (const m of Object.values(MAPS)) {
    add(m.id, m.encounters?.anyTile ? 'cave' : 'grass', m.encounters?.table);
    add(m.id, 'surf', m.surf?.table);
    for (const rod of ['old', 'good', 'super'] as const) add(m.id, rod, m.fishing?.[rod]);
  }
  for (const map of GIFTS[species] ?? []) out.push({ map, how: 'gift' });
  for (const [map, level] of STATIC[species] ?? []) out.push({ map, how: 'cave', min: level, max: level });
  out.push({ map: 'tombola', how: 'tombola' });
  return out;
}
