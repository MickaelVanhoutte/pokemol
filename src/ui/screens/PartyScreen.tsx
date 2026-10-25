import type { ComponentChildren } from 'preact';
import { useState } from 'preact/hooks';
import { L, tr } from '../../i18n';
import { artUrl, creature } from '../../data/creatures';
import { maxHp, type Mon } from '../../engine/pk/creature';
import { backToWorld } from '../../overworld/controller';
import { save, update } from '../../state/game';
import { HpBar, StatusTag } from '../battle/BattleScreen';
import { MonSummary } from '../MonSummary';
import '../screens.css';

export function MonRow({ m, lead, onClick, side }: { m: Mon; lead?: boolean; onClick?: () => void; side?: ComponentChildren }) {
  return (
    <div class={`mrow ${lead ? 'is-lead' : ''} ${m.hp <= 0 ? 'is-ko' : ''}`} role="button" tabIndex={0} onClick={onClick}>
      <img src={artUrl(creature(m.species))} alt="" />
      <span class="mrow__main">
        <b>{tr(creature(m.species).name)} <small class="pixel">{tr(L('N.{l}', 'Lv{l}'), { l: m.level })}</small> {m.status && <StatusTag s={m.status} />}</b>
        <HpBar hp={m.hp} max={maxHp(m)} />
        <small>{m.hp}/{maxHp(m)} {tr(L('PV', 'HP'))}</small>
      </span>
      {side && <span class="mrow__side">{side}</span>}
    </div>
  );
}

/** Party from the start menu: summaries and order (the first one leads battles). */
export function PartyScreen() {
  const d = save.value!;
  const [summary, setSummary] = useState<Mon | null>(null);
  const move = (i: number, dir: -1 | 1) =>
    update((x) => {
      const j = i + dir;
      if (j < 0 || j >= x.party.length) return;
      [x.party[i], x.party[j]] = [x.party[j], x.party[i]];
    });
  return (
    <div class="screen mscreen">
      <div class="screen__bar">
        <button class="btn btn--small" onClick={backToWorld}>← {tr(L('Retour', 'Back'))}</button>
        <h1>{tr(L('Bestioles', 'Critters'))}</h1>
      </div>
      <p class="mscreen__note">{tr(L('La première Bestiole commence les combats. Touche-en une pour voir son résumé.', 'The first Critter starts battles. Tap one to see its summary.'))}</p>
      <div class="mscreen__list">
        {d.party.map((m, i) => (
          <MonRow
            m={m}
            lead={i === 0}
            onClick={() => setSummary(m)}
            side={
              <>
                <span class="btn btn--small" role="button" onClick={(e) => { e.stopPropagation(); move(i, -1); }}>▲</span>
                <span class="btn btn--small" role="button" onClick={(e) => { e.stopPropagation(); move(i, 1); }}>▼</span>
              </>
            }
          />
        ))}
      </div>
      {summary && <MonSummary mon={summary} onClose={() => setSummary(null)} />}
    </div>
  );
}
