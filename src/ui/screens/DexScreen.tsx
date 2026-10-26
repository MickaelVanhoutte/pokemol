import { backToWorld } from '../../overworld/controller';
import { save } from '../../state/game';
import { go } from '../../state/router';
import { DexView } from '../views/DexView';

/** Bestiodex. From the title screen (`all`) every drawing is shown, in game only seen/caught ones. */
export function DexScreen({ all }: { all?: boolean }) {
  const d = save.value;
  return (
    <DexView
      seen={d?.dex.seen ?? []}
      caught={d?.dex.caught ?? []}
      all={all}
      visited={(m) => all || !!d?.flags[`seen:${m}`] || !!d?.flags[`visit:${m}`]}
      onClose={() => (all ? go({ id: 'title' }) : backToWorld())}
    />
  );
}
