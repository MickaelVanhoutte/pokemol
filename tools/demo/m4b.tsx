/**
 * Demo page for the owner (M4b): the real game, with a panel playing the evolution scene (its tune, its rings and
 * sparkles; B stops it), the ending's evolution that nothing stops, a menu turning in like a page, and the credits
 * rolling up. Built by `npm run demo -- m4b`.
 */
import { render } from 'preact';
import { useState } from 'preact/hooks';
import '../../src/styles/global.css';
import './demo.css';
import { App } from '../../src/app';
import '../../src/story';
import { installSketch } from '../../src/ui/paper/sketch';
import { newGame, save, update } from '../../src/state/game';
import { screen } from '../../src/state/router';
import { checkEvolutions, enterWorld, evoOverlay, getGame, openScreen } from '../../src/overworld/controller';
import { createMon } from '../../src/engine/pk/creature';
import { DEFAULT_LOOKS } from '../../src/data/appearance';
import { shiftTo } from '../../src/state/clock';
import { prefs, setPref } from '../../src/state/prefs';
import { stopMusic } from '../../src/audio/music';
import { sfx } from '../../src/audio/sfx';

function startGame() {
  newGame('Léa', DEFAULT_LOOKS.f, 'f', 'Feutre');
  update((d) => {
    d.party = [createMon('012', 7, { rng: 3 })];
    d.flags.rival1 = 1;
    d.flags.dex = 1;
    d.bag.potion = 3;
    d.bag['crayon-ball'] = 10;
    d.repel = 99999;
    d.clockShift = shiftTo(14);
    Object.assign(d.player, { map: 'bourg', x: 12, y: 8, facing: 'down' });
  });
  enterWorld();
}

let running = false;
let step = 0;

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

/** The two evolutions of the Gloutillon line, one after the other (the real level-up check). */
const EVOS: [string, number][] = [['012', 7], ['015', 10]];

const SCENES: { label: string; hint: string; play: () => Promise<void> }[] = [
  {
    label: 'Une évolution',
    hint: 'Sa musique, les anneaux de lumière, les étincelles. B l’arrête.',
    play: async () => {
      const [sp, lv] = EVOS[step++ % EVOS.length];
      const m = createMon(sp, lv, { rng: 3 });
      update((d) => { d.party = [m]; });
      await checkEvolutions([m.uid]);
    },
  },
  {
    label: 'L’évolution de la fin',
    hint: 'Coconfus devient Libellune : cette fois, B ne l’arrête pas.',
    play: async () => {
      const m = createMon('073', 40, { rng: 3 });
      await new Promise<boolean>((resolve) => (evoOverlay.value = { mon: m, to: '071', locked: true, resolve }));
      evoOverlay.value = null;
    },
  },
  {
    label: 'Ouvrir un menu',
    hint: 'Le Sac s’ouvre comme une page qu’on tourne.',
    play: () => openScreen({ id: 'bag' }),
  },
  {
    label: 'Le générique',
    hint: 'Ses dessins défilent. Maintiens B (ou le doigt sur l’écran) pour accélérer.',
    play: () => openScreen({ id: 'credits', fromWorld: true }),
  },
];

function Panel() {
  const [open, setOpen] = useState(true);
  const [, redraw] = useState(0);
  if (screen.value.id !== 'overworld' || !save.value) return null;
  if (!open) return <button class="demo-fab" onClick={() => setOpen(true)}>Démo</button>;
  return (
    <div class="demo-sheet" role="dialog" aria-label="Démo">
      <p class="demo-sheet__title">Évolution, menus et générique</p>
      {SCENES.map((s) => (
        <button class="demo-scene" key={s.label} onClick={() => { setOpen(false); void scene(s.play); }}>
          <span class="demo-scene__label">{s.label}</span>
          <span class="demo-scene__hint">{s.hint}</span>
        </button>
      ))}
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
          <p class="demo-eyebrow">Atelier Bestioles · démo 9 (privée : elle montre la fin)</p>
          <h1>Évolution, menus et générique</h1>
          <p>Le vrai jeu, avec un panneau qui rejoue la nouvelle évolution (sa musique, ses anneaux de lumière, ses étincelles), l’évolution de la fin qu’on ne peut plus arrêter, un menu qui s’ouvre comme une page, et le générique qui défile.</p>
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
