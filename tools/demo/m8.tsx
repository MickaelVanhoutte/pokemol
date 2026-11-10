/**
 * Demo page for the owner (roadmap, milestone 2): a post-game that grows with you. Atelier Masters accept a
 * rematch every day with six fully grown Bestioles at your team's level, two levels more after each win; the Grand
 * Concours comes back stronger after each victory, with a sixth Bestiole and other teams. Built by
 * `npm run demo -- m8`.
 */
import { L } from '../../src/i18n';
import { LOOKS } from '../../src/overworld/sprites';
import { startBattleDemo, type Scene } from './battleDemo';

const SCENES: Scene[] = [
  { id: 'mireille', label: 'Revanche de Mireille', hint: 'Six Bestioles adultes, à ton niveau : elle revient chaque jour, plus forte', world: 'atelier', backdrop: 'forest', music: 'leader',
    input: { kind: 'trainer', music: 'leader', trainerId: 'mireille:rematch', badge: 'pastel' }, me: ['025', 50, ['griffe-dragon', 'grand-brasier', 'tempete-de-plumes', 'grand-vol']],
    foe: { name: L('Maître d’Atelier Mireille', 'Atelier Master Mireille'), look: LOOKS.leaderPastel, party: [['092', 43], ['090', 44], ['048', 43], ['038', 44], ['104', 43], ['007', 46]], brain: { smart: true, switches: 1 } },
    want: () => true },
  { id: 'marine', label: 'Concours : 4e visite', hint: 'Après trois victoires, Marine revient avec une autre équipe de six', world: 'atelier', backdrop: 'city', music: 'leader',
    input: { kind: 'trainer', music: 'leader', trainerId: 'gcMarine', badge: 'aquarelle' }, me: ['024', 66, ['cri-de-karate', 'fresque-furieuse', 'rayon-de-soleil', 'poudre-toxique']],
    foe: { name: L('Grande Maîtresse Marine', 'Grand Master Marine'), look: LOOKS.leaderAqua, party: [['100', 59], ['060', 59], ['017', 60], ['042', 59], ['070', 59], ['023', 61]], brain: { smart: true, switches: 1, items: [{ id: 'super-potion', n: 2 }] } },
    want: () => true },
];

startBattleDemo({
  eyebrow: 'Atelier Bestioles · démo 14',
  title: 'Un après-histoire qui grandit',
  intro: 'Après l’histoire, les Maîtres d’Atelier acceptent une revanche chaque jour, avec six Bestioles adultes de leur type, à ton niveau, et deux niveaux de plus à chaque victoire. Le Grand Concours revient aussi plus fort après chaque victoire : une sixième Bestiole, puis d’autres équipes, et le Professeur finit par redessiner ta propre équipe du Panthéon. Ici, une seule Bestiole contre six : c’est pour voir les équipes, pas pour gagner.',
}, SCENES);
