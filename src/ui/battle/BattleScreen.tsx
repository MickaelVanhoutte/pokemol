import { useEffect, useRef, useState } from 'preact/hooks';
import { L, tr } from '../../i18n';
import { monLabel } from '../../data/creatures';
import { item } from '../../data/items';
import { move } from '../../data/moves';
import { aiChoose } from '../../engine/pk/ai';
import { DIFFICULTY } from '../../data/trainers';
import {
  act, activeMon, blocked, createBattle, itemUsable, usableSlots,
  type Action, type BattleEvent, type BattleResult, type BattleSetup, type BattleState, type Step,
} from '../../engine/pk/battle';
import { sfx } from '../../audio/sfx';
import { playJingle, playMusic, stopMusic, type TrackId } from '../../audio/music';
import type { Backdrop } from '../../data/schema';
import type { Look } from '../../overworld/sprites';
import { prefs } from '../../state/prefs';
import { BagView } from '../views/BagView';
import { PartyView } from '../views/PartyView';
import { SummaryView } from '../views/SummaryView';
import { describe, eventDuration } from './messages';
import { BattleScene, type Fx } from './BattleScene';
import { BattlePanel } from './BattlePanel';
import { FxStage } from './fx/stage';
import { fxFor, MOVE_FX } from './fx/recipes';
import { moveOutcome } from './fx/outcome';
import { ballFx, eventFx } from './fx/events';
import type { Recipe } from './fx/core';
import { panelMode } from './panelMode';
import './battle.css';

export interface BattleProps {
  setup: BattleSetup;
  /** Bag contents when the battle starts. */
  bag: Record<string, number>;
  /** Called when an item is used, so the save can drop it from the bag. */
  onUseItem?: (id: string) => void;
  onEnd: (result: BattleResult, state: BattleState) => void;
  /** Extra lines shown when the battle is won (money…). */
  rewardLines?: (result: BattleResult, state: BattleState) => string[];
  backdrop?: Backdrop;
  /** First battle: the professor explains the menu. */
  tutorial?: boolean;
  /** Opponent trainer shown before the battle (and again with the defeat quote). */
  trainer?: BattleTrainer;
  /** Player character, seen from behind at the start. */
  playerLook?: Look;
  music?: TrackId;
}

export interface BattleTrainer {
  /** Class and name, e.g. "Gamine Zoé". */
  title: string;
  look: Look;
  /** Said in battle when beaten. */
  quote?: string;
  /** Team Gomme: their Bestioles have lost their colours. */
  grey?: boolean;
}

type Overlay = null | { kind: 'bag' } | { kind: 'party' } | { kind: 'target'; item: string } | { kind: 'learn' };

const sleep = (ms: number) => (ms <= 0 ? Promise.resolve() : new Promise((r) => setTimeout(r, ms)));

const COACH = [
  L('Touche ATTAQUE puis choisis une capacité. Une capacité efficace contre le type ennemi fait plus de dégâts !', 'Tap FIGHT then pick a move. Moves that are strong against the foe’s type do more damage!'),
  L('Dans le SAC : tes Potions et tes Crayon-balls. BESTIOLES sert à changer de Bestiole, et FUITE marche contre les Bestioles sauvages.', 'The BAG holds your Potions and Pencil Balls. CRITTERS lets you switch, and RUN works against wild Critters.'),
];

export function BattleScreen(props: BattleProps) {
  const stRef = useRef<BattleState | null>(null);
  const [st, setSt] = useState<BattleState | null>(null);
  const [view, setView] = useState<BattleState | null>(null);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(true);
  const [menu, setMenu] = useState<'main' | 'fight'>('main');
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [bagNote, setBagNote] = useState('');
  const [fx, setFx] = useState<Fx>({});
  const [captured, setCaptured] = useState(false);
  const [bag, setBag] = useState<Record<string, number>>({ ...props.bag });
  const [ended, setEnded] = useState(false);
  // tutorial: -1 off, 0 first page, 1 pulse FIGHT, 2 second page after the first move
  const [coach, setCoach] = useState(props.tutorial ? 0 : -1);
  const speed = useRef(prefs.value.battleAnim);
  // intro: the trainer and the player stand on the platforms until they send their Bestioles out
  const [cast, setCast] = useState<{ foe: boolean; me: boolean }>({ foe: !!props.trainer, me: !!props.playerLook });
  const [intro, setIntro] = useState(true);
  const [recolored, setRecolored] = useState<string[]>([]);
  const sceneRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<FxStage | null>(null);
  stageRef.current ??= new FxStage(() => sceneRef.current);
  const stage = stageRef.current;
  // the move whose animation is playing: later hits of a multi-hit move play it again
  const hitting = useRef<{ user: 0 | 1; recipe: Recipe; hits: number } | null>(null);
  // the move that just played its animation: the events right after it (its shield, its weather…) are already shown
  const shown = useRef<{ side: 0 | 1; status: boolean; until: number } | null>(null);

  const pulse = (side: 0 | 1, kind: string, ms = 500) => {
    setFx((f) => ({ ...f, [side]: kind }));
    setTimeout(() => setFx((f) => (f[side] === kind ? { ...f, [side]: undefined } : f)), ms);
  };
  // taking damage: the drawing blinks (and stays shown until it faints, if that was the last hit)
  const hurt = (side: 0 | 1) => {
    pulse(side, 'hit', 1300);
    stage.blink(side);
    sfx.hit();
  };

  const animate = async (e: BattleEvent, snap: BattleState, events: BattleEvent[], i: number) => {
    // back from the air or from under the ground (or knocked out of it)
    for (const side of [0, 1] as const) if (!snap.sides[side].vol.invuln && !(e.t === 'move' && e.side === side)) stage.reset(side);
    let anim: Promise<void> | null = null;
    if (e.t === 'sendOut') {
      // the trainer (or the player) steps aside and throws the ball
      if (e.side === 1) setCast((c) => ({ ...c, foe: false }));
      if (e.side === 0) setCast((c) => ({ ...c, me: false }));
      const sent = snap.sides[e.side].party[e.idx];
      if (sent) {
        setTimeout(() => sfx.cry(sent.species), 250 * speed.current);
        // a sparkly Bestiole twinkles as it comes out
        if (sent.shiny) setTimeout(() => { sfx.sparkle(); pulse(e.side, 'shiny', 1000); }, 650 * speed.current);
      }
    }
    if (e.t === 'faint' && e.side === 1 && props.trainer?.grey) {
      const uid = activeMon(snap.sides[1]).uid;
      setRecolored((r) => [...r, uid]);
      setMsg(tr(L('{n} retrouve ses couleurs !', '{n} got its colours back!'), { n: monLabel(activeMon(snap.sides[1])) }));
      sfx.sparkle();
      await sleep(1300 * speed.current);
    }
    const lines = describe(e, snap);
    // the ball shakes first, the result comes after
    if (e.t === 'ball') setMsg(tr(L('Tu lances une {i} !', 'You threw a {i}!'), { i: tr(item(e.item).name) }));
    else if (lines.length) setMsg(lines.join('\n'));
    if (e.t === 'move') shown.current = null;
    if (prefs.value.moveFx) {
      const covered = shown.current && i <= shown.current.until ? shown.current : null;
      const fxe = eventFx(e, snap, covered);
      if (fxe) anim = stage.play(fxe.recipe, { side: fxe.side, speed: speed.current });
      if (e.t === 'talent' && e.note === 'phased') stage.ghost(e.side, speed.current);
    }
    switch (e.t) {
      case 'sendOut': pulse(e.side, 'in', 600); if (e.side === 1) setCaptured(false); break;
      case 'withdraw': pulse(e.side, 'out', 600); break;
      case 'move': {
        hitting.current = null;
        const recipe = prefs.value.moveFx ? fxFor(e.move) : undefined;
        const out = recipe ? moveOutcome(events, i) : null;
        const opts = { side: e.side, speed: speed.current, crit: out?.crit, eff: out?.eff };
        if (recipe && out?.charge && recipe.charge) anim = stage.play(recipe, { ...opts, charge: true });
        else if (recipe && out?.lands) {
          anim = stage.play(recipe, opts);
          hitting.current = { user: e.side, recipe, hits: 0 };
          shown.current = { side: e.side, status: move(e.move).cat === 'status', until: i + 3 };
        } else if (recipe?.charge) anim = stage.play({ user: recipe.user, hit: 'none', layers: [] }, opts);
        else pulse(e.side, e.side === 0 ? 'lunge-me' : 'lunge-foe', 450);
        break;
      }
      case 'damage': if (e.amount) hurt(e.side); break;
      case 'confusedHit': case 'recoil': case 'weatherHurt': case 'trapHurt': case 'seedDrain': hurt(e.side); break;
      case 'subHit': sfx.hit(); break;
      case 'protect': case 'sub': sfx.confirm(); break;
      case 'frozen': pulse(e.side, 'status', 700); break;
      case 'faint': pulse(e.side, 'faint', 2000); sfx.ko(); break;
      case 'heal': case 'useItem': case 'berry': case 'regen': case 'itemHeal': sfx.heal(); break;
      case 'itemHurt': hurt(e.side); break;
      case 'levelUp': sfx.levelUp(); break;
      case 'status': pulse(e.side, 'status', 700); break;
      case 'ball': {
        // the ball flies, opens and swallows the Bestiole, shakes, then holds or bursts open
        const at = (ms: number, f: () => void) => setTimeout(f, ms * speed.current);
        anim = stage.play(ballFx(e.item, e.shakes, e.caught), { side: 0, speed: speed.current, keep: e.caught });
        at(450, () => setCaptured(true));
        const end = 890 + e.shakes * 650;
        if (e.caught) at(end, () => sfx.capture());
        else at(end, () => { setCaptured(false); pulse(1, 'in', 600); });
        break;
      }
      case 'end': if (e.result === 'win' || e.result === 'capture') { stopMusic(); playJingle(e.result === 'capture' ? 'caught' : 'victory', { fallback: sfx.victory, resume: false }); } break;
    }
    // an animation, and enough time to read the message
    const wait = sleep((e.t === 'move' && anim ? 600 : eventDuration(e)) * speed.current);
    await (anim ? Promise.all([anim, wait]) : wait);
    if (e.t === 'ball') {
      setMsg(lines.join('\n'));
      if (!e.caught) setCaptured(false);
      await sleep(900 * speed.current);
    }
  };

  const play = async (step: Step) => {
    for (let i = 0; i < step.events.length; i++) {
      const e = step.events[i];
      // each further hit of an animated move plays it again before the HP drops
      const h = hitting.current;
      if ((e.t === 'damage' || e.t === 'subHit') && h && e.side !== h.user && ++h.hits > 1) {
        await stage.play(h.recipe, { side: h.user, speed: speed.current, crit: e.crit, eff: e.eff, quick: true });
      }
      setView(step.snaps[i]);
      await animate(e, step.snaps[i], step.events, i);
    }
    setView(step.state);
  };

  const commit = (s: BattleState) => {
    stRef.current = s;
    setSt(s);
  };

  const dispatch = async (a: Action) => {
    const cur = stRef.current;
    if (!cur) return;
    setMenu('main');
    setOverlay(null);
    setBusy(true);
    try {
      const enemy: Action = a.type === 'learn' || a.type === 'replace' ? { type: 'move', slot: 0 } : aiChoose(cur, DIFFICULTY[prefs.value.difficulty].slip);
      const step = act(cur, a, enemy, true);
      commit(step.state);
      await play(step);
      if (step.state.result && !step.state.learnQueue.length) setEnded(true);
      if (a.type === 'move') setCoach((c) => (c === 1 ? 2 : c));
    } finally {
      setBusy(false);
    }
  };

  const useItemNow = (id: string, target?: number) => {
    setBag((b) => ({ ...b, [id]: (b[id] ?? 1) - 1 }));
    props.onUseItem?.(id);
    void dispatch(target === undefined ? { type: 'ball', item: id } : { type: 'item', item: id, target });
  };

  if (import.meta.env.DEV) {
    (window as unknown as Record<string, unknown>).__battle = { dispatch, state: () => stRef.current, speed };
    (window as unknown as Record<string, unknown>).__fx = {
      ids: () => Object.keys(MOVE_FX),
      play: (id: string, side: 0 | 1 = 0) => { const r = fxFor(id); return r ? stage.play(r, { side, speed: speed.current }) : null; },
      freeze: (id: string, frac: number, side: 0 | 1 = 0, charge = false) => { const r = fxFor(id); if (r) stage.freeze(r, { side, speed: 1, seed: 7, charge }, frac); return !!r; },
      clear: () => stage.clear(),
      ball: (item: string, shakes: number, caught: boolean) => stage.play(ballFx(item, shakes, caught), { side: 0, speed: speed.current, keep: caught }),
    };
  }

  useEffect(() => {
    playMusic(props.music ?? (props.trainer ? 'trainer' : 'wild'));
    const step = createBattle(props.setup, true);
    commit(step.state);
    setView(step.snaps[0] ?? step.state);
    (async () => {
      // platforms slide in, then the trainer challenges you
      await sleep(750);
      setIntro(false);
      if (props.trainer) {
        setMsg(tr(L('{t} veut se battre !', '{t} would like to battle!'), { t: props.trainer.title }));
        await sleep(1500 * speed.current);
      }
      await play(step);
      setBusy(false);
    })();
    return () => stage.stop();
  }, []);

  // a charged two-turn move goes off by itself on the next turn
  useEffect(() => {
    const s = stRef.current;
    const c = s?.sides[0].vol.charging;
    if (!s || busy || s.result || blocked(s) || !c) return;
    void dispatch({ type: 'move', slot: c.slot });
  }, [busy, st]);

  if (!st || !view) return <div class="battle" />;

  const me = st.sides[0];
  const active = activeMon(me);
  const learn = !busy && st.learnQueue.length ? st.learnQueue[0] : null;
  const learner = learn ? me.party.find((m) => m.uid === learn.uid) ?? null : null;
  const forced = !busy && !!st.needSwitch;
  const charging = !!me.vol.charging;
  const idle = !busy && !st.result && !blocked(st) && !charging;
  const coaching = coach === 0 || coach === 2;
  const mode = panelMode({ busy: busy || charging || (!!st.result && !ended && !learner), ended, coach: coaching && idle, learnPending: !!learner, forced, menu });

  const rewardLines = ended && st.result ? props.rewardLines?.(st.result, st) ?? [] : [];
  const beaten = ended && st.result === 'win' && !!props.trainer;
  const name = monLabel(active);
  const text = mode === 'continue' ? (beaten ? [props.trainer!.quote, ...rewardLines] : [msg, ...rewardLines]).filter(Boolean).join('\n')
    : mode === 'coach' ? tr(COACH[coach === 0 ? 0 : 1])
    : mode === 'learnAsk' && learner && learn ? tr(L('{n} veut apprendre {m}, mais connaît déjà 4 capacités. En oublier une ?', '{n} wants to learn {m}, but already knows 4 moves. Forget one?'), { n: monLabel(learner), m: tr(move(learn.move).name) })
    : forced ? tr(L('Quelle Bestiole envoyer ?', 'Which Critter will you send out?'))
    : mode === 'fight' ? tr(L('Quelle capacité ?', 'Which move?'))
    : mode === 'command' ? tr(L('Que doit faire {n} ?', 'What will {n} do?'), { n: name })
    : msg;

  return (
    <div class="battle pk" onDblClick={() => (speed.current = 0.35)}>
      <BattleScene
        view={view} fx={fx} captured={captured} backdrop={props.backdrop ?? 'grass'} intro={intro}
        foeTrainer={props.trainer && (cast.foe || beaten) ? props.trainer.look : undefined}
        playerBack={cast.me ? props.playerLook : undefined}
        grey={!!props.trainer?.grey} recolored={recolored} sceneRef={sceneRef}
      />
      <BattlePanel
        mode={mode}
        text={text}
        speaker={mode === 'coach' ? tr(L('Prof. Fusain', 'Prof. Charcoal')) : beaten && mode === 'continue' ? props.trainer!.title : undefined}
        active={active}
        struggling={!usableSlots(active, me.vol).length}
        usable={usableSlots(active, me.vol)}
        pulseAttack={coach === 1}
        onFight={() => setMenu('fight')}
        onBag={() => { setBagNote(''); setOverlay({ kind: 'bag' }); }}
        onParty={() => setOverlay({ kind: 'party' })}
        onRun={() => dispatch({ type: 'run' })}
        onMove={(slot) => dispatch({ type: 'move', slot })}
        onBack={() => setMenu('main')}
        onContinue={() => (mode === 'coach' ? setCoach((c) => (c === 0 ? 1 : -1)) : props.onEnd(st.result!, stRef.current!))}
        onLearnAnswer={(yes) => (yes ? setOverlay({ kind: 'learn' }) : dispatch({ type: 'learn', forget: null }))}
      />

      {overlay?.kind === 'bag' && (
        <BagView
          bag={bag}
          context="battle"
          note={bagNote}
          wild={st.kind === 'wild'}
          onClose={() => setOverlay(null)}
          onUse={(id) => {
            const kind = item(id).kind;
            if (kind === 'ball') {
              setOverlay(null);
              useItemNow(id);
            } else if (kind === 'battle') {
              // syrups and the like work on the creature fighting, like the GBA games
              if (!itemUsable(st, id, me.active)) return setBagNote(tr(L('Ça n’aura aucun effet.', 'It won’t have any effect.')));
              setOverlay(null);
              useItemNow(id, me.active);
            } else setOverlay({ kind: 'target', item: id });
          }}
        />
      )}
      {overlay?.kind === 'target' && (
        <PartyView
          party={me.party}
          mode="target"
          active={me.active}
          canPick={(i) => itemUsable(st, overlay.item, i)}
          message={tr(L('Utiliser {i} sur quelle Bestiole ?', 'Use {i} on which Critter?'), { i: tr(item(overlay.item).name) })}
          onPick={(i) => useItemNow(overlay.item, i)}
          onClose={() => setOverlay({ kind: 'bag' })}
        />
      )}
      {(overlay?.kind === 'party' || forced) && (
        <PartyView
          party={me.party}
          mode={forced ? 'forced' : 'battle'}
          active={me.active}
          canPick={(i) => i !== me.active && me.party[i].hp > 0 && (forced || !me.vol.trap)}
          refuse={!forced && me.vol.trap ? () => tr(L('{n} est ligoté : impossible de changer de Bestiole !', '{n} is tied up: it can’t be switched out!'), { n: monLabel(active) }) : undefined}
          message={forced ? tr(L('Quelle Bestiole envoyer ?', 'Which Critter will you send out?')) : undefined}
          onPick={(i) => dispatch(forced ? { type: 'replace', to: i } : { type: 'switch', to: i })}
          onClose={() => setOverlay(null)}
        />
      )}
      {overlay?.kind === 'learn' && learner && learn && (
        <SummaryView
          mon={learner}
          onClose={() => setOverlay(null)}
          learn={{ move: learn.move, onPick: (forget) => dispatch({ type: 'learn', forget }) }}
        />
      )}
    </div>
  );
}
