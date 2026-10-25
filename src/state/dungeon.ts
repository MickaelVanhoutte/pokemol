import { L, t, type LText } from '../i18n';
import { creature } from '../data/creatures';
import { DUNGEONS, EVENTS, type DungeonDef } from '../data/dungeons';
import { SUPPORT_CARDS, support } from '../data/supportCards';
import { TALISMANS, TALISMAN_BY_ID } from '../data/talismans';
import { RARITIES } from '../data/types';
import { generateMap, type RunState } from '../engine/dungeon/run';
import { newSeed, nextRandom, pickWeighted, randomInt, shuffle } from '../engine/rng';
import { addXp, maxHpAt } from '../engine/progression';
import type { BattleResult, BattleState, SideSetup, TeamMember } from '../engine/battle/types';
import { addCreature, addSupply, save, update } from './game';
import { go } from './router';

export const run = () => save.value?.run ?? null;

const BASIC_DECK = ['potion', 'pile', 'pile', 'pile', 'crayon', 'gomme', 'taille-crayon', 'bouclier', 'echange', 'potion'];

export function startRun(dungeonId: string) {
  const dg = DUNGEONS[dungeonId];
  const seed = newSeed();
  update((d) => {
    d.run = {
      dungeonId, seed, rng: seed ^ 0x9e3779b9, map: generateMap(seed, dg.rows), at: null, visited: [],
      team: [], deck: [...d.deck], gained: [], talismans: [], coins: 0, glitter: 0, captured: [], xp: 0, pending: null,
    };
    d.stats.runs++;
  });
}

export function setRunTeam(ids: string[]) {
  update((d) => {
    if (!d.run) return;
    d.run.team = ids.map((defId) => {
      const level = d.collection[defId].level;
      return { defId, level, hp: maxHpAt(defId, level) };
    });
  });
}

function rowLevel(dg: DungeonDef, row: number) {
  const k = Math.min(1, row / Math.max(1, dg.rows - 1));
  return Math.round(dg.levels[0] + (dg.levels[1] - dg.levels[0]) * k);
}

function randomSupport(r: RunState, n: number, allowRare = true): string[] {
  const pool = SUPPORT_CARDS.filter((c) => !c.id.endsWith('+') && (allowRare || c.rarity !== 'rare'));
  const out: string[] = [];
  while (out.length < n) {
    const c = pickWeighted(r, pool, (x) => RARITIES[x.rarity].weight);
    if (!out.includes(c.id)) out.push(c.id);
  }
  return out;
}

function enemyTrainer(r: RunState, dg: DungeonDef, row: number, elite: boolean): SideSetup {
  const lvl = rowLevel(dg, row) + (elite ? 1 : 0);
  const count = elite ? 3 : Math.min(3, 1 + (row >= 2 ? randomInt(r, 2) : 0) + (row >= 5 ? 1 : 0));
  const team: TeamMember[] = shuffle(r, [...dg.pool]).slice(0, count).map((defId) => ({
    defId, level: Math.max(1, lvl + randomInt(r, 3) - 1),
  }));
  const name = dg.trainerNames[randomInt(r, dg.trainerNames.length)];
  return {
    name: elite ? { fr: `Élite ${name.fr}`, en: `Elite ${name.en}` } : name,
    team,
    deck: [...BASIC_DECK, ...randomSupport(r, Math.min(5, row), elite)],
    isAI: true,
  };
}

function playerSide(r: RunState): SideSetup {
  const name = save.value!.player.name;
  return { name: { fr: name, en: name }, team: r.team.map((m) => ({ ...m })), deck: r.deck, isAI: false, talismans: r.talismans };
}

function talismanBonus(r: RunState, key: 'healAfterFight' | 'catchBonus' | 'coinBonus'): number {
  return r.talismans.reduce((n, id) => n + (TALISMAN_BY_ID[id]?.run?.[key] ?? 0), 0);
}

function newTalisman(r: RunState): string | undefined {
  const free = TALISMANS.filter((x) => !r.talismans.includes(x.id));
  return free.length ? free[randomInt(r, free.length)].id : undefined;
}

/** Opens a battle screen and resolves with its result, then comes back to the run screen. */
function runBattle(kind: 'trainer' | 'wild' | 'boss', enemy: SideSetup, r: RunState, rewardText: string[]): Promise<{ result: BattleResult; state: BattleState }> {
  const dg = DUNGEONS[r.dungeonId];
  return new Promise((resolve) => {
    go({
      id: 'battle',
      props: {
        setup: { kind: kind === 'boss' ? 'boss' : kind, seed: newSeed(), player: playerSide(r), enemy },
        blankCards: kind === 'wild' ? save.value!.items.blank : 0,
        captureBonus: talismanBonus(r, 'catchBonus'),
        onUseBlank: () => update((x) => (x.items.blank = Math.max(0, x.items.blank - 1))),
        backdrop: dg.backdrop,
        rewardLines: (res) => (res === 'win' || res === 'capture' ? rewardText : []),
        onEnd: (result, state) => {
          go({ id: 'dungeon' });
          resolve({ result, state });
        },
      },
    });
  });
}

/** Writes HP from a finished battle back into the run team. */
function syncTeam(r: RunState, st: BattleState) {
  st.sides[0].fighters.forEach((f, i) => {
    if (r.team[i]) r.team[i].hp = f.ko ? 0 : f.hp;
  });
}

export async function enterNode(nodeId: number) {
  const r0 = run();
  if (!r0 || r0.pending) return;
  const node = r0.map.nodes[nodeId];
  const dg = DUNGEONS[r0.dungeonId];
  update((d) => {
    d.run!.at = nodeId;
    d.run!.visited.push(nodeId);
  });
  const r = structuredClone(run()!);
  const lvl = rowLevel(dg, node.row);
  switch (node.kind) {
    case 'combat':
    case 'elite': {
      const elite = node.kind === 'elite';
      const enemy = enemyTrainer(r, dg, node.row, elite);
      const coins = Math.round((elite ? 60 : 25) + 10 * node.row * (1 + talismanBonus(r, 'coinBonus')));
      const glitter = elite ? 15 : 5;
      const out = await runBattle('trainer', enemy, r, [t('battle.reward.coins', { n: coins }), t('battle.reward.glitter', { n: glitter })]);
      afterBattle(out, r, () => ({
        kind: 'reward', cards: randomSupport(r, 3, elite), coins, glitter, talisman: elite ? newTalisman(r) : undefined,
      }), lvl);
      break;
    }
    case 'wild': {
      const defId = dg.pool[randomInt(r, dg.pool.length)];
      const enemy: SideSetup = { name: creature(defId).name, team: [{ defId, level: lvl }], deck: [], isAI: true };
      const out = await runBattle('wild', enemy, r, [t('battle.reward.coins', { n: 15 })]);
      afterBattle(out, r, () => ({ kind: 'reward', cards: [], coins: 15, glitter: 3 }), lvl);
      break;
    }
    case 'boss': {
      const enemy: SideSetup = { name: dg.boss.name, team: dg.boss.team, deck: dg.boss.deck, isAI: true };
      const out = await runBattle('boss', enemy, r, [t('battle.reward.glitter', { n: dg.rewardGlitter })]);
      afterBattle(out, r, () => ({ kind: 'victory', keep: null }), lvl + 2);
      break;
    }
    case 'rest':
      update((d) => (d.run!.pending = { kind: 'rest' }));
      break;
    case 'shop': {
      const cards = randomSupport(r, 4);
      update((d) => {
        d.run!.rng = r.rng;
        d.run!.pending = { kind: 'shop', cards, sold: [] };
      });
      break;
    }
    case 'treasure': {
      const tal = newTalisman(r);
      update((d) => {
        d.run!.rng = r.rng;
        d.run!.pending = tal ? { kind: 'treasure', talisman: tal } : { kind: 'reward', cards: [], coins: 80, glitter: 10 };
      });
      break;
    }
    case 'event': {
      const ev = EVENTS[randomInt(r, EVENTS.length)];
      update((d) => {
        d.run!.rng = r.rng;
        d.run!.pending = { kind: 'event', event: ev };
      });
      break;
    }
  }
}

function afterBattle(
  out: { result: BattleResult; state: BattleState },
  r: RunState,
  onWin: () => NonNullable<RunState['pending']>,
  lvl: number,
) {
  update((d) => {
    const cur = d.run!;
    cur.rng = r.rng;
    syncTeam(cur, out.state);
    if (out.result === 'capture') {
      const wild = out.state.sides[1].fighters[0];
      addCreature(d, wild.defId, wild.level);
      cur.captured.push(wild.defId);
      d.stats.captures++;
    }
    const wiped = cur.team.every((m) => m.hp <= 0);
    if ((out.result === 'win' || out.result === 'capture') && !wiped) {
      cur.xp += 10 + 4 * lvl;
      const heal = talismanBonus(cur, 'healAfterFight');
      if (heal) cur.team.forEach((m) => m.hp > 0 && (m.hp = Math.min(maxHpAt(m.defId, m.level), m.hp + heal)));
      cur.pending = onWin();
      d.stats.wins++;
    } else if (out.result === 'flee' && !wiped) {
      cur.pending = null;
    } else {
      cur.pending = { kind: 'defeat' };
    }
  });
}

// ------------------------------------------------------------------ pending choices

export function takeReward(card: string | null) {
  update((d) => {
    const r = d.run!;
    const p = r.pending;
    if (p?.kind !== 'reward') return;
    r.coins += p.coins;
    r.glitter += p.glitter;
    if (p.talisman) r.talismans.push(p.talisman);
    if (card) {
      r.deck.push(card);
      r.gained.push(card);
    }
    r.pending = null;
  });
}

export function takeTreasure() {
  update((d) => {
    const r = d.run!;
    if (r.pending?.kind === 'treasure') r.talismans.push(r.pending.talisman);
    r.pending = null;
  });
}

export function restHeal() {
  update((d) => {
    const r = d.run!;
    r.team.forEach((m) => {
      const max = maxHpAt(m.defId, m.level);
      m.hp = Math.min(max, m.hp + Math.max(Math.round(max * 0.4), m.hp === 0 ? Math.round(max * 0.3) : 0));
    });
    r.pending = null;
  });
}

export function restUpgrade(deckIndex: number) {
  update((d) => {
    const r = d.run!;
    const id = r.deck[deckIndex];
    const up = support(id).upgrade;
    if (!up) return;
    r.deck[deckIndex] = up;
    const gi = r.gained.indexOf(id);
    if (gi >= 0) r.gained[gi] = up;
    r.pending = null;
  });
}

export const SHOP_REMOVE_PRICE = 60;
export const SHOP_HEAL_PRICE = 40;
export const shopPrice = (id: string) => Math.round(support(id).price * 0.8);

export function shopBuy(i: number) {
  update((d) => {
    const r = d.run!;
    const p = r.pending;
    if (p?.kind !== 'shop' || p.sold.includes(i)) return;
    const price = shopPrice(p.cards[i]);
    if (r.coins < price) return;
    r.coins -= price;
    r.deck.push(p.cards[i]);
    r.gained.push(p.cards[i]);
    p.sold.push(i);
  });
}

export function shopRemove(deckIndex: number) {
  update((d) => {
    const r = d.run!;
    if (r.coins < SHOP_REMOVE_PRICE || r.deck.length <= 6) return;
    r.coins -= SHOP_REMOVE_PRICE;
    r.deck.splice(deckIndex, 1);
  });
}

export function shopHeal() {
  update((d) => {
    const r = d.run!;
    if (r.coins < SHOP_HEAL_PRICE) return;
    r.coins -= SHOP_HEAL_PRICE;
    r.team.forEach((m) => m.hp > 0 && (m.hp = Math.min(maxHpAt(m.defId, m.level), m.hp + 25)));
  });
}

export function leavePending() {
  update((d) => (d.run!.pending = null));
}

export interface EventChoice {
  label: LText;
  apply: (r: RunState) => LText;
}

export function eventChoices(ev: string): { text: LText; choices: EventChoice[] } {
  switch (ev) {
    case 'fontaine':
      return {
        text: L('Une fontaine d’encre arc-en-ciel glougloute doucement.', 'A rainbow ink fountain gurgles softly.'),
        choices: [
          { label: L('Boire (soigne 25 PV)', 'Drink (heal 25 HP)'), apply: (r) => { r.team.forEach((m) => m.hp > 0 && (m.hp = Math.min(maxHpAt(m.defId, m.level), m.hp + 25))); return L('Tes Bestioles se sentent mieux !', 'Your Critters feel better!'); } },
          { label: L('Lancer une pièce (+40 pièces ?)', 'Toss a coin (+40 coins?)'), apply: (r) => { if (nextRandom(r) < 0.6) { r.coins += 40; return L('La fontaine te rend 40 pièces !', 'The fountain gives you 40 coins!'); } return L('Plouf. Rien ne se passe.', 'Plop. Nothing happens.'); } },
        ],
      };
    case 'coffre':
      return {
        text: L('Un coffre couvert de gribouillis. Il a l’air… vivant ?', 'A chest covered in scribbles. It looks… alive?'),
        choices: [
          { label: L('L’ouvrir', 'Open it'), apply: (r) => {
            if (nextRandom(r) < 0.55) { const tal = newTalisman(r); if (tal) { r.talismans.push(tal); return L('Un Talisman était caché dedans !', 'A Talisman was hidden inside!'); } }
            r.team.forEach((m) => m.hp > 0 && (m.hp = Math.max(1, m.hp - 10)));
            return L('Le coffre mord ! Tes Bestioles perdent 10 PV.', 'The chest bites! Your Critters lose 10 HP.');
          } },
          { label: L('Passer son chemin', 'Walk away'), apply: () => L('Prudence est mère de sûreté.', 'Better safe than sorry.') },
        ],
      };
    case 'egaree':
      return {
        text: L('Un petit dessin égaré pleure dans un coin. Il te tend une carte.', 'A little lost drawing is crying in a corner. It hands you a card.'),
        choices: [
          { label: L('Prendre la carte', 'Take the card'), apply: (r) => { const c = randomSupport(r, 1)[0]; r.deck.push(c); r.gained.push(c); return L('Nouvelle carte dans ton deck !', 'New card in your deck!'); } },
          { label: L('Lui faire un câlin (+10 Paillettes)', 'Give it a hug (+10 Glitter)'), apply: (r) => { r.glitter += 10; return L('Le dessin sourit et brille de mille paillettes.', 'The drawing smiles and sparkles with glitter.'); } },
        ],
      };
    case 'dessin':
      return {
        text: L('Un crayon magique flotte dans les airs, prêt à améliorer une carte.', 'A magic pencil floats in the air, ready to improve a card.'),
        choices: [
          { label: L('Améliorer une carte au hasard', 'Upgrade a random card'), apply: (r) => {
            const idx = r.deck.map((id, i) => [id, i] as const).filter(([id]) => support(id).upgrade);
            if (!idx.length) return L('Aucune carte à améliorer.', 'No card to upgrade.');
            const [id, i] = idx[randomInt(r, idx.length)];
            r.deck[i] = support(id).upgrade!;
            return L('Une carte de ton deck brille : elle est améliorée !', 'A card in your deck glows: it got upgraded!');
          } },
          { label: L('Le laisser tranquille', 'Leave it alone'), apply: () => L('Le crayon dessine un petit cœur et s’envole.', 'The pencil draws a little heart and flies away.') },
        ],
      };
    default:
      return {
        text: L('Un marchand ambulant propose un échange : 30 PV de tes Bestioles contre 60 pièces.', 'A traveling merchant offers a trade: 30 HP from your Critters for 60 coins.'),
        choices: [
          { label: L('Accepter', 'Accept'), apply: (r) => { r.team.forEach((m) => m.hp > 0 && (m.hp = Math.max(1, m.hp - 30))); r.coins += 60; return L('Marché conclu !', 'Deal!'); } },
          { label: L('Refuser', 'Decline'), apply: () => L('Le marchand hausse les épaules.', 'The merchant shrugs.') },
        ],
      };
  }
}

export function chooseEvent(choice: EventChoice): LText {
  let msg: LText = L('', '');
  update((d) => {
    msg = choice.apply(d.run!);
    d.run!.pending = null;
  });
  return msg;
}

/** Ends the run, pays out and clears it. */
export function finishRun(victory: boolean, keepCard: string | null) {
  update((d) => {
    const r = d.run!;
    const dg = DUNGEONS[r.dungeonId];
    const k = victory ? 1 : 0.5;
    d.coins += Math.round(r.coins * k);
    d.glitter += Math.round(r.glitter * k) + (victory ? dg.rewardGlitter : 0);
    if (victory) {
      if (!d.badges.includes(dg.badge)) d.badges.push(dg.badge);
      d.flags[`badge:${dg.badge}`] = 1;
      d.stats.runsWon++;
      if (keepCard) addSupply(d, keepCard);
    }
    for (const m of r.team) {
      const o = d.collection[m.defId];
      if (!o) continue;
      const res = addXp(o, Math.round(r.xp * (victory ? 1 : 0.6)));
      o.level = res.level;
      o.xp = res.xp;
    }
    d.run = null;
  });
}

export function runSummary(victory: boolean) {
  const r = run()!;
  const dg = DUNGEONS[r.dungeonId];
  const k = victory ? 1 : 0.5;
  return {
    coins: Math.round(r.coins * k),
    glitter: Math.round(r.glitter * k) + (victory ? dg.rewardGlitter : 0),
    xp: Math.round(r.xp * (victory ? 1 : 0.6)),
    badge: victory ? dg.badgeName : null,
  };
}
