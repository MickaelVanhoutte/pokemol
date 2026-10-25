import { t, tr } from '../../i18n';
import { creature } from '../../data/creatures';
import { support } from '../../data/supportCards';
import type { BattleEvent, BattleState, Side } from '../../engine/battle/types';

export function fighterName(st: BattleState, side: Side, fi: number): string {
  const f = st.sides[side].fighters[fi];
  if (!f) return '';
  const n = tr(creature(f.defId).name);
  return side === 1 && st.kind === 'wild' ? t('battle.wild', { name: n }) : n;
}

function sideName(st: BattleState, side: Side): string {
  if (side === 1 && st.kind === 'wild') return fighterName(st, 1, 0);
  return tr(st.sides[side].name);
}

/** Text lines for one battle event (empty when the event is only animated). */
export function describe(e: BattleEvent, st: BattleState): string[] {
  const nm = (side: Side, f: number) => fighterName(st, side, f);
  switch (e.t) {
    case 'turn':
      return [e.side === 0 ? t('battle.yourTurn') : t('battle.theirTurn', { name: sideName(st, 1) })];
    case 'attack':
      return [t('battle.attack', { name: nm(e.side, e.f), attack: tr(creature(st.sides[e.side].fighters[e.f].defId).attacks[e.attack].name) })];
    case 'damage': {
      const lines: string[] = [];
      if (e.weak) lines.push(t('battle.weak'));
      if (e.resist) lines.push(t('battle.resist'));
      if (e.protected) lines.push(t('battle.protected', { n: e.protected }));
      lines.push(e.amount ? t('battle.damage', { name: nm(e.side, e.f), n: e.amount }) : t('battle.noDamage', { name: nm(e.side, e.f) }));
      return lines;
    }
    case 'coin':
      return [(e.heads ? t('battle.heads') : t('battle.tails')) + (e.lucky ? ` ${t('battle.lucky')}` : '')];
    case 'status':
      return [t(`battle.status.${e.status}`, { name: nm(e.side, e.f) })];
    case 'wake':
      return [t('battle.wake', { name: nm(e.side, e.f) })];
    case 'fail':
      return [t(`battle.fail.${e.reason}`, { name: nm(e.side, e.f) })];
    case 'ko':
      return [t('battle.ko', { name: nm(e.side, e.f) })];
    case 'energy':
      return [t('battle.energy', { name: nm(e.side, e.f), n: e.amount })];
    case 'energyLoss':
      return [t('battle.energyLoss', { name: nm(e.side, e.f), n: e.amount })];
    case 'play':
      return [e.side === 0
        ? t('battle.play.you', { card: tr(support(e.card).name) })
        : t('battle.play.them', { who: sideName(st, 1), card: tr(support(e.card).name) })];
    case 'switch':
      return [t('battle.switchIn', { name: nm(e.side, e.to) })];
    case 'discard':
      return [e.side === 0
        ? t('battle.discard.you', { card: tr(support(e.card).name) })
        : t('battle.discard.them', { who: sideName(st, 1), card: tr(support(e.card).name) })];
    case 'heal':
      return [t('battle.heal', { name: nm(e.side, e.f), n: e.amount })];
    case 'cure':
      return [t('battle.cure', { name: nm(e.side, e.f) })];
    case 'protect':
      return [t('battle.protect', { name: nm(e.side, e.f) })];
    case 'noRetreat':
      return [t('battle.noRetreat', { name: nm(e.side, e.f) })];
    case 'atkBonus':
      return [t('battle.atkBonus', { n: e.amount })];
    case 'revive':
      return [t('battle.revive', { name: nm(e.side, e.f), n: e.hp })];
    case 'reshuffle':
      return [e.side === 0 ? t('battle.reshuffle.you') : t('battle.reshuffle.them', { who: sideName(st, 1) })];
    case 'chooseActive':
      return e.side === 0 ? [t('battle.chooseActive')] : [];
    case 'capture':
      return [e.success ? t('battle.capture.ok', { name: tr(creature(st.sides[1].fighters[0].defId).name) }) : t('battle.capture.fail', { name: tr(creature(st.sides[1].fighters[0].defId).name) })];
    case 'flee':
      return [t('battle.flee')];
    case 'end':
      return [t(`battle.end.${e.result}`)];
    case 'draw':
    case 'lucky':
      return [];
  }
}

/** How long the UI lingers on an event (ms). */
export function eventDuration(e: BattleEvent): number {
  switch (e.t) {
    case 'draw': return e.side === 0 ? 180 : 0;
    case 'lucky': return 0;
    case 'turn': return 750;
    case 'coin': return 1100;
    case 'damage': return 850;
    case 'ko': return 950;
    case 'capture': return 1400;
    case 'energy': return 450;
    case 'end': return 700;
    default: return 650;
  }
}
