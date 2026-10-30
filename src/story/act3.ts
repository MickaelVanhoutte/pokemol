import { L, tr } from '../i18n';
import { playMusic } from '../audio/music';
import { DEX_GOAL, dexCount } from '../data/creatures';
import { partyOf, rivalFinalTeam } from '../data/trainers';
import { TOWNS } from '../data/worldmap';
import { newSeed } from '../engine/rng';
import { LOOKS } from '../overworld/sprites';
import { healParty, save, update } from '../state/game';
import { sfx } from '../audio/sfx';
import {
  mapMusic, ask, bubble, fight, flag, flash, getGame, say, sayAll, scripts, setFlag, shake, showToast,
  openScreen, trainerBattle, wait, warpTo, wildBattle,
} from '../overworld/controller';
import { MOM, PROF, RIVAL } from './cast';
import { choose, cocoonRemembers, comeUp, findCoconfus, RETOUCHE } from './choices';

const EFFACEUR = L('Le Grand Effaceur', 'The Great Eraser');
const GRUNT = L('Sbire Gomme', 'Eraser Grunt');

// ------------------------------------------------------------------ Pencil Balloon (fast travel)

/** Remembers the towns you have been to (for the balloon). */
scripts.visitTown = async () => {
  const id = getGame().map.def.id;
  if (!flag(`visit:${id}`)) update((d) => (d.flags[`visit:${id}`] = 1));
};

scripts.balloon = async () => {
  const who = L('Pilote', 'Pilot');
  const g = getGame();
  const here = g.map.def.id;
  const towns = TOWNS.filter((t) => (flag(`visit:${t.map}`) || t.map === 'bourg') && t.map !== here);
  if (!towns.length) {
    await say(L('Mon Ballon-Crayon vole vers les villes que tu as déjà visitées. Reviens quand tu auras voyagé un peu !', 'My Pencil Balloon flies to towns you’ve already visited. Come back once you’ve travelled a bit!'), who);
    return;
  }
  const c = await ask(L('Envie d’un tour en Ballon-Crayon ? On va où ?', 'Fancy a ride in the Pencil Balloon? Where to?'), [...towns.map((t) => t.name), L('Nulle part', 'Nowhere')], who);
  if (c >= towns.length) return;
  const t = towns[c];
  await say(L('Monte dans la nacelle… Accroche-toi, on décolle !', 'Climb into the basket… Hold on tight, lift-off!'), who);
  // into the basket, up and away, the trip over the Town Map, and down by the other town's Inn
  g.passenger = true;
  await g.balloonFly('up');
  await g.fadeTo(1, 400, 'white');
  await openScreen({ id: 'flight', from: here, to: t.map });
  await warpTo({ map: t.map, x: t.x, y: t.y, facing: 'down' }, { keepFade: true, quiet: true });
  const landing = getGame().balloonFly('down');
  await getGame().fadeTo(0, 400);
  await landing;
  getGame().passenger = false;
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
  await say(L('Le patron t’attend à l’Usine à Gommes, à la Cité-Encre. Là-bas, il préparera la page blanche…', 'The boss awaits you at the Eraser Factory, in Ink City. There, he’ll prepare the blank page…'), L('Admin Blanche', 'Admin Whiteout'));
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
  const here = getGame().map.def.id;
  const onIsle = here === 'phareIle' || here === 'ilePage';
  // once the Bestiodex is complete (and the Prof told about it), the hidden island to the south
  const hidden = !onIsle && flag('ilePage') && dexCount(save.value!.dex.caught) >= DEX_GOAL;
  let to: 'port' | 'phareIle' | 'ilePage' | null;
  if (onIsle) {
    to = (await ask(L('On rentre à Port-Aquarelle ?', 'Shall we head back to Port Aquarelle?'), [L('Oui', 'Yes'), L('Non', 'No')], who)) === 0 ? 'port' : null;
  } else if (hidden) {
    await say(L('L’île tout au sud ? Celle qu’on ne voit que quand on a tout dessiné ? … Tiens, c’est vrai qu’on la voit, aujourd’hui.', 'The island far to the south? The one you only see once you have drawn everything? … Well, I can see it today.'), who);
    const c = await ask(L('Où va-t-on ?', 'Where to?'), [L('Île de l’Encrier', 'Inkwell Isle'), L('Île de la Première Page', 'First Page Isle'), L('Nulle part', 'Nowhere')], who);
    to = c === 0 ? 'phareIle' : c === 1 ? 'ilePage' : null;
  } else {
    to = (await ask(L('L’Île de l’Encrier ? Son phare est tombé aux mains de la Team Gomme… Je t’y emmène quand même ?', 'Inkwell Isle? Its lighthouse fell into Team Gomme’s hands… Shall I take you there anyway?'),
      [L('Oui', 'Yes'), L('Non', 'No')], who)) === 0 ? 'phareIle' : null;
  }
  if (!to) return;
  await say(L('En route ! Accroche-toi au bastingage.', 'Off we go! Hold on to the rail.'), who);
  const g = getGame();
  await g.fadeTo(1, 500);
  showToast(tr(L('~ La barque fend les vagues ~', '~ The boat cuts through the waves ~')));
  await wait(900);
  await warpTo(to === 'port' ? { map: 'port', x: 19, y: 16, facing: 'down' } : to === 'phareIle' ? { map: 'phareIle', x: 7, y: 10, facing: 'up' } : { map: 'ilePage', x: 10, y: 2, facing: 'down' });
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
  const out = await wildBattle('011', 38, { music: 'final' });
  if (out === 'capture' || out === 'win') {
    setFlag('static:ombrouille');
    await say(out === 'capture'
      ? L('L’ombre s’est laissé dessiner… Ombrouille est à toi !', 'The shadow let itself be drawn… Ombrouille is yours!')
      : L('L’ombre se dissipe dans un éclat de rire… Elle ne reviendra pas.', 'The shadow fades away with a laugh… It won’t come back.'));
  } else if (out) {
    await say(L('L’ombre recule au fond de la grotte… Elle t’attend toujours.', 'The shadow draws back into the cave… It is still waiting for you.'));
  }
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
    L('Moi, je veux seulement que tout soit beau. Parfait. Mais rien n’est jamais parfait… alors je gomme.', 'All I want is for everything to be beautiful. Perfect. But nothing is ever perfect… so I rub it out.'),
  ], EFFACEUR);
  if (save.value && findCoconfus(save.value)) await paleCocoon();
  await say(L('Viens donc me trouver au Bord de la Page, là où tout finit. Nous verrons bien ce qu’il restera de tes gribouillis.', 'Come and find me at the Edge of the Page, where everything ends. We’ll see what’s left of your scribbles.'), EFFACEUR);
  await flash('white', 300);
  g.remove(boss.id);
  await shake(700);
  await say(L('Au loin, un grondement… Un grand mur blanc vient de se dresser au nord de la Cité-Encre !', 'In the distance, a rumble… A great white wall has just risen north of Ink City!'));
  if (flag('coconPale')) await cocoonRemembers();
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
    flag('choix:rival:a')
      ? L('Je me suis entraîné tous les jours depuis la Tour, comme tu me l’as dit. Et tu sais quoi ? J’adore ça ! Montre-moi si ça a servi !', 'I’ve trained every day since the Tower, like you told me. And you know what? I love it! Show me if it paid off!')
      : flag('choix:rival:b')
        ? L('Tu m’as dit que j’étais génial comme j’étais. Alors ce combat, je le fais juste pour le plaisir. Sans retenue !', 'You told me I was great just as I am. So this battle is just for fun. Hold nothing back!')
        : L('Avant d’affronter le Grand Effaceur, montre-moi tout ce que tu as appris. Sans retenue !', 'Before you face the Great Eraser, show me everything you’ve learned. Hold nothing back!'),
  ], RIVAL);
  const party = partyOf(rivalFinalTeam(String(save.value!.flags.rivalStarter ?? 2).padStart(3, '0')), newSeed());
  const out = await fight('trainer', RIVAL, party, {
    trainer: { id: 'rivalFinal', name: RIVAL, party: [], money: 5000, fairCopy: true, before: [], after: [L('Toujours un coup d’avance sur moi, hein…', 'Always one step ahead of me, huh…')] },
    look: LOOKS.rival, backdrop: 'sketch', music: 'rival',
  });
  if (out.result !== 'win') return;
  setFlag('tr:rivalFinal');
  await sayAll([
    flag('choix:rival:a')
      ? L('Perdu… mais de pas grand-chose ! La prochaine fois, je m’entraînerai encore plus.', 'Beaten… but only just! Next time I’ll train even harder.')
      : L('Perdu ! Et pourtant, je me sens bien. C’est bizarre, hein ?', 'Beaten! And yet I feel fine. Weird, huh?'),
    L('Tu sais quoi ? Moi, je crois en tes dessins. Depuis toujours.', 'You know what? I believe in your drawings. I always have.'),
    L('Laisse-moi soigner ton équipe. Et va lui montrer de quoi sont faits tes gribouillis !', 'Let me heal your team. And go show him what your scribbles are made of!'),
  ], RIVAL);
  update((d) => healParty(d));
  showToast(tr(L('Tes Bestioles sont en pleine forme !', 'Your Critters are in top shape!')));
};

// ------------------------------------------------------------------ after the ending

const prevProf = scripts.prof;
scripts.prof = async () => {
  if (!flag('ending')) return prevProf();
  const pages = Object.keys(save.value!.bag).filter((k) => k.startsWith('page-')).length;
  const caught = dexCount(save.value!.dex.caught);
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
  if (caught >= DEX_GOAL && !flag('ilePage')) {
    // the diploma (once), then the island it opens (for games that had the diploma before new Bestioles came, too)
    if (!flag('dexDiploma')) {
      await sayAll([
        L('Ton Bestiodex est complet ! Toutes les Bestioles de la petite artiste, réunies !', 'Your Critterdex is complete! Every one of the little artist’s Critters, all together!'),
        L('Je te décerne le Diplôme du Bestiodex. Clic-clac !', 'I award you the Critterdex Diploma. Click-clack!'),
      ], PROF);
      setFlag('dexDiploma');
      showToast(tr(L('Diplôme du Bestiodex !', 'Critterdex Diploma!')));
    }
    setFlag('ilePage');
    await sayAll([
      L('Tu sais… Les vieux marins du Port racontent qu’au sud, il y a une île qu’on ne voit que quand on a tout dessiné.', 'You know… The old sailors at the Port say that to the south there is an island you can only see once you have drawn everything.'),
      L('Une île où quelque chose a tracé les tout premiers traits du monde. Je ne l’ai jamais vue… Va demander au passeur !', 'An island where something drew the very first lines of the world. I have never seen it… Go and ask the ferryman!'),
    ], PROF);
    return;
  }
  await say(L('Bon retour à Papeterre ! Cherche les pages déchirées ({p}/12) et complète ton Bestiodex ({c}/{t}).', 'Welcome back to Papeterra! Look for the torn pages ({p}/12) and complete your Critterdex ({c}/{t}).'), PROF, { p: pages, c: caught, t: DEX_GOAL });
  if (!flag('champion')) await say(L('Et au-delà du Bord de la Page, une nouvelle page s’est ouverte : le Grand Concours t’y attend !', 'And beyond the Edge of the Page, a new page has opened: the Grand Contest awaits you there!'), PROF);
};

const prevMom = scripts.mom;
scripts.mom = async () => {
  if (!flag('ending')) return prevMom();
  await say(L('Tu as fait de beaux rêves ? Tu souriais en dormant. Allez, va jouer !', 'Sweet dreams? You were smiling in your sleep. Go on, go play!'), MOM);
};
