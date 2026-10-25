import type { Mon } from '../../engine/pk/creature';
import { PARTY_MAX } from '../../save/schema';

/** You can't store your last creature able to fight. */
export function canDeposit(party: Mon[], i: number): boolean {
  return party.length > 1 && party.some((m, j) => j !== i && m.hp > 0);
}

export function canWithdraw(party: Mon[]): boolean {
  return party.length < PARTY_MAX;
}
