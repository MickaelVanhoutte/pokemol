/**
 * Demo page for the owner (quality pass, M2): battles made lighter for phones. The rain, sand and hail slide
 * on the graphics card instead of being repainted, the darkening moves hatch the scene once instead of at every
 * frame, and the drawings' white halo costs a third less. Built by `npm run demo -- m5`.
 */
import { L } from '../../src/i18n';
import type { BattleEvent } from '../../src/engine/pk/battle';
import { startBattleDemo, type Scene } from './battleDemo';

/** Our move landed and changed the weather (or was simply used). */
const weatherOn = (kind: string) => (ev: BattleEvent[]) => ev.some((e) => e.t === 'weather' && e.kind === kind && e.on);
const used = (move: string) => (ev: BattleEvent[]) => ev.some((e) => e.t === 'move' && e.side === 0 && e.move === move);

const WILD = { kind: 'wild', ground: 'tallgrass' } as const;

const SCENES: Scene[] = [
  { id: 'pluie', label: 'Pluie', hint: 'La pluie tombe toute seule, sans ralentir', world: 'grass', backdrop: 'grass', music: 'wild',
    input: WILD, me: ['036', 30, ['averse', 'flammeche']], foe: { name: L('Grognours', 'Grognours'), party: [['008', 28]] },
    want: weatherOn('pluie') },
  { id: 'sable', label: 'Tempête de sable', hint: 'Le sable souffle par-dessus le combat', world: 'grass', backdrop: 'grass', music: 'wild',
    input: WILD, me: ['021', 30, ['tempete-de-sable', 'flammeche']], foe: { name: L('Grognours', 'Grognours'), party: [['008', 28]] },
    want: weatherOn('sable') },
  { id: 'grele', label: 'Grêle', hint: 'Les grêlons tombent en deux couches', world: 'grass', backdrop: 'grass', music: 'wild',
    input: WILD, me: ['012', 30, ['grele', 'flammeche']], foe: { name: L('Grognours', 'Grognours'), party: [['008', 28]] },
    want: weatherOn('grele') },
  { id: 'sombre', label: 'Rire sinistre', hint: 'La scène s’assombrit (hachures dessinées une seule fois)', world: 'grass', backdrop: 'grass', music: 'wild',
    input: WILD, me: ['021', 30, ['rire-sinistre', 'flammeche']], foe: { name: L('Grognours', 'Grognours'), party: [['008', 28]] },
    want: used('rire-sinistre') },
];

startBattleDemo({
  eyebrow: 'Atelier Bestioles · démo 11',
  title: 'Combats plus légers',
  intro: 'Les combats demandent moins de travail au téléphone : la pluie, le sable et la grêle glissent sans être redessinés, les attaques qui assombrissent la scène la hachurent une seule fois, et le halo blanc des Bestioles est plus léger. Le rendu reste le même. Lance chaque scène : la première attaque part toute seule, ensuite joue librement.',
}, SCENES);
