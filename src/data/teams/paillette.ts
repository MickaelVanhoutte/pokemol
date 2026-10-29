import { L } from '../../i18n';
import type { TrainerDef } from '../trainers';

/** The trainers of the Atelier Paillette (Bourg-Paillette) besides its Master (TRAINERS, src/data/trainers.ts, merges them). */
export const TEAMS: TrainerDef[] = [
  {
    id: 'paillT3', name: L('Rêveuse Ninon', 'Daydreamer Ninon'), party: [{ species: '006', level: 24 }, { species: '084', level: 24 }, { species: '005', level: 25 }], money: 700,
    before: [L('Je glisse, je glisse… et je fais un vœu à chaque fois que je tombe. Mon vœu du jour : te battre !', 'I slide and slide… and I make a wish every time I fall over. Today’s wish: beating you!')],
    after: [L('Raté… Il faut croire que je n’étais pas assez tombée aujourd’hui.', 'Missed… I guess I didn’t fall over enough today.')],
  },
  {
    id: 'paillT4', name: L('Astronome Gaspard', 'Stargazer Gaspard'), party: [{ species: '005', level: 25 }, { species: '006', level: 25 }, { species: '028', level: 26 }], money: 760,
    before: [L('Tu es {g:arrivée|arrivé} jusqu’ici sans tomber ? Alors tu es une étoile filante. Voyons combien de temps tu brilles !', 'You got all the way here without falling? Then you’re a shooting star. Let’s see how long you shine!')],
    after: [L('Tu brilles encore plus fort que prévu…', 'You shine even brighter than I calculated…')],
  },
];
