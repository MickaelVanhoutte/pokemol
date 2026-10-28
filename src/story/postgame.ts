import { L, tr } from '../i18n';
import { monLabel } from '../data/creatures';
import { CONCOURS, hallEntry, TOWER_ROUND, TOWER_TEAM, towerCopy, towerFoe, towerPoints, towerRound } from '../data/postgame';
import { partyOf, type TrainerDef } from '../data/trainers';
import { newSeed } from '../engine/rng';
import { LOOKS } from '../overworld/sprites';
import { healParty, partyAlive, save, update } from '../state/game';
import { ask, fight, flag, getGame, openScreen, say, sayAll, scripts, setFlag, showToast, warpTo } from '../overworld/controller';
import { sfx } from '../audio/sfx';
import { PROF } from './cast';

// ------------------------------------------------------------------ Grand Concours

const USHER = L('Huissier', 'Usher');

/** Forget the Grands Maîtres beaten in the last attempt: every attempt starts from the first one. */
function resetConcours() {
  update((d) => {
    for (const st of CONCOURS) delete d.flags[`gc:${st.n}`];
  });
}

scripts.concoursDoor = async () => {
  await sayAll([
    L('Voici le Grand Concours ! Quatre Grandes Maîtresses, puis un dernier artiste, t’attendent l’un après l’autre.', 'This is the Grand Contest! Four Grand Masters, then one last artist, await you one after the other.'),
    L('Une fois entré, pas d’Auberge : seulement ton sac. Si tes Bestioles tombent, tout recommence depuis le début.', 'Once inside, no Inn: only your bag. If your Critters faint, it all starts again from the beginning.'),
  ], USHER);
  if (!partyAlive(save.value!)) {
    await say(L('Tes Bestioles sont épuisées. Va d’abord les soigner !', 'Your Critters are worn out. Heal them first!'), USHER);
    return;
  }
  if ((await ask(L('Tu entres ?', 'Will you go in?'), [L('Oui', 'Yes'), L('Non', 'No')], USHER)) !== 0) return;
  resetConcours();
  await warpTo({ map: 'concours', x: 4, y: 20, facing: 'up' });
};

async function concoursBattle(n: number): Promise<boolean> {
  const st = CONCOURS[n - 1];
  if (flag(`gc:${n}`) || (n > 1 && !flag(`gc:${n - 1}`))) return false;
  const g = getGame();
  const actor = g.npc(`gc${n}`);
  if (actor) {
    g.face(g.player, 'up');
    g.faceToward(actor, g.player);
  }
  await sayAll(st.trainer.before, st.trainer.name);
  const out = await fight('trainer', st.trainer.name, partyOf(st.trainer.party, newSeed()), {
    trainer: st.trainer, look: LOOKS[st.look as keyof typeof LOOKS], music: n === CONCOURS.length ? 'champion' : 'leader', backdrop: 'city',
  });
  // a loss already sent the player back to the last Inn
  if (out.result !== 'win') return false;
  setFlag(`gc:${n}`);
  return true;
}

for (const st of CONCOURS.slice(0, -1)) {
  scripts[`gc${st.n}`] = async () => {
    if (!(await concoursBattle(st.n))) return;
    await sayAll(st.trainer.after.slice(1), st.trainer.name);
    await say(L('(La Grande Maîtresse s’écarte pour te laisser passer.)', '(The Grand Master steps aside to let you through.)'));
    getGame().remove(`gc${st.n}`);
  };
}

scripts.gc5 = async () => {
  if (!(await concoursBattle(CONCOURS.length))) return;
  const first = !flag('champion');
  setFlag('champion');
  await sayAll([
    L('Félicitations, {name} ! Tu remportes le Grand Concours de Papeterre !', 'Congratulations, {name}! You win the Grand Contest of Papeterra!'),
    L('Viens, on va prendre une photo de ton équipe pour le Panthéon. Clic-clac !', 'Come, let’s take a picture of your team for the Hall of Fame. Click-clack!'),
  ], PROF);
  update((d) => {
    d.hallOfFame = [...(d.hallOfFame ?? []), hallEntry(d.party, Date.now())];
  });
  sfx.victory();
  await getGame().fadeTo(1, 500, 'white');
  await openScreen({ id: 'hall', fresh: true });
  update((d) => healParty(d));
  resetConcours();
  await warpTo({ map: 'galerie', x: 11, y: 6, facing: 'down' });
  if (first) await say(L('Le Grand Concours reste ouvert : reviens défier les Grandes Maîtresses quand tu veux !', 'The Grand Contest stays open: come back and challenge the Grand Masters any time!'));
};

scripts.pantheon = async () => {
  const who = L('Gardienne du Panthéon', 'Hall Keeper');
  const n = save.value!.hallOfFame?.length ?? 0;
  if (!n) {
    await say(L('Ici, on accroche la photo de chaque équipe qui remporte le Grand Concours. Le mur est encore vide…', 'Here we hang a picture of every team that wins the Grand Contest. The wall is still empty…'), who);
    return;
  }
  if ((await ask(L('Ton équipe est au Panthéon ({n} fois) ! Tu veux revoir les photos ?', 'Your team is in the Hall of Fame ({n} times)! Want to look at the pictures?'), [L('Oui', 'Yes'), L('Non', 'No')], who, { n })) === 0) {
    await openScreen({ id: 'hall' });
  }
};

// ------------------------------------------------------------------ Tour des Défis

const DESK = L('Hôtesse', 'Receptionist');
/** A challenge is running (the battle room sends you back down otherwise, e.g. after a reload). */
let climbing = false;

const towerOf = () => save.value!.tower ?? { streak: 0, best: 0, points: 0 };

scripts.towerDesk = async () => {
  const t = towerOf();
  const c = await ask(L('Bienvenue à la Tour des Défis ! Série : {s} · Record : {b} · Points : {p}.', 'Welcome to the Challenge Tower! Streak: {s} · Best: {b} · Points: {p}.'),
    [L('Relever le défi', 'Take the challenge'), L('Explications', 'How it works'), L('Au revoir', 'Bye')], DESK, { s: t.streak, b: t.best, p: t.points });
  if (c === 1) {
    await sayAll([
      L('Choisis trois Bestioles. Là-haut, elles combattent toutes au niveau 50, et sans objets du sac.', 'Pick three Critters. Up there, they all fight at level 50, with no items from the bag.'),
      L('Les défis vont par séries de 7. Chaque victoire rapporte un point, et finir une série en rapporte plus !', 'Challenges come in rounds of 7. Every win earns a point, and finishing a round earns more!'),
      L('Ta série continue tant que tu gagnes, même si tu fais une pause. Échange tes points auprès de ma collègue.', 'Your streak goes on as long as you win, even if you take a break. Trade your points with my colleague.'),
    ], DESK);
    return;
  }
  if (c !== 0) return;
  const team = await pickTeam();
  if (!team) return;
  await say(L('Bonne chance ! Suis-moi.', 'Good luck! Follow me.'), DESK);
  climbing = true;
  try {
    await climb(team);
  } finally {
    climbing = false;
  }
  await warpTo({ map: 'tourDefis', x: 4, y: 3, facing: 'up' });
};

/** Three different Bestioles of the party (uids), or null when cancelled. */
async function pickTeam(): Promise<string[] | null> {
  const able = save.value!.party.filter((m) => !m.egg);
  if (able.length < TOWER_TEAM) {
    await say(L('Il te faut au moins trois Bestioles dans ton équipe (les œufs ne comptent pas).', 'You need at least three Critters in your party (eggs don’t count).'), DESK);
    return null;
  }
  const picked: string[] = [];
  while (picked.length < TOWER_TEAM) {
    const left = able.filter((m) => !picked.includes(m.uid));
    const c = await ask(L('Bestiole n°{k} ?', 'Critter no. {k}?'), [...left.map((m) => `${monLabel(m)} N.${m.level}`), L('Annuler', 'Cancel')], DESK, { k: picked.length + 1 });
    if (c >= left.length) return null;
    picked.push(left[c].uid);
  }
  return picked;
}

async function climb(team: string[]) {
  await warpTo({ map: 'tourSalle', x: 4, y: 5, facing: 'up' });
  for (;;) {
    const t = towerOf();
    const round = towerRound(t.streak);
    const k = (t.streak % TOWER_ROUND) + 1;
    const foe = towerFoe(t.streak, { rng: newSeed() });
    const look = LOOKS[foe.look as keyof typeof LOOKS];
    const g = getGame();
    g.remove('towerFoe');
    g.spawn('towerFoe', look, 4, 2, 'down');
    await say(L('Série {r}, défi {k}/7 : {f} entre dans la salle !', 'Round {r}, challenge {k}/7: {f} steps in!'), undefined, { r: round, k, f: tr(foe.name) });
    // from the third round on, the foes make fair copies too
    const trainer: TrainerDef = { id: 'tower', name: foe.name, party: [], money: 0, ...(round >= 3 ? { fairCopy: true as const } : {}), before: [], after: [L('Bien joué ! Tu mérites ta place ici.', 'Well played! You deserve your place here.')] };
    const borrowed = team.map((uid) => towerCopy(save.value!.party.find((m) => m.uid === uid)!));
    const out = await fight('trainer', foe.name, foe.party, { trainer, borrowed, look, backdrop: 'tower', music: round >= 3 ? 'leader' : 'trainer' });
    g.remove('towerFoe');
    if (out.result !== 'win') {
      const s = towerOf().streak;
      update((d) => {
        d.tower = { ...towerOf(), streak: 0 };
      });
      await say(L('Ta série s’arrête à {n} victoire(s). Reviens quand tu veux tenter ta chance !', 'Your streak ends at {n} win(s). Come back and try again any time!'), DESK, { n: s });
      return;
    }
    let gained = 0;
    update((d) => {
      const cur = towerOf();
      const streak = cur.streak + 1;
      gained = towerPoints(streak);
      d.tower = { streak, best: Math.max(cur.best, streak), points: cur.points + gained };
    });
    sfx.coin();
    showToast(tr(L('+{n} points', '+{n} points'), { n: gained }));
    if (k === TOWER_ROUND) {
      await say(L('Bravo ! Tu as terminé la série {r} ! Ta série de victoires est gardée pour la prochaine fois.', 'Bravo! You finished round {r}! Your winning streak is kept for next time.'), DESK, { r: round });
      return;
    }
    const c = await ask(L('Victoire ! ({k}/7) On continue ?', 'Victory! ({k}/7) Shall we go on?'), [L('Continuer', 'Go on'), L('Faire une pause', 'Take a break')], DESK, { k });
    if (c !== 0) {
      await say(L('D’accord ! Ta série est gardée. Reviens quand tu veux.', 'All right! Your streak is kept. Come back any time.'), DESK);
      return;
    }
  }
}

/** The battle room is only reachable during a challenge (a reload there sends you back down). */
scripts.towerRoom = async () => {
  if (!climbing) await warpTo({ map: 'tourDefis', x: 4, y: 3, facing: 'up' });
};

scripts.towerShop = async () => {
  const who = L('Échangeuse', 'Exchange');
  const t = towerOf();
  if ((await ask(L('Tu as {p} points. Tu veux les échanger contre des objets ?', 'You have {p} points. Want to trade them for items?'), [L('Oui', 'Yes'), L('Non', 'No')], who, { p: t.points })) !== 0) return;
  await openScreen({ id: 'shop', tower: true });
};
