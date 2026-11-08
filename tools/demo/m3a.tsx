/**
 * Demo page for the owner (M3a, private: it shows the story's twists): the real game, with a panel playing the
 * restaged story scenes: the woods drawn back, the hamlet coloured in, the Great Eraser drawn into the factory and
 * rubbed out again, the Giant Eraser's lever, the shadow of the echo cave. Built by `npm run demo -- m3a`.
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
import { enterWorld, runScript, wait, warpTo } from '../../src/overworld/controller';
import { createMon } from '../../src/engine/pk/creature';
import { DEFAULT_LOOKS } from '../../src/data/appearance';
import { shiftTo } from '../../src/state/clock';
import type { Dir } from '../../src/save/schema';
import { prefs, setPref } from '../../src/state/prefs';
import { stopMusic } from '../../src/audio/music';
import { sfx } from '../../src/audio/sfx';

function startGame() {
  newGame('Léa', DEFAULT_LOOKS.f, 'f', 'Feutre');
  update((d) => {
    d.party = [createMon('021', 45, { rng: 3 }), createMon('073', 40, { rng: 4 })];
    d.flags.rival1 = 1;
    d.flags['gift:coconfus'] = 1;
    d.repel = 99999;
    d.clockShift = shiftTo(14);
    Object.assign(d.player, { map: 'bois', x: 12, y: 5, facing: 'up' });
  });
  enterWorld();
}

interface Scene { label: string; hint: string; map: string; x: number; y: number; facing: Dir; script: string; flags?: () => void; after?: () => void }

const SCENES: Scene[] = [
  { label: 'Le bois retrouve ses couleurs', hint: 'Les arbres gommés reviennent, en cercle', map: 'bois', x: 12, y: 4, facing: 'up', script: 'boisRestore',
    flags: () => update((d) => { delete d.flags['a1.bois']; }),
    after: () => update((d) => { d.flags['a1.bois'] = 1; d.flags['tr:gomme2'] = 1; }) },
  { label: 'Le Hameau-Brouillon se colorie', hint: 'Choisis « Je vais tout colorier ! »', map: 'brouillon', x: 20, y: 9, facing: 'right', script: 'hameauChoice',
    flags: () => update((d) => { d.flags['a4.marge'] = 1; for (const k of Object.keys(d.flags)) if (k.startsWith('choix:hameau')) delete d.flags[k]; }) },
  { label: 'Le Grand Effaceur à l’Usine', hint: 'Esquissé au crayon, puis gommé', map: 'usine3', x: 6, y: 5, facing: 'up', script: 'usineEnd',
    flags: () => update((d) => { delete d.flags.coconPale; }) },
  { label: 'Le levier de la Gomme Géante', hint: 'Bandes cinéma, la forteresse tremble', map: 'forteresse3', x: 5, y: 3, facing: 'up', script: 'grandeGomme',
    flags: () => update((d) => { delete d.flags['a4.machine']; d.flags['tr:blanche3'] = 1; }) },
  { label: 'L’ombre de la Grotte des Échos', hint: 'Bandes, zoom, la grotte gronde', map: 'grotteEchos', x: 7, y: 3, facing: 'up', script: 'echoShadow',
    flags: () => update((d) => { delete d.flags['static:ombrouille']; }) },
];

async function play(s: Scene) {
  s.flags?.();
  await warpTo({ map: s.map, x: s.x, y: s.y, facing: s.facing });
  await wait(500);
  s.after?.();
  await runScript(s.script);
}

function Panel() {
  const [open, setOpen] = useState(true);
  const [, redraw] = useState(0);
  if (screen.value.id !== 'overworld') return null;
  if (!open) return <button class="demo-fab" onClick={() => setOpen(true)}>Démo</button>;
  return (
    <div class="demo-sheet" role="dialog" aria-label="Démo">
      <p class="demo-sheet__title">Les scènes de l’histoire</p>
      {SCENES.map((s) => (
        <button class="demo-scene" key={s.label} onClick={() => { setOpen(false); void play(s); }}>
          <span class="demo-scene__label">{s.label}</span>
          <span class="demo-scene__hint">{s.hint}</span>
        </button>
      ))}
      <p class="demo-small">Maintiens B pendant une scène pour l’accélérer.</p>
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
          <p class="demo-eyebrow">Atelier Bestioles · démo 6 (privée : elle montre l’histoire)</p>
          <h1>Les scènes de l’histoire</h1>
          <p>Le vrai jeu, avec un panneau qui rejoue cinq grands moments remis en scène : le décor qui se redessine sous tes yeux, le Grand Effaceur esquissé au crayon puis gommé, les bandes cinéma et la caméra. Ta Bestiole est assez forte pour les combats qui suivent.</p>
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
