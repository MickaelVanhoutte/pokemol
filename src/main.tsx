import { render } from 'preact';
import '@fontsource/inter/400.css';
import '@fontsource/inter/400-italic.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/800.css';
import './styles/global.css';
import { App } from './app';
import './story';
import { preloadMusic } from './audio/music';
import { startPwa } from './state/pwa';
import { save } from './state/game';
import { screen } from './state/router';
import { installSketch } from './ui/paper/sketch';

// the hand-drawn frames, hatching and buttons of the interface
installSketch();
render(<App />, document.getElementById('app')!);
startPwa();
// the recorded music, in the background once the title screen is up
setTimeout(() => void preloadMusic(), 1500);

// play time: counts while a game is open and the page is visible (saved with the game)
setInterval(() => {
  const d = save.value;
  const at = screen.value.id;
  if (d && at !== 'title' && at !== 'newgame' && document.visibilityState === 'visible') d.playMs += 1000;
}, 1000);
