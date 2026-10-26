import { L, tr } from '../i18n';
import { item } from '../data/items';
import { MAPS } from '../data/maps';
import { ask, flag, openScreen, say, scripts, setFlag, showToast } from '../overworld/controller';
import { localDay } from '../overworld/berries';
import { addItem, save, update } from '../state/game';
import { prizeTier } from '../ui/logic/memo';
import { sfx } from '../audio/sfx';

// ------------------------------------------------------------------ Mémo-Bestioles (fair tent)

const MEMO = L('Animateur', 'Host');
/** Gold prizes: one of these, picked at random. */
const MEMO_GOLD = ['baie-doree', 'baie-prisme', 'clochette', 'loupe', 'plume-vive'];

scripts.memo = async () => {
  const c = await ask(L('Bienvenue au stand Mémo-Bestioles ! Retourne les cartes deux par deux et retrouve les six paires de dessins. Il y a un prix par jour !', 'Welcome to the Critter Memo stand! Turn the cards over two at a time and find the six pairs of drawings. There’s a prize every day!'),
    [L('Jouer', 'Play'), L('Non merci', 'No thanks')], MEMO);
  if (c !== 0) return;
  let tries: number | null = null;
  await openScreen({ id: 'memo', onEnd: (t) => (tries = t) });
  if (tries === null) {
    await say(L('Dommage ! Reviens quand tu veux.', 'Too bad! Come back any time.'), MEMO);
    return;
  }
  const t: number = tries;
  const tier = prizeTier(t);
  await say(tier === 'gold'
    ? L('{t} essais seulement ? Quelle mémoire !', 'Only {t} tries? What a memory!')
    : tier === 'silver' ? L('{t} essais, bien joué !', '{t} tries, well played!') : L('{t} essais… Tu feras mieux la prochaine fois !', '{t} tries… You’ll do better next time!'), MEMO, { t });
  if (save.value!.flags.memo === localDay()) {
    await say(L('Tu as déjà eu ton prix aujourd’hui. Reviens demain !', 'You already got today’s prize. Come back tomorrow!'), MEMO);
    return;
  }
  const [id, n] = tier === 'gold' ? [MEMO_GOLD[Math.floor(Math.random() * MEMO_GOLD.length)], 1] : tier === 'silver' ? ['super-crayon-ball', 2] : ['potion', 1];
  update((d) => {
    addItem(d, id, n);
    d.flags.memo = localDay();
  });
  sfx.confirm();
  await say(L('Voici ton prix : {i}{n} !', 'Here’s your prize: {i}{n}!'), MEMO, { i: tr(item(id).name), n: n > 1 ? ` ×${n}` : '' });
};

// ------------------------------------------------------------------ the four fresques

/** Every fresque of the region (`fresques` on maps). */
const FRESQUES = Object.values(MAPS).flatMap((m) => (m.fresques ?? []).map((f) => f.id));

/** After a fresque is solved: how many are left, and a reward for completing all of them. */
scripts.fresqueDone = async () => {
  const done = FRESQUES.filter((id) => flag(`fresque:${id}`)).length;
  if (done < FRESQUES.length) {
    showToast(tr(L('Fresques complétées : {n}/{t}', 'Fresques completed: {n}/{t}'), { n: done, t: FRESQUES.length }));
    return;
  }
  if (flag('fresquesReward')) return;
  setFlag('fresquesReward');
  update((d) => {
    addItem(d, 'super-crayon-ball', 10);
    addItem(d, 'baie-prisme', 3);
  });
  sfx.victory();
  await say(L('Les quatre fresques sont complètes ! Un éclat de couleur jaillit et laisse un cadeau : 10 Super Crayon-balls et 3 Baies Prisme !', 'All four fresques are complete! A burst of colour leaves a gift: 10 Great Pencil Balls and 3 Prism Berries!'));
};
