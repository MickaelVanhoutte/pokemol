import { useEffect, useState } from 'preact/hooks';
import { L, locale, tr } from '../../i18n';
import { creature } from '../../data/creatures';
import type { HallEntry } from '../../data/postgame';
import { monArtUrl } from '../monArt';
import { Frame, Window } from '../paper';
import './views.css';

/** The Hall of Fame: one photo of each team that won the Grand Concours (◀ ▶ between them). */
export function HallView({ entries, fresh, onClose }: { entries: HallEntry[]; fresh?: boolean; onClose: () => void }) {
  const [i, setI] = useState(entries.length - 1);
  const e = entries[i];
  const turn = (d: 1 | -1) => setI((x) => (x + d + entries.length) % entries.length);
  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === 'ArrowLeft') turn(-1);
      else if (ev.key === 'ArrowRight') turn(1);
      else if (ev.key === 'z' || ev.key === 'Z' || ev.key === 'Enter') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, entries.length]);
  if (!e) return null;
  const date = new Date(e.date).toLocaleDateString(locale.value === 'en' ? 'en-GB' : 'fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  return (
    <Frame title={tr(L('Panthéon', 'Hall of Fame'))} onBack={onClose} class="hall">
      {fresh && <Window seyes class="hall__note">{tr(L('Bienvenue au Panthéon ! Ton équipe y restera pour toujours.', 'Welcome to the Hall of Fame! Your team will stay here forever.'))}</Window>}
      <div class="hall__nav">
        {entries.length > 1 && <button class="pbtn" onClick={() => turn(-1)} aria-label="◀">◀</button>}
        <p class="hall__label">{tr(L('Victoire n°{n} · {d}', 'Win no. {n} · {d}'), { n: i + 1, d: date })}</p>
        {entries.length > 1 && <button class="pbtn" onClick={() => turn(1)} aria-label="▶">▶</button>}
      </div>
      <Window class="hall__photo">
        <div class="hall__grid">
          {e.team.map((m) => (
            <figure class="hall__mon">
              <img class="mon-art" src={monArtUrl(m)} alt="" />
              <figcaption>
                {m.shiny ? '✦ ' : ''}{m.nickname || tr(creature(m.species).name)}
                <span>N.{m.level}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </Window>
    </Frame>
  );
}
