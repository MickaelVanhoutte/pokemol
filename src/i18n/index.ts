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

/** French puts a space before ! ? : ; — make it non-breaking so the mark never wraps alone. */
function typo(s: string): string {
  return locale.value === 'fr' ? s.replace(/ ([!?:;»])/g, '\u00a0$1') : s;
}

/** UI string by key, with `{name}` placeholders. */
export function t(key: StringKey, vars?: Record<string, string | number>): string {
  let s = dictionaries[locale.value][key] ?? key;
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v));
  return typo(s);
}

/** Localized data text (card names, attack texts, dialog lines). */
export function tr(text: LText, vars?: Record<string, string | number>): string {
  let s = text[locale.value];
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v));
  return typo(s);
}

export const L = (fr: string, en: string): LText => ({ fr, en });
