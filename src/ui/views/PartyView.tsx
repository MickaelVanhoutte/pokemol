import { useState } from 'preact/hooks';
import { L, tr } from '../../i18n';
import { artUrl, creature } from '../../data/creatures';
import { maxHp, type Mon } from '../../engine/pk/creature';
import { HpBar, MenuList, PixelIcon, StatusTag, Window, lv, type MenuItem } from '../paper';
import { item } from '../../data/items';
import { useMenuNav } from '../paper/nav';
import { SummaryView } from './SummaryView';
import './views.css';

export type PartyMode = 'field' | 'battle' | 'forced' | 'target';

function Slot({ m, i, lead, active, cursor, disabled, swapping, tag, onClick }: {
  m: Mon; i: number; lead: boolean; active: boolean; cursor: boolean; disabled: boolean; swapping: boolean; tag?: string; onClick: () => void;
}) {
  const sp = creature(m.species);
  return (
    <button
      class={`pslot ${lead ? 'pslot--lead' : ''} ${cursor ? 'is-on' : ''} ${m.hp <= 0 ? 'is-ko' : ''} ${active ? 'is-active' : ''} ${swapping ? 'is-swap' : ''}`}
      disabled={disabled}
      onClick={onClick}
      aria-label={`${i + 1}`}
    >
      <img class="mon-art pslot__art" src={artUrl(sp)} alt="" />
      <span class="pslot__info">
        <b>{tr(sp.name)}</b>
        <span class="pslot__lv">{lv(m.level)} {m.status && <StatusTag s={m.status} />}{m.item && <span class="pslot__held" title={tr(item(m.item).name)}><PixelIcon id={m.item} size={16} /></span>}</span>
        {tag ? <span class="pslot__tag">{tag}</span> : (
          <>
            <HpBar hp={m.hp} max={maxHp(m)} />
            <span class="pslot__hp">{m.hp}/{maxHp(m)}</span>
          </>
        )}
      </span>
    </button>
  );
}

/**
 * FRLG party screen. `field`: summary, held item (give / take) and order; `battle`: send out or
 * summary; `forced`: like battle with no cancel (after a faint); `target`: pick who gets an item.
 */
export function PartyView({ party, mode, active = -1, canPick = () => true, message, tag, refuse, onPick, onSwap, onGive, onTake, onClose }: {
  party: Mon[];
  mode: PartyMode;
  /** Creature currently fighting (battle modes). */
  active?: number;
  canPick?: (i: number) => boolean;
  message?: string;
  /** Replaces the HP line (technical capsules: ABLE / NOT ABLE). */
  tag?: (i: number) => string;
  /** Why a creature can't be picked in `target` mode (default: no effect). */
  refuse?: (i: number) => string;
  onPick?: (i: number) => void;
  onSwap?: (i: number, j: number) => void;
  /** Field ITEM menu: GIVE opens the bag, TAKE puts the held item back in it. */
  onGive?: (i: number) => void;
  onTake?: (i: number) => void;
  onClose?: () => void;
}) {
  const [menuFor, setMenuFor] = useState<number | null>(null);
  const [itemFor, setItemFor] = useState<number | null>(null);
  const [summary, setSummary] = useState<number | null>(null);
  const [swapFrom, setSwapFrom] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const n = party.length;
  const cancellable = mode !== 'forced';

  const choose = (i: number) => {
    setNote('');
    if (swapFrom !== null) {
      if (i !== swapFrom) onSwap?.(swapFrom, i);
      setSwapFrom(null);
      return;
    }
    if (mode === 'target') {
      if (canPick(i)) onPick?.(i);
      else setNote(refuse?.(i) ?? tr(L('Ça n’aura aucun effet.', 'It won’t have any effect.')));
      return;
    }
    setMenuFor(i);
  };
  const [cur, setCur] = useMenuNav(n + (cancellable ? 1 : 0), {
    active: menuFor === null && itemFor === null && summary === null,
    onSelect: (i) => (i >= n ? onClose?.() : choose(i)),
    onCancel: () => (swapFrom !== null ? setSwapFrom(null) : cancellable ? onClose?.() : undefined),
  });

  const sub: MenuItem[] = menuFor === null ? [] : mode === 'field'
    ? [
      { label: tr(L('RÉSUMÉ', 'SUMMARY')), onSelect: () => { setSummary(menuFor); setMenuFor(null); } },
      ...(onGive ? [{ label: tr(L('OBJET', 'ITEM')), onSelect: () => { setItemFor(menuFor); setMenuFor(null); } }] : []),
      { label: tr(L('ORDRE', 'SWITCH')), disabled: n < 2, onSelect: () => { setSwapFrom(menuFor); setMenuFor(null); } },
      { label: tr(L('ANNULER', 'CANCEL')), onSelect: () => setMenuFor(null) },
    ]
    : [
      {
        label: tr(L('ENVOYER', 'SHIFT')),
        onSelect: () => {
          const i = menuFor;
          setMenuFor(null);
          if (i === active) setNote(tr(L('{n} est déjà au combat !', '{n} is already in battle!'), { n: tr(creature(party[i].species).name) }));
          else if (party[i].hp <= 0) setNote(tr(L('{n} n’a plus la force de se battre !', '{n} has no energy left to battle!'), { n: tr(creature(party[i].species).name) }));
          else if (canPick(i)) onPick?.(i);
        },
      },
      { label: tr(L('RÉSUMÉ', 'SUMMARY')), onSelect: () => { setSummary(menuFor); setMenuFor(null); } },
      { label: tr(L('ANNULER', 'CANCEL')), onSelect: () => setMenuFor(null) },
    ];

  const itemMenu: MenuItem[] = itemFor === null ? [] : [
    { label: tr(L('DONNER', 'GIVE')), onSelect: () => { const i = itemFor; setItemFor(null); onGive?.(i); } },
    {
      label: tr(L('PRENDRE', 'TAKE')),
      onSelect: () => {
        const i = itemFor;
        setItemFor(null);
        const m = party[i];
        const n = tr(creature(m.species).name);
        if (!m.item) return setNote(tr(L('{n} ne tient rien.', '{n} isn’t holding anything.'), { n }));
        setNote(tr(L('Tu reprends {i} à {n}.', 'Received the {i} from {n}.'), { i: tr(item(m.item).name), n }));
        onTake?.(i);
      },
    },
    { label: tr(L('ANNULER', 'CANCEL')), onSelect: () => setItemFor(null) },
  ];

  const prompt = note || (swapFrom !== null
    ? tr(L('Avec quelle Bestiole échanger ?', 'Move to where?'))
    : message ?? (mode === 'target' ? tr(L('Utiliser sur quelle Bestiole ?', 'Use on which Critter?')) : tr(L('Choisis une Bestiole.', 'Choose a Critter.'))));

  return (
    <div class="frame graph party">
      <div class="party__grid">
        {party.map((m, i) => (
          <Slot
            m={m} i={i} lead={i === 0} active={i === active} cursor={i === cur}
            disabled={false} swapping={i === swapFrom} tag={tag?.(i)}
            onClick={() => { setCur(i); choose(i); }}
          />
        ))}
        {Array.from({ length: Math.max(0, 6 - n) }, () => <span class="pslot pslot--empty" aria-hidden="true" />)}
      </div>
      <div class="party__foot">
        <Window seyes class="party__msg">{prompt}</Window>
        {cancellable && (
          <button class={`pbtn pbtn--b party__cancel ${cur === n ? 'is-on' : ''}`} onClick={() => (swapFrom !== null ? setSwapFrom(null) : onClose?.())}>
            {tr(L('ANNULER', 'CANCEL'))}
          </button>
        )}
      </div>
      {menuFor !== null && (
        <div class="view-modal" onClick={() => setMenuFor(null)}>
          <div onClick={(e) => e.stopPropagation()}>
            <Window class="party__sub">
              <p class="party__subtitle">{tr(creature(party[menuFor].species).name)}</p>
              <MenuList items={sub} onCancel={() => setMenuFor(null)} />
            </Window>
          </div>
        </div>
      )}
      {itemFor !== null && (
        <div class="view-modal" onClick={() => setItemFor(null)}>
          <div onClick={(e) => e.stopPropagation()}>
            <Window class="party__sub">
              <p class="party__subtitle">
                {party[itemFor].item
                  ? tr(L('{n} tient : {i}', '{n} holds: {i}'), { n: tr(creature(party[itemFor].species).name), i: tr(item(party[itemFor].item!).name) })
                  : tr(creature(party[itemFor].species).name)}
              </p>
              <MenuList items={itemMenu} onCancel={() => setItemFor(null)} />
            </Window>
          </div>
        </div>
      )}
      {summary !== null && <SummaryView mon={party[summary]} onClose={() => setSummary(null)} />}
    </div>
  );
}
