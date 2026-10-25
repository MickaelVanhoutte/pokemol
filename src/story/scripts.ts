import { L, tr } from '../i18n';
import { creature, STARTERS } from '../data/creatures';
import { partyOf, RIVAL_COUNTER } from '../data/trainers';
import { newSeed } from '../engine/rng';
import { healParty, save, update } from '../state/game';
import {
  ask, checkEvolutions, fight, flag, getGame, giveItem, giveMon, openScreen, say, sayAll, scripts, setFlag, showMons,
  showToast, wait, warpTo,
} from '../overworld/controller';

const PROF = L('Prof. Fusain', 'Prof. Charcoal');
const MOM = L('Maman', 'Mom');
const RIVAL = L('Gomme', 'Eraser');
const NURSE = L('Infirmière', 'Nurse');

const name = () => save.value!.player.name;
const hasTeam = () => (save.value?.party.length ?? 0) > 0;

scripts.mom = async () => {
  if (!flag('intro')) {
    await sayAll([
      L('Ah, {name}, te voilà debout !', 'Ah, {name}, you’re up!'),
      L('Le Prof. Fusain est passé ce matin. Il t’attend à son labo, en bas du bourg.', 'Prof. Charcoal dropped by this morning. He’s waiting for you at his lab, down in town.'),
      L('Il paraît qu’il a quelque chose de très spécial pour toi…', 'Apparently he has something very special for you…'),
    ], MOM, { name: name() });
    setFlag('intro');
    return;
  }
  if (!hasTeam()) {
    await say(L('Le labo est tout en bas du bourg, après le grand chemin. File !', 'The lab is at the bottom of town, past the big path. Off you go!'), MOM);
    return;
  }
  await say(L('Tes Bestioles ont l’air fatiguées. Reposez-vous un peu !', 'Your Critters look tired. Have a little rest!'), MOM);
  await getGame().fadeTo(1, 300);
  update((d) => {
    healParty(d);
    d.respawn = { map: 'maison', x: 4, y: 5 };
  });
  await wait(400);
  await getGame().fadeTo(0, 300);
  await say(L('Voilà, tout le monde est en pleine forme ! Bonne aventure, mon trésor.', 'There, everyone is in great shape! Have a good adventure, sweetie.'), MOM);
};

scripts.profStops = async () => {
  if (hasTeam()) return;
  const g = getGame();
  await say(L('Attends ! Ne va pas dans les hautes herbes sans Bestiole !', 'Wait! Don’t go into the tall grass without a Critter!'), PROF);
  await say(L('Viens vite à mon labo, en bas du bourg. Je t’ai préparé une surprise !', 'Come to my lab at the bottom of town. I’ve got a surprise for you!'), PROF);
  await g.walk(g.player, ['down'], 160);
};

scripts.rivalLab = async () => {
  await say(L('Vas-y, choisis en premier. De toute façon, c’est moi qui gagnerai !', 'Go on, pick first. I’m going to win anyway!'), RIVAL);
};

scripts.prof = async () => {
  if (!hasTeam()) {
    await sayAll([
      L('Bonjour {name} ! Bienvenue dans mon labo.', 'Hello {name}! Welcome to my lab.'),
      L('J’étudie les Bestioles : des créatures nées des dessins d’une petite artiste.', 'I study Critters: creatures born from the drawings of a little artist.'),
      L('Sur la table, il y a trois Bestioles. Choisis celle qui te plaît !', 'There are three Critters on the table. Pick the one you like!'),
    ], PROF, { name: name() });
    return;
  }
  if (!save.value!.bag['crayon-ball']) {
    await say(L('Plus de Crayon-balls ? Tiens, en voici 3. Tu en trouveras aussi à la Boutique.', 'Out of Pencil Balls? Here, take 3. The Shop sells them too.'), PROF);
    giveItem('crayon-ball', 3);
    return;
  }
  const tips = [
    L('Affaiblis une Bestiole sauvage avant de lancer une Crayon-ball. Endormie, c’est encore mieux !', 'Weaken a wild Critter before throwing a Pencil Ball. Asleep is even better!'),
    L('Les Bestioles apprennent de nouvelles capacités en montant de niveau.', 'Critters learn new moves as they level up.'),
    L('Le Feu bat la Plante, l’Eau bat le Feu, la Plante bat l’Eau. Les Spectres ne craignent pas les attaques Normales !', 'Fire beats Grass, Water beats Fire, Grass beats Water. Ghosts ignore Normal attacks!'),
    L('Brumouille évolue au niveau 16. Et après… surprise !', 'Mistchief evolves at level 16. And after that… surprise!'),
  ];
  await say(tips[Math.floor(Math.random() * tips.length)], PROF);
};

scripts.labTable = async () => {
  if (hasTeam()) {
    await say(L('Il n’y a plus de Bestiole sur la table.', 'There are no more Critters on the table.'));
    return;
  }
  if (!flag('intro')) setFlag('intro');
  const i = await showMons([...STARTERS], tr(L('Choisis ta première Bestiole !', 'Choose your first Critter!')), true);
  const pick = STARTERS[i];
  giveMon(pick, 5);
  setFlag('rivalStarter', Number(RIVAL_COUNTER[pick]));
  await say(L('{starter} rejoint ton équipe !', '{starter} joined your team!'), undefined, { starter: tr(creature(pick).name) });

  const g = getGame();
  const counter = RIVAL_COUNTER[pick];
  const rival = g.npc('rival');
  if (rival) {
    await g.walk(rival, ['right', 'right'], 200);
    g.face(rival, 'up');
  }
  await sayAll([
    L('Hé ! Moi aussi je veux une Bestiole !', 'Hey! I want a Critter too!'),
    L('Je prends {c}, il est trop mignon ! Allez, on les teste. Je vais t’effacer !', 'I’ll take {c}, it’s so cute! Come on, let’s test them. I’m going to erase you!'),
  ], RIVAL, { c: tr(creature(counter).name) });
  if (rival) g.faceToward(g.player, rival);
  await say(L('Oh oh, un premier combat ! Je vais te guider.', 'Oh ho, a first battle! I’ll guide you.'), PROF);
  const out = await fight('trainer', RIVAL, partyOf([{ species: counter, level: 5 }], newSeed()), { friendly: true, backdrop: 'lab', tutorial: true });
  if (out.result === 'win') await say(L('Quoi ?! Je me suis fait gommer… C’était de la chance !', 'What?! I got erased… That was just luck!'), RIVAL);
  else await say(L('Ha ! Trop facile ! Tu devrais t’entraîner dans les hautes herbes.', 'Ha! Too easy! You should train in the tall grass.'), RIVAL);
  await say(L('Je vais devenir le meilleur dresseur de Bestioles ! Salut !', 'I’ll become the greatest Critter trainer! Bye!'), RIVAL);
  if (rival) {
    await g.walk(rival, ['down', 'down', 'down', 'down'], 170);
    g.remove('rival');
  }
  setFlag('rival1');
  const prof = g.npc('prof');
  if (prof) g.faceToward(prof, g.player);
  await sayAll([
    L('Bravo à vous deux ! Tiens, voici 5 Crayon-balls et 2 Potions.', 'Well done, both of you! Here are 5 Pencil Balls and 2 Potions.'),
    L('Lance une Crayon-ball sur une Bestiole sauvage affaiblie : elle se dessine dedans et rejoint ton équipe !', 'Throw a Pencil Ball at a weakened wild Critter: it draws itself inside and joins your team!'),
    L('Ton Bestiodex note toutes les Bestioles que tu croises. Essaie de le remplir !', 'Your Critterdex records every Critter you meet. Try to fill it up!'),
  ], PROF);
  update((d) => {
    d.bag['crayon-ball'] = (d.bag['crayon-ball'] ?? 0) + 5;
    d.bag.potion = (d.bag.potion ?? 0) + 2;
    d.respawn = { map: 'maison', x: 4, y: 5 };
    d.flags.dex = 1;
  });
  showToast(tr(L('+5 Crayon-balls · +2 Potions', '+5 Pencil Balls · +2 Potions')));
  await say(L('Pars vers le nord, sur le Chemin des Crayons, jusqu’à Ville-Pastel. Bonne aventure, {name} !', 'Head north along Crayon Road to Pastel City. Good luck, {name}!'), PROF, { name: name() });
};

scripts.nurse = async () => {
  const first = !flag('visitedCenter');
  const c = await ask(L('Bienvenue au Centre de soin ! Veux-tu soigner tes Bestioles ?', 'Welcome to the Healing Center! Shall I heal your Critters?'), [L('Oui', 'Yes'), L('Non', 'No')], NURSE);
  if (c === 0) {
    await getGame().fadeTo(0.6, 250);
    await wait(600);
    await getGame().fadeTo(0, 250);
    update((d) => {
      healParty(d);
      d.respawn = { map: 'centre', x: 5, y: 4 };
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

scripts.machine = async () => {
  await openScreen({ id: 'machine' });
  await checkEvolutions();
};

scripts.pc = async () => {
  await say(L('Tu allumes le PC…', 'You switch on the PC…'));
  await openScreen({ id: 'pc' });
};

scripts.gateTour = async () => {
  if (!save.value!.badges.includes('grotte')) {
    await say(L('Une force étrange t’empêche d’entrer… Reviens avec le Badge Gribouillis de la grotte.', 'A strange force keeps you out… Come back with the Scribble Badge from the cave.'));
    return;
  }
  await warpTo({ map: 'tour1', x: 5, y: 10, facing: 'up' });
};

scripts.rivalFinal = async () => {
  await sayAll([
    L('Te voilà enfin ! J’ai entendu dire que tu as vaincu l’Ombre de la Tour…', 'There you are! I heard you beat the Shadow of the Tower…'),
    L('Moi aussi je me suis entraîné, tu sais. Ce coup-ci, je vais vraiment t’effacer !', 'I’ve been training too, you know. This time I’ll really erase you!'),
  ], RIVAL);
  const starter = String(save.value!.flags.rivalStarter ?? 2).padStart(3, '0');
  const out = await fight('trainer', RIVAL, partyOf([
    { species: '007', level: 21 }, { species: '008', level: 22 }, { species: '010', level: 22 }, { species: starter, level: 25 },
  ], newSeed()), { trainer: { id: 'rivalFinal', name: RIVAL, party: [], money: 3000, before: [], after: [] } });
  if (out.result !== 'win') {
    await say(L('Ha ! Va t’entraîner et on remet ça !', 'Ha! Go train and we’ll do this again!'), RIVAL);
    return;
  }
  setFlag('rivalFinal');
  await sayAll([
    L('… J’ai perdu. Tes Bestioles sont vraiment incroyables.', '… I lost. Your Critters are truly amazing.'),
    L('Tu sais quoi ? Ces dessins, ils ont l’air vivants. La petite artiste doit être fière.', 'You know what? These drawings look alive. The little artist must be proud.'),
  ], RIVAL);
  await say(L('Bravo, {name} ! Tu es maintenant Maître des Bestioles. De nouveaux dessins arriveront bientôt…', 'Well done, {name}! You are now a Critter Master. New drawings are coming soon…'), PROF, { name: name() });
  await openScreen({ id: 'credits', fromWorld: true });
};

/** New game: wake up at home. */
scripts.intro = async () => {
  await wait(300);
  await say(L('Quelle belle journée ! On dirait que Maman veut te parler.', 'What a lovely day! Looks like Mom wants to talk to you.'));
};
