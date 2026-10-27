import { L, tr } from '../i18n';
import { playMusic } from '../audio/music';
import { CREATURES, grownForm } from '../data/creatures';
import { partyOf } from '../data/trainers';
import { TOWNS } from '../data/worldmap';
import { newSeed } from '../engine/rng';
import { LOOKS } from '../overworld/sprites';
import { healParty, save, update } from '../state/game';
import { sfx } from '../audio/sfx';
import {
  mapMusic, ask, bubble, fight, flag, flash, getGame, openScreen, say, sayAll, scripts, setFlag, shake, showToast,
  trainerBattle, wait, warpTo, wildBattle,
} from '../overworld/controller';
import { MOM, PROF, RIVAL } from './cast';
import { choose, comeUp, findCoconfus, RETOUCHE } from './choices';

const EFFACEUR = L('Le Grand Effaceur', 'The Great Eraser');
const PAPA = L('Papa', 'Daddy');
const GRUNT = L('Sbire Gomme', 'Eraser Grunt');

// ------------------------------------------------------------------ Pencil Balloon (fast travel)

/** Remembers the towns you have been to (for the balloon). */
scripts.visitTown = async () => {
  const id = getGame().map.def.id;
  if (!flag(`visit:${id}`)) update((d) => (d.flags[`visit:${id}`] = 1));
};

scripts.balloon = async () => {
  const who = L('Pilote', 'Pilot');
  const here = save.value!.player.returnTo?.map;
  const towns = TOWNS.filter((t) => (flag(`visit:${t.map}`) || t.map === 'bourg') && t.map !== here);
  if (!towns.length) {
    await say(L('Mon Ballon-Crayon vole vers les villes que tu as déjà visitées. Reviens quand tu auras voyagé un peu !', 'My Pencil Balloon flies to towns you’ve already visited. Come back once you’ve travelled a bit!'), who);
    return;
  }
  const c = await ask(L('Envie d’un tour en Ballon-Crayon ? On va où ?', 'Fancy a ride in the Pencil Balloon? Where to?'), [...towns.map((t) => t.name), L('Nulle part', 'Nowhere')], who);
  if (c >= towns.length) return;
  const t = towns[c];
  await say(L('Accroche-toi ! On décolle !', 'Hold on tight! Lift-off!'), who);
  await getGame().fadeTo(1, 400, 'white');
  if (save.value) save.value.player.returnTo = undefined;
  await warpTo({ map: t.map, x: t.x, y: t.y, facing: 'down' });
};

// ------------------------------------------------------------------ Bourg-Paillette

scripts.paillBlock = async () => {
  await say(L('Halte ! La route du nord est fermée par ordre du Grand Effaceur. Nos copains tiennent la Tour Brumeuse, alors circule !', 'Halt! The north road is closed by order of the Great Eraser. Our pals hold the Misty Tower, so move along!'), GRUNT);
};

scripts.paillGirl = async () => {
  if (flag('a3.tour')) await say(L('Les Gomme sont partis ! On peut de nouveau aller au Jardin-Gouache, au nord.', 'Team Gomme left! We can go north to Gouache Garden again.'));
  else await say(L('Ces deux Gomme bloquent la route… On dit que leurs chefs se sont installés dans la Tour Brumeuse, loin au sud.', 'Those two Erasers are blocking the road… They say their bosses moved into the Misty Tower, far to the south.'));
};

// ------------------------------------------------------------------ Misty Tower

scripts.gateTour = async () => {
  if (!flag('badge:paillette')) {
    await say(L('La porte de la tour est couverte de traces de gomme… Elle ne s’ouvre pas.', 'The tower door is covered in eraser marks… It won’t open.'));
    return;
  }
  await warpTo({ map: 'tour1', x: 5, y: 10, facing: 'up' });
};

scripts.rivalTower = async () => {
  playMusic('rival');
  await sayAll([
    L('{name} ! Toi aussi tu viens chasser les Gomme ? Ils ont grisé tous les fantômes de la tour…', '{name}! You came to chase out Team Gomme too? They greyed out every ghost in the tower…'),
    L('Tiens, laisse-moi soigner tes Bestioles. Cette fois, on fait équipe !', 'Here, let me heal your Critters. This time, we’re a team!'),
  ], RIVAL);
  await getGame().fadeTo(0.6, 200, 'white');
  update((d) => healParty(d));
  await getGame().fadeTo(0, 300);
  showToast(tr(L('Tes Bestioles sont en pleine forme !', 'Your Critters are in top shape!')));
  await say(L('L’Admin est tout en haut. Je surveille l’entrée. Vas-y !', 'The Admin is at the very top. I’ll guard the entrance. Go!'), RIVAL);
  mapMusic();
};

scripts.towerFreed = async () => {
  const g = getGame();
  await bubble('blanche', '…', 700);
  await say(L('Le patron vous attend à l’Usine à Gommes, à la Cité-Encre. Là-bas, il préparera la page blanche…', 'The boss awaits you at the Eraser Factory, in Ink City. There, he’ll prepare the blank page…'), L('Admin Blanche', 'Admin Whiteout'));
  const b = g.npc('blanche');
  if (b) {
    await g.walk(b, ['down'], 120);
    g.remove('blanche');
  }
  await flash('white', 260);
  showToast(tr(L('Les fantômes de la tour retrouvent leurs couleurs !', 'The tower ghosts get their colours back!')));
  await say(L('Hi hi hi ! Merci ! On peut de nouveau faire des grimaces à tout le monde !', 'Hee hee hee! Thank you! We can pull faces at everyone again!'), L('Fantômes', 'Ghosts'));
  await rivalDoubts();
};

/** The rival comes up the tower, beaten downstairs: he doubts himself (the fifth choice). */
async function rivalDoubts() {
  const g = getGame();
  playMusic('rival');
  const r = await comeUp('rivalTour', LOOKS.rival);
  await sayAll([
    L('{name}… Tu l’as battue. Évidemment.', '{name}… You beat her. Of course you did.'),
    L('Moi, en bas, j’ai perdu contre un simple Sbire. Je perds tout le temps : contre toi, contre eux…', 'Me, downstairs, I lost to a plain grunt. I lose all the time: to you, to them…'),
    L('Je suis nul, hein ?', 'I’m rubbish, aren’t I?'),
  ], RIVAL);
  const way = await choose('rival', L('Que lui réponds-tu ?', 'What do you tell him?'),
    L('Entraîne-toi, tu vas devenir super fort !', 'Train hard, you’ll get really strong!'),
    L('T’es pas nul. T’es génial comme t’es !', 'You’re not rubbish. You’re great just as you are!'), RIVAL);
  await say(way === RETOUCHE
    ? L('… T’as raison. Je vais m’entraîner comme jamais. La prochaine fois, tu verras !', '… You’re right. I’m going to train like never before. Next time, you’ll see!')
    : L('… Merci. C’est bizarre, ça me fait du bien. On se retrouve plus loin, d’accord ?', '… Thanks. It’s weird, it actually helps. See you further on, OK?'), RIVAL);
  g.remove(r.id);
  mapMusic();
}

// ------------------------------------------------------------------ Ink City and the factory

scripts.usineDoor = async () => {
  if (!flag('badge:encre')) {
    await say(L('Un garde en gris bloque la porte. « Sans le Badge Encre, personne n’entre ! »', 'A guard in grey blocks the door. “No Ink Badge, no entry!”'));
    const g = getGame();
    await g.walk(g.player, ['down'], 160);
    return;
  }
  await warpTo({ map: 'usine1', x: 6, y: 10, facing: 'up' });
};

/** Nocturne’s Atelier is closed until her Midnight Ink is back from the lighthouse. */
scripts.atelierEncreDoor = async () => {
  if (flag('a3.phare') || flag('badge:encre')) {
    await warpTo({ map: 'atelierEncre', x: 5, y: 10, facing: 'up' });
    return;
  }
  await say(L('La porte de l’Atelier est fermée à clé. Un mot est épinglé dessus :', 'The Atelier door is locked. A note is pinned to it:'));
  await say(L('« Partie au Phare de l’Encrier, sur l’île au sud de Port-Aquarelle : la Team Gomme m’a volé l’Encre de Minuit ! Le passeur du port connaît le chemin. — Nocturne »', '“Gone to the Inkwell Lighthouse, on the island south of Port Aquarelle: Team Gomme stole my Midnight Ink! The ferryman at the port knows the way. — Nocturne”'));
  setFlag('a3.note');
  const g = getGame();
  await g.walk(g.player, ['down'], 160);
};

/** The ferryman: Port-Aquarelle ⇄ Île de l’Encrier. */
scripts.passeur = async () => {
  const who = L('Passeur', 'Ferryman');
  const onIsle = getGame().map.def.id === 'phareIle';
  const c = await ask(onIsle
    ? L('On rentre à Port-Aquarelle ?', 'Shall we head back to Port Aquarelle?')
    : L('L’Île de l’Encrier ? Son phare est tombé aux mains de la Team Gomme… Je t’y emmène quand même ?', 'Inkwell Isle? Its lighthouse fell into Team Gomme’s hands… Shall I take you there anyway?'),
  [L('Oui', 'Yes'), L('Non', 'No')], who);
  if (c !== 0) return;
  await say(L('En route ! Accroche-toi au bastingage.', 'Off we go! Hold on to the rail.'), who);
  const g = getGame();
  await g.fadeTo(1, 500);
  showToast(tr(L('~ La barque fend les vagues ~', '~ The boat cuts through the waves ~')));
  await wait(900);
  await warpTo(onIsle ? { map: 'port', x: 19, y: 16, facing: 'down' } : { map: 'phareIle', x: 7, y: 10, facing: 'up' });
};

scripts.buvardStop = async () => {
  const g = getGame();
  const b = g.npc('buvard');
  if (b) {
    await bubble('buvard', '!', 600);
    for (let i = 0; i < 4 && Math.abs(b.y - g.player.y) > 1; i++) await g.walk(b, ['down'], 150);
    g.faceToward(g.player, b);
  }
  await trainerBattle('buvard', b);
};

/** After Captain Buvard: Nocturne gets her ink back and flies home. */
scripts.phareEnd = async () => {
  const who = L('Nocturne', 'Nocturne');
  const g = getGame();
  const n = g.npc('nocturnePhare');
  if (n) g.faceToward(n, g.player);
  await sayAll([
    L('L’Encre de Minuit ! Tu l’as reprise… Sans elle, mon Atelier restait dans le noir.', 'The Midnight Ink! You got it back… Without it, my Atelier stayed in the dark.'),
    L('Je rentre tout de suite à la Cité-Encre. Rejoins-moi à l’Atelier : là-bas, je ne te ferai pas de cadeau !', 'I’m heading straight back to Ink City. Meet me at the Atelier: over there, I won’t go easy on you!'),
  ], who);
  await flash('white', 250);
  if (n) g.remove(n.id);
  const bv = g.npc('buvard');
  if (bv) g.remove(bv.id);
  await say(L('(Nocturne s’envole dans un tourbillon d’encre.)', '(Nocturne flies away in a swirl of ink.)'));
};

/** After the Ink Badge: the ink blot on Nocturne's fresco (the sixth choice). */
scripts.encreChoice = async () => {
  const who = L('Nocturne', 'Nocturne');
  await sayAll([
    L('Tu vois la fresque, au fond ? Le ciel de la Cité-Encre. C’était mon plus beau dessin.', 'See the fresco at the back? The sky over Ink City. It was my finest drawing.'),
    L('Quand la Team Gomme a volé mon Encre de Minuit, le flacon s’est renversé dessus. Une grosse tache, en plein milieu.', 'When Team Gomme stole my Midnight Ink, the bottle spilled on it. A big blot, right in the middle.'),
    L('Depuis, je n’ose plus la regarder. Toi, qu’est-ce que tu ferais ?', 'Since then, I can’t bear to look at it. What would you do?'),
  ], who);
  const way = await choose('encre', L('Que lui conseilles-tu ?', 'What do you tell her?'),
    L('Gomme la tache et refais-la, encore plus belle !', 'Rub the blot out and paint it again, even better!'),
    L('Fais de la tache une lune !', 'Turn the blot into a moon!'), who);
  await flash('white', 260);
  await say(way === RETOUCHE
    ? L('Un coup de gomme, un ciel tout neuf… Regarde ces étoiles ! Elle est plus belle qu’avant.', 'A rub of the eraser, a brand-new sky… Look at those stars! It’s finer than before.')
    : L('Une lune… Mais oui ! La tache était là pour ça. Ma fresque n’a jamais été aussi belle.', 'A moon… Of course! That’s what the blot was for. My fresco has never looked so good.'), who);
};

scripts.encreFresque = async () => {
  if (flag('choix:encre:a')) await say(L('Le ciel de la Cité-Encre, repeint tout neuf. Les étoiles brillent comme si on venait de les poser.', 'The sky over Ink City, freshly repainted. The stars shine as if they had just been put there.'));
  else if (flag('choix:encre:b')) await say(L('Le ciel de la Cité-Encre. Au milieu, la tache d’encre est devenue une lune. On ne voit plus qu’elle.', 'The sky over Ink City. In the middle, the ink blot has become a moon. It’s all you can see.'));
  else await say(L('Un ciel de nuit plein d’étoiles… et une grosse tache d’encre en plein milieu.', 'A night sky full of stars… and a big ink blot right in the middle.'));
};

/** The gate at the top of the Piste Cyclable only opens from the Gouache side. */
scripts.pisteGate = async () => {
  const g = getGame();
  if (flag('piste.open')) return;
  if (g.player.x < 2) {
    sfx.door();
    setFlag('piste.open');
    await say(L('Tu soulèves le loquet de la grille. Clac ! La Piste Cyclable est ouverte jusqu’à Ville-Feutre.', 'You lift the gate’s latch. Clack! The Cycling Track is open all the way to Felt City.'));
  } else {
    await say(L('La grille est fermée… Le loquet est de l’autre côté, vers le Jardin-Gouache.', 'The gate is shut… The latch is on the other side, towards Gouache Garden.'));
  }
};

/** Bikes only on the Piste Cyclable (walking out is fine). */
scripts.pisteBike = async () => {
  const g = getGame();
  if (g.biking) return;
  const leaving = g.player.dir === 'left';
  if (leaving) return;
  await say(L('Panneau : « Piste Cyclable — Vélo-Crayon obligatoire ! » Il faudrait monter sur un vélo.', 'Sign: “Cycling Track — Pencil Bike only!” You’d need to get on a bike.'));
  await g.walk(g.player, ['left'], 160);
};

/** The Grotte des Échos: Ombrouille waits at the back, once. */
scripts.echoShadow = async () => {
  if (flag('static:ombrouille')) return;
  await say(L('Une ombre gigantesque te fixe de ses yeux rouges…', 'A huge shadow stares at you with red eyes…'));
  await shake(500);
  await say(L('… Elle se jette sur toi !', '… It leaps at you!'));
  const out = await wildBattle('011', 36, { music: 'final' });
  if (out === 'capture' || out === 'win') {
    setFlag('static:ombrouille');
    await say(out === 'capture'
      ? L('L’ombre s’est laissé dessiner… Ombrouille est à toi !', 'The shadow let itself be drawn… Ombrouille is yours!')
      : L('L’ombre se dissipe dans un éclat de rire… Elle ne reviendra pas.', 'The shadow fades away with a laugh… It won’t come back.'));
  } else if (out) {
    await say(L('L’ombre recule au fond de la grotte… Elle t’attend toujours.', 'The shadow draws back into the cave… It is still waiting for you.'));
  }
};

scripts.encreNorth = async () => {
  const g = getGame();
  await say(L('Au nord, le monde n’est même plus colorié… Une drôle de brume blanche empêche d’avancer.', 'Up north, the world isn’t even coloured in anymore… A strange white mist keeps you from going on.'));
  await g.walk(g.player, ['down'], 160);
};

scripts.rature2Stop = async () => {
  const g = getGame();
  const r = g.npc('rature2');
  if (r) {
    await bubble('rature2', '!', 600);
    for (let i = 0; i < 4 && Math.abs(r.x - g.player.x) + Math.abs(r.y - g.player.y) > 1; i++) {
      await g.walk(r, [r.y > g.player.y + 1 ? 'up' : r.x > g.player.x ? 'left' : r.x < g.player.x ? 'right' : 'up'], 150);
    }
    g.faceToward(g.player, r);
  }
  await trainerBattle('rature2', r);
};

scripts.blanche2Stop = async () => {
  const g = getGame();
  const b = g.npc('blanche2');
  if (b) {
    await bubble('blanche2', '!', 600);
    for (let i = 0; i < 4 && Math.abs(b.y - g.player.y) > 1; i++) await g.walk(b, ['down'], 150);
    g.faceToward(g.player, b);
  }
  await trainerBattle('blanche2', b);
};

/** The Great Eraser rubs Coconfus with his giant eraser: it turns pale until the end (`coconPale`). */
async function paleCocoon() {
  await sayAll([
    L('Et voilà donc le fameux cocon. Le dessin raté d’hier soir… Je le reconnaîtrais entre mille.', 'And here is the famous cocoon. Last night’s failed drawing… I’d know it anywhere.'),
    L('Un dessin pas fini, ça ne se garde pas. Ça se gomme.', 'An unfinished drawing isn’t kept. It’s rubbed out.'),
  ], EFFACEUR);
  await shake(400);
  await flash('white', 400);
  setFlag('coconPale');
  await sayAll([
    L('Le Grand Effaceur frotte Coconfus d’un grand coup de gomme !', 'The Great Eraser gives Muddlecoon a big rub with his eraser!'),
    L('Coconfus est tout pâle… On voit presque le papier à travers lui !', 'Muddlecoon has gone all pale… You can almost see the paper through it!'),
  ]);
}

/** The Great Eraser shows himself for the first time, then runs to the edge of the page. */
scripts.usineEnd = async () => {
  const g = getGame();
  await shake(500);
  const boss = g.spawn('effaceurUsine', LOOKS.effaceur, 6, 1, 'down');
  await wait(300);
  await sayAll([
    L('Assez.', 'Enough.'),
    L('Alors c’est toi, la petite main qui recolorie tout ce que j’efface…', 'So you’re the little hand colouring back everything I rub out…'),
    L('Les dessins, ça dépasse, ça bave, c’est tordu. Une page blanche, elle, n’a jamais tort.', 'Drawings go over the lines, they smudge, they’re crooked. A blank page is never wrong.'),
  ], EFFACEUR);
  if (save.value && findCoconfus(save.value)) await paleCocoon();
  await say(L('Viens donc me trouver au Bord de la Page, là où tout finit. Nous verrons bien ce qu’il restera de tes gribouillis.', 'Come and find me at the Edge of the Page, where everything ends. We’ll see what’s left of your scribbles.'), EFFACEUR);
  await flash('white', 300);
  g.remove(boss.id);
  await say(L('(La brume blanche au nord de la Cité-Encre s’est levée.)', '(The white mist north of Ink City has lifted.)'));
};

// ------------------------------------------------------------------ the last rival battle

scripts.rivalFinal = async () => {
  const g = getGame();
  playMusic('rival');
  const r = g.npc('rivalEnd');
  if (r) {
    for (let i = 0; i < 3 && Math.abs(r.y - g.player.y) > 1; i++) await g.walk(r, ['down'], 160);
    g.faceToward(g.player, r);
  }
  await sayAll([
    L('{name}… Je savais que tu viendrais jusqu’ici.', '{name}… I knew you’d make it here.'),
    L('Avant d’affronter le Grand Effaceur, montre-moi tout ce que tu as appris. Sans retenue !', 'Before you face the Great Eraser, show me everything you’ve learned. Hold nothing back!'),
  ], RIVAL);
  const starter = grownForm(String(save.value!.flags.rivalStarter ?? 2).padStart(3, '0'), 43);
  const party = partyOf([
    { species: '013', level: 28, item: 'plume-vive' }, { species: '008', level: 28, item: 'gouter' }, { species: '010', level: 29, item: 'lunettes-tetues' },
    { species: '007', level: 28 }, { species: '004', level: 29 }, { species: starter, level: 31, item: 'baie-doree' },
  ], newSeed());
  const out = await fight('trainer', RIVAL, party, {
    trainer: { id: 'rivalFinal', name: RIVAL, party: [], money: 5000, before: [], after: [L('Toujours un coup d’avance sur moi, hein…', 'Always one step ahead of me, huh…')] },
    look: LOOKS.rival, backdrop: 'sketch', music: 'rival',
  });
  if (out.result !== 'win') return;
  setFlag('tr:rivalFinal');
  await sayAll([
    L('Tu sais quoi ? Moi, je crois en tes dessins. Depuis toujours.', 'You know what? I believe in your drawings. I always have.'),
    L('Laisse-moi soigner ton équipe. Et va lui montrer de quoi sont faits tes gribouillis !', 'Let me heal your team. And go show him what your scribbles are made of!'),
  ], RIVAL);
  update((d) => healParty(d));
  showToast(tr(L('Tes Bestioles sont en pleine forme !', 'Your Critters are in top shape!')));
};

// ------------------------------------------------------------------ the Great Eraser

scripts.finalBoss = async () => {
  const g = getGame();
  const boss = g.npc('effaceur');
  if (boss) g.faceToward(boss, g.player);
  await sayAll([
    L('Te voilà. Regarde autour de toi : ici, plus rien n’est dessiné. C’est calme. C’est propre.', 'Here you are. Look around: nothing is drawn here anymore. It’s calm. It’s clean.'),
    L('Je suis la petite voix qui chuchote quand tu dessines : « c’est raté », « c’est moche », « ça dépasse ».', 'I am the little voice that whispers while you draw: “it’s wrong”, “it’s ugly”, “it goes over the lines”.'),
    L('Laisse-moi tout effacer. Une page blanche ne se trompe jamais.', 'Let me rub it all out. A blank page is never wrong.'),
  ], EFFACEUR);
  for (;;) {
    const c = await ask(L('Alors ? Tu me laisses effacer tes dessins ?', 'So? Will you let me rub out your drawings?'), [
      L('Mes dessins sont beaux parce que ce sont les miens !', 'My drawings are beautiful because they’re mine!'),
      L('…', '…'),
    ], EFFACEUR);
    if (c === 0) break;
    await say(L('Tu vois ? Même toi, tu n’y crois pas…', 'You see? Even you don’t believe it…'), EFFACEUR);
  }
  await shake(600);
  await say(L('Alors prouve-le !', 'Then prove it!'), EFFACEUR);
  await trainerBattle('effaceur', boss);
  if (!flag('tr:effaceur')) return;
  await sayAll([
    L('Tant de couleurs… Je ne pensais pas qu’un gribouillis pouvait briller autant.', 'So many colours… I never thought a scribble could shine so bright.'),
    L('Continue de dessiner… même quand ça dépasse.', 'Keep drawing… even when it goes over the lines.'),
  ], EFFACEUR);
  await flash('white', 300);
  if (boss) g.remove(boss.id);
  await wakeUp();
};

/** The page turns white and you wake up at home. */
async function wakeUp() {
  await say(L('La page se met à trembler… Tout devient blanc, de plus en plus blanc…', 'The page starts to tremble… Everything turns white, whiter and whiter…'));
  await getGame().fadeTo(1, 1200, 'white');
  if (save.value) save.value.player.returnTo = undefined;
  await warpTo({ map: 'chambre', x: 2, y: 3, facing: 'right' }, { keepFade: true });
}

/** The Great Eraser is beaten but the app closed before the ending: it starts again from here. */
scripts.bordPage = async () => {
  if (flag('tr:effaceur') && !flag('ending')) await wakeUp();
};

// ------------------------------------------------------------------ waking up

scripts.ending = async () => {
  // the app closed during the credits: the ending already counted, go home
  if (flag('ending')) return backHome();
  const g = getGame();
  await wait(500);
  await say(L('… {name} ? Ma puce ?', '… {name}? Sweetie?'), PAPA);
  await g.fadeTo(0, 1600, 'white');
  await bubble('player', '?', 800);
  await sayAll([
    L('Tu t’es {g:endormie|endormi} sur ton cahier de dessin. Tu as encore les crayons dans la main !', 'You fell asleep on your sketchbook. You’ve still got the pencils in your hand!'),
    L('Je viens de prendre tes nouveaux dessins en photo, comme toujours. Comme ça, ils ne se perdront jamais.', 'I just took pictures of your new drawings, like always. That way, they’ll never get lost.'),
  ], PAPA);
  await say(L('(Papa a les mêmes cheveux gris que le Prof. Fusain. Et le même appareil photo…)', '(Daddy has the same grey hair as Prof. Charcoal. And the same camera…)'));
  await sayAll([
    L('Tu sais, la petite voix qui dit que tes dessins sont moches… elle se trompe.', 'You know, that little voice that says your drawings are ugly… it’s wrong.'),
    L('Ils sont beaux parce que ce sont les tiens.', 'They’re beautiful because they’re yours.'),
    L('Tu me dessines une nouvelle Bestiole demain ?', 'Will you draw me a new Critter tomorrow?'),
  ], PAPA);
  setFlag('ending');
  await openScreen({ id: 'credits', fromWorld: true });
  await g.fadeTo(1, 600, 'white');
  await backHome();
};

/** After the credits: back to Papeterre, at home. */
async function backHome() {
  update((d) => {
    healParty(d);
    d.respawn = { map: 'maison', x: 4, y: 5 };
  });
  await warpTo({ map: 'maison', x: 6, y: 4, facing: 'down' });
  await say(L('La nuit suivante, tu retournes à Papeterre… Les Bestioles t’attendaient !', 'The next night, you go back to Papeterra… The Critters were waiting for you!'));
}

scripts.papa = async () => {
  await say(L('Allez, au lit. Demain, il y a plein de dessins à faire !', 'Come on, bedtime. Tomorrow there are lots of drawings to do!'), PAPA);
};

scripts.desk = async () => {
  await say(L('Tes dessins sont étalés sur le bureau : une chenille, un oiseau, un fantôme qui rigole… Ils ont l’air de te sourire.', 'Your drawings are spread over the desk: a caterpillar, a bird, a laughing ghost… They seem to smile at you.'));
};

// ------------------------------------------------------------------ after the ending

const prevProf = scripts.prof;
scripts.prof = async () => {
  if (!flag('ending')) return prevProf();
  const pages = Object.keys(save.value!.bag).filter((k) => k.startsWith('page-')).length;
  const caught = save.value!.dex.caught.length;
  if (pages >= 12 && !flag('pagesReward')) {
    await sayAll([
      L('Tu as retrouvé les 12 pages du cahier ! Clic-clac, je les prends en photo… comme toujours.', 'You found all 12 sketchbook pages! Click-clack, I’ll take a picture of them… like always.'),
      L('Tiens, ma pu… {name}. Pour toi.', 'Here, sweet… {name}. For you.'),
    ], PROF);
    update((d) => {
      d.bag.rappel = (d.bag.rappel ?? 0) + 5;
      d.bag['super-crayon-ball'] = (d.bag['super-crayon-ball'] ?? 0) + 10;
    });
    setFlag('pagesReward');
    showToast(tr(L('+5 Rappels · +10 Super Crayon-balls', '+5 Revives · +10 Great Pencil Balls')));
    return;
  }
  if (caught >= CREATURES.length && !flag('dexDiploma')) {
    await sayAll([
      L('Ton Bestiodex est complet ! Toutes les Bestioles de la petite artiste, réunies !', 'Your Critterdex is complete! Every one of the little artist’s Critters, all together!'),
      L('Je te décerne le Diplôme du Bestiodex. Et quand de nouveaux dessins arriveront… je compte sur toi !', 'I award you the Critterdex Diploma. And when new drawings arrive… I’m counting on you!'),
    ], PROF);
    setFlag('dexDiploma');
    showToast(tr(L('Diplôme du Bestiodex !', 'Critterdex Diploma!')));
    return;
  }
  await say(L('Bon retour à Papeterre ! Cherche les pages déchirées ({p}/12) et complète ton Bestiodex ({c}/{t}).', 'Welcome back to Papeterra! Look for the torn pages ({p}/12) and complete your Critterdex ({c}/{t}).'), PROF, { p: pages, c: caught, t: CREATURES.length });
  if (!flag('champion')) await say(L('Et au-delà du Bord de la Page, une nouvelle page s’est ouverte : le Grand Concours t’y attend !', 'And beyond the Edge of the Page, a new page has opened: the Grand Contest awaits you there!'), PROF);
};

const prevMom = scripts.mom;
scripts.mom = async () => {
  if (!flag('ending')) return prevMom();
  await say(L('Tu as fait de beaux rêves ? Tu souriais en dormant. Allez, va jouer !', 'Sweet dreams? You were smiling in your sleep. Go on, go play!'), MOM);
};
