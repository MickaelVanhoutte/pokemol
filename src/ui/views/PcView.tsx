import { useState } from 'preact/hooks';
import { L, tr } from '../../i18n';
import { artUrl, creature } from '../../data/creatures';
import type { Mon } from '../../engine/pk/creature';
import { Frame, MenuList, Window, lv, type MenuItem } from '../paper';
import { canDeposit, canWithdraw } from '../logic/pc';
import { SummaryView } from './SummaryView';
import './views.css';

type Pick = { where: 'party' | 'box'; i: number };

/** PC storage: the box as a grid of drawings, the party as a column. */
export function PcView({ party, box, onDeposit, onWithdraw, onClose }: {
  party: Mon[]; box: Mon[]; onDeposit: (i: number) => void; onWithdraw: (i: number) => void; onClose: () => void;
}) {
  const [pick, setPick] = useState<Pick | null>(null);
  const [summary, setSummary] = useState<Mon | null>(null);
  const [note, setNote] = useState('');
  const mon = pick ? (pick.where === 'party' ? party[pick.i] : box[pick.i]) : null;

  const actions: MenuItem[] = pick && mon ? [
    pick.where === 'party'
      ? {
        label: tr(L('DÉPOSER', 'DEPOSIT')),
        onSelect: () => {
          setPick(null);
          if (!canDeposit(party, pick.i)) return setNote(tr(L('C’est ta dernière Bestiole en forme !', 'That’s your last Critter able to battle!')));
          onDeposit(pick.i);
          setNote(tr(L('{n} est rangé dans la boîte.', '{n} was stored in the box.'), { n: tr(creature(mon.species).name) }));
        },
      }
      : {
        label: tr(L('RETIRER', 'WITHDRAW')),
        onSelect: () => {
          setPick(null);
          if (!canWithdraw(party)) return setNote(tr(L('Ton équipe est complète !', 'Your party is full!')));
          onWithdraw(pick.i);
          setNote(tr(L('{n} rejoint ton équipe.', '{n} joined your party.'), { n: tr(creature(mon.species).name) }));
        },
      },
    { label: tr(L('RÉSUMÉ', 'SUMMARY')), onSelect: () => { setSummary(mon); setPick(null); } },
    { label: tr(L('ANNULER', 'CANCEL')), onSelect: () => setPick(null) },
  ] : [];

  const cell = (m: Mon, where: Pick['where'], i: number) => (
    <button class={`pccell ${m.hp <= 0 ? 'is-ko' : ''}`} onClick={() => { setNote(''); setPick({ where, i }); }}>
      <img class="mon-art" src={artUrl(creature(m.species))} alt="" />
      <small>{lv(m.level)}</small>
    </button>
  );

  return (
    <Frame title={tr(L('PC de Papeterre', 'Papeterra PC'))} onBack={onClose} backLabel={tr(L('Éteindre', 'Log off'))}>
      <div class="pc">
        <Window class="pc__box">
          <p class="pc__label">{tr(L('BOÎTE', 'BOX'))} · {box.length}</p>
          <div class="pc__grid">
            {box.map((m, i) => cell(m, 'box', i))}
            {!box.length && <p class="pc__empty">{tr(L('La boîte est vide.', 'The box is empty.'))}</p>}
          </div>
        </Window>
        <Window class="pc__party">
          <p class="pc__label">{tr(L('ÉQUIPE', 'PARTY'))} {party.length}/6</p>
          <div class="pc__col">{party.map((m, i) => cell(m, 'party', i))}</div>
        </Window>
      </div>
      <Window seyes class="pc__note">{note || tr(L('Touche une Bestiole pour la déplacer.', 'Tap a Critter to move it.'))}</Window>
      {pick && mon && (
        <div class="view-modal" onClick={() => setPick(null)}>
          <div onClick={(e) => e.stopPropagation()}>
            <Window class="party__sub">
              <p class="party__subtitle">{tr(creature(mon.species).name)} · {lv(mon.level)}</p>
              <MenuList items={actions} onCancel={() => setPick(null)} />
            </Window>
          </div>
        </div>
      )}
      {summary && <SummaryView mon={summary} onClose={() => setSummary(null)} />}
    </Frame>
  );
}
