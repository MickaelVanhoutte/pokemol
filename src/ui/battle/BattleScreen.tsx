import { useEffect, useRef, useState } from 'preact/hooks';
import { t, tr } from '../../i18n';
import { creature } from '../../data/creatures';
import { support } from '../../data/supportCards';
import type { CreatureDef, SupportDef } from '../../data/schema';
import { aiStep } from '../../engine/battle/ai';
import {
  activeOf, applyAction, attackProblem, blocked, canAttachEnergy, canAttack, canPlay, captureChance,
  createBattle, playTargets, retreatTargets, type Step,
} from '../../engine/battle/engine';
import type { Action, BattleEvent, BattleResult, BattleSetup, BattleState, Side } from '../../engine/battle/types';
import { Card, SupportCard, TypeIcon, damageLabel } from '../Card';
import { FieldCard, type Floater } from './FieldCard';
import { describe, eventDuration, fighterName } from './messages';
import './battle.css';

export interface BattleProps {
  setup: BattleSetup;
  /** Blank cards available for capture (wild battles). */
  blankCards?: number;
  captureBonus?: number;
  onUseBlank?: () => void;
  onEnd: (result: BattleResult, state: BattleState) => void;
  /** Extra lines shown on the result panel (rewards, XP…), computed by the caller. */
  rewardLines?: (result: BattleResult, state: BattleState) => string[];
  backdrop?: 'grass' | 'cave' | 'tower' | 'lab' | 'forest';
}

type Mode =
  | null
  | { kind: 'energy' }
  | { kind: 'retreat' }
  | { kind: 'card'; hand: number; targets: number[] };

const sleep = (ms: number) => (ms <= 0 ? Promise.resolve() : new Promise((r) => setTimeout(r, ms)));

/** Battle animation speed multiplier (1 = normal, 0.5 = fast), remembered per device. */
export function battleSpeed(): number {
  try {
    return Number(localStorage.getItem('atelier-bestioles.speed') ?? '1') || 1;
  } catch {
    return 1;
  }
}

export function BattleScreen(props: BattleProps) {
  const { setup } = props;
  const stRef = useRef<BattleState | null>(null);
  const [st, setSt] = useState<BattleState | null>(null);
  const [view, setView] = useState<BattleState | null>(null);
  const [msg, setMsg] = useState<string>('');
  const [busy, setBusy] = useState(true);
  const [mode, setMode] = useState<Mode>(null);
  const [zoom, setZoom] = useState<CreatureDef | SupportDef | null>(null);
  const [preview, setPreview] = useState<number | null>(null);
  const [fx, setFx] = useState<Record<string, string>>({});
  const [floaters, setFloaters] = useState<Floater[]>([]);
  const [coin, setCoin] = useState<{ heads: boolean; key: number } | null>(null);
  const [captured, setCaptured] = useState<string | null>(null);
  const [ended, setEnded] = useState<BattleResult | null>(null);
  const [blanks, setBlanks] = useState(props.blankCards ?? 0);
  const floaterId = useRef(0);
  const speed = useRef(battleSpeed());

  const flash = (uid: string, kind: string, text?: string, fkind: Floater['kind'] = 'dmg') => {
    setFx((m) => ({ ...m, [uid]: kind }));
    setTimeout(() => setFx((m) => {
      const n = { ...m };
      if (n[uid] === kind) delete n[uid];
      return n;
    }), 600);
    if (text) {
      const id = ++floaterId.current;
      setFloaters((l) => [...l, { id, uid, text, kind: fkind }]);
      setTimeout(() => setFloaters((l) => l.filter((x) => x.id !== id)), 1100);
    }
  };

  const animate = async (e: BattleEvent, snap: BattleState) => {
    const lines = describe(e, snap);
    if (lines.length) setMsg(lines.join(' '));
    const uidOf = (side: Side, f: number) => snap.sides[side].fighters[f]?.uid ?? '';
    switch (e.t) {
      case 'damage': flash(uidOf(e.side, e.f), 'hit', `−${e.amount}`); break;
      case 'heal': flash(uidOf(e.side, e.f), 'heal', `+${e.amount}`, 'heal'); break;
      case 'ko': flash(uidOf(e.side, e.f), 'ko'); break;
      case 'attack': flash(uidOf(e.side, e.f), e.side === 0 ? 'lunge-up' : 'lunge-down'); break;
      case 'energy': flash(uidOf(e.side, e.f), 'glow', `+${e.amount}⚡`, 'info'); break;
      case 'status': flash(uidOf(e.side, e.f), 'status'); break;
      case 'coin': setCoin({ heads: e.heads, key: Date.now() }); break;
      case 'capture':
        if (e.success) setCaptured(snap.sides[1].fighters[0].defId);
        else flash(uidOf(1, 0), 'hit');
        break;
    }
    await sleep(eventDuration(e) * speed.current);
    if (e.t === 'coin') setCoin(null);
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

  const runAI = async () => {
    let cur = stRef.current!;
    let guard = 0;
    while (cur.turn === 1 && !cur.result && !blocked(cur) && guard++ < 40) {
      await sleep(350 * speed.current);
      const step = applyAction(cur, aiStep(cur), true);
      cur = step.state;
      commit(cur);
      await play(step);
    }
  };

  const finishIfOver = (s: BattleState) => {
    if (s.result) {
      setEnded(s.result);
      return true;
    }
    return false;
  };

  const dispatch = async (action: Action) => {
    const cur = stRef.current;
    if (!cur) return;
    setMode(null);
    setPreview(null);
    setBusy(true);
    try {
      const step = applyAction(cur, action, true);
      commit(step.state);
      await play(step);
      if (!finishIfOver(step.state)) {
        await runAI();
        finishIfOver(stRef.current!);
      }
    } finally {
      setBusy(false);
    }
  };

  if (import.meta.env.DEV) {
    (window as unknown as Record<string, unknown>).__battle = { dispatch, state: () => stRef.current, speed };
  }

  useEffect(() => {
    const step = createBattle(setup, true);
    commit(step.state);
    (async () => {
      await play(step);
      setBusy(false);
    })();
  }, []);

  if (!st || !view) return <div class="battle" />;

  const me = view.sides[0];
  const foe = view.sides[1];
  const myTurn = !busy && !ended && st.turn === 0 && !blocked(st);
  const choosing = !busy && !ended && st.sides[0].mustChooseActive;
  const active = activeOf(st.sides[0]);
  const activeDef = creature(active.defId);
  const wild = st.kind === 'wild';
  const wildName = wild ? fighterName(view, 1, 0) : undefined;

  const selectableMine = (i: number): boolean => {
    if (choosing) return !st.sides[0].fighters[i].ko && i !== st.sides[0].active;
    if (!myTurn || !mode) return false;
    if (mode.kind === 'energy') return canAttachEnergy(st, 0, i);
    if (mode.kind === 'retreat') return retreatTargets(st, 0).includes(i);
    return mode.targets.includes(i);
  };

  const onMine = (i: number) => {
    if (choosing) return dispatch({ type: 'chooseActive', fighter: i });
    if (!mode) return;
    if (mode.kind === 'energy') return dispatch({ type: 'attachEnergy', fighter: i });
    if (mode.kind === 'retreat') return dispatch({ type: 'retreat', to: i });
    return dispatch({ type: 'playCard', hand: mode.hand, target: i });
  };

  const startEnergy = () => {
    const alive = st.sides[0].fighters.map((_, i) => i).filter((i) => canAttachEnergy(st, 0, i));
    if (alive.length === 1) dispatch({ type: 'attachEnergy', fighter: alive[0] });
    else setMode({ kind: 'energy' });
  };

  const playFromPreview = (hi: number) => {
    const targets = playTargets(st, 0, hi);
    if (targets === null) return dispatch({ type: 'playCard', hand: hi });
    if (targets.length === 1) return dispatch({ type: 'playCard', hand: hi, target: targets[0] });
    setPreview(null);
    setMode({ kind: 'card', hand: hi, targets });
  };

  const prompt = choosing
    ? t('battle.chooseActive')
    : mode?.kind === 'energy' ? t('battle.pick.energy')
    : mode?.kind === 'retreat' ? t('battle.pick.retreat')
    : mode?.kind === 'card' ? t('battle.pick.card')
    : msg;

  const bench = (sideIdx: Side) => {
    const s = view.sides[sideIdx];
    return s.fighters.map((f, i) => (i === s.active ? null : (
      <FieldCard
        key={f.uid}
        f={f}
        size="bench"
        fx={fx[f.uid]}
        floaters={floaters.filter((x) => x.uid === f.uid)}
        selectable={sideIdx === 0 && selectableMine(i)}
        onClick={() => onMine(i)}
        onInfo={() => setZoom(creature(f.defId))}
      />
    )));
  };

  const result = ended;
  const rewardLines = result && props.rewardLines ? props.rewardLines(result, st) : [];
  const chance = wild ? Math.round(captureChance(st, props.captureBonus ?? 0) * 100) : 0;

  return (
    <div class={`battle backdrop-${props.backdrop ?? 'grass'}`} onDblClick={() => (speed.current = 0.35)}>
      <div class="battle__foe-bar">
        <span class="battle__who">{wild ? wildName : tr(foe.name)}</span>
        {!wild && (
          <span class="battle__counts">
            <span class="mini-backs">{foe.hand.map(() => <i />)}</span>
            {t('battle.deck', { n: foe.deck.length })}
          </span>
        )}
      </div>
      <div class="battle__arena">
        <div class="battle__bench battle__bench--foe">{bench(1)}</div>
        <div class="slot slot--foe">
          <FieldCard
            f={activeOf(foe)}
            size="active"
            wildName={wildName}
            fx={fx[activeOf(foe).uid]}
            floaters={floaters.filter((x) => x.uid === activeOf(foe).uid)}
            onInfo={() => setZoom(creature(activeOf(foe).defId))}
          />
        </div>
        <div class="slot slot--me">
          <FieldCard
            f={activeOf(me)}
            size="active"
            fx={fx[activeOf(me).uid]}
            floaters={floaters.filter((x) => x.uid === activeOf(me).uid)}
            selectable={selectableMine(me.active)}
            onClick={() => onMine(me.active)}
            onInfo={() => setZoom(creature(activeOf(me).defId))}
          />
        </div>
        <div class="battle__bench battle__bench--me">{bench(0)}</div>
      </div>

      <div class="battle__msg pixel" aria-live="polite">{prompt}</div>

      <div class="battle__controls">
        {activeDef.attacks.map((a, i) => {
          const why = attackProblem(st, 0, i);
          return (
            <button class="atk-btn" disabled={!myTurn || !canAttack(st, 0, i) || !!mode} onClick={() => dispatch({ type: 'attack', attack: i })}>
              <span class="atk-btn__cost">
                {a.cost ? Array.from({ length: a.cost }, () => <TypeIcon type={activeDef.type} size="1.1em" />) : '—'}
              </span>
              <span class="atk-btn__name">
                {tr(a.name)}
                {myTurn && why ? <small class="atk-btn__why">{t(`battle.why.${why}`)}</small> : null}
              </span>
              <span class="atk-btn__dmg">{damageLabel(a)}</span>
            </button>
          );
        })}
        <div class="battle__row">
          {mode ? (
            <button class="btn btn--small" onClick={() => setMode(null)}>{t('battle.btn.cancel')}</button>
          ) : (
            <>
              <button class="btn btn--small btn--energy" disabled={!myTurn || st.sides[0].energyAttached} onClick={startEnergy}>
                ⚡ {t('battle.btn.energy')}
              </button>
              <button class="btn btn--small" disabled={!myTurn || !retreatTargets(st, 0).length} onClick={() => setMode({ kind: 'retreat' })}>
                ↩ {t('battle.btn.retreat')} ({activeDef.retreat})
              </button>
              {wild && (
                <>
                  <button
                    class="btn btn--small btn--capture"
                    disabled={!myTurn || blanks <= 0}
                    title={t('battle.chance', { n: chance })}
                    onClick={() => {
                      setBlanks((b) => b - 1);
                      props.onUseBlank?.();
                      dispatch({ type: 'capture', bonus: props.captureBonus });
                    }}
                  >
                    🃏 {t('battle.btn.capture', { n: blanks })} · {chance}%
                  </button>
                  <button class="btn btn--small btn--ghost" disabled={!myTurn} onClick={() => dispatch({ type: 'flee' })}>{t('battle.btn.flee')}</button>
                </>
              )}
              <button class="btn btn--small btn--primary" disabled={!myTurn} onClick={() => dispatch({ type: 'endTurn' })}>
                {t('battle.btn.endTurn')} ▶
              </button>
            </>
          )}
        </div>
      </div>

      <div class="battle__hand">
        {me.hand.map((id, i) => (
          <SupportCard
            def={support(id)}
            width={82}
            class={!myTurn || mode ? 'is-dim' : canPlay(st, 0, i) ? 'is-playable' : 'is-dim'}
            onClick={() => !mode && setPreview(i)}
          />
        ))}
        <span class="battle__deckcount">{t('battle.deck', { n: me.deck.length })}</span>
      </div>

      {preview !== null && me.hand[preview] && (
        <div class="overlay" onClick={() => setPreview(null)}>
          <div class="preview" onClick={(e) => e.stopPropagation()}>
            <SupportCard def={support(me.hand[preview])} width={Math.min(280, window.innerWidth - 48)} />
            <div class="preview__btns">
              <button class="btn" onClick={() => setPreview(null)}>{t('battle.btn.cancel')}</button>
              <button class="btn btn--primary" disabled={!myTurn || !canPlay(st, 0, preview)} onClick={() => playFromPreview(preview)}>
                {t('battle.btn.play')}
              </button>
            </div>
          </div>
        </div>
      )}

      {zoom && (
        <div class="overlay" onClick={() => setZoom(null)}>
          {'attacks' in zoom
            ? <Card def={zoom} width={Math.min(380, window.innerWidth - 32)} />
            : <SupportCard def={zoom} width={Math.min(380, window.innerWidth - 32)} />}
        </div>
      )}

      {coin && (
        <div class="coin-wrap" key={coin.key}>
          <div class={`coin ${coin.heads ? 'coin--heads' : 'coin--tails'}`}>
            <div class="coin__face coin__face--heads">☺</div>
            <div class="coin__face coin__face--tails">✿</div>
          </div>
          <div class="coin__label pixel">{coin.heads ? t('battle.heads') : t('battle.tails')}</div>
        </div>
      )}

      {(captured || result) && (
        <div class="overlay">
          <div class="result-col">
            {captured && <Card def={creature(captured)} width={Math.min(280, window.innerWidth - 48)} class="card--reveal" />}
            {result && (
              <div class={`result result--${result}`}>
                <h2 class="pixel">{t(`battle.end.${result}`)}</h2>
                {rewardLines.map((l) => <p>{l}</p>)}
                <button class="btn btn--primary" onClick={() => props.onEnd(result, stRef.current!)}>{t('battle.btn.continue')}</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
