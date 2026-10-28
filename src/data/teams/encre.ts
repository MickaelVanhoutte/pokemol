import { L } from '../../i18n';
import type { TrainerDef } from '../trainers';

/** The trainers of the Atelier Encre (Cité-Encre) besides its Master (TRAINERS, src/data/trainers.ts, merges them). */
export const TEAMS: TrainerDef[] = [
  {
    id: 'encreT3', name: L('Bibliothécaire Ernestine', 'Librarian Ernestine'), party: [{ species: '096', level: 29 }, { species: '010', level: 29 }, { species: '097', level: 30 }], money: 840,
    before: [L('Chut ! Dans la bibliothèque de Nocturne, on se bat… en silence.', 'Shh! In Nocturne’s library, we battle… quietly.')],
    after: [L('Je range mes Bestioles au rayon « perdu ».', 'I’ll shelve my Critters under “lost”.')],
  },
  {
    id: 'encreT4', name: L('Copiste Anselme', 'Scribe Anselm'), party: [{ species: '088', level: 29 }, { species: '066', level: 30 }], money: 860,
    before: [L('Je recopie les livres de Nocturne à la plume, une lettre à la fois. Toi, je vais te raturer d’un coup !', 'I copy Nocturne’s books by quill, one letter at a time. You, I’ll cross out in one stroke!')],
    after: [L('Une tache… sur ma plus belle page.', 'A blot… on my finest page.')],
  },
];
