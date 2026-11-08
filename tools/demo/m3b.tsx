/**
 * Demo page for the owner (M3b, private: it shows the story's twists): the real game, with a panel playing the
 * three planches where they happen: the Prof's photo in the lab (a different first Bestiole each time), the Great
 * Eraser's face at the Edge of the Page, and waking up in the real bedroom. Built by `npm run demo -- m3b`.
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
import { enterWorld, getGame, wait, warpTo } from '../../src/overworld/controller';
import { createMon } from '../../src/engine/pk/creature';
import { DEFAULT_LOOKS } from '../../src/data/appearance';
import { STARTERS } from '../../src/data/creatures';
import { shiftTo } from '../../src/state/clock';
import { prefs, setPref } from '../../src/state/prefs';
import { stopMusic } from '../../src/audio/music';
import { sfx } from '../../src/audio/sfx';
import { LOOKS } from '../../src/overworld/sprites';
import { eraseOut, sketchIn } from '../../src/overworld/scene';
import { profPhoto } from '../../src/story/act1';
import { eyesOpen, reveal } from '../../src/story/finale';

function startGame() {
  newGame('Léa', DEFAULT_LOOKS.f, 'f', 'Feutre');
  update((d) => {
    d.party = [createMon('001', 5, { rng: 3 })];
    d.flags.rival1 = 1;
    d.repel = 99999;
    d.clockShift = shiftTo(14);
    Object.assign(d.player, { map: 'labo', x: 5, y: 4, facing: 'up' });
  });
  enterWorld();
}

/** A script runs: the panel waits for it (the game's lock). */
let running = false;
let photos = 0;

/** Runs a scene with the game locked, like a story script. */
async function scene(fn: () => Promise<void>) {
  if (running) return;
  running = true;
  const g = getGame();
  g.lock++;
  try {
    await fn();
  } finally {
    g.lock--;
    running = false;
  }
}

const SCENES: { label: string; hint: string; play: () => Promise<void> }[] = [
  {
    label: 'Clic-clac ! La photo du Prof',
    hint: 'Au labo, après le premier combat. Une autre Bestiole à chaque fois.',
    play: async () => {
      const species = STARTERS[photos++ % STARTERS.length];
      update((d) => { d.party = [createMon(species, 5, { rng: 3 })]; });
      await warpTo({ map: 'labo', x: 5, y: 4, facing: 'up' });
      await wait(500);
      await profPhoto();
    },
  },
  {
    label: 'Le visage du Grand Effaceur',
    hint: 'Au Bord de la Page : les miettes, le visage, la casquette gommée.',
    play: async () => {
      await warpTo({ map: 'bordPage', x: 8, y: 8, facing: 'up' });
      await wait(500);
      const g = getGame();
      const boss = await sketchIn('effaceurDemo', LOOKS.effaceur, g.player.x, g.player.y - 2, 'down');
      await reveal(boss);
      await eraseOut(boss);
    },
  },
  {
    label: 'Le réveil',
    hint: 'Dans ta vraie chambre : les yeux qui s’ouvrent sur le matin.',
    play: async () => {
      // the dream's white, as when the last page trembles
      update((d) => { d.flags.ending = 1; });
      const g = getGame();
      await g.fadeTo(1, 900, 'white');
      await warpTo({ map: 'chambre', x: 2, y: 3, facing: 'right' }, { keepFade: true });
      // the story's ending is not played here: Papa stands by the bed as it starts
      if (!g.npc('papa')) g.spawn('papa', LOOKS.papa, 3, 3, 'left');
      await wait(500);
      await eyesOpen();
    },
  },
];

function Panel() {
  const [open, setOpen] = useState(true);
  const [, redraw] = useState(0);
  if (screen.value.id !== 'overworld') return null;
  if (!open) return <button class="demo-fab" onClick={() => setOpen(true)}>Démo</button>;
  return (
    <div class="demo-sheet" role="dialog" aria-label="Démo">
      <p class="demo-sheet__title">Les grandes planches</p>
      {SCENES.map((s) => (
        <button class="demo-scene" key={s.label} onClick={() => { setOpen(false); void scene(s.play); }}>
          <span class="demo-scene__label">{s.label}</span>
          <span class="demo-scene__hint">{s.hint}</span>
        </button>
      ))}
      <p class="demo-small">Touche une planche (ou A) pour passer au moment suivant. Maintiens B pour l’accélérer.</p>
      <div class="demo-opt">
        <span>Mouvements</span>
        <div class="demo-seg">
          {(['full', 'calm'] as const).map((v) => (
            <button key={v} class={prefs.value.motion === v ? 'is-on' : ''} onClick={() => { setPref('motion', v); redraw((n) => n + 1); }}>{v === 'full' ? 'Normaux' : 'Doux'}</button>
          ))}
        </div>
      </div>
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
          <p class="demo-eyebrow">Atelier Bestioles · démo 7 (privée : elle montre l’histoire)</p>
          <h1>Les grandes planches</h1>
          <p>Le vrai jeu, avec un panneau qui rejoue trois grands moments dessinés en plein écran, trait par trait : la photo du Prof qui se développe, le visage du Grand Effaceur qui revient sous la gomme, et le réveil dans ta chambre.</p>
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
