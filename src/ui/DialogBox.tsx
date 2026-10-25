import { useEffect, useState } from 'preact/hooks';
import { closeDialog, dialog } from '../overworld/dialog';
import './dialog.css';

/** GBA-style text box with a typewriter effect; A / Enter / Space / tap advances. */
export function DialogBox() {
  const d = dialog.value;
  const [shown, setShown] = useState(0);
  const [choice, setChoice] = useState(0);

  useEffect(() => {
    setShown(0);
    setChoice(0);
    if (!d) return;
    let n = 0;
    const id = setInterval(() => {
      n += 2;
      setShown(n);
      if (n >= d.text.length) clearInterval(id);
    }, 22);
    return () => clearInterval(id);
  }, [d]);

  const done = !!d && shown >= d.text.length;

  const advance = () => {
    if (!d) return;
    if (!done) return setShown(d.text.length);
    closeDialog(choice);
  };

  useEffect(() => {
    if (!d) return;
    const onKey = (e: KeyboardEvent) => {
      const k = e.key;
      if (['Enter', ' ', 'z', 'Z', 'x', 'X', 'Escape', 'Backspace'].includes(k)) {
        e.preventDefault();
        e.stopPropagation();
        if (d.choices && done && (k === 'x' || k === 'X' || k === 'Escape' || k === 'Backspace')) {
          closeDialog(d.choices.length - 1);
          return;
        }
        advance();
      } else if (d.choices && (k === 'ArrowUp' || k === 'ArrowDown' || k === 'w' || k === 's')) {
        e.preventDefault();
        e.stopPropagation();
        const dir = k === 'ArrowUp' || k === 'w' ? -1 : 1;
        setChoice((c) => (c + dir + d.choices!.length) % d.choices!.length);
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  });

  if (!d) return null;
  return (
    <div class="dialog-layer">
      {d.choices && done && (
        <div class="dialog-choices pixel">
          {d.choices.map((c, i) => (
            <button class={i === choice ? 'is-on' : ''} onClick={() => closeDialog(i)} onPointerEnter={() => setChoice(i)}>
              {i === choice ? '▶ ' : '  '}{c}
            </button>
          ))}
        </div>
      )}
      <div class="dialog pixel" onClick={() => !d.choices && advance()}>
        {d.speaker && <div class="dialog__speaker">{d.speaker}</div>}
        <p>{d.text.slice(0, shown)}</p>
        {done && !d.choices && <span class="dialog__next">▼</span>}
      </div>
    </div>
  );
}
