import { ATELIER_TEAMS } from './teams';
import { L, type LText } from '../i18n';
import { createMon, MAX_LEVEL, type Mon } from '../engine/pk/creature';
import { prefs, type Difficulty } from '../state/prefs';
import { grownForm } from './creatures';
import { NEUTRAL_NATURE } from './natures';

export interface TrainerMon {
  species: string;
  level: number;
  /** Held item (berries are eaten in battle, like the GBA games' stronger trainers). */
  item?: string;
}

export interface TrainerDef {
  id: string;
  name: LText;
  party: TrainerMon[];
  money: number;
  before: LText[];
  after: LText[];
  /** Beating this trainer gives a badge (id from src/data/badges.ts). */
  badge?: string;
  /** Team Gomme: their Bestioles have lost their colours. */
  grey?: boolean;
  /** Story script run right after winning (inside the same cut-scene). */
  afterScript?: string;
  /**
   * Story flag the win unlocks. It is saved with the win itself, before any dialog, so closing the
   * app during the cut-scene can't leave a road blocked forever.
   */
  storyFlag?: string;
  /** Makes its ace a fair copy (« mise au propre ») in battle; the Great Eraser's is scribbled black. */
  fairCopy?: true | 'dark';
}

/**
 * How the difficulty option changes trainers: a level shift proportional to the level (easy always
 * takes at least 1 off),
 * fixed IVs (so battles feel the same every time) and, in battle, how often their AI picks a random
 * move instead of the best one.
 */
export const DIFFICULTY: Record<Difficulty, { levels: number; iv: number; slip: number }> = {
  easy: { levels: -0.15, iv: 6, slip: 0.35 },
  normal: { levels: 0, iv: 12, slip: 0 },
  hard: { levels: 0.1, iv: 20, slip: 0 },
};

export function trainerLevel(level: number, difficulty: Difficulty): number {
  const k = DIFFICULTY[difficulty].levels;
  const shift = k < 0 ? -Math.max(1, Math.round(-k * level)) : Math.round(k * level);
  return Math.min(MAX_LEVEL, Math.max(2, level + shift));
}

export function partyOf(list: TrainerMon[], seed: number, difficulty: Difficulty = prefs.value.difficulty): Mon[] {
  const iv = DIFFICULTY[difficulty].iv;
  const ivs = { hp: iv, atk: iv, def: iv, spa: iv, spd: iv, spe: iv };
  return list.map((t, i) => ({ ...createMon(t.species, trainerLevel(t.level, difficulty), { rng: seed + i }, ivs), item: t.item ?? null, nature: NEUTRAL_NATURE, talent: 0, shiny: false }));
}

export function trainerParty(t: TrainerDef, seed: number): Mon[] {
  return partyOf(t.party, seed);
}

const T = (t: TrainerDef) => t;

export const TRAINERS: Record<string, TrainerDef> = Object.fromEntries([
  // ---------------------------------------------------------------- Chemin des Crayons
  T({
    id: 'leo', name: L('Gamin Léo', 'Kid Leo'), party: [{ species: '012', level: 3 }, { species: '006', level: 4 }], money: 100,
    before: [L('Hé ! Tu as une Bestiole ? Moi aussi ! On se bat ?', 'Hey! You’ve got a Critter? Me too! Let’s battle!')],
    after: [L('Oh non… Ma Lunelle a dansé pour rien !', 'Oh no… My Moonbun danced for nothing!')],
  }),
  T({
    id: 'r1a', name: L('Écolière Margot', 'Schoolgirl Margot'), party: [{ species: '012', level: 3 }], money: 90,
    before: [L('La maîtresse dit qu’il faut s’entraîner tous les jours. Tu t’entraînes avec moi ?', 'My teacher says you have to practise every day. Will you practise with me?')],
    after: [L('Bon… je retourne faire mes devoirs.', 'Well… back to my homework.')],
  }),
  // the first grunt, chasing Coconfus down Route 1 (src/story/act1.ts, route1Gomme)
  T({
    id: 'r1gomme', name: L('Sbire Gomme', 'Eraser Grunt'), party: [{ species: '012', level: 3 }], money: 120, grey: true,
    before: [
      L('Ce truc ? C’est un dessin raté. Pas fini, tout embrouillé, ça dépasse de partout… Ça se gomme !', 'This thing? It’s a failed drawing. Unfinished, all muddled, going over the lines everywhere… It gets rubbed out!'),
      L('Tu veux le protéger ? Alors montre-moi ta Bestiole !', 'You want to protect it? Then show me your Critter!'),
    ],
    after: [L('Hein ?! Ma Bestiole a retrouvé ses couleurs ?', 'Huh?! My Critter got its colours back?')],
  }),
  T({
    id: 'iris', name: L('Fillette Iris', 'Lass Iris'), party: [{ species: '013', level: 4 }], money: 180,
    before: [L('J’ai dessiné ma Bestiole moi-même ! Regarde comme elle est jolie !', 'I drew my Critter myself! Look how pretty it is!')],
    after: [L('Elle est jolie ET forte, la tienne…', 'Yours is pretty AND strong…')],
  }),
  T({
    id: 'r1b', name: L('Gamin Arthur', 'Kid Arthur'), party: [{ species: '004', level: 4 }, { species: '013', level: 4 }], money: 160,
    before: [L('Ville-Pastel est juste là. Mais pour y entrer, il faut me battre ! … C’est pas vrai, mais on se bat quand même ?', 'Pastel City is right there. But to get in, you have to beat me! … Not really, but shall we battle anyway?')],
    after: [L('Va voir Mireille, à l’Atelier. Ses insectes piquent !', 'Go and see Mireille at the Atelier. Her bugs sting!')],
  }),
  // ---------------------------------------------------------------- Atelier Pastel
  T({
    id: 'pastelT1', name: L('Apprentie Lou', 'Apprentice Lou'), party: [{ species: '012', level: 5 }, { species: '089', level: 4 }], money: 210,
    before: [L('Ici on dessine des ailes, des antennes et des pattes partout !', 'Here we draw wings, antennae and legs everywhere!')],
    after: [L('Je vais redessiner mes Bestioles en plus fortes !', 'I’ll redraw my Critters stronger!')],
  }),
  T({
    id: 'pastelT2', name: L('Apprenti Malo', 'Apprentice Malo'), party: [{ species: '012', level: 6 }, { species: '091', level: 4 }], money: 240,
    before: [L('Mireille m’a appris à colorier sans dépasser. Toi, tu dépasses ?', 'Mireille taught me to colour inside the lines. Do you go over them?')],
    after: [L('Bon… j’ai un peu dépassé.', 'Well… I went a bit over the lines.')],
  }),
  T({
    id: 'mireille', name: L('Maître d’Atelier Mireille', 'Atelier Master Mireille'), money: 1200, badge: 'pastel',
    party: [{ species: '012', level: 7 }, { species: '015', level: 8 }, { species: '007', level: 8 }],
    before: [
      L('Bienvenue dans mon atelier ! Ici, chaque papillon a des couleurs qui n’existent pas encore.', 'Welcome to my atelier! Here, every butterfly has colours that don’t exist yet.'),
      L('Montre-moi si tes Bestioles sont aussi bien dessinées que les miennes !', 'Show me if your Critters are drawn as well as mine!'),
    ],
    after: [
      L('Ooh ! Tes Bestioles brillent comme du feutre tout neuf. Voici le Badge Pastel !', 'Ooh! Your Critters shine like brand-new markers. Here is the Pastel Badge!'),
      L('Dis… des gens en gris rôdent vers l’ouest, dans le Bois Brumeux. Ils effacent tout sur leur passage. Fais attention !', 'Say… people in grey are prowling to the west, in the Misty Woods. They rub out everything they pass. Be careful!'),
    ],
  }),
  // ---------------------------------------------------------------- Route des Craies
  T({
    id: 'r2b', name: L('Campeuse Anouk', 'Camper Anouk'), party: [{ species: '004', level: 7 }, { species: '015', level: 7 }], money: 280,
    before: [L('Je campe ici pour dessiner les Bestioles qui passent. Toi, tu passes… alors en garde !', 'I camp here to draw the Critters that pass by. You’re passing by… so on guard!')],
    after: [L('Je vais te dessiner, toi. En vainqueur.', 'I’ll draw you instead. As the winner.')],
  }),
  T({
    id: 'r2a', name: L('Peintre Colette', 'Painter Colette'), party: [{ species: '005', level: 7 }, { species: '062', level: 8 }], money: 300,
    before: [L('Ne marche pas sur ma peinture fraîche ! … Trop tard. Tu me dois un combat !', 'Don’t step on my wet paint! … Too late. You owe me a battle!')],
    after: [L('Tant pis, je repeindrai le chemin en rose.', 'Never mind, I’ll repaint the path pink.')],
  }),
  T({
    id: 'pierrot', name: L('Gamin Pierrot', 'Kid Pierrot'), party: [{ species: '006', level: 7 }, { species: '004', level: 7 }], money: 180,
    before: [L('Je dessine à la craie sur le trottoir. Mes Bestioles aussi !', 'I draw with chalk on the pavement. My Critters too!')],
    after: [L('La pluie va tout effacer… mais pas ta victoire.', 'The rain will wash it all away… but not your win.')],
  }),
  T({
    id: 'ninon', name: L('Fillette Ninon', 'Lass Ninon'), party: [{ species: '005', level: 8 }, { species: '013', level: 8 }], money: 200,
    before: [L('Mon Piafou chante faux, mais il se bat juste !', 'My Chirpie sings off-key, but it battles right on!')],
    after: [L('Il a chanté encore plus faux…', 'It sang even more off-key…')],
  }),
  // ---------------------------------------------------------------- Bois Brumeux
  T({
    id: 'b4', name: L('Cueilleuse Maëlle', 'Forager Maelle'), party: [{ species: '062', level: 8 }, { species: '009', level: 9 }], money: 330,
    before: [L('Chut ! Je cherche des champignons dans la brume. Tu m’as fait peur… Tu vas me le payer !', 'Shh! I’m looking for mushrooms in the mist. You scared me… You’ll pay for that!')],
    after: [L('Des gens en gris effacent les arbres, plus loin. Fais attention.', 'People in grey are rubbing out the trees further in. Be careful.')],
  }),
  T({
    id: 'b3', name: L('Scout Timothée', 'Scout Timothy'), party: [{ species: '015', level: 8 }, { species: '013', level: 9 }], money: 320,
    before: [L('Les scouts sont toujours prêts ! Prêts à quoi ? À se battre, pardi !', 'Scouts are always prepared! Prepared for what? For a battle, of course!')],
    after: [L('Je n’étais pas assez prêt.', 'I wasn’t prepared enough.')],
  }),
  T({
    id: 'luna', name: L('Médium Luna', 'Medium Luna'), party: [{ species: '009', level: 9 }, { species: '005', level: 10 }], money: 400,
    before: [L('Les esprits de la brume m’ont parlé de toi…', 'The spirits of the mist told me about you…')],
    after: [L('Les esprits n’avaient pas prévu ça.', 'The spirits didn’t see that coming.')],
  }),
  T({
    id: 'paul', name: L('Randonneur Paul', 'Hiker Paul'), party: [{ species: '006', level: 8 }, { species: '013', level: 9 }], money: 450,
    before: [L('Rien de tel qu’une bonne marche… et un bon combat !', 'Nothing beats a good hike… and a good battle!')],
    after: [L('Ouf ! Une petite sieste et je repars.', 'Phew! A little nap and I’ll be off again.')],
  }),
  T({
    id: 'gomme1', name: L('Sbire Gomme', 'Eraser Grunt'), party: [{ species: '013', level: 9 }, { species: '015', level: 9 }], money: 300, grey: true,
    before: [
      L('Hé ! Ce bois est trop gribouillé. On fait le ménage pour le Grand Effaceur !', 'Hey! These woods are way too scribbly. We’re tidying up for the Great Eraser!'),
      L('Tu vois mes Bestioles ? Plus de couleurs, plus de bêtises. Elles obéissent !', 'See my Critters? No more colours, no more nonsense. They obey!'),
    ],
    after: [L('Quoi ?! Les couleurs reviennent ? Ce n’était pas prévu…', 'What?! The colours are coming back? That wasn’t the plan…')],
  }),
  T({
    id: 'gomme2', name: L('Sbire Gomme', 'Eraser Grunt'), party: [{ species: '009', level: 9 }, { species: '103', level: 10 }], money: 360, grey: true, afterScript: 'boisRestore', storyFlag: 'a1.bois',
    before: [
      L('Halte ! Personne ne passe. Le Grand Effaceur dit que ces dessins ne valent rien.', 'Halt! Nobody gets through. The Great Eraser says these drawings are worthless.'),
      L('Un coup de gomme, et pouf ! Plus de bois, plus de Bestioles, plus de bazar !', 'One rub of the eraser, and poof! No more woods, no more Critters, no more mess!'),
    ],
    after: [L('Grr… Le Grand Effaceur ne va pas être content !', 'Grr… The Great Eraser won’t be happy!')],
  }),
  // ---------------------------------------------------------------- Atelier Plume
  T({
    id: 'plumeT1', name: L('Ornithologue Paulin', 'Birdwatcher Paulin'), party: [{ species: '013', level: 11 }, { species: '013', level: 11 }], money: 300,
    before: [L('Chut ! J’observe les Piafou… Ah, tu m’as fait peur. Combat !', 'Shh! I’m watching Chirpies… Ah, you startled me. Battle!')],
    after: [L('Mes Piafou se sont envolés… de honte.', 'My Chirpies flew away… out of shame.')],
  }),
  T({
    id: 'plumeT2', name: L('Rêveuse Nina', 'Dreamer Nina'), party: [{ species: '005', level: 11 }], money: 320,
    before: [L('Zzz… Hein ? Un combat ? D’accord, mais vite, j’ai sommeil.', 'Zzz… Huh? A battle? Fine, but quickly, I’m sleepy.')],
    after: [L('Bonne nuit…', 'Good night…')],
  }),
  T({
    id: 'gaspard', name: L('Maître d’Atelier Gaspard', 'Atelier Master Gaspard'), money: 1600, badge: 'plume',
    party: [{ species: '013', level: 11 }, { species: '008', level: 8 }, { species: '026', level: 12 }],
    before: [
      L('Zzz… Mmh ? Quelqu’un a dit « combat » ? Bâââille…', 'Zzz… Mmh? Did someone say “battle”? Yaaawn…'),
      L('Bon. Quand je suis réveillé, je ne rigole plus. Montre-moi ce que tu vaux !', 'Right. When I’m awake, I don’t mess around. Show me what you’ve got!'),
    ],
    after: [
      L('Hmpf. Bien joué, tu m’as complètement réveillé. Voici le Badge Plume.', 'Hmpf. Well played, you woke me right up. Here is the Feather Badge.'),
      L('Le pont à l’est a été effacé cette nuit. Pour continuer, il faudra passer par la Grotte Gribouillis, près de Ville-Pastel.', 'The bridge to the east was rubbed out last night. To go on, you’ll have to go through Scribble Cave, near Pastel City.'),
    ],
  }),
  // ---------------------------------------------------------------- Grotte Gribouillis
  T({
    id: 'max', name: L('Spéléo Max', 'Caver Max'), party: [{ species: '004', level: 11 }, { species: '007', level: 9 }], money: 560,
    before: [L('Il fait noir ici, mais mes Bestioles voient tout !', 'It’s dark in here, but my Critters see everything!')],
    after: [L('J’aurais dû prendre une lampe…', 'I should have brought a lamp…')],
  }),
  T({
    id: 'zoe', name: L('Gamine Zoé', 'Kid Zoe'), party: [{ species: '006', level: 12 }, { species: '005', level: 13 }], money: 540,
    before: [L('Chut ! Mes Bestioles chantent pour les chauves-souris.', 'Shh! My Critters are singing to the bats.')],
    after: [L('Les chauves-souris préfèrent ta chanson.', 'The bats like your song better.')],
  }),
  T({
    id: 'bob', name: L('Mineur Bob', 'Miner Bob'), party: [{ species: '076', level: 12 }, { species: '030', level: 13 }], money: 640,
    before: [L('Mon Cailloutou creuse les tunnels, et mon Ocrinou les éclaire avec sa queue !', 'My Pebblet digs the tunnels, and my Ochrecalf lights them with its tail!')],
    after: [L('Plus de lumière… Typique.', 'Lights out… Typical.')],
  }),
  T({
    id: 'tom', name: L('Campeur Tom', 'Camper Tom'), party: [{ species: '003', level: 10 }, { species: '002', level: 12 }, { species: '001', level: 12 }], money: 620,
    before: [L('Moi aussi j’ai eu une Bestiole du Prof. Fusain ! Enfin… trois.', 'I got a Critter from Prof. Charcoal too! Well… three.')],
    after: [L('Le prof avait raison : tu es doué.', 'The prof was right: you’re good.')],
  }),
  T({
    id: 'gardien', name: L('Gardien Ronflon', 'Guardian Snoozle'), money: 1600,
    party: [{ species: '007', level: 14 }, { species: '004', level: 14 }, { species: '008', level: 15 }],
    before: [
      L('Ronnn… pshhh… Je garde le fond de la grotte depuis cent siestes.', 'Zzzz… pshhh… I’ve guarded the back of this cave for a hundred naps.'),
      L('Si tu me réveilles… il faudra me battre !', 'If you wake me up… you’ll have to beat me!'),
    ],
    after: [L('Bâââille… Bravo. Maintenant laisse-moi dormir.', 'Yaaawn… Well done. Now let me sleep.')],
  }),
  // ---------------------------------------------------------------- Route des Aquarelles
  T({
    id: 'r3b', name: L('Dessinatrice Romane', 'Sketcher Romane'), party: [{ species: '013', level: 14 }, { species: '005', level: 14 }, { species: '051', level: 15 }], money: 420,
    before: [L('Ne bouge plus, je dessine le paysage ! … Bon, tu as bougé. Combat !', 'Hold still, I’m drawing the view! … Right, you moved. Battle!')],
    after: [L('Mon dessin est raté, mais toi tu es réussi.', 'My drawing is ruined, but you did great.')],
  }),
  T({
    id: 'r3a', name: L('Nageur Loïc', 'Swimmer Loic'), party: [{ species: '051', level: 14 }, { species: '069', level: 14 }, { species: '101', level: 15 }], money: 420,
    before: [L('Je m’entraîne pour la grande traversée du port. Et toi, tu t’entraînes ?', 'I’m training for the big swim across the harbour. Are you training too?')],
    after: [L('Je vais nager pour me consoler.', 'I’ll go for a swim to cheer up.')],
  }),
  T({
    id: 'r3gus', name: L('Pêcheur Gus', 'Fisher Gus'), party: [{ species: '014', level: 14 }, { species: '003', level: 15 }, { species: '069', level: 15 }], money: 400,
    before: [L('Ça mord ! … Ah non, c’est toi. Bon, combat !', 'A bite! … Oh no, it’s you. Fine, battle!')],
    after: [L('Le poisson du jour, c’était moi…', 'Catch of the day: me…')],
  }),
  T({
    id: 'r3lise', name: L('Gamine Lise', 'Kid Lise'), party: [{ species: '031', level: 14 }, { species: '082', level: 13 }, { species: '006', level: 15 }], money: 380,
    before: [L('J’ai peint mes Bestioles à l’aquarelle, elles brillent quand il pleut !', 'I painted my Critters in watercolour, they shine when it rains!')],
    after: [L('Il ne pleut même pas…', 'It’s not even raining…')],
  }),
  // ---------------------------------------------------------------- Atelier Aquarelle
  T({
    id: 'aquaT1', name: L('Nageuse Lila', 'Swimmer Lila'), party: [{ species: '032', level: 15 }, { species: '006', level: 16 }, { species: '095', level: 16 }], money: 400,
    before: [L('Un, deux, trois… Plouf ! On se bat dans l’eau ou sur le sable ?', 'One, two, three… Splash! Shall we battle in the water or on the sand?')],
    after: [L('J’ai bu la tasse…', 'I swallowed some water…')],
  }),
  T({
    id: 'aquaT2', name: L('Marin Yann', 'Sailor Yann'), party: [{ species: '069', level: 15 }, { species: '058', level: 15 }, { species: '022', level: 16 }], money: 450,
    before: [L('Mon Clapoflot tambourine sur sa carapace pour donner le rythme aux vagues !', 'My Splashwave drums on its shell to keep the waves in time!')],
    after: [L('Les vagues ont perdu le rythme…', 'The waves lost the beat…')],
  }),
  T({
    id: 'marine', name: L('Maître d’Atelier Marine', 'Atelier Master Marine'), money: 2000, badge: 'aquarelle', afterScript: 'marineAfter', storyFlag: 'a2.bridge',
    party: [{ species: '069', level: 16 }, { species: '032', level: 16 }, { species: '022', level: 19 }],
    before: [
      L('L’aquarelle, c’est de l’eau qui rêve d’être une couleur. Tu le savais ?', 'Watercolour is water dreaming of being a colour. Did you know that?'),
      L('Voyons si tes Bestioles savent nager dans mes couleurs !', 'Let’s see if your Critters can swim in my colours!'),
    ],
    after: [
      L('Splendide ! Tu dessines tes victoires comme moi mes vagues. Voici le Badge Aquarelle.', 'Splendid! You draw your victories the way I draw my waves. Here is the Watercolour Badge.'),
      L('Le pont de Village-Plume ? Je l’ai repeint ce matin ! La route des Aquarelles te ramène là-bas en un rien de temps.', 'The Featherby bridge? I repainted it this morning! Watercolour Way takes you back there in no time.'),
      L('Mais au nord, Ville-Feutre a perdu toutes ses couleurs. Les Gomme y ont un entrepôt…', 'But up north, Felt City has lost all its colours. Team Gomme has a warehouse there…'),
    ],
  }),
  // ---------------------------------------------------------------- Route des Feutres
  T({
    id: 'r4a', name: L('Livreur Nino', 'Courier Nino'), party: [{ species: '026', level: 18 }, { species: '004', level: 18 }, { species: '056', level: 19 }], money: 500,
    before: [L('Je livre des feutres neufs à Ville-Feutre. Mais d’abord, une petite livraison de coups !', 'I’m delivering new markers to Felt City. But first, a little delivery of hits!')],
    after: [L('Livraison annulée…', 'Delivery cancelled…')],
  }),
  T({
    id: 'r4b', name: L('Musicienne Clara', 'Musician Clara'), party: [{ species: '026', level: 18 }, { species: '005', level: 19 }, { species: '067', level: 19 }], money: 520,
    before: [L('Ville-Feutre a perdu ses couleurs… et sa musique. Je joue pour la réveiller. Tu danses ?', 'Felt City lost its colours… and its music. I play to wake it up. Will you dance?')],
    after: [L('Tu as du rythme, toi !', 'You’ve got rhythm!')],
  }),
  T({
    id: 'r4maud', name: L('Randonneuse Maud', 'Hiker Maud'), party: [{ species: '007', level: 19 }, { species: '067', level: 18 }, { species: '008', level: 20 }], money: 520,
    before: [L('Mon Ronflon porte mon sac. Enfin, quand il ne dort pas.', 'My Snoozle carries my bag. Well, when it’s not asleep.')],
    after: [L('Il dort. Je porte le sac. Comme d’habitude.', 'It’s asleep. I carry the bag. As usual.')],
  }),
  T({
    id: 'r4tim', name: L('Gamin Tim', 'Kid Tim'), party: [{ species: '007', level: 18 }, { species: '078', level: 18 }, { species: '035', level: 19 }], money: 400,
    before: [L('Mon cerf-volant fait des étincelles, regarde !', 'My kite throws sparks, look!')],
    after: [L('Zéro étincelle…', 'Zero sparks…')],
  }),
  T({
    id: 'r4gomme', name: L('Sbire Gomme', 'Eraser Grunt'), party: [{ species: '103', level: 19 }, { species: '033', level: 20 }, { species: '056', level: 20 }], money: 500, grey: true,
    before: [L('Ville-Feutre ? On l’a toute grisée ! C’est bien plus calme comme ça.', 'Felt City? We greyed it all out! It’s much quieter like that.')],
    after: [L('Pfff… Va donc voir Rature à l’entrepôt, il te gommera, lui !', 'Pfff… Go see Smudge at the warehouse, he’ll rub you out!')],
  }),
  // ---------------------------------------------------------------- Lac des Couleurs (between the third and fourth badges)
  T({
    id: 'lacR1', name: L('Pêcheur Gaston', 'Fisherman Gaston'), party: [{ species: '099', level: 17 }, { species: '101', level: 18 }, { species: '069', level: 18 }], money: 450,
    before: [L('Depuis que le lac est gris, ça ne mord plus. Alors je pêche des combats !', 'Since the lake went grey, nothing bites. So I fish for battles!')],
    after: [L('Ça ne mord vraiment plus…', 'Nothing’s biting at all…')],
  }),
  T({
    id: 'lacR2', name: L('Nageuse Iris', 'Swimmer Iris'), party: [{ species: '095', level: 18 }, { species: '032', level: 18 }], money: 450,
    before: [L('Avant, en nageant ici, on ressortait toute colorée ! Maintenant, on ressort grise.', 'You used to come out of this water all colourful! Now you come out grey.')],
    after: [L('Glou glou… perdu.', 'Glug glug… I lost.')],
  }),
  T({
    id: 'lacG1', name: L('Sbire Gomme', 'Eraser Grunt'), party: [{ species: '103', level: 18 }, { species: '056', level: 18 }, { species: '033', level: 18 }], money: 500, grey: true,
    before: [L('La source rouge ? On l’a bouchée avec une grosse gomme. Plus de couleurs, plus de taches ! Le lac est parfait comme ça.', 'The red spring? We plugged it with a big eraser. No more colours, no more stains! The lake is perfect like this.')],
    after: [L('Bon, bon… Débouche-la, ta source, si tu y tiens.', 'Fine, fine… Unplug your spring if you care that much.')],
  }),
  T({
    id: 'lacJ1', name: L('Peintre Lili', 'Painter Lili'), party: [{ species: '113', level: 17 }, { species: '091', level: 17 }, { species: '062', level: 18 }], money: 480,
    before: [L('Je suis venue peindre le lac… mais il n’y a plus que du gris ! Tant pis, je peins tes Bestioles.', 'I came to paint the lake… but it’s all grey! Never mind, I’ll paint your Critters.')],
    after: [L('Mon Poulpinceau a renversé tout le pot d’eau !', 'My Octobrush knocked over the whole water jar!')],
  }),
  T({
    id: 'lacG2', name: L('Sbire Gomme', 'Eraser Grunt'), party: [{ species: '101', level: 18 }, { species: '103', level: 19 }, { species: '056', level: 19 }], money: 500, grey: true,
    before: [L('Pas un pas de plus ! Le chef est en train d’éponger la dernière source.', 'Not one step further! The boss is mopping up the last spring.')],
    after: [L('Chef ! Il y a un gamin qui recolorie tout !', 'Boss! There’s a kid colouring everything back in!')],
  }),
  T({
    id: 'lacChef', name: L('Sbire-chef Éponge', 'Head Grunt Sponge'), party: [{ species: '103', level: 18 }, { species: '101', level: 18 }, { species: '056', level: 20 }], money: 1200, grey: true,
    before: [
      L('Ah, te voilà ! Moi, c’est Éponge. J’absorbe les couleurs, une à une, jusqu’à la dernière goutte.', 'Ah, there you are! I’m Sponge. I soak up colours, one by one, to the very last drop.'),
      L('Un lac tout gris, tout propre, sans une tache. Le Grand Effaceur adorera. Va-t’en !', 'A lake all grey and clean, without a single stain. The Great Eraser will love it. Go away!'),
    ],
    after: [
      L('Je suis… essoré…', 'I’m… wrung out…'),
      L('Bah ! Libère-la, ta source bleue. Mais le Grand Effaceur gommera tout, un jour !', 'Bah! Free your blue spring, then. But the Great Eraser will rub everything out, one day!'),
    ],
  }),
  // ---------------------------------------------------------------- Entrepôt Gomme
  T({
    id: 'e1g1', name: L('Sbire Gomme', 'Eraser Grunt'), party: [{ species: '052', level: 20 }, { species: '026', level: 21 }, { species: '004', level: 21 }], money: 520, grey: true,
    before: [L('Intrus ! Ici on stocke les couleurs aspirées. Tu n’en auras pas une goutte !', 'Intruder! This is where we store the sucked-up colours. You won’t get a drop!')],
    after: [L('Une goutte de rouge vient de s’échapper…', 'A drop of red just escaped…')],
  }),
  T({
    id: 'e1g2', name: L('Sbire Gomme', 'Eraser Grunt'), party: [{ species: '074', level: 19 }, { species: '010', level: 20 }], money: 540, grey: true,
    before: [L('Le Grand Effaceur dit que le monde serait plus beau tout blanc. Comme une page neuve !', 'The Great Eraser says the world would be prettier all white. Like a brand-new page!')],
    after: [L('Une page blanche, c’est quand même un peu triste…', 'A blank page is a bit sad, really…')],
  }),
  T({
    id: 'e1g3', name: L('Sbire Gomme', 'Eraser Grunt'), party: [{ species: '008', level: 20 }, { species: '054', level: 20 }, { species: '007', level: 20 }], money: 540, grey: true,
    before: [L('Mes Bestioles n’ont plus de couleurs, mais elles mordent encore !', 'My Critters have no colours left, but they still bite!')],
    after: [L('Elles ont retrouvé leurs couleurs… et elles sont toutes contentes. Bizarre.', 'They got their colours back… and they look so happy. Weird.')],
  }),
  T({
    id: 'e2g1', name: L('Sbire Gomme', 'Eraser Grunt'), party: [{ species: '004', level: 21 }, { species: '056', level: 20 }, { species: '010', level: 21 }], money: 560, grey: true,
    before: [L('Personne ne dérange l’Admin Rature !', 'Nobody disturbs Admin Smudge!')],
    after: [L('Bon… Dérange-le, alors.', 'Fine… Disturb him, then.')],
  }),
  T({
    id: 'rature', name: L('Admin Rature', 'Admin Smudge'), money: 2600, grey: true, afterScript: 'feutreRestore', storyFlag: 'a2.feutre',
    party: [{ species: '026', level: 22 }, { species: '010', level: 21 }, { species: '010', level: 23 }],
    before: [
      L('Tiens, tiens. C’est toi qui recolories tout derrière nous ?', 'Well, well. So you’re the one colouring everything back in behind us?'),
      L('Et c’est toi qui caches ce cocon raté, tout embrouillé… Le patron le veut. Surtout celui-là.', 'And you’re hiding that muddled, failed little cocoon… The boss wants it. That one above all.'),
      L('Le Grand Effaceur veut un monde parfait : pas une rature, pas une tache. Tes gribouillis, je vais les effacer… et toi avec !', 'The Great Eraser wants a perfect world: not one scribble, not one smudge. I’ll rub out your scribbles… and you with them!'),
    ],
    after: [L('Impossible… Les couleurs… elles reviennent toutes !', 'Impossible… The colours… they’re all coming back!')],
  }),
  // ---------------------------------------------------------------- Atelier Fluo
  T({
    id: 'fluoT1', name: L('Électricienne Volta', 'Electrician Volta'), party: [{ species: '078', level: 21 }, { species: '035', level: 21 }, { species: '004', level: 22 }], money: 540,
    before: [L('Attention, ça pique ! Zzzt !', 'Careful, it stings! Bzzt!')],
    after: [L('Court-circuit…', 'Short circuit…')],
  }),
  T({
    id: 'fluoT2', name: L('Rockeur Jimmy', 'Rocker Jimmy'), party: [{ species: '067', level: 21 }, { species: '092', level: 22 }, { species: '082', level: 22 }], money: 560,
    before: [L('Ma Lampyrette et mon Lumignon font les lumières, mon Fâchinge tape sur la batterie. On est un groupe !', 'My Lampfly and my Glimmerkin do the lights, my Grumpape bangs the drums. We’re a band!')],
    after: [L('Le concert est annulé…', 'The concert is cancelled…')],
  }),
  T({
    id: 'zelie', name: L('Maître d’Atelier Zélie', 'Atelier Master Zelie'), money: 2400, badge: 'fluo',
    party: [{ species: '035', level: 24 }, { species: '082', level: 24 }, { species: '004', level: 26, item: 'baie-bleue' }],
    before: [
      L('Merci d’avoir rendu ses couleurs à ma ville ! Maintenant… on va voir si tu brilles autant que mes feutres fluo !', 'Thanks for giving my city its colours back! Now… let’s see if you shine as bright as my neon markers!'),
    ],
    after: [
      L('Waouh, quel éclat ! Voici le Badge Fluo, tu le mérites.', 'Wow, what a glow! Here is the Neon Badge, you deserve it.'),
      L('Au nord, le Mont Fusain mène à Village-Braise. Ambre y garde son Atelier, et elle ne rigole pas avec le feu !', 'Up north, Mount Charcoal leads to Embervale. Amber runs her Atelier there, and she doesn’t joke around with fire!'),
    ],
  }),
  // ---------------------------------------------------------------- Mont Fusain
  T({
    id: 'mfOlga', name: L('Montagnarde Olga', 'Mountaineer Olga'), party: [{ species: '026', level: 22 }, { species: '029', level: 23 }, { species: '067', level: 23 }], money: 600,
    before: [L('Le fusain, ça salit les mains ! Et les Bestioles aussi !', 'Charcoal makes your hands dirty! And your Critters too!')],
    after: [L('Je vais me laver les mains…', 'I’m going to wash my hands…')],
  }),
  T({
    id: 'mfRemi', name: L('Spéléo Rémi', 'Caver Remi'), party: [{ species: '029', level: 22 }, { species: '105', level: 22 }, { species: '030', level: 23 }], money: 620,
    before: [L('Dans le noir, on ne voit que les yeux des Brumouille. Brr !', 'In the dark you only see the Mistchiefs’ eyes. Brr!')],
    after: [L('Allume la lumière en sortant…', 'Turn off the light on your way out…')],
  }),
  T({
    id: 'mfArmand', name: L('Géologue Armand', 'Geologist Armand'), party: [{ species: '021', level: 22 }, { species: '076', level: 23 }, { species: '067', level: 23 }], money: 640,
    before: [L('Ce mont est fait de fusain pur ! Touche, ça noircit les doigts. Et les Bestioles, ça les rend coriaces !', 'This mountain is pure charcoal! Touch it, it blackens your fingers. And it makes Critters tough!')],
    after: [L('J’ai les doigts noirs et le moral aussi.', 'Black fingers, and a black mood too.')],
  }),
  T({
    id: 'mfErmite', name: L('Ermite du Fusain', 'Charcoal Hermit'), party: [{ species: '007', level: 22 }, { species: '010', level: 23 }, { species: '008', level: 21 }], money: 700,
    before: [L('Je dessine au fusain depuis cent ans. Tout est gris, ici… et c’est très bien comme ça.', 'I’ve drawn in charcoal for a hundred years. Everything is grey here… and that’s just fine.')],
    after: [L('Gris, oui… mais avec des nuances. Bien joué.', 'Grey, yes… but with shades. Well played.')],
  }),
  // ---------------------------------------------------------------- Atelier Braise
  T({
    id: 'braiseT1', name: L('Jongleur Paco', 'Juggler Paco'), party: [{ species: '076', level: 23 }, { species: '080', level: 23 }, { species: '021', level: 24 }, { species: '026', level: 24 }], money: 600,
    before: [L('Je jongle avec des braises ! Enfin, mon Braisaure jongle.', 'I juggle embers! Well, my Emberoo does.')],
    after: [L('Aïe, ça brûle…', 'Ouch, that burns…')],
  }),
  T({
    id: 'braiseT2', name: L('Forgeronne Inès', 'Smith Ines'), party: [{ species: '080', level: 23 }, { species: '008', level: 23 }, { species: '021', level: 24 }], money: 640,
    before: [L('Ici on forge des crayons à la chaleur du volcan !', 'Here we forge pencils in the volcano’s heat!')],
    after: [L('Mon crayon a fondu…', 'My pencil melted…')],
  }),
  T({
    id: 'ambre', name: L('Maître d’Atelier Ambre', 'Atelier Master Amber'), money: 2800, badge: 'braise',
    party: [{ species: '021', level: 25 }, { species: '018', level: 24 }, { species: '021', level: 26, item: 'baie-bleue' }],
    before: [
      L('Tu as monté le Mont Fusain jusqu’ici ? Courageux. Mais ici, ça chauffe !', 'You climbed all of Mount Charcoal? Brave. But here, things heat up!'),
    ],
    after: [
      L('Ton feu intérieur est plus fort que le mien. Voici le Badge Braise !', 'Your inner fire burns brighter than mine. Here is the Ember Badge!'),
      L('On dit que le Grand Effaceur prépare quelque chose de terrible, loin au nord… La route des Paillettes rouvrira bientôt.', 'They say the Great Eraser is plotting something terrible, far to the north… The Glitter Road will reopen soon.'),
    ],
  }),
  // ---------------------------------------------------------------- Tour Brumeuse
  T({
    id: 'elsa', name: L('Médium Elsa', 'Medium Elsa'), party: [{ species: '007', level: 24 }, { species: '010', level: 24 }, { species: '065', level: 25 }], money: 900,
    before: [L('Deux brumes valent mieux qu’une !', 'Two mists are better than one!')],
    after: [L('La brume se dissipe…', 'The mist is clearing…')],
  }),
  T({
    id: 'pif', name: L('Farceur Pif', 'Prankster Pif'), party: [{ species: '006', level: 24 }, { species: '052', level: 24 }, { species: '010', level: 25 }], money: 960,
    before: [L('Bouh ! … Tu n’as pas eu peur ? Bon, on se bat alors.', 'Boo! … Not scared? Fine, let’s battle then.')],
    after: [L('Même mes mains de brume n’ont pas suffi !', 'Even my mist hands weren’t enough!')],
  }),
  T({
    id: 'rose', name: L('Conteuse Rose', 'Storyteller Rose'), party: [{ species: '065', level: 25 }, { species: '088', level: 24 }, { species: '006', level: 26 }], money: 940,
    before: [L('Il était une fois… un combat terrible !', 'Once upon a time… a terrible battle!')],
    after: [L('…et tu vécus heureux et victorieux. Fin.', '…and you lived happily and victoriously. The end.')],
  }),
  T({
    id: 'hugo', name: L('Magicien Hugo', 'Magician Hugo'), party: [{ species: '065', level: 25 }, { species: '007', level: 25 }, { species: '004', level: 26 }], money: 1000,
    before: [L('Abracadabra ! Mes Bestioles vont te faire disparaître !', 'Abracadabra! My Critters will make you vanish!')],
    after: [L('C’est moi qui ai disparu…', 'I’m the one who vanished…')],
  }),
  T({
    id: 'ombre', name: L('Ombre de la Tour', 'Shadow of the Tower'), money: 2600,
    party: [{ species: '009', level: 21 }, { species: '010', level: 23 }, { species: '011', level: 26 }],
    before: [
      L('Hi hi hi… Tout en haut de la tour, une ombre géante te fait une grimace.', 'Hee hee hee… At the top of the tower, a giant shadow pulls a face at you.'),
      L('Tu veux jouer avec nous ? Alors joue… si tu l’oses !', 'Want to play with us? Then play… if you dare!'),
    ],
    after: [L('Hi hi… Tu ris plus fort que nous.', 'Hee hee… You laugh louder than us.')],
  }),
  // ---------------------------------------------------------------- Route des Paillettes
  T({
    id: 'r6c', name: L('Collégienne Jeanne', 'Schoolgirl Jeanne'), party: [{ species: '008', level: 23 }, { species: '052', level: 23 }, { species: '061', level: 24 }], money: 820,
    before: [L('J’ai eu dix sur dix en dessin ! Et en combat, on va voir…', 'I got full marks in drawing! And in battles, let’s see…')],
    after: [L('Zéro sur dix en combat. Je réviserai.', 'Zero out of ten in battles. I’ll revise.')],
  }),
  T({
    id: 'r6d', name: L('Clown Pépin', 'Clown Pepin'), party: [{ species: '016', level: 23 }, { species: '068', level: 24 }, { species: '005', level: 23 }], money: 840,
    before: [L('Pouet pouet ! Tu veux voir un tour de magie ? Je fais disparaître tes points de vie !', 'Honk honk! Want to see a magic trick? I make your HP disappear!')],
    after: [L('Pouet… le tour a raté.', 'Honk… the trick failed.')],
  }),
  T({
    id: 'r6a', name: L('Danseuse Coralie', 'Dancer Coralie'), party: [{ species: '007', level: 24 }, { species: '063', level: 25 }, { species: '006', level: 25 }], money: 700,
    before: [L('Un pas à gauche, une paillette à droite… et on se bat !', 'A step to the left, glitter to the right… and we battle!')],
    after: [L('J’ai perdu le rythme…', 'I lost the beat…')],
  }),
  T({
    id: 'r6b', name: L('Collégien Bastien', 'Schoolboy Bastien'), party: [{ species: '008', level: 23 }, { species: '052', level: 23 }, { species: '078', level: 24 }], money: 680,
    before: [L('J’ai dessiné mes Bestioles dans la marge de mon cahier de maths !', 'I drew my Critters in the margin of my maths notebook!')],
    after: [L('La maîtresse avait raison : il faut écouter en classe.', 'The teacher was right: you should listen in class.')],
  }),
  // ---------------------------------------------------------------- Atelier Paillette
  T({
    id: 'paillT1', name: L('Paillettine Mia', 'Sparkler Mia'), party: [{ species: '084', level: 24 }, { species: '006', level: 25 }, { species: '005', level: 25 }], money: 720,
    before: [L('Ça brille, ça brille ! Tu vas en avoir plein les yeux !', 'Sparkle, sparkle! You’ll be dazzled!')],
    after: [L('Il y a des paillettes partout maintenant…', 'There’s glitter everywhere now…')],
  }),
  T({
    id: 'paillT2', name: L('Magicienne Luce', 'Magician Luce'), party: [{ species: '008', level: 24 }, { species: '005', level: 25 }, { species: '006', level: 25 }], money: 740,
    before: [L('Un coup de baguette pailletée, et pouf !', 'One wave of my glitter wand, and poof!')],
    after: [L('Le tour a raté…', 'The trick failed…')],
  }),
  T({
    id: 'celestine', name: L('Maître d’Atelier Célestine', 'Atelier Master Celestine'), money: 3200, badge: 'paillette', fairCopy: true,
    party: [{ species: '006', level: 27 }, { species: '005', level: 28, item: 'baie-reveil' }, { species: '014', level: 28 }, { species: '028', level: 29 }],
    before: [L('Bienvenue dans mon atelier étoilé ! Chaque paillette ici est un vœu. Voyons si le tien est le plus fort !', 'Welcome to my starry atelier! Every speck of glitter here is a wish. Let’s see if yours is the strongest!')],
    after: [
      L('Ton vœu brille plus que tous les miens. Voici le Badge Paillette !', 'Your wish shines brighter than all of mine. Here is the Glitter Badge!'),
      L('La Tour Brumeuse, dans le Bois, a été envahie par la Team Gomme. Avec mon badge, tu pourras y entrer. Le Ballon-Crayon de l’Auberge t’y emmènera vite !', 'The Misty Tower, in the Woods, has been taken over by Team Gomme. With my badge you can go in. The Pencil Balloon at the Inn will take you there fast!'),
    ],
  }),
  // ---------------------------------------------------------------- Tour Brumeuse (taken by Team Gomme)
  T({
    id: 'tgomme1', name: L('Sbire Gomme', 'Eraser Grunt'), party: [{ species: '006', level: 24 }, { species: '104', level: 24 }, { species: '010', level: 25 }], money: 760, grey: true,
    before: [L('Cette tour est à nous ! Les fantômes aussi. Ils sont tout gris maintenant, c’est plus calme.', 'This tower is ours! The ghosts too. They’re all grey now, it’s quieter.')],
    after: [L('Le fantôme a retrouvé ses couleurs… et il me tire la langue.', 'The ghost got its colours back… and it’s sticking its tongue out at me.')],
  }),
  T({
    id: 'tgomme2', name: L('Sbire Gomme', 'Eraser Grunt'), party: [{ species: '010', level: 25 }, { species: '056', level: 25 }, { species: '026', level: 26 }], money: 760, grey: true,
    before: [L('L’Admin Blanche est au sommet. Tu ne passeras pas !', 'Admin Whiteout is at the top. You shall not pass!')],
    after: [L('Bon, passe…', 'Fine, pass…')],
  }),
  T({
    id: 'blanche', name: L('Admin Blanche', 'Admin Whiteout'), money: 3600, grey: true, afterScript: 'towerFreed', storyFlag: 'a3.tour',
    party: [{ species: '043', level: 23 }, { species: '010', level: 24 }, { species: '007', level: 23 }, { species: '008', level: 24 }],
    before: [
      L('Chut. Ici, tout est blanc, propre, silencieux. Plus un trait qui dépasse.', 'Shh. Here everything is white, clean, silent. Not a single line out of place.'),
      L('Les fantômes riaient trop fort. Je les ai corrigés. Toi aussi, je vais te corriger.', 'The ghosts laughed too loud. I corrected them. I’ll correct you too.'),
      L('Et ton cocon pas fini… Ce dessin-là n’aurait jamais dû exister. Le patron s’en occupera lui-même.', 'And your unfinished cocoon… That drawing should never have existed. The boss will deal with it himself.'),
    ],
    after: [L('Tu… tu as fait des taches de couleur partout…', 'You… you got colour stains everywhere…')],
  }),
  // ---------------------------------------------------------------- Route des Gouaches
  T({
    id: 'r7c', name: L('Jardinier Octave', 'Gardener Octave'), party: [{ species: '005', level: 26 }, { species: '063', level: 26 }, { species: '064', level: 27 }], money: 920,
    before: [L('Mes plantes ont faim. Et elles adorent les dresseurs qui passent par là !', 'My plants are hungry. And they love passing trainers!')],
    after: [L('Bon. Elles mangeront de l’engrais.', 'Fine. They’ll have fertiliser instead.')],
  }),
  T({
    id: 'r7d', name: L('Randonneuse Agathe', 'Hiker Agathe'), party: [{ species: '007', level: 26 }, { species: '066', level: 27 }, { species: '059', level: 27 }], money: 940,
    before: [L('Le Jardin-Gouache est tout près. Mais il faut le mériter !', 'Gouache Garden is close. But you have to earn it!')],
    after: [L('Tu l’as mérité. Basile ne rigole pas avec ses plantes.', 'You earned it. Basil doesn’t joke about his plants.')],
  }),
  T({
    id: 'r7a', name: L('Botaniste Flore', 'Botanist Flora'), party: [{ species: '048', level: 27 }, { species: '063', level: 27 }, { species: '007', level: 28 }], money: 780,
    before: [L('Je collectionne les papillons… en photo, bien sûr !', 'I collect butterflies… in photos, of course!')],
    after: [L('Belle collection de victoires, toi.', 'Nice collection of victories you’ve got.')],
  }),
  T({
    id: 'r7b', name: L('Randonneur Jules', 'Hiker Jules'), party: [{ species: '008', level: 26 }, { species: '068', level: 26 }, { species: '039', level: 27 }], money: 800,
    before: [L('Mon Ronflon a mangé tout le pique-nique. On se bat pour me consoler ?', 'My Snoozle ate the whole picnic. Battle to cheer me up?')],
    after: [L('Je ne suis pas consolé…', 'I’m not cheered up…')],
  }),
  // ---------------------------------------------------------------- Atelier Gouache
  T({
    id: 'gouaT1', name: L('Jardinière Rosa', 'Gardener Rosa'), party: [{ species: '094', level: 27 }, { species: '063', level: 27 }, { species: '024', level: 28 }], money: 820,
    before: [L('Mon Bouquétigre ronronne et les fleurs poussent. Regarde !', 'My Blossomtiger purrs and the flowers grow. Look!')],
    after: [L('Les fleurs se sont fanées…', 'The flowers wilted…')],
  }),
  T({
    id: 'gouaT2', name: L('Paysagiste Arno', 'Landscaper Arno'), party: [{ species: '007', level: 27 }, { species: '095', level: 27 }, { species: '094', level: 28 }], money: 820,
    before: [L('Un jardin sans papillons, c’est un dessin sans couleurs !', 'A garden without butterflies is a drawing without colours!')],
    after: [L('Mes papillons sont partis butiner ailleurs…', 'My butterflies went to forage elsewhere…')],
  }),
  T({
    id: 'basile', name: L('Maître d’Atelier Basile', 'Atelier Master Basil'), money: 3600, badge: 'gouache', fairCopy: true,
    party: [{ species: '094', level: 29, item: 'baie-menthe' }, { species: '098', level: 30 }, { species: '063', level: 29 }, { species: '024', level: 33 }],
    before: [L('La gouache, c’est épais, c’est généreux, ça ne s’efface pas facilement. Comme mes Bestioles !', 'Gouache is thick, generous, hard to rub out. Just like my Critters!')],
    after: [
      L('Quelle couche de talent ! Voici le Badge Gouache.', 'What a thick coat of talent! Here is the Gouache Badge.'),
      L('Au nord, la Cité-Encre. Le chef de la Team Gomme se cache dans l’usine… Bats d’abord Nocturne, sinon les gardes ne te laisseront pas entrer.', 'Up north is Ink City. The Team Gomme boss hides in the factory… Beat Nocturne first, or the guards won’t let you in.'),
    ],
  }),
  // ---------------------------------------------------------------- Route de l’Encre
  T({
    id: 'r8c', name: L('Sbire Gomme', 'Eraser Grunt'), party: [{ species: '026', level: 28 }, { species: '057', level: 29 }, { species: '055', level: 29 }], money: 700, grey: true,
    before: [L('La Cité-Encre sera la prochaine à blanchir. Ne te mets pas en travers !', 'Ink City will be the next to go blank. Don’t get in the way!')],
    after: [L('Grr… Le Grand Effaceur ne va pas aimer ça.', 'Grr… The Great Eraser won’t like this.')],
  }),
  T({
    id: 'r8d', name: L('Médium Opale', 'Medium Opal'), party: [{ species: '043', level: 28 }, { species: '010', level: 28 }, { species: '083', level: 29 }], money: 980,
    before: [L('Les esprits de l’encre murmurent ton nom… et ils veulent se battre.', 'The spirits of the ink whisper your name… and they want to battle.')],
    after: [L('Les esprits se taisent. Pour l’instant.', 'The spirits fall silent. For now.')],
  }),
  T({
    id: 'r8a', name: L('Médium Nyx', 'Medium Nyx'), party: [{ species: '010', level: 29 }, { species: '010', level: 29 }, { species: '010', level: 30 }], money: 860,
    before: [L('L’encre parle… Elle dit que tu vas perdre.', 'The ink speaks… It says you will lose.')],
    after: [L('L’encre a bavé.', 'The ink smudged.')],
  }),
  T({
    id: 'r8b', name: L('Sbire Gomme', 'Eraser Grunt'), party: [{ species: '010', level: 29 }, { species: '057', level: 30 }, { species: '004', level: 30 }], money: 860, grey: true,
    before: [L('Le patron prépare la Grande Gomme. Bientôt, tout sera blanc !', 'The boss is preparing the Giant Eraser. Soon everything will be white!')],
    after: [L('Pas si vite, alors…', 'Not so fast, then…')],
  }),
  // ---------------------------------------------------------------- Phare de l’Encrier (lighthouse)
  T({
    id: 'ph1a', name: L('Sbire Gomme', 'Eraser Grunt'), party: [{ species: '010', level: 29 }, { species: '055', level: 29 }, { species: '102', level: 30 }], money: 880, grey: true,
    before: [L('Le capitaine ne veut personne dans son phare. Demi-tour !', 'The captain wants nobody in his lighthouse. Turn back!')],
    after: [L('Le capitaine va être fâché…', 'The captain is going to be cross…')],
  }),
  T({
    id: 'ph1b', name: L('Sbire Gomme', 'Eraser Grunt'), party: [{ species: '010', level: 29 }, { species: '004', level: 29 }, { species: '008', level: 30 }], money: 880, grey: true,
    before: [L('L’Encre de Minuit, c’est pour éteindre toutes les étoiles du dessin !', 'The Midnight Ink is for putting out every star in the drawing!')],
    after: [L('Bon, peut-être pas toutes les étoiles…', 'Well, maybe not all the stars…')],
  }),
  T({
    id: 'ph2a', name: L('Sbire Gomme', 'Eraser Grunt'), party: [{ species: '010', level: 30 }, { species: '057', level: 31 }, { species: '010', level: 31 }], money: 900, grey: true,
    before: [L('Tu as poussé nos blocs de gomme ? Tu vas le regretter !', 'You pushed our eraser blocks? You’ll regret it!')],
    after: [L('Pfff… Ils étaient lourds, en plus.', 'Phew… They were heavy, too.')],
  }),
  T({
    id: 'buvard', name: L('Capitaine Buvard', 'Captain Blotter'), money: 4200, grey: true, afterScript: 'phareEnd', storyFlag: 'a3.phare',
    party: [{ species: '006', level: 32 }, { species: '042', level: 31 }, { species: '010', level: 32 }, { species: '008', level: 33, item: 'baie-doree' }],
    before: [
      L('Ho ho ! {g:Une petite artiste|Un petit artiste} dans mon phare ?', 'Ho ho! A little artist in my lighthouse?'),
      L('Le buvard boit tout avant que ça tache : l’encre, les couleurs, la nuit de Nocturne. L’Encre de Minuit ? Une goutte de trop, et c’est la catastrophe. Je la garde !', 'A blotter soaks everything up before it can smudge: ink, colours, Nocturne’s night. The Midnight Ink? One drop too many and it’s a disaster. I’m keeping it!'),
    ],
    after: [L('Mon buvard est tout mouillé… Reprends ton encre, va !', 'My blotter is all soggy… Take your ink back, go on!')],
  }),
  // ---------------------------------------------------------------- Piste Cyclable
  T({
    id: 'pc1', name: L('Cycliste Léa', 'Cyclist Lea'), party: [{ species: '061', level: 29 }, { species: '079', level: 30 }], money: 820,
    before: [L('Tu roules à quelle vitesse ? Moi, plus vite que le vent !', 'How fast do you ride? Me, faster than the wind!')],
    after: [L('Crevaison !', 'Flat tyre!')],
  }),
  T({
    id: 'pc2', name: L('Cycliste Bastien', 'Cyclist Bastien'), party: [{ species: '016', level: 30 }, { species: '025', level: 30 }], money: 840,
    before: [L('Sur la Piste, on se dépasse… et on se bat !', 'On the Track, we overtake… and we battle!')],
    after: [L('Je descends de mon vélo pour réfléchir.', 'I’m getting off my bike to think.')],
  }),
  T({
    id: 'pc3', name: L('Cycliste Inès', 'Cyclist Ines'), party: [{ species: '047', level: 30 }, { species: '068', level: 31 }], money: 860,
    before: [L('Attention, virage ! Et combat !', 'Watch the bend! And battle!')],
    after: [L('J’ai raté le virage…', 'I missed the bend…')],
  }),
  T({
    id: 'pc4', name: L('Cycliste Noé', 'Cyclist Noah'), party: [{ species: '026', level: 30 }, { species: '106', level: 31 }], money: 900,
    before: [L('Mon Toufoudre et moi, on est les plus rapides de la Piste !', 'My Fluffbolt and I are the fastest on the Track!')],
    after: [L('Plus rapide que nous… c’est possible, alors.', 'Faster than us… so it is possible.')],
  }),
  // ---------------------------------------------------------------- Atelier Encre
  T({
    id: 'encreT1', name: L('Calligraphe Saki', 'Calligrapher Saki'), party: [{ species: '098', level: 30 }, { species: '010', level: 31 }, { species: '066', level: 31 }], money: 880,
    before: [L('Un trait d’encre, et ton nom s’écrit dans la défaite.', 'One stroke of ink, and your name is written in defeat.')],
    after: [L('Ma plume a fourché…', 'My quill slipped…')],
  }),
  T({
    id: 'encreT2', name: L('Conteur Ombelin', 'Storyteller Ombelin'), party: [{ species: '088', level: 30 }, { species: '053', level: 31 }, { species: '097', level: 31 }], money: 900,
    before: [L('Il était une fois une nuit sans fin…', 'Once upon a time there was an endless night…')],
    after: [L('…et le jour finit par se lever.', '…and the day finally broke.')],
  }),
  T({
    id: 'nocturne', name: L('Maître d’Atelier Nocturne', 'Atelier Master Nocturne'), money: 4000, badge: 'encre', afterScript: 'encreChoice', fairCopy: true,
    party: [{ species: '097', level: 32 }, { species: '010', level: 32 }, { species: '066', level: 33 }, { species: '098', level: 33 }, { species: '011', level: 33 }],
    before: [
      L('Bonsoir. L’encre de nuit cache tout ce qu’on n’ose pas dessiner…', 'Good evening. Night ink hides everything we don’t dare to draw…'),
      L('Montre-moi que tu n’as peur de rien, même pas de tes propres ombres.', 'Show me you’re afraid of nothing, not even your own shadows.'),
    ],
    after: [
      L('Tu as éclairé ma nuit. Voici le Badge Encre, le dernier.', 'You lit up my night. Here is the Ink Badge, the last one.'),
      L('Avec lui, les gardes de l’Usine à Gommes ne pourront plus t’arrêter. Le Grand Effaceur t’attend…', 'With it, the Eraser Factory guards can’t stop you anymore. The Great Eraser awaits…'),
    ],
  }),
  // ---------------------------------------------------------------- Usine à Gommes
  T({
    id: 'u1g1', name: L('Sbire Gomme', 'Eraser Grunt'), party: [{ species: '036', level: 32 }, { species: '010', level: 33 }], money: 900, grey: true,
    before: [L('Ici on fabrique les gommes géantes. Tu veux essayer ?', 'This is where we make the giant erasers. Want to try one?')],
    after: [L('Elle a rebondi sur moi…', 'It bounced back at me…')],
  }),
  T({
    id: 'u1g2', name: L('Sbire Gomme', 'Eraser Grunt'), party: [{ species: '008', level: 31 }, { species: '057', level: 31 }, { species: '043', level: 32 }], money: 920, grey: true,
    before: [L('Mon Ronflon tout gris dort sur le tapis roulant. Réveille-le, si tu l’oses !', 'My all-grey Snoozle sleeps on the conveyor belt. Wake it, if you dare!')],
    after: [L('Il s’est réveillé… en couleurs.', 'It woke up… in colour.')],
  }),
  T({
    id: 'u1g3', name: L('Sbire Gomme', 'Eraser Grunt'), party: [{ species: '057', level: 31 }, { species: '055', level: 31 }, { species: '004', level: 32 }], money: 920, grey: true,
    before: [L('Le patron a dit : plus de bavures !', 'The boss said: no more smudges!')],
    after: [L('Je suis tout taché…', 'I’m all smudged…')],
  }),
  T({
    id: 'u2g1', name: L('Sbire Gomme', 'Eraser Grunt'), party: [{ species: '010', level: 32 }, { species: '010', level: 33 }, { species: '046', level: 33 }], money: 940, grey: true,
    before: [L('Tu ne trouveras jamais le patron !', 'You’ll never find the boss!')],
    after: [L('Il est en haut… Oups.', 'He’s upstairs… Oops.')],
  }),
  T({
    id: 'rature2', name: L('Admin Rature', 'Admin Smudge'), money: 4200, grey: true,
    party: [{ species: '036', level: 32 }, { species: '010', level: 32 }, { species: '010', level: 33 }, { species: '057', level: 32 }, { species: '008', level: 33 }],
    before: [L('Encore toi ! Cette fois, je vais te raturer pour de bon.', 'You again! This time I’ll scratch you out for good.')],
    after: [L('Je… je raye ce combat de ma mémoire.', 'I… I’m crossing this battle out of my memory.')],
  }),
  T({
    id: 'blanche2', name: L('Admin Blanche', 'Admin Whiteout'), money: 4400, grey: true, afterScript: 'usineEnd', storyFlag: 'a3.usine',
    party: [{ species: '043', level: 34 }, { species: '010', level: 33 }, { species: '007', level: 34 }, { species: '046', level: 33 }, { species: '008', level: 34 }],
    before: [L('Le patron est juste derrière moi. Il ne faut pas le déranger… Il prépare la page blanche.', 'The boss is right behind me. He mustn’t be disturbed… He is preparing the blank page.')],
    after: [L('Même mon blanc… a des couleurs, maintenant.', 'Even my white… has colours in it now.')],
  }),
  // ---------------------------------------------------------------- the end of the page
  // ---------------------------------------------------------------- Act 4: the Margin Road (src/data/maps/marge.ts)
  T({
    id: 'r9a', name: L('Peintre Victor', 'Painter Victor'), party: [{ species: '107', level: 34 }, { species: '106', level: 34 }, { species: '061', level: 34 }, { species: '077', level: 35 }], money: 1100,
    before: [L('Je repeins les lignes du cahier. La rouge, là-bas, personne n’ose la franchir !', 'I repaint the lines of the sketchbook. The red one over there, nobody dares to cross it!')],
    after: [L('Toi, tu vas la franchir, hein ?', 'You’re going to cross it, aren’t you?')],
  }),
  T({
    id: 'r9b', name: L('Sbire Gomme', 'Eraser Grunt'), party: [{ species: '061', level: 35 }, { species: '057', level: 35 }, { species: '104', level: 36 }, { species: '008', level: 36 }], money: 1100, grey: true,
    before: [L('Au-delà de la marge, rien n’est colorié. Et c’est très bien comme ça !', 'Beyond the margin, nothing is coloured in. And that’s just fine!')],
    after: [L('Ma Bestiole a rougi… de honte, ou de couleur ?', 'My Critter went red… with shame, or with colour?')],
  }),
  T({
    id: 'r9c', name: L('Collégienne Suzon', 'Schoolgirl Suzon'), party: [{ species: '057', level: 34 }, { species: '053', level: 34 }, { species: '028', level: 35 }, { species: '047', level: 35 }], money: 1100,
    before: [L('Dans la marge, j’écris mes notes. Toi, tu vas avoir une mauvaise note !', 'I write my notes in the margin. You’re going to get a bad mark!')],
    after: [L('Zéro pointé… pour moi.', 'A big zero… for me.')],
  }),
  T({
    id: 'r9d', name: L('Gribouilleur Titouan', 'Doodler Titouan'), party: [{ species: '043', level: 34 }, { species: '049', level: 34 }, { species: '010', level: 34 }, { species: '064', level: 35 }], money: 1150,
    before: [L('Ici, on dessine sans gomme. Si on rate, on continue !', 'Here, we draw without an eraser. If we get it wrong, we keep going!')],
    after: [L('J’ai raté… mais je continue !', 'I got it wrong… but I keep going!')],
  }),
  T({
    id: 'r9e', name: L('Sbire Gomme', 'Eraser Grunt'), party: [{ species: '064', level: 33 }, { species: '055', level: 33 }, { species: '057', level: 34 }, { species: '075', level: 34 }], money: 1150, grey: true,
    before: [L('Les brouillons, ça se jette. Hop, à la poubelle !', 'Drafts get thrown away. Straight in the bin!')],
    after: [L('Mes Bestioles reviennent en couleurs… même ici ?', 'My Critters are getting their colours back… even here?')],
  }),
  T({
    id: 'r9f', name: L('Croqueuse Aya', 'Sketcher Aya'), party: [{ species: '064', level: 33 }, { species: '048', level: 33 }, { species: '052', level: 34 }, { species: '028', level: 34 }], money: 1150,
    before: [L('Un trait, deux traits… et hop, une Bestiole ! Pas besoin qu’elle soit parfaite.', 'One line, two lines… and there, a Critter! It doesn’t need to be perfect.')],
    after: [L('Elle était parfaite, finalement.', 'It was perfect after all.')],
  }),
  // ---------------------------------------------------------------- Act 4: the Sketch Forest
  T({
    id: 'es1', name: L('Bûcheronne Gaëlle', 'Lumberjill Gaelle'), party: [{ species: '048', level: 36 }, { species: '068', level: 36 }, { species: '040', level: 36 }, { species: '064', level: 37 }], money: 1200,
    before: [L('Ces arbres ne sont que des traits. Je n’arrive même pas à les couper !', 'These trees are only lines. I can’t even chop them down!')],
    after: [L('Je vais plutôt les colorier.', 'I’ll colour them in instead.')],
  }),
  T({
    id: 'es2', name: L('Médium Sélène', 'Medium Selene'), party: [{ species: '064', level: 37 }, { species: '088', level: 37 }, { species: '066', level: 38 }, { species: '053', level: 38 }], money: 1200,
    before: [L('Les esquisses chuchotent. Elles disent que tu doutes, toi aussi…', 'The sketches whisper. They say you have doubts too…')],
    after: [L('Elles disent aussi que tu avances quand même.', 'They also say you keep going anyway.')],
  }),
  T({
    id: 'es3', name: L('Randonneur Hector', 'Hiker Hector'), party: [{ species: '053', level: 37 }, { species: '041', level: 37 }, { species: '040', level: 38 }, { species: '081', level: 38 }], money: 1200,
    before: [L('Je me suis perdu. Tout se ressemble quand rien n’est colorié !', 'I’m lost. Everything looks the same when nothing is coloured in!')],
    after: [L('Bon, je te suis, alors ?', 'All right, shall I follow you then?')],
  }),
  T({
    id: 'es4', name: L('Sbire Gomme', 'Eraser Grunt'), party: [{ species: '064', level: 36 }, { species: '057', level: 36 }, { species: '043', level: 36 }, { species: '010', level: 37 }], money: 1250, grey: true,
    before: [L('La Forteresse est tout près. Tu n’iras pas plus loin !', 'The Fortress is very close. You won’t get any further!')],
    after: [L('Bon… tu iras plus loin.', 'Fine… you’ll get further.')],
  }),
  T({
    id: 'es5', name: L('Peintre Ulysse', 'Painter Ulysses'), party: [{ species: '010', level: 35 }, { species: '017', level: 35 }, { species: '018', level: 35 }, { species: '019', level: 36 }], money: 1250,
    before: [L('Je suis venu colorier la forêt. Mais par où commencer ?', 'I came to colour the forest in. But where do I start?')],
    after: [L('Par le début, sans doute.', 'At the beginning, I suppose.')],
  }),
  T({
    id: 'es6', name: L('Sbire Gomme', 'Eraser Grunt'), party: [{ species: '066', level: 36 }, { species: '046', level: 36 }, { species: '055', level: 37 }, { species: '057', level: 37 }], money: 1250, grey: true,
    before: [L('Le patron a construit une Gomme Géante. Bientôt, le monde entier sera blanc !', 'The boss built a Giant Eraser. Soon the whole world will be white!')],
    after: [L('Bon, peut-être pas le monde entier…', 'Well, maybe not the whole world…')],
  }),
  // ---------------------------------------------------------------- Act 4: the Eraser Fortress
  T({
    id: 'f1g1', name: L('Sbire Gomme', 'Eraser Grunt'), party: [{ species: '064', level: 38 }, { species: '043', level: 38 }, { species: '057', level: 38 }, { species: '010', level: 39 }], money: 1300, grey: true,
    before: [L('Ça dépasse ! Ça dépasse de partout ! Moi, je gomme tout ce qui dépasse.', 'It goes over the lines! Over the lines everywhere! I rub out everything that goes over.')],
    after: [L('Ça dépasse… mais c’est joli.', 'It goes over… but it’s pretty.')],
  }),
  T({
    id: 'f1g2', name: L('Sbire Gomme', 'Eraser Grunt'), party: [{ species: '064', level: 37 }, { species: '075', level: 37 }, { species: '055', level: 38 }, { species: '059', level: 38 }], money: 1300, grey: true,
    before: [L('Les autres dessinent mieux que toi. Tout le monde le sait !', 'Everyone else draws better than you. Everybody knows it!')],
    after: [L('Bon. Peut-être pas TOUT le monde.', 'Well. Maybe not EVERYBODY.')],
  }),
  T({
    id: 'f1g3', name: L('Sbire Gomme', 'Eraser Grunt'), party: [{ species: '047', level: 38 }, { species: '057', level: 39 }, { species: '066', level: 39 }, { species: '008', level: 39 }], money: 1300, grey: true,
    before: [L('Recommence ! Recommence encore ! C’est jamais assez bien !', 'Start again! Start again! It’s never good enough!')],
    after: [L('C’était… assez bien.', 'That was… good enough.')],
  }),
  T({
    id: 'f2a', name: L('Sbire Gomme', 'Eraser Grunt'), party: [{ species: '053', level: 38 }, { species: '043', level: 38 }, { species: '046', level: 38 }, { species: '055', level: 39 }], money: 1350, grey: true,
    before: [L('C’est moche. C’est tout moche. … Je dis ça à tout le monde, tu sais.', 'It’s ugly. It’s all ugly. … I say that to everyone, you know.')],
    after: [L('C’est pas si moche, en fait.', 'It’s not that ugly, actually.')],
  }),
  T({
    id: 'f2b', name: L('Sbire Gomme', 'Eraser Grunt'), party: [{ species: '064', level: 39 }, { species: '059', level: 39 }, { species: '057', level: 40 }, { species: '010', level: 40 }], money: 1350, grey: true,
    before: [L('Une page blanche ne se trompe jamais. Toi, si !', 'A blank page is never wrong. You are!')],
    after: [L('Tu t’es trompé… et tu as gagné quand même ?', 'You got it wrong… and you still won?')],
  }),
  T({
    id: 'f2c', name: L('Sbire Gomme', 'Eraser Grunt'), party: [{ species: '053', level: 39 }, { species: '066', level: 39 }, { species: '043', level: 40 }, { species: '046', level: 40 }], money: 1350, grey: true,
    before: [L('Tu ne seras jamais {g:une vraie artiste|un vrai artiste} !', 'You’ll never be a real artist!')],
    after: [L('… Si, peut-être, en fait.', '… Maybe you will, actually.')],
  }),
  // the three admins, one last time: they are the little voices of doubt
  T({
    id: 'buvard2', name: L('Capitaine Buvard', 'Captain Blotter'), money: 5000, grey: true, afterScript: 'buvardFresque',
    party: [{ species: '042', level: 40 }, { species: '059', level: 40 }, { species: '070', level: 41 }, { species: '100', level: 39 }, { species: '008', level: 42, item: 'baie-doree' }],
    before: [
      L('Ho ho… Te revoilà. Tu sais ce que je suis, au fond ?', 'Ho ho… You again. Do you know what I really am?'),
      L('La petite voix qui dit : « les autres font mieux ». Je bois tout ton courage, comme l’encre.', 'The little voice that says: “the others do it better”. I soak up all your courage, like ink.'),
    ],
    after: [L('Les autres font autrement. Pas mieux. Je crois que je viens de comprendre…', 'The others do it differently. Not better. I think I just understood…')],
  }),
  T({
    id: 'rature3', name: L('Admin Rature', 'Admin Smudge'), money: 5000, grey: true, afterScript: 'ratureTraits',
    party: [{ species: '036', level: 39 }, { species: '057', level: 39 }, { species: '055', level: 39 }, { species: '010', level: 40 }, { species: '011', level: 40, item: 'baie-doree' }],
    before: [
      L('Moi, je suis la voix qui dit : « ça dépasse, c’est raté, barre tout ». On n’est pas méchants, tu sais.', 'I’m the voice that says: “it goes over, it’s wrong, cross it all out”. We’re not mean, you know.'),
      L('On est juste… les petites voix dans la tête de quelqu’un qui dessine.', 'We’re just… the little voices in the head of someone who draws.'),
    ],
    after: [L('Une rature, ça peut aussi devenir un dessin. Je ne savais pas.', 'A crossing-out can become a drawing too. I didn’t know that.')],
  }),
  T({
    id: 'blanche3', name: L('Admin Blanche', 'Admin Whiteout'), money: 5000, grey: true,
    party: [{ species: '043', level: 42 }, { species: '046', level: 43 }, { species: '059', level: 43 }, { species: '066', level: 43 }, { species: '049', level: 44, item: 'baie-doree' }],
    before: [
      L('Et moi, je suis celle qui dit : « recommence tout, depuis le début, sur une page blanche ».', 'And I’m the one who says: “start it all again, from the beginning, on a blank page”.'),
      L('Derrière moi, la Gomme Géante. Et au Bord de la Page, le patron t’attend : il veut finir de gommer ton cocon.', 'Behind me, the Giant Eraser. And at the Edge of the Page, the boss is waiting: he wants to finish rubbing out your cocoon.'),
    ],
    after: [L('Une page blanche, c’est joli… surtout quand quelqu’un dessine dessus.', 'A blank page is pretty… especially when someone draws on it.')],
  }),
  // ---------------------------------------------------------------- Route Blanche, before the Edge of the Page
  T({
    id: 'rbGaston', name: L('Somnambule Gaston', 'Sleepwalker Gaston'), party: [{ species: '049', level: 40 }, { species: '085', level: 40 }, { species: '010', level: 41 }, { species: '008', level: 41 }], money: 1400,
    before: [L('Zzz… Je rêve que je me bats… Zzz… contre toi…', 'Zzz… I’m dreaming I’m battling… Zzz… you…')],
    after: [L('Zzz… Je rêve que j’ai perdu. Zzz…', 'Zzz… I’m dreaming I lost. Zzz…')],
  }),
  T({
    id: 'rbMila', name: L('Rêveuse Mila', 'Dreamer Mila'), party: [{ species: '028', level: 40 }, { species: '047', level: 41 }, { species: '014', level: 41 }, { species: '087', level: 40 }], money: 1400,
    before: [L('Au bout de cette route, la page s’arrête. Après, il n’y a plus que le réveil…', 'At the end of this road, the page stops. After that, there’s only waking up…')],
    after: [L('Bon réveil, alors !', 'Have a nice waking up, then!')],
  }),
  T({
    id: 'effaceur', name: L('Le Grand Effaceur', 'The Great Eraser'), money: 0, grey: true, fairCopy: 'dark',
    party: [{ species: '008', level: 39 }, { species: '007', level: 39 }, { species: '027', level: 39 }, { species: '010', level: 40 }, { species: '011', level: 42 }],
    before: [],
    after: [L('Tes… dessins… ils sont pleins… de couleurs…', 'Your… drawings… they’re full… of colours…')],
  }),
  // each Atelier's own trainers (src/data/teams)
  ...ATELIER_TEAMS,
].map((t) => [t.id, t]));

/** The rival's team on Route Blanche: his starter, grown to its level, is the ace. */
/**
 * The rival's starter in the last battle, by the starter it took. As a fair copy each one weighs differently against
 * the starter that beats it (a Dragon Dragobraise shrugs off a water team), so each is tuned on its own with
 * `npm run balance`.
 */
const RIVAL_ACE: Record<string, { level: number; item?: string }> = {
  '001': { level: 43 }, '002': { level: 41 }, '003': { level: 42, item: 'baie-doree' },
};

export function rivalFinalTeam(rivalStarter: string): TrainerDef['party'] {
  const ace = RIVAL_ACE[rivalStarter] ?? RIVAL_ACE['001'];
  return [
    { species: '036', level: 41, item: 'plume-vive' }, { species: '008', level: 41 }, { species: '053', level: 41, item: 'lunettes-tetues' },
    { species: '007', level: 41 }, { species: '027', level: 41 }, { species: grownForm(rivalStarter, ace.level), ...ace },
  ];
}

/** The rival's team at the Lac des Couleurs: his starter, grown, is the ace. */
export function rivalLacTeam(rivalStarter: string): TrainerDef['party'] {
  return [{ species: '026', level: 18 }, { species: '004', level: 18 }, { species: grownForm(rivalStarter, 20), level: 20 }];
}

/** The rival picks the starter that yours beats, so the very first battle is winnable. */
export const RIVAL_COUNTER: Record<string, string> = { '001': '003', '002': '001', '003': '002' };
