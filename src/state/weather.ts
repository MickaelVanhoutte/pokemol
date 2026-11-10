import { L, type LText } from '../i18n';
import type { Weather } from '../data/schema';
import type { MapDef } from '../overworld/mapTypes';
import { localDay } from '../overworld/berries';

/**
 * The weather over Papeterre (roadmap milestone 9): one sky per outdoor place and per real day, most days clear.
 * Rain and snow come into the battles fought there; a few wild Bestioles come out more in the rain, the wind or the
 * fog (`sky` on an encounter row).
 */
export type Sky = 'clear' | 'rain' | 'snow' | 'wind' | 'fog';
export const SKIES: Sky[] = ['clear', 'rain', 'snow', 'wind', 'fog'];

/** The gentle start: Act 1's places always have a clear sky. */
const CALM = new Set(['bourg', 'route1', 'ville', 'route2', 'bois']);
/** The places high and cold enough for snow (elsewhere it rains instead). */
export const SNOWY = new Set(['paillette', 'galerie', 'ilePage', 'route8']);

const hash = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
};

/** The sky over a place on a day: clear 55%, rain 15%, wind 15%, fog 10%, snow 5% (rain where it can't snow). */
export function skyOver(place: string, day = localDay()): Sky {
  if (CALM.has(place)) return 'clear';
  const r = (hash(`${place}:${day}`) % 1000) / 1000;
  if (r < 0.55) return 'clear';
  if (r < 0.7) return 'rain';
  if (r < 0.85) return 'wind';
  if (r < 0.95) return 'fog';
  return SNOWY.has(place) ? 'snow' : 'rain';
}

/** Whether a map has a sky: outdoors, above the water, in the dream (the sketched edge of the page has none). */
export const hasSky = (def: MapDef) => !def.indoor && !def.underwater && !def.awake && !def.dungeon && def.backdrop !== 'sketch' && def.sky !== false;

/** The sky over a map today. */
export const skyOf = (def: MapDef, day = localDay()): Sky => (hasSky(def) ? skyOver(def.id, day) : 'clear');

/** The weather a battle starts with under that sky. */
export const skyToBattle = (s: Sky): Weather | null => (s === 'rain' ? 'pluie' : s === 'snow' ? 'grele' : null);

export const SKY_NAMES: Record<Sky, LText> = {
  clear: L('Beau temps', 'Fair weather'),
  rain: L('Pluie', 'Rain'),
  snow: L('Neige', 'Snow'),
  wind: L('Vent', 'Wind'),
  fog: L('Brouillard', 'Fog'),
};
