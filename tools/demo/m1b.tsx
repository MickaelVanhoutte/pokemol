/**
 * Demo page for the owner (M1b): the battle camera, the freeze-frame on big hits, the final KO, the
 * trainers stepping out and throwing their Croque-Carnet. Built by `npm run demo -- m1b`.
 */
import { L } from '../../src/i18n';
import { LOOKS } from '../../src/overworld/sprites';
import { finalBlow, foeFaints, myHit, startBattleDemo, type Scene } from './battleDemo';

const SCENES: Scene[] = [
  { id: 'envoi', label: 'Le dresseur lance', hint: 'Sortie du dresseur, Croque-Carnets lancés', world: 'grass', backdrop: 'grass', music: 'trainer',
    input: { kind: 'trainer', music: 'trainer', trainerId: 'leo' }, me: ['021', 22, ['flammeche']],
    foe: { name: L('Gamin Léo', 'Kid Leo'), party: [['012', 12], ['006', 12]], look: LOOKS.kid, quote: 'Trop fort…' },
    want: (ev) => myHit(ev).some((d) => !d.crit) && !foeFaints(ev) },
  { id: 'normal', label: 'Coup normal', hint: 'La caméra suit l’attaque', world: 'grass', backdrop: 'grass', music: 'wild',
    input: { kind: 'wild', ground: 'tallgrass' }, me: ['021', 22, ['flammeche']], foe: { name: L('Grognours', 'Grognours'), party: [['008', 16]] },
    want: (ev) => myHit(ev).some((d) => !d.crit && (d.eff ?? 1) === 1) && !foeFaints(ev) },
  { id: 'critique', label: 'Coup critique', hint: 'Arrêt sur image, éclair blanc', world: 'grass', backdrop: 'grass', music: 'wild',
    input: { kind: 'wild', ground: 'tallgrass' }, me: ['021', 22, ['flammeche']], foe: { name: L('Grognours', 'Grognours'), party: [['008', 16]] },
    want: (ev) => myHit(ev).some((d) => d.crit) && !foeFaints(ev) },
  { id: 'efficace', label: 'Super efficace', hint: 'Zoom plus fort, petit arrêt', world: 'grass', backdrop: 'grass', music: 'wild',
    input: { kind: 'wild', ground: 'tallgrass' }, me: ['021', 22, ['flammeche']], foe: { name: L('Minousse', 'Minousse'), party: [['001', 18]] },
    want: (ev) => myHit(ev).some((d) => !d.crit && (d.eff ?? 1) > 1) && !foeFaints(ev) },
  { id: 'ko', label: 'K.O. final', hint: 'Dernière Bestiole d’un Maître', world: 'atelier', backdrop: 'grass', music: 'leader',
    input: { kind: 'trainer', music: 'leader', badge: 'pastel', trainerId: 'mireille' }, me: ['021', 34, ['flammeche']],
    foe: { name: L('Maître d’Atelier Mireille', 'Atelier Master Mireille'), party: [['007', 9]], look: LOOKS.leaderPastel, quote: 'Bravo, tu le mérites !' },
    want: finalBlow },
];

startBattleDemo({
  eyebrow: 'Atelier Bestioles · démo 2',
  title: 'Caméra de combat',
  intro: 'Chaque scène est un vrai combat, réglé pour que la première attaque fasse ce qu’elle montre : la caméra qui suit, l’arrêt sur image d’un coup critique, le K.O. final d’un Maître. La première attaque part toute seule ; ensuite, joue ou touche « Retour ».',
}, SCENES);
