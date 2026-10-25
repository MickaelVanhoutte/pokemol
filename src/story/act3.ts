import { L, tr } from '../i18n';
import { CREATURES } from '../data/creatures';
import { partyOf } from '../data/trainers';
import { TOWNS } from '../data/worldmap';
import { newSeed } from '../engine/rng';
import { LOOKS } from '../overworld/sprites';
import { healParty, save, update } from '../state/game';
import {
  ask, bubble, fight, flag, flash, getGame, openScreen, say, sayAll, scripts, setFlag, shake, showToast,
  trainerBattle, wait, warpTo,
} from '../overworld/controller';
import { MOM, PROF, RIVAL } from './cast';

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
  await sayAll([
    L('{name} ! Toi aussi tu viens chasser les Gomme ? Ils ont grisé tous les fantômes de la tour…', '{name}! You came to chase out Team Gomme too? They greyed out every ghost in the tower…'),
    L('Tiens, laisse-moi soigner tes Bestioles. Cette fois, on fait équipe !', 'Here, let me heal your Critters. This time, we’re a team!'),
  ], RIVAL);
  await getGame().fadeTo(0.6, 200, 'white');
  update((d) => healParty(d));
  await getGame().fadeTo(0, 300);
  showToast(tr(L('Tes Bestioles sont en pleine forme !', 'Your Critters are in top shape!')));
  await say(L('L’Admin est tout en haut. Je surveille l’entrée. Vas-y !', 'The Admin is at the very top. I’ll guard the entrance. Go!'), RIVAL);
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
  setFlag('a3.tour');
  showToast(tr(L('Les fantômes de la tour retrouvent leurs couleurs !', 'The tower ghosts get their colours back!')));
  await say(L('Hi hi hi ! Merci ! On peut de nouveau faire des grimaces à tout le monde !', 'Hee hee hee! Thank you! We can pull faces at everyone again!'), L('Fantômes', 'Ghosts'));
};

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

scripts.encreNorth = async () => {
  const g = getGame();
  await say(L('Au nord, le monde n’est même plus colorié… Une drôle de brume blanche empêche d’avancer.', 'Up north, the world isn’t even coloured in anymore… A strange white mist keeps you from going on.'));
  await g.walk(g.player, ['down'], 160);
};

scripts.encreOld = async () => {
  await say(L('Tu sais, on raconte que le monde a un bord. Comme une page de cahier. Et que tout au bout, quelqu’un dort…', 'You know, they say the world has an edge. Like a notebook page. And that at the very end, someone is sleeping…'), L('Mamie Encre', 'Granny Ink'));
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
    L('Viens donc me trouver au Bord de la Page, là où tout finit. Nous verrons bien ce qu’il restera de tes gribouillis.', 'Come and find me at the Edge of the Page, where everything ends. We’ll see what’s left of your scribbles.'),
  ], EFFACEUR);
  await flash('white', 300);
  g.remove(boss.id);
  setFlag('a3.usine');
  await say(L('(La brume blanche au nord de la Cité-Encre s’est levée.)', '(The white mist north of Ink City has lifted.)'));
};

// ------------------------------------------------------------------ the last rival battle

scripts.rivalFinal = async () => {
  const g = getGame();
  const r = g.npc('rivalEnd');
  if (r) {
    for (let i = 0; i < 3 && Math.abs(r.y - g.player.y) > 1; i++) await g.walk(r, ['down'], 160);
    g.faceToward(g.player, r);
  }
  await sayAll([
    L('{name}… Je savais que tu viendrais jusqu’ici.', '{name}… I knew you’d make it here.'),
    L('Avant d’affronter le Grand Effaceur, montre-moi tout ce que tu as appris. Sans retenue !', 'Before you face the Great Eraser, show me everything you’ve learned. Hold nothing back!'),
  ], RIVAL);
  const starter = String(save.value!.flags.rivalStarter ?? 2).padStart(3, '0');
  const party = partyOf([
    { species: '013', level: 40, item: 'vive-griffe' }, { species: '008', level: 40, item: 'gouter' }, { species: '010', level: 41, item: 'lunettes-choix' },
    { species: '007', level: 40 }, { species: '004', level: 41 }, { species: starter, level: 43, item: 'baie-doree' },
  ], newSeed());
  const out = await fight('trainer', RIVAL, party, {
    trainer: { id: 'rivalFinal', name: RIVAL, party: [], money: 5000, before: [], after: [L('Toujours un coup d’avance sur moi, hein…', 'Always one step ahead of me, huh…')] },
    look: LOOKS.rival, backdrop: 'sketch',
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
  await say(L('La page se met à trembler… Tout devient blanc, de plus en plus blanc…', 'The page starts to tremble… Everything turns white, whiter and whiter…'));
  await getGame().fadeTo(1, 1200, 'white');
  if (save.value) save.value.player.returnTo = undefined;
  await warpTo({ map: 'chambre', x: 2, y: 3, facing: 'right' }, { keepFade: true });
};

// ------------------------------------------------------------------ waking up

scripts.ending = async () => {
  if (flag('ending')) return;
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
  update((d) => {
    healParty(d);
    d.respawn = { map: 'maison', x: 4, y: 5 };
  });
  await warpTo({ map: 'maison', x: 7, y: 2, facing: 'down' });
  await say(L('La nuit suivante, tu retournes à Papeterre… Les Bestioles t’attendaient !', 'The next night, you go back to Papeterra… The Critters were waiting for you!'));
};

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
};

const prevMom = scripts.mom;
scripts.mom = async () => {
  if (!flag('ending')) return prevMom();
  await say(L('Tu as fait de beaux rêves ? Tu souriais en dormant. Allez, va jouer !', 'Sweet dreams? You were smiling in your sleep. Go on, go play!'), MOM);
};
