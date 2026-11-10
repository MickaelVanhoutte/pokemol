/**
 * Demo page for the owner (roadmap, milestone 8): « La page d’après », the epilogue. The real game after the Grand
 * Concours and four Atelier rematches: on Masterpiece Square the doubt comes to ask for help, then its page, its stains
 * and its training battle. Built by `npm run demo -- m13`.
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
    d.party = [createMon('025', 64, { rng: 3 }), createMon('024', 63, { rng: 4 }), createMon('023', 63, { rng: 5 }), createMon('036', 62, { rng: 6 }), createMon('027', 62, { rng: 7 }), createMon('014', 62, { rng: 8 })];
    // the story is over, the Concours won and four Masters beaten again
    for (const id of Object.keys(TRAINERS)) if (id !== 'buvardEp' && id !== 'effaceurEp') d.flags[`tr:${id}`] = 1;
    Object.assign(d.flags, { rival1: 1, ending: 1, fin: 1, champion: 1, 'couleurs:bord': 1, 'visit:galerie': 1 });
    d.badges = ['pastel', 'plume', 'aquarelle', 'fluo', 'braise', 'paillette', 'gouache', 'encre'];
    d.repel = 99999;
    d.clockShift = shiftTo(12);
    Object.assign(d.player, { map: 'bordPage', x: 8, y: 2, facing: 'up' });
  });
  enterWorld();
}

type Spot = { label: string; hint: string; go: () => Promise<void> };

const SPOTS: Spot[] = [
  { label: 'La petite voix arrive', hint: 'Place des Chefs-d’Œuvre : elle vient te demander de l’aide', go: async () => {
    update((d) => { delete d.flags['ep:1']; });
    await warpTo({ map: 'galerie', x: 11, y: 14, facing: 'up' });
  } },
  { label: 'La page d’après', hint: 'Les trois taches, le Capitaine Buvard, puis la petite voix (parle-lui)', go: async () => {
    update((d) => { d.flags['ep:1'] = 1; });
    await warpTo({ map: 'margeBlanche', x: 8, y: 10, facing: 'up' });
  } },
];

const HOURS: [number, string][] = [[12, 'Midi'], [0, 'Minuit']];

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
      <p class="demo-sheet__title">La page d’après</p>
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
          <p class="demo-eyebrow">Atelier Bestioles · démo 19</p>
          <h1>La page d’après</h1>
          <p>Le vrai jeu, après l’histoire, le Grand Concours gagné et quatre revanches des Maîtres d’Atelier. Une petite voix vient te demander de l’aide pour finir une dernière page : redessine ou garde ses taches, bats le Capitaine Buvard, puis entraîne-toi avec elle. Ton équipe est au niveau 62–64. Attention, cette page dévoile la fin de l’histoire.</p>
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
