import { L } from '../../i18n';
import type { MapDef } from '../../overworld/mapTypes';
import { LOOKS } from '../../overworld/sprites';

/**
 * The Piste Cyclable: a long downhill road from Jardin-Gouache (top) to Ville-Feutre (bottom), on the
 * Pencil Bike only. Its gate at the Gouache end opens from the Gouache side, so it is a shortcut
 * back south once you have got that far, never a way to skip ahead.
 */
export const PISTE_MAPS: Record<string, MapDef> = {
  piste: {
    id: 'piste',
    name: L('Piste Cyclable', 'Cycling Track'),
    border: 'tree',
    rows: [
      'TTTTTTTTTTTTTT',
      'TTTTTTTTTT..TT',
      '..::::::::::.T',
      '..::::::::::.T',
      'TTTTTTTT""::.T',
      'T*..TTTT""::.T',
      'T....,TT..::.T',
      'T.""".....::.T',
      'T.""".TT..::.T',
      'T.....TT..::.T',
      'TTTTTTTT..__.T',
      'TTTTTTTT""::.T',
      'TTTTTTTT""::.T',
      'T..*TTTT..::.T',
      'T....TTT..::.T',
      'T.""""....::.T',
      'T.""""TT..::.T',
      'T....RTT..::.T',
      'TTTTTTTT..__.T',
      'TTTTTTTT""::.T',
      'TTTTTTTT""::.T',
      'TTTTTTTT..::.T',
      'T*.....TT.::.T',
      'T.""""....::.T',
      'T.""""TTT.::.T',
      'T......TT.::.T',
      'TTTTTTTTT.__.T',
      'TTTTTTTTT.::.T',
      'TTTTTTTT""::.T',
      'TTTTTTTT""::.T',
      'T..R..TT..::.T',
      'T.....,...::.T',
      'T*.""".TT.::.T',
      'T..""".TT.::.T',
      'TTTTTTTTT.__.T',
      'TTTTTTTTT.::.T',
      '..:::::::::::T',
      '..:::::::::::T',
      'T*...........T',
      'TTTTTTTTTTTTTT',
    ],
    // closed until opened from the Gouache side
    patches: [{ id: 'pisteGate', x: 2, y: 2, rows: ['G', 'G'], unless: 'piste.open' }],
    interact: [{ x: 2, y: 2, script: 'pisteGate' }, { x: 2, y: 3, script: 'pisteGate' }],
    triggers: [
      { x: 3, y: 2, h: 2, script: 'pisteBike' },
      { x: 2, y: 36, h: 2, script: 'pisteBike' },
    ],
    warps: [
      { x: 0, y: 2, to: { map: 'gouache', x: 18, y: 2, facing: 'left' } },
      { x: 0, y: 3, to: { map: 'gouache', x: 18, y: 3, facing: 'left' } },
      { x: 0, y: 36, to: { map: 'feutre', x: 22, y: 10, facing: 'left' } },
      { x: 0, y: 37, to: { map: 'feutre', x: 22, y: 11, facing: 'left' } },
    ],
    signs: [{ x: 13, y: 38, text: L('PISTE CYCLABLE\nVélo-Crayon obligatoire !\n↑ Jardin-Gouache   ← Ville-Feutre', 'CYCLING TRACK\nPencil Bike only!\n↑ Gouache Garden   ← Felt City') }],
    npcs: [
      { id: 'pc1', x: 12, y: 6, look: LOOKS.cyclist, facing: 'left', trainer: 'pc1', sight: 2 },
      { id: 'pc2', x: 9, y: 14, look: LOOKS.cyclistF, facing: 'right', trainer: 'pc2', sight: 2 },
      { id: 'pc3', x: 12, y: 22, look: LOOKS.cyclistF, facing: 'left', trainer: 'pc3', sight: 2 },
      { id: 'pc4', x: 9, y: 30, look: LOOKS.cyclist, facing: 'right', trainer: 'pc4', sight: 2 },
    ],
    items: [
      { x: 6, y: 25, item: 'sucette-magique' },
      { x: 1, y: 9, item: 'super-crayon-ball', count: 2 }, { x: 1, y: 25, item: 'rappel' }, { x: 4, y: 30, item: 'baie-doree' },
      { x: 11, y: 1, item: 'super-potion', count: 2 }, { x: 3, y: 13, item: 'baie-prisme', hidden: true },
    ],
    encounters: {
      rate: 0.1,
      table: [
        { id: '004', w: 25, min: 28, max: 30 },
        { id: '013', w: 25, min: 28, max: 30 },
        { id: '005', w: 20, min: 28, max: 30 },
        { id: '007', w: 20, min: 29, max: 30 },
        { id: '016', w: 10, min: 29, max: 30 },
        { id: '026', w: 10, min: 28, max: 30 },
        { id: '046', w: 8, min: 29, max: 30 },
        { id: '061', w: 8, min: 28, max: 30 },
        { id: '055', w: 8, min: 29, max: 30 },
        { id: '079', w: 8, min: 28, max: 30 },
        { id: '106', w: 5, min: 28, max: 30 },
      ],
    },
  },
};
