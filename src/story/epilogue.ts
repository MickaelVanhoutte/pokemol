/**
 * « La page d’après » (roadmap milestone 8): an epilogue after the Grand Concours and four Atelier rematches. The
 * player's doubt, an ally now, comes to Masterpiece Square: there is a page it can't finish. On that page (map
 * `margeBlanche`, past a corner of the Edge of the Page) three ink stains wait to be redrawn or kept, Captain
 * Buvard came to look, and the doubt asks for a real training battle: the Great Eraser's team, once a week, growing.
 */
import { L, tr, type LText } from '../i18n';
import { doubtLook } from '../data/appearance';
import { TRAINERS, partyOf, type TrainerDef } from '../data/trainers';
import { newSeed } from '../engine/rng';
import { localDay } from '../overworld/berries';
import { lookOf, type Look } from '../overworld/sprites';
import { eraseOut, redraw, sketchIn } from '../overworld/scene';
import { healParty, save, update } from '../state/game';
import { arrivals, ask, fight, flag, getGame, giveItem, gotItem, playerLook, say, sayAll, scripts, setFlag, showToast, wait } from '../overworld/controller';

/** The doubt as an ally: the player's own look, greyed, without Team Gomme's cap. */
export function doubtFriendLook(): Look {
  const a = doubtLook(playerLook());
  return { ...lookOf(a), appearance: a };
}

const DOUTE = L('Ta petite voix', 'Your little voice');
/** The week the doubt's rematch was last won (`re:effaceur`). */
const weekOf = (day = localDay()) => Math.floor(day / 7);
/** Its team grows two levels a win, up to this level. */
export const DOUBT_MAX_LEVEL = 80;

// ------------------------------------------------------------------ it comes to ask for help

let tried: unknown = null;
arrivals.push(() => {
  const g = getGame();
  if (g.map.def.id !== 'galerie' || !flag('champion') || !flag('couleurs:bord') || flag('ep:1') || tried === g.map) return null;
  return async () => {
    tried = getGame().map;
    await douteArrives();
  };
});

async function douteArrives() {
  const g = getGame();
  const p = g.player;
  // drawn in right beside you (the one magic way to appear)
  const spot = ([[1, 0], [-1, 0], [0, 1], [0, -1]] as const).map(([dx, dy]) => ({ x: p.x + dx, y: p.y + dy })).find((s) => !g.blocked(s.x, s.y)) ?? { x: p.x, y: p.y - 1 };
  const dir = spot.x > p.x ? 'left' : spot.x < p.x ? 'right' : spot.y > p.y ? 'up' : 'down';
  const a = await sketchIn('douteVient', doubtFriendLook(), spot.x, spot.y, dir);
  g.faceToward(p, a);
  await sayAll([
    L('C’est moi… ta petite voix. N’aie pas peur : je ne gomme plus.', 'It’s me… your little voice. Don’t be scared: I don’t rub things out any more.'),
    L('Au Bord de la Page, tout en haut à droite, il y a une feuille que je n’arrive pas à finir. Chaque fois que j’y touche, elle se tache.', 'At the Edge of the Page, right at the top on the right, there’s a sheet I can’t finish. Every time I touch it, it gets stained.'),
    L('Tu viens m’aider ? Je t’attends là-bas.', 'Will you come and help me? I’ll wait for you there.'),
  ], DOUTE);
  setFlag('ep:1');
  await eraseOut(a);
  showToast(tr(L('Un coin de page s’est ouvert au Bord de la Page…', 'A corner of the page opened at the Edge of the Page…')));
}

// ------------------------------------------------------------------ the three stains

const STAIN_LINES: Record<1 | 2, LText> = {
  1: L('(Tu as redessiné cette tache : des fleurs y poussent, à ta façon.)', '(You redrew this stain: flowers grow there, your way.)'),
  2: L('(Tu as gardé cette tache. Elle fait partie du dessin, maintenant.)', '(You kept this stain. It’s part of the drawing now.)'),
};

async function stain(n: 1 | 2 | 3) {
  const d = save.value!;
  const done = d.flags[`ep:t${n}`] as 1 | 2 | undefined;
  if (done) {
    await say(STAIN_LINES[done]);
    return;
  }
  const c = await ask(L('Une grosse tache d’encre sur la page… Qu’est-ce que tu en fais ?', 'A big ink stain on the page… What will you do with it?'),
    [L('La redessiner', 'Redraw it'), L('La garder', 'Keep it')]);
  const at = { x: n === 1 ? 4 : n === 2 ? 10 : 7, y: n === 3 ? 7 : 3 };
  if (c === 0) {
    // the flags are written out so the map's patches find them (src/story/story.test.ts)
    if (n === 1) setFlag('ep:t1:a');
    if (n === 2) setFlag('ep:t2:a');
    if (n === 3) setFlag('ep:t3:a');
    update((x) => (x.flags[`ep:t${n}`] = 1));
    await redraw('sketch', { at });
    await say(L('Tu gommes la tache, et tu dessines des fleurs à la place. Pour t’amuser.', 'You rub the stain out and draw flowers instead. For fun.'));
  } else {
    if (n === 1) setFlag('ep:t1:b');
    if (n === 2) setFlag('ep:t2:b');
    if (n === 3) setFlag('ep:t3:b');
    update((x) => (x.flags[`ep:t${n}`] = 2));
    await say(L('Tu laisses la tache. En la regardant bien… on dirait un petit nuage.', 'You leave the stain. Looking closely… it looks like a little cloud.'));
  }
}
scripts.tache1 = () => stain(1);
scripts.tache2 = () => stain(2);
scripts.tache3 = () => stain(3);

/** The three stains answered: how many were redrawn. */
const redrawn = () => [1, 2, 3].filter((n) => save.value!.flags[`ep:t${n}`] === 1).length;
const allAnswered = () => [1, 2, 3].every((n) => !!save.value!.flags[`ep:t${n}`]);

// ------------------------------------------------------------------ the doubt and its training battle

/** The doubt's team after `wins` wins: two levels more each time, up to `DOUBT_MAX_LEVEL`. */
export function doubtTeam(wins: number): TrainerDef['party'] {
  return TRAINERS.effaceurEp.party.map((m) => ({ ...m, level: Math.min(DOUBT_MAX_LEVEL, m.level + 2 * Math.min(wins, 7)) }));
}

scripts.doute = async () => {
  const d = save.value!;
  if (!allAnswered()) {
    await say(L('Les taches… je ne sais jamais si je dois les effacer ou les garder. À toi de voir : touche-les.', 'The stains… I never know whether to rub them out or keep them. Your call: go and touch them.'), DOUTE);
    return;
  }
  const first = !flag('ep:done');
  if (first) {
    await sayAll([
      redrawn() >= 2
        ? L('Tu as redessiné les taches… pour t’amuser, pas parce que tu avais peur. Je crois que j’ai compris la différence.', 'You redrew the stains… for fun, not because you were scared. I think I understand the difference now.')
        : L('Tu as gardé les taches. Elles font partie du dessin, maintenant… et le dessin est plus joli comme ça.', 'You kept the stains. They’re part of the drawing now… and the drawing is prettier that way.'),
      L('Avant, je voulais tout gommer. Maintenant, je veux t’aider à recommencer quand tu en as envie.', 'Before, I wanted to rub everything out. Now I want to help you start again when you feel like it.'),
    ], DOUTE);
  } else if (d.flags['re:effaceur'] === weekOf()) {
    await say(L('On s’est déjà entraînés cette semaine. Reviens la semaine prochaine : j’aurai appris de nouvelles choses.', 'We already trained this week. Come back next week: I’ll have learnt new things.'), DOUTE);
    return;
  }
  if ((await ask(L('Et si on s’entraînait, pour de vrai ? Plus de gomme : juste toi et moi.', 'How about we train, for real? No more eraser: just you and me.'), [L('Oui', 'Yes'), L('Non', 'No')], DOUTE)) !== 0) {
    await say(L('Quand tu veux. Je reste sur cette page.', 'Whenever you like. I’m staying on this page.'), DOUTE);
    return;
  }
  // a fair battle, both teams at their best
  const g = getGame();
  await g.fadeTo(0.6, 200, 'white');
  update((x) => healParty(x));
  await g.fadeTo(0, 300);
  const wins = d.flags['ep:wins'] ?? 0;
  const t = TRAINERS.effaceurEp;
  const out = await fight('trainer', DOUTE, partyOf(doubtTeam(wins), newSeed()), {
    trainer: { ...t, id: 'effaceurEp' }, look: { ...doubtFriendLook(), gang: 'boss', cape: '#3a3448' }, music: 'final', backdrop: 'sketch',
  });
  if (out.result !== 'win') return;
  update((x) => {
    x.flags['re:effaceur'] = weekOf();
    x.flags['ep:wins'] = wins + 1;
    healParty(x);
  });
  if (first) {
    setFlag('ep:done');
    await say(L('Regarde… la page.', 'Look… the page.'), DOUTE);
    await redraw('restore', { at: { x: 8, y: 6 } });
    await wait(300);
    await sayAll([
      L('Elle est finie. Pas parfaite… finie. Et c’est encore mieux.', 'It’s finished. Not perfect… finished. And that’s even better.'),
      L('Tiens, prends ça. Et reviens t’entraîner avec moi chaque semaine, d’accord ?', 'Here, take this. And come back to train with me every week, OK?'),
    ], DOUTE);
    update((x) => (x.money += 20000));
    giveItem('sucette-magique', 3);
    await gotItem('sucette-magique', L('Tu reçois 20 000 ₽ et 3 Sucettes Magiques !', 'You got ₽20,000 and 3 Magic Lollipops!'));
  } else {
    await say(L('Encore perdu ! Mais j’ai appris un truc. À la semaine prochaine !', 'Beaten again! But I learnt something. See you next week!'), DOUTE);
  }
};
