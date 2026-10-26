import { useEffect, useRef, useState } from 'preact/hooks';
import { L, tr } from '../../i18n';
import { canHold, item } from '../../data/items';
import { MenuList, PixelIcon, Window, type MenuItem } from '../paper';
import { POCKETS, pocketItems, type Pocket } from '../logic/bag';
import { sketchIconUrl } from '../sketchIcons';
import './views.css';

const POCKET_NAMES: Record<Pocket, ReturnType<typeof L>> = {
  items: L('OBJETS', 'ITEMS'),
  balls: L('CRAYON-BALLS', 'PENCIL BALLS'),
  berries: L('BAIES', 'BERRIES'),
  stencils: L('POCHOIRS', 'STENCILS'),
  key: L('OBJETS RARES', 'KEY ITEMS'),
};

/**
 * FRLG bag: a pencil case with pockets. Picking an item and USE calls `onUse`, GIVE calls `onGive`
 * (a Bestiole holds it); key items with a text (sketchbook pages) can be READ. The `give` context
 * only shows what can be held (opened from the party's ITEM menu).
 */
export function BagView({ bag, context, wild, onUse, onGive, onRead, onClose, note }: {
  bag: Record<string, number>;
  context: 'field' | 'battle' | 'give';
  wild?: boolean;
  onUse: (id: string) => void;
  onGive?: (id: string) => void;
  onRead?: (id: string) => void;
  onClose: () => void;
  /** Message shown in the description box (e.g. "It won't have any effect"). */
  note?: string;
}) {
  const pockets = context === 'give' ? POCKETS.filter((p) => p !== 'key') : POCKETS;
  const [pocket, setPocket] = useState<Pocket>(context === 'battle' && wild ? 'balls' : 'items');
  const [cursor, setCursor] = useState(0);
  const [action, setAction] = useState<string | null>(null);
  const [msg, setMsg] = useState('');
  // a message from outside ("X learned Y") stays until the cursor moves
  const [noteOn, setNoteOn] = useState(true);
  useEffect(() => setNoteOn(true), [note]);
  const lastCursor = useRef(0);
  const moveCursor = (i: number) => {
    if (i !== lastCursor.current) { setMsg(''); setNoteOn(false); }
    lastCursor.current = i;
    setCursor(i);
  };
  const list = pocketItems(bag, pocket).filter((it) => context !== 'give' || canHold(it));
  const turn = (d: 1 | -1) => {
    setPocket((p) => pockets[(pockets.indexOf(p) + d + pockets.length) % pockets.length]);
    setMsg('');
    setNoteOn(false);
  };
  const focused = list[cursor];
  const why = (id: string): string | null => {
    const def = item(id);
    if (context === 'battle' && (def.kind === 'key' || def.kind === 'hold' || def.kind === 'stencil' || def.kind === 'evo')) return tr(L('Ce n’est pas le moment d’utiliser ça !', 'This isn’t the time to use that!'));
    if (context === 'battle' && def.kind === 'ball' && !wild) return tr(L('On ne lance pas de Crayon-ball sur la Bestiole d’un dresseur !', 'You can’t throw a Pencil Ball at a trainer’s Critter!'));
    if (context === 'battle' && def.kind === 'field') return tr(L('Ce n’est pas le moment d’utiliser ça !', 'This isn’t the time to use that!'));
    if (context === 'field' && def.kind === 'battle') return tr(L('Cet objet ne s’utilise qu’en combat, sur la Bestiole qui se bat.', 'This item only works in battle, on the Critter fighting.'));
    if (context === 'field' && def.kind === 'ball') return tr(L('Les Crayon-balls se lancent sur les Bestioles sauvages, en combat.', 'Pencil Balls are thrown at wild Critters, in battle.'));
    return null;
  };

  const items: MenuItem[] = [
    ...list.map((it) => ({
      label: tr(it.name),
      icon: it.id,
      side: it.kind === 'key' || it.kind === 'stencil' ? '' : `×${bag[it.id]}`,
      onSelect: () => { setMsg(''); setNoteOn(false); setAction(it.id); },
    })),
  ];

  const def = action ? item(action) : null;
  const give: MenuItem = { label: tr(L('DONNER', 'GIVE')), onSelect: () => { const id = action!; setAction(null); onGive?.(id); } };
  const actions: MenuItem[] = def ? [
    ...(context === 'give' ? [give] : def.kind === 'key' && onRead
      ? [{ label: tr(L('LIRE', 'READ')), onSelect: () => { const id = action!; setAction(null); onRead(id); } }]
      : [
        ...(def.kind === 'hold' && context === 'field' ? [] : [{
          label: tr(L('UTILISER', 'USE')),
          onSelect: () => {
            const id = action!;
            setAction(null);
            const no = why(id);
            if (no) setMsg(no);
            else onUse(id);
          },
        }]),
        ...(context === 'field' && onGive && canHold(def) ? [give] : []),
      ]),
    { label: tr(L('ANNULER', 'CANCEL')), onSelect: () => setAction(null) },
  ] : [];

  return (
    <div class="frame graph bag">
      <div class="bag__head">
        <button class="pbtn" onClick={() => turn(-1)} aria-label="◀">◀</button>
        <Window class="bag__pocket">
          <img class="sicon" src={sketchIconUrl('bag')!} width={38} height={38} alt="" />
          <span>{tr(POCKET_NAMES[pocket])}</span>
          <span class="bag__dots">{pockets.map((p) => <i class={p === pocket ? 'is-on' : ''} />)}</span>
        </Window>
        <button class="pbtn" onClick={() => turn(1)} aria-label="▶">▶</button>
      </div>
      <Window class="bag__list">
        <MenuList key={pocket} items={items} active={!action} onCancel={onClose} onCursor={moveCursor} tapFocus />
      </Window>
      <div class="bag__foot">
        <Window seyes class="bag__desc">
          {focused && <PixelIcon id={focused.id} size={36} />}
          <p>{msg || (noteOn && note) || (focused ? tr(focused.desc) : tr(L('Cette poche est vide.', 'This pocket is empty.')))}</p>
        </Window>
        <button class="pbtn pbtn--b bag__close" onClick={onClose}>{tr(L('Fermer', 'Close'))}</button>
      </div>
      {action && (
        <div class="view-modal" onClick={() => setAction(null)}>
          <div onClick={(e) => e.stopPropagation()}>
            <Window class="bag__actions">
              <p class="party__subtitle">{tr(item(action).name)}</p>
              <MenuList items={actions} onCancel={() => setAction(null)} />
            </Window>
          </div>
        </div>
      )}
    </div>
  );
}
