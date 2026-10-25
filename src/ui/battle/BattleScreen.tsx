import { useEffect, useRef, useState } from 'preact/hooks';
import { L, t, tr } from '../../i18n';
import { creature } from '../../data/creatures';
import { support } from '../../data/supportCards';
import { aiStep } from '../../engine/battle/ai';
import {
  activeOf, applyAction, attackProblem, blocked, canAttachEnergy, canAttack, canPlay, canSwapCard, captureChance,
  createBattle, playTargets, retreatTargets, type Step,
} from '../../engine/battle/engine';
import type { Action, BattleEvent, BattleResult, BattleSetup, BattleState, Side } from '../../engine/battle/types';
import { Card, SupportCard, TypeIcon, damageLabel } from '../Card';
import { FieldCard, type Floater } from './FieldCard';
import { describe, eventDuration, fighterName } from './messages';
import { sfx } from '../../audio/sfx';
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
  /** First battle: a coach explains energy, cards and attacks step by step. */
  tutorial?: boolean;
}

type Mode =
  | null
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
  const [sheet, setSheet] = useState<{ side: Side; fi: number } | null>(null);
  const [foeCard, setFoeCard] = useState<string | null>(null);
  const [coachStep, setCoachStep] = useState(props.tutorial ? 0 : -1);
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
      case 'damage': flash(uidOf(e.side, e.f), 'hit', `−${e.amount}`); if (e.amount) sfx.hit(); break;
      case 'heal': flash(uidOf(e.side, e.f), 'heal', `+${e.amount}`, 'heal'); sfx.heal(); break;
      case 'ko': flash(uidOf(e.side, e.f), 'ko'); sfx.ko(); break;
      case 'end': if (e.result === 'win') sfx.victory(); break;
      case 'attack': flash(uidOf(e.side, e.f), e.side === 0 ? 'lunge-up' : 'lunge-down'); break;
      case 'energy': flash(uidOf(e.side, e.f), 'glow', `+${e.amount}⚡`, 'info'); sfx.energy(); break;
      case 'status': flash(uidOf(e.side, e.f), 'status'); break;
      case 'coin': setCoin({ heads: e.heads, key: Date.now() }); sfx.coin(); break;
      case 'play': if (e.side === 1) setFoeCard(e.card); break;
      case 'swap': if (e.side === 0) sfx.sparkle(); break;
      case 'capture':
        if (e.success) {
          setCaptured(snap.sides[1].fighters[0].defId);
          sfx.capture();
        }
        else flash(uidOf(1, 0), 'hit');
        break;
    }
    await sleep(eventDuration(e) * speed.current);
    if (e.t === 'coin') setCoin(null);
    if (e.t === 'play' && e.side === 1) {
      await sleep(700 * speed.current);
      setFoeCard(null);
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
    setSheet(null);
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

  // tutorial steps move on by themselves once the player did the thing
  useEffect(() => {
    if (!st) return;
    if (coachStep === 0 && st.sides[0].energyAttached) setCoachStep(1);
    if (coachStep <= 2 && coachStep >= 0 && st.turnNumber > 1) setCoachStep(3);
  }, [st, coachStep]);

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
  const energyFree = myTurn && !st.sides[0].energyAttached;

  const selectableMine = (i: number): boolean => {
    if (choosing) return !st.sides[0].fighters[i].ko && i !== st.sides[0].active;
    if (!myTurn) return false;
    if (mode?.kind === 'retreat') return retreatTargets(st, 0).includes(i);
    if (mode?.kind === 'card') return mode.targets.includes(i);
    return energyFree && canAttachEnergy(st, 0, i);
  };

  const onMine = (i: number) => {
    if (choosing) return dispatch({ type: 'chooseActive', fighter: i });
    if (mode?.kind === 'retreat') return dispatch({ type: 'retreat', to: i });
    if (mode?.kind === 'card') return dispatch({ type: 'playCard', hand: mode.hand, target: i });
    if (energyFree) return dispatch({ type: 'attachEnergy', fighter: i });
  };

  const playCard = (hi: number) => {
    const targets = playTargets(st, 0, hi);
    if (targets === null) return dispatch({ type: 'playCard', hand: hi });
    if (targets.length === 1) return dispatch({ type: 'playCard', hand: hi, target: targets[0] });
    setPreview(null);
    setMode({ kind: 'card', hand: hi, targets });
  };

  const prompt = choosing
    ? t('battle.chooseActive')
    : mode?.kind === 'retreat' ? t('battle.pick.retreat')
    : mode?.kind === 'card' ? t('battle.pick.card')
    : msg;

  const fieldCard = (sideIdx: Side, i: number, size: 'active' | 'bench') => {
    const f = view.sides[sideIdx].fighters[i];
    return (
      <FieldCard
        key={f.uid}
        f={f}
        size={size}
        wildName={sideIdx === 1 ? wildName : undefined}
        fx={fx[f.uid]}
        floaters={floaters.filter((x) => x.uid === f.uid)}
        selectable={sideIdx === 0 && selectableMine(i)}
        onClick={() => onMine(i)}
        onInfo={() => setSheet({ side: sideIdx, fi: i })}
      />
    );
  };
  const bench = (sideIdx: Side) => view.sides[sideIdx].fighters.map((_, i) => (i === view.sides[sideIdx].active ? null : fieldCard(sideIdx, i, 'bench')));

  const result = ended;
  const rewardLines = result && props.rewardLines ? props.rewardLines(result, st) : [];
  const chance = wild ? Math.round(captureChance(st, props.captureBonus ?? 0) * 100) : 0;
  const cardW = Math.min(118, Math.floor((Math.min(window.innerWidth, 820) - 170) / 2));

  const coach = coachStep >= 0 && !busy && !ended && (coachStep < 3 ? myTurn : st.turn === 0) ? COACH[coachStep] : null;
  const coachOn = (k: CoachTarget) => (coach?.target === k ? 'is-coach' : '');

  const sheetFighter = sheet ? st.sides[sheet.side].fighters[sheet.fi] : null;

  return (
    <div class={`battle backdrop-${props.backdrop ?? 'grass'}`} onDblClick={() => (speed.current = 0.35)}>
      <div class="battle__foe-bar">
        <span class="battle__who">{wild ? wildName : tr(foe.name)}</span>
      </div>
      <div class="battle__arena">
        <div class="battle__bench battle__bench--foe">{bench(1)}</div>
        <div class="slot slot--foe">{fieldCard(1, foe.active, 'active')}</div>
        <div class="slot slot--me">{fieldCard(0, me.active, 'active')}</div>
        <div class="battle__bench battle__bench--me">{bench(0)}</div>
      </div>

      {coach ? (
        <div class="coach">
          <span class="coach__who pixel">{tr(L('Prof. Fusain', 'Prof. Charcoal'))}</span>
          <p class="pixel">{tr(coach.text)}</p>
          {coach.ok && <button class="btn btn--small btn--primary" onClick={() => setCoachStep(coachStep === 3 ? -1 : coachStep + 1)}>OK</button>}
        </div>
      ) : (
        <div class="battle__msg pixel" aria-live="polite">{prompt}</div>
      )}

      <div class={`battle__attacks ${coachOn('attacks')}`}>
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
              <span class="atk-btn__dmg">{damageLabel(a, active.dmgBonus)}</span>
            </button>
          );
        })}
      </div>

      <div class="battle__bottom">
        <div class={`battle__cards ${coachOn('cards')}`}>
          {me.hand.length ? me.hand.map((id, i) => (
            <div class="hcard">
              <SupportCard def={support(id)} width={cardW} class={myTurn && !mode && canPlay(st, 0, i) ? 'is-playable' : 'is-dim'} onClick={() => !mode && setPreview(i)} />
              <div class="hcard__btns">
                <button class="btn btn--small btn--primary" disabled={!myTurn || !!mode || !canPlay(st, 0, i)} onClick={() => playCard(i)}>{t('battle.btn.play')}</button>
                <button class="btn btn--small" title={t('battle.btn.swap')} disabled={!myTurn || !!mode || !canSwapCard(st, 0, i)} onClick={() => dispatch({ type: 'swapCard', hand: i })}>🔄⚡</button>
              </div>
            </div>
          )) : <div class="hcard hcard--empty">{t('battle.noCards')}</div>}
        </div>
        <div class="battle__side">
          <div class={`energy-chip ${energyFree ? 'is-on' : ''}`}>
            <b>⚡</b>
            <span>{energyFree ? t('battle.energyReady') : t('battle.energyUsed')}</span>
          </div>
          {mode ? (
            <button class="btn btn--small" onClick={() => setMode(null)}>{t('battle.btn.cancel')}</button>
          ) : (
            <button class="btn btn--primary btn--end" disabled={!myTurn} onClick={() => dispatch({ type: 'endTurn' })}>
              {t('battle.btn.endTurn')} ▶
            </button>
          )}
        </div>
      </div>

      {wild && (
        <div class="battle__row battle__wild">
          <button
            class="btn btn--small btn--capture"
            disabled={!myTurn || blanks <= 0 || !!mode}
            onClick={() => {
              setBlanks((b) => b - 1);
              props.onUseBlank?.();
              dispatch({ type: 'capture', bonus: props.captureBonus });
            }}
          >
            🃏 {t('battle.btn.capture', { n: blanks })} · {chance}%
          </button>
          <button class="btn btn--small btn--ghost" disabled={!myTurn || !!mode} onClick={() => dispatch({ type: 'flee' })}>{t('battle.btn.flee')}</button>
        </div>
      )}

      {preview !== null && me.hand[preview] && (
        <div class="overlay" onClick={() => setPreview(null)}>
          <div class="preview" onClick={(e) => e.stopPropagation()}>
            <SupportCard def={support(me.hand[preview])} width={Math.min(300, window.innerWidth - 48)} />
            <div class="preview__btns">
              <button class="btn" onClick={() => setPreview(null)}>{t('battle.btn.close')}</button>
              <button class="btn" disabled={!myTurn || !canSwapCard(st, 0, preview)} onClick={() => dispatch({ type: 'swapCard', hand: preview })}>🔄 {t('battle.btn.swap')} ⚡</button>
              <button class="btn btn--primary" disabled={!myTurn || !canPlay(st, 0, preview)} onClick={() => playCard(preview)}>{t('battle.btn.play')}</button>
            </div>
          </div>
        </div>
      )}

      {sheet && sheetFighter && (
        <div class="overlay" onClick={() => setSheet(null)}>
          <div class="preview" onClick={(e) => e.stopPropagation()}>
            <Card def={creature(sheetFighter.defId)} width={Math.min(340, window.innerWidth - 32, Math.floor((window.innerHeight - 120) * 0.7))} level={sheetFighter.level} />
            <div class="preview__btns">
              <button class="btn" onClick={() => setSheet(null)}>{t('battle.btn.close')}</button>
              {sheet.side === 0 && sheet.fi === st.sides[0].active && (
                <button
                  class="btn btn--primary"
                  disabled={!myTurn || !retreatTargets(st, 0).length}
                  onClick={() => { setSheet(null); setMode({ kind: 'retreat' }); }}
                >
                  ↩ {t('battle.btn.retreat')} {creature(sheetFighter.defId).retreat ? '⚡'.repeat(creature(sheetFighter.defId).retreat) : ''}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {foeCard && (
        <div class="foe-card">
          <SupportCard def={support(foeCard)} width={Math.min(200, window.innerWidth * 0.5)} />
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

type CoachTarget = 'creature' | 'cards' | 'attacks' | null;

const COACH: { text: ReturnType<typeof L>; target: CoachTarget; ok?: boolean }[] = [
  { text: L('À chaque tour, tu reçois une énergie ⚡. Touche ta Bestiole pour la lui donner !', 'Each turn you get one energy ⚡. Tap your Critter to give it!'), target: 'creature' },
  { text: L('Voici tes cartes : touche-en une pour la lire, puis « Jouer ». Une autre fois, tu pourras aussi l’échanger contre ton ⚡ (🔄).', 'Here are your cards: tap one to read it, then "Play". Another time you can also trade it for your ⚡ (🔄).'), target: 'cards', ok: true },
  { text: L('Maintenant, choisis une attaque ! Elle coûte de l’énergie ⚡ et termine ton tour.', 'Now choose an attack! It costs energy ⚡ and ends your turn.'), target: 'attacks' },
  { text: L('Bravo ! Gomme a joué son tour. À toi : ⚡, une carte si tu veux, puis attaque !', 'Well done! Eraser played their turn. Your go: ⚡, a card if you like, then attack!'), target: null, ok: true },
];
