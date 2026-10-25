import { useState } from 'preact/hooks';
import { L, tr } from '../i18n';
import { artUrl, creature } from '../data/creatures';
import { TYPES } from '../data/types';
import { TypeBadge, Window, YesNo } from './paper';
import { useMenuNav } from './paper/nav';
import './screens.css';

/**
 * Creatures shown big over the world. With `pick`, tapping one opens its detail and asks
 * "Choose it?" (starter choice); otherwise a single reveal with OK (evolution, gift).
 */
export function MonPick({ ids, title, pick, onChoose }: { ids: string[]; title?: string; pick: boolean; onChoose: (i: number) => void }) {
  const [focus, setFocus] = useState<number | null>(pick ? null : 0);
  const n = ids.length;
  const [cur, setCur] = useMenuNav(n, { cols: n, active: focus === null, onSelect: (i) => setFocus(i) });
  useMenuNav(1, { active: focus !== null && !pick, onSelect: () => onChoose(0), onCancel: () => onChoose(0) });

  if (focus !== null) {
    const sp = creature(ids[focus]);
    return (
      <div class="monpick">
        {title && <Window class="monpick__title">{title}</Window>}
        <Window class="monpick__card" >
          <div class="monpick__art" style={{ '--type': TYPES[sp.type].color }}>
            <img class="mon-art" src={artUrl(sp)} alt="" />
          </div>
          <p class="monpick__name">{tr(sp.name)} <TypeBadge type={sp.type} /></p>
          <p class="monpick__dex"><b>{tr(sp.kind)}</b> — {tr(sp.dex)}</p>
        </Window>
        {pick ? (
          <div class="monpick__ask">
            <Window seyes class="monpick__q">{tr(L('Tu choisis {n} ?', 'So, you want {n}?'), { n: tr(sp.name) })}</Window>
            <div class="monpick__nav">
              {n > 1 && <button class="pbtn" onClick={() => setFocus((focus + n - 1) % n)} aria-label="◀">◀</button>}
              <YesNo onAnswer={(yes) => (yes ? onChoose(focus) : setFocus(null))} />
              {n > 1 && <button class="pbtn" onClick={() => setFocus((focus + 1) % n)} aria-label="▶">▶</button>}
            </div>
          </div>
        ) : (
          <button class="pbtn pbtn--accent monpick__ok" onClick={() => onChoose(0)}>OK ▶</button>
        )}
      </div>
    );
  }
  return (
    <div class="monpick">
      {title && <Window class="monpick__title">{title}</Window>}
      <div class="monpick__row">
        {ids.map((id, i) => (
          <button class={`monpick__cell ${i === cur ? 'is-on' : ''}`} onClick={() => { setCur(i); setFocus(i); }}>
            <img class="mon-art" src={artUrl(creature(id))} alt="" />
            <b>{tr(creature(id).name)}</b>
            <TypeBadge type={creature(id).type} />
          </button>
        ))}
      </div>
      <Window seyes class="monpick__q">{tr(L('Touche une Bestiole pour la voir de plus près.', 'Tap a Critter to take a closer look.'))}</Window>
    </div>
  );
}
