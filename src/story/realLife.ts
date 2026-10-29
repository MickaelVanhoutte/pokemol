/**
 * Days in the real house, after the ending (src/data/realLife.ts): once a real day, the first night at an Inn
 * ends in the real bedroom (`reveilMaison`, run by the Inn's sleep in src/story/common.ts). The player does one
 * thing (draw at the desk, daydream at a window, read a book, tell Mummy and Daddy about the dream), which grows
 * its level, then goes back to bed and wakes up at the Inn in Papeterre. These wrap the real house's scripts
 * (src/story/finale.ts), so this file is imported after it.
 */
import { L, locale, tr } from '../i18n';
import { creature } from '../data/creatures';
import { ORIGINALS, originalUrl } from '../data/originals';
import { ACTIVITY, REAL_MAX, pips, realLevel, type ActivityId } from '../data/realLife';
import { localDay } from '../overworld/berries';
import { ask, dayPhase, flag, getGame, say, sayAll, scripts, showPicture, updateTime, wait, warpTo } from '../overworld/controller';
import { healParty, save, update } from '../state/game';
import { shiftTo } from '../state/clock';
import { playJingle } from '../audio/music';
import { sfx } from '../audio/sfx';

const fmt = (n: number) => n.toLocaleString(locale.value === 'fr' ? 'fr-FR' : 'en-GB');
const visiting = () => !!flag('reel:visite');
const done = () => !!flag('reel:fait');

/** The night at the Inn ends at home: the clock turns as in a night's sleep, then the real bedroom. */
scripts.reveilMaison = async () => {
  const morning = dayPhase() === 'night';
  await getGame().fadeTo(1, 600);
  // saved before the scene: a game closed in the house stays there (`ending` in finale.ts)
  update((d) => {
    d.clockShift = shiftTo(morning ? 8 : 22);
    d.flags.nuits = (d.flags.nuits ?? 0) + 1;
    healParty(d);
    Object.assign(d.flags, { 'reel:jour': localDay(), 'reel:visite': 1, 'reel:fait': 0 });
  });
  await wait(700);
  updateTime();
  await warpTo({ map: 'chambre', x: 2, y: 3, facing: 'left' });
  await sayAll([
    L('… Tu ouvres les yeux. Ce plafond, ces rideaux… Tu es dans ta vraie chambre !', '… You open your eyes. That ceiling, those curtains… You’re in your real bedroom!'),
    L('(Aujourd’hui, tu as le temps pour une seule chose : dessiner au bureau, rêvasser à la fenêtre, lire un livre ou raconter ton rêve à Papa et Maman. Puis retourne te coucher.)',
      '(Today you have time for just one thing: draw at the desk, daydream at the window, read a book or tell Mummy and Daddy about your dream. Then go back to bed.)'),
  ]);
};

/** Back to bed: the dream takes the player back to the Inn where they fell asleep. */
async function backToPapeterre() {
  update((d) => void (d.flags['reel:visite'] = 0));
  await say(L('Le soir venu, tu te glisses sous la couette et tu fermes les yeux…', 'When evening comes, you snuggle under the covers and close your eyes…'));
  await getGame().fadeTo(1, 900, 'white');
  const r = save.value!.respawn;
  save.value!.player.returnTo = r.returnTo;
  await warpTo({ map: r.map, x: r.x, y: r.y, facing: 'down' });
  await say(L('… et te revoilà à Papeterre, dans un lit de l’Auberge. Tes Bestioles t’attendaient !', '… and here you are back in Papeterra, in a bed at the Inn. Your Critters were waiting for you!'));
}

/** One thing in the real house: its level shown first, a short scene, and its level grows (once a day). */
async function activity(id: ActivityId) {
  const a = ACTIVITY[id];
  const lv = realLevel(save.value!.flags, id);
  if (lv >= REAL_MAX) {
    await say(a.maxed);
    return;
  }
  // its level now, and what the next one gives
  const c = await ask(L('{q} {n} {pips} → {e}.', '{q} {n} {pips} → {e}.'), [L('Oui', 'Yes'), L('Non', 'No')], undefined,
    { q: tr(a.ask), n: tr(a.name), pips: pips(lv), e: tr(a.effect, { p: fmt(a.amount(lv + 1)) }) });
  if (c !== 0) return;
  update((d) => {
    d.flags[`reel:${id}`] = lv + 1;
    d.flags['reel:fait'] = 1;
  });
  await sayAll(a.scene);
  // the drawing of the day: one of hers
  if (id === 'dessin') {
    const sp = creature(ORIGINALS[Math.floor(Math.random() * ORIGINALS.length)]);
    await showPicture(originalUrl(sp), tr(L('Ton dessin du jour : {n}', 'Your drawing of the day: {n}'), { n: tr(sp.name) }));
  }
  playJingle('item', { fallback: sfx.confirm });
  await say(L('{n} {pips} ! Dans Papeterre : {e}.', '{n} {pips}! In Papeterra: {e}.'), undefined,
    { n: tr(a.name), pips: pips(lv + 1), e: tr(a.effect, { p: fmt(a.amount(lv + 1)) }) });
  await say(L('(Ça suffit pour aujourd’hui. Retourne te coucher pour retrouver Papeterre.)', '(That’s enough for today. Go back to bed to return to Papeterra.)'));
}

/** While visiting, a spot of the house offers its activity (or says the day's one is done). */
function during(script: string, id: ActivityId) {
  const prev = scripts[script];
  scripts[script] = async () => {
    if (!visiting()) return prev?.();
    if (!done()) return activity(id);
    await prev?.();
    await say(L('(Tu as déjà fait quelque chose aujourd’hui. Retourne te coucher pour retrouver Papeterre.)', '(You’ve already done something today. Go back to bed to return to Papeterra.)'));
  };
}
during('desk', 'dessin');
during('fenetre', 'fenetre');
during('livresReel', 'livre');
during('papa', 'parents');
during('mamanReelle', 'parents');

const prevBed = scripts.litReel;
scripts.litReel = async () => {
  if (!visiting()) return prevBed();
  const c = await ask(done()
    ? L('Ton lit. Te recoucher et retrouver Papeterre ?', 'Your bed. Go back to sleep and return to Papeterra?')
    : L('Ton lit. Tu n’as encore rien fait aujourd’hui… Te recoucher quand même ?', 'Your bed. You haven’t done anything yet today… Go back to sleep anyway?'),
  [L('Oui', 'Yes'), L('Non', 'No')]);
  if (c !== 0) return;
  await backToPapeterre();
};
