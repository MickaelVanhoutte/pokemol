/**
 * Demo page for the owner (M2b): the real game, with a panel to try the living world: blades of grass in
 * tall grass, dust when landing from a ledge, rings behind the boat, shadows, doors opening and stepping
 * out, the air of each kind of place, and the time of day changing softly.
 * Built by `npm run demo -- m2b`.
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
import { enterWorld, getGame, updateTime, wait, warpTo } from '../../src/overworld/controller';
import { createMon } from '../../src/engine/pk/creature';
import { DEFAULT_LOOKS } from '../../src/data/appearance';
import { TRAINERS } from '../../src/data/trainers';
import { shiftTo } from '../../src/state/clock';
import type { Dir } from '../../src/save/schema';
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
    d.clockShift = shiftTo(12);
    Object.assign(d.player, { map: 'route1', x: 3, y: 9, facing: 'down' });
  });
  enterWorld();
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Walks the player by holding a direction for a moment. */
async function hold(dir: Dir, ms: number) {
  const g = getGame();
  g.input.press(dir);
  await sleep(ms);
  g.input.release(dir);
}

type Spot = { label: string; hint: string; go: () => Promise<void> };

const SPOTS: Spot[] = [
  { label: 'Herbes hautes', hint: 'Des brins d’herbe volent à chaque pas', go: async () => {
    await warpTo({ map: 'route1', x: 1, y: 11, facing: 'right' });
    await wait(400);
    await hold('right', 1100);
    await hold('left', 900);
  } },
  { label: 'Saut de rebord', hint: 'Un petit nuage de poussière à l’atterrissage', go: async () => {
    await warpTo({ map: 'route1', x: 15, y: 26, facing: 'down' });
    await wait(500);
    await hold('down', 250);
  } },
  { label: 'Porte : entrer, puis sortir', hint: 'La porte s’ouvre, puis tu sors d’un pas', go: async () => {
    await warpTo({ map: 'bourg', x: 3, y: 7, facing: 'up' });
    await wait(400);
    await hold('up', 450);
    await sleep(1800);
    if (getGame().map.def.id !== 'bourg') await warpTo({ map: 'bourg', x: 3, y: 6, facing: 'down' });
  } },
  { label: 'En bateau', hint: 'Des ronds dans l’eau derrière toi', go: async () => {
    await warpTo({ map: 'route1', x: 8, y: 24, facing: 'right' });
    getGame().surfing = true;
    await wait(300);
    await hold('right', 700);
    await hold('down', 450);
  } },
];

const AIRS: Spot[] = [
  { label: 'Jardin-Gouache', hint: 'Pétales', go: () => warpTo({ map: 'gouache', x: 9, y: 14, facing: 'up' }) },
  { label: 'Bois Brumeux', hint: 'Feuilles', go: () => warpTo({ map: 'bois', x: 3, y: 14, facing: 'up' }) },
  { label: 'Grotte Gribouillis', hint: 'Poussière dans la lumière', go: () => warpTo({ map: 'grotte1', x: 11, y: 14, facing: 'up' }) },
  { label: 'Cité-Encre', hint: 'Taches d’encre', go: () => warpTo({ map: 'encre', x: 9, y: 1, facing: 'down' }) },
  { label: 'Usine Gomme', hint: 'Miettes de gomme', go: () => warpTo({ map: 'usine1', x: 6, y: 10, facing: 'up' }) },
  { label: 'Bourg-Paillette', hint: 'Paillettes', go: () => warpTo({ map: 'paillette', x: 9, y: 1, facing: 'down' }) },
];

const HOURS: [number, string][] = [[7, '7 h'], [12, 'Midi'], [19, '19 h'], [20, '20 h'], [21, '21 h'], [0, 'Minuit']];

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
      <p class="demo-sheet__title">Le monde vivant</p>
      {SPOTS.map((s) => (
        <button class="demo-scene" key={s.label} onClick={() => run(s)}>
          <span class="demo-scene__label">{s.label}</span>
          <span class="demo-scene__hint">{s.hint}</span>
        </button>
      ))}
      <p class="demo-sheet__sub">L’air de chaque lieu</p>
      <div class="demo-grid demo-grid--small">
        {AIRS.map((s) => (
          <button class="demo-scene" key={s.label} onClick={() => run(s)}>
            <span class="demo-scene__label">{s.label}</span>
            <span class="demo-scene__hint">{s.hint}</span>
          </button>
        ))}
      </div>
      <div class="demo-opt">
        <span>L’heure (dehors, la nuit : des lucioles)</span>
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
          <p class="demo-eyebrow">Atelier Bestioles · démo 5</p>
          <h1>Le monde vivant</h1>
          <p>Le vrai jeu, avec un panneau pour essayer les nouveautés du monde : l’herbe sous les pas, la poussière d’un saut, les ronds du bateau, les portes, l’air de chaque lieu et l’heure qui change doucement. Personne ne te défie et aucune Bestiole sauvage ne surgit, pour te promener tranquille.</p>
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
