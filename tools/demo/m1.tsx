/**
 * Demo page for the owner (M1a): every way into a battle, played with the game's own code (the
 * curtain, the intros, the VS splash and the real battle screen), on screenshots of the world.
 * Built by `npm run demo -- m1` into tools/out/demo-m1/ and published as an Artifact.
 */
import { render } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import '../../src/styles/global.css';
import './demo.css';
import { installSketch } from '../../src/ui/paper/sketch';
import { Curtain } from '../../src/ui/curtain/Curtain';
import { BattleScreen, type BattleProps } from '../../src/ui/battle/BattleScreen';
import { introOf, vsCardOf, type IntroInput } from '../../src/ui/battle/intro';
import { playIntro, playOutro } from '../../src/ui/curtain/transitions';
import { COVER_KINDS, REVEAL_KINDS, drawCurtain, type CoverKind, type RevealKind } from '../../src/ui/curtain/wipes';
import { createMon, type Mon } from '../../src/engine/pk/creature';
import { LOOKS, type Look } from '../../src/overworld/sprites';
import { DEFAULT_LOOKS, fromLook } from '../../src/data/appearance';
import { prefs, setPref } from '../../src/state/prefs';
import { playMusic, stopMusic, type TrackId } from '../../src/audio/music';
import { sfx } from '../../src/audio/sfx';
import { monArtUrl } from '../../src/ui/monArt';
import { L, tr, type LText } from '../../src/i18n';
import type { Backdrop } from '../../src/data/schema';

type World = 'grass' | 'cave' | 'water' | 'atelier';

interface Scene {
  id: string;
  label: string;
  hint: string;
  world: World;
  backdrop: Backdrop;
  music: TrackId;
  input: IntroInput;
  foe: { name: LText; party: [string, number][]; look?: Look; grey?: boolean; quote?: string };
}

const SCENES: Scene[] = [
  { id: 'herbe', label: 'Herbes hautes', hint: 'Bestiole sauvage', world: 'grass', backdrop: 'grass', music: 'wild',
    input: { kind: 'wild', ground: 'tallgrass' }, foe: { name: L('Piafou', 'Piafou'), party: [['013', 6]] } },
  { id: 'grotte', label: 'Grotte', hint: 'Bestiole sauvage', world: 'cave', backdrop: 'cave', music: 'wild',
    input: { kind: 'wild', ground: 'cave' }, foe: { name: L('Cailloutou', 'Cailloutou'), party: [['030', 9]] } },
  { id: 'eau', label: 'Au bord de l’eau', hint: 'Bestiole sauvage', world: 'water', backdrop: 'beach', music: 'wild',
    input: { kind: 'wild', ground: 'water' }, foe: { name: L('Berceluga', 'Berceluga'), party: [['060', 11]] } },
  { id: 'dresseur', label: 'Dresseur', hint: 'Gamin Léo', world: 'grass', backdrop: 'grass', music: 'trainer',
    input: { kind: 'trainer', music: 'trainer', trainerId: 'leo' },
    foe: { name: L('Gamin Léo', 'Kid Leo'), party: [['012', 5], ['006', 6]], look: LOOKS.kid, quote: 'Trop fort…' } },
  { id: 'gomme', label: 'Team Gomme', hint: 'Sbire', world: 'grass', backdrop: 'grass', music: 'gommeBattle',
    input: { kind: 'trainer', music: 'gommeBattle', grey: true, trainerId: 'r1g' },
    foe: { name: L('Sbire Gomme', 'Eraser Grunt'), party: [['056', 7]], look: LOOKS.gomme, grey: true, quote: 'Pfff, on se reverra !' } },
  { id: 'maitre', label: 'Maître d’Atelier', hint: 'Mireille', world: 'atelier', backdrop: 'grass', music: 'leader',
    input: { kind: 'trainer', music: 'leader', badge: 'pastel', trainerId: 'mireille' },
    foe: { name: L('Maître d’Atelier Mireille', 'Atelier Master Mireille'), party: [['012', 7], ['015', 8], ['007', 8]], look: LOOKS.leaderPastel, quote: 'Bravo, tu le mérites !' } },
  { id: 'rival', label: 'Rival', hint: 'Feutre', world: 'grass', backdrop: 'grass', music: 'rival',
    input: { kind: 'trainer', music: 'rival', trainerId: 'rivalLac' },
    foe: { name: L('Feutre', 'Marker'), party: [['025', 20]], look: LOOKS.rival, quote: 'La prochaine fois, c’est moi !' } },
  { id: 'effaceur', label: 'Grand Effaceur', hint: 'Boss', world: 'cave', backdrop: 'cave', music: 'final',
    input: { kind: 'trainer', music: 'final', trainerId: 'effaceur', grey: true },
    foe: { name: L('Le Grand Effaceur', 'The Great Eraser'), party: [['010', 40]], look: LOOKS.effaceur, grey: true } },
  { id: 'legende', label: 'Légendaire', hint: 'Libellune', world: 'grass', backdrop: 'grass', music: 'final',
    input: { kind: 'wild', music: 'final', legendary: true }, foe: { name: L('Libellune', 'Libellune'), party: [['071', 30]] } },
];

const ME = { name: 'Léa', look: DEFAULT_LOOKS.f };
let seed = 1;
const mon = (species: string, level: number): Mon => createMon(species, level, { rng: seed++ * 7919 });
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const isLandscape = () => window.matchMedia('(orientation: landscape) and (max-height: 540px)').matches;

type Phase = { at: 'menu' } | { at: 'sheet' } | { at: 'world'; scene: Scene; flash?: boolean } | { at: 'battle'; scene: Scene; props: BattleProps };

function worldUrl(w: World) {
  return `world/${w}-${isLandscape() ? 'l' : 'p'}.webp`;
}

function Demo() {
  const [started, setStarted] = useState(false);
  const [phase, setPhase] = useState<Phase>({ at: 'menu' });
  const [, redraw] = useState(0);
  const busy = useRef(false);

  const back = async (scene: Scene) => {
    await playOutro(() => setPhase({ at: 'world', scene }));
    await sleep(1400);
    stopMusic();
    setPhase({ at: 'menu' });
    busy.current = false;
  };

  const play = async (scene: Scene) => {
    if (busy.current) return;
    busy.current = true;
    setPhase({ at: 'world', scene });
    await sleep(900);
    if (scene.input.kind === 'wild') {
      // two white flashes, as when a wild Bestiole jumps out
      sfx.encounter();
      for (let i = 0; i < 2; i++) {
        setPhase({ at: 'world', scene, flash: true });
        await sleep(90);
        setPhase({ at: 'world', scene });
        await sleep(90);
      }
    } else await sleep(300);
    const enemy = scene.foe.party.map(([s, l]) => mon(s, l));
    const intro = introOf(scene.input);
    const card = intro.vs ? vsCardOf(intro.vs, {
      name: scene.foe.name, badge: scene.input.badge,
      person: scene.foe.look ? fromLook(scene.foe.look) : undefined,
      art: scene.input.kind === 'wild' ? monArtUrl(enemy[0]) : undefined,
    }, { person: ME.look, name: ME.name }) : undefined;
    const props: BattleProps = {
      setup: {
        kind: scene.input.kind, seed: seed++ * 104729,
        player: { name: L(ME.name, ME.name), party: [mon('021', 24), mon('009', 22)], isAI: false },
        enemy: { name: scene.foe.name, party: enemy, isAI: true },
      },
      bag: { 'crayon-ball': 10, potion: 5 },
      backdrop: scene.backdrop,
      playerLook: ME.look,
      music: scene.music,
      trainer: scene.input.kind === 'trainer' ? { title: tr(scene.foe.name), look: scene.foe.look ?? LOOKS.kid, quote: scene.foe.quote, grey: scene.foe.grey } : undefined,
      rewardLines: (r) => (r === 'win' && scene.input.kind === 'trainer' ? ['Tu gagnes 640 ₽.'] : []),
      onEnd: () => void back(scene),
    };
    playMusic(scene.music);
    await playIntro(intro, card, () => setPhase({ at: 'battle', scene, props }));
  };

  useEffect(() => {
    const again = () => redraw((n) => n + 1);
    window.addEventListener('resize', again);
    return () => window.removeEventListener('resize', again);
  }, []);

  return (
    <>
      {content()}
      {/* the transitions, at the same place whatever the phase (so the curtain is never remounted) */}
      <Curtain />
    </>
  );

  function content() {
  if (!started) {
    return (
      <div class="demo-start">
        <div class="demo-card">
          <p class="demo-eyebrow">Atelier Bestioles · démo</p>
          <h1>Combats en mouvement</h1>
          <p>Chaque bouton joue une vraie entrée de combat, avec le code du jeu : la transition dessinée, l’écran VS des boss, puis le combat qui s’ouvre. Quitte le combat (FUITE, ou gagne-le) pour voir la page qui tourne au retour.</p>
          <button class="demo-go" onClick={() => { sfx.confirm(); setStarted(true); }}>Lancer</button>
          <p class="demo-small">Le son démarre avec ce bouton.</p>
        </div>
      </div>
    );
  }

  if (phase.at === 'battle') {
    return (
      <div class="app">
        <BattleScreen key={phase.props.setup.seed} {...phase.props} />
        <button class="demo-quit" onClick={() => { if (phase.at === 'battle') void back(phase.scene); }}>Retour</button>
      </div>
    );
  }

  if (phase.at === 'sheet') return <Sheet onClose={() => setPhase({ at: 'menu' })} />;

  if (phase.at === 'world') {
    return (
      <div class="app demo-world" style={{ backgroundImage: `url(${worldUrl(phase.scene.world)})` }}>
        {phase.flash && <div class="demo-flash" />}
      </div>
    );
  }

  const speeds: [number, string][] = [[1, 'Normal'], [0.55, 'Rapide'], [0.3, 'Éclair']];
  return (
    <div class="demo-menu">
      <header>
        <h1>Combats en mouvement</h1>
        <p>Touchez une entrée de combat.</p>
      </header>
      <div class="demo-grid">
        {SCENES.map((s) => (
          <button key={s.id} class="demo-scene" onClick={() => void play(s)}>
            <span class="demo-scene__label">{s.label}</span>
            <span class="demo-scene__hint">{s.hint}{introOf(s.input).vs ? ' · écran VS' : ''}</span>
          </button>
        ))}
      </div>
      <button class="demo-scene demo-scene--wide" onClick={() => setPhase({ at: 'sheet' })}>
        <span class="demo-scene__label">Toutes les transitions, image par image</span>
        <span class="demo-scene__hint">Pour comparer les dessins à l’arrêt</span>
      </button>
      <section class="demo-opts" aria-label="Réglages">
        <div class="demo-opt">
          <span>Vitesse des combats</span>
          <div class="demo-seg">
            {speeds.map(([v, l]) => (
              <button key={v} class={prefs.value.battleAnim === v ? 'is-on' : ''} onClick={() => { setPref('battleAnim', v); redraw((n) => n + 1); }}>{l}</button>
            ))}
          </div>
        </div>
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
      </section>
    </div>
  );
  }
}

const COVER_NAMES: Record<CoverKind, string> = {
  grass: 'Herbes hautes', cave: 'Grotte', water: 'Eau', trainer: 'Dresseur', gomme: 'Team Gomme', boss: 'Boss', legend: 'Légendaire', page: 'Retour (page)',
};
const REVEAL_NAMES: Record<RevealKind, string> = { tear: 'Page déchirée', erase: 'Gommée', lift: 'Soulevée', fade: 'Fondu (doux)' };

/** One frozen moment of a transition, over a screenshot of the world. */
function Frame({ draw }: { draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const w = c.clientWidth, h = c.clientHeight, dpr = 1.5;
    c.width = w * dpr;
    c.height = h * dpr;
    const ctx = c.getContext('2d')!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw(ctx, w, h);
  }, []);
  return <canvas ref={ref} class="demo-frame" style={{ backgroundImage: `url(world/grass-p.webp)` }} />;
}

/** Every cover and reveal at a few moments, side by side. */
function Sheet({ onClose }: { onClose: () => void }) {
  const steps = [0.2, 0.4, 0.6, 0.8, 1];
  return (
    <div class="demo-menu">
      <header>
        <h1>Image par image</h1>
        <p>Chaque ligne : une transition à 20, 40, 60, 80 et 100 % de sa durée.</p>
      </header>
      <button class="demo-seg-back" onClick={onClose}>Retour au menu</button>
      <h2>Entrées</h2>
      {COVER_KINDS.map((k) => (
        <div class="demo-row" key={k}>
          <span class="demo-row__name">{COVER_NAMES[k]}</span>
          <div class="demo-row__frames">
            {steps.map((t) => <Frame key={t} draw={(ctx, w, h) => drawCurtain(ctx, w, h, { mode: 'cover', cover: k, t, seed: 7 }, 3)} />)}
          </div>
        </div>
      ))}
      <h2>Révélations</h2>
      {REVEAL_KINDS.map((k) => (
        <div class="demo-row" key={k}>
          <span class="demo-row__name">{REVEAL_NAMES[k]}</span>
          <div class="demo-row__frames">
            {[0, 0.25, 0.5, 0.75, 0.9].map((t) => <Frame key={t} draw={(ctx, w, h) => drawCurtain(ctx, w, h, { mode: 'reveal', cover: k === 'erase' ? 'gomme' : 'trainer', reveal: k, t, seed: 7 }, 3)} />)}
          </div>
        </div>
      ))}
    </div>
  );
}

installSketch();
// the demo starts with sound and music on, whatever was left from a previous visit
setPref('sound', prefs.value.sound ?? true);
render(<Demo />, document.getElementById('app')!);
