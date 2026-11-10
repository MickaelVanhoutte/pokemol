/**
 * Papeterre's calendar (roadmap milestone 11, src/data/events.ts): the innkeepers tell the day's news, a market
 * stall opens once a week in one town's shop, and the Star Ball dances three nights in December.
 */
import { L, tr } from '../i18n';
import { item } from '../data/items';
import { isBal, marketItem, todayNews, weekOf } from '../data/events';
import { teamLevel } from '../data/trainers';
import { localDay } from '../overworld/berries';
import { addItem, save, update } from '../state/game';
import { ask, gotItem, say, sayAll, scripts, wildBattle } from '../overworld/controller';

/** The innkeeper tells the news (« Quoi de neuf ? »). */
const CRIER = L('Aubergiste', 'Innkeeper');
const STALL = L('Marchande ambulante', 'Travelling merchant');
const DANCER = L('Danseuse étoilée', 'Star dancer');

scripts.gazette = async () => {
  const news = todayNews(localDay(), save.value!);
  if (!news.length) {
    await say(L('Rien de spécial aujourd’hui ! Repasse demain, il se passe toujours quelque chose à Papeterre.', 'Nothing special today! Come back tomorrow, something always happens in Papeterra.'), CRIER);
    return;
  }
  await sayAll([L('Oyez, oyez ! Les nouvelles du jour :', 'Hear ye, hear ye! Today’s news:'), ...news], CRIER);
};

scripts.marchande = async () => {
  const day = localDay();
  const [id, price] = marketItem(day);
  if (save.value!.flags['marche:semaine'] === weekOf(day)) {
    await say(L('Je n’avais qu’un seul exemplaire cette semaine. Reviens au prochain marché !', 'I only had one this week. Come back to the next market!'), STALL);
    return;
  }
  const c = await ask(L('Jour de marché ! Cette semaine, j’ai {i}, introuvable en boutique. {p} ₽ ?', 'Market day! This week I have {i}, found in no shop. ₽{p}?'),
    [L('Oui', 'Yes'), L('Non', 'No')], STALL, { i: tr(item(id).name), p: price });
  if (c !== 0) return;
  if (save.value!.money < price) {
    await say(L('Oh, il te manque des sous… Le marché revient la semaine prochaine !', 'Oh, you’re short of money… The market comes back next week!'), STALL);
    return;
  }
  update((d) => {
    d.money -= price;
    addItem(d, id);
    d.flags['marche:semaine'] = weekOf(day);
  });
  await gotItem(id, L('Tu achètes {i} !', 'You bought {i}!'), { i: tr(item(id).name) });
};

scripts.bal = async () => {
  const year = new Date().getFullYear();
  if (!isBal(new Date())) return;
  if (save.value!.flags[`bal:${year}`]) {
    await say(L('Quelle belle nuit ! Les étoiles dansent jusqu’au matin.', 'What a lovely night! The stars dance till morning.'), DANCER);
    return;
  }
  await sayAll([
    L('Bienvenue au Bal des Étoiles ! Trois nuits par an, les étoiles de Paillette descendent danser.', 'Welcome to the Star Ball! Three nights a year, Glimmerton’s stars come down to dance.'),
    L('Regarde… une Bestiole pailletée s’est glissée dans la ronde. Elle veut danser avec toi !', 'Look… a sparkly Critter slipped into the round. It wants to dance with you!'),
  ], DANCER);
  update((d) => (d.flags[`bal:${year}`] = 1));
  const level = Math.max(10, Math.min(45, teamLevel(save.value!.party) - 3));
  await wildBattle('014', level, { shiny: true });
};
