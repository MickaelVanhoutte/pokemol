/**
 * Battle demo pages for the owner (`m1b`, `m1c`): each scene is a real battle, with the game's own
 * screens, whose seed was searched so that its first move does what the scene shows (a critical hit, a
 * final blow, HP running low…); that move goes off by itself. Built in development mode (`DEV` in
 * make.ts) for the `window.__battle` handle.
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
import { createMon, maxHp, type Mon } from '../../src/engine/pk/creature';
import { act, createBattle, type BattleEvent, type BattleSetup, type BattleState } from '../../src/engine/pk/battle';
import { aiChoose } from '../../src/engine/pk/ai';
import { DIFFICULTY } from '../../src/data/trainers';
import { LOOKS, type Look } from '../../src/overworld/sprites';
import { DEFAULT_LOOKS, fromLook } from '../../src/data/appearance';
import { prefs, setPref } from '../../src/state/prefs';
import { playMusic, stopMusic, type TrackId } from '../../src/audio/music';
import { sfx } from '../../src/audio/sfx';
import { monArtUrl } from '../../src/ui/monArt';
import { moveOutcome } from '../../src/ui/battle/fx/outcome';
import { L, tr, type LText } from '../../src/i18n';
import type { Backdrop } from '../../src/data/schema';

export type World = 'grass' | 'cave' | 'water' | 'atelier';

export interface Scene {
  id: string;
  label: string;
  hint: string;
  world: World;
  backdrop: Backdrop;
  music: TrackId;
  input: IntroInput;
  me: [string, number, string[]];
  /** Teammates behind your Bestiole (species, level). */
  mates?: [string, number][];
  /** Your Bestiole starts with this share of its HP. */
  meHp?: number;
  /** Your Bestiole is one point short of its next level. */
  xpShort?: boolean;
  foe: {
    name: LText; party: [string, number][]; look?: Look; quote?: string; moves?: string[];
    /** Its first Bestiole starts with this share of its HP. */
    hp?: number;
    /** Its last Bestiole (the ace) is sparkly and nicknamed. */
    ace?: { shiny?: boolean; nickname?: string };
    /** How the trainer battles (src/engine/pk/ai.ts): thinking ahead, switches, potions. */
    brain?: Pick<BattleSetup['enemy'], 'smart' | 'switches' | 'items'>;
  };
  /** Prize money for a won trainer battle. */
  money?: number;
  /** What the first turn must do, read from its events (and the battle after it). */
  want: (events: BattleEvent[], after: BattleState) => boolean;
}

export const myHit = (events: BattleEvent[]) => events.filter((e): e is Extract<BattleEvent, { t: 'damage' }> => e.t === 'damage' && e.side === 1);
export const foeFaints = (events: BattleEvent[]) => events.some((e) => e.t === 'faint' && e.side === 1);
/** Our move knocks the foe out by itself (the game's own test for the final blow). */
export const finalBlow = (events: BattleEvent[]) => moveOutcome(events, events.findIndex((e) => e.t === 'move' && e.side === 0)).ko;


const ME = { name: 'Léa', look: DEFAULT_LOOKS.f };
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const isLandscape = () => window.matchMedia('(orientation: landscape) and (max-height: 540px)').matches;
const worldUrl = (w: World) => `world/${w}-${isLandscape() ? 'l' : 'p'}.webp`;

/** The two teams of a scene, made the same way every time (so a seed always plays out the same). */
function teams(scene: Scene): [Mon[], Mon[]] {
  const [sp, lv, moves] = scene.me;
  const me = createMon(sp, lv, { rng: 101 }, { hp: 20, atk: 20, def: 20, spa: 20, spd: 20, spe: 31 });
  me.moves = moves.map((id) => ({ id, pp: 25 }));
  if (scene.meHp !== undefined) me.hp = Math.max(1, Math.round(maxHp(me) * scene.meHp));
  if (scene.xpShort) me.xp = createMon(sp, lv + 1, { rng: 101 }).xp - 1;
  const foe = scene.foe.party.map(([s, l], i) => {
    const m = createMon(s, l, { rng: 202 + i }, { hp: 20, atk: 10, def: 10, spa: 10, spd: 10, spe: 1 });
    if (scene.foe.moves) m.moves = scene.foe.moves.map((id) => ({ id, pp: 30 }));
    if (i === 0 && scene.foe.hp !== undefined) m.hp = Math.max(1, Math.round(maxHp(m) * scene.foe.hp));
    if (i === scene.foe.party.length - 1 && scene.foe.ace) Object.assign(m, scene.foe.ace);
    return m;
  });
  const mates = (scene.mates ?? []).map(([s, l], i) => createMon(s, l, { rng: 150 + i }, { hp: 20, atk: 20, def: 20, spa: 20, spd: 20, spe: 20 }));
  return [[me, ...mates], foe];
}

function setupOf(scene: Scene, seed: number): BattleSetup {
  const [me, foe] = teams(scene);
  return {
    kind: scene.input.kind, seed,
    player: { name: L(ME.name, ME.name), party: me, isAI: false },
    enemy: { name: scene.foe.name, party: foe, isAI: true, ...scene.foe.brain },
  };
}

/** The first seed whose first turn (our first move) does what the scene wants. */
function seedFor(scene: Scene): number {
  for (let seed = 1; seed < 4000; seed++) {
    const st = createBattle(setupOf(scene, seed), true).state;
    try {
      const step = act(st, { type: 'move', slot: 0 }, aiChoose(st, DIFFICULTY.normal.slip), true);
      if (scene.want(step.events, step.state)) return seed;
    } catch {
      // a seed that can't play this turn
    }
  }
  return 1;
}

type Phase = { at: 'menu' } | { at: 'world'; scene: Scene; flash?: boolean } | { at: 'battle'; scene: Scene; props: BattleProps };

export interface DemoText { eyebrow: string; title: string; intro: string }

function Demo({ scenes, text }: { scenes: Scene[]; text: DemoText }) {
  const [started, setStarted] = useState(false);
  const [phase, setPhase] = useState<Phase>({ at: 'menu' });
  const [, redraw] = useState(0);
  const busy = useRef(false);

  const back = async (scene: Scene) => {
    await playOutro(() => setPhase({ at: 'world', scene }));
    await sleep(1200);
    stopMusic();
    setPhase({ at: 'menu' });
    busy.current = false;
  };

  const play = async (scene: Scene) => {
    if (busy.current) return;
    busy.current = true;
    const seed = seedFor(scene);
    setPhase({ at: 'world', scene });
    await sleep(700);
    if (scene.input.kind === 'wild') {
      sfx.encounter();
      for (let i = 0; i < 2; i++) {
        setPhase({ at: 'world', scene, flash: true });
        await sleep(90);
        setPhase({ at: 'world', scene });
        await sleep(90);
      }
    } else await sleep(300);
    const setup = setupOf(scene, seed);
    const intro = introOf(scene.input);
    const card = intro.vs ? vsCardOf(intro.vs, {
      name: scene.foe.name, badge: scene.input.badge,
      person: scene.foe.look ? fromLook(scene.foe.look) : undefined,
      art: scene.input.kind === 'wild' ? monArtUrl(setup.enemy.party[0]) : undefined,
    }, { person: ME.look, name: ME.name }) : undefined;
    const props: BattleProps = {
      setup,
      bag: { 'crayon-ball': 10, potion: 5 },
      backdrop: scene.backdrop,
      playerLook: ME.look,
      music: scene.music,
      trainer: scene.input.kind === 'trainer' ? { title: tr(scene.foe.name), look: scene.foe.look ?? LOOKS.kid, quote: scene.foe.quote } : undefined,
      rewardLines: (r) => (r === 'win' && scene.input.kind === 'trainer' ? [`Tu gagnes ${scene.money ?? 640} ₽.`] : []),
      reward: scene.input.kind === 'trainer' ? { money: scene.money ?? 640 } : undefined,
      onEnd: () => void back(scene),
    };
    playMusic(scene.music);
    await playIntro(intro, card, () => setPhase({ at: 'battle', scene, props }));
    // the first move goes off by itself once the menu is up
    for (let i = 0; i < 100; i++) {
      await sleep(200);
      if (document.querySelector('.gba-btn--attack')) break;
    }
    await sleep(700);
    const handle = (window as unknown as { __battle?: { dispatch: (a: unknown) => Promise<void> } }).__battle;
    void handle?.dispatch({ type: 'move', slot: 0 });
  };

  useEffect(() => {
    const again = () => redraw((n) => n + 1);
    window.addEventListener('resize', again);
    return () => window.removeEventListener('resize', again);
  }, []);

  return (
    <>
      {content()}
      <Curtain />
    </>
  );

  function content() {
    if (!started) {
      return (
        <div class="demo-start">
          <div class="demo-card">
            <p class="demo-eyebrow">{text.eyebrow}</p>
            <h1>{text.title}</h1>
            <p>{text.intro}</p>
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
    if (phase.at === 'world') {
      return (
        <div class="app demo-world" style={{ backgroundImage: `url(${worldUrl(phase.scene.world)})` }}>
          {phase.flash && <div class="demo-flash" />}
        </div>
      );
    }
    const speeds: [number, string][] = [[1, 'Normal'], [0.55, 'Rapide'], [0.3, 'Éclair']];
    const toggles: [string, () => boolean, (v: boolean) => void, [string, string]][] = [
      ['Animations', () => prefs.value.moveFx, (v) => setPref('moveFx', v), ['Oui', 'Non']],
      ['Mouvements', () => prefs.value.motion === 'full', (v) => setPref('motion', v ? 'full' : 'calm'), ['Normaux', 'Doux']],
      ['Son', () => prefs.value.sound, (v) => { setPref('sound', v); setPref('music', v); if (!v) stopMusic(); }, ['Oui', 'Non']],
    ];
    return (
      <div class="demo-menu">
        <header>
          <h1>{text.title}</h1>
          <p>Touchez une scène.</p>
        </header>
        <div class="demo-grid">
          {scenes.map((s) => (
            <button key={s.id} class="demo-scene" onClick={() => void play(s)}>
              <span class="demo-scene__label">{s.label}</span>
              <span class="demo-scene__hint">{s.hint}</span>
            </button>
          ))}
        </div>
        <section class="demo-opts" aria-label="Réglages">
          <div class="demo-opt">
            <span>Vitesse des combats</span>
            <div class="demo-seg">
              {speeds.map(([v, l]) => (
                <button key={v} class={prefs.value.battleAnim === v ? 'is-on' : ''} onClick={() => { setPref('battleAnim', v); redraw((n) => n + 1); }}>{l}</button>
              ))}
            </div>
          </div>
          {toggles.map(([label, get, set, names]) => (
            <div class="demo-opt" key={label}>
              <span>{label}</span>
              <div class="demo-seg">
                {[true, false].map((v) => (
                  <button key={String(v)} class={get() === v ? 'is-on' : ''} onClick={() => { set(v); redraw((n) => n + 1); }}>{v ? names[0] : names[1]}</button>
                ))}
              </div>
            </div>
          ))}
        </section>
      </div>
    );
  }
}

/** Starts a battle demo page: its texts and scenes. */
export function startBattleDemo(text: DemoText, scenes: Scene[]) {
  installSketch();
  render(<Demo scenes={scenes} text={text} />, document.getElementById('app')!);
}
