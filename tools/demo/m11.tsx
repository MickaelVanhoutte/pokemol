/**
 * Demo page for the owner (roadmap, milestone 6): the game's own music box (MUSIQUES), with the new tunes: the routes at night, the later routes, the bike, the boat, under the water, the legends and the Grand
 * Concours. Built by `npm run demo -- m11`.
 */
import { render } from 'preact';
import { useState } from 'preact/hooks';
import '../../src/styles/global.css';
import './demo.css';
import { App } from '../../src/app';
import { installSketch } from '../../src/ui/paper/sketch';
import { go } from '../../src/state/router';
import { sfx } from '../../src/audio/sfx';

function Demo() {
  const [started, setStarted] = useState(false);
  if (!started) {
    return (
      <div class="demo-start">
        <div class="demo-card">
          <p class="demo-eyebrow">Atelier Bestioles · démo 17</p>
          <h1>Une musique pour chaque moment</h1>
          <p>La boîte à musique du jeu (MUSIQUES, sur l’écran titre). Les sept nouveaux airs : « En route, sous les étoiles » (juste après « En route ! »), puis, avant « Bonne nuit, petite artiste » : les routes de la fin du voyage, le vélo, le bateau, sous l’eau, les légendes et le Grand Concours. Dans le jeu, ils jouent tout seuls au bon moment.</p>
          <button class="demo-go" onClick={() => { sfx.confirm(); go({ id: 'jukebox' }); setStarted(true); }}>Ouvrir la boîte à musique</button>
        </div>
      </div>
    );
  }
  return <App />;
}

installSketch();
render(<Demo />, document.getElementById('app')!);
