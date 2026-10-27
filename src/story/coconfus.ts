/**
 * Coconfus, the unfinished drawing, around the story (it joins the team in act1.ts, `boisRestore`): the
 * Prof notices he never photographed it, and saves that went past the woods before it existed meet it in
 * the next town. Imported after the acts, since it wraps their scripts.
 */
import { L, tr } from '../i18n';
import { creature } from '../data/creatures';
import { flag, sayAll, scripts, setFlag } from '../overworld/controller';
import { save } from '../state/game';
import { COCONFUS, coconfusJoins, findCoconfus } from './choices';
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

// the Prof has photographed every Bestiole… except this one
const prevProf = scripts.prof;
scripts.prof = async () => {
  const d = save.value;
  if (d && !flag('ending') && !flag('prof:coconfus') && findCoconfus(d)) {
    await sayAll([
      L('Oh ! Montre-moi cette Bestiole… Clic-cl… Tiens ? C’est bizarre.', 'Oh! Show me that Critter… Click-cl… Huh? That’s odd.'),
      L('Je n’ai jamais pris {n} en photo. Jamais ! Moi qui photographie tous les dessins…', 'I’ve never taken a picture of {n}. Never! And I photograph every drawing…'),
      L('On dirait… qu’il n’est pas fini. Je ne photographie que les dessins finis, tu sais.', 'It looks like… it isn’t finished. I only photograph finished drawings, you know.'),
    ], PROF, { n: tr(creature(COCONFUS).name) });
    setFlag('prof:coconfus');
    return;
  }
  return prevProf?.();
};
