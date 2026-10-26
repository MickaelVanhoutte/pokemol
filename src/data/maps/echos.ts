import { L } from '../../i18n';
import type { MapDef } from '../../overworld/mapTypes';
import { LOOKS } from '../../overworld/sprites';

/**
 * La Grotte des Échos, off Route 8 (optional): two boulders (Strong Gloves) fill the two pits of
 * the narrow passage, and at the back a huge shadow waits: Ombrouille.
 */
export const ECHOS_MAPS: Record<string, MapDef> = {
  grotteEchos: {
    id: 'grotteEchos',
    dungeon: true,
    name: L('Grotte des Échos', 'Echo Cave'),
    indoor: true,
    border: 'cavewall',
    backdrop: 'cave',
    tint: 'rgba(30, 10, 50, 0.32)',
    rows: [
      'KKKKKKKKKKKKKKKK',
      'KKKKKkkkkkKKKKKK',
      'KKKKkkk%kkkKKKKK',
      'KKKKKkkkkkKKKKKK',
      'KKKKKKKOKKKKKKKK',
      'KKKKKKKOKKKKKKKK',
      'KKkkkkkkkkkkkKKK',
      'KkkkkkkkkkkkkkKK',
      'KkkkkkkkkkkrkkKK',
      'KKkkkkkkkkkkkKKK',
      'KKKkkkkkkkkkKKKK',
      'KKKKKKKEEKKKKKKK',
    ],
    // the shadow leaves for good once Ombrouille is caught or beaten
    patches: [{ id: 'echoShadow', x: 7, y: 2, rows: ['k'], if: 'static:ombrouille' }],
    interact: [{ x: 7, y: 2, script: 'echoShadow' }],
    obstacles: [{ id: 'echoA', x: 7, y: 7, kind: 'boulder' }, { id: 'echoB', x: 4, y: 8, kind: 'boulder' }],
    holes: [{ x: 7, y: 4 }, { x: 7, y: 5 }],
    signs: [{ x: 11, y: 8, text: L('Gravé dans la roche : « Deux trous barrent le passage. Deux rochers les combleront. Coincé ? Sors et reviens. »', 'Carved in the rock: “Two pits block the passage. Two boulders will fill them. Stuck? Go out and come back.”') }],
    warps: [
      { x: 7, y: 11, to: { map: 'route8', x: 14, y: 11, facing: 'down' } },
      { x: 8, y: 11, to: { map: 'route8', x: 14, y: 11, facing: 'down' } },
    ],
    npcs: [
      { id: 'echoHiker', x: 2, y: 7, look: LOOKS.hiker, facing: 'right',
        text: [L('Écoute… Au fond de la grotte, quelque chose respire. Des yeux rouges brillent derrière les trous.', 'Listen… At the back of the cave, something is breathing. Red eyes glow beyond the pits.')] },
    ],
    items: [{ x: 9, y: 1, item: 'super-potion', count: 2 }, { x: 12, y: 7, item: 'retouche', count: 2 }],
    encounters: {
      rate: 0.08,
      anyTile: true,
      table: [
        { id: '009', w: 40, min: 33, max: 36 },
        { id: '010', w: 30, min: 34, max: 37 },
        { id: '008', w: 20, min: 34, max: 36 },
        { id: '006', w: 10, min: 33, max: 35 },
      ],
    },
  },
};
