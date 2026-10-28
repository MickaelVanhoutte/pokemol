import { L } from '../../i18n';
import type { TrainerDef } from '../trainers';

/** The trainers of the Atelier Aquarelle (Port-Aquarelle) besides its Master (TRAINERS, src/data/trainers.ts, merges them). */
export const TEAMS: TrainerDef[] = [
  {
    id: 'aquaT3', name: L('Pêcheur Firmin', 'Fisher Firmin'), party: [{ species: '099', level: 15 }, { species: '099', level: 16 }], money: 420,
    before: [L('Je pêche dans le bassin de Marine depuis ce matin. Je n’ai attrapé que des Avrilou… Mais ce sont les meilleurs !', 'I’ve been fishing in Marine’s pool since this morning. I’ve only caught Foolfins… But they’re the best!')],
    after: [L('Mes Avrilou se moquent de moi, maintenant…', 'Now my Foolfins are laughing at me…')],
  },
  {
    id: 'aquaT4', name: L('Aquarelliste Maëlle', 'Watercolourist Maelle'), party: [{ species: '069', level: 16 }, { species: '022', level: 17 }], money: 480,
    before: [L('Chaque vague de ce bassin, c’est moi qui l’ai peinte. Tu vas te faire éclabousser !', 'I painted every wave in this pool. You’re going to get splashed!')],
    after: [L('Mes couleurs ont coulé… C’est joli quand même.', 'My colours ran… Still pretty, though.')],
  },
];
