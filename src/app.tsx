import { locale } from './i18n';
import { screen } from './state/router';
import { TitleScreen } from './ui/screens/TitleScreen';
import { GalleryScreen } from './ui/screens/GalleryScreen';
import { SettingsScreen } from './ui/screens/SettingsScreen';
import { BattleScreen } from './ui/battle/BattleScreen';
import { NewGameScreen } from './ui/screens/NewGameScreen';
import { OverworldScreen } from './ui/screens/OverworldScreen';
import { CollectionScreen } from './ui/screens/CollectionScreen';
import { ShopScreen } from './ui/screens/ShopScreen';
import { GachaScreen } from './ui/screens/GachaScreen';
import { DungeonScreen } from './ui/screens/DungeonScreen';
import { CreditsScreen } from './ui/screens/CreditsScreen';

export function App() {
  // reading locale.value re-renders everything when the language changes
  const s = screen.value;
  return (
    <div class="app" key={locale.value}>
      {s.id === 'title' && <TitleScreen />}
      {s.id === 'newgame' && <NewGameScreen />}
      {s.id === 'overworld' && <OverworldScreen />}
      {s.id === 'gallery' && <GalleryScreen />}
      {s.id === 'settings' && <SettingsScreen back={s.back} />}
      {s.id === 'battle' && <BattleScreen key={s.props.setup.seed} {...s.props} />}
      {s.id === 'collection' && <CollectionScreen back={s.back} />}
      {s.id === 'shop' && <ShopScreen />}
      {s.id === 'gacha' && <GachaScreen />}
      {s.id === 'dungeon' && <DungeonScreen />}
      {s.id === 'credits' && <CreditsScreen />}
    </div>
  );
}
