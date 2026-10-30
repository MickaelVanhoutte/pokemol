import { L, type LText } from '../i18n';
import type { Look } from '../overworld/sprites';
import type { Dir } from '../save/schema';
import type { NpcDef } from '../overworld/mapTypes';

/**
 * The seven Colour Guides of Papeterre, one per colour of the rainbow. Each brings the player a field tool the
 * moment it becomes useful: arriving on its map once `need` is set, the guide walks up and hands it over
 * (`src/story/guides.ts`). Afterwards the guide stays on that map, at `home`, with tips. Indigo is the exception:
 * the Prof calls her at the lake camp in his own scene (`manual`).
 */
export interface Guide {
  id: 'rouge' | 'orange' | 'jaune' | 'vert' | 'bleu' | 'indigo' | 'violet';
  name: LText;
  /** « la guide jaune » / "the yellow guide". */
  title: LText;
  tool: string;
  look: Look;
  /** The map where it comes to you, and where it stays. */
  map: string;
  home: { x: number; y: number; facing: Dir };
  /** The story flag that makes the tool useful (a badge, a town freed). */
  need?: string;
  manual?: boolean;
}

/** In rainbow order; the story meets them in another (green first, orange last). */
export const GUIDES: Guide[] = [
  {
    id: 'rouge', name: L('Coquelicot', 'Poppy'), title: L('le guide rouge', 'the red guide'), tool: 'velo',
    look: { hair: '#3a2a1a', shirt: '#d64545', pants: '#2a2238', hat: '#d64545' },
    map: 'feutre', home: { x: 5, y: 16, facing: 'right' }, need: 'a2.feutre',
  },
  {
    id: 'orange', name: L('Clémentine', 'Clementine'), title: L('la guide orange', 'the orange guide'), tool: 'gants',
    look: { hair: '#7a3a1a', shirt: '#e8822e', pants: '#4a4458', longHair: true },
    map: 'braise', home: { x: 15, y: 9, facing: 'right' }, need: 'badge:braise',
  },
  {
    id: 'jaune', name: L('Mimosa', 'Mimosa'), title: L('la guide jaune', 'the yellow guide'), tool: 'canne-bois',
    look: { hair: '#7a4a2a', shirt: '#f2c94e', pants: '#3a5aa8', hat: '#f2c94e', longHair: true },
    map: 'plume', home: { x: 16, y: 14, facing: 'right' },
  },
  {
    id: 'vert', name: L('Pistache', 'Pistachio'), title: L('le guide vert', 'the green guide'), tool: 'ciseaux',
    look: { hair: '#5a3a20', shirt: '#4f9a3c', pants: '#7a5230', hat: '#3f7f30' },
    map: 'ville', home: { x: 14, y: 16, facing: 'down' }, need: 'badge:pastel',
  },
  {
    id: 'bleu', name: L('Azur', 'Azure'), title: L('le guide bleu', 'the blue guide'), tool: 'bateau',
    look: { hair: '#2a2238', shirt: '#3a7ad6', pants: '#ffffff', hat: '#ffffff' },
    map: 'port', home: { x: 12, y: 15, facing: 'up' }, need: 'badge:aquarelle',
  },
  {
    id: 'indigo', name: L('Myrtille', 'Bilberry'), title: L('la guide indigo', 'the indigo guide'), tool: 'bocal',
    look: { hair: '#1f1a3a', shirt: '#4b3f9e', pants: '#2a2238', longHair: true },
    map: 'lac', home: { x: 18, y: 28, facing: 'left' }, need: 'tr:rivalLac', manual: true,
  },
  {
    id: 'violet', name: L('Lavande', 'Lavender'), title: L('la guide violette', 'the violet guide'), tool: 'maillet',
    look: { hair: '#6a4a2a', shirt: '#8a5cc8', pants: '#5a4a3a', hat: '#b48ae0', longHair: true },
    map: 'montFusain1', home: { x: 13, y: 10, facing: 'down' },
  },
];

export const guide = (id: Guide['id']) => GUIDES.find((g) => g.id === id)!;

/** The guide waiting on its map once its tool is given (before, it comes to you instead). */
export function guideNpc(id: Guide['id']): NpcDef {
  const g = guide(id);
  return { id: `guide-${id}`, x: g.home.x, y: g.home.y, look: g.look, facing: g.home.facing, script: `guide:${id}`, showIf: `gift:${g.tool}` };
}
