import { L, type LText } from '../i18n';
import { creature } from './creatures';
import type { Major, StageKey, TypeId } from './schema';

/** What a talent does in battle (read by src/engine/pk/battle.ts). */
export type TalentEffect =
  /** ×1.5 power for moves of its type at a third of its HP or less. */
  | { kind: 'pinch'; type: TypeId }
  /** Moves of that type restore a quarter of its HP instead of hurting it. */
  | { kind: 'absorb'; type: TypeId }
  /** Damage from moves of these types is halved. */
  | { kind: 'halve'; types: TypeId[] }
  /** Super-effective hits do 25% less. */
  | { kind: 'filter' }
  /** Moves of 60 power or less are 50% stronger. */
  | { kind: 'technician' }
  /** Same-type bonus ×2 instead of ×1.5. */
  | { kind: 'adaptability' }
  /** One more critical-hit stage. */
  | { kind: 'superLuck' }
  /** Accuracy ×1.3. */
  | { kind: 'compoundEyes' }
  /** The foe can't lower its accuracy. */
  | { kind: 'keenEye' }
  /** Added effects of its moves are twice as likely. */
  | { kind: 'sereneGrace' }
  /** Added effects of the foe's moves don't reach it. */
  | { kind: 'shieldDust' }
  /** Hitting it up close may give the attacker a status. */
  | { kind: 'contactStatus'; status: Major; chance: number }
  /** Can't get that status. */
  | { kind: 'immune'; status: Major }
  /** Wakes up twice as fast. */
  | { kind: 'earlyBird' }
  /** A knockout from full HP leaves it with 1 HP. */
  | { kind: 'sturdy' }
  /** A stage change as soon as it enters the battle. */
  | { kind: 'entryStage'; target: 'self' | 'foe'; stat: StageKey; stages: number }
  /** +1 Speed at the end of every turn. */
  | { kind: 'speedBoost' }
  /** 1 chance in 3 to cure its status at the end of a turn. */
  | { kind: 'shedSkin' }
  /** Its status is cured when it is withdrawn or the battle ends. */
  | { kind: 'naturalCure' }
  /** Restores a third of its HP when withdrawn. */
  | { kind: 'regenerator' }
  /** Always escapes from wild Bestioles. */
  | { kind: 'runAway' };

export interface TalentDef {
  id: string;
  name: LText;
  desc: LText;
  effect: TalentEffect;
}

const T = (id: string, name: LText, desc: LText, effect: TalentEffect): TalentDef => ({ id, name, desc, effect });

export const TALENTS: TalentDef[] = [
  T('seve-rebelle', L('Sève Rebelle', 'Wild Sap'),
    L('Quand il ne lui reste qu’un tiers de ses PV, ses capacités Plante sont 50 % plus fortes.', 'At a third of its HP or less, its Grass moves are 50% stronger.'),
    { kind: 'pinch', type: 'plante' }),
  T('braise-tetue', L('Braise Têtue', 'Stubborn Ember'),
    L('Quand il ne lui reste qu’un tiers de ses PV, ses capacités Feu sont 50 % plus fortes.', 'At a third of its HP or less, its Fire moves are 50% stronger.'),
    { kind: 'pinch', type: 'feu' }),
  T('grosse-vague', L('Grosse Vague', 'Big Wave'),
    L('Quand il ne lui reste qu’un tiers de ses PV, ses capacités Eau sont 50 % plus fortes.', 'At a third of its HP or less, its Water moves are 50% stronger.'),
    { kind: 'pinch', type: 'eau' }),
  T('grignote-feuilles', L('Grignote-Feuilles', 'Leaf Nibbler'),
    L('Les capacités Plante ne lui font rien : il les grignote et récupère un quart de ses PV.', 'Grass moves don’t hurt it: it nibbles them and gets back a quarter of its HP.'),
    { kind: 'absorb', type: 'plante' }),
  T('eponge', L('Éponge', 'Sponge'),
    L('Les capacités Eau ne lui font rien : il les boit et récupère un quart de ses PV.', 'Water moves don’t hurt it: it soaks them up and gets back a quarter of its HP.'),
    { kind: 'absorb', type: 'eau' }),
  T('pile-rechargeable', L('Pile Rechargeable', 'Battery Pack'),
    L('Les capacités Électrique ne lui font rien : il se recharge et récupère un quart de ses PV.', 'Lightning moves don’t hurt it: it recharges and gets back a quarter of its HP.'),
    { kind: 'absorb', type: 'electrique' }),
  T('elan', L('Élan', 'Momentum'),
    L('Il va de plus en plus vite : sa Vitesse monte à la fin de chaque tour.', 'It keeps speeding up: its Speed rises at the end of every turn.'),
    { kind: 'speedBoost' }),
  T('poils-electriques', L('Poils Électriques', 'Fuzzy Spark'),
    L('Le toucher peut paralyser l’attaquant (3 chances sur 10).', 'Touching it may paralyse the attacker (3 chances in 10).'),
    { kind: 'contactStatus', status: 'paralyze', chance: 30 }),
  T('pieds-legers', L('Pieds Légers', 'Light Feet'),
    L('Il arrive toujours à fuir les Bestioles sauvages.', 'It always gets away from wild Critters.'),
    { kind: 'runAway' }),
  T('bonne-etoile', L('Bonne Étoile', 'Lucky Star'),
    L('Les effets en plus de ses capacités arrivent deux fois plus souvent.', 'The added effects of its moves happen twice as often.'),
    { kind: 'sereneGrace' }),
  T('rembourrage', L('Rembourrage', 'Padding'),
    L('Bien rembourré, il ne prend que la moitié des dégâts des capacités Feu et Électrique.', 'Well padded, it takes only half the damage from Fire and Lightning moves.'),
    { kind: 'halve', types: ['feu', 'electrique'] }),
  T('recoloriage', L('Recoloriage', 'Recolor'),
    L('Quand il revient dans sa Crayon-ball, il se recolorie et récupère un tiers de ses PV.', 'When it returns to its Pencil Ball, it colours itself in again and gets back a third of its HP.'),
    { kind: 'regenerator' }),
  T('leve-tot', L('Lève-Tôt', 'Early Riser'),
    L('Il se réveille deux fois plus vite.', 'It wakes up twice as fast.'),
    { kind: 'earlyBird' }),
  T('souple', L('Souple', 'Bendy'),
    L('Trop souple pour être paralysé.', 'Too bendy to be paralysed.'),
    { kind: 'immune', status: 'paralyze' }),
  T('petit-soin', L('Petit Soin', 'Self-Care'),
    L('Ses problèmes de statut disparaissent quand il revient dans sa Crayon-ball ou après un combat.', 'Its status problems go away when it returns to its Pencil Ball or after a battle.'),
    { kind: 'naturalCure' }),
  T('poudre-bouclier', L('Poudre Bouclier', 'Dust Coat'),
    L('Une fine poudre le protège des effets en plus des capacités adverses.', 'A fine powder shields it from the added effects of the foe’s moves.'),
    { kind: 'shieldDust' }),
  T('mille-yeux', L('Mille Yeux', 'Many Eyes'),
    L('Avec tous ses yeux, il vise mieux : précision +30 %.', 'With all its eyes, it aims better: accuracy +30%.'),
    { kind: 'compoundEyes' }),
  T('increvable', L('Increvable', 'Unbreakable'),
    L('Avec tous ses PV, un coup qui devrait le mettre K.O. lui laisse 1 PV.', 'At full HP, a hit that should knock it out leaves it with 1 HP.'),
    { kind: 'sturdy' }),
  T('brume-epaisse', L('Brume Épaisse', 'Thick Mist'),
    L('Il arrive dans un nuage de brume : son esquive monte.', 'It arrives in a cloud of mist: its evasiveness rises.'),
    { kind: 'entryStage', target: 'self', stat: 'eva', stages: 1 }),
  T('regard-noir', L('Regard Noir', 'Stink Eye'),
    L('En arrivant, il fait les gros yeux : l’Attaque de l’adversaire baisse.', 'It glares as it arrives: the foe’s Attack drops.'),
    { kind: 'entryStage', target: 'foe', stat: 'atk', stages: -1 }),
  T('petits-traits', L('Petits Traits', 'Light Strokes'),
    L('Il soigne les petits gestes : ses capacités de 60 de puissance ou moins sont 50 % plus fortes.', 'It takes care of small strokes: its moves of 60 power or less are 50% stronger.'),
    { kind: 'technician' }),
  T('nouvelle-peau', L('Nouvelle Peau', 'Fresh Skin'),
    L('Il mue parfois : à la fin d’un tour, 1 chance sur 3 de guérir de son statut.', 'It sometimes sheds: at the end of a turn, 1 chance in 3 to cure its status.'),
    { kind: 'shedSkin' }),
  T('oeil-de-lynx', L('Œil de Lynx', 'Hawk Eye'),
    L('Rien ne lui brouille la vue : l’adversaire ne peut pas baisser sa précision.', 'Nothing blurs its sight: the foe can’t lower its accuracy.'),
    { kind: 'keenEye' }),
  T('coup-de-chance', L('Coup de Chance', 'Lucky Break'),
    L('Ses coups critiques arrivent plus souvent.', 'It lands critical hits more often.'),
    { kind: 'superLuck' }),
  T('trait-assure', L('Trait Assuré', 'Bold Line'),
    L('Un trait sûr de lui : les capacités de son type sont encore plus fortes (×2 au lieu de ×1,5).', 'A confident line: moves of its own type are even stronger (×2 instead of ×1.5).'),
    { kind: 'adaptability' }),
  T('papier-epais', L('Papier Épais', 'Thick Paper'),
    L('Dessiné sur du papier épais : les coups super efficaces lui font 25 % de dégâts en moins.', 'Drawn on thick paper: super-effective hits do 25% less damage to it.'),
    { kind: 'filter' }),
];

const BY_ID: Record<string, TalentDef> = Object.fromEntries(TALENTS.map((t) => [t.id, t]));

export function talent(id: string): TalentDef {
  const t = BY_ID[id];
  if (!t) throw new Error(`unknown talent ${id}`);
  return t;
}

/** Talent slots: 0 or 1 are the species' regular talents, 2 its hidden talent. */
export type TalentSlot = 0 | 1 | 2;

/** Chance (out of 1) to be born with the hidden talent. */
export const HIDDEN_TALENT_CHANCE = 0.25;

/** A creature's talent: its species' talent in its slot (slot 1 falls back to 0 for one-talent species). */
export function talentOf(m: { species: string; talent?: TalentSlot }): TalentDef {
  const sp = creature(m.species);
  return talent(m.talent === 2 ? sp.hiddenTalent : sp.talents[m.talent ?? 0] ?? sp.talents[0]);
}

/** The talent's effect when it is of that kind (typed), otherwise undefined. */
export function talentEffect<K extends TalentEffect['kind']>(m: { species: string; talent?: TalentSlot }, kind: K): Extract<TalentEffect, { kind: K }> | undefined {
  const e = talentOf(m).effect;
  return e.kind === kind ? (e as Extract<TalentEffect, { kind: K }>) : undefined;
}

/** A stable slot for Bestioles from saves made before talents existed (1 in 4 hidden, like new ones). */
export function talentFromUid(uid: string): TalentSlot {
  let h = 7;
  for (const c of uid) h = (h * 37 + c.charCodeAt(0)) >>> 0;
  return h % 4 === 0 ? 2 : ((h >>> 3) % 2) as TalentSlot;
}
