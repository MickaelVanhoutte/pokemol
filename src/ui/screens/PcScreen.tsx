import { useState } from 'preact/hooks';
import { L, tr } from '../../i18n';
import type { Mon } from '../../engine/pk/creature';
import { backToWorld } from '../../overworld/controller';
import { PARTY_MAX } from '../../save/schema';
import { save, update } from '../../state/game';
import { MonSummary } from '../MonSummary';
import { MonRow } from './PartyScreen';
import '../screens.css';

/** PC box: move creatures between the party (max 6) and storage. */
export function PcScreen() {
  const d = save.value!;
  const [summary, setSummary] = useState<Mon | null>(null);
  const deposit = (i: number) =>
    update((x) => {
      if (x.party.length <= 1) return;
      x.box.push(...x.party.splice(i, 1));
    });
  const withdraw = (i: number) =>
    update((x) => {
      if (x.party.length >= PARTY_MAX) return;
      x.party.push(...x.box.splice(i, 1));
    });
  return (
    <div class="screen mscreen">
      <div class="screen__bar">
        <button class="btn btn--small" onClick={backToWorld}>← {tr(L('Éteindre', 'Log off'))}</button>
        <h1>{tr(L('PC', 'PC'))}</h1>
      </div>
      <h2 class="pixel">{tr(L('Équipe ({n}/6)', 'Party ({n}/6)'), { n: d.party.length })}</h2>
      <div class="mscreen__list">
        {d.party.map((m, i) => (
          <MonRow
            m={m}
            lead={i === 0}
            onClick={() => setSummary(m)}
            side={<span class="btn btn--small" role="button" aria-disabled={d.party.length <= 1} onClick={(e) => { e.stopPropagation(); deposit(i); }}>{tr(L('Ranger', 'Deposit'))} ↓</span>}
          />
        ))}
      </div>
      <h2 class="pixel">{tr(L('Boîte ({n})', 'Box ({n})'), { n: d.box.length })}</h2>
      <div class="mscreen__list">
        {d.box.length === 0 && <p class="mscreen__note">{tr(L('La boîte est vide.', 'The box is empty.'))}</p>}
        {d.box.map((m, i) => (
          <MonRow
            m={m}
            onClick={() => setSummary(m)}
            side={<span class="btn btn--small" role="button" aria-disabled={d.party.length >= PARTY_MAX} onClick={(e) => { e.stopPropagation(); withdraw(i); }}>{tr(L('Prendre', 'Withdraw'))} ↑</span>}
          />
        ))}
      </div>
      {summary && <MonSummary mon={summary} onClose={() => setSummary(null)} />}
    </div>
  );
}
