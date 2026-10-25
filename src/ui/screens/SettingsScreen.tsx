import { persist } from '../../state/game';
import { go, type Screen } from '../../state/router';
import { OptionsView } from '../views/OptionsView';

export function SettingsScreen({ back }: { back: Screen }) {
  const inGame = back.id === 'overworld';
  return (
    <OptionsView
      inGame={inGame}
      onClose={() => go(back)}
      onTitle={() => { persist(); go({ id: 'title' }); }}
    />
  );
}
