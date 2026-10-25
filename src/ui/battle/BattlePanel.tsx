import { L, t, tr } from '../../i18n';
import type { Mon } from '../../engine/pk/creature';
import { MoveButton, TextBox, YesNo } from '../paper';
import { useMenuNav } from '../paper/nav';
import type { PanelMode } from './panelMode';

export interface PanelProps {
  mode: PanelMode;
  /** Battle message, prompt, end text or coach text depending on the mode. */
  text: string;
  speaker?: string;
  active: Mon;
  /** Only Struggle is left. */
  struggling: boolean;
  /** Moves that can be picked (a Stubborn item locks one, the Painter’s Apron forbids status moves). */
  usable: number[];
  pulseAttack: boolean;
  onFight: () => void;
  onBag: () => void;
  onParty: () => void;
  onRun: () => void;
  onMove: (slot: number) => void;
  onBack: () => void;
  onContinue: () => void;
  onLearnAnswer: (yes: boolean) => void;
}

function CommandGrid(p: PanelProps) {
  const cmds = [
    { cls: 'attack', label: t('battle.menu.attack'), on: p.onFight },
    { cls: 'bag', label: t('battle.menu.bag'), on: p.onBag },
    { cls: 'team', label: tr(L('Bestioles', 'Critters')), on: p.onParty },
    { cls: 'run', label: t('battle.menu.run'), on: p.onRun },
  ];
  const [cur, setCur] = useMenuNav(4, { cols: 2, onSelect: (i) => cmds[i].on() });
  return (
    <div class="bpanel__grid">
      {cmds.map((c, i) => (
        <button
          class={`gba-btn gba-btn--${c.cls} ${i === cur ? 'is-on' : ''} ${i === 0 && p.pulseAttack ? 'is-coach' : ''}`}
          onPointerEnter={(e) => e.pointerType === 'mouse' && setCur(i)}
          onClick={() => { setCur(i); c.on(); }}
        >
          {c.label}
        </button>
      ))}
    </div>
  );
}

function FightGrid(p: PanelProps) {
  const slots = p.struggling ? [-1] : p.active.moves.map((_, i) => i);
  const pick = (k: number) => {
    const s = slots[k];
    if (s === undefined || (s >= 0 && !p.usable.includes(s))) return;
    p.onMove(s);
  };
  const [cur, setCur] = useMenuNav(slots.length, { cols: 2, onSelect: pick, onCancel: p.onBack });
  return (
    <div class="bpanel__grid">
      {[0, 1, 2, 3].map((k) => {
        const s = slots[k];
        if (s === undefined) return <span class="pk-move pk-move--empty">—</span>;
        const id = s < 0 ? 'lutte' : p.active.moves[s].id;
        return (
          <MoveButton
            id={id}
            pp={s < 0 ? undefined : p.active.moves[s].pp}
            disabled={s >= 0 && !p.usable.includes(s)}
            class={k === cur ? 'is-on' : ''}
            onClick={() => { setCur(k); pick(k); }}
          />
        );
      })}
    </div>
  );
}

/**
 * The fixed-height bottom panel (FRLG style). Its size never depends on what it shows:
 * long lists (bag, party) open as full-screen overlays instead.
 */
export function BattlePanel(p: PanelProps) {
  const m = p.mode;
  return (
    <div class={`battle__panel bpanel bpanel--${m}`}>
      {(m === 'message' || m === 'continue' || m === 'coach') && (
        <TextBox
          class="bpanel__text"
          text={p.text}
          speaker={p.speaker}
          keys={m !== 'message'}
          autoPage={1300}
          onAdvance={m === 'continue' ? p.onContinue : m === 'coach' ? p.onContinue : undefined}
        />
      )}
      {(m === 'command' || m === 'fight' || m === 'learnAsk') && (
        <div class="bpanel__split">
          <div class="window seyes bpanel__prompt">
            <p>{p.text}</p>
            {m === 'fight' && <button class="pbtn pbtn--b bpanel__back" onClick={p.onBack}>{t('battle.btn.back')}</button>}
          </div>
          {m === 'command' && <CommandGrid {...p} />}
          {m === 'fight' && <FightGrid {...p} />}
          {m === 'learnAsk' && <div class="bpanel__yesno"><YesNo onAnswer={p.onLearnAnswer} /></div>}
        </div>
      )}
    </div>
  );
}
