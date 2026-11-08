import { useEffect } from 'preact/hooks';
import { bindCurtain, curtainUp, paint, vsShown } from './transitions';
import { VsSplash } from './VsSplash';
import './curtain.css';

/** The transitions' canvas and the VS splash, above every screen (mounted once in `App`). */
export function Curtain() {
  const up = curtainUp.value;
  const vs = vsShown.value;
  useEffect(() => {
    // turning the phone round: the covered page is drawn again at its new size
    const again = () => paint(true);
    window.addEventListener('resize', again);
    return () => window.removeEventListener('resize', again);
  }, []);
  return (
    <>
      {up && <canvas class="curtain" ref={bindCurtain} aria-hidden="true" />}
      {vs && <VsSplash key={vs.card.name} card={vs.card} leaving={vs.leaving} onSkip={vs.skip} />}
    </>
  );
}
