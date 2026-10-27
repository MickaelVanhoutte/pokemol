import { backToWorld } from '../../overworld/controller';
import { save } from '../../state/game';
import { DexView } from '../views/DexView';

/** Bestiodex: the Bestioles seen and caught (players discover the others as they go). */
export function DexScreen() {
  const d = save.value;
  return (
    <DexView
      seen={d?.dex.seen ?? []}
      caught={d?.dex.caught ?? []}
      visited={(m) => !!d?.flags[`seen:${m}`] || !!d?.flags[`visit:${m}`]}
      onClose={backToWorld}
    />
  );
}
