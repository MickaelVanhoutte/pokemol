import { L } from '../../i18n';
import type { TrainerDef } from '../trainers';

/** The trainers of the Atelier Gouache (Jardin-Gouache) besides its Master (TRAINERS, src/data/trainers.ts, merges them). */
export const TEAMS: TrainerDef[] = [
  {
    id: 'gouaT3', name: L('Fleuriste Lilas', 'Florist Lilac'), party: [{ species: '063', level: 26 }, { species: '020', level: 27 }], money: 780,
    before: [L('Chut ! Mes fleurs font la sieste. Si tu les réveilles, gare aux pétales !', 'Shh! My flowers are napping. Wake them up, and watch out for petals!')],
    after: [L('Mes fleurs se sont rendormies… sur leurs lauriers.', 'My flowers went back to sleep… resting on their laurels.')],
  },
  {
    id: 'gouaT4', name: L('Arboriste Sylvain', 'Arborist Sylvan'), party: [{ species: '095', level: 27 }, { species: '063', level: 27 }, { species: '094', level: 28 }], money: 820,
    before: [L('Je taille la haie de Basile depuis vingt ans. Tu crois vraiment passer sans te faire tailler ?', 'I’ve trimmed Basil’s hedge for twenty years. You really think you’ll get by without a trim?')],
    after: [L('Taillé en pièces… par plus petit que moi !', 'Cut down to size… by someone smaller than me!')],
  },
];
