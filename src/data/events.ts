import { L, tr, type LText } from '../i18n';
import { creature } from './creatures';
import { item } from './items';
import { MAPS } from './maps';
import { TOWNS } from './worldmap';
import type { SaveData } from '../save/schema';

/**
 * Papeterre's calendar (roadmap milestone 11), from the real day (`localDay()`) alone:
 * - a swarm each day: one uncommon Bestiole comes out a lot on one route already visited (from the second badge);
 * - a market each week (on the sixth day): a stall in one town's shop sells one thing found nowhere else that week;
 * - the Bal des Étoiles at Bourg-Paillette, the nights of 21 to 23 December.
 */

/** Routes and the Bestiole that swarms there (one already living there, uncommon or rare). */
export const SWARMS: [map: string, species: string][] = [
  ['route3', '051'], ['route4', '118'], ['route4', '092'], ['route6', '014'], ['route6', '055'], ['route7', '084'], ['route7', '090'],
  ['route8', '083'], ['route8', '098'],
];

const mix = (n: number) => {
  let h = Math.imul(n ^ 0x9e3779b9, 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  return (h ^ (h >>> 16)) >>> 0;
};

/** Today's swarm, if any: among the routes visited, from the second badge. */
export function swarmOf(day: number, s: Pick<SaveData, 'flags' | 'badges'>): { map: string; species: string } | null {
  if (s.badges.length < 2) return null;
  const open = SWARMS.filter(([m, sp]) => s.flags[`seen:${m}`] && MAPS[m]?.encounters?.table.some((r) => r.id === sp));
  if (!open.length) return null;
  const [map, species] = open[mix(day) % open.length];
  return { map, species };
}

/** The swarm's row for a map's wild table: as many as all the others together, at the map's own levels. */
export function swarmRow(map: string, species: string) {
  const t = MAPS[map]?.encounters?.table ?? [];
  const own = t.filter((r) => r.id === species);
  const rows = own.length ? own : t;
  return { id: species, w: t.reduce((a, r) => a + r.w, 0), min: Math.min(...rows.map((r) => r.min)), max: Math.max(...rows.map((r) => r.max)) };
}

/** The week a day falls in (the market, the rival's and the doubt's rematches count weeks the same way). */
export const weekOf = (day: number) => Math.floor(day / 7);

/** The town of this week's market (the towns with a shop, in turn), open on the week's sixth day only. */
export function marketTown(day: number): string | null {
  if (day % 7 !== 5) return null;
  const towns = TOWNS.map((t) => t.map).filter((m) => MAPS[m]?.buildings?.some((b) => b.kind === 'shop'));
  return towns[weekOf(day) % towns.length] ?? null;
}

/** What the market stall sells, one a week in turn: things no shop has. */
export const MARKET_STOCK: [item: string, price: number][] = [
  ['baie-prisme', 900], ['baie-doree', 700], ['clochette', 4000], ['plume-vive', 4000], ['loupe', 4000], ['ruban-tenace', 5000],
  ['crayon-magique-glace', 6000], ['bille-ardente', 5000],
];
export const marketItem = (day: number) => MARKET_STOCK[weekOf(day) % MARKET_STOCK.length];

/** The Bal des Étoiles: the nights of 21 to 23 December (the device's date). */
export const isBal = (now: Date) => now.getMonth() === 11 && now.getDate() >= 21 && now.getDate() <= 23;

/** Today's news, for the Town Map and the Inns' crier: the swarm, the market, the ball. */
export function todayNews(day: number, s: Pick<SaveData, 'flags' | 'badges'>, now = new Date()): LText[] {
  const out: LText[] = [];
  const sw = swarmOf(day, s);
  if (sw) {
    const c = tr(creature(sw.species).name), m = tr(MAPS[sw.map].name);
    out.push(L(`Plein de ${c} sur ${m} !`, `Lots of ${c} on ${m}!`));
  }
  const town = marketTown(day);
  if (town && s.badges.length >= 2) out.push(L(`Jour de marché à ${tr(MAPS[town].name)} (${tr(item(marketItem(day)[0]).name)}).`, `Market day in ${tr(MAPS[town].name)} (${tr(item(marketItem(day)[0]).name)}).`));
  if (isBal(now) && s.flags['seen:paillette']) out.push(L('Le Bal des Étoiles, cette nuit à Bourg-Paillette !', 'The Star Ball, tonight in Glimmerton!'));
  return out;
}
