import { useState } from 'preact/hooks';
import { L, tr } from '../i18n';
import { artUrl, creature } from '../data/creatures';
import { TypeBadge } from './MonSummary';
import './screens.css';

/**
 * Creatures shown big over the world. With `pick`, tapping one opens its detail with
 * "Choose" and "Back" (starter choice); otherwise a single reveal with OK (evolution, gift).
 */
export function MonPick({ ids, title, pick, onChoose }: { ids: string[]; title?: string; pick: boolean; onChoose: (i: number) => void }) {
  const [focus, setFocus] = useState<number | null>(pick ? null : 0);
  const n = ids.length;
  if (focus !== null) {
    const sp = creature(ids[focus]);
    return (
      <div class="overlay">
        <div class="sheet">
          {title && <h2 class="pixel" style={{ margin: 0, textAlign: 'center' }}>{title}</h2>}
          <div class="sheet__art" style={{ width: '100%', height: 'min(46vw, 34dvh)' }}>
            <img src={artUrl(sp)} alt="" />
          </div>
          <h2 class="pixel" style={{ margin: 0, textAlign: 'center' }}>{tr(sp.name)} <TypeBadge type={sp.type} /></h2>
          <p class="sheet__dex"><b>{tr(sp.kind)}</b> — {tr(sp.dex)}</p>
          {pick ? (
            <>
              <div class="pick__nav">
                {n > 1 && <button class="btn" aria-label={tr(L('Précédente', 'Previous'))} onClick={() => setFocus((focus + n - 1) % n)}>‹</button>}
                <button class="btn btn--primary" onClick={() => onChoose(focus)}>{tr(L('Choisir {n}', 'Choose {n}'), { n: tr(sp.name) })}</button>
                {n > 1 && <button class="btn" aria-label={tr(L('Suivante', 'Next'))} onClick={() => setFocus((focus + 1) % n)}>›</button>}
              </div>
              <button class="btn" onClick={() => setFocus(null)}>← {tr(L('Retour', 'Back'))}</button>
            </>
          ) : (
            <button class="btn btn--primary" onClick={() => onChoose(0)}>OK</button>
          )}
        </div>
      </div>
    );
  }
  return (
    <div class="overlay">
      <div class="chooser3">
        {title && <h2 class="pixel">{title}</h2>}
        <p>{tr(L('Touche une Bestiole pour la voir de plus près', 'Tap a Critter to take a closer look'))}</p>
        <div class="chooser3__row">
          {ids.map((id, i) => (
            <button class="chooser3__cell" onClick={() => setFocus(i)}>
              <img src={artUrl(creature(id))} alt="" />
              <b>{tr(creature(id).name)}</b>
              <TypeBadge type={creature(id).type} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
