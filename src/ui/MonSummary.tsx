import { useState } from 'preact/hooks';
import { L, tr } from '../i18n';
import { artUrl, creature } from '../data/creatures';
import { move } from '../data/moves';
import { STAT_NAMES, TYPES } from '../data/types';
import { STAT_KEYS, maxHp, statsOf, xpAt, MAX_LEVEL, type Mon } from '../engine/pk/creature';
import { HpBar, StatusTag } from './battle/BattleScreen';
import './screens.css';

export function TypeBadge({ type }: { type: keyof typeof TYPES }) {
  return <span class="type-badge" style={{ background: TYPES[type].color }}>{tr(TYPES[type].name)}</span>;
}

/** GBA-style summary of one creature: stats, moves, Bestiodex entry. */
export function MonSummary({ mon, onClose }: { mon: Mon; onClose: () => void }) {
  const [tab, setTab] = useState<'info' | 'moves'>('info');
  const sp = creature(mon.species);
  const stats = statsOf(mon);
  const toNext = mon.level >= MAX_LEVEL ? 0 : xpAt(mon.level + 1) - mon.xp;
  return (
    <div class="overlay" onClick={onClose}>
      <div class="sheet" onClick={(e) => e.stopPropagation()}>
        <div class="sheet__head">
          <div class="sheet__art"><img src={artUrl(sp)} alt="" /></div>
          <div class="sheet__id">
            <h2 class="pixel">{tr(sp.name)}</h2>
            <p>
              <span class="pixel">{tr(L('N.{l}', 'Lv{l}'), { l: mon.level })}</span> <TypeBadge type={sp.type} /> {mon.status && <StatusTag s={mon.status} />}
            </p>
            <HpBar hp={mon.hp} max={maxHp(mon)} />
            <small>{mon.hp}/{maxHp(mon)} {tr(L('PV', 'HP'))} · {toNext ? tr(L('{x} XP avant le niveau suivant', '{x} Exp. to next level'), { x: toNext }) : tr(L('Niveau max', 'Max level'))}</small>
          </div>
        </div>
        <div class="tabs sheet__tabs">
          <button class="btn btn--small" aria-pressed={tab === 'info'} onClick={() => setTab('info')}>{tr(L('Infos', 'Info'))}</button>
          <button class="btn btn--small" aria-pressed={tab === 'moves'} onClick={() => setTab('moves')}>{tr(L('Capacités', 'Moves'))}</button>
        </div>
        {tab === 'info' ? (
          <>
            <table class="stats">
              {STAT_KEYS.map((k) => (
                <tr>
                  <th>{tr(STAT_NAMES[k])}</th>
                  <td>{k === 'hp' ? maxHp(mon) : stats[k]}</td>
                  <td class="stats__bar"><span style={{ width: `${Math.min(100, ((k === 'hp' ? maxHp(mon) : stats[k]) / (mon.level * 2.4 + 20)) * 100)}%` }} /></td>
                </tr>
              ))}
            </table>
            <p class="sheet__dex"><b>{tr(sp.kind)}</b> — {tr(sp.dex)}</p>
            {sp.evolvesTo && sp.evolveLevel && (
              <p class="sheet__evo">{tr(L('Évolue au niveau {l}.', 'Evolves at level {l}.'), { l: sp.evolveLevel })}</p>
            )}
          </>
        ) : (
          <div class="sheet__moves">
            {mon.moves.map((s) => {
              const mv = move(s.id);
              return (
                <div class="mvrow" style={{ '--type': TYPES[mv.type].color }}>
                  <div class="mvrow__top">
                    <b>{tr(mv.name)}</b>
                    <TypeBadge type={mv.type} />
                    <span>PP {s.pp}/{mv.pp}</span>
                  </div>
                  <small>
                    {mv.cat === 'status' ? tr(L('Statut', 'Status')) : `${tr(L('Puissance', 'Power'))} ${mv.power}`}
                    {' · '}{tr(L('Précision', 'Accuracy'))} {mv.acc ?? '—'}
                  </small>
                  <p>{tr(mv.desc)}</p>
                </div>
              );
            })}
          </div>
        )}
        <button class="btn btn--primary" onClick={onClose}>OK</button>
      </div>
    </div>
  );
}
