import { useEffect, useRef, useState } from 'preact/hooks';
import { L, tr } from '../../i18n';
import { creature } from '../../data/creatures';
import { item } from '../../data/items';
import { move } from '../../data/moves';
import { aiChoose } from '../../engine/pk/ai';
import {
  act, activeMon, blocked, createBattle, itemUsable, usableSlots,
  type Action, type BattleEvent, type BattleResult, type BattleSetup, type BattleState, type Step,
} from '../../engine/pk/battle';
import { sfx } from '../../audio/sfx';
import type { Backdrop } from '../../data/schema';
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
  const [fx, setFx] = useState<Fx>({});
  const [ball, setBall] = useState<BallFx | null>(null);
  const [captured, setCaptured] = useState(false);
  const [bag, setBag] = useState<Record<string, number>>({ ...props.bag });
  const [ended, setEnded] = useState(false);
  // tutorial: -1 off, 0 first page, 1 pulse FIGHT, 2 second page after the first move
  const [coach, setCoach] = useState(props.tutorial ? 0 : -1);
  const speed = useRef(prefs.value.battleAnim);

  const pulse = (side: 0 | 1, kind: string, ms = 500) => {
    setFx((f) => ({ ...f, [side]: kind }));
    setTimeout(() => setFx((f) => (f[side] === kind ? { ...f, [side]: undefined } : f)), ms);
  };

  const animate = async (e: BattleEvent, snap: BattleState) => {
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
      case 'heal': case 'useItem': sfx.heal(); break;
      case 'levelUp': sfx.levelUp(); break;
      case 'status': pulse(e.side, 'status', 700); break;
      case 'ball':
        setBall({ shakes: e.shakes, caught: e.caught, key: Date.now() });
        setCaptured(true);
        if (e.caught) setTimeout(() => sfx.capture(), 400 + e.shakes * 650);
        break;
      case 'end': if (e.result === 'win') sfx.victory(); break;
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
      const enemy: Action = a.type === 'learn' || a.type === 'replace' ? { type: 'move', slot: 0 } : aiChoose(cur);
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
    const step = createBattle(props.setup, true);
    commit(step.state);
    (async () => {
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
  const name = tr(creature(active.species).name);
  const text = mode === 'continue' ? [msg, ...rewardLines].filter(Boolean).join('\n')
    : mode === 'coach' ? tr(COACH[coach === 0 ? 0 : 1])
    : mode === 'learnAsk' && learner && learn ? tr(L('{n} veut apprendre {m}, mais connaît déjà 4 capacités. En oublier une ?', '{n} wants to learn {m}, but already knows 4 moves. Forget one?'), { n: tr(creature(learner.species).name), m: tr(move(learn.move).name) })
    : forced ? tr(L('Quelle Bestiole envoyer ?', 'Which Critter will you send out?'))
    : mode === 'fight' ? tr(L('Quelle capacité ?', 'Which move?'))
    : mode === 'command' ? tr(L('Que doit faire {n} ?', 'What will {n} do?'), { n: name })
    : msg;

  return (
    <div class="battle pk" onDblClick={() => (speed.current = 0.35)}>
      <BattleScene view={view} fx={fx} ball={ball} captured={captured} backdrop={props.backdrop ?? 'grass'} />
      <BattlePanel
        mode={mode}
        text={text}
        speaker={mode === 'coach' ? tr(L('Prof. Fusain', 'Prof. Charcoal')) : undefined}
        active={active}
        struggling={!usableSlots(active).length}
        pulseAttack={coach === 1}
        onFight={() => setMenu('fight')}
        onBag={() => setOverlay({ kind: 'bag' })}
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
          wild={st.kind === 'wild'}
          onClose={() => setOverlay(null)}
          onUse={(id) => {
            if (item(id).kind === 'ball') {
              setOverlay(null);
              useItemNow(id);
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
