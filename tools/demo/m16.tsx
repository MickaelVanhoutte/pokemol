/**
 * Demo page for the owner (roadmap, milestone 11): Papeterre's calendar. The real game with its clock moved to a market
 * day, a swarm's day or the Star Ball; buttons take you there. Built by `npm run demo -- m16`.
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
import { localDay } from '../../src/overworld/berries';
import { marketTown, swarmOf } from '../../src/data/events';
import { save } from '../../src/state/game';
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
    d.party = [createMon('021', 22, { rng: 3 }), createMon('013', 20, { rng: 4 })];
    d.flags.rival1 = 1;
    // nobody challenges you and no wild Bestiole jumps out: the demo is about walking around
    for (const id of Object.keys(TRAINERS)) d.flags[`tr:${id}`] = 1;
    d.repel = 0;
    d.clockShift = shiftTo(12);
    Object.assign(d.player, { map: 'paillette', x: 16, y: 11, facing: 'up' });
    d.badges = ['pastel', 'plume', 'aquarelle', 'fluo', 'braise', 'paillette'];
    d.money = 30000;
    for (const m of ['route3', 'route4', 'route6', 'route7', 'route8', 'paillette']) d.flags[`seen:${m}`] = 1;
  });
  enterWorld();
}

type Spot = { label: string; hint: string; go: () => Promise<void> };

/** The calendar follows the device's date: the demo moves its clock (Date and Date.now) by `offset` ms. */
let offset = 0;
const RealDate = Date;
class DemoDate extends RealDate {
  constructor(...a: ConstructorParameters<typeof Date> | []) {
    if (a.length) super(...(a as [number]));
    else super(RealDate.now() + offset);
  }
  static now() { return RealDate.now() + offset; }
}
(globalThis as unknown as { Date: DateConstructor }).Date = DemoDate as unknown as DateConstructor;
const DAY = 86400000;
/** Moves the clock to the first day from today that `ok` likes. */
function goToDay(ok: (day: number) => boolean) {
  offset = 0;
  for (let i = 0; i < 400; i++) if (ok(localDay(RealDate.now() + i * DAY))) { offset = i * DAY; return; }
}
const SPOTS: Spot[] = [
  { label: 'Jour de marché', hint: 'La marchande t’attend dans la boutique de la ville du marché', go: async () => {
    goToDay((d) => marketTown(d) !== null);
    const town = marketTown(localDay())!;
    update((d) => { d.player.returnTo = { map: town, x: 5, y: 5 }; });
    await warpTo({ map: 'boutique', x: 4, y: 6, facing: 'up' });
  } },
  { label: 'Essaim du jour', hint: 'Sur la route du jour, une Bestiole sort une fois sur deux : marche dans les herbes', go: async () => {
    offset = 0;
    const sw = swarmOf(localDay(), save.value!);
    if (sw) await warpTo({ map: sw.map, x: 10, y: 10, facing: 'down' });
  } },
  { label: 'Bal des Étoiles', hint: 'Bourg-Paillette, un soir de décembre : parle à la danseuse', go: async () => {
    const now = new RealDate();
    const bal = new RealDate(now.getFullYear(), 11, 22, 21, 0);
    offset = bal.getTime() - now.getTime() + (bal < now ? 365 * DAY : 0);
    update((d) => (d.clockShift = shiftTo(21)));
    updateTime();
    await warpTo({ map: 'paillette', x: 16, y: 11, facing: 'up' });
  } },
  { label: 'Quoi de neuf ?', hint: 'L’aubergiste raconte les nouvelles du jour', go: async () => {
    update((d) => { d.player.returnTo = { map: 'paillette', x: 5, y: 5 }; });
    await warpTo({ map: 'centre', x: 5, y: 3, facing: 'up' });
  } },
];

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
      <p class="demo-sheet__title">Le calendrier</p>
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
          <p class="demo-eyebrow">Atelier Bestioles · démo 22</p>
          <h1>Le calendrier de Papeterre</h1>
          <p>Le vrai jeu, qui suit le calendrier de ton appareil : chaque jour un essaim sur une route, chaque semaine un marché dans une ville, et trois nuits de Bal des Étoiles en décembre. Ici, le panneau avance l’horloge jusqu’au bon jour pour te montrer chacun. À l’Auberge, demande « Quoi de neuf ? ».</p>
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
