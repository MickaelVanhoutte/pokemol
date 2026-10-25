import { L, type LText } from '../i18n';
import { createMon, type Mon } from '../engine/pk/creature';

export interface TrainerMon {
  species: string;
  level: number;
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
}

/** Trainer creatures: fixed decent IVs so battles feel the same every time. */
export function partyOf(list: TrainerMon[], seed: number): Mon[] {
  const iv = { hp: 12, atk: 12, def: 12, spa: 12, spd: 12, spe: 12 };
  return list.map((t, i) => createMon(t.species, t.level, { rng: seed + i }, iv));
}

export function trainerParty(t: TrainerDef, seed: number): Mon[] {
  return partyOf(t.party, seed);
}

const T = (t: TrainerDef) => t;

export const TRAINERS: Record<string, TrainerDef> = Object.fromEntries([
  // ---------------------------------------------------------------- Chemin des Crayons
  T({
    id: 'leo', name: L('Gamin Léo', 'Kid Leo'), party: [{ species: '006', level: 5 }], money: 100,
    before: [L('Hé ! Tu as une Bestiole ? Moi aussi ! On se bat ?', 'Hey! You’ve got a Critter? Me too! Let’s battle!')],
    after: [L('Oh non… Ma Lunelle a dansé pour rien !', 'Oh no… My Moonbun danced for nothing!')],
  }),
  T({
    id: 'iris', name: L('Fillette Iris', 'Lass Iris'), party: [{ species: '013', level: 5 }, { species: '004', level: 6 }], money: 180,
    before: [L('J’ai dessiné mes Bestioles moi-même ! Regarde comme elles sont jolies !', 'I drew my Critters myself! Look how pretty they are!')],
    after: [L('Elles sont jolies ET fortes, les tiennes…', 'Yours are pretty AND strong…')],
  }),
  // ---------------------------------------------------------------- Atelier Pastel
  T({
    id: 'pastelT1', name: L('Apprentie Lou', 'Apprentice Lou'), party: [{ species: '012', level: 7 }, { species: '013', level: 7 }], money: 210,
    before: [L('Ici on dessine des ailes, des antennes et des pattes partout !', 'Here we draw wings, antennae and legs everywhere!')],
    after: [L('Je vais redessiner mes Bestioles en plus fortes !', 'I’ll redraw my Critters stronger!')],
  }),
  T({
    id: 'pastelT2', name: L('Apprenti Malo', 'Apprentice Malo'), party: [{ species: '012', level: 8 }, { species: '007', level: 9 }], money: 240,
    before: [L('Mireille m’a appris à colorier sans dépasser. Toi, tu dépasses ?', 'Mireille taught me to colour inside the lines. Do you go over them?')],
    after: [L('Bon… j’ai un peu dépassé.', 'Well… I went a bit over the lines.')],
  }),
  T({
    id: 'mireille', name: L('Maître d’Atelier Mireille', 'Atelier Master Mireille'), money: 1200, badge: 'pastel',
    party: [{ species: '012', level: 8 }, { species: '007', level: 10 }],
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
    id: 'pierrot', name: L('Gamin Pierrot', 'Kid Pierrot'), party: [{ species: '006', level: 8 }, { species: '004', level: 9 }], money: 180,
    before: [L('Je dessine à la craie sur le trottoir. Mes Bestioles aussi !', 'I draw with chalk on the pavement. My Critters too!')],
    after: [L('La pluie va tout effacer… mais pas ta victoire.', 'The rain will wash it all away… but not your win.')],
  }),
  T({
    id: 'ninon', name: L('Fillette Ninon', 'Lass Ninon'), party: [{ species: '005', level: 9 }, { species: '013', level: 9 }], money: 200,
    before: [L('Mon Piafou chante faux, mais il se bat juste !', 'My Chirpie sings off-key, but it battles right on!')],
    after: [L('Il a chanté encore plus faux…', 'It sang even more off-key…')],
  }),
  // ---------------------------------------------------------------- Bois Brumeux
  T({
    id: 'luna', name: L('Médium Luna', 'Medium Luna'), party: [{ species: '009', level: 10 }, { species: '005', level: 11 }], money: 400,
    before: [L('Les esprits de la brume m’ont parlé de toi…', 'The spirits of the mist told me about you…')],
    after: [L('Les esprits n’avaient pas prévu ça.', 'The spirits didn’t see that coming.')],
  }),
  T({
    id: 'paul', name: L('Randonneur Paul', 'Hiker Paul'), party: [{ species: '007', level: 10 }, { species: '008', level: 11 }], money: 450,
    before: [L('Rien de tel qu’une bonne marche… et un bon combat !', 'Nothing beats a good hike… and a good battle!')],
    after: [L('Ouf ! Je vais faire une sieste, comme Ronflon.', 'Phew! I’ll take a nap, like Snoozle.')],
  }),
  T({
    id: 'gomme1', name: L('Sbire Gomme', 'Eraser Grunt'), party: [{ species: '013', level: 10 }, { species: '012', level: 10 }], money: 300, grey: true,
    before: [
      L('Hé ! Ce bois est trop gribouillé. On fait le ménage pour le Grand Effaceur !', 'Hey! These woods are way too scribbly. We’re tidying up for the Great Eraser!'),
      L('Tu vois mes Bestioles ? Plus de couleurs, plus de bêtises. Elles obéissent !', 'See my Critters? No more colours, no more nonsense. They obey!'),
    ],
    after: [L('Quoi ?! Les couleurs reviennent ? Ce n’était pas prévu…', 'What?! The colours are coming back? That wasn’t the plan…')],
  }),
  T({
    id: 'gomme2', name: L('Sbire Gomme', 'Eraser Grunt'), party: [{ species: '009', level: 11 }, { species: '013', level: 12 }], money: 360, grey: true, afterScript: 'boisRestore',
    before: [
      L('Halte ! Personne ne passe. Le Grand Effaceur dit que ces dessins ne valent rien.', 'Halt! Nobody gets through. The Great Eraser says these drawings are worthless.'),
      L('Un coup de gomme, et pouf ! Plus de bois, plus de Bestioles, plus de bazar !', 'One rub of the eraser, and poof! No more woods, no more Critters, no more mess!'),
    ],
    after: [L('Grr… Le Grand Effaceur ne va pas être content !', 'Grr… The Great Eraser won’t be happy!')],
  }),
  // ---------------------------------------------------------------- Atelier Plume
  T({
    id: 'plumeT1', name: L('Ornithologue Paulin', 'Birdwatcher Paulin'), party: [{ species: '013', level: 12 }, { species: '013', level: 13 }], money: 300,
    before: [L('Chut ! J’observe les Piafou… Ah, tu m’as fait peur. Combat !', 'Shh! I’m watching Chirpies… Ah, you startled me. Battle!')],
    after: [L('Mes Piafou se sont envolés… de honte.', 'My Chirpies flew away… out of shame.')],
  }),
  T({
    id: 'plumeT2', name: L('Rêveuse Nina', 'Dreamer Nina'), party: [{ species: '008', level: 13 }], money: 320,
    before: [L('Zzz… Hein ? Un combat ? D’accord, mais vite, j’ai sommeil.', 'Zzz… Huh? A battle? Fine, but quickly, I’m sleepy.')],
    after: [L('Bonne nuit…', 'Good night…')],
  }),
  T({
    id: 'gaspard', name: L('Maître d’Atelier Gaspard', 'Atelier Master Gaspard'), money: 1600, badge: 'plume',
    party: [{ species: '013', level: 13 }, { species: '008', level: 13 }],
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
    id: 'max', name: L('Spéléo Max', 'Caver Max'), party: [{ species: '004', level: 14 }, { species: '007', level: 15 }], money: 560,
    before: [L('Il fait noir ici, mais mes Bestioles voient tout !', 'It’s dark in here, but my Critters see everything!')],
    after: [L('J’aurais dû prendre une lampe…', 'I should have brought a lamp…')],
  }),
  T({
    id: 'zoe', name: L('Gamine Zoé', 'Kid Zoe'), party: [{ species: '006', level: 15 }, { species: '005', level: 15 }], money: 540,
    before: [L('Chut ! Mes Bestioles chantent pour les chauves-souris.', 'Shh! My Critters are singing to the bats.')],
    after: [L('Les chauves-souris préfèrent ta chanson.', 'The bats like your song better.')],
  }),
  T({
    id: 'bob', name: L('Mineur Bob', 'Miner Bob'), party: [{ species: '008', level: 16 }], money: 640,
    before: [L('Mon Ronflon creuse des tunnels en ronflant !', 'My Snoozle digs tunnels while it snores!')],
    after: [L('Il s’est rendormi. Typique.', 'It fell asleep again. Typical.')],
  }),
  T({
    id: 'tom', name: L('Campeur Tom', 'Camper Tom'), party: [{ species: '003', level: 15 }, { species: '002', level: 15 }, { species: '001', level: 15 }], money: 620,
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
    id: 'r3gus', name: L('Pêcheur Gus', 'Fisher Gus'), party: [{ species: '003', level: 16 }, { species: '013', level: 16 }], money: 400,
    before: [L('Ça mord ! … Ah non, c’est toi. Bon, combat !', 'A bite! … Oh no, it’s you. Fine, battle!')],
    after: [L('Le poisson du jour, c’était moi…', 'Catch of the day: me…')],
  }),
  T({
    id: 'r3lise', name: L('Gamine Lise', 'Kid Lise'), party: [{ species: '004', level: 16 }, { species: '006', level: 17 }], money: 380,
    before: [L('J’ai peint mes Bestioles à l’aquarelle, elles brillent quand il pleut !', 'I painted my Critters in watercolour, they shine when it rains!')],
    after: [L('Il ne pleut même pas…', 'It’s not even raining…')],
  }),
  // ---------------------------------------------------------------- Atelier Aquarelle
  T({
    id: 'aquaT1', name: L('Nageuse Lila', 'Swimmer Lila'), party: [{ species: '006', level: 16 }, { species: '005', level: 17 }], money: 400,
    before: [L('Un, deux, trois… Plouf ! On se bat dans l’eau ou sur le sable ?', 'One, two, three… Splash! Shall we battle in the water or on the sand?')],
    after: [L('J’ai bu la tasse…', 'I swallowed some water…')],
  }),
  T({
    id: 'aquaT2', name: L('Marin Yann', 'Sailor Yann'), party: [{ species: '003', level: 18 }], money: 450,
    before: [L('Mon Clapotin tambourine sur sa carapace pour donner le rythme aux vagues !', 'My Splashell drums on its shell to keep the waves in time!')],
    after: [L('Les vagues ont perdu le rythme…', 'The waves lost the beat…')],
  }),
  T({
    id: 'marine', name: L('Maître d’Atelier Marine', 'Atelier Master Marine'), money: 2000, badge: 'aquarelle', afterScript: 'marineAfter',
    party: [{ species: '006', level: 18 }, { species: '005', level: 18 }, { species: '003', level: 20 }],
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
    id: 'r4maud', name: L('Randonneuse Maud', 'Hiker Maud'), party: [{ species: '008', level: 20 }], money: 520,
    before: [L('Mon Ronflon porte mon sac. Enfin, quand il ne dort pas.', 'My Snoozle carries my bag. Well, when it’s not asleep.')],
    after: [L('Il dort. Je porte le sac. Comme d’habitude.', 'It’s asleep. I carry the bag. As usual.')],
  }),
  T({
    id: 'r4tim', name: L('Gamin Tim', 'Kid Tim'), party: [{ species: '004', level: 19 }, { species: '004', level: 20 }], money: 400,
    before: [L('Deux Zigzou, deux fois plus d’étincelles !', 'Two Ziggles, twice the sparks!')],
    after: [L('Zéro étincelle…', 'Zero sparks…')],
  }),
  T({
    id: 'r4gomme', name: L('Sbire Gomme', 'Eraser Grunt'), party: [{ species: '009', level: 20 }, { species: '012', level: 20 }], money: 500, grey: true,
    before: [L('Ville-Feutre ? On l’a toute grisée ! C’est bien plus calme comme ça.', 'Felt City? We greyed it all out! It’s much quieter like that.')],
    after: [L('Pfff… Va donc voir Rature à l’entrepôt, il te gommera, lui !', 'Pfff… Go see Smudge at the warehouse, he’ll rub you out!')],
  }),
  // ---------------------------------------------------------------- Entrepôt Gomme
  T({
    id: 'e1g1', name: L('Sbire Gomme', 'Eraser Grunt'), party: [{ species: '013', level: 21 }, { species: '004', level: 21 }], money: 520, grey: true,
    before: [L('Intrus ! Ici on stocke les couleurs aspirées. Tu n’en auras pas une goutte !', 'Intruder! This is where we store the sucked-up colours. You won’t get a drop!')],
    after: [L('Une goutte de rouge vient de s’échapper…', 'A drop of red just escaped…')],
  }),
  T({
    id: 'e1g2', name: L('Sbire Gomme', 'Eraser Grunt'), party: [{ species: '009', level: 22 }], money: 540, grey: true,
    before: [L('Le Grand Effaceur dit que le monde serait plus beau tout blanc. Comme une page neuve !', 'The Great Eraser says the world would be prettier all white. Like a brand-new page!')],
    after: [L('Une page blanche, c’est quand même un peu triste…', 'A blank page is a bit sad, really…')],
  }),
  T({
    id: 'e1g3', name: L('Sbire Gomme', 'Eraser Grunt'), party: [{ species: '012', level: 20 }, { species: '007', level: 22 }], money: 540, grey: true,
    before: [L('Mes Bestioles n’ont plus de couleurs, mais elles mordent encore !', 'My Critters have no colours left, but they still bite!')],
    after: [L('Elles ont retrouvé leurs couleurs… et elles sont toutes contentes. Bizarre.', 'They got their colours back… and they look so happy. Weird.')],
  }),
  T({
    id: 'e2g1', name: L('Sbire Gomme', 'Eraser Grunt'), party: [{ species: '010', level: 22 }], money: 560, grey: true,
    before: [L('Personne ne dérange l’Admin Rature !', 'Nobody disturbs Admin Smudge!')],
    after: [L('Bon… Dérange-le, alors.', 'Fine… Disturb him, then.')],
  }),
  T({
    id: 'rature', name: L('Admin Rature', 'Admin Smudge'), money: 2600, grey: true, afterScript: 'feutreRestore',
    party: [{ species: '013', level: 21 }, { species: '009', level: 21 }, { species: '010', level: 23 }],
    before: [
      L('Tiens, tiens. C’est toi qui recolories tout derrière nous ?', 'Well, well. So you’re the one colouring everything back in behind us?'),
      L('Le Grand Effaceur a raison : ces gribouillis d’enfant ne valent rien. Je vais t’effacer, toi aussi !', 'The Great Eraser is right: these childish scribbles are worthless. I’ll rub you out too!'),
    ],
    after: [L('Impossible… Les couleurs… elles reviennent toutes !', 'Impossible… The colours… they’re all coming back!')],
  }),
  // ---------------------------------------------------------------- Atelier Fluo
  T({
    id: 'fluoT1', name: L('Électricienne Volta', 'Electrician Volta'), party: [{ species: '004', level: 21 }, { species: '004', level: 22 }], money: 540,
    before: [L('Attention, ça pique ! Zzzt !', 'Careful, it stings! Bzzt!')],
    after: [L('Court-circuit…', 'Short circuit…')],
  }),
  T({
    id: 'fluoT2', name: L('Rockeur Jimmy', 'Rocker Jimmy'), party: [{ species: '005', level: 22 }, { species: '004', level: 22 }], money: 560,
    before: [L('Ma Chantouille chante, mon Zigzou fait les lumières. On est un groupe !', 'My Croonball sings, my Ziggle does the lights. We’re a band!')],
    after: [L('Le concert est annulé…', 'The concert is cancelled…')],
  }),
  T({
    id: 'zelie', name: L('Maître d’Atelier Zélie', 'Atelier Master Zelie'), money: 2400, badge: 'fluo',
    party: [{ species: '004', level: 23 }, { species: '005', level: 23 }, { species: '004', level: 25 }],
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
    id: 'mfOlga', name: L('Montagnarde Olga', 'Mountaineer Olga'), party: [{ species: '008', level: 23 }, { species: '013', level: 23 }], money: 600,
    before: [L('Le fusain, ça salit les mains ! Et les Bestioles aussi !', 'Charcoal makes your hands dirty! And your Critters too!')],
    after: [L('Je vais me laver les mains…', 'I’m going to wash my hands…')],
  }),
  T({
    id: 'mfRemi', name: L('Spéléo Rémi', 'Caver Remi'), party: [{ species: '009', level: 24 }, { species: '004', level: 23 }], money: 620,
    before: [L('Dans le noir, on ne voit que les yeux des Brumouille. Brr !', 'In the dark you only see the Mistchiefs’ eyes. Brr!')],
    after: [L('Allume la lumière en sortant…', 'Turn off the light on your way out…')],
  }),
  T({
    id: 'mfErmite', name: L('Ermite du Fusain', 'Charcoal Hermit'), party: [{ species: '010', level: 24 }, { species: '008', level: 25 }], money: 700,
    before: [L('Je dessine au fusain depuis cent ans. Tout est gris, ici… et c’est très bien comme ça.', 'I’ve drawn in charcoal for a hundred years. Everything is grey here… and that’s just fine.')],
    after: [L('Gris, oui… mais avec des nuances. Bien joué.', 'Grey, yes… but with shades. Well played.')],
  }),
  // ---------------------------------------------------------------- Atelier Braise
  T({
    id: 'braiseT1', name: L('Jongleur Paco', 'Juggler Paco'), party: [{ species: '002', level: 24 }, { species: '013', level: 24 }], money: 600,
    before: [L('Je jongle avec des braises ! Enfin, mon Braisou jongle.', 'I juggle embers! Well, my Embunny does.')],
    after: [L('Aïe, ça brûle…', 'Ouch, that burns…')],
  }),
  T({
    id: 'braiseT2', name: L('Forgeronne Inès', 'Smith Ines'), party: [{ species: '008', level: 25 }, { species: '002', level: 25 }], money: 640,
    before: [L('Ici on forge des crayons à la chaleur du volcan !', 'Here we forge pencils in the volcano’s heat!')],
    after: [L('Mon crayon a fondu…', 'My pencil melted…')],
  }),
  T({
    id: 'ambre', name: L('Maître d’Atelier Ambre', 'Atelier Master Amber'), money: 2800, badge: 'braise',
    party: [{ species: '002', level: 25 }, { species: '008', level: 24 }, { species: '002', level: 26 }],
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
    id: 'elsa', name: L('Médium Elsa', 'Medium Elsa'), party: [{ species: '009', level: 15 }, { species: '009', level: 15 }], money: 700,
    before: [L('Deux brumes valent mieux qu’une !', 'Two mists are better than one!')],
    after: [L('La brume se dissipe…', 'The mist is clearing…')],
  }),
  T({
    id: 'pif', name: L('Farceur Pif', 'Prankster Pif'), party: [{ species: '010', level: 17 }], money: 800,
    before: [L('Bouh ! … Tu n’as pas eu peur ? Bon, on se bat alors.', 'Boo! … Not scared? Fine, let’s battle then.')],
    after: [L('Même mes mains de brume n’ont pas suffi !', 'Even my mist hands weren’t enough!')],
  }),
  T({
    id: 'rose', name: L('Conteuse Rose', 'Storyteller Rose'), party: [{ species: '005', level: 16 }, { species: '006', level: 17 }], money: 760,
    before: [L('Il était une fois… un combat terrible !', 'Once upon a time… a terrible battle!')],
    after: [L('…et tu vécus heureux et victorieux. Fin.', '…and you lived happily and victoriously. The end.')],
  }),
  T({
    id: 'hugo', name: L('Magicien Hugo', 'Magician Hugo'), party: [{ species: '007', level: 17 }, { species: '004', level: 18 }], money: 860,
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
].map((t) => [t.id, t]));

/** The rival picks the starter that yours beats, so the very first battle is winnable. */
export const RIVAL_COUNTER: Record<string, string> = { '001': '003', '002': '001', '003': '002' };
