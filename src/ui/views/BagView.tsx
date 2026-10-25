import { useState } from 'preact/hooks';
import { L, tr } from '../../i18n';
import { item } from '../../data/items';
import { MenuList, PixelIcon, Window, type MenuItem } from '../paper';
import { POCKETS, pocketItems, type Pocket } from '../logic/bag';
import './views.css';

const POCKET_NAMES: Record<Pocket, ReturnType<typeof L>> = {
  items: L('OBJETS', 'ITEMS'),
  balls: L('CRAYON-BALLS', 'PENCIL BALLS'),
  key: L('OBJETS RARES', 'KEY ITEMS'),
};

/**
 * FRLG bag: a pencil case with pockets. Picking an item and USE calls `onUse`; key items
 * with a text (sketchbook pages) can be READ.
 */
export function BagView({ bag, context, wild, onUse, onRead, onClose, note }: {
  bag: Record<string, number>;
  context: 'field' | 'battle';
  wild?: boolean;
  onUse: (id: string) => void;
  onRead?: (id: string) => void;
  onClose: () => void;
  /** Message shown in the description box (e.g. "It won't have any effect"). */
  note?: string;
}) {
  const [pocket, setPocket] = useState<Pocket>(context === 'battle' && wild ? 'balls' : 'items');
  const [cursor, setCursor] = useState(0);
  const [action, setAction] = useState<string | null>(null);
  const [msg, setMsg] = useState('');
  const list = pocketItems(bag, pocket);
  const turn = (d: 1 | -1) => {
    setPocket((p) => POCKETS[(POCKETS.indexOf(p) + d + POCKETS.length) % POCKETS.length]);
    setMsg('');
  };
  const focused = list[cursor];
  const why = (id: string): string | null => {
    const def = item(id);
    if (context === 'battle' && def.kind === 'key') return tr(L('Ce n’est pas le moment d’utiliser ça !', 'This isn’t the time to use that!'));
    if (context === 'battle' && def.kind === 'ball' && !wild) return tr(L('On ne lance pas de Crayon-ball sur la Bestiole d’un dresseur !', 'You can’t throw a Pencil Ball at a trainer’s Critter!'));
    if (context === 'field' && def.kind === 'ball') return tr(L('Les Crayon-balls se lancent sur les Bestioles sauvages, en combat.', 'Pencil Balls are thrown at wild Critters, in battle.'));
    return null;
  };

  const items: MenuItem[] = [
    ...list.map((it) => ({
      label: tr(it.name),
      icon: it.id,
      side: it.kind === 'key' ? '' : `×${bag[it.id]}`,
      onSelect: () => { setMsg(''); setAction(it.id); },
    })),
    { label: tr(L('FERMER LE SAC', 'CLOSE BAG')), onSelect: onClose },
  ];

  const actions: MenuItem[] = action ? [
    ...(item(action).kind === 'key' && onRead
      ? [{ label: tr(L('LIRE', 'READ')), onSelect: () => { const id = action; setAction(null); onRead(id); } }]
      : [{
        label: tr(L('UTILISER', 'USE')),
        onSelect: () => {
          const id = action;
          setAction(null);
          const no = why(id);
          if (no) setMsg(no);
          else onUse(id);
        },
      }]),
    { label: tr(L('ANNULER', 'CANCEL')), onSelect: () => setAction(null) },
  ] : [];

  return (
    <div class="frame graph bag">
      <div class="bag__head">
        <button class="pbtn" onClick={() => turn(-1)} aria-label="◀">◀</button>
        <Window class="bag__pocket">
          <PixelIcon id="bag" size={32} />
          <span>{tr(POCKET_NAMES[pocket])}</span>
          <span class="bag__dots">{POCKETS.map((p) => <i class={p === pocket ? 'is-on' : ''} />)}</span>
        </Window>
        <button class="pbtn" onClick={() => turn(1)} aria-label="▶">▶</button>
      </div>
      <Window class="bag__list">
        <MenuList key={pocket} items={items} active={!action} onCancel={onClose} onCursor={setCursor} />
        {!list.length && <p class="bag__empty">{tr(L('Cette poche est vide.', 'This pocket is empty.'))}</p>}
      </Window>
      <Window seyes class="bag__desc">
        {focused && <PixelIcon id={focused.id} size={36} />}
        <p>{msg || note || (focused ? tr(focused.desc) : tr(L('Ferme le sac et retourne à l’aventure.', 'Close the bag and get back to the adventure.')))}</p>
      </Window>
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
