import { useEffect, useRef, useState } from 'preact/hooks';
import { L, tr } from '../../i18n';
import { creature, monLabel } from '../../data/creatures';
import type { Mon } from '../../engine/pk/creature';
import { monArtUrl } from '../monArt';
import { sfx } from '../../audio/sfx';
import { currentTrack, playJingle, playMusic } from '../../audio/music';
import { TextBox } from '../paper';
import { BURST, EVO_SWAPS, isStopKey } from './evolution';
import './views.css';

type Phase = 'intro' | 'morph' | 'done' | 'stopped';

/**
 * FRLG evolution: the drawing turns into a glowing silhouette that swaps with the new, bigger one, faster and faster
 * over its own tune, rings of light pulsing round it; then a flash, sparkles bursting out, and the new Bestiole.
 * B (or the button) stops it, unless it is `locked` (Coconfus at the ending: nothing stops that one). Only a fresh
 * press counts: B held before the scene, or its key repeat, doesn't. The music before it comes back after.
 */
export function EvolutionView({ mon, to, onEnd, locked = false }: { mon: Mon; to: string; onEnd: (evolved: boolean) => void; locked?: boolean }) {
  const [phase, setPhase] = useState<Phase>('intro');
  const [showNew, setShowNew] = useState(false);
  const [flash, setFlash] = useState(false);
  const stop = useRef(false);
  const b = creature(to);
  const name = monLabel(mon);

  // its own tune while it changes, then the music that was playing
  useEffect(() => {
    const before = currentTrack();
    return () => {
      if (before) playMusic(before);
    };
  }, []);

  useEffect(() => {
    if (phase !== 'morph') return;
    playMusic('evolution');
    let alive = true;
    (async () => {
      let alt = false;
      for (const d of EVO_SWAPS) {
        await new Promise((r) => setTimeout(r, d));
        if (!alive) return;
        if (stop.current && !locked) {
          setShowNew(false);
          setPhase('stopped');
          return;
        }
        alt = !alt;
        setShowNew(alt);
      }
      setFlash(true);
      playJingle('evolved', { fallback: sfx.levelUp, resume: false });
      sfx.sparkle();
      await new Promise((r) => setTimeout(r, 450));
      if (!alive) return;
      setShowNew(true);
      setFlash(false);
      setPhase('done');
    })();
    return () => { alive = false; };
  }, [phase]);

  useEffect(() => {
    if (phase !== 'morph' || locked) return;
    const onKey = (e: KeyboardEvent) => {
      if (isStopKey(e)) {
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
    <div class={`evo is-${phase} ${flash ? 'is-flash' : ''}`}>
      <div class="evo__stage">
        {phase === 'morph' && [0, 1, 2].map((i) => <span key={i} class="evo__ring" style={{ animationDelay: `${i * 0.6}s` }} aria-hidden="true" />)}
        <img
          class={`mon-art evo__mon ${phase === 'morph' ? 'is-silhouette' : ''} ${showNew ? 'is-new' : ''}`}
          src={monArtUrl(showNew ? { species: to, shiny: mon.shiny } : mon)}
          alt=""
        />
        {phase === 'done' && BURST.map(([a, r], i) => (
          <span key={i} class="evo__spark" style={{ '--a': `${a}deg`, '--r': `${r}px`, animationDelay: `${(i % 4) * 40}ms` }} aria-hidden="true" />
        ))}
      </div>
      {phase === 'morph' && !locked && (
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
