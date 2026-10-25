import type { BerryBushDef } from './mapTypes';

/** Days since 1970 in the player's time zone: bushes grow back at local midnight. */
export function localDay(now = Date.now()): number {
  return Math.floor((now - new Date(now).getTimezoneOffset() * 60000) / 86400000);
}

export const berryFlag = (map: string, b: BerryBushDef) => `berry:${map}:${b.x},${b.y}`;

/** A bush has berries unless it was picked today (the flag stores the day it was picked). */
export const isRipe = (pickedOn: number | undefined, today = localDay()) => !pickedOn || pickedOn < today;

/** Colour of the berries drawn on a ripe bush. */
export const BERRY_DOT: Record<string, string> = {
  'baie-bleue': '#3f6fd0', 'baie-doree': '#f2b21e', 'baie-cerise': '#d63a3a', 'baie-reveil': '#9a6ad6',
  'baie-peche': '#f59a72', 'baie-givree': '#5fd0e0', 'baie-menthe': '#6ad06a', 'baie-prisme': '#e07aa6',
};
