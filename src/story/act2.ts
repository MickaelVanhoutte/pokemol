import { L, tr } from '../i18n';
import { save, takeItem, update } from '../state/game';
import {
  ask, bubble, flag, flash, getGame, openScreen, say, sayAll, scripts, setFlag, showToast, warpTo,
} from '../overworld/controller';
import { GRUNT } from './cast';

const KEEPER = L('Monsieur Tombola', 'Mr. Raffle');
const ZELIE = L('Zélie', 'Zelie');

/** Marine repaints Featherby's bridge: Watercolour Way becomes a shortcut. */
scripts.marineAfter = async () => {
  await flash('white', 200);
  showToast(tr(L('Le pont de Village-Plume est redessiné !', 'Featherby’s bridge has been redrawn!')));
};

// ------------------------------------------------------------------ the fair (side quest)

scripts.tombolaKeeper = async () => {
  if (flag('a2.tombola')) {
    await say(L('Un ticket, une Bestiole surprise ! Les plus rares sortent moins souvent. Essaie la machine !', 'One ticket, one surprise Critter! Rare ones come out less often. Try the machine!'), KEEPER);
    return;
  }
  if (!save.value!.bag['ticket-or']) {
    await sayAll([
      L('Bouhouhou… La tombola est fermée. J’ai perdu mon Ticket d’or !', 'Boo-hoo… The fair is closed. I lost my Golden Ticket!'),
      L('Sans lui, la machine ne veut plus tourner. Je l’ai sûrement fait tomber sur la route du nord…', 'Without it, the machine won’t turn. I must have dropped it on the north road…'),
    ], KEEPER);
    return;
  }
  const c = await ask(L('Mon Ticket d’or ! Tu l’as retrouvé ! Tu veux bien me le rendre ?', 'My Golden Ticket! You found it! Will you give it back?'), [L('Oui', 'Yes'), L('Non', 'No')], KEEPER);
  if (c !== 0) {
    await say(L('Oh… D’accord… Bouhouhou…', 'Oh… All right… Boo-hoo…'), KEEPER);
    return;
  }
  update((d) => void takeItem(d, 'ticket-or'));
  setFlag('a2.tombola');
  await flash('white', 160);
  await sayAll([
    L('Merci, merci ! La tombola est ouverte !', 'Thank you, thank you! The fair is open!'),
    L('Pour quelques pièces, la machine dessine une Bestiole surprise rien que pour toi.', 'For a few coins, the machine draws a surprise Critter just for you.'),
  ], KEEPER);
};

scripts.tombolaMachine = async () => {
  if (!flag('a2.tombola')) {
    await say(L('Une machine pleine de crayons et de paillettes. Elle est arrêtée.', 'A machine full of pencils and glitter. It’s switched off.'));
    return;
  }
  await openScreen({ id: 'machine' });
};

// ------------------------------------------------------------------ Ville-Feutre

scripts.fluoDoor = async () => {
  if (!flag('a2.feutre')) {
    await say(L('La porte de l’Atelier est toute grise et collante… Une affiche dit : « Fermé. Zélie a disparu. »', 'The Atelier door is all grey and sticky… A sign says: “Closed. Zelie has vanished.”'));
    const g = getGame();
    await g.walk(g.player, ['down'], 160);
    return;
  }
  await warpTo({ map: 'atelierFluo', x: 5, y: 10, facing: 'up' });
};

scripts.feutreMan = async () => {
  if (flag('a2.feutre')) {
    await say(L('Les couleurs sont revenues ! Regarde ces néons, ces affiches… Merci !', 'The colours are back! Look at the neon signs, the posters… Thank you!'), L('Habitant', 'Local'));
    return;
  }
  await sayAll([
    L('Hier soir, des gens en gris ont aspiré toutes les couleurs de la ville avec un aspirateur-gomme géant.', 'Last night, people in grey sucked every colour out of the city with a giant eraser-vacuum.'),
    L('Ils les ont emportées dans leur entrepôt, à l’ouest. Et Zélie, notre Maître d’Atelier, a disparu…', 'They took them to their warehouse, to the west. And Zelie, our Atelier Master, has vanished…'),
  ], L('Habitant', 'Local'));
};

scripts.feutreKid = async () => {
  if (flag('a2.feutre')) await say(L('Mon feutre fluo marche de nouveau ! Rose, jaune, vert… Tout brille !', 'My neon marker works again! Pink, yellow, green… Everything glows!'));
  else await say(L('Mes feutres ne dessinent plus que du gris… C’est trop nul.', 'My markers only draw grey now… That’s so lame.'));
};

/** After Admin Rature: the colours fly back to Ville-Feutre and Zélie is free. */
scripts.feutreRestore = async () => {
  const g = getGame();
  await bubble('rature', '…', 700);
  await say(L('Le Grand Effaceur entendra parler de toi… On se reverra !', 'The Great Eraser will hear about you… We’ll meet again!'), L('Admin Rature', 'Admin Smudge'));
  const r = g.npc('rature');
  if (r) {
    await g.walk(r, ['left', 'left', 'up'], 120);
    g.remove('rature');
  }
  await say(L('(Les Sbires s’enfuient derrière leur chef.)', '(The grunts run off after their boss.)'), GRUNT);
  await flash('white', 300);
  showToast(tr(L('Ville-Feutre retrouve ses couleurs !', 'Felt City gets its colours back!')));
  await sayAll([
    L('Tu m’as libérée ! Et regarde : toutes les couleurs s’envolent vers la ville !', 'You freed me! And look: all the colours are flying back to the city!'),
    L('Je file rouvrir mon Atelier. Viens m’y défier quand tu veux, je te dois bien ça !', 'I’m off to reopen my Atelier. Come and challenge me whenever you like, I owe you that!'),
  ], ZELIE);
};

// ------------------------------------------------------------------ Village-Braise (end of act 2)

scripts.braiseNorth = async () => {
  const g = getGame();
  await say(L('Un panneau : « Route des Paillettes — fermée pour cause de gribouillage géant. Réouverture bientôt ! »', 'A sign: “Glitter Road — closed due to giant scribbling. Reopening soon!”'));
  await say(L('(La suite de l’aventure arrive bientôt !)', '(The rest of the adventure is coming soon!)'));
  await g.walk(g.player, ['down'], 160);
};
