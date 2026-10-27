import { L, tr } from '../i18n';
import { playMusic } from '../audio/music';
import { creature, STARTERS } from '../data/creatures';
import { item } from '../data/items';
import { partyOf, RIVAL_COUNTER } from '../data/trainers';
import { newSeed } from '../engine/rng';
import { LOOKS } from '../overworld/sprites';
import type { Dir } from '../save/schema';
import { addItem, healParty, save, update } from '../state/game';
import { sfx } from '../audio/sfx';
import {
  dayPhase, mapMusic, ask, bubble, fight, flag, flash, getGame, giveItem, giveMon, offerNickname, say, sayAll, scripts, setFlag, showMons, showToast,
  trainerBattle, wait,
} from '../overworld/controller';
import { LEGEND } from '../overworld/mapTypes';
import { TILES } from '../overworld/tiles';
import { sleepUntil } from './common';
import { choose, COCONFUS, coconfusJoins, RETOUCHE } from './choices';
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

/** Your bed: a nap until the evening or until the morning (day and night follow it). */
scripts.bed = async () => {
  const night = dayPhase() === 'night';
  const c = await ask(night
    ? L('Ton lit. Il fait nuit dehors… Dormir jusqu’au matin ?', 'Your bed. It’s night outside… Sleep until the morning?')
    : L('Ton lit. Il sent le papier et les crayons de couleur… Faire une sieste jusqu’à la nuit ?', 'Your bed. It smells of paper and coloured pencils… Take a nap until nightfall?'),
  [L('Oui', 'Yes'), L('Non', 'No')]);
  if (c === 0) await sleepUntil(night);
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
  const starter = giveMon(pick, 5, 'starter');
  setFlag('rivalStarter', Number(RIVAL_COUNTER[pick]));
  await say(L('{starter} rejoint ton équipe !', '{starter} joined your team!'), undefined, { starter: tr(creature(pick).name) });
  await offerNickname(starter.uid);

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
  const out = await fight('trainer', RIVAL, partyOf([{ species: counter, level: 4 }], newSeed(), 'normal'), { friendly: true, backdrop: 'lab', tutorial: true, look: LOOKS.rival, music: 'rival' });
  if (out.result === 'win') await say(L('Quoi ?! J’ai perdu… C’était de la chance !', 'What?! I lost… That was just luck!'), RIVAL);
  else await say(L('Ha ! Trop facile ! Tu devrais t’entraîner dans les hautes herbes.', 'Ha! Too easy! You should train in the tall grass.'), RIVAL);
  await say(L('Je vais devenir le meilleur dresseur de Papeterre ! Salut !', 'I’ll become the greatest trainer in Papeterra! Bye!'), RIVAL);
  // the map's characters are rebuilt after a battle: walk the rival that is on screen now
  const leaving = g.npc('rival');
  if (leaving) {
    // down to the last row, along it to the door (5, 9), and out
    const path: Dir[] = [];
    for (let y = leaving.y; y < 8; y++) path.push('down');
    for (let x = leaving.x; x !== 5; x += x < 5 ? 1 : -1) path.push(x < 5 ? 'right' : 'left');
    path.push('down');
    await g.walk(leaving, path, 170);
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

/** Leaving town after the lab: Mom runs out of the house with running shoes. */
scripts.momShoes = async () => {
  const g = getGame();
  const { x: px, y: py } = g.player;
  await bubble('player', '!', 600);
  await say(L('{name} ! Attends une seconde !', '{name}! Wait a second!'), MOM);
  const mom = g.spawn('momRun', LOOKS.mom, 3, 6, 'right');
  g.face(g.player, 'down');
  const ups = Math.max(0, 6 - (py + 1));
  await g.walk(mom, [...Array(px - 3).fill('right'), ...Array(ups).fill('up')], 150);
  g.faceToward(mom, g.player);
  await sayAll([
    L('Ouf ! Le Prof. Fusain m’a dit que tu partais à l’aventure avec ta première Bestiole !', 'Phew! Prof. Charcoal told me you’re off on an adventure with your first Critter!'),
    L('Tiens, je t’ai dessiné des baskets. Avec ça, tu iras aussi vite que le vent !', 'Here, I drew you some sneakers. With these, you’ll be as fast as the wind!'),
  ], MOM);
  giveItem('baskets');
  await say(L('{name} reçoit les Baskets-Éclair !', '{name} received the Zip Sneakers!'));
  setFlag('shoes');
  await sayAll([
    L('Maintiens le bouton B en marchant pour courir. Sur un écran tactile, garde un doigt sur B pendant que l’autre glisse !', 'Hold the B button while walking to run. On a touch screen, keep one finger on B while the other one slides!'),
    L('Sois {g:prudente|prudent}, mange bien… et reviens me voir de temps en temps. Bonne chance, mon cœur !', 'Be careful, eat well… and come and see me now and then. Good luck, sweetheart!'),
  ], MOM);
  await g.walk(mom, [...Array(ups).fill('down'), ...Array(px - 3).fill('left')], 150);
  g.remove(mom.id);
};

/** Ville-Pastel: a girl gives you the scruffy Bestiole she drew (the GBA games' gift Bestiole). */
scripts.touffouGift = async () => {
  const who = L('Fillette Capucine', 'Lass Capucine');
  if (flag('gift:touffou')) {
    // with four badges, she has finished three new drawings… and a magic pencil to spare
    if (save.value!.badges.length >= 4 && !flag('gift:crayonMagique')) {
      await sayAll([
        L('Regarde ! J’ai dessiné Touffou en Bestiole Eau, en Bestiole Feu et en Bestiole Électrique !', 'Look! I drew Fuzzkit as a Water Critter, a Fire Critter and a Lightning Critter!'),
        L('Il suffit de le redessiner avec un Crayon Magique pour qu’il change. Tiens, je t’en donne un !', 'You just redraw it with a Magic Pencil and it changes. Here, I’ll give you one!'),
      ], who);
      const kinds = ['crayon-magique-eau', 'crayon-magique-feu', 'crayon-magique-electrique'];
      const c = await ask(L('Lequel veux-tu ?', 'Which one would you like?'), kinds.map((k) => item(k).name), who);
      update((d) => addItem(d, kinds[c], 1));
      setFlag('gift:crayonMagique');
      sfx.confirm();
      await say(L('{name} reçoit {i} !', '{name} received the {i}!'), undefined, { i: tr(item(kinds[c]).name) });
      await say(L('Utilise-le depuis ton Sac sur Touffou. Les autres Crayons Magiques se vendent dans les boutiques !', 'Use it on Fuzzkit from your Bag. The other Magic Pencils are sold in shops!'), who);
      return;
    }
    await say(L('Mon Touffou va bien ? On dit qu’en grandissant, il pourra devenir plein de choses différentes !', 'Is my Fuzzkit doing well? They say that as it grows, it could become lots of different things!'), who);
    return;
  }
  if (!hasTeam()) {
    await say(L('Tu n’as pas encore de Bestiole ? Reviens quand tu en auras une !', 'You don’t have a Critter yet? Come back when you do!'), who);
    return;
  }
  await sayAll([
    L('J’ai dessiné une Bestiole toute ébouriffée… et elle s’est mise à bouger !', 'I drew a scruffy little Critter… and it started moving!'),
    L('Elle a envie de voir du pays, mais moi, je dois faire mes devoirs.', 'It wants to see the world, but I have to do my homework.'),
  ], who);
  const c = await ask(L('Tu veux bien t’occuper de mon Touffou ?', 'Will you look after my Fuzzkit?'), [L('Oui', 'Yes'), L('Non', 'No')], who);
  if (c !== 0) {
    await say(L('Oh… Si tu changes d’avis, je suis là.', 'Oh… If you change your mind, I’ll be here.'), who);
    return;
  }
  const full = (save.value?.party.length ?? 0) >= 6;
  const touffou = giveMon('016', 8);
  setFlag('gift:touffou');
  await say(full ? L('{name} reçoit Touffou ! Il est envoyé dans le PC.', '{name} received Fuzzkit! It was sent to the PC.') : L('{name} reçoit Touffou !', '{name} received Fuzzkit!'));
  await offerNickname(touffou.uid);
  await say(L('Prends-en bien soin ! On dit qu’un jour, il pourra changer de forme…', 'Take good care of it! They say that one day it could change its shape…'), who);
};

/**
 * Leaving Bourg-Gribouille: a grunt is chasing a muddled little cocoon down the road. You stand up for it
 * (the first Team Gomme battle) and answer the first of the story's choices (src/story/choices.ts).
 */
scripts.route1Gomme = async () => {
  const g = getGame();
  const px = g.player.x, py = g.player.y;
  await bubble('player', '!', 700);
  await say(L('Quelque chose dévale les hautes herbes en tremblant… Un petit cocon tout embrouillé !', 'Something comes tumbling down through the tall grass, trembling… A muddled little cocoon!'));
  // they come down the free tiles above you (a tree stops a walk)
  const free = (x: number, y: number) => !TILES[LEGEND[g.map.def.rows[y]?.[x]]]?.solid;
  let room = 0;
  while (room < 5 && free(px, py - room - 1)) room++;
  const cocon = g.spawn('coconR1', LOOKS.kid, px, py - room, 'down', COCONFUS);
  await g.walk(cocon, Array(Math.max(0, room - 1)).fill('down'), 150);
  // it hides behind you, on whichever side is free
  await g.walk(cocon, [free(px + 1, py - 1) && free(px + 1, py) ? 'right' : 'left', 'down'], 150);
  cocon.dir = 'up';
  const grunt = g.spawn('gommeR1', LOOKS.gomme, px, py - room, 'down');
  await g.walk(grunt, Array(Math.max(0, room - 1)).fill('down'), 140);
  await say(L('Reviens ici, toi ! Un dessin raté comme toi, ça se gomme !', 'Come back here, you! A failed drawing like you gets rubbed out!'), GRUNT);
  await trainerBattle('r1gomme', grunt, LOOKS.gomme);
  if (!flag('tr:r1gomme')) return;
  await say(L('Pfff ! Le Grand Effaceur a des gommes géantes, lui. Ce dessin raté, on finira bien par l’avoir !', 'Pfff! The Great Eraser has giant erasers. We’ll get that failed drawing in the end!'), GRUNT);
  await g.walk(grunt, Array(Math.max(0, room - 1)).fill('up'), 120);
  g.remove('gommeR1');
  setFlag('a1.r1seen');
  await say(L('Le Sbire file vers le nord, une énorme gomme sous le bras. Plus loin, un morceau des hautes herbes a disparu, comme effacé !', 'The grunt dashes north, a huge eraser under his arm. Further up, a patch of tall grass has vanished, as if rubbed out!'));
  g.faceToward(cocon, g.player);
  g.faceToward(g.player, cocon);
  await say(L('Le petit cocon te regarde avec de grands yeux. Une trace de gomme lui barre la joue.', 'The little cocoon looks at you with big eyes. An eraser mark runs across its cheek.'));
  const way = await choose('tache', L('Que fais-tu ?', 'What do you do?'),
    L('J’essuie doucement la trace.', 'I gently wipe the mark off.'),
    L('Elle te va bien, garde-la !', 'It suits you, keep it!'), undefined, false);
  await say(way === RETOUCHE
    ? L('Tu essuies la trace. Le petit cocon ferme les yeux… et une lueur rose traverse son cocon.', 'You wipe the mark off. The little cocoon closes its eyes… and a pink glow runs through its cocoon.')
    : L('Tu lui souris. Le petit cocon touche sa trace… et une spirale sombre se dessine autour, comme un motif.', 'You smile at it. The little cocoon touches its mark… and a dark spiral draws itself around it, like a pattern.'));
  await say(L('Il te fait un petit signe… puis il file vers le nord et disparaît dans les hautes herbes.', 'It gives you a little wave… then dashes north and disappears into the tall grass.'));
  g.remove('coconR1');
};

/** Coming out of the Atelier with the Pastel Badge: an apprentice doesn't like her first drawing (choice 2). */
scripts.pastelDrawing = async () => {
  const g = getGame();
  const who = L('Apprentie Lison', 'Apprentice Lison');
  const lison = g.npc('lison');
  await bubble('lison', '!', 600);
  if (lison) {
    for (let i = 0; i < 4 && Math.abs(lison.x - g.player.x) + Math.abs(lison.y - g.player.y) > 1; i++) {
      await g.walk(lison, [lison.y < g.player.y ? 'down' : lison.y > g.player.y ? 'up' : lison.x < g.player.x ? 'right' : 'left'], 160);
    }
    g.faceToward(lison, g.player);
    g.faceToward(g.player, lison);
  }
  await sayAll([
    L('Attends ! Toi qui as battu Mireille… Regarde mon dessin. C’est pour le Musée des premiers croquis.', 'Wait! You beat Mireille… Look at my drawing. It’s for the Museum of First Sketches.'),
    L('Il est raté. Sa patte est trop longue, et j’ai dépassé partout… Je ne sais pas quoi faire.', 'It’s a failure. Its leg is too long, and I went over the lines everywhere… I don’t know what to do.'),
  ], who);
  const way = await choose('musee', L('Qu’est-ce que tu lui conseilles ?', 'What do you tell her?'),
    L('Recommence-le, tu feras encore mieux !', 'Start it again, you’ll do even better!'),
    L('Garde-le, c’est ton premier : il est unique !', 'Keep it, it’s your first: it’s one of a kind!'), undefined);
  await say(way === RETOUCHE
    ? L('Tu as raison ! Je vais le refaire, et cette fois je prendrai mon temps. Viens le voir au musée !', 'You’re right! I’ll do it again, and this time I’ll take my time. Come and see it at the museum!')
    : L('Tu as raison ! Je vais l’accrocher au musée tel qu’il est. Mon tout premier ! Viens le voir !', 'You’re right! I’ll hang it in the museum just as it is. My very first! Come and see it!'), who);
  if (lison) {
    await g.walk(lison, ['left', 'left'], 140);
    g.remove('lison');
  }
};

scripts.lisonMusee = async () => {
  const who = L('Apprentie Lison', 'Apprentice Lison');
  await say(flag('choix:musee:a')
    ? L('Je l’ai refait trois fois ! Le voilà, accroché au musée. Il est beaucoup mieux, non ?', 'I did it three more times! There it is, hanging in the museum. It’s much better, isn’t it?')
    : L('Le voilà, accroché au musée, avec sa patte trop longue. Les gens disent qu’il a du caractère !', 'There it is, hanging in the museum, too-long leg and all. People say it has character!'), who);
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
  // the little cocoon from Route 1 was the grunt's prisoner: it picks you
  const cocon = g.npc('coconBois');
  if (cocon && !flag('gift:coconfus')) {
    await say(L('Le petit cocon de la route ! Le Sbire le gardait prisonnier… Il se blottit contre toi en tremblant.', 'The little cocoon from the road! The grunt was keeping it prisoner… It snuggles up to you, trembling.'));
    await coconfusJoins(10, cocon);
  }
  const px = g.player.x, py = g.player.y;
  playMusic('rival');
  const rival = g.spawn('rivalBois', LOOKS.rival, px, Math.min(g.map.h - 2, py + 3), 'up');
  for (let i = 0; i < 2 && !(rival.x === px && rival.y === py + 1); i++) await g.walk(rival, ['up'], 180);
  g.faceToward(g.player, rival);
  await sayAll([
    L('{name} ! Toi aussi tu les as vus ? Ces Gommeux effacent tout sur leur passage !', '{name}! You saw them too? Those Erasers rub out everything in their way!'),
    L('Mais regarde… quand on bat leurs Bestioles grises, les couleurs reviennent !', 'But look… when you beat their grey Critters, the colours come back!'),
  ], RIVAL);
  if (flag('gift:coconfus')) await say(L('Et c’est quoi, ce truc tout embrouillé avec un trou ? … Bizarre. Mais il a l’air de bien t’aimer.', 'And what’s that muddled thing with a hole in it? … Weird. But it really seems to like you.'), RIVAL);
  await flash('white', 220);
  showToast(tr(L('Le bois retrouve ses couleurs !', 'The woods get their colours back!')));
  await sayAll([
    L('Wouah… Les arbres sont revenus ! On dirait un dessin qu’on vient de finir.', 'Whoa… The trees are back! It looks like a drawing that was just finished.'),
    L('Je file à Village-Plume, juste au nord. Le premier arrivé à l’Atelier a gagné !', 'I’m off to Featherby, just north of here. First one to the Atelier wins!'),
  ], RIVAL);
  await g.walk(rival, ['right'], 160);
  g.remove('rivalBois');
  mapMusic();
};

scripts.plumeBridge = async () => {
  if (!flag('badge:plume')) {
    await say(L('Le pont a été effacé cette nuit ! Des gens en gris sont partis vers l’est en ricanant.', 'The bridge was rubbed out last night! People in grey went off east, snickering.'), L('Marin', 'Sailor'));
    return;
  }
  await say(L('Gaspard t’a donné son badge ? Alors passe par la Grotte Gribouillis, à l’est de Ville-Pastel. Le pont, on va le redessiner !', 'Gaspard gave you his badge? Then go through Scribble Cave, east of Pastel City. We’ll redraw the bridge!'), L('Marin', 'Sailor'));
};
