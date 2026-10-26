import { render } from 'preact';
import '@fontsource/inter/400.css';
import '@fontsource/inter/400-italic.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/800.css';
import './styles/global.css';
import { App } from './app';
import './story';
import { startPwa } from './state/pwa';
import { save } from './state/game';
import { screen } from './state/router';

render(<App />, document.getElementById('app')!);
startPwa();

// play time: counts while a game is open and the page is visible (saved with the game)
setInterval(() => {
  const d = save.value;
  const at = screen.value.id;
  if (d && at !== 'title' && at !== 'newgame' && document.visibilityState === 'visible') d.playMs += 1000;
}, 1000);
