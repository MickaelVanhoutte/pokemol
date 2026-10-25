import { locale } from './i18n';
import { screen } from './state/router';
import { TitleScreen } from './ui/screens/TitleScreen';
import { SettingsScreen } from './ui/screens/SettingsScreen';
import { BattleScreen } from './ui/battle/BattleScreen';
import { NewGameScreen } from './ui/screens/NewGameScreen';
import { OverworldScreen } from './ui/screens/OverworldScreen';
import { PartyScreen } from './ui/screens/PartyScreen';
import { BagScreen } from './ui/screens/BagScreen';
import { DexScreen } from './ui/screens/DexScreen';
import { PcScreen } from './ui/screens/PcScreen';
import { ShopScreen } from './ui/screens/ShopScreen';
import { MachineScreen } from './ui/screens/MachineScreen';
import { CreditsScreen } from './ui/screens/CreditsScreen';

export function App() {
  // reading locale.value re-renders everything when the language changes
  const s = screen.value;
  return (
    <div class="app" key={locale.value}>
      {s.id === 'title' && <TitleScreen />}
      {s.id === 'newgame' && <NewGameScreen />}
      {s.id === 'overworld' && <OverworldScreen />}
      {s.id === 'settings' && <SettingsScreen back={s.back} />}
      {s.id === 'battle' && <BattleScreen key={s.props.setup.seed} {...s.props} />}
      {s.id === 'party' && <PartyScreen />}
      {s.id === 'bag' && <BagScreen />}
      {s.id === 'dex' && <DexScreen all={s.all} />}
      {s.id === 'pc' && <PcScreen />}
      {s.id === 'shop' && <ShopScreen />}
      {s.id === 'machine' && <MachineScreen />}
      {s.id === 'credits' && <CreditsScreen fromWorld={s.fromWorld} />}
    </div>
  );
}
