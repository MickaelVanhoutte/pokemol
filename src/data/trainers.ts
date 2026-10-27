import { L, type LText } from '../i18n';
import { createMon, MAX_LEVEL, type Mon } from '../engine/pk/creature';
import { prefs, type Difficulty } from '../state/prefs';
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
    id: 'pastelT1', name: L('Apprentie Lou', 'Apprentice Lou'), party: [{ species: '012', level: 5 }, { species: '013', level: 4 }], money: 210,
    before: [L('Ici on dessine des ailes, des antennes et des pattes partout !', 'Here we draw wings, antennae and legs everywhere!')],
    after: [L('Je vais redessiner mes Bestioles en plus fortes !', 'I’ll redraw my Critters stronger!')],
  }),
  T({
    id: 'pastelT2', name: L('Apprenti Malo', 'Apprentice Malo'), party: [{ species: '012', level: 6 }, { species: '016', level: 4 }], money: 240,
    before: [L('Mireille m’a appris à colorier sans dépasser. Toi, tu dépasses ?', 'Mireille taught me to colour inside the lines. Do you go over them?')],
    after: [L('Bon… j’ai un peu dépassé.', 'Well… I went a bit over the lines.')],
  }),
  T({
    id: 'mireille', name: L('Maître d’Atelier Mireille', 'Atelier Master Mireille'), money: 1200, badge: 'pastel',
    party: [{ species: '015', level: 7 }, { species: '007', level: 7 }],
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
    id: 'gomme2', name: L('Sbire Gomme', 'Eraser Grunt'), party: [{ species: '009', level: 9 }, { species: '013', level: 10 }], money: 360, grey: true, afterScript: 'boisRestore', storyFlag: 'a1.bois',
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
    party: [{ species: '013', level: 10 }, { species: '008', level: 8 }],
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
    id: 'bob', name: L('Mineur Bob', 'Miner Bob'), party: [{ species: '030', level: 13 }], money: 640,
    before: [L('Mon Ronflon creuse des tunnels en ronflant !', 'My Snoozle digs tunnels while it snores!')],
    after: [L('Il s’est rendormi. Typique.', 'It fell asleep again. Typical.')],
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
    id: 'r3b', name: L('Dessinatrice Romane', 'Sketcher Romane'), party: [{ species: '005', level: 13 }, { species: '051', level: 14 }], money: 420,
    before: [L('Ne bouge plus, je dessine le paysage ! … Bon, tu as bougé. Combat !', 'Hold still, I’m drawing the view! … Right, you moved. Battle!')],
    after: [L('Mon dessin est raté, mais toi tu es réussi.', 'My drawing is ruined, but you did great.')],
  }),
  T({
    id: 'r3a', name: L('Nageur Loïc', 'Swimmer Loic'), party: [{ species: '069', level: 13 }, { species: '013', level: 14 }], money: 420,
    before: [L('Je m’entraîne pour la grande traversée du port. Et toi, tu t’entraînes ?', 'I’m training for the big swim across the harbour. Are you training too?')],
    after: [L('Je vais nager pour me consoler.', 'I’ll go for a swim to cheer up.')],
  }),
  T({
    id: 'r3gus', name: L('Pêcheur Gus', 'Fisher Gus'), party: [{ species: '003', level: 14 }, { species: '069', level: 14 }], money: 400,
    before: [L('Ça mord ! … Ah non, c’est toi. Bon, combat !', 'A bite! … Oh no, it’s you. Fine, battle!')],
    after: [L('Le poisson du jour, c’était moi…', 'Catch of the day: me…')],
  }),
  T({
    id: 'r3lise', name: L('Gamine Lise', 'Kid Lise'), party: [{ species: '004', level: 12 }, { species: '006', level: 14 }], money: 380,
    before: [L('J’ai peint mes Bestioles à l’aquarelle, elles brillent quand il pleut !', 'I painted my Critters in watercolour, they shine when it rains!')],
    after: [L('Il ne pleut même pas…', 'It’s not even raining…')],
  }),
  // ---------------------------------------------------------------- Atelier Aquarelle
  T({
    id: 'aquaT1', name: L('Nageuse Lila', 'Swimmer Lila'), party: [{ species: '006', level: 15 }, { species: '005', level: 15 }], money: 400,
    before: [L('Un, deux, trois… Plouf ! On se bat dans l’eau ou sur le sable ?', 'One, two, three… Splash! Shall we battle in the water or on the sand?')],
    after: [L('J’ai bu la tasse…', 'I swallowed some water…')],
  }),
  T({
    id: 'aquaT2', name: L('Marin Yann', 'Sailor Yann'), party: [{ species: '058', level: 15 }, { species: '003', level: 16 }], money: 450,
    before: [L('Mon Clapotin tambourine sur sa carapace pour donner le rythme aux vagues !', 'My Splashell drums on its shell to keep the waves in time!')],
    after: [L('Les vagues ont perdu le rythme…', 'The waves lost the beat…')],
  }),
  T({
    id: 'marine', name: L('Maître d’Atelier Marine', 'Atelier Master Marine'), money: 2000, badge: 'aquarelle', afterScript: 'marineAfter', storyFlag: 'a2.bridge',
    party: [{ species: '006', level: 15 }, { species: '005', level: 16 }, { species: '003', level: 18 }],
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
    id: 'r4a', name: L('Livreur Nino', 'Courier Nino'), party: [{ species: '004', level: 16 }, { species: '056', level: 17 }], money: 500,
    before: [L('Je livre des feutres neufs à Ville-Feutre. Mais d’abord, une petite livraison de coups !', 'I’m delivering new markers to Felt City. But first, a little delivery of hits!')],
    after: [L('Livraison annulée…', 'Delivery cancelled…')],
  }),
  T({
    id: 'r4b', name: L('Musicienne Clara', 'Musician Clara'), party: [{ species: '005', level: 17 }, { species: '067', level: 17 }], money: 520,
    before: [L('Ville-Feutre a perdu ses couleurs… et sa musique. Je joue pour la réveiller. Tu danses ?', 'Felt City lost its colours… and its music. I play to wake it up. Will you dance?')],
    after: [L('Tu as du rythme, toi !', 'You’ve got rhythm!')],
  }),
  T({
    id: 'r4maud', name: L('Randonneuse Maud', 'Hiker Maud'), party: [{ species: '067', level: 15 }, { species: '008', level: 17 }], money: 520,
    before: [L('Mon Ronflon porte mon sac. Enfin, quand il ne dort pas.', 'My Snoozle carries my bag. Well, when it’s not asleep.')],
    after: [L('Il dort. Je porte le sac. Comme d’habitude.', 'It’s asleep. I carry the bag. As usual.')],
  }),
  T({
    id: 'r4tim', name: L('Gamin Tim', 'Kid Tim'), party: [{ species: '004', level: 16 }, { species: '035', level: 17 }], money: 400,
    before: [L('Deux Zigzou, deux fois plus d’étincelles !', 'Two Ziggles, twice the sparks!')],
    after: [L('Zéro étincelle…', 'Zero sparks…')],
  }),
  T({
    id: 'r4gomme', name: L('Sbire Gomme', 'Eraser Grunt'), party: [{ species: '033', level: 17 }, { species: '056', level: 17 }], money: 500, grey: true,
    before: [L('Ville-Feutre ? On l’a toute grisée ! C’est bien plus calme comme ça.', 'Felt City? We greyed it all out! It’s much quieter like that.')],
    after: [L('Pfff… Va donc voir Rature à l’entrepôt, il te gommera, lui !', 'Pfff… Go see Smudge at the warehouse, he’ll rub you out!')],
  }),
  // ---------------------------------------------------------------- Entrepôt Gomme
  T({
    id: 'e1g1', name: L('Sbire Gomme', 'Eraser Grunt'), party: [{ species: '013', level: 18 }, { species: '004', level: 18 }], money: 520, grey: true,
    before: [L('Intrus ! Ici on stocke les couleurs aspirées. Tu n’en auras pas une goutte !', 'Intruder! This is where we store the sucked-up colours. You won’t get a drop!')],
    after: [L('Une goutte de rouge vient de s’échapper…', 'A drop of red just escaped…')],
  }),
  T({
    id: 'e1g2', name: L('Sbire Gomme', 'Eraser Grunt'), party: [{ species: '009', level: 17 }], money: 540, grey: true,
    before: [L('Le Grand Effaceur dit que le monde serait plus beau tout blanc. Comme une page neuve !', 'The Great Eraser says the world would be prettier all white. Like a brand-new page!')],
    after: [L('Une page blanche, c’est quand même un peu triste…', 'A blank page is a bit sad, really…')],
  }),
  T({
    id: 'e1g3', name: L('Sbire Gomme', 'Eraser Grunt'), party: [{ species: '054', level: 17 }, { species: '007', level: 18 }], money: 540, grey: true,
    before: [L('Mes Bestioles n’ont plus de couleurs, mais elles mordent encore !', 'My Critters have no colours left, but they still bite!')],
    after: [L('Elles ont retrouvé leurs couleurs… et elles sont toutes contentes. Bizarre.', 'They got their colours back… and they look so happy. Weird.')],
  }),
  T({
    id: 'e2g1', name: L('Sbire Gomme', 'Eraser Grunt'), party: [{ species: '056', level: 17 }, { species: '010', level: 18 }], money: 560, grey: true,
    before: [L('Personne ne dérange l’Admin Rature !', 'Nobody disturbs Admin Smudge!')],
    after: [L('Bon… Dérange-le, alors.', 'Fine… Disturb him, then.')],
  }),
  T({
    id: 'rature', name: L('Admin Rature', 'Admin Smudge'), money: 2600, grey: true, afterScript: 'feutreRestore', storyFlag: 'a2.feutre',
    party: [{ species: '013', level: 18 }, { species: '009', level: 17 }, { species: '010', level: 19 }],
    before: [
      L('Tiens, tiens. C’est toi qui recolories tout derrière nous ?', 'Well, well. So you’re the one colouring everything back in behind us?'),
      L('Le Grand Effaceur a raison : ces gribouillis d’enfant ne valent rien. Je vais t’effacer, toi aussi !', 'The Great Eraser is right: these childish scribbles are worthless. I’ll rub you out too!'),
    ],
    after: [L('Impossible… Les couleurs… elles reviennent toutes !', 'Impossible… The colours… they’re all coming back!')],
  }),
  // ---------------------------------------------------------------- Atelier Fluo
  T({
    id: 'fluoT1', name: L('Électricienne Volta', 'Electrician Volta'), party: [{ species: '035', level: 18 }, { species: '004', level: 19 }], money: 540,
    before: [L('Attention, ça pique ! Zzzt !', 'Careful, it stings! Bzzt!')],
    after: [L('Court-circuit…', 'Short circuit…')],
  }),
  T({
    id: 'fluoT2', name: L('Rockeur Jimmy', 'Rocker Jimmy'), party: [{ species: '005', level: 18 }, { species: '004', level: 18 }], money: 560,
    before: [L('Ma Chantouille chante, mon Zigzou fait les lumières. On est un groupe !', 'My Croonball sings, my Ziggle does the lights. We’re a band!')],
    after: [L('Le concert est annulé…', 'The concert is cancelled…')],
  }),
  T({
    id: 'zelie', name: L('Maître d’Atelier Zélie', 'Atelier Master Zelie'), money: 2400, badge: 'fluo',
    party: [{ species: '004', level: 19 }, { species: '005', level: 19 }, { species: '004', level: 21, item: 'baie-bleue' }],
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
    id: 'mfOlga', name: L('Montagnarde Olga', 'Mountaineer Olga'), party: [{ species: '029', level: 19 }, { species: '067', level: 19 }], money: 600,
    before: [L('Le fusain, ça salit les mains ! Et les Bestioles aussi !', 'Charcoal makes your hands dirty! And your Critters too!')],
    after: [L('Je vais me laver les mains…', 'I’m going to wash my hands…')],
  }),
  T({
    id: 'mfRemi', name: L('Spéléo Rémi', 'Caver Remi'), party: [{ species: '065', level: 18 }, { species: '030', level: 19 }], money: 620,
    before: [L('Dans le noir, on ne voit que les yeux des Brumouille. Brr !', 'In the dark you only see the Mistchiefs’ eyes. Brr!')],
    after: [L('Allume la lumière en sortant…', 'Turn off the light on your way out…')],
  }),
  T({
    id: 'mfArmand', name: L('Géologue Armand', 'Geologist Armand'), party: [{ species: '065', level: 19 }, { species: '067', level: 19 }], money: 640,
    before: [L('Ce mont est fait de fusain pur ! Touche, ça noircit les doigts. Et les Bestioles, ça les rend coriaces !', 'This mountain is pure charcoal! Touch it, it blackens your fingers. And it makes Critters tough!')],
    after: [L('J’ai les doigts noirs et le moral aussi.', 'Black fingers, and a black mood too.')],
  }),
  T({
    id: 'mfErmite', name: L('Ermite du Fusain', 'Charcoal Hermit'), party: [{ species: '010', level: 20 }, { species: '008', level: 18 }], money: 700,
    before: [L('Je dessine au fusain depuis cent ans. Tout est gris, ici… et c’est très bien comme ça.', 'I’ve drawn in charcoal for a hundred years. Everything is grey here… and that’s just fine.')],
    after: [L('Gris, oui… mais avec des nuances. Bien joué.', 'Grey, yes… but with shades. Well played.')],
  }),
  // ---------------------------------------------------------------- Atelier Braise
  T({
    id: 'braiseT1', name: L('Jongleur Paco', 'Juggler Paco'), party: [{ species: '002', level: 20 }, { species: '013', level: 20 }], money: 600,
    before: [L('Je jongle avec des braises ! Enfin, mon Braisou jongle.', 'I juggle embers! Well, my Embersal does.')],
    after: [L('Aïe, ça brûle…', 'Ouch, that burns…')],
  }),
  T({
    id: 'braiseT2', name: L('Forgeronne Inès', 'Smith Ines'), party: [{ species: '008', level: 19 }, { species: '021', level: 20 }], money: 640,
    before: [L('Ici on forge des crayons à la chaleur du volcan !', 'Here we forge pencils in the volcano’s heat!')],
    after: [L('Mon crayon a fondu…', 'My pencil melted…')],
  }),
  T({
    id: 'ambre', name: L('Maître d’Atelier Ambre', 'Atelier Master Amber'), money: 2800, badge: 'braise',
    party: [{ species: '002', level: 21 }, { species: '008', level: 18 }, { species: '021', level: 21, item: 'baie-bleue' }],
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
    id: 'elsa', name: L('Médium Elsa', 'Medium Elsa'), party: [{ species: '009', level: 28 }, { species: '065', level: 29 }], money: 900,
    before: [L('Deux brumes valent mieux qu’une !', 'Two mists are better than one!')],
    after: [L('La brume se dissipe…', 'The mist is clearing…')],
  }),
  T({
    id: 'pif', name: L('Farceur Pif', 'Prankster Pif'), party: [{ species: '052', level: 29 }, { species: '010', level: 30 }], money: 960,
    before: [L('Bouh ! … Tu n’as pas eu peur ? Bon, on se bat alors.', 'Boo! … Not scared? Fine, let’s battle then.')],
    after: [L('Même mes mains de brume n’ont pas suffi !', 'Even my mist hands weren’t enough!')],
  }),
  T({
    id: 'rose', name: L('Conteuse Rose', 'Storyteller Rose'), party: [{ species: '005', level: 29 }, { species: '006', level: 30 }], money: 940,
    before: [L('Il était une fois… un combat terrible !', 'Once upon a time… a terrible battle!')],
    after: [L('…et tu vécus heureux et victorieux. Fin.', '…and you lived happily and victoriously. The end.')],
  }),
  T({
    id: 'hugo', name: L('Magicien Hugo', 'Magician Hugo'), party: [{ species: '007', level: 30 }, { species: '004', level: 31 }], money: 1000,
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
    id: 'r6a', name: L('Danseuse Coralie', 'Dancer Coralie'), party: [{ species: '063', level: 27 }, { species: '006', level: 27 }], money: 700,
    before: [L('Un pas à gauche, une paillette à droite… et on se bat !', 'A step to the left, glitter to the right… and we battle!')],
    after: [L('J’ai perdu le rythme…', 'I lost the beat…')],
  }),
  T({
    id: 'r6b', name: L('Collégien Bastien', 'Schoolboy Bastien'), party: [{ species: '052', level: 27 }, { species: '004', level: 28 }], money: 680,
    before: [L('J’ai dessiné mes Bestioles dans la marge de mon cahier de maths !', 'I drew my Critters in the margin of my maths notebook!')],
    after: [L('La maîtresse avait raison : il faut écouter en classe.', 'The teacher was right: you should listen in class.')],
  }),
  // ---------------------------------------------------------------- Atelier Paillette
  T({
    id: 'paillT1', name: L('Paillettine Mia', 'Sparkler Mia'), party: [{ species: '006', level: 28 }, { species: '005', level: 28 }], money: 720,
    before: [L('Ça brille, ça brille ! Tu vas en avoir plein les yeux !', 'Sparkle, sparkle! You’ll be dazzled!')],
    after: [L('Il y a des paillettes partout maintenant…', 'There’s glitter everywhere now…')],
  }),
  T({
    id: 'paillT2', name: L('Magicienne Luce', 'Magician Luce'), party: [{ species: '005', level: 29 }, { species: '006', level: 29 }], money: 740,
    before: [L('Un coup de baguette pailletée, et pouf !', 'One wave of my glitter wand, and poof!')],
    after: [L('Le tour a raté…', 'The trick failed…')],
  }),
  T({
    id: 'celestine', name: L('Maître d’Atelier Célestine', 'Atelier Master Celestine'), money: 3200, badge: 'paillette',
    party: [{ species: '006', level: 31 }, { species: '005', level: 32, item: 'baie-reveil' }, { species: '028', level: 34, item: 'baie-doree' }],
    before: [L('Bienvenue dans mon atelier étoilé ! Chaque paillette ici est un vœu. Voyons si le tien est le plus fort !', 'Welcome to my starry atelier! Every speck of glitter here is a wish. Let’s see if yours is the strongest!')],
    after: [
      L('Ton vœu brille plus que tous les miens. Voici le Badge Paillette !', 'Your wish shines brighter than all of mine. Here is the Glitter Badge!'),
      L('La Tour Brumeuse, dans le Bois, a été envahie par la Team Gomme. Avec mon badge, tu pourras y entrer. Le Ballon-Crayon de l’Auberge t’y emmènera vite !', 'The Misty Tower, in the Woods, has been taken over by Team Gomme. With my badge you can go in. The Pencil Balloon at the Inn will take you there fast!'),
    ],
  }),
  // ---------------------------------------------------------------- Tour Brumeuse (taken by Team Gomme)
  T({
    id: 'tgomme1', name: L('Sbire Gomme', 'Eraser Grunt'), party: [{ species: '055', level: 29 }, { species: '010', level: 30 }], money: 760, grey: true,
    before: [L('Cette tour est à nous ! Les fantômes aussi. Ils sont tout gris maintenant, c’est plus calme.', 'This tower is ours! The ghosts too. They’re all grey now, it’s quieter.')],
    after: [L('Le fantôme a retrouvé ses couleurs… et il me tire la langue.', 'The ghost got its colours back… and it’s sticking its tongue out at me.')],
  }),
  T({
    id: 'tgomme2', name: L('Sbire Gomme', 'Eraser Grunt'), party: [{ species: '056', level: 29 }, { species: '026', level: 30 }], money: 760, grey: true,
    before: [L('L’Admin Blanche est au sommet. Tu ne passeras pas !', 'Admin Whiteout is at the top. You shall not pass!')],
    after: [L('Bon, passe…', 'Fine, pass…')],
  }),
  T({
    id: 'blanche', name: L('Admin Blanche', 'Admin Whiteout'), money: 3600, grey: true, afterScript: 'towerFreed', storyFlag: 'a3.tour',
    party: [{ species: '043', level: 30 }, { species: '010', level: 31 }, { species: '007', level: 30 }, { species: '008', level: 31 }],
    before: [
      L('Chut. Ici, tout est blanc, propre, silencieux. Plus un trait qui dépasse.', 'Shh. Here everything is white, clean, silent. Not a single line out of place.'),
      L('Les fantômes riaient trop fort. Je les ai corrigés. Toi aussi, je vais te corriger.', 'The ghosts laughed too loud. I corrected them. I’ll correct you too.'),
    ],
    after: [L('Tu… tu as fait des taches de couleur partout…', 'You… you got colour stains everywhere…')],
  }),
  // ---------------------------------------------------------------- Route des Gouaches
  T({
    id: 'r7a', name: L('Botaniste Flore', 'Botanist Flora'), party: [{ species: '063', level: 30 }, { species: '007', level: 31 }], money: 780,
    before: [L('Je collectionne les papillons… en photo, bien sûr !', 'I collect butterflies… in photos, of course!')],
    after: [L('Belle collection de victoires, toi.', 'Nice collection of victories you’ve got.')],
  }),
  T({
    id: 'r7b', name: L('Randonneur Jules', 'Hiker Jules'), party: [{ species: '068', level: 31 }, { species: '039', level: 32 }], money: 800,
    before: [L('Mon Ronflon a mangé tout le pique-nique. On se bat pour me consoler ?', 'My Snoozle ate the whole picnic. Battle to cheer me up?')],
    after: [L('Je ne suis pas consolé…', 'I’m not cheered up…')],
  }),
  // ---------------------------------------------------------------- Atelier Gouache
  T({
    id: 'gouaT1', name: L('Jardinière Rosa', 'Gardener Rosa'), party: [{ species: '063', level: 31 }, { species: '024', level: 32 }], money: 820,
    before: [L('Ma Minousse ronronne et les fleurs poussent. Regarde !', 'My Sproutkit purrs and the flowers grow. Look!')],
    after: [L('Les fleurs se sont fanées…', 'The flowers wilted…')],
  }),
  T({
    id: 'gouaT2', name: L('Paysagiste Arno', 'Landscaper Arno'), party: [{ species: '012', level: 31 }, { species: '007', level: 32 }], money: 820,
    before: [L('Un jardin sans papillons, c’est un dessin sans couleurs !', 'A garden without butterflies is a drawing without colours!')],
    after: [L('Mes papillons sont partis butiner ailleurs…', 'My butterflies went to forage elsewhere…')],
  }),
  T({
    id: 'basile', name: L('Maître d’Atelier Basile', 'Atelier Master Basil'), money: 3600, badge: 'gouache',
    party: [{ species: '007', level: 35, item: 'baie-menthe' }, { species: '020', level: 36 }, { species: '024', level: 38, item: 'baie-doree' }],
    before: [L('La gouache, c’est épais, c’est généreux, ça ne s’efface pas facilement. Comme mes Bestioles !', 'Gouache is thick, generous, hard to rub out. Just like my Critters!')],
    after: [
      L('Quelle couche de talent ! Voici le Badge Gouache.', 'What a thick coat of talent! Here is the Gouache Badge.'),
      L('Au nord, la Cité-Encre. Le chef de la Team Gomme se cache dans l’usine… Bats d’abord Nocturne, sinon les gardes ne te laisseront pas entrer.', 'Up north is Ink City. The Team Gomme boss hides in the factory… Beat Nocturne first, or the guards won’t let you in.'),
    ],
  }),
  // ---------------------------------------------------------------- Route de l’Encre
  T({
    id: 'r8a', name: L('Médium Nyx', 'Medium Nyx'), party: [{ species: '009', level: 34 }, { species: '010', level: 35 }], money: 860,
    before: [L('L’encre parle… Elle dit que tu vas perdre.', 'The ink speaks… It says you will lose.')],
    after: [L('L’encre a bavé.', 'The ink smudged.')],
  }),
  T({
    id: 'r8b', name: L('Sbire Gomme', 'Eraser Grunt'), party: [{ species: '057', level: 35 }, { species: '004', level: 35 }], money: 860, grey: true,
    before: [L('Le patron prépare la Grande Gomme. Bientôt, tout sera blanc !', 'The boss is preparing the Big Rub. Soon everything will be white!')],
    after: [L('Pas si vite, alors…', 'Not so fast, then…')],
  }),
  // ---------------------------------------------------------------- Phare de l’Encrier (lighthouse)
  T({
    id: 'ph1a', name: L('Sbire Gomme', 'Eraser Grunt'), party: [{ species: '055', level: 34 }, { species: '007', level: 35 }], money: 880, grey: true,
    before: [L('Le capitaine ne veut personne dans son phare. Demi-tour !', 'The captain wants nobody in his lighthouse. Turn back!')],
    after: [L('Le capitaine va être fâché…', 'The captain is going to be cross…')],
  }),
  T({
    id: 'ph1b', name: L('Sbire Gomme', 'Eraser Grunt'), party: [{ species: '004', level: 35 }, { species: '008', level: 36 }], money: 880, grey: true,
    before: [L('L’Encre de Minuit, c’est pour éteindre toutes les étoiles du dessin !', 'The Midnight Ink is for putting out every star in the drawing!')],
    after: [L('Bon, peut-être pas toutes les étoiles…', 'Well, maybe not all the stars…')],
  }),
  T({
    id: 'ph2a', name: L('Sbire Gomme', 'Eraser Grunt'), party: [{ species: '057', level: 36 }, { species: '010', level: 36 }], money: 900, grey: true,
    before: [L('Tu as poussé nos blocs de gomme ? Tu vas le regretter !', 'You pushed our eraser blocks? You’ll regret it!')],
    after: [L('Pfff… Ils étaient lourds, en plus.', 'Phew… They were heavy, too.')],
  }),
  T({
    id: 'buvard', name: L('Capitaine Buvard', 'Captain Blotter'), money: 4200, grey: true, afterScript: 'phareEnd', storyFlag: 'a3.phare',
    party: [{ species: '006', level: 35 }, { species: '042', level: 34 }, { species: '010', level: 35 }, { species: '008', level: 36, item: 'baie-doree' }],
    before: [
      L('Ho ho ! Une petite artiste dans mon phare ?', 'Ho ho! A little artist in my lighthouse?'),
      L('Le buvard boit tout : l’encre, les couleurs, et la nuit de Nocturne. Je garde l’Encre de Minuit pour le Grand Effaceur !', 'A blotter soaks up everything: ink, colours, and Nocturne’s night. I’m keeping the Midnight Ink for the Great Eraser!'),
    ],
    after: [L('Mon buvard est tout mouillé… Reprends ton encre, va !', 'My blotter is all soggy… Take your ink back, go on!')],
  }),
  // ---------------------------------------------------------------- Piste Cyclable
  T({
    id: 'pc1', name: L('Cycliste Léa', 'Cyclist Lea'), party: [{ species: '061', level: 33 }, { species: '026', level: 34 }], money: 820,
    before: [L('Tu roules à quelle vitesse ? Moi, plus vite que le vent !', 'How fast do you ride? Me, faster than the wind!')],
    after: [L('Crevaison !', 'Flat tyre!')],
  }),
  T({
    id: 'pc2', name: L('Cycliste Bastien', 'Cyclist Bastien'), party: [{ species: '016', level: 34 }, { species: '025', level: 34 }], money: 840,
    before: [L('Sur la Piste, on se dépasse… et on se bat !', 'On the Track, we overtake… and we battle!')],
    after: [L('Je descends de mon vélo pour réfléchir.', 'I’m getting off my bike to think.')],
  }),
  T({
    id: 'pc3', name: L('Cycliste Inès', 'Cyclist Ines'), party: [{ species: '047', level: 34 }, { species: '068', level: 35 }], money: 860,
    before: [L('Attention, virage ! Et combat !', 'Watch the bend! And battle!')],
    after: [L('J’ai raté le virage…', 'I missed the bend…')],
  }),
  T({
    id: 'pc4', name: L('Cycliste Noé', 'Cyclist Noah'), party: [{ species: '026', level: 34 }, { species: '019', level: 35 }], money: 900,
    before: [L('Mon Toufoudre et moi, on est les plus rapides de la Piste !', 'My Fluffbolt and I are the fastest on the Track!')],
    after: [L('Plus rapide que nous… c’est possible, alors.', 'Faster than us… so it is possible.')],
  }),
  // ---------------------------------------------------------------- Atelier Encre
  T({
    id: 'encreT1', name: L('Calligraphe Saki', 'Calligrapher Saki'), party: [{ species: '009', level: 35 }, { species: '066', level: 35 }], money: 880,
    before: [L('Un trait d’encre, et ton nom s’écrit dans la défaite.', 'One stroke of ink, and your name is written in defeat.')],
    after: [L('Ma plume a fourché…', 'My quill slipped…')],
  }),
  T({
    id: 'encreT2', name: L('Conteur Ombelin', 'Storyteller Ombelin'), party: [{ species: '053', level: 36 }, { species: '010', level: 36 }], money: 900,
    before: [L('Il était une fois une nuit sans fin…', 'Once upon a time there was an endless night…')],
    after: [L('…et le jour finit par se lever.', '…and the day finally broke.')],
  }),
  T({
    id: 'nocturne', name: L('Maître d’Atelier Nocturne', 'Atelier Master Nocturne'), money: 4000, badge: 'encre',
    party: [{ species: '010', level: 36 }, { species: '010', level: 37 }, { species: '010', level: 39 }],
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
    id: 'u1g1', name: L('Sbire Gomme', 'Eraser Grunt'), party: [{ species: '010', level: 36 }], money: 900, grey: true,
    before: [L('Ici on fabrique les gommes géantes. Tu veux essayer ?', 'This is where we make the giant erasers. Want to try one?')],
    after: [L('Elle a rebondi sur moi…', 'It bounced back at me…')],
  }),
  T({
    id: 'u1g2', name: L('Sbire Gomme', 'Eraser Grunt'), party: [{ species: '057', level: 36 }, { species: '043', level: 37 }], money: 920, grey: true,
    before: [L('Mon Ronflon tout gris dort sur le tapis roulant. Réveille-le, si tu l’oses !', 'My all-grey Snoozle sleeps on the conveyor belt. Wake it, if you dare!')],
    after: [L('Il s’est réveillé… en couleurs.', 'It woke up… in colour.')],
  }),
  T({
    id: 'u1g3', name: L('Sbire Gomme', 'Eraser Grunt'), party: [{ species: '055', level: 36 }, { species: '004', level: 37 }], money: 920, grey: true,
    before: [L('Le patron a dit : plus de bavures !', 'The boss said: no more smudges!')],
    after: [L('Je suis tout taché…', 'I’m all smudged…')],
  }),
  T({
    id: 'u2g1', name: L('Sbire Gomme', 'Eraser Grunt'), party: [{ species: '009', level: 37 }, { species: '046', level: 37 }], money: 940, grey: true,
    before: [L('Tu ne trouveras jamais le patron !', 'You’ll never find the boss!')],
    after: [L('Il est en haut… Oups.', 'He’s upstairs… Oops.')],
  }),
  T({
    id: 'rature2', name: L('Admin Rature', 'Admin Smudge'), money: 4200, grey: true,
    party: [{ species: '036', level: 37 }, { species: '009', level: 37 }, { species: '010', level: 38 }, { species: '008', level: 38 }],
    before: [L('Encore toi ! Cette fois, je vais te raturer pour de bon.', 'You again! This time I’ll scratch you out for good.')],
    after: [L('Je… je raye ce combat de ma mémoire.', 'I… I’m crossing this battle out of my memory.')],
  }),
  T({
    id: 'blanche2', name: L('Admin Blanche', 'Admin Whiteout'), money: 4400, grey: true, afterScript: 'usineEnd', storyFlag: 'a3.usine',
    party: [{ species: '043', level: 37 }, { species: '010', level: 36 }, { species: '007', level: 37 }, { species: '008', level: 37 }],
    before: [L('Le patron est juste derrière moi. Il ne faut pas le déranger… Il prépare la page blanche.', 'The boss is right behind me. He mustn’t be disturbed… He is preparing the blank page.')],
    after: [L('Même mon blanc… a des couleurs, maintenant.', 'Even my white… has colours in it now.')],
  }),
  // ---------------------------------------------------------------- the end of the page
  T({
    id: 'effaceur', name: L('Le Grand Effaceur', 'The Great Eraser'), money: 0, grey: true,
    party: [{ species: '008', level: 39 }, { species: '007', level: 38 }, { species: '004', level: 38 }, { species: '010', level: 39 }, { species: '011', level: 42, item: 'baie-doree' }],
    before: [],
    after: [L('Tes… dessins… ils sont pleins… de couleurs…', 'Your… drawings… they’re full… of colours…')],
  }),
].map((t) => [t.id, t]));

/** The rival picks the starter that yours beats, so the very first battle is winnable. */
export const RIVAL_COUNTER: Record<string, string> = { '001': '003', '002': '001', '003': '002' };
