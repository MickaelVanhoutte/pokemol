/**
 * Act 4, beyond the margin (maps in src/data/maps/marge.ts): after the Eraser Factory a white wall closes the
 * north of Cité-Encre. The way to stop it goes west, past the red margin of the sketchbook, through a hamlet
 * of unfinished drafts (the seventh choice) and a sketched forest, up to Team Gomme's fortress, where the
 * three admins confess what they are (the little voices of doubt) before the Giant Eraser is stopped.
 */
import { L, tr } from '../i18n';
import { save } from '../state/game';
import { playMusic } from '../audio/music';
import { LOOKS } from '../overworld/sprites';
import { healParty, update } from '../state/game';
import {
  ask, bubble, flag, flash, getGame, giveMon, mapMusic, openScreen, say, sayAll, scripts, setFlag, shake, showToast, warpTo,
} from '../overworld/controller';
import { CUSTOM_ID, monLabel } from '../data/creatures';
import { joinLevel, type CustomDesign } from '../data/custom';
import { healMon } from '../engine/pk/creature';
import { move } from '../data/moves';
import { RIVAL } from './cast';
import { choose, comeUp, findCoconfus, RETOUCHE } from './choices';

const DOYEN = L('Doyen des Esquisses', 'Elder of Sketches');
const hasCoconfus = () => !!save.value && !!findCoconfus(save.value);

// ------------------------------------------------------------------ Cité-Encre: the white wall and the west road

scripts.encreNorth = async () => {
  const g = getGame();
  if (!flag('a3.usine')) {
    await say(L('Au nord, le monde n’est même plus colorié… Une drôle de brume blanche empêche d’avancer.', 'Up north, the world isn’t even coloured in anymore… A strange white mist keeps you from going on.'));
  } else {
    await say(L('Un grand mur blanc barre la route du nord. Il bourdonne, comme si quelque chose le faisait tenir de très loin…', 'A great white wall blocks the road north. It hums, as if something far away were holding it up…'));
    await say(L('La Team Gomme est partie vers l’ouest, au-delà de la Marge. Ils ont une forteresse là-bas, et une machine énorme.', 'Team Gomme went west, beyond the Margin. They have a fortress there, and a huge machine.'), L('Habitant', 'Local'));
  }
  await g.walk(g.player, ['down'], 160);
};

scripts.encreWest = async () => {
  const g = getGame();
  await say(L('Un panneau : « Route de la Marge. On ne dépasse pas la marge ! »', 'A sign: “Margin Road. Don’t go past the margin!”'));
  await say(L('(L’Usine à Gommes, juste à côté, a l’air plus urgente.)', '(The Eraser Factory, right next door, looks more urgent.)'));
  await g.walk(g.player, ['right'], 160);
};

// ------------------------------------------------------------------ the Margin Road

/** Crossing the red margin for the first time. */
scripts.margeCross = async () => {
  setFlag('a4.marge');
  await say(L('Tu passes la marge rouge du cahier… De l’autre côté, plus rien n’est colorié.', 'You step over the red margin of the sketchbook… On the other side, nothing is coloured in.'));
  if (hasCoconfus()) await say(L('Coconfus regarde autour de lui, les yeux grands ouverts… comme s’il connaissait cet endroit.', 'Muddlecoon looks around, eyes wide open… as if it knew this place.'));
};

/** Little drawings in the margin: someone tried to draw wings here, again and again. */
scripts.margeDoodle = async () => {
  const g = getGame();
  if (g.player.y < 9) {
    await say(L('Dans la marge, de tout petits dessins au crayon : des ailes de papillon. Gommées, redessinées, gommées encore… Aucune n’est finie.', 'In the margin, tiny pencil drawings: butterfly wings. Rubbed out, drawn again, rubbed out again… None of them is finished.'));
  } else {
    await say(L('Quelques mots écrits dans la marge, d’une écriture d’enfant : « demain, je finis ses ailes ».', 'A few words in the margin, in a child’s handwriting: “tomorrow, I’ll finish its wings”.'));
  }
};

// ------------------------------------------------------------------ Hameau-Brouillon

/** Coming into the hamlet: the Elder asks you to finish them (the seventh choice). */
scripts.hameauChoice = async () => {
  const g = getGame();
  const d = g.npc('doyen');
  await bubble('doyen', '!', 600);
  if (d) {
    for (let i = 0; i < 12 && Math.abs(d.x - g.player.x) + Math.abs(d.y - g.player.y) > 1; i++) {
      await g.walk(d, [d.y < g.player.y - 1 || (d.y < g.player.y && d.x === g.player.x) ? 'down' : d.x < g.player.x ? 'right' : d.x > g.player.x ? 'left' : 'up'], 180);
    }
    g.faceToward(d, g.player);
    g.faceToward(g.player, d);
  }
  await sayAll([
    L('Oh ! Quelqu’un en couleurs ! Bienvenue au Hameau-Brouillon.', 'Oh! Someone in colour! Welcome to Draft Hamlet.'),
    L('Ici, personne n’a jamais été fini : ni les maisons, ni les gens. On a été dessinés vite, un soir… puis oubliés dans la marge.', 'Nobody here was ever finished: not the houses, not the people. We were drawn quickly one evening… then forgotten in the margin.'),
    L('Moi, il me manque les mains. La petite, là-bas, n’a qu’une oreille. Toi, tu as des couleurs… Tu veux bien nous finir ?', 'I have no hands. The little one over there only has one ear. You have colours… Would you finish us?'),
  ], DOYEN);
  const way = await choose('hameau', L('Que réponds-tu ?', 'What do you say?'),
    L('Je vais tout colorier !', 'I’ll colour everything in!'),
    L('Vous êtes beaux comme ça, pas finis.', 'You’re lovely as you are, unfinished.'), DOYEN);
  if (way === RETOUCHE) {
    await flash('white', 400);
    showToast(tr(L('Le Hameau-Brouillon se colorie !', 'Draft Hamlet gets coloured in!')));
    await say(L('Regarde ! Des toits rouges, de l’herbe verte… Et moi, j’ai des mains ! Merci, merci !', 'Look! Red roofs, green grass… And I have hands! Thank you, thank you!'), DOYEN);
  } else {
    await say(L('… Personne ne nous avait jamais dit ça. Pas finis, mais beaux. On va le garder, ce mot-là.', '… Nobody ever told us that before. Unfinished, but lovely. We’ll keep that word.'), DOYEN);
  }
  await say(L('La Forteresse Gomme est au fond de la Forêt des Esquisses, à l’ouest. Repose-toi à l’Auberge avant d’y aller.', 'The Eraser Fortress is deep in the Sketch Forest, to the west. Rest at the Inn before you go.'), DOYEN);
};

scripts.hameauDoyen = async () => {
  if (!flag('choix:hameau')) return scripts.hameauChoice();
  await say(flag('choix:hameau:a')
    ? L('Avec mes nouvelles mains, j’ai dessiné une fleur. Elle dépasse un peu. Ce n’est pas grave, hein ?', 'With my new hands, I drew a flower. It goes over the lines a bit. That’s all right, isn’t it?')
    : L('Pas finis, mais beaux. Je le répète tous les matins. Ça marche !', 'Unfinished, but lovely. I say it every morning. It works!'), DOYEN);
};

scripts.esquisse1 = async () => {
  await say(flag('choix:hameau:a')
    ? L('J’ai deux oreilles, maintenant ! J’entends même les Bestioles chuchoter dans la forêt.', 'I have two ears now! I can even hear the Critters whispering in the forest.')
    : L('Il me manque une oreille. Ça ne m’empêche pas d’écouter ! Et toi, qu’est-ce qui te manque ?', 'I’m missing an ear. It doesn’t stop me listening! And you, what are you missing?'), L('Esquisse', 'Sketch'));
};

scripts.esquisse2 = async () => {
  await say(L('Le Grand Effaceur n’a pas de visage. On dit qu’il l’a gommé lui-même, à force de se trouver raté.', 'The Great Eraser has no face. They say he rubbed it out himself, from always thinking he got it wrong.'), L('Esquisse', 'Sketch'));
};

scripts.esquisse3 = async () => {
  await say(L('Hier soir, quelqu’un a dessiné un papillon dans la marge. Trois fois. Puis plus rien… Il n’a jamais eu ses ailes.', 'Last night, someone drew a butterfly in the margin. Three times. Then nothing… It never got its wings.'), L('Esquisse', 'Sketch'));
};

scripts.esquisse4 = async () => {
  await say(L('La Team Gomme ? Ce ne sont pas des méchants comme les autres. Ils ressemblent à des pensées… des pensées tristes.', 'Team Gomme? They’re not baddies like the others. They’re more like thoughts… sad thoughts.'), L('Esquisse', 'Sketch'));
};

// ------------------------------------------------------------------ l'Atelier des Brouillons

const DESSINATRICE = L('Dessinatrice', 'Sketcher');

/**
 * The finished design: kept in the save (which puts it among the species), then its Bestiole joins the first
 * time, or is redrawn wherever it is (team, PC, day care), keeping its level: new moves, full health.
 */
function keepDesign(d: CustomDesign): 'new' | 'party' | 'box' | 'redrawn' {
  const first = !save.value!.atelier;
  update((x) => {
    x.atelier = d;
    const mons = [...x.party, ...x.boxes.flat(), ...(x.daycare?.slots.map((sl) => sl.mon) ?? [])];
    for (const m of mons) {
      if (m.species !== CUSTOM_ID) continue;
      m.moves = d.moves.map((id) => ({ id, pp: move(id).pp }));
      healMon(m);
    }
  });
  if (!first && [...save.value!.party, ...save.value!.boxes.flat(), ...(save.value!.daycare?.slots ?? []).map((sl) => sl.mon)].some((m) => m.species === CUSTOM_ID)) return 'redrawn';
  const full = save.value!.party.length >= 6;
  const m = giveMon(CUSTOM_ID, joinLevel(save.value!.party.filter((p) => !p.egg).map((p) => p.level)));
  // the only one of its kind: never a sparkly one
  update((x) => {
    for (const p of [...x.party, ...x.boxes.flat()]) if (p.uid === m.uid) p.shiny = false;
  });
  setFlag('atelier:made');
  return full ? 'box' : 'party';
}

/** La Dessinatrice and her workshop: draw your own Bestiole, then come back to retouch it as often as you like. */
scripts.atelierPerso = async () => {
  let fresh = false;
  if (!save.value?.atelier) {
    await sayAll([
      L('Oh ! Tu es en couleurs ! Ici, je dessine des Bestioles… mais elles restent toutes en brouillon.', 'Oh! You’re in colour! I draw Critters here… but they all stay drafts.'),
      L('Toi, tu pourrais en dessiner une vraie. Une Bestiole à toi, comme tu l’imagines : son dessin, ses types, sa force, ses capacités.', 'You could draw a real one. A Critter of your own, just as you imagine it: its drawing, its types, its strength, its moves.'),
      L('Il n’y en aura qu’une : la seule de son espèce. Et tu pourras revenir la retoucher quand tu veux.', 'There will be only one: the only one of its kind. And you can come back to retouch it whenever you like.'),
    ], DESSINATRICE);
    if (await ask(L('Tu veux dessiner ta Bestiole ?', 'Do you want to draw your Critter?'), [L('Oui !', 'Yes!'), L('Pas maintenant', 'Not now')], DESSINATRICE)) {
      return say(L('Mes crayons t’attendent. Reviens quand l’envie te prend !', 'My pencils will wait for you. Come back whenever you feel like it!'), DESSINATRICE);
    }
  } else {
    const name = monLabel({ species: CUSTOM_ID });
    const pick = await ask(L('Que veux-tu faire avec {n} ?', 'What would you like to do with {n}?'), [L('La retoucher', 'Retouch it'), L('Tout recommencer', 'Start over'), L('Rien', 'Nothing')], DESSINATRICE, { n: name });
    if (pick === 2) return say(L('{n} est très bien comme ça !', '{n} is just right as it is!'), DESSINATRICE, { n: name });
    if (pick === 1) {
      const sure = await ask(L('Tout recommencer ? Son dessin sera effacé, mais elle gardera son niveau.', 'Start over? Its drawing will be erased, but it keeps its level.'), [L('Oui', 'Yes'), L('Non', 'No')], DESSINATRICE);
      if (sure) return;
      fresh = true;
    }
  }
  let design: CustomDesign | null = null;
  await openScreen({ id: 'atelier', fresh, onEnd: (d) => (design = d) });
  if (!design) return say(L('Pas d’inspiration ? Ça arrive aux meilleurs. Reviens quand tu veux !', 'No inspiration? It happens to the best of us. Come back whenever you like!'), DESSINATRICE);
  const how = keepDesign(design);
  const n = monLabel({ species: CUSTOM_ID });
  if (how === 'redrawn') {
    showToast(tr(L('{n} a été redessinée !', '{n} has been redrawn!'), { n }));
    return say(L('Elle te ressemble encore plus, maintenant.', 'It looks even more like you now.'), DESSINATRICE);
  }
  await flash('white', 300);
  await say(L('Elle est magnifique ! Regarde, elle bouge… Elle a envie de te suivre !', 'It’s wonderful! Look, it’s moving… It wants to come with you!'), DESSINATRICE);
  await say(how === 'box'
    ? L('Ton équipe est complète : {n} est envoyée dans le PC.', 'Your team is full: {n} was sent to the PC.')
    : L('{n} rejoint ton équipe !', '{n} joined your team!'), undefined, { n });
};

scripts.brouillonHouse = async () => {
  await say(flag('choix:hameau:a')
    ? L('La porte est coloriée maintenant… mais personne n’a encore dessiné l’intérieur !', 'The door is coloured in now… but nobody has drawn the inside yet!')
    : L('La porte n’est qu’un trait de crayon. On ne peut pas entrer dans une maison pas finie !', 'The door is only a pencil line. You can’t go into an unfinished house!'));
};

// ------------------------------------------------------------------ the Eraser Fortress

/** Reaching the top floor: the rival catches up, heals the team and says how the Misty Tower changed him. */
scripts.forteresseTop = async () => {
  if (flag('a4.rival')) return;
  setFlag('a4.rival');
  playMusic('rival');
  const r = await comeUp('rivalFort', LOOKS.rival);
  await say(flag('choix:rival:a')
    ? L('{name} ! Je me suis entraîné depuis la Tour… et je me suis bien amusé ! Regarde-moi ces muscles !', '{name}! I’ve been training since the Tower… and I had a great time! Look at these muscles!')
    : flag('choix:rival:b')
      ? L('{name} ! Je suis venu. Pas parce que je suis le meilleur… juste parce que je suis ton ami.', '{name}! I came. Not because I’m the best… just because I’m your friend.')
      : L('{name} ! Je t’ai suivi jusqu’ici. Cette fois encore, on fait équipe.', '{name}! I followed you all the way here. Once again, we’re a team.'), RIVAL);
  await getGame().fadeTo(0.6, 200, 'white');
  update((d) => healParty(d));
  await getGame().fadeTo(0, 300);
  showToast(tr(L('Tes Bestioles sont en pleine forme !', 'Your Critters are in top shape!')));
  await say(L('Les trois admins t’attendent devant la machine. Moi, je garde l’escalier. Fonce !', 'The three admins are waiting for you in front of the machine. I’ll guard the stairs. Go!'), RIVAL);
  getGame().remove(r.id);
  mapMusic();
};

/** The Giant Eraser at the top of the fortress: stopping it brings the white wall down. */
scripts.grandeGomme = async () => {
  if (flag('a4.machine')) {
    await say(L('La Gomme Géante est arrêtée. Ses engrenages ne bougent plus.', 'The Giant Eraser has stopped. Its gears don’t move anymore.'));
    return;
  }
  if (!flag('tr:blanche3')) {
    await say(L('Une gomme gigantesque tourne sur des engrenages… L’Admin Blanche la garde.', 'A gigantic eraser turns on gears… Admin Whiteout is guarding it.'));
    return;
  }
  await say(L('Une gomme gigantesque, montée sur des engrenages. Elle frotte le ciel sans s’arrêter, et le mur blanc tient grâce à elle.', 'A gigantic eraser on gears. It rubs at the sky without stopping, and the white wall stands thanks to it.'));
  const c = await ask(L('Tirer le grand levier ?', 'Pull the big lever?'), [L('Oui', 'Yes'), L('Non', 'No')]);
  if (c !== 0) return;
  // saved before the scene: closing the app now can't block the way north
  setFlag('a4.machine');
  await shake(700);
  await flash('white', 300);
  await say(L('Les engrenages grincent… ralentissent… et s’arrêtent ! Au loin, on entend le mur blanc s’effondrer.', 'The gears creak… slow down… and stop! Far away, you hear the white wall crumble.'));
  if (hasCoconfus()) await say(L('Coconfus frémit. Pendant un instant, une couleur passe sur sa joue… puis il redevient pâle.', 'Muddlecoon trembles. For a moment, a colour crosses its cheek… then it turns pale again.'));
  await sayAll([
    L('Le patron t’attend au Bord de la Page. Il n’a pas de visage… mais tu vas le reconnaître.', 'The boss is waiting for you at the Edge of the Page. He has no face… but you’ll recognise him.'),
  ], L('Admin Blanche', 'Admin Whiteout'));
  await say(L('Un grand courant d’air se lève… et t’emporte loin de la forteresse !', 'A great gust of wind rises… and carries you far from the fortress!'));
  await getGame().fadeTo(1, 500, 'white');
  if (save.value) save.value.player.returnTo = undefined;
  await warpTo({ map: 'encre', x: 9, y: 2, facing: 'up' });
};
