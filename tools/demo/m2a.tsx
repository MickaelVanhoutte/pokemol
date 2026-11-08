/**
 * Demo page for the owner (M2a): the real game on the Crayon Road, with a small panel to start the new
 * staging: a trainer spotting you (the « ! », the camera jumping close, the sting), and a little scene with
 * cinema bars, the camera following people and zooming, bubbles popping in, and B held to hurry it.
 * Built by `npm run demo -- m2a`.
 */
import { render } from 'preact';
import { useState } from 'preact/hooks';
import '../../src/styles/global.css';
import './demo.css';
import { App } from '../../src/app';
import '../../src/story';
import { installSketch } from '../../src/ui/paper/sketch';
import { healParty, newGame, update } from '../../src/state/game';
import { screen } from '../../src/state/router';
import { enterWorld, getGame, runScript, scripts, warpTo, wait, bubble } from '../../src/overworld/controller';
import { say } from '../../src/overworld/dialog';
import { lookAt, lookBetween, staged } from '../../src/overworld/scene';
import { comeUp, goAway } from '../../src/story/choices';
import { createMon } from '../../src/engine/pk/creature';
import { DEFAULT_LOOKS } from '../../src/data/appearance';
import { LOOKS } from '../../src/overworld/sprites';
import { prefs, setPref } from '../../src/state/prefs';
import { stopMusic } from '../../src/audio/music';
import { sfx } from '../../src/audio/sfx';
import { L } from '../../src/i18n';

const FRIEND = L('Amie', 'Friend');

/** The little scene: bars, the camera looking up the road, a friend walking in, a zoom, bubbles, a knock. */
scripts.demoScene = async () => {
  await staged(async () => {
    const g = getGame();
    await bubble('player', '?', 700);
    // the camera looks up the road
    g.camera.panTo((g.player.x + 3) * 16 + 8, (g.player.y - 4) * 16 + 8, 900);
    await wait(1200);
    const friend = await comeUp('demoAmie', LOOKS.girl);
    lookBetween(g.player, friend, 500);
    g.camera.zoomTo(2, 500);
    await bubble('demoAmie', '!', 700);
    await say(L('Te voilà ! Quand une scène commence, des bandes de cinéma descendent et la caméra bouge toute seule.', 'There you are! When a scene starts, cinema bars come down and the camera moves by itself.'), FRIEND);
    await say(L('Maintiens B pendant que je marche : tout va trois fois plus vite. Le texte, lui, t’attend toujours.', 'Hold B while I walk: everything goes three times faster. The text still waits for you.'), FRIEND);
    g.camera.shake('jolt', 320);
    await bubble('player', '!', 600);
    await bubble('demoAmie', '♥', 800);
    g.camera.zoomTo(1, 400);
    lookAt(friend, 400);
    await goAway(friend, ['up', 'up', 'up']);
  });
};

const START = { map: 'route1', x: 6, y: 12, facing: 'right' as const };

function startGame() {
  newGame('Léa', DEFAULT_LOOKS.f, 'f', 'Feutre');
  update((d) => {
    const m = createMon('021', 22, { rng: 3 });
    // a fire move first: a battle against Kid Leo ends quickly
    m.moves = [{ id: 'flammeche', pp: 25 }, ...m.moves.filter((x) => x.id !== 'flammeche').slice(0, 3)];
    d.party = [m];
    d.flags.rival1 = 1;
    d.bag['crayon-ball'] = 5;
    d.bag.potion = 3;
    Object.assign(d.player, START);
  });
  enterWorld();
}

/** Back in front of Kid Leo, unbeaten, one step out of his sight: a step right and he sees you. */
async function spotted() {
  update((d) => {
    delete d.flags['tr:leo'];
    delete d.flags['re:leo'];
    healParty(d);
  });
  if (screen.value.id !== 'overworld') return;
  await warpTo(START);
  await wait(700);
  const g = getGame();
  g.input.press('right');
  setTimeout(() => g.input.release('right'), 180);
}

function Panel() {
  const [open, setOpen] = useState(true);
  const [, redraw] = useState(0);
  if (screen.value.id !== 'overworld') return null;
  if (!open) return <button class="demo-fab" onClick={() => setOpen(true)}>Démo</button>;
  const run = (f: () => void) => { setOpen(false); f(); };
  return (
    <div class="demo-sheet" role="dialog" aria-label="Démo">
      <p class="demo-sheet__title">Mise en scène</p>
      <button class="demo-scene" onClick={() => run(() => void spotted())}>
        <span class="demo-scene__label">Repéré par un dresseur</span>
        <span class="demo-scene__hint">« ! », la caméra qui se rapproche, le jingle</span>
      </button>
      <button class="demo-scene" onClick={() => run(() => void runScript('demoScene'))}>
        <span class="demo-scene__label">Petite scène</span>
        <span class="demo-scene__hint">Bandes cinéma, caméra, bulles. Maintiens B pour aller ×3</span>
      </button>
      <button class="demo-scene" onClick={() => setOpen(false)}>
        <span class="demo-scene__label">Marcher</span>
        <span class="demo-scene__hint">Le jeu, librement (le bouton Démo revient en haut)</span>
      </button>
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
          <p class="demo-eyebrow">Atelier Bestioles · démo 4</p>
          <h1>Mise en scène</h1>
          <p>Le vrai jeu, sur le Chemin des Crayons. Un petit panneau lance les nouveautés : un dresseur qui te repère, et une scène avec bandes cinéma, caméra qui bouge et bulles. Pendant la scène, maintiens B (ou X au clavier) pour qu’elle aille trois fois plus vite.</p>
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
