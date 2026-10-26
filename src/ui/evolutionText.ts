import { L, tr } from '../i18n';
import { creature } from '../data/creatures';
import { item } from '../data/items';
import type { SpeciesDef } from '../data/schema';

/** One line per way to evolve: « Papivole au N.10 », « X avec Crayon Magique Feu », « Y avec beaucoup d’amitié ». */
export function evolutionHints(sp: SpeciesDef): string[] {
  return (sp.evolutions ?? []).map((r) => {
    const n = tr(creature(r.to).name);
    if (r.item) return tr(L('{n} avec {i}', '{n} with a {i}'), { n, i: tr(item(r.item).name) });
    if (r.friendship) return tr(L('{n} avec beaucoup d’amitié', '{n} with a great friendship'), { n });
    return tr(L('{n} au N.{l}', '{n} at Lv{l}'), { n, l: r.level ?? 0 });
  });
}
