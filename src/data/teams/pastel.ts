import { L } from '../../i18n';
import type { TrainerDef } from '../trainers';

/** The trainers of the Atelier Pastel (Ville-Pastel) besides its Master (TRAINERS, src/data/trainers.ts, merges them). */
export const TEAMS: TrainerDef[] = [
  {
    id: 'pastelT3', name: L('Apprenti Sacha', 'Apprentice Sacha'), party: [{ species: '091', level: 5 }, { species: '089', level: 6 }], money: 240,
    before: [L('Chut ! Mon Lumiver faisait la sieste… Trop tard, tu l’as réveillé !', 'Shh! My Glowgrub was napping… Too late, you woke it up!')],
    after: [L('Il est retourné se coucher. Moi aussi, tiens.', 'It went back to bed. Me too, actually.')],
  },
  {
    id: 'pastelT4', name: L('Pastelliste Agathe', 'Pastel Artist Agatha'), party: [{ species: '089', level: 6 }, { species: '015', level: 7 }], money: 280,
    before: [L('Mireille est juste derrière moi. Mais d’abord, montre-moi tes couleurs !', 'Mireille is right behind me. But first, show me your colours!')],
    after: [L('Tes couleurs sont plus vives que les miennes…', 'Your colours are brighter than mine…')],
  },
];
