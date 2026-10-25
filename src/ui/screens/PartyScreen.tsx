import { backToWorld } from '../../overworld/controller';
import { save, update } from '../../state/game';
import { PartyView } from '../views/PartyView';

/** Party from the start menu: summaries and order (the first one leads battles). */
export function PartyScreen() {
  const d = save.value!;
  return (
    <PartyView
      party={d.party}
      mode="field"
      onSwap={(i, j) => update((x) => { [x.party[i], x.party[j]] = [x.party[j], x.party[i]]; })}
      onClose={backToWorld}
    />
  );
}
