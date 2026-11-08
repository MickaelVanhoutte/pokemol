/**
 * Demo page for the owner (M1c): HP running down with its bar, a low bar blinking, the level-up window,
 * the prize money counting up. Built by `npm run demo -- m1c`.
 */
import { L } from '../../src/i18n';
import { LOOKS } from '../../src/overworld/sprites';
import { maxHp } from '../../src/engine/pk/creature';
import { finalBlow, foeFaints, myHit, startBattleDemo, type Scene } from './battleDemo';

const SCENES: Scene[] = [
  { id: 'pv', label: 'PV qui défilent', hint: 'Le nombre suit la barre', world: 'grass', backdrop: 'grass', music: 'wild',
    input: { kind: 'wild', ground: 'tallgrass' }, me: ['021', 22, ['flammeche']], foe: { name: L('Grognours', 'Grognours'), party: [['008', 18]] },
    want: (ev) => myHit(ev).some((d) => !d.crit) && !foeFaints(ev) && ev.some((e) => e.t === 'damage' && e.side === 0) },
  { id: 'pvbas', label: 'PV bas', hint: 'La barre clignote, un petit bip', world: 'grass', backdrop: 'grass', music: 'wild',
    input: { kind: 'wild', ground: 'tallgrass' }, me: ['021', 22, ['flammeche']], meHp: 0.32,
    foe: { name: L('Grognours', 'Grognours'), party: [['008', 24]], moves: ['mordillage'] },
    want: (ev, after) => {
      const me = after.sides[0].party[0];
      return !foeFaints(ev) && me.hp > 0 && me.hp <= maxHp(me) * 0.2;
    } },
  { id: 'niveau', label: 'Montée de niveau', hint: 'Anneaux dorés, fenêtre des stats', world: 'grass', backdrop: 'grass', music: 'wild',
    input: { kind: 'wild', ground: 'tallgrass' }, me: ['021', 18, ['flammeche']], xpShort: true,
    foe: { name: L('Gloutillon', 'Gloutillon'), party: [['012', 9]] }, want: finalBlow },
  { id: 'victoire', label: 'Victoire contre un dresseur', hint: 'Niveau, puis l’argent qui compte', world: 'grass', backdrop: 'grass', music: 'trainer',
    input: { kind: 'trainer', music: 'trainer', trainerId: 'leo' }, me: ['021', 18, ['flammeche']], xpShort: true, money: 640,
    foe: { name: L('Gamin Léo', 'Kid Leo'), party: [['012', 9]], look: LOOKS.kid, quote: 'Trop fort…' }, want: finalBlow },
];

startBattleDemo({
  eyebrow: 'Atelier Bestioles · démo 3',
  title: 'Les chiffres du combat',
  intro: 'Chaque scène est un vrai combat, réglé pour montrer un effet : les PV qui défilent avec la barre, la barre qui clignote quand ta Bestiole est en danger, la fenêtre de montée de niveau, l’argent qui compte après une victoire. La première attaque part toute seule ; ensuite, joue ou touche « Retour ».',
}, SCENES);
