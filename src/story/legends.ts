/**
 * The two dream legendaries (src/data/maps/legendes.ts), the two things Coconfus can become: Libellune
 * comes to the clearing of the Lost Woods at night, Noctaile waits at the bottom of the Scribble-Out Cave.
 * Before the ending they are only visions: a battle where balls go through them, met once, with a clue.
 * After it, the one Coconfus did not become waits there for real: caught, it is gone for good; knocked
 * out, it comes back after a night of sleep (or the next real day).
 */
import { L, type LText } from '../i18n';
import { localDay } from '../overworld/berries';
import { dayPhase, flag, getGame, say, sayAll, scripts, setFlag, shake, warpTo, wildBattle } from '../overworld/controller';
import { save } from '../state/game';
import { findCoconfus } from './choices';

const num = (name: string) => save.value?.flags[name] ?? 0;

/** The level of the one Coconfus did not become, after the ending. */
const AFTER_LEVEL = 55;

/** Whether this legendary is the form Coconfus took at the ending (`fin`: 1 Libellune, 2 Noctaile). */
const chosen = (slug: string) => num('fin') === (slug === 'libellune' ? 1 : 2);

/**
 * Whether a legendary is not in its place right now: its vision already met (before the ending), the
 * form Coconfus became, caught, knocked out and not back yet, or out of its hours.
 */
function away(slug: string, nightOnly = false) {
  if (flag(`static:${slug}`)) return true;
  if (!flag('ending') ? flag(`vision:${slug}`) : chosen(slug)) return true;
  const back = num('nuits') >= num(`ko:${slug}`) || localDay() >= num(`koDay:${slug}`);
  return !back || (nightOnly && dayPhase() !== 'night');
}

/** Before the ending: a vision of what Coconfus could become. */
async function vision(o: { id: string; slug: string; level: number; intro: LText[]; clue: LText; fades: LText }) {
  if (flag(`vision:${o.slug}`)) return;
  await sayAll(o.intro);
  await shake(500);
  const out = await wildBattle(o.id, o.level, { music: 'final', noCatch: true });
  if (out !== 'win' && out !== 'flee') return;
  setFlag(`vision:${o.slug}`);
  if (save.value && findCoconfus(save.value)) await say(o.clue);
  await say(o.fades);
}

async function meet(o: { id: string; slug: string; level: number; intro: LText[]; caught: LText; gone: LText; waits: LText }) {
  if (flag(`static:${o.slug}`)) return;
  await sayAll(o.intro);
  await shake(500);
  const out = await wildBattle(o.id, o.level, { music: 'final' });
  if (out === 'capture') {
    setFlag(`static:${o.slug}`);
    await say(o.caught);
  } else if (out === 'win') {
    // knocked out: it comes back after a night's sleep, or the next day
    setFlag(`ko:${o.slug}`, num('nuits') + 1);
    setFlag(`koDay:${o.slug}`, localDay() + 1);
    await say(o.gone);
  } else if (out === 'flee') {
    await say(o.waits);
  }
}

// ------------------------------------------------------------------ the First Page Isle and the Great Inkwell

/** The Bestiodex's reward (src/data/maps/phare.ts): caught, it is gone for good; knocked out, back after a night. */
const inkAway = () => flag('static:baleincre') || !(num('nuits') >= num('ko:baleincre') || localDay() >= num('koDay:baleincre'));

scripts.ilePageEnter = async () => {
  setFlag('ile:visite');
  setFlag('away:baleincre', inkAway() ? 1 : 0);
};

scripts.baleincre = async () => {
  if (inkAway()) return;
  await meet({
    id: '112', slug: 'baleincre', level: 60,
    intro: [
      L('Au-dessus du lac d’encre, une ombre immense nage dans le ciel… Le Grand Encrier !', 'Above the ink lake, a huge shadow swims in the sky… The Great Inkwell!'),
      L('Il te regarde de son petit œil sage, puis souffle un grand jet d’encre noire.', 'It looks at you with its small wise eye, then spouts a great jet of black ink.'),
    ],
    caught: L('Baleincre est dans ta Crayon-ball… Elle pèse aussi lourd qu’une bouteille d’encre pleine.', 'Inkwhale is in your Pencil Ball… It’s as heavy as a full bottle of ink.'),
    gone: L('Le Grand Encrier remonte dans les nuages… Il reviendra peut-être après une nuit de sommeil.', 'The Great Inkwell rises into the clouds… Maybe it will come back after a night’s sleep.'),
    waits: L('Le Grand Encrier n’a pas bougé. Il nage en rond au-dessus du lac.', 'The Great Inkwell hasn’t moved. It is swimming in circles above the lake.'),
  });
  setFlag('away:baleincre', inkAway() ? 1 : 0);
};

// ------------------------------------------------------------------ the Lost Woods and Libellune

scripts.boisPerduGate = async () => {
  if (!flag('badge:paillette')) {
    await say(L('Des ronces épaisses barrent le passage… De l’autre côté, de petites lumières dansent entre les arbres.', 'Thick brambles block the way… On the other side, little lights are dancing between the trees.'));
    await say(L('(Elles s’écarteront peut-être pour quelqu’un qui a gagné plus de badges.)', '(Maybe they will part for someone who has won more badges.)'));
    const g = getGame();
    await g.walk(g.player, ['up'], 160);
    return;
  }
  await warpTo({ map: 'boisPerdu', x: 10, y: 15, facing: 'up' });
};

scripts.boisPerduEnter = async () => {
  setFlag('away:libellune', away('libellune', true) ? 1 : 0);
};

scripts.boisPerduLost = async () => {
  await say(L('Les lucioles s’éteignent… Tu tournes en rond !', 'The fireflies go out… You’re going round in circles!'));
  await warpTo({ map: 'boisPerdu', x: 10, y: 15, facing: 'up' });
};

scripts.libellune = async () => {
  if (away('libellune', true)) return;
  if (!flag('ending')) {
    await vision({
      id: '071', slug: 'libellune', level: 32,
      intro: [
        L('Une libellule de vitrail boit au petit étang. Ses ailes brillent de toutes les couleurs… mais on voit les arbres à travers elle.', 'A stained-glass dragonfly is drinking at the little pond. Its wings shine with every colour… but you can see the trees through it.'),
        L('Elle se retourne vers toi !', 'It turns towards you!'),
      ],
      clue: L('Ces grands yeux doux… Ce sont exactement les yeux de Coconfus !', 'Those big gentle eyes… They are exactly Muddlecoon’s eyes!'),
      fades: L('La libellule s’efface en mille éclats de lumière. Ce n’était qu’un reflet… le reflet de quoi ?', 'The dragonfly fades into a thousand sparks of light. It was only a reflection… a reflection of what?'),
    });
    setFlag('away:libellune', away('libellune', true) ? 1 : 0);
    return;
  }
  await meet({
    id: '071', slug: 'libellune', level: AFTER_LEVEL,
    intro: [
      L('Une libellule de vitrail boit au petit étang. Ses ailes brillent de toutes les couleurs…', 'A stained-glass dragonfly is drinking at the little pond. Its wings shine with every colour…'),
      L('Elle se retourne vers toi !', 'It turns towards you!'),
    ],
    caught: L('Libellune s’est posée dans ta Crayon-ball. Elle brille encore un peu à travers.', 'Glassfly settled into your Pencil Ball. It still glows a little through it.'),
    gone: L('Libellune s’envole au-dessus des arbres… Elle reviendra peut-être après une nuit de sommeil.', 'Glassfly flies off above the trees… Maybe it will come back after a night’s sleep.'),
    waits: L('Libellune n’a pas bougé. Elle te regarde toujours.', 'Glassfly hasn’t moved. It is still watching you.'),
  });
  setFlag('away:libellune', away('libellune', true) ? 1 : 0);
};

// ------------------------------------------------------------------ the Scribble-Out Cave and Noctaile

scripts.ratures3Enter = async () => {
  setFlag('away:noctaile', away('noctaile') ? 1 : 0);
};

scripts.noctaile = async () => {
  if (away('noctaile')) return;
  if (!flag('ending')) {
    await vision({
      id: '072', slug: 'noctaile', level: 38,
      intro: [
        L('Un grand papillon d’ombre ouvre ses ailes. Des spirales roses y tournent… mais on voit la roche à travers lui.', 'A great shadow moth opens its wings. Pink spirals turn on them… but you can see the rock through it.'),
        L('Il fonce sur toi !', 'It swoops at you!'),
      ],
      clue: L('Ces spirales roses… Ce sont les mêmes que les taches de Coconfus !', 'Those pink spirals… They are just like Muddlecoon’s smudges!'),
      fades: L('Le papillon se dissout dans le noir. Ce n’était qu’un reflet… le reflet de quoi ?', 'The moth melts into the dark. It was only a reflection… a reflection of what?'),
    });
    setFlag('away:noctaile', away('noctaile') ? 1 : 0);
    return;
  }
  await meet({
    id: '072', slug: 'noctaile', level: AFTER_LEVEL,
    intro: [
      L('Un grand papillon d’ombre ouvre ses ailes. Des spirales roses y tournent… Tu as la tête qui tourne.', 'A great shadow moth opens its wings. Pink spirals turn on them… Your head is spinning.'),
      L('Noctaile fonce sur toi !', 'Nightmoth swoops at you!'),
    ],
    caught: L('Noctaile est dans ta Crayon-ball. Tout est calme… Ce soir, on dormira tranquille.', 'Nightmoth is in your Pencil Ball. All is calm… Tonight, everyone will sleep soundly.'),
    gone: L('Noctaile se dissout dans le noir… Il reviendra sûrement après une nuit.', 'Nightmoth melts into the dark… It will surely be back after a night.'),
    waits: L('Noctaile flotte toujours au fond de la grotte.', 'Nightmoth is still floating at the bottom of the cave.'),
  });
  setFlag('away:noctaile', away('noctaile') ? 1 : 0);
};
