import { backToWorld } from '../../overworld/controller';
import { save, spareBox, update } from '../../state/game';
import { PcView } from '../views/PcView';

/** PC boxes: move creatures between the party (max 6) and storage. */
export function PcScreen() {
  const d = save.value!;
  return (
    <PcView
      party={d.party}
      boxes={d.boxes}
      onDeposit={(i, b) => update((x) => {
        x.boxes[b].push(...x.party.splice(i, 1));
        spareBox(x);
      })}
      onWithdraw={(b, i) => update((x) => void x.party.push(...x.boxes[b].splice(i, 1)))}
      onClose={backToWorld}
    />
  );
}
