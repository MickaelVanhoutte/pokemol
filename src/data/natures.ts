import { L, type LText } from '../i18n';
import type { StatKey } from './schema';

type BattleStat = Exclude<StatKey, 'hp'>;

/** A personality ("nature"): +10% to one stat and −10% to another, or nothing for the five calm ones. */
export interface NatureDef {
  id: string;
  /** French agrees with « une nature … » (feminine). */
  name: LText;
  up?: BattleStat;
  down?: BattleStat;
}

const N = (id: string, fr: string, en: string, up?: BattleStat, down?: BattleStat): NatureDef => ({ id, name: L(fr, en), up, down });

export const NATURES: NatureDef[] = [
  N('fonceuse', 'Fonceuse', 'Headstrong', 'atk', 'def'),
  N('costaude', 'Costaude', 'Burly', 'atk', 'spe'),
  N('bagarreuse', 'Bagarreuse', 'Scrappy', 'atk', 'spa'),
  N('impulsive', 'Impulsive', 'Impulsive', 'atk', 'spd'),
  N('tendre', 'Tendre', 'Soft-hearted', 'def', 'atk'),
  N('tranquille', 'Tranquille', 'Laid-back', 'def', 'spe'),
  N('tetue', 'Têtue', 'Stubborn', 'def', 'spa'),
  N('solide', 'Solide', 'Sturdy', 'def', 'spd'),
  N('craintive', 'Craintive', 'Skittish', 'spe', 'atk'),
  N('etourdie', 'Étourdie', 'Scatterbrained', 'spe', 'def'),
  N('joueuse', 'Joueuse', 'Playful', 'spe', 'spa'),
  N('agitee', 'Agitée', 'Fidgety', 'spe', 'spd'),
  N('reveuse', 'Rêveuse', 'Dreamy', 'spa', 'atk'),
  N('curieuse', 'Curieuse', 'Curious', 'spa', 'def'),
  N('appliquee', 'Appliquée', 'Diligent', 'spa', 'spe'),
  N('distraite', 'Distraite', 'Absent-minded', 'spa', 'spd'),
  N('caline', 'Câline', 'Cuddly', 'spd', 'atk'),
  N('sensible', 'Sensible', 'Sensitive', 'spd', 'def'),
  N('patiente', 'Patiente', 'Patient', 'spd', 'spe'),
  N('sage', 'Sage', 'Well-behaved', 'spd', 'spa'),
  N('joyeuse', 'Joyeuse', 'Cheerful'),
  N('gourmande', 'Gourmande', 'Sweet-toothed'),
  N('bavarde', 'Bavarde', 'Chatty'),
  N('coquette', 'Coquette', 'Dapper'),
  N('espiegle', 'Espiègle', 'Cheeky'),
];

/** Trainers' Bestioles use a neutral nature, so their battles stay the same every time. */
export const NEUTRAL_NATURE = 'joyeuse';

const BY_ID: Record<string, NatureDef> = Object.fromEntries(NATURES.map((n) => [n.id, n]));

export function nature(id: string | undefined): NatureDef {
  return (id && BY_ID[id]) || BY_ID[NEUTRAL_NATURE];
}

/** In tenths: 11 for the raised stat, 9 for the lowered one, 10 otherwise (HP never changes). */
export function natureTenths(id: string | undefined, key: StatKey): number {
  const n = nature(id);
  return key === n.up ? 11 : key === n.down ? 9 : 10;
}

/** A stable nature for Bestioles from saves made before natures existed. */
export function natureFromUid(uid: string): string {
  let h = 0;
  for (const c of uid) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return NATURES[h % NATURES.length].id;
}
