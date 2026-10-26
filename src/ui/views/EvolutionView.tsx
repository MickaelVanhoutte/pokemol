import { useEffect, useRef, useState } from 'preact/hooks';
import { L, tr } from '../../i18n';
import { creature, monLabel } from '../../data/creatures';
import type { Mon } from '../../engine/pk/creature';
import { monArtUrl } from '../monArt';
import { sfx } from '../../audio/sfx';
import { TextBox } from '../paper';
import './views.css';

type Phase = 'intro' | 'morph' | 'done' | 'stopped';

/**
 * FRLG evolution: the drawing turns into a white silhouette that swaps with the new one,
 * faster and faster, then the new Bestiole appears. B (or the button) stops it.
 */
export function EvolutionView({ mon, to, onEnd }: { mon: Mon; to: string; onEnd: (evolved: boolean) => void }) {
  const [phase, setPhase] = useState<Phase>('intro');
  const [showNew, setShowNew] = useState(false);
  const [flash, setFlash] = useState(false);
  const stop = useRef(false);
  const b = creature(to);
  const name = monLabel(mon);

  useEffect(() => {
    if (phase !== 'morph') return;
    let alive = true;
    (async () => {
      const delays = [520, 460, 400, 340, 300, 260, 220, 190, 160, 130, 110, 90, 80, 70, 60, 60, 50, 50];
      let alt = false;
      for (const d of delays) {
        await new Promise((r) => setTimeout(r, d));
        if (!alive) return;
        if (stop.current) {
          setShowNew(false);
          setPhase('stopped');
          return;
        }
        alt = !alt;
        setShowNew(alt);
      }
      setFlash(true);
      sfx.levelUp();
      await new Promise((r) => setTimeout(r, 450));
      if (!alive) return;
      setShowNew(true);
      setFlash(false);
      setPhase('done');
    })();
    return () => { alive = false; };
  }, [phase]);

  useEffect(() => {
    if (phase !== 'morph') return;
    const onKey = (e: KeyboardEvent) => {
      if (['x', 'X', 'Escape', 'Backspace'].includes(e.key)) {
        e.preventDefault();
        stop.current = true;
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [phase]);

  const text = phase === 'intro' ? tr(L('Quoi ? {n} évolue !', 'What? {n} is evolving!'), { n: name })
    : phase === 'morph' ? '…'
    : phase === 'done' ? tr(L('Félicitations ! Ton {n} a évolué en {m} !', 'Congratulations! Your {n} evolved into {m}!'), { n: name, m: tr(b.name) })
    : tr(L('Hein ? {n} a arrêté d’évoluer !', 'Huh? {n} stopped evolving!'), { n: name });

  return (
    <div class={`evo ${flash ? 'is-flash' : ''}`}>
      <div class="evo__stage">
        <img
          class={`mon-art evo__mon ${phase === 'morph' ? 'is-silhouette' : ''}`}
          src={monArtUrl(showNew ? { species: to, shiny: mon.shiny } : mon)}
          alt=""
        />
      </div>
      {phase === 'morph' && (
        <button class="pbtn pbtn--b evo__stop" onClick={() => (stop.current = true)}>{tr(L('Arrêter', 'Stop'))}</button>
      )}
      <TextBox
        class="evo__text"
        text={text}
        keys={phase !== 'morph'}
        arrow={phase !== 'morph'}
        onAdvance={phase === 'intro' ? () => setPhase('morph') : phase === 'done' ? () => onEnd(true) : phase === 'stopped' ? () => onEnd(false) : undefined}
      />
    </div>
  );
}
