import { useEffect, useRef, useState } from 'preact/hooks';
import { L, t, tr } from '../../i18n';
import { artUrl, creature } from '../../data/creatures';
import { ITEMS, item } from '../../data/items';
import { move } from '../../data/moves';
import { STATUSES, TYPES } from '../../data/types';
import { aiChoose } from '../../engine/pk/ai';
import {
  act, activeMon, blocked, createBattle, itemUsable, usableSlots,
  type Action, type BattleEvent, type BattleResult, type BattleSetup, type BattleState, type Side, type Step,
} from '../../engine/pk/battle';
import { maxHp, xpAt, type Mon } from '../../engine/pk/creature';
import { sfx } from '../../audio/sfx';
import { MonSummary } from '../MonSummary';
import { describe, eventDuration, monName } from './messages';
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
  backdrop?: 'grass' | 'cave' | 'tower' | 'lab' | 'forest';
  /** First battle: the professor explains the menu. */
  tutorial?: boolean;
}

type Menu = 'main' | 'fight' | 'bag' | 'party';
type Fx = Partial<Record<Side, string>>;

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
  const stRef = useRef<BattleState | null>(null);
  const [st, setSt] = useState<BattleState | null>(null);
  const [view, setView] = useState<BattleState | null>(null);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(true);
  const [menu, setMenu] = useState<Menu>('main');
  const [itemTarget, setItemTarget] = useState<string | null>(null);
  const [partyPick, setPartyPick] = useState<number | null>(null);
  const [summary, setSummary] = useState<Mon | null>(null);
  const [fx, setFx] = useState<Fx>({});
  const [ball, setBall] = useState<{ shakes: number; caught: boolean; key: number } | null>(null);
  const [captured, setCaptured] = useState(false);
  const [bag, setBag] = useState<Record<string, number>>({ ...props.bag });
  const [ended, setEnded] = useState(false);
  const [coach, setCoach] = useState(props.tutorial ? 0 : -1);
  const speed = useRef(battleSpeed());

  const pulse = (side: Side, kind: string, ms = 500) => {
    setFx((f) => ({ ...f, [side]: kind }));
    setTimeout(() => setFx((f) => (f[side] === kind ? { ...f, [side]: undefined } : f)), ms);
  };

  const animate = async (e: BattleEvent, snap: BattleState) => {
    const lines = describe(e, snap);
    // the ball shakes first, the result comes after
    if (e.t === 'ball') setMsg(tr(L('Tu lances une {i} !', 'You threw a {i}!'), { i: tr(item(e.item).name) }));
    else if (lines.length) setMsg(lines.join(' '));
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
      setMsg(lines.join(' '));
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
    setItemTarget(null);
    setPartyPick(null);
    setBusy(true);
    try {
      const enemy: Action = a.type === 'learn' || a.type === 'replace' ? { type: 'move', slot: 0 } : aiChoose(cur);
      const step = act(cur, a, enemy, true);
      commit(step.state);
      await play(step);
      if (step.state.result && !step.state.learnQueue.length) setEnded(true);
      if (a.type === 'move') setCoach((c) => (c === 0 ? 1 : c));
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
  const forced = !busy && st.needSwitch;
  const idle = !busy && !st.result && !blocked(st);
  const wild = st.kind === 'wild';
  const learner = learn ? me.party.find((m) => m.uid === learn.uid) : null;
  const bagItems = ITEMS.filter((it) => (bag[it.id] ?? 0) > 0 && (it.kind !== 'ball' || wild));

  const prompt = forced
    ? tr(L('Quelle Bestiole envoyer ?', 'Which Critter will you send out?'))
    : itemTarget ? tr(L('Sur quelle Bestiole ?', 'Use it on which Critter?'))
    : learn && learner ? tr(L('{n} veut apprendre {m}, mais connaît déjà 4 capacités. Laquelle oublier ?', '{n} wants to learn {m} but already knows 4 moves. Which one to forget?'), { n: tr(creature(learner.species).name), m: tr(move(learn.move).name) })
    : idle ? tr(L('Que doit faire {n} ?', 'What will {n} do?'), { n: tr(creature(active.species).name) })
    : msg;

  const panel = forced || itemTarget ? 'party' : menu;
  const rewardLines = ended && st.result ? props.rewardLines?.(st.result, st) ?? [] : [];
  const back = () => {
    setMenu('main');
    setItemTarget(null);
    setPartyPick(null);
  };

  const partyList = (onPick: (i: number) => void, can: (i: number) => boolean) => (
    <div class="gba-sub">
      {me.party.map((m, i) => (
        <button class={`team-row ${i === me.active ? 'is-active' : ''} ${m.hp <= 0 ? 'is-ko' : ''}`} disabled={!can(i)} onClick={() => onPick(i)}>
          <img src={artUrl(creature(m.species))} alt="" />
          <span class="team-row__text">
            <b>{tr(creature(m.species).name)} <small>{tr(L('N.{l}', 'Lv{l}'), { l: m.level })}</small> {m.status && <StatusTag s={m.status} />}</b>
            <HpBar hp={m.hp} max={maxHp(m)} />
            <small>{m.hp}/{maxHp(m)} {tr(L('PV', 'HP'))}</small>
          </span>
        </button>
      ))}
      {!forced && <button class="gba-back" onClick={back}>← {t('battle.btn.back')}</button>}
    </div>
  );

  return (
    <div class={`battle pk backdrop-${props.backdrop ?? 'grass'}`} onDblClick={() => (speed.current = 0.35)}>
      <div class="pk-scene">
        <HpBox st={view} side={1} />
        <div class="pk-plat pk-plat--foe">
          <img
            class={`pk-sprite ${fx[1] ? `fx-${fx[1]}` : ''} ${captured ? 'is-captured' : ''} ${activeMon(view.sides[1]).hp <= 0 && !fx[1] ? 'is-gone' : ''}`}
            src={artUrl(creature(activeMon(view.sides[1]).species))}
            alt=""
          />
          {ball && <div class={`pk-ball shakes-${ball.shakes} ${ball.caught ? 'is-caught' : ''}`} key={ball.key}>✏️</div>}
        </div>
        <div class="pk-plat pk-plat--me">
          <img
            class={`pk-sprite pk-sprite--me ${fx[0] ? `fx-${fx[0]}` : ''} ${activeMon(view.sides[0]).hp <= 0 && !fx[0] ? 'is-gone' : ''}`}
            src={artUrl(creature(activeMon(view.sides[0]).species))}
            alt=""
          />
        </div>
        <HpBox st={view} side={0} />
      </div>

      <div class="battle__panel">
        {coach >= 0 && idle && !ended ? (
          <div class="coach">
            <span class="coach__who pixel">{tr(L('Prof. Fusain', 'Prof. Charcoal'))}</span>
            <p class="pixel">{tr(COACH[coach])}</p>
            {coach === 1 && <button class="btn btn--small btn--primary" onClick={() => setCoach(-1)}>OK</button>}
          </div>
        ) : (
          <div class="battle__msg pixel" aria-live="polite">
            <span>{ended ? [msg, ...rewardLines].filter(Boolean).join(' ') : prompt}</span>
          </div>
        )}

        {ended ? (
          <button class="gba-btn gba-btn--attack gba-continue" onClick={() => props.onEnd(st.result!, stRef.current!)}>
            {t('battle.btn.continue')} ▶
          </button>
        ) : learn && learner ? (
          <div class="gba-sub">
            <div class="pk-moves">
              {learner.moves.map((s, i) => <MoveButton id={s.id} pp={s.pp} onClick={() => dispatch({ type: 'learn', forget: i })} />)}
            </div>
            <button class="gba-back gba-back--pass" onClick={() => dispatch({ type: 'learn', forget: null })}>
              {tr(L('Ne pas apprendre {m}', 'Don’t learn {m}'), { m: tr(move(learn.move).name) })}
            </button>
          </div>
        ) : panel === 'main' ? (
          <div class="gba-menu">
            <button class={`gba-btn gba-btn--attack ${coach === 0 ? 'is-coach' : ''}`} disabled={!idle} onClick={() => setMenu('fight')}>
              {t('battle.menu.attack')}
            </button>
            <button class="gba-btn gba-btn--bag" disabled={!idle} onClick={() => setMenu('bag')}>{t('battle.menu.bag')}</button>
            <button class="gba-btn gba-btn--team" disabled={!idle} onClick={() => setMenu('party')}>{tr(L('Bestioles', 'Critters'))}</button>
            <button class="gba-btn gba-btn--run" disabled={!idle} onClick={() => dispatch({ type: 'run' })}>{t('battle.menu.run')}</button>
          </div>
        ) : panel === 'fight' ? (
          <div class="gba-sub">
            <div class="pk-moves">
              {usableSlots(active).length
                ? active.moves.map((s, i) => <MoveButton id={s.id} pp={s.pp} disabled={!idle || s.pp <= 0} onClick={() => dispatch({ type: 'move', slot: i })} />)
                : <MoveButton id="lutte" disabled={!idle} onClick={() => dispatch({ type: 'move', slot: -1 })} />}
            </div>
            <button class="gba-back" onClick={back}>← {t('battle.btn.back')}</button>
          </div>
        ) : panel === 'bag' ? (
          <div class="gba-sub">
            {bagItems.map((it) => (
              <button class={`bag-row ${it.kind === 'ball' ? 'bag-row--blank' : ''}`} disabled={!idle} onClick={() => (it.kind === 'ball' ? useItemNow(it.id) : setItemTarget(it.id))}>
                <span class="bag-row__icon">{it.icon}</span>
                <span class="bag-row__text"><b>{tr(it.name)} ×{bag[it.id]}</b><small>{tr(it.desc)}</small></span>
                <span class="bag-row__state is-ok">▶</span>
              </button>
            ))}
            {!bagItems.length && <p class="gba-empty">{tr(L('Ton sac est vide.', 'Your bag is empty.'))}</p>}
            <button class="gba-back" onClick={back}>← {t('battle.btn.back')}</button>
          </div>
        ) : forced ? (
          partyList((i) => dispatch({ type: 'replace', to: i }), (i) => me.party[i].hp > 0 && i !== me.active)
        ) : itemTarget ? (
          partyList((i) => useItemNow(itemTarget, i), (i) => itemUsable(st, itemTarget, i))
        ) : partyPick !== null ? (
          <div class="gba-sub">
            <p class="gba-empty">{tr(creature(me.party[partyPick].species).name)}</p>
            <div class="gba-row">
              <button
                class="gba-back gba-back--pass"
                disabled={!idle || partyPick === me.active || me.party[partyPick].hp <= 0}
                onClick={() => dispatch({ type: 'switch', to: partyPick })}
              >
                {tr(L('Envoyer', 'Shift'))}
              </button>
              <button class="gba-back" onClick={() => setSummary(me.party[partyPick])}>{tr(L('Résumé', 'Summary'))}</button>
            </div>
            <button class="gba-back" onClick={() => setPartyPick(null)}>← {t('battle.btn.back')}</button>
          </div>
        ) : (
          partyList((i) => setPartyPick(i), () => true)
        )}
      </div>

      {summary && <MonSummary mon={summary} onClose={() => setSummary(null)} />}
    </div>
  );
}

const COACH = [
  L('Touche ATTAQUE puis choisis une capacité. Une capacité efficace contre le type ennemi fait plus de dégâts !', 'Tap FIGHT then pick a move. Moves that are strong against the foe’s type do more damage!'),
  L('Dans le SAC : tes Potions et tes Crayon-balls. BESTIOLES sert à changer de Bestiole, et FUITE marche contre les Bestioles sauvages.', 'The BAG holds your Potions and Pencil Balls. CRITTERS lets you switch, and RUN works against wild Critters.'),
];

export function StatusTag({ s }: { s: NonNullable<Mon['status']> }) {
  return <i class="pk-status" style={{ background: STATUSES[s].color }}>{tr(STATUSES[s].tag)}</i>;
}

export function HpBar({ hp, max }: { hp: number; max: number }) {
  const pct = Math.max(0, (hp / max) * 100);
  return (
    <span class={`hpbar hpbar--${pct > 50 ? 'ok' : pct > 20 ? 'mid' : 'low'}`}>
      <span style={{ width: `${pct}%` }} />
    </span>
  );
}

function HpBox({ st, side }: { st: BattleState; side: Side }) {
  const m = activeMon(st.sides[side]);
  const max = maxHp(m);
  const xpPct = side === 0 && m.level < 50 ? ((m.xp - xpAt(m.level)) / (xpAt(m.level + 1) - xpAt(m.level))) * 100 : 0;
  return (
    <div class={`pk-hp pk-hp--${side === 0 ? 'me' : 'foe'}`}>
      <div class="pk-hp__top">
        <b>{side === 0 ? tr(creature(m.species).name) : monName(st, 1)}</b>
        {m.status && <StatusTag s={m.status} />}
        <span>{tr(L('N.{l}', 'Lv{l}'), { l: m.level })}</span>
      </div>
      <div class="pk-hp__bar"><small>{tr(L('PV', 'HP'))}</small><HpBar hp={m.hp} max={max} /></div>
      {side === 0 && (
        <>
          <div class="pk-hp__num">{m.hp}/{max}</div>
          <div class="pk-xp"><span style={{ width: `${Math.max(0, Math.min(100, xpPct))}%` }} /></div>
        </>
      )}
    </div>
  );
}

export function MoveButton({ id, pp, disabled, onClick }: { id: string; pp?: number; disabled?: boolean; onClick: () => void }) {
  const mv = move(id);
  return (
    <button class="pk-move" style={{ '--type': TYPES[mv.type].color }} disabled={disabled} onClick={onClick}>
      <b>{tr(mv.name)}</b>
      <small>{tr(TYPES[mv.type].name)}{pp !== undefined ? ` · PP ${pp}/${mv.pp}` : ''}</small>
    </button>
  );
}
