import { L, locale, tr, type LText } from '../i18n';
import { healParty, save, update } from '../state/game';
import { shiftTo } from '../state/clock';
import { playJingle } from '../audio/music';
import { sfx } from '../audio/sfx';
import { ask, dayPhase, flag, getGame, giveItem, offerNickname, openScreen, say, sayAll, scripts, setFlag, teachMove, updateTime, wait } from '../overworld/controller';
import { move } from '../data/moves';
import { STAT_KEYS, addEvs, maxHp, rememberableMoves } from '../engine/pk/creature';
import { ivGrade } from '../engine/pk/judge';
import { NATURES, nature, type BattleStat } from '../data/natures';
import { STAT_NAMES } from '../data/types';
import { talent, type TalentSlot } from '../data/talents';
import { creature, monLabel } from '../data/creatures';
import { INNKEEPER } from './cast';

/** You wake up here after a blackout, and the Ariadne Thread leads back here. */
const innRespawn = () => update((d) => void (d.respawn = { map: 'centre', x: 5, y: 4, returnTo: d.player.returnTo }));

/**
 * Sleeps until night (from day or evening) or until the morning (at night), healing the party:
 * the bed at home and the Inn's beds. Night and day Bestioles come out without waiting for the real clock.
 */
export async function sleepUntil(morning: boolean) {
  const g = getGame();
  await g.fadeTo(1, 600);
  update((d) => {
    d.clockShift = shiftTo(morning ? 8 : 22);
    // nights slept: a legendary knocked out comes back after one (src/story/legends.ts)
    d.flags.nuits = (d.flags.nuits ?? 0) + 1;
    healParty(d);
  });
  await wait(900);
  updateTime();
  await g.fadeTo(0, 600);
  await say(morning
    ? L('Bonjour ! Le soleil se lève sur Papeterre. Tes Bestioles sont en pleine forme.', 'Good morning! The sun is rising over Papeterra. Your Critters are in top shape.')
    : L('Bonsoir ! La nuit est tombée sur Papeterre… Certaines Bestioles ne sortent qu’à cette heure-ci.', 'Good evening! Night has fallen over Papeterra… Some Critters only come out at this time.'));
}

/** The Inn (shared by every town): a quick rest heals the party, a night's sleep also turns the clock. */
scripts.auberge = async () => {
  const first = !flag('visitedCenter');
  const morning = dayPhase() === 'night';
  const c = await ask(L('Bienvenue à l’Auberge ! Une petite pause, ou un bon gros dodo ?', 'Welcome to the Inn! A little rest, or a good long sleep?'),
    [L('Se reposer', 'Rest'), morning ? L('Dormir jusqu’au matin', 'Sleep till morning') : L('Dormir jusqu’à la nuit', 'Sleep till night'), L('Non merci', 'No thanks')], INNKEEPER);
  if (c === 0) {
    await say(L('Un bon chocolat chaud, une couverture toute douce… Repose-toi un peu.', 'A nice hot chocolate, a soft blanket… Have a little rest.'), INNKEEPER);
    await getGame().fadeTo(0.6, 250, 'white');
    playJingle('heal', { fallback: sfx.heal });
    await wait(700);
    await getGame().fadeTo(0, 250);
    update((d) => healParty(d));
    innRespawn();
    await say(L('Et voilà ! Tes Bestioles sont en pleine forme. À bientôt !', 'There you go! Your Critters are in top shape. See you soon!'), INNKEEPER);
  } else if (c === 1) {
    await say(morning
      ? L('Ta chambre est prête. Je te réveille au lever du soleil !', 'Your room is ready. I’ll wake you at sunrise!')
      : L('Ta chambre est prête. Je te réveille à la nuit tombée !', 'Your room is ready. I’ll wake you at nightfall!'), INNKEEPER);
    innRespawn();
    await sleepUntil(morning);
  }
  if (first) {
    setFlag('visitedCenter');
    await sayAll([
      L('Le PC dans le coin te permet de ranger tes Bestioles quand tu en as plus de six.', 'The PC in the corner stores your Critters when you have more than six.'),
      L('Et nos lits sont ouverts à tous : on s’y endort le jour, on se réveille la nuit… ou l’inverse !', 'And our beds are open to all: fall asleep in the day, wake up at night… or the other way round!'),
    ], INNKEEPER);
  }
};

/** The Inn's beds: the same sleep as the innkeeper's, without the talk. */
scripts.innBed = async () => {
  const morning = dayPhase() === 'night';
  const c = await ask(morning
    ? L('Un lit douillet qui sent la lavande. Dormir jusqu’au matin ?', 'A cosy bed that smells of lavender. Sleep till morning?')
    : L('Un lit douillet qui sent la lavande. Dormir jusqu’à la nuit ?', 'A cosy bed that smells of lavender. Sleep till night?'),
  [L('Oui', 'Yes'), L('Non', 'No')]);
  if (c !== 0) return;
  innRespawn();
  await sleepUntil(morning);
};

/** Prof. Fusain's aide: the Tracing Paper (shares XP) once 3 kinds of Bestioles are caught. */
scripts.calqueAide = async () => {
  const AIDE = L('Assistant du Prof.', 'Prof’s Aide');
  const n = save.value!.dex.caught.length;
  if (n < 3) {
    await say(L('Je travaille avec le Prof. Fusain. Attrape au moins 3 sortes de Bestioles, et j’aurai un cadeau pour toi ! (Tu en as {n}.)', 'I work with Prof. Fusain. Catch at least 3 kinds of Critters and I’ll have a present for you! (You have {n}.)'), AIDE, { n });
    return;
  }
  await say(L('Déjà {n} sortes de Bestioles ! Le Prof. m’a confié ceci pour toi.', '{n} kinds of Critters already! The Prof. asked me to give you this.'), AIDE, { n });
  giveItem('papier-calque');
  setFlag('gift:calque');
  await say(L('{name} reçoit le Papier Calque !', '{name} received the Tracing Paper!'));
  await say(L('Fais-le tenir à une Bestiole (menu BESTIOLES, OBJET) : elle gagnera la moitié de l’expérience de chaque combat, même sans se battre !', 'Have a Critter hold it (CRITTERS menu, ITEM): it gets half the experience of every battle, even without fighting!'), AIDE);
};

/** Inn: the Calligraphe writes (or rubs out) nicknames. */
scripts.calligraphe = async () => {
  const who = L('Calligraphe', 'Calligrapher');
  const party = save.value?.party ?? [];
  if (!party.length) {
    await say(L('Je calligraphie les surnoms des Bestioles. Reviens avec une Bestiole !', 'I write Critters’ nicknames in my best handwriting. Come back with a Critter!'), who);
    return;
  }
  const c = await ask(L('Je calligraphie les surnoms des Bestioles. Laquelle veux-tu renommer ?', 'I write Critters’ nicknames in my best handwriting. Which one should I rename?'),
    [...party.map((m) => monLabel(m)), L('Aucune', 'None')], who);
  if (c >= party.length) return;
  // a traded Bestiole keeps the name its first trainer gave it
  if (party[c].ot) {
    await say(L('{n} vient de {o}. Son surnom est un cadeau de son premier dresseur : je ne peux pas le changer.', '{n} comes from {o}. Its nickname is a gift from its first trainer: I can’t change it.'), who, { n: monLabel(party[c]), o: party[c].ot! });
    return;
  }
  await offerNickname(party[c].uid, false);
  await say(L('Et voilà, écrit avec mes plus belles lettres !', 'There, written in my finest letters!'), who);
};

/** Inn: the Move Rememberer teaches back level-up moves a Bestiole forgot or skipped. */
scripts.souvenirs = async () => {
  const who = L('Mémoire des Pochoirs', 'Move Rememberer');
  const party = save.value?.party ?? [];
  if (!party.length) {
    await say(L('Je me souviens de toutes les capacités oubliées… mais il te faut une Bestiole !', 'I remember every forgotten move… but you need a Critter!'), who);
    return;
  }
  const c = await ask(L('Je me souviens de toutes les capacités oubliées. Pour quelle Bestiole ?', 'I remember every forgotten move. For which Critter?'),
    [...party.map((m) => monLabel(m)), L('Aucune', 'None')], who);
  if (c >= party.length) return;
  const m = party[c];
  // newest first, at most six so the list fits on a phone
  const moves = rememberableMoves(m).slice(0, 6);
  if (!moves.length) {
    await say(L('{n} n’a rien oublié du tout !', '{n} hasn’t forgotten anything at all!'), who, { n: monLabel(m) });
    return;
  }
  const k = await ask(L('Quelle capacité rappeler à {n} ?', 'Which move should {n} remember?'), [...moves.map((id) => move(id).name), L('Annuler', 'Cancel')], who, { n: monLabel(m) });
  if (k >= moves.length) return;
  await teachMove(c, moves[k]);
};

/** Asks which Bestiole of the party (eggs left out); its party index, or -1. */
async function pickMon(question: LText, who: LText, vars?: Record<string, string | number>): Promise<number> {
  const party = save.value?.party ?? [];
  const ids = party.flatMap((m, i) => (m.egg ? [] : [i]));
  if (!ids.length) {
    await say(L('Reviens me voir avec une Bestiole !', 'Come back with a Critter!'), who);
    return -1;
  }
  const c = await ask(question, [...ids.map((i) => monLabel(party[i])), L('Aucune', 'None')], who, vars);
  return c < ids.length ? ids[c] : -1;
}

/** Asks to pay `price` for a service; false when the player says no or can't afford it. */
async function pay(question: LText, price: number, who: LText, vars: Record<string, string | number>): Promise<boolean> {
  if ((await ask(question, [L('Oui', 'Yes'), L('Non', 'No')], who, { ...vars, p: price })) !== 0) return false;
  if (save.value!.money < price) {
    await say(L('Oh… Il te manque des sous. Reviens quand tu auras {p} ₽ !', 'Oh… You’re short of money. Come back when you have ₽{p}!'), who, { p: price });
    return false;
  }
  update((x) => void (x.money -= price));
  sfx.coin();
  return true;
}

const BATTLE_STATS: BattleStat[] = ['atk', 'def', 'spa', 'spd', 'spe'];
/** The best born quality (IV): grade S. */
const MAX_IV = 31;
/** « fonceuse » / "Headstrong": a nature's name inside a sentence. */
const natureWord = (id: string) => (locale.value === 'fr' ? tr(nature(id).name).toLowerCase() : tr(nature(id).name));

/** Inn of Ville-Feutre: Coach Effort explains effort points, shows them, and rubs out one stat's (or all) for free. */
scripts.coachEffort = async () => {
  const who = L('Coach Effort', 'Coach Effort');
  await sayAll([
    L('Chaque Bestiole battue laisse des points d’effort à celles qui ont combattu. Quatre points d’effort, et la stat grandit d’un point au niveau 100 !', 'Every Critter beaten leaves effort points to the ones that fought. Four effort points, and the stat grows by one point at level 100!'),
    L('255 au plus par stat, 510 en tout. Tu les vois dans le résumé, page STATS. Les Biscuits en ajoutent, les Gommes en effacent : la Boutique en vend dès 3 badges.', 'At most 255 per stat, 510 in all. You can see them in the summary, STATS page. Biscuits add some, Erasers rub them out: shops sell them from 3 badges on.'),
  ], who);
  const i = await pickMon(L('Je te montre les efforts de quelle Bestiole ?', 'Whose effort shall I show you?'), who);
  if (i < 0) return;
  const m = save.value!.party[i];
  const total = STAT_KEYS.reduce((n, k) => n + m.evs[k], 0);
  await say(`${STAT_KEYS.map((k) => `${tr(STAT_NAMES[k])} ${m.evs[k]}`).join(' · ')} — ${total}/510`, who);
  if (!total) {
    await say(L('{n} n’a encore aucun effort. Au boulot !', '{n} has no effort yet. Get to work!'), who, { n: monLabel(m) });
    return;
  }
  // one stat at a time, or all of them at once
  const stats = STAT_KEYS.filter((k) => m.evs[k] > 0);
  const all = stats.length > 1;
  const c = await ask(L('J’en efface lesquels ? C’est gratuit.', 'Which ones shall I rub out? It’s free.'),
    [...stats.map((k) => `${tr(STAT_NAMES[k])} (${m.evs[k]})`), ...(all ? [L('Tous', 'All of them')] : []), L('Aucun', 'None')], who);
  if (c > stats.length || (c === stats.length && !all)) return;
  const wipe = c < stats.length ? [stats[c]] : stats;
  update((x) => {
    for (const k of wipe) addEvs(x.party[i], k, -x.party[i].evs[k]);
  });
  if (c < stats.length) await say(L('Et hop ! {n} n’a plus d’efforts en {s}.', 'There! {n} has no {s} effort any more.'), who, { n: monLabel(m), s: tr(STAT_NAMES[stats[c]]) });
  else await say(L('Et hop, tout propre ! {n} peut reprendre l’entraînement.', 'There, all clean! {n} can start training again.'), who, { n: monLabel(m) });
};

/** Inn of Village-Braise: the Mood Teller changes a Bestiole's nature (the stat it raises and the one it lowers). */
scripts.humeurs = async () => {
  const who = L('Diseuse d’Humeurs', 'Mood Teller');
  const PRICE = 2000;
  const i = await pickMon(L('Je lis l’humeur des Bestioles… et je peux la changer, pour {p} ₽. Laquelle ?', 'I read Critters’ moods… and I can change them, for ₽{p}. Which one?'), who, { p: PRICE });
  if (i < 0) return;
  const m = save.value!.party[i];
  await say(L('{n} a la nature {h}.', '{n} has a {h} nature.'), who, { n: monLabel(m), h: natureWord(m.nature) });
  const up = await ask(L('Quelle qualité doit grandir ?', 'Which quality should grow?'),
    [...BATTLE_STATS.map((k) => STAT_NAMES[k]), L('Aucune : équilibrée', 'None: balanced'), L('Annuler', 'Cancel')], who);
  if (up > BATTLE_STATS.length) return;
  let id: string;
  if (up === BATTLE_STATS.length) {
    // a balanced nature raises and lowers nothing: keep the one it has if it is balanced already
    id = nature(m.nature).up ? NATURES.find((n) => !n.up)!.id : m.nature;
  } else {
    const downs = BATTLE_STATS.filter((k) => k !== BATTLE_STATS[up]);
    const dn = await ask(L('Et laquelle doit rapetisser ?', 'And which should shrink?'), [...downs.map((k) => STAT_NAMES[k]), L('Annuler', 'Cancel')], who);
    if (dn >= downs.length) return;
    id = NATURES.find((n) => n.up === BATTLE_STATS[up] && n.down === downs[dn])!.id;
  }
  if (id === m.nature) {
    await say(L('Mais… c’est déjà son humeur !', 'But… that’s its mood already!'), who);
    return;
  }
  if (!(await pay(L('{n} aura la nature {h}, pour {p} ₽. D’accord ?', '{n} will have a {h} nature, for ₽{p}. All right?'), PRICE, who, { n: monLabel(m), h: natureWord(id) }))) return;
  update((x) => void (x.party[i].nature = id));
  await say(L('Abracadabra… {n} a maintenant la nature {h} !', 'Abracadabra… {n} now has a {h} nature!'), who, { n: monLabel(m), h: natureWord(id) });
};

/** Inn of Bourg-Paillette: the Star Polisher raises one born quality (IV) to the top, S. */
scripts.polisseuse = async () => {
  const who = L('Polisseuse d’Étoiles', 'Star Polisher');
  const PRICE = 3000;
  const i = await pickMon(L('Je fais briller les qualités de naissance jusqu’à la lettre S, pour {p} ₽ la qualité. Pour quelle Bestiole ?', 'I polish born qualities up to the letter S, for ₽{p} a quality. For which Critter?'), who, { p: PRICE });
  if (i < 0) return;
  const m = save.value!.party[i];
  const k = await ask(L('Quelle qualité faire briller ?', 'Which quality shall I polish?'),
    [...STAT_KEYS.map((s) => `${tr(STAT_NAMES[s])} : ${ivGrade(m.ivs[s])}`), L('Annuler', 'Cancel')], who);
  if (k >= STAT_KEYS.length) return;
  const stat = STAT_KEYS[k];
  if (m.ivs[stat] >= MAX_IV) {
    await say(L('Celle-là brille déjà de mille feux !', 'That one already shines like a star!'), who);
    return;
  }
  if (!(await pay(L('Polir {s} de {n} jusqu’à S, pour {p} ₽ ?', 'Polish {n}’s {s} up to S, for ₽{p}?'), PRICE, who, { n: monLabel(m), s: tr(STAT_NAMES[stat]) }))) return;
  update((x) => {
    const mon = x.party[i], before = maxHp(mon);
    mon.ivs[stat] = MAX_IV;
    if (mon.hp > 0) mon.hp += maxHp(mon) - before;
  });
  await say(L('Frotti, frotta… Et voilà : {s} brille comme une étoile !', 'Rub-a-dub… There: {s} shines like a star!'), who, { s: tr(STAT_NAMES[stat]) });
};

/** Inn of Jardin-Gouache: the Talent Gardener changes a Bestiole's talent, the hidden one included. */
scripts.talents = async () => {
  const who = L('Jardinier des Talents', 'Talent Gardener');
  const PRICE = 3000, HIDDEN = 8000;
  const i = await pickMon(L('Je fais pousser les talents des Bestioles : {p} ₽, ou {h} ₽ pour un talent caché. Laquelle ?', 'I grow Critters’ talents: ₽{p}, or ₽{h} for a hidden talent. Which one?'), who, { p: PRICE, h: HIDDEN });
  if (i < 0) return;
  const m = save.value!.party[i];
  const sp = creature(m.species);
  const slots: [TalentSlot, string][] = [...sp.talents.map((t, s): [TalentSlot, string] => [s as TalentSlot, t]), [2, sp.hiddenTalent]];
  // a species with one regular talent reads slot 1 as slot 0 (`talentOf`)
  const mine: TalentSlot = m.talent === 2 ? 2 : sp.talents[m.talent] ? m.talent : 0;
  const c = await ask(L('Quel talent pour {n} ?', 'Which talent for {n}?'), [
    ...slots.map(([s, t]) => `${tr(talent(t).name)}${s === 2 ? ' ✦' : ''}${s === mine ? tr(L(' (le sien)', ' (current)')) : ''}`),
    L('Annuler', 'Cancel'),
  ], who, { n: monLabel(m) });
  if (c >= slots.length) return;
  const [slot, id] = slots[c];
  if (slot === mine) {
    await say(L('C’est déjà son talent !', 'That’s its talent already!'), who);
    return;
  }
  await say(`${tr(talent(id).name)}${locale.value === 'fr' ? '\u00a0: ' : ': '}${tr(talent(id).desc)}`, who);
  if (!(await pay(L('{n} aura le talent {t}, pour {p} ₽. D’accord ?', '{n} will get the {t} talent, for ₽{p}. All right?'), slot === 2 ? HIDDEN : PRICE, who, { n: monLabel(m), t: tr(talent(id).name) }))) return;
  update((x) => void (x.party[i].talent = slot));
  await say(L('Un peu d’eau, un peu de soleil… {n} a maintenant le talent {t} !', 'A little water, a little sun… {n} now has the {t} talent!'), who, { n: monLabel(m), t: tr(talent(id).name) });
};

scripts.clerk = async () => {
  await say(L('Bienvenue à la Boutique ! Qu’est-ce qui te ferait plaisir ?', 'Welcome to the Shop! What can I get you?'), L('Vendeur', 'Clerk'));
  await openScreen({ id: 'shop' });
};

scripts.pc = async () => {
  await say(L('Tu allumes le PC…', 'You switch on the PC…'));
  await openScreen({ id: 'pc' });
};

/** A torn page of the sketchbook was found (12 memories of the real world, side quest). */
scripts.pageFound = async () => {
  const n = Object.keys(save.value!.bag).filter((k) => k.startsWith('page-') && save.value!.bag[k] > 0).length;
  await say(L('Une page arrachée d’un cahier de dessin… Elle te dit quelque chose. ({n}/12)', 'A page torn from a sketchbook… It feels familiar. ({n}/12)'), undefined, { n });
  if (n === 1) await say(L('Tu peux la lire dans ton Sac, poche OBJETS RARES.', 'You can read it in your Bag, KEY ITEMS pocket.'));
};
