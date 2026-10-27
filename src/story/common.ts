import { L, tr } from '../i18n';
import { healParty, save, update } from '../state/game';
import { shiftTo } from '../state/clock';
import { playJingle } from '../audio/music';
import { sfx } from '../audio/sfx';
import { ask, dayPhase, flag, getGame, giveItem, offerNickname, openScreen, say, sayAll, scripts, setFlag, teachMove, updateTime, wait } from '../overworld/controller';
import { move } from '../data/moves';
import { rememberableMoves } from '../engine/pk/creature';
import { monLabel } from '../data/creatures';
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

/** Inn: Madame Trou-de-Mémoire makes a Bestiole forget a move. */
scripts.oubli = async () => {
  const who = L('Mme Trou-de-Mémoire', 'Mrs Forgetful');
  const party = save.value?.party ?? [];
  if (!party.length) {
    await say(L('Hein ? Qu’est-ce que je disais ? Ah oui : je fais oublier des capacités aux Bestioles.', 'Huh? What was I saying? Ah yes: I make Critters forget moves.'), who);
    return;
  }
  const c = await ask(L('Je fais oublier des capacités. Quelle Bestiole ?', 'I make Critters forget moves. Which one?'), [...party.map((m) => monLabel(m)), L('Aucune', 'None')], who);
  if (c >= party.length) return;
  const m = party[c];
  if (m.moves.length <= 1) {
    await say(L('{n} doit garder au moins une capacité !', '{n} must keep at least one move!'), who, { n: monLabel(m) });
    return;
  }
  const k = await ask(L('Quelle capacité doit-il oublier ?', 'Which move should it forget?'), [...m.moves.map((s) => move(s.id).name), L('Annuler', 'Cancel')], who);
  if (k >= m.moves.length) return;
  const sure = await ask(L('{n} va oublier {m}. C’est sûr ?', '{n} will forget {m}. Are you sure?'), [L('Oui', 'Yes'), L('Non', 'No')], who, { n: monLabel(m), m: tr(move(m.moves[k].id).name) });
  if (sure !== 0) return;
  const gone = tr(move(m.moves[k].id).name);
  update((x) => void x.party[c].moves.splice(k, 1));
  await say(L('Pouf ! {n} a oublié {m}. Hihi, moi aussi je l’ai déjà oublié !', 'Poof! {n} forgot {m}. Hee hee, I’ve forgotten it already too!'), who, { n: monLabel(m), m: gone });
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
