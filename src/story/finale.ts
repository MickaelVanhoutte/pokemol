/**
 * The end of the dream (docs/story.md, "The two endings"): at the Edge of the Page the Great Eraser's face comes
 * back, and it is the player's own: the doubting self. The last answer counts double; the battle; waking up in
 * the real bedroom, where last night's unfinished butterfly waits on the last page of the sketchbook and
 * becomes Libellune (rubbed out and drawn again) or Noctaile (kept, smudges and all). Back in the dream,
 * Coconfus has become that drawing. Saves that saw the old ending replay it here, without the battle.
 */
import { L, tr } from '../i18n';
import { doubtLook } from '../data/appearance';
import { creature } from '../data/creatures';
import { evolutionMoves, evolve } from '../engine/pk/creature';
import { LOOKS, type Look } from '../overworld/sprites';
import { healParty, save, see, update } from '../state/game';
import { personUrl } from '../ui/personArt';
import {
  bubble, evoOverlay, flag, flash, getGame, openScreen, playerLook, say, sayAll, scripts, setFlag, shake, showPicture,
  teachMove, trainerBattle, wait, warpTo,
} from '../overworld/controller';
import { choose, coconfusJoins, COCONFUS, endingOf, findCoconfus, RETOUCHE, type Way } from './choices';

const EFFACEUR = L('Le Grand Effaceur', 'The Great Eraser');
const PAPA = L('Papa', 'Daddy');

/** The Great Eraser once his face is back: the player's look, greyed, in his uniform. */
const unmasked = (): Look => ({ ...LOOKS.effaceur, appearance: doubtLook(playerLook()) });

/** He takes his hood off: the player's own face. */
async function reveal() {
  await say(L('Le Grand Effaceur porte la main à son visage effacé… Les miettes de gomme tombent une à une.', 'The Great Eraser raises a hand to his rubbed-out face… The eraser crumbs fall away one by one.'));
  await shake(500);
  await showPicture(personUrl(doubtLook(playerLook())), tr(L('Le Grand Effaceur… a ton visage !', 'The Great Eraser… has your face!')));
  await sayAll([
    L('Tu ne m’avais pas reconnu ? Je suis toi. Le toi qui doute.', 'You didn’t recognise me? I am you. The you who doubts.'),
    L('Hier soir, tu as dessiné un papillon. Tu n’arrivais pas à faire ses ailes. Alors tu as gommé, gommé… jusqu’à faire un trou dans la page.', 'Last night, you drew a butterfly. You couldn’t get its wings right. So you rubbed out, and rubbed out… until you made a hole in the page.'),
    L('Ce cocon tout pâle, c’est lui. Ton dessin raté. Laisse-moi finir de l’effacer.', 'That pale little cocoon is it. Your failed drawing. Let me finish rubbing it out.'),
  ], EFFACEUR);
}

/** The last answer (it counts double). */
const lastAnswer = () => choose('final', L('Que réponds-tu ?', 'What do you answer?'),
  L('Tu as raison, il peut être plus beau. On ne l’efface pas : on le redessine !', 'You’re right, it can be better. We don’t rub it out: we draw it again!'),
  L('Il n’est pas parfait. C’est pour ça qu’il est à moi.', 'It isn’t perfect. That’s why it’s mine.'), EFFACEUR);

/** What the doubt becomes, for each ending. */
async function doubtListens(fin: Way) {
  await sayAll(fin === RETOUCHE
    ? [
        L('Le redessiner… Alors je ne suis pas là pour effacer. Je suis là pour t’aider à faire mieux.', 'Draw it again… So I’m not here to rub things out. I’m here to help you do better.'),
        L('Je serai ta gomme. Pas pour tout effacer : pour recommencer.', 'I’ll be your eraser. Not to rub everything out: to start again.'),
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
  await reveal();
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
      ? L('Tu l’as gommé et redessiné ? Il est magnifique ! Tu as écouté la petite voix… et tu as fait encore mieux.', 'You rubbed it out and drew it again? It’s beautiful! You listened to the little voice… and did even better.')
      : L('Tu l’as gardé, avec toutes ses taches ? Il est magnifique ! Tu as écouté la petite voix… et tu as gardé ton dessin à toi.', 'You kept it, smudges and all? It’s beautiful! You listened to the little voice… and kept your very own drawing.'),
    L('Clic-clac ! Comme ça, il ne se perdra jamais.', 'Click-clack! That way, it will never get lost.'),
  ], PAPA);
}

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
  await say(L('Oh, et celui-là ? Le papillon de la dernière page… Tu ne l’avais pas fini, hier soir.', 'Oh, and this one? The butterfly on the last page… You hadn’t finished it last night.'), PAPA);
  await lastPage(finOf());
  await say(L('Tu me dessines une nouvelle Bestiole demain ?', 'Will you draw me a new Critter tomorrow?'), PAPA);
  setFlag('ending');
  await openScreen({ id: 'credits', fromWorld: true });
  await g.fadeTo(1, 600, 'white');
  await backHome();
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

scripts.papa = async () => {
  await say(L('Allez, au lit. Demain, il y a plein de dessins à faire !', 'Come on, bedtime. Tomorrow there are lots of drawings to do!'), PAPA);
};

scripts.desk = async () => {
  await say(L('Tes dessins sont étalés sur le bureau : une chenille, un oiseau, un fantôme qui rigole… et sur la dernière page, ton papillon.', 'Your drawings are spread over the desk: a caterpillar, a bird, a laughing ghost… and on the last page, your butterfly.'));
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
  await reveal();
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
