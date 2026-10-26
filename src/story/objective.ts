import { L, type LText } from '../i18n';
import { BADGES } from '../data/badges';
import { CREATURES } from '../data/creatures';
import { TRAINERS } from '../data/trainers';
import { townOfTrainer } from '../data/worldmap';
import type { SaveData } from '../save/schema';

/** One thing to do next, shown on the Town Map with a mark on its place. */
export interface Objective {
  id: string;
  /** Flags `done` waits for (all of them), listed so tests can check the story sets them. */
  flags: string[];
  done: (s: SaveData) => boolean;
  /** Place marked on the Town Map (a WORLD key). */
  target: string;
  text: LText;
  vars?: (s: SaveData) => Record<string, number>;
}

const on = (s: SaveData, f: string) => !!s.flags[f];

/** Done when every flag is set, or when `also` sees the progress made another way. */
function step(id: string, target: string, text: LText, flags: string[], also?: (s: SaveData) => boolean): Objective {
  return { id, target, text, flags, done: (s) => (flags.length > 0 && flags.every((f) => on(s, f))) || !!also?.(s) };
}

const pagesFound = (s: SaveData) => Object.keys(s.bag).filter((k) => k.startsWith('page-') && s.bag[k] > 0).length;
export const leaderOf = (badge: string) => Object.values(TRAINERS).find((t) => t.badge === badge)!;

/** The main story, in order. */
export const MAIN: Objective[] = [
  step('mom', 'bourg', L('Parle à Maman, en bas de la maison.', 'Talk to Mom, downstairs.'), ['intro']),
  // the app may close during the lab battle: the starter is given before rival1 is set
  step('starter', 'bourg', L('Choisis ta Bestiole au labo du Prof. Fusain.', 'Pick a Critter at Prof. Charcoal’s lab.'), ['rival1'], (s) => s.party.length > 0),
  step('pastel', 'ville', L('Bats Mireille à l’Atelier de Ville-Pastel.', 'Beat Mireille at the Pastel City Atelier.'), ['badge:pastel']),
  step('bois', 'bois', L('Chasse la Team Gomme du Bois Brumeux.', 'Chase Team Gomme out of the Misty Woods.'), ['a1.bois']),
  step('plume', 'plume', L('Bats Gaspard à l’Atelier de Village-Plume.', 'Beat Gaspard at the Featherby Atelier.'), ['badge:plume']),
  step('grotte', 'grotte1', L('Traverse la Grotte Gribouillis, à l’est.', 'Cross Scribble Cave, east of Pastel City.'), ['visit:port'], (s) => on(s, 'badge:aquarelle')),
  step('aquarelle', 'port', L('Bats Marine à l’Atelier de Port-Aquarelle.', 'Beat Marine at the Port Aquarelle Atelier.'), ['badge:aquarelle']),
  step('entrepot', 'entrepot1', L('Libère Zélie dans l’Entrepôt Gomme.', 'Free Zelie from the Eraser Warehouse.'), ['a2.feutre']),
  step('fluo', 'feutre', L('Bats Zélie à l’Atelier de Ville-Feutre.', 'Beat Zelie at the Felt City Atelier.'), ['badge:fluo']),
  step('mont', 'montFusain1', L('Grimpe le Mont Fusain jusqu’à Village-Braise.', 'Climb Mount Charcoal to Embervale.'), ['visit:braise'], (s) => on(s, 'badge:braise')),
  step('braise', 'braise', L('Bats Ambre à l’Atelier de Village-Braise.', 'Beat Amber at the Embervale Atelier.'), ['badge:braise']),
  step('paillette', 'paillette', L('Bats Célestine à l’Atelier de Bourg-Paillette.', 'Beat Celestine at the Glimmerton Atelier.'), ['badge:paillette']),
  step('tour', 'tour1', L('Chasse la Team Gomme de la Tour Brumeuse.', 'Drive Team Gomme out of the Misty Tower.'), ['a3.tour']),
  step('gouache', 'gouache', L('Bats Basile à l’Atelier du Jardin-Gouache.', 'Beat Basil at the Gouache Garden Atelier.'), ['badge:gouache']),
  step('encre', 'encre', L('Bats Nocturne à l’Atelier de la Cité-Encre.', 'Beat Nocturne at the Ink City Atelier.'), ['badge:encre']),
  step('usine', 'usine1', L('Entre dans l’Usine à Gommes de la Cité-Encre.', 'Storm the Eraser Factory in Ink City.'), ['a3.usine']),
  step('rival', 'routeBlanche', L('{rival} t’attend sur la Route Blanche.', '{rival} is waiting on the Blank Road.'), ['tr:rivalFinal']),
  step('effaceur', 'bordPage', L('Arrête le Grand Effaceur au Bord de la Page.', 'Stop the Great Eraser at the Edge of the Page.'), ['tr:effaceur'], (s) => on(s, 'ending')),
];

/** After the ending: what is left to do. */
export const POST: Objective[] = [
  step('concours', 'galerie', L('Remporte le Grand Concours, après le Bord de la Page.', 'Win the Grand Contest past the Edge of the Page.'), ['champion']),
  {
    ...step('dex', 'bourg', L('Complète ton Bestiodex ({c}/{t}).', 'Complete your Critterdex ({c}/{t}).'), [], (s) => s.dex.caught.length >= CREATURES.length || on(s, 'dexDiploma')),
    vars: (s) => ({ c: s.dex.caught.length, t: CREATURES.length }),
  },
  step('dexDiploma', 'bourg', L('Montre ton Bestiodex au Prof. Fusain.', 'Show your Critterdex to Prof. Charcoal.'), ['dexDiploma']),
  {
    ...step('pages', 'bourg', L('Rapporte les pages déchirées au Prof. ({p}/12).', 'Bring the torn pages to the Prof. ({p}/12).'), ['pagesReward']),
    vars: (s) => ({ p: pagesFound(s) }),
  },
  ...BADGES.map((b) => {
    const t = leaderOf(b.id);
    return step(`rematch:${t.id}`, townOfTrainer(t.id)!, L(`Revanche : ${b.leader.fr} t’attend à son Atelier !`, `Rematch: ${b.leader.en} awaits at the Atelier!`), [`rematch:${t.id}`]);
  }),
];

export const OBJECTIVES: Objective[] = [...MAIN, ...POST];

/** The first thing not done yet (null once everything is done). */
export const currentObjective = (s: SaveData): Objective | null => OBJECTIVES.find((o) => !o.done(s)) ?? null;
