/**
 * Demo page for the owner (phones: notches, small buttons, landscape): the real game, with a panel opening each
 * screen that changed. Built by `npm run demo -- m6`.
 */
import { render } from 'preact';
import { useState } from 'preact/hooks';
import '../../src/styles/global.css';
import './demo.css';
import { App } from '../../src/app';
import '../../src/story';
import { installSketch } from '../../src/ui/paper/sketch';
import { newGame, save, update } from '../../src/state/game';
import { go, screen } from '../../src/state/router';
import { enterWorld, fight, getGame, openScreen } from '../../src/overworld/controller';
import { ask } from '../../src/overworld/dialog';
import { createMon } from '../../src/engine/pk/creature';
import { DEFAULT_LOOKS } from '../../src/data/appearance';
import { L } from '../../src/i18n';
import { shiftTo } from '../../src/state/clock';
import { prefs, setPref } from '../../src/state/prefs';
import { stopMusic } from '../../src/audio/music';
import { sfx } from '../../src/audio/sfx';

function startGame() {
  newGame('Léa', DEFAULT_LOOKS.f, 'f', 'Feutre');
  update((d) => {
    d.party = ['012', '013', '021', '030'].map((id, i) => createMon(id, 12, { rng: 3 + i }));
    d.boxes[0] = [createMon('040', 9, { rng: 4 })];
    d.flags.rival1 = 1;
    d.flags.dex = 1;
    d.bag.potion = 3;
    d.bag['crayon-ball'] = 10;
    d.bag.carte = 1;
    d.money = 3000;
    d.dex.seen = ['001', '002', '012', '013', '014', '021', '030', '040'];
    d.dex.caught = ['001', '012', '013', '021', '030', '040'];
    d.hallOfFame = [{ date: Date.now(), team: [{ species: '012', level: 40 }, { species: '021', level: 38 }] }];
    d.repel = 99999;
    d.clockShift = shiftTo(14);
    Object.assign(d.player, { map: 'bourg', x: 12, y: 8, facing: 'down' });
  });
  enterWorld();
}

let running = false;

/** Runs a scene with the game locked, like a story script. */
async function scene(fn: () => Promise<unknown>) {
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

const SCENES: { label: string; hint: string; play: () => Promise<unknown> }[] = [
  { label: 'Sac', hint: 'Téléphone couché : la liste à gauche, ce que fait l’objet à droite.', play: () => openScreen({ id: 'bag' }) },
  { label: 'Tombola', hint: 'Téléphone couché : la machine à côté du texte, en entier.', play: () => openScreen({ id: 'machine' }) },
  { label: 'Musiques', hint: 'Téléphone couché : la liste des airs enfin visible, à droite.', play: () => openScreen({ id: 'jukebox' }) },
  { label: 'PC', hint: 'Petit téléphone, gros texte : « BOÎTE 1 » et son compte l’un sous l’autre.', play: () => openScreen({ id: 'pc' }) },
  { label: 'Options', hint: 'Les flèches ◀ ▶ se touchent plus facilement.', play: async () => go({ id: 'settings', back: { id: 'overworld' } }) },
  { label: 'Mon look', hint: 'Les couleurs sont plus grosses sous le doigt.', play: async () => { await new Promise((r) => setTimeout(r, 0)); const p = openScreen({ id: 'trainercard' }); setTimeout(() => (document.querySelector('.tcard__tabs .summary__tab') as HTMLElement | null)?.click(), 400); setTimeout(() => (document.querySelector('.tcard__look') as HTMLElement | null)?.click(), 800); return p; } },
  { label: 'Question', hint: 'Téléphone couché : la boîte reste hors de l’encoche et de la barre du bas.', play: () => ask(L('Tu veux vraiment partir à l’aventure avec moi aujourd’hui ?', 'Ready?'), [L('Oui', 'Yes'), L('Non', 'No')]) },
  { label: 'Combat', hint: 'ATTAQUE : « Retour » se touche plus facilement.', play: () => fight('wild', L('Hypnopaon', 'Hypnopaon'), [createMon('014', 5, { rng: 2 })]) },
  { label: 'Générique', hint: 'Il dit « Maintiens le doigt (ou B) » pour accélérer.', play: () => openScreen({ id: 'credits', fromWorld: true }) },
];

function Panel() {
  const [open, setOpen] = useState(true);
  const [, redraw] = useState(0);
  if (screen.value.id !== 'overworld' || !save.value) return null;
  if (!open) return <button class="demo-fab" onClick={() => setOpen(true)}>Démo</button>;
  return (
    <div class="demo-sheet" role="dialog" aria-label="Démo">
      <p class="demo-sheet__title">Téléphones</p>
      {SCENES.map((s) => (
        <button class="demo-scene" key={s.label} onClick={() => { setOpen(false); void scene(s.play); }}>
          <span class="demo-scene__label">{s.label}</span>
          <span class="demo-scene__hint">{s.hint}</span>
        </button>
      ))}
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
          <p class="demo-eyebrow">Atelier Bestioles · démo 12</p>
          <h1>Téléphones : encoches, petits boutons, paysage</h1>
          <p>Le vrai jeu, avec un panneau qui ouvre chaque écran retouché. Couche le téléphone pour le Sac, la Tombola, les Musiques et la question. Les petits boutons (flèches des Options, Retour en combat, couleurs du look) se touchent plus facilement.</p>
          <button class="demo-go" onClick={() => { sfx.confirm(); startGame(); setStarted(true); }}>Lancer</button>
          <p class="demo-small">Le son démarre avec ce bouton. Le bouton « Démo » rouvre le panneau.</p>
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
