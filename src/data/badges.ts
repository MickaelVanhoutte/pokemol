import { L, type LText } from '../i18n';
import type { TypeId } from './schema';

export interface BadgeDef {
  id: string;
  name: LText;
  leader: LText;
  type: TypeId;
  color: string;
  /** Technical capsule the leader gives with the badge (FireRed style). */
  tm?: string;
}

/** The eight Atelier badges of Papeterre, in story order (shown as stickers on the trainer card). */
export const BADGES: BadgeDef[] = [
  { id: 'pastel', name: L('Badge Pastel', 'Pastel Badge'), leader: L('Mireille', 'Mireille'), type: 'insecte', color: '#9ed36a', tm: 'ct01' },
  { id: 'plume', name: L('Badge Plume', 'Feather Badge'), leader: L('Gaspard', 'Gaspard'), type: 'normal', color: '#c8b48a', tm: 'ct02' },
  { id: 'aquarelle', name: L('Badge Aquarelle', 'Watercolor Badge'), leader: L('Marine', 'Marine'), type: 'eau', color: '#5b9be0', tm: 'ct03' },
  { id: 'fluo', name: L('Badge Fluo', 'Neon Badge'), leader: L('Zélie', 'Zelie'), type: 'electrique', color: '#f2d23e', tm: 'ct04' },
  { id: 'braise', name: L('Badge Braise', 'Ember Badge'), leader: L('Ambre', 'Amber'), type: 'feu', color: '#f07a3a', tm: 'ct05' },
  { id: 'paillette', name: L('Badge Paillette', 'Glitter Badge'), leader: L('Célestine', 'Celestine'), type: 'fee', color: '#f29ac8', tm: 'ct06' },
  { id: 'gouache', name: L('Badge Gouache', 'Gouache Badge'), leader: L('Basile', 'Basil'), type: 'plante', color: '#4fae5a', tm: 'ct07' },
  { id: 'encre', name: L('Badge Encre', 'Ink Badge'), leader: L('Nocturne', 'Nocturne'), type: 'spectre', color: '#6a5aa6', tm: 'ct08' },
];

/** Badges of the previous story (cave and tower bosses), shown until the new story replaces them. */
export const LEGACY_BADGES: Record<string, BadgeDef> = {
  grotte: { id: 'grotte', name: L('Badge Gribouillis', 'Scribble Badge'), leader: L('Gardien', 'Keeper'), type: 'normal', color: '#a08a6a' },
  tour: { id: 'tour', name: L('Badge Brume', 'Mist Badge'), leader: L('Ombre', 'Shade'), type: 'spectre', color: '#7a6ab6' },
};

export function badgeDef(id: string): BadgeDef | undefined {
  return BADGES.find((b) => b.id === id) ?? LEGACY_BADGES[id];
}
