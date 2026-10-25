import { L } from '../i18n';
import { healParty, save, update } from '../state/game';
import { ask, flag, getGame, giveItem, openScreen, say, scripts, setFlag, wait } from '../overworld/controller';
import { NURSE } from './cast';

/** Healing Center (shared by every town). */
scripts.nurse = async () => {
  const first = !flag('visitedCenter');
  const c = await ask(L('Bienvenue au Centre de soin ! Veux-tu que je soigne tes Bestioles ?', 'Welcome to the Healing Center! Shall I heal your Critters?'), [L('Oui', 'Yes'), L('Non', 'No')], NURSE);
  if (c === 0) {
    await say(L('Je m’occupe d’elles. Un petit coup de crayon par-ci, un peu de couleur par-là…', 'I’ll take care of them. A little pencil stroke here, a little colour there…'), NURSE);
    await getGame().fadeTo(0.6, 250, 'white');
    await wait(700);
    await getGame().fadeTo(0, 250);
    update((d) => {
      healParty(d);
      d.respawn = { map: 'centre', x: 5, y: 4, returnTo: d.player.returnTo };
    });
    await say(L('Et voilà ! Tes Bestioles sont en pleine forme. À bientôt !', 'There you go! Your Critters are in top shape. See you soon!'), NURSE);
  }
  if (first) {
    setFlag('visitedCenter');
    await say(L('Le PC dans le coin te permet de ranger tes Bestioles quand tu en as plus de six.', 'The PC in the corner stores your Critters when you have more than six.'), NURSE);
  }
};

/** Prof. Fusain's aide: the Tracing Paper (Exp. Share) once 3 kinds of Bestioles are caught. */
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
