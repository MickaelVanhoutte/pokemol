/**
 * Demo page for the owner (roadmap, milestone 1): trainers who think. Bosses and later trainers estimate what
 * each move would do, finish a Bestiole they can knock out first, drink a potion when the next hit would knock
 * theirs out, and after the story switch out of a hopeless matchup. Built by `npm run demo -- m7`.
 */
import { L } from '../../src/i18n';
import type { BattleEvent } from '../../src/engine/pk/battle';
import { LOOKS } from '../../src/overworld/sprites';
import { startBattleDemo, type Scene } from './battleDemo';

const potion = (ev: BattleEvent[]) => ev.some((e) => e.t === 'useItem' && e.side === 1);
const switched = (ev: BattleEvent[]) => ev.some((e) => e.t === 'sendOut' && e.side === 1 && e.idx === 1);

const MARINE = L('Maître d’Atelier Marine', 'Atelier Master Marine');
const ATELIER = { kind: 'trainer', music: 'leader', trainerId: 'marine', badge: 'aquarelle' } as const;

const SCENES: Scene[] = [
  { id: 'potion', label: 'Une potion au bon moment', hint: 'Le prochain coup l’aurait mise K.O. : elle boit une Super Potion', world: 'atelier', backdrop: 'beach', music: 'leader',
    input: ATELIER, me: ['021', 30, ['flammeche', 'griffe']],
    foe: { name: MARINE, look: LOOKS.leaderAqua, party: [['008', 30], ['022', 30]], hp: 0.3, brain: { smart: true, items: [{ id: 'super-potion', n: 1 }] } },
    want: potion },
  { id: 'switch', label: 'Elle change de Bestiole', hint: 'Sa Minousse ne peut rien contre ton feu : elle rappelle et envoie Clapoflot', world: 'atelier', backdrop: 'beach', music: 'leader',
    input: ATELIER, me: ['021', 34, ['flammeche', 'griffe']],
    foe: { name: MARINE, look: LOOKS.leaderAqua, party: [['001', 18], ['022', 34]], brain: { smart: true, switches: 1 } },
    want: switched },
  { id: 'libre', label: 'Combat libre', hint: 'Une Maîtresse qui réfléchit, avec une potion : à toi de jouer', world: 'atelier', backdrop: 'beach', music: 'leader',
    input: ATELIER, me: ['021', 32, ['flammeche', 'griffe', 'grondement']],
    foe: { name: MARINE, look: LOOKS.leaderAqua, party: [['008', 29], ['022', 30]], brain: { smart: true, items: [{ id: 'super-potion', n: 1 }] } },
    want: () => true },
];

startBattleDemo({
  eyebrow: 'Atelier Bestioles · démo 13',
  title: 'Des dresseurs qui réfléchissent',
  intro: 'Les Maîtres d’Atelier, les admins de la Team Gomme, ton rival et les dresseurs de la fin du voyage réfléchissent maintenant : ils visent le coup qui met K.O., gardent leurs attaques de soutien pour quand ils ont le temps, et boivent une potion quand le prochain coup les sortirait. Après l’histoire (et en Difficile), ils changent aussi de Bestiole face à un combat perdu d’avance. En Facile, rien ne change. Lance chaque scène : la première action part toute seule, ensuite joue librement.',
}, SCENES);
