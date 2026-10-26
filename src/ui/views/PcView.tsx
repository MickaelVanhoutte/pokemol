import { useState } from 'preact/hooks';
import { L, tr } from '../../i18n';
import { monLabel } from '../../data/creatures';
import { monArtUrl } from '../monArt';
import type { Mon } from '../../engine/pk/creature';
import { Frame, MenuList, Window, lv, type MenuItem } from '../paper';
import { canDeposit, canWithdraw } from '../logic/pc';
import { BOX_SIZE } from '../../save/schema';
import { SummaryView } from './SummaryView';
import './views.css';

type Pick = { where: 'party' | 'box'; i: number };

/** PC storage: one box at a time as a grid of drawings (◀ ▶ between boxes), the party as a column. */
export function PcView({ party, boxes, onDeposit, onWithdraw, onClose }: {
  party: Mon[]; boxes: Mon[][]; onDeposit: (i: number, box: number) => void; onWithdraw: (box: number, i: number) => void; onClose: () => void;
}) {
  const [b, setB] = useState(0);
  const box = boxes[b] ?? [];
  const turn = (d: 1 | -1) => { setPick(null); setB((x) => (x + d + boxes.length) % boxes.length); };
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
          if (box.length >= BOX_SIZE) return setNote(tr(L('Cette boîte est pleine : choisis-en une autre avec ◀ ▶.', 'This box is full: pick another one with ◀ ▶.')));
          onDeposit(pick.i, b);
          setNote(tr(L('{n} est rangé dans la boîte.', '{n} was stored in the box.'), { n: monLabel(mon) }));
        },
      }
      : {
        label: tr(L('RETIRER', 'WITHDRAW')),
        onSelect: () => {
          setPick(null);
          if (!canWithdraw(party)) return setNote(tr(L('Ton équipe est complète !', 'Your party is full!')));
          onWithdraw(b, pick.i);
          setNote(tr(L('{n} rejoint ton équipe.', '{n} joined your party.'), { n: monLabel(mon) }));
        },
      },
    { label: tr(L('RÉSUMÉ', 'SUMMARY')), onSelect: () => { setSummary(mon); setPick(null); } },
    { label: tr(L('ANNULER', 'CANCEL')), onSelect: () => setPick(null) },
  ] : [];

  const cell = (m: Mon, where: Pick['where'], i: number) => (
    <button class={`pccell ${m.hp <= 0 ? 'is-ko' : ''}`} onClick={() => { setNote(''); setPick({ where, i }); }}>
      <img class="mon-art" src={monArtUrl(m)} alt="" />
      <small>{lv(m.level)}</small>
    </button>
  );

  return (
    <Frame title={tr(L('PC de Papeterre', 'Papeterra PC'))} onBack={onClose} backLabel={tr(L('Éteindre', 'Log off'))}>
      <div class="pc">
        <Window class="pc__box">
          <div class="pc__boxnav">
            <button class="pbtn" onClick={() => turn(-1)} aria-label="◀">◀</button>
            <p class="pc__label">{tr(L('BOÎTE {n}', 'BOX {n}'), { n: b + 1 })} · {box.length}/{BOX_SIZE}</p>
            <button class="pbtn" onClick={() => turn(1)} aria-label="▶">▶</button>
          </div>
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
              <p class="party__subtitle">{monLabel(mon)} · {lv(mon.level)}</p>
              <MenuList items={actions} onCancel={() => setPick(null)} />
            </Window>
          </div>
        </div>
      )}
      {summary && <SummaryView mon={summary} onClose={() => setSummary(null)} />}
    </Frame>
  );
}
