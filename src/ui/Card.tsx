import type { CSSProperties } from 'preact';
import { t, tr } from '../i18n';
import { CREATURES, artUrl } from '../data/creatures';
import type { AttackDef, CreatureDef, SupportDef, TypeId } from '../data/schema';
import { RARITIES, RESISTANCE_AMOUNT, STAGES, TYPES, WEAKNESS_MULT } from '../data/types';
import { CardBackground } from './CardBackground';
import './card.css';

export function TypeIcon({ type, size = '1em' }: { type: TypeId; size?: string }) {
  const info = TYPES[type];
  return (
    <svg class="type-icon" viewBox="0 0 24 24" style={{ width: size, height: size, '--type': info.color }} aria-label={tr(info.name)}>
      <circle cx="12" cy="12" r="11.2" class="type-icon__disc" />
      <path d={info.icon} transform="translate(2.4 2.4) scale(0.8)" class="type-icon__glyph" />
    </svg>
  );
}

export function damageLabel(a: AttackDef): string {
  if (!a.damage && !a.mod) return '';
  if (a.mod?.kind === 'perHeads') return `${a.damage}×`;
  if (a.mod && a.mod.kind !== 'flipOrFail') return `${a.damage}+`;
  return String(a.damage);
}

let uidCounter = 0;

export interface CardProps {
  def: CreatureDef;
  /** Card width in CSS px (the whole card scales from it). */
  width?: number;
  level?: number;
  onClick?: () => void;
  class?: string;
  style?: CSSProperties;
}

export function Card({ def, width = 300, level, onClick, class: cls = '', style }: CardProps) {
  const type = TYPES[def.type];
  const uid = `c${def.id}-${uidCounter++}`;
  const sameSeries = CREATURES.filter((c) => c.series === def.series).length;
  const rarity = RARITIES[def.rarity];
  return (
    <div
      class={`card rarity-${def.rarity} ${onClick ? 'is-clickable' : ''} ${cls}`}
      style={{ '--card-w': `${width}px`, '--type': type.color, '--type-light': type.light, ...style }}
      onClick={onClick}
    >
      <div class="card__inner">
        <header class="card__head">
          <div class="card__stage">{tr(STAGES[def.stage])} · {tr(type.name)}</div>
          <div class="card__titlerow">
            <h3 class="card__name">{tr(def.name)}</h3>
            <div class="card__hp">
              <small>{t('card.hp')}</small>
              <b>{def.hp}</b>
              <TypeIcon type={def.type} size="2.6em" />
            </div>
          </div>
          {level ? <div class="card__level">{t('card.level', { n: level })}</div> : null}
        </header>
        <div class="card__art">
          <CardBackground type={def.type} uid={uid} />
          <img src={artUrl(def)} alt={tr(def.name)} draggable={false} />
        </div>
        <div class="card__strip">{t('card.strip', { n: def.id })}</div>
        <div class="card__attacks">
          {def.attacks.map((a) => (
            <div class="atk">
              <div class="atk__row">
                <span class="atk__cost">
                  {Array.from({ length: a.cost }, () => <TypeIcon type={def.type} size="1.9em" />)}
                </span>
                <span class="atk__name">{tr(a.name)}</span>
                <span class="atk__dmg">{damageLabel(a)}</span>
              </div>
              {a.text ? <p class="atk__text">{tr(a.text)}</p> : null}
            </div>
          ))}
        </div>
        <div class="card__wrr">
          <div>
            <label>{t('card.weakness')}</label>
            <span>{def.weakness ? `${tr(TYPES[def.weakness].name)} ×${WEAKNESS_MULT}` : '—'}</span>
          </div>
          <div class="center">
            <label>{t('card.resistance')}</label>
            <span>{def.resistance ? `${tr(TYPES[def.resistance].name)} −${RESISTANCE_AMOUNT}` : '—'}</span>
          </div>
          <div class="right">
            <label>{t('card.retreat')}</label>
            <span class="dots">{def.retreat ? '●'.repeat(def.retreat) : '—'}</span>
          </div>
        </div>
        <div class="card__flavor">{tr(def.flavor)}</div>
        <footer class="card__foot">
          <span>{t('card.illus')}</span>
          <span>
            {t('card.series', { s: def.series, n: def.id, total: String(sameSeries).padStart(3, '0') })} {rarity.symbol}
          </span>
        </footer>
      </div>
      {def.rarity === 'holo' ? <div class="card__holo" /> : null}
    </div>
  );
}

export function SupportCard({ def, width = 300, onClick, class: cls = '', style }: {
  def: SupportDef; width?: number; onClick?: () => void; class?: string; style?: CSSProperties;
}) {
  const isUpgrade = def.id.endsWith('+');
  return (
    <div
      class={`card card--support rarity-${def.rarity} ${isUpgrade ? 'is-upgrade' : ''} ${onClick ? 'is-clickable' : ''} ${cls}`}
      style={{ '--card-w': `${width}px`, ...style }}
      onClick={onClick}
    >
      <div class="card__inner">
        <header class="card__head">
          <div class="card__stage">
            {t('card.support')} · {def.kind === 'dresseur' ? t('card.trainer') : t('card.item')}
          </div>
          <div class="card__titlerow">
            <h3 class="card__name">{tr(def.name)}</h3>
          </div>
        </header>
        <div class="card__art card__art--support">
          <span class="support-icon">{def.icon}</span>
        </div>
        <div class="card__supporttext">{tr(def.text)}</div>
        {def.kind === 'dresseur' ? <div class="card__rule">{t('card.trainerRule')}</div> : null}
        <footer class="card__foot">
          <span>{t('card.illus')}</span>
          <span>{RARITIES[def.rarity].symbol}</span>
        </footer>
      </div>
    </div>
  );
}
