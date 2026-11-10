/**
 * Demo page for the owner (roadmap, milestone 4): the real game at midnight, a button per town to meet its person of
 * the night, and the hour to change: people who keep hours come and go. Built by `npm run demo -- m10`.
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
import { enterWorld, updateTime, warpTo } from '../../src/overworld/controller';
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
    d.party = [createMon('021', 22, { rng: 3 })];
    d.flags.rival1 = 1;
    // nobody challenges you and no wild Bestiole jumps out: the demo is about walking around
    for (const id of Object.keys(TRAINERS)) d.flags[`tr:${id}`] = 1;
    d.repel = 99999;
    d.clockShift = shiftTo(0);
    Object.assign(d.player, { map: 'bourg', x: 14, y: 14, facing: 'up' });
  });
  enterWorld();
}

type Spot = { label: string; hint: string; go: () => Promise<void> };

const TOWNS: [string, string, string, number, number][] = [
  ['Bourg-Gribouille', 'Une fille compte les étoiles (les enfants rentrent)', 'bourg', 14, 14],
  ['Ville-Pastel', 'Un peintre de la lune', 'ville', 16, 12],
  ['Village-Plume', 'La grand-mère parle autrement la nuit', 'plume', 13, 3],
  ['Port-Aquarelle', 'Un marin sur le quai', 'port', 17, 16],
  ['Ville-Feutre', 'L’allumeur de lampadaires (dès le soir)', 'feutre', 12, 12],
  ['Village-Braise', 'La boulangère avant l’aube', 'braise', 13, 11],
  ['Bourg-Paillette', 'Une fille regarde les étoiles', 'paillette', 16, 11],
  ['Jardin-Gouache', 'L’arroseuse au clair de lune', 'gouache', 15, 12],
  ['Cité-Encre', 'Un poète sous le lampadaire', 'encre', 11, 7],
];
const SPOTS: Spot[] = TOWNS.map(([label, hint, map, x, y]) => ({ label, hint, go: () => warpTo({ map, x, y, facing: 'up' }) }));

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
      <p class="demo-sheet__title">Les gens de la nuit</p>
      {SPOTS.map((s) => (
        <button class="demo-scene" key={s.label} onClick={() => run(s)}>
          <span class="demo-scene__label">{s.label}</span>
          <span class="demo-scene__hint">{s.hint}</span>
        </button>
      ))}
      <div class="demo-opt">
        <span>L’heure (les gens de la nuit arrivent, les enfants rentrent)</span>
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
          <p class="demo-eyebrow">Atelier Bestioles · démo 16</p>
          <h1>Les gens de la nuit</h1>
          <p>Le vrai jeu, à minuit. Dans chaque ville, quelqu’un ne sort que la nuit (une fille qui compte les étoiles, un poète, la boulangère avant l’aube…), pendant que les enfants rentrent se coucher. Change l’heure avec le panneau : sans bouger, tu vois les gens arriver ou partir (en moins de 30 secondes).</p>
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
