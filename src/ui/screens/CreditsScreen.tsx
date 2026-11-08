import { useEffect, useRef, useState } from 'preact/hooks';
import { L, tr } from '../../i18n';
import { playMusic } from '../../audio/music';
import { originalUrl, originals } from '../../data/originals';
import { go } from '../../state/router';
import { backToWorld } from '../../overworld/controller';
import { save } from '../../state/game';
import { creditsY, CREDITS_FAST } from './creditsRoll';
import '../screens.css';

/**
 * The credits roll up the page over the ending's tune: the title, the little artist, her drawings one by one, the
 * rest. Holding B (or a finger on the screen) runs it three times faster; at the end « Fin », and a press goes back.
 */
export function CreditsScreen({ fromWorld }: { fromWorld?: boolean }) {
  const ended = !!save.value?.flags.ending;
  const view = useRef<HTMLDivElement>(null);
  const strip = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);
  const back = () => (fromWorld ? backToWorld() : go({ id: 'title' }));
  useEffect(() => playMusic('ending'), []);

  useEffect(() => {
    const v = view.current!, s = strip.current!;
    let raf = 0, last = performance.now(), run = 0, fast = false, over = false;
    const frame = (now: number) => {
      run += Math.min(64, now - last) * (fast ? CREDITS_FAST : 1);
      last = now;
      const { y, end } = creditsY(run, v.clientHeight, s.offsetHeight);
      s.style.transform = `translateY(${y}px)`;
      if (end && !over) {
        over = true;
        setDone(true);
      }
      if (!end) raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    const hurry = (e: KeyboardEvent, on: boolean) => {
      if (e.key === 'x' || e.key === 'X' || e.key === 'Shift') fast = on;
    };
    const down = (e: KeyboardEvent) => hurry(e, true);
    const up = (e: KeyboardEvent) => hurry(e, false);
    const press = () => (fast = true), release = () => (fast = false);
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    v.addEventListener('pointerdown', press);
    window.addEventListener('pointerup', release);
    window.addEventListener('pointercancel', release);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      v.removeEventListener('pointerdown', press);
      window.removeEventListener('pointerup', release);
      window.removeEventListener('pointercancel', release);
    };
  }, []);

  // at « Fin », A (or B) goes back
  useEffect(() => {
    if (!done) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (['z', 'Z', 'Enter', ' ', 'x', 'X', 'Escape'].includes(e.key)) {
        e.preventDefault();
        back();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [done]);

  return (
    <div class="credits-roll">
      <div class="credits-roll__view" ref={view} aria-live="off">
        <div class="credits-roll__strip" ref={strip} style={{ transform: 'translateY(100vh)' }}>
          <h1 class="credits-roll__title">Atelier Bestioles</h1>
          <p class="credits-roll__subtitle">{tr(L('le Rêve de Papeterre', 'the Dream of Papeterra'))}</p>
          <p>{tr(L('Les Bestioles sont nées des dessins de', 'The Critters were born from the drawings of'))}</p>
          <p class="credits__artist">{tr(L('la petite artiste', 'the little artist'))}</p>
          <p>{tr(L('Ses dessins originaux, gardés précieusement (ils sont aussi au musée de Ville-Pastel) :', 'Her original drawings, carefully kept (they also hang in the Pastel City museum):'))}</p>
          <div class="credits-roll__parade">
            {originals().map((c, i) => (
              <figure class={`credits-roll__drawing ${i % 2 ? 'is-right' : 'is-left'}`} key={c.id}>
                <img class="mon-art" src={originalUrl(c)} alt="" />
                <figcaption>{tr(c.name)}</figcaption>
              </figure>
            ))}
          </div>
          <p>{tr(L('Jeu, décors et pixels faits maison.', 'Game, scenery and pixels made at home.'))}</p>
          <p>{tr(L('Musique originale, jouée sur une boîte à musique.', 'Original music, played on a music box.'))}</p>
          <p>{tr(L('Polices : Patrick Hand et Inter (SIL Open Font License).', 'Fonts: Patrick Hand and Inter (SIL Open Font License).'))}</p>
          <p class="credits__small">{tr(L('Un jeu de fans, inspiré des jeux de monstres de poche sur Game Boy Advance. Aucun lien avec une marque existante.', 'A fan game inspired by the Game Boy Advance pocket-monster games. Not affiliated with any existing brand.'))}</p>
          {ended && <p class="credits__end">{tr(L('Fin… ou presque. Les Bestioles t’attendent à Papeterre !', 'The end… almost. The Critters are waiting for you in Papeterra!'))}</p>}
        </div>
      </div>
      {done && (
        <div class="credits-roll__fin" onClick={back}>
          <p class="credits-roll__fin-word">{tr(L('Fin', 'The End'))}</p>
          <p>{tr(L('Merci d’avoir joué !', 'Thanks for playing!'))}</p>
          <button class="pbtn pbtn--accent" onClick={(e) => { e.stopPropagation(); back(); }}>OK ▶</button>
        </div>
      )}
      {!done && <button class="pbtn credits-roll__skip" onClick={back}>{tr(fromWorld ? L('Passer', 'Skip') : L('Retour', 'Back'))}</button>}
      {!done && <p class="credits-roll__hint">{tr(L('Maintiens B pour accélérer', 'Hold B to speed up'))}</p>}
    </div>
  );
}

