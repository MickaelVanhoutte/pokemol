import { L, tr } from '../i18n';
import { creature, STARTERS } from '../data/creatures';
import { RIVAL_COUNTER } from '../data/trainers';
import { DUNGEONS } from '../data/dungeons';
import { giveStarterKit, healTeam, save, update } from '../state/game';
import {
  ask, checkEvolutions, fight, flag, getGame, giveCreature, openScreen, say, sayAll, scripts, setFlag, showCards, showToast, wait,
} from '../overworld/controller';
import { startRun } from '../state/dungeon';

const PROF = L('Prof. Fusain', 'Prof. Charcoal');
const MOM = L('Maman', 'Mom');
const RIVAL = L('Gomme', 'Eraser');
const NURSE = L('Infirmière', 'Nurse');

const name = () => save.value!.player.name;
const hasTeam = () => (save.value?.team.length ?? 0) > 0;

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
    healTeam(d);
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
      L('Sur la table, il y a trois cartes. Choisis celle qui te plaît !', 'There are three cards on the table. Pick the one you like!'),
    ], PROF, { name: name() });
    return;
  }
  const d = save.value!;
  if (d.items.blank === 0) {
    await say(L('Tu n’as plus de Cartes vierges ? Tiens, en voici 3.', 'Out of Blank Cards? Here, take 3.'), PROF);
    update((x) => (x.items.blank += 3));
    return;
  }
  const tips = [
    L('Les Cartes vierges capturent mieux une Bestiole affaiblie ou endormie.', 'Blank Cards work better on a weakened or sleeping Critter.'),
    L('Change ton équipe et ton deck au PC du Centre de soin, à Ville-Pastel.', 'Change your team and deck at the PC in the Pastel City Healing Center.'),
    L('La Grotte Gribouillis change à chaque visite. Ce qu’on y gagne se garde !', 'Scribble Cave changes every visit. What you win there, you keep!'),
    L('Quand une Bestiole atteint un certain niveau, elle peut évoluer. Brumouille, par exemple…', 'When a Critter reaches a certain level, it can evolve. Mistchief, for example…'),
  ];
  await say(tips[Math.floor(Math.random() * tips.length)], PROF);
};

scripts.labTable = async () => {
  if (hasTeam()) {
    await say(L('Il n’y a plus de cartes sur la table.', 'There are no more cards on the table.'));
    return;
  }
  if (!flag('intro')) setFlag('intro');
  let pick = '';
  while (!pick) {
    const i = await showCards([...STARTERS], tr(L('Choisis ta première Bestiole !', 'Choose your first Critter!')));
    const c = creature(STARTERS[i]);
    const ok = await ask(L('Tu choisis {name}, la Bestiole {type} ?', 'You choose {name}, the {type} Critter?'), [L('Oui', 'Yes'), L('Non', 'No')], undefined, {
      name: tr(c.name), type: tr({ plante: L('Plante', 'Grass'), feu: L('Feu', 'Fire'), eau: L('Eau', 'Water') }[c.type as 'plante' | 'feu' | 'eau']),
    });
    if (ok === 0) pick = c.id;
  }
  giveCreature(pick, 5);
  update((d) => giveStarterKit(d));
  await say(L('{starter} rejoint ton équipe !', '{starter} joins your team!'), undefined, { starter: tr(creature(pick).name) });

  const g = getGame();
  const counter = RIVAL_COUNTER[pick];
  const rival = g.npc('rival');
  if (rival) {
    await g.walk(rival, ['right', 'right'], 200);
    g.face(rival, 'up');
  }
  await sayAll([
    L('Hé ! Moi aussi je veux une carte !', 'Hey! I want a card too!'),
    L('Je prends {c}, il est trop mignon ! Allez, on teste nos Bestioles. Je vais t’effacer !', 'I’ll take {c}, it’s so cute! Come on, let’s test our Critters. I’m going to erase you!'),
  ], RIVAL, { c: tr(creature(counter).name) });
  if (rival) g.faceToward(g.player, rival);
  await sayAll([
    L('Oh oh, un premier combat ! Petit rappel :', 'Oh ho, a first battle! Quick reminder:'),
    L('À chaque tour, tu pioches une carte et tu donnes 1 énergie ⚡ à une de tes Bestioles.', 'Each turn you draw a card and give 1 energy ⚡ to one of your Critters.'),
    L('Joue tes cartes Fourniture si tu veux, puis attaque ! Chaque attaque coûte de l’énergie.', 'Play Supply cards if you like, then attack! Each attack costs energy.'),
    L('Quand toutes les Bestioles d’un camp sont K.O., le combat est terminé. Amusez-vous bien !', 'When all of one side’s Critters are knocked out, the battle is over. Have fun!'),
  ], PROF);
  const out = await fight(
    { kind: 'trainer', enemy: { name: RIVAL, team: [{ defId: counter, level: 4 }], deck: ['potion', 'pile', 'pile', 'pile', 'crayon', 'gomme', 'taille-crayon', 'bouclier'], isAI: true } },
    { friendly: true, backdrop: 'lab' },
  );
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
    L('Bravo à vous deux ! Voici ton premier deck de Fournitures : 10 cartes pour t’aider en combat.', 'Well done, both of you! Here’s your first Supply deck: 10 cards to help you in battle.'),
    L('Et voici 5 Cartes vierges ! Lance-les sur une Bestiole sauvage affaiblie pour la dessiner dessus.', 'And here are 5 Blank Cards! Throw one at a weakened wild Critter to draw it onto the card.'),
  ], PROF);
  update((d) => {
    d.items.blank += 5;
    d.respawn = { map: 'maison', x: 4, y: 5 };
  });
  showToast(tr(L('+5 Cartes vierges', '+5 Blank Cards')));
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
      healTeam(d);
      d.respawn = { map: 'centre', x: 5, y: 4 };
    });
    await say(L('Et voilà ! Tes Bestioles sont en pleine forme. À bientôt !', 'There you go! Your Critters are in top shape. See you soon!'), NURSE);
  }
  if (first) {
    setFlag('visitedCenter');
    await say(L('Le PC dans le coin te permet de changer ton équipe et ton deck.', 'The PC in the corner lets you change your team and deck.'), NURSE);
  }
};

scripts.clerk = async () => {
  await say(L('Bienvenue à la Boutique ! Qu’est-ce qui te ferait plaisir ?', 'Welcome to the Shop! What can I get you?'), L('Vendeur', 'Clerk'));
  await openScreen({ id: 'shop' });
};

scripts.gacha = async () => {
  await openScreen({ id: 'gacha' });
  await checkEvolutions();
};

scripts.pc = async () => {
  await say(L('Tu allumes le PC…', 'You switch on the PC…'));
  await openScreen({ id: 'collection', back: { id: 'overworld' } });
};

scripts.afterRun = async () => {
  await checkEvolutions();
};

async function gate(dungeonId: string) {
  const dg = DUNGEONS[dungeonId];
  const d = save.value!;
  if (!d.team.length) {
    await say(L('Il fait trop sombre pour entrer sans Bestiole…', 'It’s too dark to go in without a Critter…'));
    return;
  }
  if (dg.requires && !d.badges.includes(dg.requires)) {
    await say(dg.lockedText);
    return;
  }
  if (d.run && d.run.dungeonId === dungeonId) {
    const c = await ask(L('Reprendre l’exploration de {name} ?', 'Resume exploring {name}?'), [L('Oui', 'Yes'), L('Non', 'No')], undefined, { name: tr(dg.name) });
    if (c === 0) {
      await openScreen({ id: 'dungeon' });
      await checkEvolutions();
    }
    return;
  }
  if (d.run) {
    await say(L('Tu es déjà en pleine exploration ailleurs !', 'You’re already in the middle of another expedition!'));
    return;
  }
  await say(dg.intro);
  const c = await ask(L('Entrer ? (Choisis 4 Bestioles au maximum)', 'Go in? (Pick up to 4 Critters)'), [L('Oui', 'Yes'), L('Non', 'No')]);
  if (c !== 0) return;
  startRun(dungeonId);
  await openScreen({ id: 'dungeon' });
  await checkEvolutions();
}

scripts.gateGrotte = () => gate('grotte');
scripts.gateTour = () => gate('tour');

/** New game: wake up at home. */
scripts.intro = async () => {
  await wait(300);
  await say(L('Quelle belle journée ! On dirait que Maman veut te parler.', 'What a lovely day! Looks like Mom wants to talk to you.'));
};

