import { signal } from '@preact/signals';
import { fr } from './fr';
import { en } from './en';

export type Locale = 'fr' | 'en';
export type LText = { fr: string; en: string };
export type StringKey = keyof typeof fr;

const dictionaries: Record<Locale, Record<StringKey, string>> = { fr, en };

function initialLocale(): Locale {
  try {
    const saved = localStorage.getItem('atelier-bestioles.locale');
    if (saved === 'fr' || saved === 'en') return saved;
  } catch {
    // storage unavailable
  }
  return 'fr';
}

export const locale = signal<Locale>(typeof window === 'undefined' ? 'fr' : initialLocale());

export function setLocale(next: Locale) {
  locale.value = next;
  try {
    localStorage.setItem('atelier-bestioles.locale', next);
  } catch {
    // storage unavailable
  }
  if (typeof document !== 'undefined') document.documentElement.lang = next;
}

/** Grammatical gender of the player, for French agreements written `{g:endormie|endormi}`. */
export const gender = signal<'f' | 'm'>('f');

/** Placeholders filled in every text (`{name}`, `{rival}`…), set from the save. */
const globals: Record<string, string> = {};
export function setGlobalVars(vars: Record<string, string>) {
  Object.assign(globals, vars);
}

function fill(s: string, vars?: Record<string, string | number>): string {
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v));
  for (const [k, v] of Object.entries(globals)) s = s.replaceAll(`{${k}}`, v);
  s = s.replace(/\{g:([^|}]*)\|([^}]*)\}/g, (_, f: string, m: string) => (gender.value === 'f' ? f : m));
  // French puts a space before ! ? : ; — make it non-breaking so the mark never wraps alone
  return locale.value === 'fr' ? s.replace(/ ([!?:;»])/g, '\u00a0$1') : s;
}

/** UI string by key, with `{name}` placeholders. */
export function t(key: StringKey, vars?: Record<string, string | number>): string {
  return fill(dictionaries[locale.value][key] ?? key, vars);
}

/** Localized data text (names, move texts, dialog lines). */
export function tr(text: LText, vars?: Record<string, string | number>): string {
  return fill(text[locale.value], vars);
}

export const L = (fr: string, en: string): LText => ({ fr, en });
