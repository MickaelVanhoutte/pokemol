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
import { playMusic, stopMusic, type TrackId } from '../../audio/music';
import type { Backdrop } from '../../data/schema';
import type { Look } from '../../overworld/sprites';
import { prefs } from '../../state/prefs';
import { BagView } from '../views/BagView';
import { PartyView } from '../views/PartyView';
import { SummaryView } from '../views/SummaryView';
import { describe, eventDuration } from './messages';
import { BattleScene, type BallFx, type Fx } from './BattleScene';
import { BattlePanel } from './BattlePanel';
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
  const [ball, setBall] = useState<BallFx | null>(null);
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

  const pulse = (side: 0 | 1, kind: string, ms = 500) => {
    setFx((f) => ({ ...f, [side]: kind }));
    setTimeout(() => setFx((f) => (f[side] === kind ? { ...f, [side]: undefined } : f)), ms);
  };

  const animate = async (e: BattleEvent, snap: BattleState) => {
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
    switch (e.t) {
      case 'sendOut': pulse(e.side, 'in', 600); if (e.side === 1) setCaptured(false); break;
      case 'withdraw': pulse(e.side, 'out', 600); break;
      case 'move': pulse(e.side, e.side === 0 ? 'lunge-me' : 'lunge-foe', 450); break;
      case 'damage': if (e.amount) { pulse(e.side, 'hit', 600); sfx.hit(); } break;
      case 'confusedHit': case 'recoil': pulse(e.side, 'hit', 600); sfx.hit(); break;
      case 'faint': pulse(e.side, 'faint', 2000); sfx.ko(); break;
      case 'heal': case 'useItem': case 'berry': case 'regen': case 'itemHeal': sfx.heal(); break;
      case 'itemHurt': pulse(e.side, 'hit', 600); sfx.hit(); break;
      case 'levelUp': sfx.levelUp(); break;
      case 'status': pulse(e.side, 'status', 700); break;
      case 'ball':
        setBall({ shakes: e.shakes, caught: e.caught, key: Date.now() });
        setCaptured(true);
        if (e.caught) setTimeout(() => sfx.capture(), 400 + e.shakes * 650);
        break;
      case 'end': if (e.result === 'win' || e.result === 'capture') { stopMusic(); sfx.victory(); } break;
    }
    await sleep(eventDuration(e) * speed.current);
    if (e.t === 'ball') {
      setMsg(lines.join('\n'));
      if (!e.caught) {
        setBall(null);
        setCaptured(false);
      }
      await sleep(900 * speed.current);
      setBall(null);
    }
  };

  const play = async (step: Step) => {
    for (let i = 0; i < step.events.length; i++) {
      setView(step.snaps[i]);
      await animate(step.events[i], step.snaps[i]);
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
  }, []);

  if (!st || !view) return <div class="battle" />;

  const me = st.sides[0];
  const active = activeMon(me);
  const learn = !busy && st.learnQueue.length ? st.learnQueue[0] : null;
  const learner = learn ? me.party.find((m) => m.uid === learn.uid) ?? null : null;
  const forced = !busy && !!st.needSwitch;
  const idle = !busy && !st.result && !blocked(st);
  const coaching = coach === 0 || coach === 2;
  const mode = panelMode({ busy: busy || (!!st.result && !ended && !learner), ended, coach: coaching && idle, learnPending: !!learner, forced, menu });

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
        view={view} fx={fx} ball={ball} captured={captured} backdrop={props.backdrop ?? 'grass'} intro={intro}
        foeTrainer={props.trainer && (cast.foe || beaten) ? props.trainer.look : undefined}
        playerBack={cast.me ? props.playerLook : undefined}
        grey={!!props.trainer?.grey} recolored={recolored}
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
          canPick={(i) => i !== me.active && me.party[i].hp > 0}
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
