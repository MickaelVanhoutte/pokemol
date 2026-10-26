import { L, tr } from '../../i18n';
import { monLabel } from '../../data/creatures';
import { item } from '../../data/items';
import type { Mon } from '../../engine/pk/creature';
import { giveHeld, update } from '../../state/game';
import { sfx } from '../../audio/sfx';
import { Window, YesNo } from '../paper';

/** Party creature `i` holds `id` from the bag (its old item goes back). Returns the line to show. */
export function giveToParty(i: number, id: string, mon: Mon): string {
  const old = mon.item;
  update((x) => void giveHeld(x, x.party[i], id));
  sfx.confirm();
  const vars = { n: monLabel(mon), i: tr(item(id).name), o: old ? tr(item(old).name) : '' };
  return old
    ? tr(L('{o} retourne dans le sac. {n} tient maintenant {i}.', 'The {o} went back in the bag. {n} now holds the {i}.'), vars)
    : tr(L('{n} tient maintenant {i}.', '{n} is now holding the {i}.'), vars);
}

/** "Already holding something: switch?" */
export function SwapAsk({ mon, id, onAnswer }: { mon: Mon; id: string; onAnswer: (yes: boolean) => void }) {
  return (
    <div class="view-modal">
      <Window seyes class="view-modal__text">
        {tr(L('{n} tient déjà {o}. L’échanger contre {i} ?', '{n} is already holding the {o}. Switch it for the {i}?'), {
          n: monLabel(mon), o: tr(item(mon.item!).name), i: tr(item(id).name),
        })}
      </Window>
      <YesNo onAnswer={onAnswer} />
    </div>
  );
}
