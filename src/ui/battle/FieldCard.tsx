import { t, tr } from '../../i18n';
import { artUrl, creature } from '../../data/creatures';
import { STATUSES, TYPES } from '../../data/types';
import type { Fighter } from '../../engine/battle/types';
import { CardBackground } from '../CardBackground';
import { TypeIcon } from '../Card';

export interface Floater {
  id: number;
  uid: string;
  text: string;
  kind: 'dmg' | 'heal' | 'info';
}

interface Props {
  f: Fighter;
  size: 'active' | 'bench';
  wildName?: string;
  selectable?: boolean;
  fx?: string;
  floaters?: Floater[];
  onClick?: () => void;
  onInfo?: () => void;
}

export function FieldCard({ f, size, wildName, selectable, fx, floaters = [], onClick, onInfo }: Props) {
  const def = creature(f.defId);
  const pct = Math.max(0, (f.hp / f.maxHp) * 100);
  const hpClass = pct > 50 ? 'ok' : pct > 20 ? 'mid' : 'low';
  return (
    <div
      class={`fcard fcard--${size} ${f.ko ? 'is-ko' : ''} ${selectable ? 'is-selectable' : ''} ${fx ? `fx-${fx}` : ''}`}
      style={{ '--type': TYPES[def.type].color, '--type-light': TYPES[def.type].light }}
      onClick={selectable ? onClick : undefined}
    >
      <div class="fcard__art">
        <CardBackground type={def.type} uid={f.uid} />
        <img src={artUrl(def)} alt={tr(def.name)} draggable={false} />
        <div class="fcard__status">
          {f.status.map((s) => (
            <span title={tr(STATUSES[s].name)} style={{ background: STATUSES[s].color }}>{STATUSES[s].icon}</span>
          ))}
          {f.noRetreat ? <span title="" style={{ background: '#b07b2c' }}>🍯</span> : null}
        </div>
        {f.protect > 0 ? <div class="fcard__shield">🛡️{f.protect}</div> : null}
        {onInfo ? (
          <button class="fcard__info-btn" aria-label={t('battle.btn.info')} onClick={(e) => { e.stopPropagation(); onInfo(); }}>i</button>
        ) : null}
        {floaters.map((fl) => <div key={fl.id} class={`floater floater--${fl.kind}`}>{fl.text}</div>)}
      </div>
      <div class="fcard__info">
        <div class="fcard__name">
          <span>{wildName ?? tr(def.name)}</span>
          <small>{t('card.level', { n: f.level })}</small>
        </div>
        <div class={`hpbar hpbar--${hpClass}`}><div style={{ width: `${pct}%` }} /></div>
        <div class="fcard__row">
          <span class="fcard__energy">
            {f.energy <= 4
              ? Array.from({ length: f.energy }, () => <TypeIcon type={def.type} size="1.05em" />)
              : <><TypeIcon type={def.type} size="1.05em" />×{f.energy}</>}
          </span>
          <span class="fcard__hp">{f.hp}/{f.maxHp}</span>
        </div>
      </div>
    </div>
  );
}
