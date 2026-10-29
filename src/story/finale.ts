/**
 * The end of the dream (docs/story.md, "The two endings"): at the Edge of the Page the Great Eraser's face comes
 * back, and it is the player's own: the doubting self. The last answer counts double; the battle; waking up in
 * the real bedroom, where last night's unfinished butterfly waits on the last page of the sketchbook and
 * becomes Libellune (rubbed out and drawn again) or Noctaile (kept, smudges and all). Back in the dream,
 * Coconfus has become that drawing. Saves that saw the old ending replay it here, without the battle.
 */
import { L, tr } from '../i18n';
import { doubtLook, hoodedLook } from '../data/appearance';
import { creature } from '../data/creatures';
import { ORIGINALS, originalUrl } from '../data/originals';
import { evolutionMoves, evolve } from '../engine/pk/creature';
import { sheetFor, type Actor } from '../overworld/game';
import { LOOKS, lookOf, type Look } from '../overworld/sprites';
import { healParty, save, see, update } from '../state/game';
import { personUrl } from '../ui/personArt';
import {
  ask, bubble, evoOverlay, flag, flash, getGame, openScreen, playerLook, say, sayAll, scripts, setFlag, shake, showPicture,
  teachMove, trainerBattle, wait, warpTo,
} from '../overworld/controller';
import { MOM } from './cast';
import { choose, coconfusJoins, COCONFUS, endingOf, findCoconfus, RETOUCHE, type Way } from './choices';

const EFFACEUR = L('Le Grand Effaceur', 'The Great Eraser');
const PAPA = L('Papa', 'Daddy');

/** The Great Eraser once his face is back: the player's look, greyed, in his uniform and cape, without the cap. */
const unmasked = (): Look => {
  const a = doubtLook(playerLook());
  return { ...lookOf(a), gang: 'boss', cape: LOOKS.effaceur.cape, appearance: a };
};

/**
 * His face comes back, and it is the player's own: the rubbed-out face fills in with the player's eyes and smile,
 * then Team Gomme's cap slowly fades away. On the map too, he now looks like the player.
 */
async function reveal(boss?: Actor) {
  await say(L('Le Grand Effaceur porte la main à son visage effacé… Les miettes de gomme tombent une à une.', 'The Great Eraser raises a hand to his rubbed-out face… The eraser crumbs fall away one by one.'));
  await shake(500);
  const me = playerLook();
  await showPicture(personUrl(doubtLook(me)), tr(L('Le Grand Effaceur… a ton visage !', 'The Great Eraser… has your face!')), [
    { src: personUrl(hoodedLook(me, 'blank')), hold: 900, fade: 1600 },
    { src: personUrl(hoodedLook(me)), hold: 900, fade: 3200 },
  ]);
  if (boss) boss.sheet = sheetFor(unmasked());
  await sayAll([
    L('Tu ne m’avais pas reconnu ? Je suis toi. La petite voix qui veut que tout soit parfait.', 'You didn’t recognise me? I am you. The little voice that wants everything to be perfect.'),
    L('Toi, tu dessines pour t’amuser. Moi, je veux que ce soit parfait. Au fond, on veut la même chose : un beau dessin.', 'You draw for fun. I want it to be perfect. Deep down, we want the same thing: a beautiful drawing.'),
    L('Hier soir, tu as dessiné un papillon. Ses ailes n’étaient jamais assez belles. Alors tu as gommé, gommé… jusqu’à faire un trou dans la page.', 'Last night, you drew a butterfly. Its wings were never beautiful enough. So you rubbed out, and rubbed out… until you made a hole in the page.'),
    L('Ce cocon tout pâle, c’est lui. Pas parfait, alors raté. Laisse-moi finir de l’effacer : une page blanche, au moins, c’est parfait.', 'That pale little cocoon is it. Not perfect, so a failure. Let me finish rubbing it out: a blank page, at least, is perfect.'),
  ], EFFACEUR);
}

/** The last answer (it counts double). */
const lastAnswer = () => choose('final', L('Que réponds-tu ?', 'What do you answer?'),
  L('Tu as raison, il peut être plus beau. Je vais le refaire… pour m’amuser, pas par peur !', 'You’re right, it can be more beautiful. I’ll draw it again… for fun, not out of fear!'),
  L('Il n’est pas parfait. C’est pour ça qu’il est à moi.', 'It isn’t perfect. That’s why it’s mine.'), EFFACEUR);

/** What the doubt becomes, for each ending. */
async function doubtListens(fin: Way) {
  await say(L('Gommer pour faire plus beau, ou gommer parce qu’on a peur de rater… c’est la même gomme. Mais ce n’est pas pareil.', 'Rubbing out to make it more beautiful, or rubbing out because you’re scared of getting it wrong… it’s the same eraser. But it isn’t the same thing.'), EFFACEUR);
  await sayAll(fin === RETOUCHE
    ? [
        L('Le refaire pour t’amuser… Alors je ne suis pas là pour effacer. Je suis là pour t’aider à faire encore plus beau.', 'Drawing it again for fun… So I’m not here to rub things out. I’m here to help you make it even more beautiful.'),
        L('Je serai ta gomme. Pas pour tout effacer : pour recommencer quand tu en as envie.', 'I’ll be your eraser. Not to rub everything out: to start again whenever you feel like it.'),
      ]
    : [
        L('Le garder… même avec ses taches ? Alors les taches aussi font partie du dessin.', 'Keep it… even with its smudges? Then the smudges are part of the drawing too.'),
        L('Je serai ton ombre. Une ombre, ça fait partie du dessin, elle aussi.', 'I’ll be your shadow. A shadow is part of the drawing too.'),
      ], EFFACEUR);
  await say(L('Réveille-toi, maintenant. Ton papillon t’attend sur la dernière page.', 'Wake up now. Your butterfly is waiting on the last page.'), EFFACEUR);
}

scripts.finalBoss = async () => {
  const g = getGame();
  const boss = g.npc('effaceur');
  if (boss) g.faceToward(boss, g.player);
  await sayAll([
    L('Te voilà. Regarde autour de toi : ici, plus rien n’est dessiné. C’est calme. C’est propre.', 'Here you are. Look around: nothing is drawn here anymore. It’s calm. It’s clean.'),
    L('Tu as arrêté ma Gomme Géante. Mais il me reste la mienne. Et tu sais très bien qui je suis.', 'You stopped my Giant Eraser. But I still have my own. And you know very well who I am.'),
  ], EFFACEUR);
  await reveal(boss);
  await lastAnswer();
  await shake(600);
  await say(L('Alors montre-moi !', 'Then show me!'), EFFACEUR);
  await trainerBattle('effaceur', undefined, unmasked());
  if (!flag('tr:effaceur')) return;
  // the ending is saved with the win, before any dialog
  const fin = endingOf(save.value!.flags);
  setFlag('fin', fin);
  await doubtListens(fin);
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

/** The ending the save has: the one chosen, or what its answers lead to. */
const finOf = (): Way => {
  const f = save.value?.flags.fin;
  return f === 1 || f === 2 ? f : endingOf(save.value?.flags ?? {});
};

/** The last page of the sketchbook: the drawing, then Papa's photo. */
async function lastPage(fin: Way) {
  await say(L('Sur la dernière page de ton cahier, il y a ton papillon d’hier soir. Pas fini, tout embrouillé, avec un petit trou au milieu.', 'On the last page of your sketchbook is last night’s butterfly. Unfinished, all muddled, with a little hole in the middle.'));
  await say(L('Une petite voix murmure dans ta tête… mais cette fois, elle est gentille.', 'A little voice whispers in your head… but this time, it is kind.'));
  await openScreen({ id: 'drawing', ending: fin });
  await sayAll([
    fin === RETOUCHE
      ? L('Tu l’as gommé et redessiné ? Il est magnifique !', 'You rubbed it out and drew it again? It’s beautiful!')
      : L('Tu l’as gardé, avec toutes ses taches ? Il est magnifique !', 'You kept it, smudges and all? It’s beautiful!'),
    L('Hier soir, tu voulais qu’il soit parfait… et tu as fait un trou dans la page. Le mieux est parfois l’ennemi du bien.', 'Last night, you wanted it to be perfect… and you made a hole in the page. Sometimes perfect is the enemy of good.'),
    L('Ce qui compte, c’est que tu aies pris plaisir à le dessiner.', 'What matters is that you enjoyed drawing it.'),
  ], PAPA);
  await say(L('(Le Prof. Fusain disait exactement la même chose…)', '(Prof. Charcoal said exactly the same thing…)'));
  await say(L('Clic-clac ! Comme ça, il ne se perdra jamais.', 'Click-clack! That way, it will never get lost.'), PAPA);
}

// ------------------------------------------------------------------ waking up

scripts.ending = async () => {
  // the ending already counted (the app closed after the credits): the house is there to look around, until bed
  if (flag('ending')) {
    if (flag('reveil:dodo')) await backHome();
    return;
  }
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
  await say(L('Oh, et celui-là ? Le papillon de la dernière page… Tu ne l’avais pas fini, hier soir.', 'Oh, and this one? The butterfly on the last page… You hadn’t finished it last night.'), PAPA);
  await lastPage(finOf());
  await say(L('Tu me dessines une nouvelle Bestiole demain ?', 'Will you draw me a new Critter tomorrow?'), PAPA);
  setFlag('ending');
  await openScreen({ id: 'credits', fromWorld: true });
  await papaGoesDown();
};

/** After the credits: Papa goes downstairs, and the real house is the player's to look around until bedtime. */
async function papaGoesDown() {
  const g = getGame();
  await wait(400);
  const papa = g.npc('papa') ?? g.spawn('papa', LOOKS.papa, 3, 3, 'left');
  g.faceToward(papa, g.player);
  await say(L('Allez, viens prendre ton petit-déjeuner. Maman t’attend en bas !', 'Come on, come and have your breakfast. Mummy is waiting downstairs!'), PAPA);
  await g.walk(papa, ['right', 'right', 'right', 'right', 'right', 'right', 'up', 'up']);
  g.remove(papa.id);
  await say(L('(Tu peux te promener dans la maison. Quand tu voudras retrouver Papeterre, va te coucher dans ton lit.)', '(You can walk around the house. When you want to go back to Papeterra, go to bed.)'));
}

// ------------------------------------------------------------------ the real house, awake

/** The bed: the day goes by, and at night the dream takes you back to Papeterre. */
scripts.litReel = async () => {
  if (!flag('ending')) return;
  const c = await ask(L('Ton lit. Attendre le soir et retrouver les Bestioles ?', 'Your bed. Wait for the evening and go back to the Critters?'), [L('Oui', 'Yes'), L('Non', 'No')]);
  if (c !== 0) return;
  // saved before the scene: a game closed midway goes back to the dream when it loads (`ending` above)
  setFlag('reveil:dodo');
  await say(L('La journée passe : tu dessines, tu joues, tu dessines encore… Le soir venu, tu te glisses sous la couette et tu fermes les yeux…', 'The day goes by: you draw, you play, you draw some more… When evening comes, you snuggle under the covers and close your eyes…'));
  await getGame().fadeTo(1, 900, 'white');
  await backHome();
};

scripts.papa = async () => {
  await sayAll([
    finOf() === RETOUCHE
      ? L('Ton papillon redessiné, je l’ai mis en fond d’écran sur mon téléphone. Regarde !', 'I’ve made your redrawn butterfly the wallpaper on my phone. Look!')
      : L('Ton papillon plein de taches, je l’ai mis en fond d’écran sur mon téléphone. C’est mon préféré !', 'I’ve made your smudgy butterfly the wallpaper on my phone. It’s my favourite!'),
    L('Tu sais, je garde les photos de tous tes dessins. Même ceux que tu trouves ratés… Surtout ceux-là.', 'You know, I keep pictures of all your drawings. Even the ones you think went wrong… Those most of all.'),
    L('Ce soir, tu me montres ce que tu as dessiné aujourd’hui ?', 'Tonight, will you show me what you drew today?'),
  ], PAPA);
};

scripts.mamanReelle = async () => {
  if (flag('reveil:bisou')) {
    await say(L('Finis ton chocolat, {name}, il va refroidir !', 'Finish your hot chocolate, {name}, it’s getting cold!'), MOM);
    return;
  }
  setFlag('reveil:bisou');
  await sayAll([
    L('Ah, te voilà ! Papa t’a {g:retrouvée|retrouvé} {g:endormie|endormi} sur ton cahier… encore !', 'Ah, there you are! Daddy found you asleep on your sketchbook… again!'),
    L('Tu parlais en dormant, tu sais. Des histoires de Bestioles… et de gomme géante !', 'You were talking in your sleep, you know. Stories about Critters… and a giant eraser!'),
    L('Allez, assieds-toi : il y a des tartines. Tu me racontes ton rêve ?', 'Come on, sit down: there’s toast. Will you tell me about your dream?'),
  ], MOM);
};

/** Her real drawings on the fridge, one more each time (the originals, as in the museum of the dream). */
let fridgeAt = 0;
scripts.frigo = async () => {
  if (fridgeAt === 0) await say(L('Le frigo est couvert de tes dessins, tenus par des aimants. Exactement comme dans ton rêve…', 'The fridge is covered with your drawings, held up by magnets. Just like in your dream…'));
  const c = creature(ORIGINALS[fridgeAt++ % ORIGINALS.length]);
  await showPicture(originalUrl(c), tr(L('Sur le frigo : {n}', 'On the fridge: {n}'), { n: tr(c.name) }));
};

scripts.cuisine = async () => {
  await say(L('Un bol de chocolat chaud et des tartines. Ça sent bon !', 'A bowl of hot chocolate and some toast. It smells good!'));
};

scripts.albums = async () => {
  await say(L('Les albums photo de Papa. Des centaines de photos de tes dessins, du tout premier au dernier… Il y a déjà ton papillon.', 'Daddy’s photo albums. Hundreds of pictures of your drawings, from the very first to the last… Your butterfly is already in there.'));
};

scripts.teleReelle = async () => {
  await say(L('La télé est éteinte. Dans l’écran noir, tu vois tes cheveux en bataille.', 'The TV is off. In the black screen, you see your messy hair.'));
};

scripts.fenetre = async () => {
  await say(L('Dehors, le soleil se lève sur la rue. Pas une Bestiole en vue… Mais ce chat, sur le muret, ressemble drôlement à Minousse.', 'Outside, the sun is rising over the street. Not a Critter in sight… But that cat on the wall looks an awful lot like Minousse.'));
};

scripts.trousse = async () => {
  await say(L('Ta trousse est restée sur la table. Il manque le crayon vert… Ah non : il est encore dans ta main !', 'Your pencil case is still on the table. The green pencil is missing… Oh no wait: it’s still in your hand!'));
};

scripts.livresReel = async () => {
  await say(L('Tes livres préférés… et, coincé entre deux, ton tout premier cahier de dessin.', 'Your favourite books… and, squeezed between two of them, your very first sketchbook.'));
};

/** The front door: no going out in pyjamas. */
scripts.porteReelle = async () => {
  await say(L('Pas question de sortir en pyjama ! Et puis, le petit-déjeuner t’attend.', 'No going out in your pyjamas! Besides, breakfast is waiting.'));
  const g = getGame();
  await g.walk(g.player, ['up']);
};

/** After the credits: back to Papeterre, at home, where Coconfus has become the drawing. */
async function backHome() {
  update((d) => {
    healParty(d);
    d.respawn = { map: 'maison', x: 4, y: 5 };
  });
  await warpTo({ map: 'maison', x: 6, y: 4, facing: 'down' });
  await say(L('La nuit suivante, tu retournes à Papeterre… Les Bestioles t’attendaient !', 'The next night, you go back to Papeterra… The Critters were waiting for you!'));
  await dreamEvolves();
}

/** Coconfus becomes the drawing of the last page, wherever it is (party, PC or daycare). */
async function dreamEvolves() {
  const d = save.value;
  const m = d && findCoconfus(d);
  if (!d || !m || m.species !== COCONFUS) return;
  const into = finOf() === RETOUCHE ? '071' : '072';
  const i = d.party.findIndex((x) => x.uid === m.uid);
  if (i >= 0) {
    // the evolution scene, which no B can stop this time
    await new Promise<boolean>((resolve) => (evoOverlay.value = { mon: m, to: into, resolve }));
    evoOverlay.value = null;
  }
  update((x) => {
    const t = [...x.party, ...x.boxes.flat(), ...(x.daycare?.slots.map((s) => s.mon) ?? [])].find((y) => y.uid === m.uid);
    if (t) evolve(t, into);
    see(x, into);
    if (!x.dex.caught.includes(into)) x.dex.caught.push(into);
  });
  if (i >= 0) {
    for (const id of evolutionMoves(into, save.value!.party[i].level)) {
      if (!save.value!.party[i].moves.some((mv) => mv.id === id)) await teachMove(i, id);
    }
  } else {
    await say(L('Quelque part dans ton PC, Coconfus s’est transformé en {n} !', 'Somewhere in your PC, Muddlecoon has turned into {n}!'), undefined, { n: tr(creature(into).name) });
  }
  setFlag('coconPale', 0);
}

/** The sketchbook on the desk; in its margin, the drafts of Hameau-Brouillon, coloured in or not (the seventh choice). */
scripts.desk = async () => {
  await say(L('Tes dessins sont étalés sur le bureau : une chenille, un oiseau, un fantôme qui rigole… et sur la dernière page, ton papillon.', 'Your drawings are spread over the desk: a caterpillar, a bird, a laughing ghost… and on the last page, your butterfly.'));
  if (flag('choix:hameau:a')) await say(L('Dans la marge, de tout petits bonshommes, coloriés en vitesse, en dépassant un peu. L’un d’eux a des mains toutes neuves… et il tient une fleur.', 'In the margin, tiny little people, coloured in a hurry, going over the lines a bit. One of them has brand-new hands… and he’s holding a flower.'));
  else if (flag('choix:hameau:b')) await say(L('Dans la marge, de tout petits bonshommes pas finis : un vieux monsieur sans mains, une petite avec une seule oreille… Ils ont l’air contents.', 'In the margin, tiny unfinished little people: an old man with no hands, a little girl with only one ear… They look happy.'));
};

// ------------------------------------------------------------------ saves that saw the old ending

/**
 * A pale Coconfus waits at the Edge of the Page for saves that finished the story before it existed: the
 * Great Eraser shows his face, the last answer, the last page and the evolution, without the battle.
 */
scripts.coconBord = async () => {
  if (flag('fin')) return;
  const g = getGame();
  const d = save.value!;
  if (!findCoconfus(d)) {
    await say(L('Un petit cocon tout pâle tremble au bord de la page… Il a un trou au milieu. Il se blottit contre toi.', 'A pale little cocoon is trembling at the edge of the page… It has a hole in the middle. It snuggles up to you.'));
    const top = Math.max(10, ...d.party.filter((m) => !m.egg).map((m) => m.level));
    await coconfusJoins(Math.min(60, top - 3), g.npc('coconBord'));
  } else {
    g.remove('coconBord');
  }
  setFlag('coconPale');
  await shake(400);
  const boss = g.spawn('effaceurReve', LOOKS.effaceur, g.player.x, Math.max(1, g.player.y - 2), 'down');
  await say(L('Le Grand Effaceur ! Ce n’était donc pas fini…', 'The Great Eraser! So it wasn’t over…'));
  await reveal(boss);
  await lastAnswer();
  const fin = endingOf(save.value!.flags);
  setFlag('fin', fin);
  await doubtListens(fin);
  await flash('white', 300);
  g.remove(boss.id);
  await getGame().fadeTo(1, 900, 'white');
  await say(L('Le temps d’un clin d’œil, tu te réveilles dans ta chambre. Papa est penché sur ton cahier…', 'For the blink of an eye, you wake up in your bedroom. Daddy is leaning over your sketchbook…'));
  await lastPage(fin);
  await getGame().fadeTo(0, 600);
  await dreamEvolves();
};
