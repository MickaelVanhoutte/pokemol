/**
 * Demo page for the owner (roadmap, milestone 3): the rival remembers. His finale team follows what the player told
 * him at the Misty Tower, and after the story he waits on Masterpiece Square for a weekly rematch. Built by
 * `npm run demo -- m9`.
 */
import { L } from '../../src/i18n';
import { LOOKS } from '../../src/overworld/sprites';
import { startBattleDemo, type Scene } from './battleDemo';

const RIVAL = L('Feutre', 'Marker');
const INPUT = { kind: 'trainer', music: 'rival', trainerId: 'rivalPost' } as const;
const ME: Scene['me'] = ['025', 58, ['griffe-dragon', 'grand-brasier', 'tempete-de-plumes', 'grand-vol']];

const SCENES: Scene[] = [
  { id: 'genial', label: '« T’es génial comme t’es »', hint: 'Il garde sa première Bestiole telle quelle, pailletée et fière : « Mon Trait »', world: 'grass', backdrop: 'city', music: 'rival',
    input: INPUT, me: ME,
    foe: { name: RIVAL, look: LOOKS.rival, party: [['036', 55], ['008', 55], ['050', 55], ['007', 55], ['027', 55], ['024', 62]], ace: { shiny: true, nickname: 'Mon Trait' },
      brain: { smart: true, switches: 1, items: [{ id: 'super-potion', n: 2 }] } },
    want: () => true },
  { id: 'entraine', label: '« Entraîne-toi ! »', hint: 'Il s’est entraîné : deux Bestioles plus fortes, avec un objet', world: 'grass', backdrop: 'city', music: 'rival',
    input: INPUT, me: ME,
    foe: { name: RIVAL, look: LOOKS.rival, party: [['036', 55], ['008', 55], ['053', 55], ['007', 56], ['027', 56], ['025', 56]],
      brain: { smart: true, switches: 1, items: [{ id: 'super-potion', n: 2 }] } },
    want: () => true },
];

startBattleDemo({
  eyebrow: 'Atelier Bestioles · démo 15',
  title: 'Ton rival se souvient',
  intro: 'Ce que tu dis à ton rival à la Tour Brumeuse change son équipe jusqu’au dernier combat. Et après l’histoire, une fois le Grand Concours gagné, il t’attend sur la Place des Chefs-d’Œuvre : une revanche par semaine, juste pour le plaisir, avec une équipe qui grandit à chaque fois. Ici, une seule Bestiole contre six, pour voir ses deux équipes.',
}, SCENES);
