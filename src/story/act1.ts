import { L, tr } from '../i18n';
import { creature, STARTERS } from '../data/creatures';
import { partyOf, RIVAL_COUNTER } from '../data/trainers';
import { newSeed } from '../engine/rng';
import { LOOKS } from '../overworld/sprites';
import { healParty, save, update } from '../state/game';
import {
  bubble, fight, flag, flash, getGame, giveItem, giveMon, say, sayAll, scripts, setFlag, showMons, showToast, wait,
} from '../overworld/controller';
import { GRUNT, MOM, PROF, RIVAL, hasTeam } from './cast';

// ------------------------------------------------------------------ home

/** First moments after the prologue: you wake up in a world drawn in pencil. */
scripts.intro = async () => {
  await getGame().fadeTo(1, 1, 'black');
  await getGame().fadeTo(0, 900);
  await bubble('player', '?', 900);
  await say(L('Tu ouvres les yeux… Ta chambre a l’air dessinée au crayon de couleur. Bizarre !', 'You open your eyes… Your room looks like it was drawn with coloured pencils. Strange!'));
  await say(L('Maman a l’air de vouloir te parler.', 'Mom seems to want to talk to you.'));
};

scripts.bed = async () => {
  await say(L('Ton lit. Il sent le papier et les crayons de couleur… Tu n’as plus sommeil.', 'Your bed. It smells of paper and coloured pencils… You’re not sleepy anymore.'));
};

scripts.homeTv = async () => {
  await say(L('À la télé : « Des Bestioles dessinées partout dans Papeterre ! Et une étrange équipe en gris… »', 'On TV: “Drawn Critters all over Papeterra! And a strange team dressed in grey…”'));
};

scripts.mom = async () => {
  if (!flag('intro')) {
    await sayAll([
      L('Ah, {name}, tu es {g:réveillée|réveillé} !', 'Ah, {name}, you’re up!'),
      L('Le Prof. Fusain est passé ce matin. Il t’attend à son labo, en bas du bourg.', 'Prof. Charcoal dropped by this morning. He’s waiting for you at his lab, down in town.'),
      L('Il a encore pris en photo tous les dessins collés sur le frigo. Quel drôle de bonhomme !', 'He took pictures of every drawing on the fridge again. What a funny man!'),
      L('Tiens, prends cette carte : comme ça, tu sauras toujours où tu es, et où aller ensuite.', 'Here, take this map: that way you’ll always know where you are, and where to go next.'),
    ], MOM);
    giveItem('carte');
    await say(L('{name} reçoit la Carte de Papeterre ! (menu CARTE)', '{name} received the Papeterra Map! (MAP menu)'));
    setFlag('intro');
    return;
  }
  if (!hasTeam()) {
    await say(L('Le labo est tout en bas du bourg. File !', 'The lab is at the bottom of town. Off you go!'), MOM);
    return;
  }
  await say(L('Tes Bestioles ont l’air fatiguées. Reposez-vous un peu !', 'Your Critters look tired. Have a little rest!'), MOM);
  await getGame().fadeTo(1, 300);
  update((d) => {
    healParty(d);
    d.respawn = { map: 'maison', x: 4, y: 5 };
  });
  await wait(400);
  await getGame().fadeTo(0, 300);
  await say(L('Voilà, tout le monde est en pleine forme ! Bonne aventure, ma puce.', 'There, everyone is in great shape! Have a good adventure, sweetie.'), MOM);
};

scripts.rivalGrandma = async () => {
  const who = L('Mamie Cerise', 'Granny Cherry');
  if (!flag('rival1')) {
    await say(L('{rival} ? Il est parti au labo dès l’aube. Il veut être le premier à avoir une Bestiole !', '{rival}? He left for the lab at dawn. He wants to be the first to get a Critter!'), who);
    return;
  }
  await say(L('{rival} est parti à l’aventure. Il dit qu’il sera le meilleur dresseur de Papeterre !', '{rival} has gone off on an adventure. He says he’ll be the best trainer in Papeterra!'), who);
  await say(L('Vous êtes inséparables depuis la maternelle, tous les deux. Veille un peu sur lui, d’accord ?', 'You two have been inseparable since nursery school. Look out for him a little, will you?'), who);
};

// ------------------------------------------------------------------ the lab

scripts.profStops = async () => {
  if (hasTeam()) return;
  const g = getGame();
  await say(L('Attends ! Ne va pas dans les hautes herbes sans Bestiole !', 'Wait! Don’t go into the tall grass without a Critter!'), PROF);
  await say(L('Viens vite à mon labo, en bas du bourg. Je t’ai préparé une surprise !', 'Come to my lab at the bottom of town. I’ve got a surprise for you!'), PROF);
  await g.walk(g.player, ['down'], 160);
};

scripts.rivalLab = async () => {
  await say(L('Vas-y, choisis en premier. De toute façon, c’est moi qui gagnerai !', 'Go on, pick first. I’m going to win anyway!'), RIVAL);
};

scripts.labCamera = async () => {
  await say(L('Un gros appareil photo, et des centaines de photos de dessins accrochées au mur.', 'A big camera, and hundreds of photos of drawings pinned to the wall.'));
  await say(L('Sur l’une d’elles, on dirait… ta chambre ? C’est sûrement une coïncidence.', 'One of them looks like… your bedroom? It must be a coincidence.'));
};

scripts.prof = async () => {
  if (!hasTeam()) {
    await sayAll([
      L('Ah, {name} ! Clic-clac ! Oh pardon, je photographie tout ce que je vois.', 'Ah, {name}! Click-clack! Oh, sorry, I take pictures of everything I see.'),
      L('Les Bestioles sont nées des dessins d’une petite artiste. Moi, je les prends en photo, pour ne jamais les perdre.', 'Critters were born from a little artist’s drawings. I take their pictures, so none ever gets lost.'),
      L('Sur la table, trois Bestioles t’attendent. Choisis celle qui te plaît !', 'Three Critters are waiting on the table. Pick the one you like!'),
    ], PROF);
    return;
  }
  if (!save.value!.bag['crayon-ball']) {
    await say(L('Plus de Crayon-balls ? Tiens, en voici 3. Tu en trouveras aussi à la Boutique.', 'Out of Pencil Balls? Here, take 3. The Shop sells them too.'), PROF);
    update((d) => { d.bag['crayon-ball'] = (d.bag['crayon-ball'] ?? 0) + 3; });
    return;
  }
  const tips = [
    L('Affaiblis une Bestiole sauvage avant de lancer une Crayon-ball. Endormie, c’est encore mieux !', 'Weaken a wild Critter before throwing a Pencil Ball. Asleep is even better!'),
    L('Les Bestioles apprennent de nouvelles capacités en montant de niveau.', 'Critters learn new moves as they level up.'),
    L('Le Feu bat la Plante, l’Eau bat le Feu, la Plante bat l’Eau. Les Spectres ne craignent pas les attaques Normales !', 'Fire beats Grass, Water beats Fire, Grass beats Water. Ghosts ignore Normal attacks!'),
    L('Même si quelqu’un efface un dessin, une photo s’en souvient toujours. Clic-clac !', 'Even if someone erases a drawing, a photo always remembers it. Click-clack!'),
  ];
  await say(tips[Math.floor(Math.random() * tips.length)], PROF);
};

scripts.labTable = async () => {
  if (hasTeam()) {
    await say(L('Il n’y a plus de Bestiole sur la table.', 'There are no more Critters on the table.'));
    return;
  }
  if (!flag('intro')) setFlag('intro');
  const i = await showMons([...STARTERS], tr(L('Choisis ta première Bestiole !', 'Choose your first Critter!')), true);
  const pick = STARTERS[i];
  giveMon(pick, 5);
  setFlag('rivalStarter', Number(RIVAL_COUNTER[pick]));
  await say(L('{starter} rejoint ton équipe !', '{starter} joined your team!'), undefined, { starter: tr(creature(pick).name) });

  const g = getGame();
  const counter = RIVAL_COUNTER[pick];
  const rival = g.npc('rival');
  if (rival) {
    await g.walk(rival, ['right', 'right'], 200);
    g.face(rival, 'up');
  }
  await sayAll([
    L('Hé ! Moi aussi je veux une Bestiole !', 'Hey! I want a Critter too!'),
    L('Je prends {c} ! Allez, on les teste. Je suis sûr de gagner !', 'I’ll take {c}! Come on, let’s test them. I’m sure to win!'),
  ], RIVAL, { c: tr(creature(counter).name) });
  if (rival) g.faceToward(g.player, rival);
  await say(L('Oh oh, un premier combat ! Je vais te guider.', 'Oh ho, a first battle! I’ll guide you.'), PROF);
  const out = await fight('trainer', RIVAL, partyOf([{ species: counter, level: 5 }], newSeed()), { friendly: true, backdrop: 'lab', tutorial: true, look: LOOKS.rival });
  if (out.result === 'win') await say(L('Quoi ?! J’ai perdu… C’était de la chance !', 'What?! I lost… That was just luck!'), RIVAL);
  else await say(L('Ha ! Trop facile ! Tu devrais t’entraîner dans les hautes herbes.', 'Ha! Too easy! You should train in the tall grass.'), RIVAL);
  await say(L('Je vais devenir le meilleur dresseur de Papeterre ! Salut !', 'I’ll become the greatest trainer in Papeterra! Bye!'), RIVAL);
  if (rival) {
    await g.walk(rival, ['down', 'down', 'down', 'down'], 170);
    g.remove('rival');
  }
  setFlag('rival1');
  const prof = g.npc('prof');
  if (prof) g.faceToward(prof, g.player);
  await flash('white', 160);
  await sayAll([
    L('Clic-clac ! Une photo de vous deux, pour l’album.', 'Click-clack! A picture of you two, for the album.'),
    L('Tiens, voici 5 Crayon-balls et 2 Potions.', 'Here are 5 Pencil Balls and 2 Potions.'),
    L('Lance une Crayon-ball sur une Bestiole sauvage affaiblie : elle se dessine dedans et rejoint ton équipe !', 'Throw a Pencil Ball at a weakened wild Critter: it draws itself inside and joins your team!'),
    L('Ton Bestiodex note toutes les Bestioles que tu croises. Essaie de le remplir !', 'Your Critterdex records every Critter you meet. Try to fill it up!'),
  ], PROF);
  update((d) => {
    d.bag['crayon-ball'] = (d.bag['crayon-ball'] ?? 0) + 5;
    d.bag.potion = (d.bag.potion ?? 0) + 2;
    d.respawn = { map: 'maison', x: 4, y: 5 };
    d.flags.dex = 1;
  });
  showToast(tr(L('+5 Crayon-balls · +2 Potions', '+5 Pencil Balls · +2 Potions')));
  await sayAll([
    L('Pars vers le nord, sur le Chemin des Crayons, jusqu’à Ville-Pastel. Mireille t’attend à son Atelier.', 'Head north along Crayon Road to Pastel City. Mireille is waiting at her Atelier.'),
    L('Ah, et… on raconte que des gens en gris effacent des choses, en ce moment. Sois {g:prudente|prudent}, ma pu… euh, {name} !', 'Oh, and… people say folks in grey have been rubbing things out lately. Be careful, sweet… er, {name}!'),
  ], PROF);
};

// ------------------------------------------------------------------ on the road

scripts.route1Gomme = async () => {
  setFlag('a1.r1seen');
  await bubble('player', '!', 700);
  await say(L('Une silhouette grise file vers le nord en ricanant, une énorme gomme sous le bras…', 'A grey figure dashes north, snickering, a huge eraser under its arm…'));
  await say(L('Plus loin, un morceau des hautes herbes a disparu, comme effacé !', 'Further up, a patch of tall grass has vanished, as if rubbed out!'));
};

const WEST_GATE = L('Hop hop ! La route de l’ouest est dangereuse en ce moment. Reviens avec le Badge Pastel de Mireille.', 'Whoa there! The west road is dangerous these days. Come back with Mireille’s Pastel Badge.');

scripts.pastelWestGate = async () => {
  const g = getGame();
  await say(WEST_GATE, L('Randonneur', 'Hiker'));
  await g.walk(g.player, ['right'], 160);
};

scripts.pastelWestGuard = async () => {
  if (flag('badge:pastel')) await say(L('Le Badge Pastel ! Alors bonne route. Méfie-toi des gens en gris dans le Bois Brumeux.', 'The Pastel Badge! Then off you go. Watch out for the people in grey in the Misty Woods.'), L('Randonneur', 'Hiker'));
  else await say(WEST_GATE, L('Randonneur', 'Hiker'));
};

/** After the second grunt of the woods: the trees come back and the rival shows up. */
scripts.boisRestore = async () => {
  const g = getGame();
  await bubble('gomme2', '…', 700);
  await say(L('Je file prévenir l’Admin Rature… Tu vas voir !', 'I’m off to warn Admin Smudge… You’ll see!'), GRUNT);
  const grunt = g.npc('gomme2');
  if (grunt) {
    await g.walk(grunt, ['up'], 140);
    g.remove('gomme2');
  }
  const px = g.player.x, py = g.player.y;
  const rival = g.spawn('rivalBois', LOOKS.rival, px, Math.min(g.map.h - 2, py + 3), 'up');
  for (let i = 0; i < 2 && !(rival.x === px && rival.y === py + 1); i++) await g.walk(rival, ['up'], 180);
  g.faceToward(g.player, rival);
  await sayAll([
    L('{name} ! Toi aussi tu les as vus ? Ces Gommeux effacent tout sur leur passage !', '{name}! You saw them too? Those Erasers rub out everything in their way!'),
    L('Mais regarde… quand on bat leurs Bestioles grises, les couleurs reviennent !', 'But look… when you beat their grey Critters, the colours come back!'),
  ], RIVAL);
  await flash('white', 220);
  setFlag('a1.bois');
  showToast(tr(L('Le bois retrouve ses couleurs !', 'The woods get their colours back!')));
  await sayAll([
    L('Wouah… Les arbres sont revenus ! On dirait un dessin qu’on vient de finir.', 'Whoa… The trees are back! It looks like a drawing that was just finished.'),
    L('Je file à Village-Plume, juste au nord. Le premier arrivé à l’Atelier a gagné !', 'I’m off to Featherby, just north of here. First one to the Atelier wins!'),
  ], RIVAL);
  await g.walk(rival, ['right'], 160);
  g.remove('rivalBois');
};

scripts.plumeBridge = async () => {
  if (!flag('badge:plume')) {
    await say(L('Le pont a été effacé cette nuit ! Des gens en gris sont partis vers l’est en ricanant.', 'The bridge was rubbed out last night! People in grey went off east, snickering.'), L('Marin', 'Sailor'));
    return;
  }
  await say(L('Gaspard t’a donné son badge ? Alors passe par la Grotte Gribouillis, à l’est de Ville-Pastel. Le pont, on va le redessiner !', 'Gaspard gave you his badge? Then go through Scribble Cave, east of Pastel City. We’ll redraw the bridge!'), L('Marin', 'Sailor'));
};
