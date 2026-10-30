import { L, type LText } from '../i18n';
import { BADGES } from '../data/badges';
import { DEX_GOAL, dexCount } from '../data/creatures';
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
  // the Colour Guides come by themselves (src/story/guides.ts): these only show if a game missed one, until the next badge
  step('ciseaux', 'ville', L('Pistache, le guide vert, t’attend à Ville-Pastel.', 'Pistachio, the green guide, waits in Pastel City.'), ['gift:ciseaux'], (s) => on(s, 'badge:plume')),
  step('bois', 'bois', L('Chasse la Team Gomme du Bois Brumeux.', 'Chase Team Gomme out of the Misty Woods.'), ['a1.bois']),
  step('plume', 'plume', L('Bats Gaspard à l’Atelier de Village-Plume.', 'Beat Gaspard at the Featherby Atelier.'), ['badge:plume']),
  step('grotte', 'grotte1', L('Traverse la Grotte Gribouillis, à l’est.', 'Cross Scribble Cave, east of Pastel City.'), ['visit:port'], (s) => on(s, 'badge:aquarelle')),
  step('aquarelle', 'port', L('Bats Marine à l’Atelier de Port-Aquarelle.', 'Beat Marine at the Port Aquarelle Atelier.'), ['badge:aquarelle']),
  // the Lac des Couleurs, between the third and fourth badges (src/story/lac.ts)
  step('bateau', 'port', L('Azur, le guide bleu, t’attend au Port.', 'Azure, the blue guide, waits for you at the Port.'), ['gift:bateau'], (s) => on(s, 'lac.arrivee')),
  step('lac', 'plume', L('Remonte en bateau la rivière de Village-Plume.', 'Sail up the river from Featherby.'), ['lac.arrivee']),
  {
    ...step('sources', 'lac', L('Libère les trois sources du Lac des Couleurs ({n}/3).', 'Free the three springs of the Lake of Colours ({n}/3).'), ['lac.sources']),
    vars: (s) => ({ n: ['rouge', 'jaune', 'bleue'].filter((c) => on(s, `lac.source:${c}`)).length }),
  },
  step('rivalLac', 'lac', L('{rival} t’attend au camp du lac.', '{rival} is waiting at the lake camp.'), ['tr:rivalLac']),
  step('bocal', 'lac', L('Retourne voir le Prof. Fusain au camp du lac.', 'Go back to Prof. Charcoal at the lake camp.'), ['gift:bocal']),
  step('entrepot', 'entrepot1', L('Libère Zélie dans l’Entrepôt Gomme.', 'Free Zelie from the Eraser Warehouse.'), ['a2.feutre']),
  step('velo', 'feutre', L('Coquelicot, le guide rouge, t’attend à Ville-Feutre.', 'Poppy, the red guide, waits for you in Felt City.'), ['gift:velo'], (s) => on(s, 'badge:fluo')),
  step('fluo', 'feutre', L('Bats Zélie à l’Atelier de Ville-Feutre.', 'Beat Zelie at the Felt City Atelier.'), ['badge:fluo']),
  step('mont', 'montFusain1', L('Grimpe le Mont Fusain jusqu’à Village-Braise.', 'Climb Mount Charcoal to Embervale.'), ['visit:braise'], (s) => on(s, 'badge:braise')),
  step('braise', 'braise', L('Bats Ambre à l’Atelier de Village-Braise.', 'Beat Amber at the Embervale Atelier.'), ['badge:braise']),
  step('gants', 'braise', L('Clémentine, la guide orange, t’attend à Village-Braise.', 'Clementine, the orange guide, waits in Embervale.'), ['gift:gants'], (s) => on(s, 'badge:paillette')),
  step('paillette', 'paillette', L('Bats Célestine à l’Atelier de Bourg-Paillette.', 'Beat Celestine at the Glimmerton Atelier.'), ['badge:paillette']),
  step('tour', 'tour1', L('Chasse la Team Gomme de la Tour Brumeuse.', 'Drive Team Gomme out of the Misty Tower.'), ['a3.tour']),
  step('gouache', 'gouache', L('Bats Basile à l’Atelier du Jardin-Gouache.', 'Beat Basil at the Gouache Garden Atelier.'), ['badge:gouache']),
  step('encreNote', 'encre', L('Va à la Cité-Encre, au nord du Jardin-Gouache.', 'Go to Ink City, north of Gouache Garden.'), ['a3.note'], (s) => on(s, 'a3.note') || on(s, 'badge:encre')),
  step('phare', 'phareIle', L('Rejoins Nocturne au phare (passeur du Port).', 'Join Nocturne at the lighthouse (ferry at Port).'), ['a3.phare'], (s) => on(s, 'a3.phare') || on(s, 'badge:encre')),
  step('encre', 'encre', L('Bats Nocturne à l’Atelier de la Cité-Encre.', 'Beat Nocturne at the Ink City Atelier.'), ['badge:encre']),
  step('usine', 'usine1', L('Entre dans l’Usine à Gommes de la Cité-Encre.', 'Storm the Eraser Factory in Ink City.'), ['a3.usine']),
  step('marge', 'route9', L('Passe la Marge, à l’ouest de la Cité-Encre.', 'Cross the Margin, west of Ink City.'), ['a4.marge']),
  step('forteresse', 'forteresse1', L('Arrête la Gomme Géante de la Forteresse Gomme.', 'Stop the Giant Eraser in the Eraser Fortress.'), ['a4.machine']),
  step('rival', 'routeBlanche', L('{rival} t’attend sur la Route Blanche.', '{rival} is waiting on the Blank Road.'), ['tr:rivalFinal']),
  step('effaceur', 'bordPage', L('Arrête le Grand Effaceur au Bord de la Page.', 'Stop the Great Eraser at the Edge of the Page.'), ['tr:effaceur'], (s) => on(s, 'ending')),
];

/** After the ending: what is left to do. */
export const POST: Objective[] = [
  step('concours', 'galerie', L('Remporte le Grand Concours, après le Bord de la Page.', 'Win the Grand Contest past the Edge of the Page.'), ['champion']),
  {
    ...step('dex', 'bourg', L('Complète ton Bestiodex ({c}/{t}).', 'Complete your Critterdex ({c}/{t}).'), [], (s) => dexCount(s.dex.caught) >= DEX_GOAL || on(s, 'ilePage')),
    vars: (s) => ({ c: dexCount(s.dex.caught), t: DEX_GOAL }),
  },
  {
    ...step('perles', 'lac', L('Retrouve les sept Perles-souvenirs ({p}/7).', 'Find the seven memory pearls ({p}/7).'), ['legende']),
    vars: (s) => ({ p: ['rouge', 'orange', 'jaune', 'verte', 'bleue', 'indigo', 'violette'].filter((c) => on(s, `perle:${c}`)).length }),
  },
  step('dexDiploma', 'bourg', L('Montre ton Bestiodex au Prof. Fusain.', 'Show your Critterdex to Prof. Charcoal.'), ['ilePage']),
  step('ilePage', 'port', L('Le passeur du Port connaît une île cachée.', 'The Port’s ferryman knows a hidden island.'), ['ile:visite']),
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
