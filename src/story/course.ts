import { L, tr } from '../i18n';
import { partyOf, rivalCourseTeam, RIVAL_ITEMS } from '../data/trainers';
import { newSeed } from '../engine/rng';
import { fight, getGame, mapMusic, sayAll, scripts, setFlag, showToast } from '../overworld/controller';
import { LOOKS } from '../overworld/sprites';
import { playMusic } from '../audio/music';
import { healParty, save, update } from '../state/game';
import { RIVAL } from './cast';
import { comeUp, goAway } from './choices';

/**
 * The race to the eight badges: {rival} starts it at the gates of Ville-Pastel (what an Atelier is, what a badge is
 * for) and checks on it halfway, on Glitter Road, between the fifth and sixth badges.
 */
const num = (name: string) => save.value?.flags[name] ?? 0;
const badges = () => Object.keys(save.value?.flags ?? {}).filter((f) => f.startsWith('badge:') && f !== 'badge:grotte').length;

scripts.pastelRival = async () => {
  setFlag('rival:pastel');
  playMusic('rival');
  const rival = await comeUp('rivalPastel', LOOKS.rival);
  await sayAll([
    L('Te voilà enfin, {name} ! Bienvenue à Ville-Pastel !', 'There you are at last, {name}! Welcome to Pastel City!'),
    L('Tu vois la grande maison, là-haut ? C’est l’Atelier de Mireille. Papeterre compte huit Ateliers, chacun tenu par un Maître d’Atelier qui ne dessine que des Bestioles d’un seul type.', 'See the big house up there? That’s Mireille’s Atelier. Papeterra has eight Ateliers, each run by an Atelier Master who only draws Critters of one type.'),
    L('Si tes Bestioles battent les siennes, il te donne son badge. Avec un badge, les gardes te laissent passer sur les routes, et le Maître t’offre un pochoir pour apprendre une nouvelle attaque.', 'If your Critters beat theirs, they give you their badge. With a badge the guards let you through on the roads, and the Master gives you a stencil to learn a new move.'),
    L('Il y a huit Ateliers. On dit que celui qui réunit les huit badges devient un vrai Artiste de Papeterre !', 'There are eight Ateliers. They say whoever collects all eight badges becomes a true Artist of Papeterra!'),
    L('Alors on fait la course : le premier qui a les huit badges a gagné ! Et en chemin, on fera le point, Bestiole contre Bestiole.', 'So let’s race: the first to get all eight badges wins! And along the way we’ll see where we stand, Critter against Critter.'),
    L('J’ai déjà un peu d’avance… Mireille, j’arrive !', 'I’ve already got a head start… Mireille, here I come!'),
  ], RIVAL);
  await goAway(rival, ['up']);
  mapMusic();
};

async function courseBattle() {
  const starter = String(num('rivalStarter') || 2).padStart(3, '0');
  const out = await fight('trainer', RIVAL, partyOf(rivalCourseTeam(starter), newSeed()), {
    trainer: { id: 'rivalCourse', name: RIVAL, party: [], money: 2000, items: RIVAL_ITEMS.rivalCourse, before: [], after: [L('Encore toi devant ! Pour l’instant…', 'You’re ahead again! For now…')] },
    look: LOOKS.rival, music: 'rival',
  });
  if (out.result !== 'win') return false;
  setFlag('tr:rivalCourse');
  return true;
}

scripts.rivalCourse = async () => {
  playMusic('rival');
  const rival = await comeUp('rivalCourse', LOOKS.rival);
  const mine = badges();
  await sayAll([
    L('{name} ! Je t’attendais. Alors, cette course aux badges ?', '{name}! I was waiting for you. So, how’s the badge race going?'),
    mine >= 5
      ? L('Cinq badges, toi aussi ? Pareil que moi ! On est à égalité, pile à la moitié du chemin.', 'Five badges, you too? Same as me! We’re neck and neck, right at the halfway mark.')
      : L('Moi, j’en ai cinq. Et toi ? … Bon, peu importe, on va voir qui est vraiment devant.', 'I’ve got five. And you? … Well, never mind, let’s see who’s really ahead.'),
    L('Mes Bestioles ont beaucoup grandi depuis le Lac. Tes Bestioles ont l’air fatiguées, je les soigne : je veux gagner à la loyale !', 'My Critters have grown a lot since the Lake. Yours look tired, let me heal them: I want to win fair and square!'),
  ], RIVAL);
  const g = getGame();
  await g.fadeTo(0.6, 200, 'white');
  update((d) => healParty(d));
  await g.fadeTo(0, 300);
  showToast(tr(L('Tes Bestioles sont en pleine forme !', 'Your Critters are in top shape!')));
  if (!(await courseBattle())) {
    mapMusic();
    return;
  }
  await sayAll([
    L('Bon. Tu mènes la course. Mais il reste trois Ateliers, et je n’ai pas dit mon dernier mot !', 'Fine. You’re leading the race. But there are three Ateliers left, and I haven’t had my last word!'),
    L('On se retrouve au bout du chemin. D’ici là, entraîne-toi bien !', 'See you at the end of the road. Until then, train hard!'),
  ], RIVAL);
  await goAway(rival, ['up']);
  mapMusic();
};
