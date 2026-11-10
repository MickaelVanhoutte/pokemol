/**
 * Demo page for the owner (roadmap, milestone 10): New Game+ and challenge rules. The real game on its title screen,
 * with a finished game in slot 2: NOUVELLE PARTIE > Partie 2 > NOUVELLE PARTIE +, then the rules on the prologue's
 * last page. Built by `npm run demo -- m15`.
 */
import { render } from 'preact';
import { useState } from 'preact/hooks';
import '../../src/styles/global.css';
import './demo.css';
import { App } from '../../src/app';
import '../../src/story';
import { installSketch } from '../../src/ui/paper/sketch';
import { createMon } from '../../src/engine/pk/creature';
import { SAVE_VERSION } from '../../src/save/schema';
import { DEFAULT_LOOKS } from '../../src/data/appearance';
import { sfx } from '../../src/audio/sfx';

/** A finished game in slot 2, its lead a sparkly Dragobraise nicknamed « Flamme ». */
function finishedGame() {
  const key = 'atelier-bestioles.save.2';
  try {
    if (localStorage.getItem(key)) return;
    const lead = { ...createMon('025', 52, { rng: 7 }), nickname: 'Flamme', shiny: true };
    localStorage.setItem(key, JSON.stringify({
      version: SAVE_VERSION, createdAt: Date.now(), playMs: 36_000_000,
      player: { name: 'Léa', avatar: 0, look: DEFAULT_LOOKS.f, gender: 'f', map: 'galerie', x: 11, y: 14, facing: 'down' },
      rivalName: 'Feutre', respawn: { map: 'maison', x: 4, y: 5 }, flags: { ending: 1, intro: 1, rival1: 1 },
      party: [lead, createMon('024', 50, { rng: 8 })], boxes: Array.from({ length: 8 }, () => []), bag: { potion: 3 }, money: 9000,
      dex: { seen: ['001', '002', '003', '012', '013', '025'], caught: ['025'] },
      badges: ['pastel', 'plume', 'aquarelle', 'fluo', 'braise', 'paillette', 'gouache', 'encre'], stats: { battles: 300, captures: 40 },
    }));
  } catch {
    // no storage: the demo still opens
  }
}

function Demo() {
  const [started, setStarted] = useState(false);
  if (!started) {
    return (
      <div class="demo-start">
        <div class="demo-card">
          <p class="demo-eyebrow">Atelier Bestioles · démo 21</p>
          <h1>Nouvelle partie + et règles de défi</h1>
          <p>Le vrai jeu, sur l’écran titre, avec une partie terminée en Partie 2. Touche l’écran, puis NOUVELLE PARTIE, Partie 2 : une partie finie propose NOUVELLE PARTIE +. Tu gardes les pages vues du Bestiodex, les Bestioles pailletées sont trois fois plus fréquentes, et un œuf de ta Bestiole de tête t’attend au PC. À la fin du prologue, choisis des règles de défi si tu veux (touche une règle pour lire ce qu’elle fait).</p>
          <button class="demo-go" onClick={() => { sfx.confirm(); finishedGame(); setStarted(true); }}>Lancer</button>
        </div>
      </div>
    );
  }
  return <App />;
}

installSketch();
render(<Demo />, document.getElementById('app')!);
