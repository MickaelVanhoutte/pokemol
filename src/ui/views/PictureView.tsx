import { useEffect, useState } from 'preact/hooks';
import { Window } from '../paper';
import { useMenuNav } from '../paper/nav';
import '../screens.css';

/** A picture shown first: it stays `hold` ms, then fades into the next one over `fade` ms. */
interface Step { src: string; hold: number; fade: number }

/**
 * A picture shown big, in a frame, with its caption (the museum's drawings). A or B closes it. `before`: pictures
 * fading one into the next before it (the Great Eraser's face coming back); a tap shows the end at once.
 */
export function PictureView({ src, caption, before = [], onClose }: { src: string; caption: string; before?: Step[]; onClose: () => void }) {
  // the fades start once the first picture is on screen
  const [go, setGo] = useState(false);
  const [done, setDone] = useState(before.length === 0);
  const starts: number[] = [];
  let total = 0;
  for (const b of before) {
    starts.push(total + b.hold);
    total += b.hold + b.fade;
  }
  useEffect(() => {
    if (done) return;
    let f = requestAnimationFrame(() => (f = requestAnimationFrame(() => setGo(true))));
    const t = setTimeout(() => setDone(true), total);
    return () => {
      cancelAnimationFrame(f);
      clearTimeout(t);
    };
  }, []);
  const next = () => (done ? onClose() : setDone(true));
  useMenuNav(1, { onSelect: next, onCancel: next });
  return (
    <div class="picture" onClick={next}>
      <Window class="picture__frame">
        <div class="picture__stack">
          <img class="picture__img" src={src} alt={caption} />
          {!done && before.map((b, i) => (
            <img key={b.src} class={`picture__img picture__layer${go ? ' is-gone' : ''}`} src={b.src} alt=""
              style={{ zIndex: before.length - i, transitionDuration: `${b.fade}ms`, transitionDelay: `${starts[i]}ms` }} />
          )).reverse()}
        </div>
        <p class={`picture__caption${done ? '' : ' is-waiting'}`}>{caption}</p>
      </Window>
      <button class={`pbtn pbtn--accent picture__ok${done ? '' : ' is-waiting'}`} onClick={(e) => { e.stopPropagation(); next(); }}>OK ▶</button>
    </div>
  );
}
