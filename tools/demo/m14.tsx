/**
 * Demo page for the owner (roadmap, milestone 9): the weather. The real game on Route 3 with a button per sky (rain,
 * snow, wind, fog, clear); walk into the tall grass for a battle under it. Built by `npm run demo -- m14`.
 */
import { render } from 'preact';
import { useState } from 'preact/hooks';
import '../../src/styles/global.css';
import './demo.css';
import { App } from '../../src/app';
import '../../src/story';
import { installSketch } from '../../src/ui/paper/sketch';
import { newGame, update } from '../../src/state/game';
import { screen } from '../../src/state/router';
import { enterWorld, getGame, updateTime, warpTo } from '../../src/overworld/controller';
import type { Sky } from '../../src/state/weather';
import { createMon } from '../../src/engine/pk/creature';
import { DEFAULT_LOOKS } from '../../src/data/appearance';
import { TRAINERS } from '../../src/data/trainers';
import { shiftTo } from '../../src/state/clock';
import { prefs, setPref } from '../../src/state/prefs';
import { stopMusic } from '../../src/audio/music';
import { sfx } from '../../src/audio/sfx';

function startGame() {
  newGame('Léa', DEFAULT_LOOKS.f, 'f', 'Feutre');
  update((d) => {
    d.party = [createMon('021', 22, { rng: 3 }), createMon('013', 20, { rng: 4 })];
    d.flags.rival1 = 1;
    // nobody challenges you and no wild Bestiole jumps out: the demo is about walking around
    for (const id of Object.keys(TRAINERS)) d.flags[`tr:${id}`] = 1;
    d.repel = 0;
    d.clockShift = shiftTo(12);
    Object.assign(d.player, { map: 'route3', x: 10, y: 10, facing: 'down' });
  });
  enterWorld();
}

type Spot = { label: string; hint: string; go: () => Promise<void> };

const SKIES: [Sky, string, string][] = [
  ['rain', 'Pluie', 'Des traits de crayon tombent, la lumière grisaille ; en combat, il pleut'],
  ['snow', 'Neige', 'Des flocons de papier ; en combat, la grêle'],
  ['wind', 'Vent', 'Des rafales traversent la route'],
  ['fog', 'Brouillard', 'Des bancs de brume passent'],
  ['clear', 'Beau temps', 'Le ciel d’habitude'],
];
const SPOTS: Spot[] = SKIES.map(([sky, label, hint]) => ({ label, hint, go: async () => {
  await warpTo({ map: 'route3', x: 10, y: 10, facing: 'down' });
  getGame().sky = sky;
} }));

const HOURS: [number, string][] = [[12, 'Midi'], [20, '20 h'], [0, 'Minuit']];

function setHour(h: number) {
  update((d) => (d.clockShift = shiftTo(h)));
  updateTime();
}

function Panel() {
  const [open, setOpen] = useState(true);
  const [, redraw] = useState(0);
  if (screen.value.id !== 'overworld') return null;
  if (!open) return <button class="demo-fab" onClick={() => setOpen(true)}>Démo</button>;
  const run = (s: Spot) => { setOpen(false); void s.go(); };
  return (
    <div class="demo-sheet" role="dialog" aria-label="Démo">
      <p class="demo-sheet__title">La météo</p>
      {SPOTS.map((s) => (
        <button class="demo-scene" key={s.label} onClick={() => run(s)}>
          <span class="demo-scene__label">{s.label}</span>
          <span class="demo-scene__hint">{s.hint}</span>
        </button>
      ))}
      <div class="demo-opt">
        <span>L’heure</span>
        <div class="demo-seg">
          {HOURS.map(([h, l]) => <button key={h} onClick={() => { setHour(h); setOpen(false); }}>{l}</button>)}
        </div>
      </div>
      <button class="demo-scene" onClick={() => setOpen(false)}>
        <span class="demo-scene__label">Marcher</span>
        <span class="demo-scene__hint">Le jeu, librement (le bouton Démo revient en haut)</span>
      </button>
      <div class="demo-opt">
        <span>Son</span>
        <div class="demo-seg">
          {[true, false].map((v) => (
            <button key={String(v)} class={prefs.value.sound === v ? 'is-on' : ''} onClick={() => { setPref('sound', v); setPref('music', v); if (!v) stopMusic(); redraw((n) => n + 1); }}>{v ? 'Oui' : 'Non'}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Demo() {
  const [started, setStarted] = useState(false);
  if (!started) {
    return (
      <div class="demo-start">
        <div class="demo-card">
          <p class="demo-eyebrow">Atelier Bestioles · démo 20</p>
          <h1>La météo</h1>
          <p>Le vrai jeu, sur la Route 3. Chaque jour, chaque endroit a son temps : beau, pluie, vent, brouillard, et la neige là où il fait froid (la carte de la région le dit). Choisis un temps avec le panneau, puis marche dans les hautes herbes : la pluie et la grêle arrivent jusque dans le combat. Les premiers endroits du voyage gardent toujours le beau temps.</p>
          <button class="demo-go" onClick={() => { sfx.confirm(); startGame(); setStarted(true); }}>Lancer</button>
          <p class="demo-small">Le son démarre avec ce bouton.</p>
        </div>
      </div>
    );
  }
  return (
    <>
      <App />
      <Panel />
    </>
  );
}

installSketch();
render(<Demo />, document.getElementById('app')!);
