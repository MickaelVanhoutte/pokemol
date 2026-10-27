import { L, type LText } from '../i18n';

/**
 * How the player looks: picked in the prologue (and again from the trainer card), drawn in coloured
 * pencil wherever a character shows big (`src/ui/personArt.ts`) and as a pixel chibi in the world
 * (`lookOf` in `src/overworld/sprites.ts`). Colours are kept as hex so a palette change never breaks
 * a save. Characters of the story keep their `Look` and are drawn through `fromLook`.
 */
export interface Appearance {
  hair: HairStyle;
  hairColor: string;
  skin: string;
  top: TopStyle;
  topColor: string;
  bottom: BottomStyle;
  bottomColor: string;
  extra: Extra;
  /** Colour of the cap, beanie or bow (the top's colour when unset). */
  extraColor?: string;
  /** Story characters only: a frown and a smirk, or a face rubbed out (the Great Eraser). */
  face?: 'mean' | 'blank';
  /** Team Gomme grunts hide behind a dark mask. */
  mask?: boolean;
  /** Admins and the boss wear a cape with a high collar. */
  cape?: string;
}

export type HairStyle = 'court' | 'pique' | 'carre' | 'long' | 'queue' | 'couettes' | 'boucles' | 'chignon';
/** `blouse` (a lab coat) and `uniforme` (Team Gomme) are for the characters of the story only. */
export type TopStyle = 'tshirt' | 'pull' | 'rayures' | 'blouse' | 'uniforme';
export type BottomStyle = 'pantalon' | 'short' | 'jupe';
/** `gomme`: Team Gomme's cap, an eraser (story only). */
export type Extra = 'aucun' | 'casquette' | 'bonnet' | 'noeud' | 'lunettes' | 'fleur' | 'gomme';

interface Option<T> { id: T; name: LText }

export const HAIR_STYLES: Option<HairStyle>[] = [
  { id: 'court', name: L('Courts', 'Short') },
  { id: 'pique', name: L('En pétard', 'Spiky') },
  { id: 'carre', name: L('Carré', 'Bob') },
  { id: 'long', name: L('Longs', 'Long') },
  { id: 'queue', name: L('Queue-de-cheval', 'Ponytail') },
  { id: 'couettes', name: L('Couettes', 'Pigtails') },
  { id: 'boucles', name: L('Bouclés', 'Curly') },
  { id: 'chignon', name: L('Chignon', 'Bun') },
];
export const TOP_STYLES: Option<TopStyle>[] = [
  { id: 'tshirt', name: L('T-shirt', 'T-shirt') },
  { id: 'pull', name: L('Pull', 'Sweater') },
  { id: 'rayures', name: L('Marinière', 'Stripes') },
];
export const BOTTOM_STYLES: Option<BottomStyle>[] = [
  { id: 'pantalon', name: L('Pantalon', 'Trousers') },
  { id: 'short', name: L('Short', 'Shorts') },
  { id: 'jupe', name: L('Jupe', 'Skirt') },
];
export const EXTRAS: Option<Extra>[] = [
  { id: 'aucun', name: L('Rien', 'Nothing') },
  { id: 'casquette', name: L('Casquette', 'Cap') },
  { id: 'bonnet', name: L('Bonnet', 'Beanie') },
  { id: 'noeud', name: L('Nœud', 'Bow') },
  { id: 'lunettes', name: L('Lunettes', 'Glasses') },
  { id: 'fleur', name: L('Fleur', 'Flower') },
];

export const HAIR_COLORS = ['#4a3020', '#8a5a32', '#2a2238', '#f2d05a', '#e0703a', '#c8c8d0', '#f29ac8', '#4a7ee0', '#8a5ad0'];
export const SKIN_COLORS = ['#fde3c8', '#f6c9a0', '#e8b088', '#c98a5c', '#9a6440', '#6a4028'];
export const CLOTH_COLORS = ['#d64545', '#f08a3a', '#f2c14e', '#6cc05a', '#2a9a8a', '#3a7ad6', '#2a4a8a', '#8a5ad0', '#f29ac8', '#f4f4f8'];

/** The two looks offered first (girl, boy): everything can be changed. */
export const DEFAULT_LOOKS: Record<'f' | 'm', Appearance> = {
  f: { hair: 'couettes', hairColor: '#e0703a', skin: '#f6c9a0', top: 'tshirt', topColor: '#d64545', bottom: 'jupe', bottomColor: '#3a7ad6', extra: 'aucun' },
  m: { hair: 'court', hairColor: '#4a3020', skin: '#f6c9a0', top: 'tshirt', topColor: '#3a7ad6', bottom: 'short', bottomColor: '#2a4a8a', extra: 'casquette', extraColor: '#d64545' },
};

/** A character of the story as the pixel chibis describe it (`Look` in `src/overworld/sprites.ts`). */
export interface LookLike {
  hair: string; skin?: string; shirt: string; pants: string; longHair?: boolean; coat?: boolean; hat?: string;
  style?: HairStyle; skirt?: boolean;
  /** Team Gomme: masked grunts, caped admins, the boss with no face. */
  gang?: 'grunt' | 'admin' | 'boss'; cape?: string;
}

export function fromLook(l: LookLike): Appearance {
  if (l.gang) {
    return {
      hair: l.longHair ? 'long' : 'court', hairColor: l.hair, skin: l.skin ?? '#f6c9a0',
      top: 'uniforme', topColor: l.shirt, bottom: 'pantalon', bottomColor: l.pants,
      extra: 'gomme', extraColor: l.hat ?? '#f27fa0',
      face: l.gang === 'boss' ? 'blank' : 'mean', mask: l.gang === 'grunt', cape: l.gang === 'grunt' ? undefined : l.cape ?? l.pants,
    };
  }
  return {
    hair: l.style ?? (l.longHair ? 'long' : 'court'),
    hairColor: l.hair,
    skin: l.skin ?? '#f6c9a0',
    top: l.coat ? 'blouse' : 'tshirt',
    topColor: l.shirt,
    bottom: l.skirt ? 'jupe' : 'pantalon',
    bottomColor: l.pants,
    extra: l.hat ? 'casquette' : 'aucun',
    extraColor: l.hat,
  };
}

/** The four portraits of the first versions, for saves made before the look could be chosen. */
export const OLD_AVATARS: Appearance[] = [
  { hair: 'long', hairColor: '#e0703a', skin: '#f6c9a0', top: 'tshirt', topColor: '#d64545', bottom: 'pantalon', bottomColor: '#3a4a8a', extra: 'aucun' },
  { hair: 'court', hairColor: '#4a3020', skin: '#f6c9a0', top: 'tshirt', topColor: '#3a7ad6', bottom: 'pantalon', bottomColor: '#2a2a3a', extra: 'casquette', extraColor: '#d64545' },
  { hair: 'long', hairColor: '#f2d05a', skin: '#f6c9a0', top: 'tshirt', topColor: '#6cc05a', bottom: 'pantalon', bottomColor: '#5a3a8a', extra: 'aucun' },
  { hair: 'court', hairColor: '#2a2238', skin: '#f6c9a0', top: 'tshirt', topColor: '#f08a3a', bottom: 'pantalon', bottomColor: '#2a5a4a', extra: 'aucun' },
];

/** A look picked at random (the « Au hasard » button). */
export function randomLook(r: () => number = Math.random): Appearance {
  const pick = <T>(xs: readonly T[]) => xs[Math.floor(r() * xs.length)];
  const extra = pick(EXTRAS).id;
  return {
    hair: pick(HAIR_STYLES).id,
    hairColor: pick(HAIR_COLORS),
    skin: pick(SKIN_COLORS),
    top: pick(TOP_STYLES).id,
    topColor: pick(CLOTH_COLORS),
    bottom: pick(BOTTOM_STYLES).id,
    bottomColor: pick(CLOTH_COLORS),
    extra,
    extraColor: extra === 'casquette' || extra === 'bonnet' || extra === 'noeud' ? pick(CLOTH_COLORS) : undefined,
  };
}

/** A stable key for caches. */
export const lookKey = (a: Appearance) => [a.hair, a.hairColor, a.skin, a.top, a.topColor, a.bottom, a.bottomColor, a.extra, a.extraColor ?? '', a.face ?? '', a.mask ? 1 : 0, a.cape ?? ''].join('|');
