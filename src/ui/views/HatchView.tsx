import { useEffect, useState } from 'preact/hooks';
import { L, tr } from '../../i18n';
import { creature } from '../../data/creatures';
import type { Mon } from '../../engine/pk/creature';
import { monArtUrl } from '../monArt';
import { sfx } from '../../audio/sfx';
import { TextBox } from '../paper';
import './views.css';

type Phase = 'intro' | 'wobble' | 'done';

/** An egg hatching: it wobbles harder and harder, a white flash, and the drawing appears. */
export function HatchView({ mon, onEnd }: { mon: Mon; onEnd: () => void }) {
  const [phase, setPhase] = useState<Phase>('intro');
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (phase !== 'wobble') return;
    let alive = true;
    (async () => {
      await new Promise((r) => setTimeout(r, 1900));
      if (!alive) return;
      setFlash(true);
      sfx.sparkle();
      await new Promise((r) => setTimeout(r, 450));
      if (!alive) return;
      setFlash(false);
      setPhase('done');
    })();
    return () => { alive = false; };
  }, [phase]);

  const text = phase === 'intro' ? tr(L('Oh ? L’œuf bouge !', 'Oh? The egg is moving!'))
    : phase === 'wobble' ? '…'
    : tr(L('{n} est sorti de l’œuf !', '{n} hatched from the egg!'), { n: tr(creature(mon.species).name) });

  return (
    <div class={`evo ${flash ? 'is-flash' : ''}`}>
      <div class="evo__stage">
        <img
          class={`mon-art evo__mon ${phase === 'done' ? '' : 'hatch__egg'} ${phase === 'wobble' ? 'is-wobbling' : ''}`}
          src={monArtUrl(phase === 'done' ? { species: mon.species, shiny: mon.shiny } : { species: mon.species, egg: true })}
          alt=""
        />
      </div>
      <TextBox
        class="evo__text"
        text={text}
        keys={phase !== 'wobble'}
        arrow={phase !== 'wobble'}
        onAdvance={phase === 'intro' ? () => setPhase('wobble') : phase === 'done' ? onEnd : undefined}
      />
    </div>
  );
}
