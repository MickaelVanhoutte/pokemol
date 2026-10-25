import { L, tr, type LText } from '../../i18n';
import { creature } from '../../data/creatures';
import { item } from '../../data/items';
import { move } from '../../data/moves';
import { STAT_NAMES } from '../../data/types';
import type { StageKey } from '../../data/schema';
import type { BattleEvent, BattleState, Side } from '../../engine/pk/battle';

const f = (text: LText, vars: Record<string, string | number> = {}) => tr(text, vars);

const ACC: Record<'acc' | 'eva', LText> = { acc: L('Précision', 'accuracy'), eva: L('Esquive', 'evasiveness') };
const statName = (k: StageKey) => tr(k === 'acc' || k === 'eva' ? ACC[k] : STAT_NAMES[k]);

/** Display name of a side's creature at a party index ("Zigzou sauvage", "Clapotin ennemi"). */
export function monName(st: BattleState, side: Side, idx = st.sides[side].active): string {
  const m = st.sides[side].party[idx];
  if (!m) return '';
  const n = tr(creature(m.species).name);
  if (side === 0) return n;
  return st.kind === 'wild' ? f(L('{n} sauvage', 'Wild {n}'), { n }) : f(L('{n} ennemi', 'Foe {n}'), { n });
}

/** Text lines for one battle event. */
export function describe(e: BattleEvent, st: BattleState): string[] {
  const nm = (side: Side) => monName(st, side);
  const mine = (idx: number) => tr(creature(st.sides[0].party[idx].species).name);
  switch (e.t) {
    case 'sendOut':
      if (e.side === 1) {
        if (st.kind === 'wild') return [f(L('Un {n} sauvage apparaît !', 'A wild {n} appeared!'), { n: tr(creature(st.sides[1].party[e.idx].species).name) })];
        return [f(L('{t} envoie {n} !', '{t} sent out {n}!'), { t: tr(st.sides[1].name), n: tr(creature(st.sides[1].party[e.idx].species).name) })];
      }
      return [f(L('Vas-y, {n} !', 'Go, {n}!'), { n: mine(e.idx) })];
    case 'withdraw':
      return e.side === 0 ? [f(L('{n}, reviens !', '{n}, come back!'), { n: mine(e.idx) })] : [];
    case 'move':
      return [f(L('{n} utilise {m} !', '{n} used {m}!'), { n: nm(e.side), m: tr(move(e.move).name) })];
    case 'miss':
      return [f(L('{n} rate son attaque !', '{n}’s attack missed!'), { n: nm(e.side) })];
    case 'fail':
      return [tr(L('Mais cela échoue !', 'But it failed!'))];
    case 'noEffect':
      return [f(L('Ça n’affecte pas {n}…', 'It doesn’t affect {n}…'), { n: nm(e.side) })];
    case 'damage': {
      const lines: string[] = [];
      if (e.crit) lines.push(tr(L('Coup critique !', 'A critical hit!')));
      if (e.eff !== undefined && e.eff > 1) lines.push(tr(L('C’est super efficace !', 'It’s super effective!')));
      if (e.eff !== undefined && e.eff > 0 && e.eff < 1) lines.push(tr(L('Ce n’est pas très efficace…', 'It’s not very effective…')));
      return lines;
    }
    case 'hits':
      return [f(L('Touché {n} fois !', 'Hit {n} time(s)!'), { n: e.count })];
    case 'heal':
      return [f(L('{n} récupère des PV !', '{n} regained health!'), { n: nm(e.side) })];
    case 'status': {
      const t = {
        sleep: L('{n} s’endort !', '{n} fell asleep!'),
        paralyze: L('{n} est paralysé ! Il aura du mal à attaquer !', '{n} is paralyzed! It may be unable to move!'),
        poison: L('{n} est empoisonné !', '{n} was poisoned!'),
        burn: L('{n} est brûlé !', '{n} was burned!'),
      }[e.status];
      return [f(t, { n: nm(e.side) })];
    }
    case 'already':
      return [f(L('{n} a déjà un problème de statut !', '{n} already has a status problem!'), { n: nm(e.side) })];
    case 'stage': {
      if (e.capped) return [f(L('{s} de {n} ne peut plus changer !', '{n}’s {s} won’t go any further!'), { s: statName(e.stat), n: nm(e.side) })];
      const up = e.delta > 0;
      const big = Math.abs(e.delta) >= 2;
      const t = up
        ? big ? L('{s} de {n} augmente beaucoup !', '{n}’s {s} rose sharply!') : L('{s} de {n} augmente !', '{n}’s {s} rose!')
        : big ? L('{s} de {n} baisse beaucoup !', '{n}’s {s} harshly fell!') : L('{s} de {n} baisse !', '{n}’s {s} fell!');
      return [f(t, { s: statName(e.stat), n: nm(e.side) })];
    }
    case 'confuse':
      return [f(L('{n} devient confus !', '{n} became confused!'), { n: nm(e.side) })];
    case 'isConfused':
      return [f(L('{n} est confus…', '{n} is confused…'), { n: nm(e.side) })];
    case 'confusedHit':
      return [tr(L('Il se blesse dans sa confusion !', 'It hurt itself in its confusion!'))];
    case 'snapOut':
      return [f(L('{n} n’est plus confus !', '{n} snapped out of confusion!'), { n: nm(e.side) })];
    case 'flinch':
      return [f(L('{n} a peur et ne peut pas attaquer !', '{n} flinched!'), { n: nm(e.side) })];
    case 'asleep':
      return [f(L('{n} dort profondément.', '{n} is fast asleep.'), { n: nm(e.side) })];
    case 'wake':
      return [f(L('{n} se réveille !', '{n} woke up!'), { n: nm(e.side) })];
    case 'paralyzed':
      return [f(L('{n} est paralysé ! Il ne peut pas attaquer !', '{n} is paralyzed! It can’t move!'), { n: nm(e.side) })];
    case 'residual':
      return [f(e.status === 'poison' ? L('{n} souffre du poison !', '{n} is hurt by poison!') : L('{n} souffre de sa brûlure !', '{n} is hurt by its burn!'), { n: nm(e.side) })];
    case 'recoil':
      return [f(L('{n} est blessé par le contrecoup !', '{n} is hit with recoil!'), { n: nm(e.side) })];
    case 'drain':
      return [];
    case 'rest':
      return [f(L('{n} fait une bonne sieste !', '{n} went to sleep and became healthy!'), { n: nm(e.side) })];
    case 'faint':
      return [f(L('{n} est K.O. !', '{n} fainted!'), { n: monName(st, e.side, e.idx) })];
    case 'xp':
      return [f(L('{n} gagne {x} points d’expérience !', '{n} gained {x} Exp. Points!'), { n: mine(e.idx), x: e.amount })];
    case 'levelUp':
      return [f(L('{n} monte au N.{l} !', '{n} grew to Lv. {l}!'), { n: mine(e.idx), l: e.level })];
    case 'learned':
      return [f(L('{n} apprend {m} !', '{n} learned {m}!'), { n: mine(e.idx), m: tr(move(e.move).name) })];
    case 'learnPrompt':
      return [f(L('{n} veut apprendre {m}…', '{n} wants to learn {m}…'), { n: mine(e.idx), m: tr(move(e.move).name) })];
    case 'forgot':
      return [f(L('1, 2 et… Tadaa ! {n} oublie {o} et apprend {m} !', '1, 2 and… Poof! {n} forgot {o} and learned {m}!'), { n: mine(e.idx), o: tr(move(e.old).name), m: tr(move(e.move).name) })];
    case 'gaveUp':
      return [f(L('{n} n’apprend pas {m}.', '{n} did not learn {m}.'), { n: mine(e.idx), m: tr(move(e.move).name) })];
    case 'useItem': {
      const lines = [f(L('Tu utilises {i} sur {n} !', 'You used {i} on {n}!'), { i: tr(item(e.item).name), n: mine(e.target) })];
      if (e.amount) lines.push(f(L('{n} récupère {x} PV.', '{n} recovered {x} HP.'), { n: mine(e.target), x: e.amount }));
      return lines;
    }
    case 'berry': {
      const lines = [f(L('{n} mange sa {i} !', '{n} ate its {i}!'), { n: nm(e.side), i: tr(item(e.item).name) })];
      if (e.amount) lines.push(f(L('{n} récupère des PV !', '{n} regained health!'), { n: nm(e.side) }));
      if (e.cured === 'confusion') lines.push(f(L('{n} n’est plus confus !', '{n} snapped out of confusion!'), { n: nm(e.side) }));
      else if (e.cured) {
        const t = {
          sleep: L('{n} se réveille !', '{n} woke up!'),
          paralyze: L('{n} n’est plus paralysé !', '{n} is no longer paralyzed!'),
          poison: L('{n} n’est plus empoisonné !', '{n} is cured of its poison!'),
          burn: L('{n} n’est plus brûlé !', '{n}’s burn was healed!'),
        }[e.cured];
        lines.push(f(t, { n: nm(e.side) }));
      }
      return lines;
    }
    case 'leftovers':
      return [f(L('{n} grignote son {i} et récupère des PV.', '{n} restored a little HP using its {i}!'), { n: nm(e.side), i: tr(item(e.item).name) })];
    case 'ball':
      return e.caught
        ? [f(L('Hop ! {n} est attrapé !', 'Gotcha! {n} was caught!'), { n: tr(creature(st.sides[1].party[st.sides[1].active].species).name) })]
        : [[tr(L('Oh non ! Il s’est libéré !', 'Oh no! It broke free!')), tr(L('Raah ! Presque !', 'Aargh! Almost had it!')), tr(L('Mince ! Si près du but !', 'Shoot! It was so close!')), tr(L('Mince ! Si près du but !', 'Shoot! It was so close!'))][e.shakes]];
    case 'blocked':
      return [tr(L('Le dresseur bloque la balle ! On ne vole pas les Bestioles des autres !', 'The trainer blocked the ball! Don’t be a thief!'))];
    case 'run':
      return [e.ok ? tr(L('Tu prends la fuite !', 'Got away safely!')) : tr(L('Impossible de fuir !', 'Can’t escape!'))];
    case 'cantRun':
      return [tr(L('Impossible de fuir un combat de dresseur !', 'No running from a trainer battle!'))];
    case 'end':
      if (e.result === 'win' && st.kind === 'trainer') return [f(L('Tu as battu {t} !', 'You defeated {t}!'), { t: tr(st.sides[1].name) })];
      if (e.result === 'lose') return [tr(L('Tu n’as plus de Bestiole en forme…', 'You have no more Critters that can fight…'))];
      return [];
  }
}

/** How long (ms) a message stays before the next event. */
export function eventDuration(e: BattleEvent): number {
  switch (e.t) {
    case 'damage': return e.crit || (e.eff !== undefined && e.eff !== 1) ? 1100 : 750;
    case 'ball': return 900 + e.shakes * 650;
    case 'faint': return 1000;
    case 'xp': return 1100;
    case 'berry': return 1400;
    case 'levelUp': return 1300;
    case 'sendOut': return 1000;
    case 'drain': return 300;
    default: return 950;
  }
}
