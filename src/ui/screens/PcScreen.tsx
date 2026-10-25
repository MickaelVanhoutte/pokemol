import { backToWorld } from '../../overworld/controller';
import { save, update } from '../../state/game';
import { PcView } from '../views/PcView';

/** PC box: move creatures between the party (max 6) and storage. */
export function PcScreen() {
  const d = save.value!;
  return (
    <PcView
      party={d.party}
      box={d.box}
      onDeposit={(i) => update((x) => void x.box.push(...x.party.splice(i, 1)))}
      onWithdraw={(i) => update((x) => void x.party.push(...x.box.splice(i, 1)))}
      onClose={backToWorld}
    />
  );
}
