import { signal } from '@preact/signals';

/** Player preferences, kept per device (not in the save, so Options work from the title screen). */
export type Difficulty = 'easy' | 'normal' | 'hard';

export interface Prefs {
  textSpeed: 'slow' | 'mid' | 'fast';
  /** Strength of trainers' teams (see src/data/trainers.ts). */
  difficulty: Difficulty;
  /** Battle animation duration multiplier (1 = normal). */
  battleAnim: number;
  /** Move animations in battle (the GBA's "battle scene" option). */
  moveFx: boolean;
  sound: boolean;
  music: boolean;
  /** Write the save after every change. Off: only SAUVER in the menu writes it (GBA style). */
  autosave: boolean;
  /** The first Bestiole of the party walks behind the player. */
  follower: boolean;
}

const KEY = 'atelier-bestioles.prefs';
const DEFAULTS: Prefs = { textSpeed: 'mid', difficulty: 'normal', battleAnim: 1, moveFx: true, sound: true, music: true, autosave: false, follower: true };

function read(): Prefs {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...DEFAULTS, ...JSON.parse(raw) };
    // settings from older versions
    const speed = Number(localStorage.getItem('atelier-bestioles.speed'));
    const sfx = localStorage.getItem('atelier-bestioles.sfx');
    return { ...DEFAULTS, battleAnim: speed || 1, sound: sfx !== 'off' };
  } catch {
    return DEFAULTS;
  }
}

export const prefs = signal<Prefs>(typeof window === 'undefined' ? DEFAULTS : read());

export function setPref<K extends keyof Prefs>(k: K, v: Prefs[K]) {
  prefs.value = { ...prefs.value, [k]: v };
  try {
    localStorage.setItem(KEY, JSON.stringify(prefs.value));
  } catch {
    // storage unavailable
  }
}

/** Typewriter pace: characters added per tick and tick length (ms). */
export function textPace(): { chars: number; ms: number } {
  return { slow: { chars: 1, ms: 40 }, mid: { chars: 2, ms: 24 }, fast: { chars: 6, ms: 16 } }[prefs.value.textSpeed];
}
