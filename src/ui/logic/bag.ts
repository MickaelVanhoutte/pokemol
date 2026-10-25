import { ITEMS, item } from '../../data/items';
import type { ItemDef } from '../../data/schema';
import { maxHp, type Mon } from '../../engine/pk/creature';

export type Pocket = 'items' | 'balls' | 'berries' | 'key';
export const POCKETS: Pocket[] = ['items', 'balls', 'berries', 'key'];

export function pocketOf(def: ItemDef): Pocket {
  return def.kind === 'ball' ? 'balls' : def.kind === 'berry' ? 'berries' : def.kind === 'key' ? 'key' : 'items';
}

/** Items of one pocket the player owns, in catalog order. */
export function pocketItems(bag: Record<string, number>, pocket: Pocket): ItemDef[] {
  return ITEMS.filter((it) => (bag[it.id] ?? 0) > 0 && pocketOf(it) === pocket);
}

/** Same rules as in battle (`itemUsable`): heal a hurt one, cure a status, revive a fainted one, eat a berry. */
export function canUseOn(itemId: string, m: Mon): boolean {
  const def = item(itemId);
  if (def.kind === 'heal') return m.hp > 0 && m.hp < maxHp(m);
  if (def.kind === 'status') return m.hp > 0 && !!m.status;
  if (def.kind === 'revive') return m.hp <= 0;
  if (def.kind === 'berry') return m.hp > 0 && ((def.amount > 0 && m.hp < maxHp(m)) || (!!m.status && !!def.cures?.includes(m.status)));
  return false;
}

/** Applies a healing item outside battle (mutates the creature). Returns false if it has no effect. */
export function useOn(itemId: string, m: Mon): boolean {
  if (!canUseOn(itemId, m)) return false;
  const def = item(itemId);
  if (def.kind === 'heal') m.hp = Math.min(maxHp(m), m.hp + def.amount);
  if (def.kind === 'status') {
    m.status = null;
    m.sleepTurns = 0;
  }
  if (def.kind === 'revive') {
    m.hp = Math.max(1, Math.floor((maxHp(m) * def.amount) / 100));
    m.status = null;
  }
  if (def.kind === 'berry') {
    m.hp = Math.min(maxHp(m), m.hp + def.amount);
    if (m.status && def.cures?.includes(m.status)) {
      m.status = null;
      m.sleepTurns = 0;
    }
  }
  return true;
}
