/**
 * Demo page for the owner (the menus pass): the real game, with a panel opening each menu. Every one now leaves by
 * « ◀ Retour » at the bottom left (the B button), the main action at the bottom right (A), and the top only says
 * where you are, with ◀ ▶ to turn pages. Built by `npm run demo -- menus`.
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
import { enterWorld, fight, getGame, nameOverlay, openScreen } from '../../src/overworld/controller';
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
  { label: 'Sac', hint: '◀ ▶ en haut : les poches. Retour en bas à gauche.', play: () => openScreen({ id: 'bag' }) },
  { label: 'Bestioles', hint: 'Touche une Bestiole puis RÉSUMÉ : ◀ ▶ en haut passent à la suivante.', play: () => openScreen({ id: 'party' }) },
  { label: 'Bestiodex', hint: 'Ouvre une fiche : ◀ ▶ autour du nom passent à la suivante.', play: () => openScreen({ id: 'dex' }) },
  { label: 'PC', hint: 'Les boîtes avec ◀ ▶, Retour en bas.', play: () => openScreen({ id: 'pc' }) },
  { label: 'Boutique', hint: 'Choisis un objet : Annuler à gauche, OK à droite.', play: () => openScreen({ id: 'shop' }) },
  { label: 'Ballon-Crayon', hint: 'Retour à gauche, « Décoller ! » à droite.', play: () => openScreen({ id: 'townmap', pick: { here: 'bourg', onPick: () => undefined } }) },
  { label: 'Carte de dresseur', hint: 'Les pages en haut, Retour en bas.', play: () => openScreen({ id: 'trainercard' }) },
  { label: 'Options', hint: 'Même place pour Retour.', play: async () => go({ id: 'settings', back: { id: 'overworld' } }) },
  { label: 'Tombola', hint: 'Retour à gauche, « Acheter un ticket » à droite.', play: () => openScreen({ id: 'machine' }) },
  { label: 'Atelier des Brouillons', hint: 'Retour à gauche, « Terminer » à droite.', play: () => openScreen({ id: 'atelier', onEnd: () => undefined }) },
  { label: 'Surnom', hint: '« Sans surnom » à gauche, OK à droite.', play: () => new Promise<void>((resolve) => (nameOverlay.value = { mon: save.value!.party[0], resolve: () => { nameOverlay.value = null; resolve(); } })) },
  { label: 'Combat', hint: 'ATTAQUE : Retour à gauche de la question.', play: () => fight('wild', L('Hypnopaon', 'Hypnopaon'), [createMon('014', 5, { rng: 2 })]) },
];

function Panel() {
  const [open, setOpen] = useState(true);
  const [, redraw] = useState(0);
  if (screen.value.id !== 'overworld' || !save.value) return null;
  if (!open) return <button class="demo-fab" onClick={() => setOpen(true)}>Démo</button>;
  return (
    <div class="demo-sheet" role="dialog" aria-label="Démo">
      <p class="demo-sheet__title">Les menus</p>
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
          <p class="demo-eyebrow">Atelier Bestioles · démo 10</p>
          <h1>Les menus : un seul Retour</h1>
          <p>Le vrai jeu, avec un panneau qui ouvre chaque menu. Partout, « ◀ Retour » est en bas à gauche, à la même place et de la même taille (c’est le bouton B). L’action principale est en bas à droite (le bouton A). En haut, seulement où l’on est, avec ◀ ▶ pour tourner les pages.</p>
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
