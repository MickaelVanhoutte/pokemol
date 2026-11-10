import { L, type LText } from '../i18n';
import { BADGES } from '../data/badges';
import { creature } from '../data/creatures';
import { TRAINERS, trainerLevel } from '../data/trainers';
import type { TypeId } from '../data/schema';
import type { SaveData } from '../save/schema';

/**
 * Challenge rules (roadmap milestone 10), picked when a new game starts and kept in the save (`save.rules`):
 * - `monotype`: only Bestioles of that type can be caught (the first one, a gift, is the exception);
 * - `onePerMap`: one catch per place (legendaries excepted);
 * - `sealedBag`: no items in battle but the Croque-Carnets;
 * - `levelCap`: no Bestiole grows past the ace of the next Atelier Master (then the Great Eraser's), until the end;
 * - `paidInn`: a night at the Inn costs money.
 */
export interface Rules {
  monotype?: TypeId;
  onePerMap?: boolean;
  sealedBag?: boolean;
  levelCap?: boolean;
  paidInn?: boolean;
}

export const RULE_NAMES: Record<keyof Rules, LText> = {
  monotype: L('Une seule couleur', 'One colour only'),
  onePerMap: L('Une capture par endroit', 'One catch per place'),
  sealedBag: L('Sac scellé', 'Sealed bag'),
  levelCap: L('Niveau plafond', 'Level cap'),
  paidInn: L('Auberge payante', 'Paid Inns'),
};

export const RULE_HINTS: Record<keyof Rules, LText> = {
  monotype: L('Tu n’attrapes que les Bestioles d’un seul type.', 'You only catch Critters of one type.'),
  onePerMap: L('Une seule capture par endroit (sauf les légendes).', 'Only one catch per place (legends aside).'),
  sealedBag: L('Pas d’objets en combat, sauf les Croque-Carnets.', 'No items in battle, Snapbooks aside.'),
  levelCap: L('Tes Bestioles ne dépassent pas le niveau du prochain Maître d’Atelier.', 'Your Critters can’t outgrow the next Atelier Master’s level.'),
  paidInn: L('Une nuit à l’Auberge se paie.', 'A night at the Inn costs money.'),
};

const typesOf = (species: string): TypeId[] => {
  const c = creature(species);
  return c.type2 ? [c.type, c.type2] : [c.type];
};

/** Whether the save's rules forbid catching this Bestiole here (`map`). */
export function catchForbidden(s: Pick<SaveData, 'rules' | 'flags'>, species: string, map: string): boolean {
  const r = s.rules;
  if (!r) return false;
  if (r.monotype && !typesOf(species).includes(r.monotype)) return true;
  if (r.onePerMap && s.flags[`catch:${map}`] && creature(species).rarity !== 'legendary') return true;
  return false;
}

/**
 * The level no Bestiole may pass under the level cap: the ace of the first Atelier Master not beaten yet, then the
 * Great Eraser's; none once the story is over (or without the rule).
 */
export function levelCapOf(s: Pick<SaveData, 'rules' | 'badges' | 'flags' | 'difficulty'>): number | undefined {
  if (!s.rules?.levelCap || s.flags.ending) return undefined;
  const difficulty = s.difficulty ?? 'normal';
  const next = BADGES.find((b) => !s.badges.includes(b.id));
  const t = next ? Object.values(TRAINERS).find((x) => x.badge === next.id) : TRAINERS.effaceur;
  if (!t) return undefined;
  return trainerLevel(Math.max(...t.party.map((m) => m.level)), difficulty);
}

/** What a night at the Inn costs with `paidInn`: more with each badge. */
export const innPrice = (s: Pick<SaveData, 'badges'>) => 100 + 50 * s.badges.length;

/** The bag a battle may use with `sealedBag`: the Croque-Carnets only. */
export function battleBag(s: Pick<SaveData, 'rules' | 'bag'>): Record<string, number> {
  if (!s.rules?.sealedBag) return s.bag;
  return Object.fromEntries(Object.entries(s.bag).filter(([id]) => id.includes('crayon-ball')));
}
