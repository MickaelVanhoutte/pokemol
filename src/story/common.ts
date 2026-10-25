import { L } from '../i18n';
import { healParty, update } from '../state/game';
import { ask, flag, getGame, openScreen, say, scripts, setFlag, wait } from '../overworld/controller';
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

scripts.clerk = async () => {
  await say(L('Bienvenue à la Boutique ! Qu’est-ce qui te ferait plaisir ?', 'Welcome to the Shop! What can I get you?'), L('Vendeur', 'Clerk'));
  await openScreen({ id: 'shop' });
};

scripts.pc = async () => {
  await say(L('Tu allumes le PC…', 'You switch on the PC…'));
  await openScreen({ id: 'pc' });
};

/** A torn page of a sketchbook was found (the dream's memories: side quest of the next acts). */
scripts.pageFound = async () => {
  await say(L('C’est une page arrachée d’un cahier de dessin… Elle te dit quelque chose.', 'It’s a page torn from a sketchbook… It feels familiar.'));
};
