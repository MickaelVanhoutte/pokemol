import { L } from '../../i18n';
import type { TrainerDef } from '../trainers';

/** The trainers of the Atelier Fluo (Ville-Feutre) besides its Master (TRAINERS, src/data/trainers.ts, merges them). */
export const TEAMS: TrainerDef[] = [
  {
    id: 'fluoT3', name: L('Graffeuse Lou', 'Graffiti Artist Lou'), party: [{ species: '092', level: 21 }, { species: '004', level: 22 }], money: 580,
    before: [L('Je tague les murs de l’Atelier au feutre fluo. Zélie est d’accord, promis ! Enfin… je crois.', 'I tag the Atelier’s walls in neon marker. Zelie said it’s fine, promise! Well… I think.')],
    after: [L('Mon tag est raté… Je le repasse en plus gros.', 'My tag’s ruined… I’ll go over it bigger.')],
  },
  {
    id: 'fluoT4', name: L('Néoniste Hector', 'Neon-sign Maker Hector'), party: [{ species: '078', level: 21 }, { species: '035', level: 22 }, { species: '082', level: 22 }], money: 620,
    before: [L('C’est moi qui ai branché les lumières de la scène. Avant d’éblouir Zélie, il faudra m’éblouir moi !', 'I wired up the stage lights. Before you dazzle Zelie, you’ll have to dazzle me!')],
    after: [L('Plus de courant… Quelqu’un a une pile ?', 'Out of power… Anyone got a battery?')],
  },
];
