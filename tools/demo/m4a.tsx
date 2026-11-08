/**
 * Demo page for the owner (M4a): the real game, with a panel playing the small moments: a badge handed over (then
 * its stencil), an item found, and a first catch (a real wild battle: throw a Croque-Carnet, the Bestiodex page
 * comes before the nickname). Built by `npm run demo -- m4a`.
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
import { enterWorld, getGame, gotItem, showBadge, wait, wildBattle } from '../../src/overworld/controller';
import { createMon } from '../../src/engine/pk/creature';
import { DEFAULT_LOOKS } from '../../src/data/appearance';
import { BADGES } from '../../src/data/badges';
import { item } from '../../src/data/items';
import { L, tr } from '../../src/i18n';
import { shiftTo } from '../../src/state/clock';
import { prefs, setPref } from '../../src/state/prefs';
import { stopMusic } from '../../src/audio/music';
import { sfx } from '../../src/audio/sfx';

function startGame() {
  newGame('Léa', DEFAULT_LOOKS.f, 'f', 'Feutre');
  update((d) => {
    d.party = [createMon('021', 30, { rng: 3 })];
    d.flags.rival1 = 1;
    d.flags.dex = 1;
    d.bag['crayon-ball'] = 99;
    d.repel = 99999;
    d.clockShift = shiftTo(14);
    Object.assign(d.player, { map: 'bourg', x: 3, y: 7, facing: 'down' });
  });
  enterWorld();
}

let running = false;
let badges = 0;
let finds = 0;
let catches = 0;

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

const FINDS: [string, number][] = [['potion', 1], ['baie-doree', 3], ['super-potion', 1], ['crayon-ball', 5], ['baie-cerise', 2]];
const WILD = ['012', '013', '005', '009', '006'];

const SCENES: { label: string; hint: string; play: () => Promise<void> }[] = [
  {
    label: 'Remise de badge',
    hint: 'Après un Maître d’Atelier : le badge, puis son pochoir. Un autre badge à chaque fois.',
    play: async () => {
      const b = BADGES[badges++ % BADGES.length];
      await showBadge(b.id);
      if (b.stencil) await gotItem(b.stencil, L('{l} te donne {i} !', '{l} gave you {i}!'), { l: tr(b.leader), i: tr(item(b.stencil).name) });
    },
  },
  {
    label: 'Objet trouvé',
    hint: 'Une Potion, des baies, des Croque-Carnets…',
    play: async () => {
      const [id, n] = FINDS[finds++ % FINDS.length];
      update((d) => { d.bag[id] = (d.bag[id] ?? 0) + n; });
      await gotItem(id, L('Tu trouves {i}{n} !', 'You found {i}{n}!'), { i: tr(item(id).name), n: n > 1 ? ` ×${n}` : '' });
    },
  },
  {
    label: 'Première capture',
    hint: 'Un vrai combat : lance un Croque-Carnet (Sac). La page du Bestiodex vient avant le surnom.',
    play: async () => {
      const sp = WILD[catches++ % WILD.length];
      // never caught before, so its page shows again on the next round
      update((d) => {
        d.dex.caught = d.dex.caught.filter((x) => x !== sp);
        d.party = d.party.filter((m, i) => i === 0 || m.species !== sp);
        healParty(d);
      });
      await wait(300);
      await wildBattle(sp, 3);
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
      <p class="demo-sheet__title">Les petits moments</p>
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
          <p class="demo-eyebrow">Atelier Bestioles · démo 8</p>
          <h1>Les petits moments</h1>
          <p>Le vrai jeu, avec un panneau qui rejoue les petits moments : le badge qui tourne et brille, l’objet trouvé qui s’affiche en grand, et la page du Bestiodex tamponnée « Enregistré ! » à la première capture.</p>
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
