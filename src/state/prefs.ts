import { signal } from '@preact/signals';

/** Player preferences, kept per device (not in the save, so Options work from the title screen). */
export interface Prefs {
  textSpeed: 'slow' | 'mid' | 'fast';
  /** Battle animation duration multiplier (1 = normal). */
  battleAnim: number;
  sound: boolean;
  music: boolean;
}

const KEY = 'atelier-bestioles.prefs';
const DEFAULTS: Prefs = { textSpeed: 'mid', battleAnim: 1, sound: true, music: true };

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
