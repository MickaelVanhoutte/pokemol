/**
 * Coconfus, the unfinished drawing, around the story (it joins the team in act1.ts, `boisRestore`): the
 * Prof notices he never photographed it, and can at last once it has finished growing (after the ending, the
 * photo hangs in the lab); saves that went past the woods before it existed meet it in the next town.
 * Imported after the acts, since it wraps their scripts.
 */
import { L, tr } from '../i18n';
import { creature, monLabel } from '../data/creatures';
import { flag, say, sayAll, scripts, setFlag, showPicture } from '../overworld/controller';
import { allMons, save } from '../state/game';
import { monArtUrl } from '../ui/monArt';
import { COCONFUS, coconfusJoins, findCoconfus, RETOUCHE } from './choices';
import { PROF } from './cast';

/** The level Coconfus joins at, for a save that went past the woods: a little under the team's lead. */
const catchUpLevel = () => {
  const top = Math.max(0, ...(save.value?.party ?? []).filter((m) => !m.egg).map((m) => m.level));
  return Math.max(10, Math.min(60, top - 3));
};

// saves that crossed the Misty Woods before Coconfus existed: it finds them in the next town
const prevVisit = scripts.visitTown;
scripts.visitTown = async () => {
  await prevVisit?.();
  const d = save.value;
  if (!d || !flag('a1.bois') || flag('gift:coconfus') || flag('ending') || findCoconfus(d)) return;
  await sayAll([
    L('Quelque chose tire sur ta manche… Un petit cocon tout embrouillé, avec un trou au milieu !', 'Something tugs at your sleeve… A muddled little cocoon, with a hole in the middle!'),
    L('Il a l’air de t’avoir cherché partout. Il ne veut plus te quitter.', 'It looks like it has been searching everywhere for you. It doesn’t want to leave you again.'),
  ]);
  await coconfusJoins(catchUpLevel());
};

/** What Coconfus became at the ending (`fin`: 1 Libellune, 2 Noctaile). */
const grownForm = () => (save.value?.flags.fin === 2 ? '072' : save.value?.flags.fin === 1 ? '071' : undefined);

const photoCaption = (n: string) => tr(L('Photo du Prof. Fusain : {n}', 'Prof. Charcoal’s photo: {n}'), { n });

/** After the ending: it has finished growing, so the Prof can take its picture at last (`prof:photo`, 2 when sparkly). */
async function profPhoto() {
  const d = save.value!;
  const into = grownForm()!;
  const m = d.party.find((x) => x.species === into && !x.egg);
  if (!m) {
    await say(L('Il paraît que ton Coconfus a fini de grandir ? Amène-le-moi : cette fois, il ne m’échappera pas !', 'I hear your Muddlecoon has finished growing? Bring it to me: this time, it won’t get away!'), PROF);
    return false;
  }
  setFlag('prof:photo', m.shiny ? 2 : 1);
  await say(L('Oh ! Ton Coconfus a fini de grandir ! Ne bouge plus… Clic-clac !', 'Oh! Your Muddlecoon has finished growing! Hold still… Click-clack!'), PROF);
  await showPicture(monArtUrl(m), photoCaption(monLabel(m)));
  await sayAll([
    d.flags.fin === RETOUCHE
      ? L('Des ailes toutes neuves, nettes comme du vitrail… Et il a pris la pose, le coquin !', 'Brand-new wings, crisp as stained glass… And it struck a pose, the rascal!')
      : L('Toutes ses taches sont sur la photo, et elles brillent comme des étoiles… Et il a pris la pose, le coquin !', 'Every one of its smudges made it into the photo, shining like stars… And it struck a pose, the rascal!'),
    L('Celle-là, je l’accroche au mur, juste là. Comme ça, il ne se perdra jamais.', 'This one goes on the wall, right there. That way, it will never get lost.'),
  ], PROF);
  return true;
}

/** The photo on the lab wall. */
scripts.labPhoto = async () => {
  const into = grownForm();
  if (!flag('prof:photo') || !into) return;
  await showPicture(monArtUrl({ species: into, shiny: save.value!.flags['prof:photo'] === 2 }), photoCaption(tr(creature(into).name)));
};

// the Prof has photographed every Bestiole… except this one
const prevProf = scripts.prof;
scripts.prof = async () => {
  const d = save.value;
  const into = grownForm();
  if (d && flag('ending') && into && !flag('prof:photo') && allMons(d).some((m) => m.species === into)) {
    if (await profPhoto()) return;
  }
  if (d && !flag('ending') && !flag('prof:coconfus') && findCoconfus(d)) {
    await sayAll([
      L('Oh ! Montre-moi cette Bestiole… Clic-cl… Tiens ? C’est bizarre.', 'Oh! Show me that Critter… Click-cl… Huh? That’s odd.'),
      L('Je n’ai jamais pris {n} en photo. Jamais ! Moi qui photographie tous les dessins…', 'I’ve never taken a picture of {n}. Never! And I photograph every drawing…'),
      L('On dirait… qu’il n’est pas fini. Il bouge tout le temps, je n’arrive pas à le prendre !', 'It looks like… it isn’t finished. It keeps moving, I can’t get a shot of it!'),
    ], PROF, { n: tr(creature(COCONFUS).name) });
    setFlag('prof:coconfus');
    return;
  }
  return prevProf?.();
};
