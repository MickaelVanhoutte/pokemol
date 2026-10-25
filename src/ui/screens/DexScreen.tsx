import { useState } from 'preact/hooks';
import { L, tr } from '../../i18n';
import { CREATURES, artUrl, creature } from '../../data/creatures';
import { STAT_NAMES } from '../../data/types';
import { STAT_KEYS } from '../../engine/pk/creature';
import { backToWorld } from '../../overworld/controller';
import { save } from '../../state/game';
import { go } from '../../state/router';
import { TypeBadge } from '../MonSummary';
import '../screens.css';

/** Bestiodex. From the title screen (`all`) every drawing is shown, in game only seen/caught ones. */
export function DexScreen({ all }: { all?: boolean }) {
  const d = save.value;
  const [open, setOpen] = useState<string | null>(null);
  const seen = (id: string) => all || !!d?.dex.seen.includes(id);
  const caught = (id: string) => all || !!d?.dex.caught.includes(id);
  const leave = () => (all ? go({ id: 'title' }) : backToWorld());
  const sp = open ? creature(open) : null;
  return (
    <div class="screen mscreen">
      <div class="screen__bar">
        <button class="btn btn--small" onClick={leave}>← {tr(L('Retour', 'Back'))}</button>
        <h1>{tr(L('Bestiodex', 'Critterdex'))}</h1>
        {!all && d && (
          <span class="money">{tr(L('Vus {s} · Pris {c}', 'Seen {s} · Caught {c}'), { s: d.dex.seen.length, c: d.dex.caught.length })}</span>
        )}
      </div>
      <div class="dexgrid">
        {CREATURES.map((c) => (
          <button class={`dexcell ${seen(c.id) && !caught(c.id) ? 'is-seen' : ''}`} disabled={!seen(c.id)} onClick={() => setOpen(c.id)}>
            <small>N° {c.id}</small>
            {seen(c.id) ? <img src={artUrl(c)} alt="" /> : <span class="dexcell__q">?</span>}
            <b>{seen(c.id) ? tr(c.name) : '???'} {caught(c.id) && !all ? <span class="caught">●</span> : null}</b>
          </button>
        ))}
      </div>
      {sp && (
        <div class="overlay" onClick={() => setOpen(null)}>
          <div class="sheet" onClick={(e) => e.stopPropagation()}>
            <div class="sheet__head">
              <div class="sheet__art"><img src={artUrl(sp)} alt="" style={caught(sp.id) ? undefined : { filter: 'brightness(0)' }} /></div>
              <div class="sheet__id">
                <small>N° {sp.id}</small>
                <h2 class="pixel">{tr(sp.name)}</h2>
                <p><TypeBadge type={sp.type} /> <small>{tr(sp.kind)}</small></p>
              </div>
            </div>
            {caught(sp.id) ? (
              <>
                <p class="sheet__dex">{tr(sp.dex)}</p>
                <table class="stats">
                  {STAT_KEYS.map((k) => (
                    <tr>
                      <th>{tr(STAT_NAMES[k])}</th>
                      <td>{sp.base[k]}</td>
                      <td class="stats__bar"><span style={{ width: `${Math.min(100, (sp.base[k] / 130) * 100)}%` }} /></td>
                    </tr>
                  ))}
                </table>
                {sp.evolvesTo && sp.evolveLevel && (
                  <p class="sheet__evo">{tr(L('Évolue en {n} au niveau {l}.', 'Evolves into {n} at level {l}.'), { n: tr(creature(sp.evolvesTo).name), l: sp.evolveLevel })}</p>
                )}
              </>
            ) : (
              <p class="sheet__dex">{tr(L('Attrape cette Bestiole pour en savoir plus !', 'Catch this Critter to learn more about it!'))}</p>
            )}
            <button class="btn btn--primary" onClick={() => setOpen(null)}>OK</button>
          </div>
        </div>
      )}
    </div>
  );
}
