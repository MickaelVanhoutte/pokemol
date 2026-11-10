/**
 * Demo page for the owner (roadmap, milestone 7): moves that change the field. Pins on the foe's ground, a screen,
 * a hit-and-switch, a roar that drags another Bestiole out, and a taunt. Built by `npm run demo -- m12`.
 */
import { L } from '../../src/i18n';
import type { BattleEvent } from '../../src/engine/pk/battle';
import { LOOKS } from '../../src/overworld/sprites';
import { startBattleDemo, type Scene } from './battleDemo';

const has = (t: BattleEvent['t']) => (ev: BattleEvent[]) => ev.some((e) => e.t === t);
const TRAINER = { kind: 'trainer', music: 'trainer' } as const;
const FOE = { name: L('Peintre Juliette', 'Painter Juliette'), look: LOOKS.girl, party: [['008', 30], ['001', 30], ['013', 30]] as [string, number][] };

const SCENES: Scene[] = [
  { id: 'epingles', label: 'Épingles', hint: 'Des épingles sous ses pattes : chaque Bestiole qu’elle envoie se pique', world: 'grass', backdrop: 'grass', music: 'trainer',
    input: TRAINER, me: ['090', 34, ['epingles', 'dard', 'grondement']], foe: FOE, want: has('hazard') },
  { id: 'vitrail', label: 'Vitrail', hint: 'Les attaques spéciales font moitié moins mal pendant 5 tours', world: 'grass', backdrop: 'grass', music: 'trainer',
    input: TRAINER, me: ['028', 36, ['vitrail', 'eclat-de-lune', 'grondement']], foe: FOE, want: has('screen') },
  { id: 'demi-tour', label: 'Demi-Tour Crayonné', hint: 'Il frappe, puis revient : choisis qui prend sa place', world: 'grass', backdrop: 'grass', music: 'trainer',
    input: TRAINER, me: ['007', 32, ['demi-tour', 'grondement']], mates: [['021', 30]], foe: FOE, want: has('pivot') },
  { id: 'grand-cri', label: 'Grand Cri', hint: 'Si fort que la Bestiole d’en face rentre, et qu’une autre sort', world: 'grass', backdrop: 'grass', music: 'trainer',
    input: TRAINER, me: ['008', 36, ['grand-cri', 'griffe']], foe: FOE, want: has('dragged') },
  { id: 'moqueur', label: 'Gribouillis Moqueur', hint: 'Narguée, elle ne pense plus qu’à attaquer pendant 3 tours', world: 'grass', backdrop: 'grass', music: 'trainer',
    input: TRAINER, me: ['055', 32, ['gribouillis-moqueur', 'mordillage']], foe: FOE, want: has('taunted') },
];

startBattleDemo({
  eyebrow: 'Atelier Bestioles · démo 18',
  title: 'Des attaques qui changent le terrain',
  intro: 'Cinq nouvelles attaques, apprises par quelques Bestioles vers le niveau 30 et utilisées par les dresseurs qui réfléchissent : des épingles sur le terrain adverse, un vitrail qui protège, un demi-tour pour changer de Bestiole en frappant, un grand cri qui fait rentrer l’adversaire, et un gribouillis qui le provoque. Lance chaque scène : la première attaque part toute seule, ensuite joue librement.',
}, SCENES);
