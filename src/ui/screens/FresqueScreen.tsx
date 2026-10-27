import { useEffect, useMemo, useState } from 'preact/hooks';
import { L, tr } from '../../i18n';
import { artUrl, creature } from '../../data/creatures';
import { backToWorld } from '../../overworld/controller';
import { sfx } from '../../audio/sfx';
import { Frame, Window } from '../paper';
import { gapOf, isSolved, push, shuffle, slide, type Board } from '../logic/fresque';
import './minigames.css';

/** The drawing centred on a square of paper, so it can be cut into equal pieces. */
function useSquareArt(species: string): string {
  const [url, setUrl] = useState('');
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      const S = 360, pad = 22;
      const c = document.createElement('canvas');
      c.width = S;
      c.height = S;
      const g = c.getContext('2d')!;
      g.fillStyle = '#fffaf0';
      g.fillRect(0, 0, S, S);
      g.strokeStyle = 'rgba(91, 138, 214, 0.25)';
      for (let y = 18; y < S; y += 18) {
        g.beginPath();
        g.moveTo(0, y + 0.5);
        g.lineTo(S, y + 0.5);
        g.stroke();
      }
      const k = Math.min((S - pad * 2) / img.naturalWidth, (S - pad * 2) / img.naturalHeight);
      const w = img.naturalWidth * k, h = img.naturalHeight * k;
      g.drawImage(img, (S - w) / 2, (S - h) / 2, w, h);
      setUrl(c.toDataURL('image/png'));
    };
    img.src = artUrl(creature(species));
  }, [species]);
  return url;
}

/** A sliding picture puzzle (« fresque »): put the pieces of a drawing back in place. */
export function FresqueScreen({ species, size, onEnd }: { species: string; size: number; onEnd: (solved: boolean) => void }) {
  const art = useSquareArt(species);
  const fresh = () => shuffle(size, size * size * 5, Math.random);
  const [board, setBoard] = useState<Board>(fresh);
  const [moves, setMoves] = useState(0);
  const done = useMemo(() => isSolved(board), [board]);
  const finish = (solved: boolean) => {
    onEnd(solved);
    backToWorld();
  };
  const play = (next: Board | null) => {
    if (!next || done) return;
    sfx.blip();
    setBoard(next);
    setMoves((m) => m + 1);
    if (isSolved(next)) sfx.victory();
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const dir = ({ ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' } as const)[e.key as 'ArrowUp'];
      if (dir && !done) {
        e.preventDefault();
        play(push(board, dir, size));
      } else if (done && (e.key === 'z' || e.key === 'Z' || e.key === 'Enter')) finish(true);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const gap = gapOf(board);
  const piece = (p: number) => ({
    backgroundImage: art ? `url(${art})` : undefined,
    backgroundSize: `${size * 100}% ${size * 100}%`,
    backgroundPosition: `${((p % size) / (size - 1)) * 100}% ${(Math.floor(p / size) / (size - 1)) * 100}%`,
  });
  return (
    <Frame title={tr(L('Fresque', 'Fresque'))} onBack={() => finish(done)} backLabel={done ? 'OK' : tr(L('Quitter', 'Quit'))} class="fresque">
      <Window seyes class="fresque__note">
        {done
          ? tr(L('Bravo ! C’est {n} ! ({m} coups)', 'Well done! It’s {n}! ({m} moves)'), { n: tr(creature(species).name), m: moves })
          : tr(L('Touche un morceau pour le mettre dans le trou.', 'Tap a piece to put it in the gap.'))}
      </Window>
      <div class="fresque__play">
        <div class={`fresque__board ${done ? 'is-done' : ''}`} style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}>
          {board.map((p, pos) => (pos === gap && !done
            ? <span class="fresque__gap" />
            : <button class="fresque__piece" style={piece(p)} aria-label={`${p + 1}`} onClick={() => play(slide(board, pos, size))} />))}
        </div>
        <div class="fresque__side">
          <div class="fresque__preview" style={{ backgroundImage: art ? `url(${art})` : undefined }} aria-hidden="true" />
          <p class="fresque__moves">{tr(L('Coups : {m}', 'Moves: {m}'), { m: moves })}</p>
          {done
            ? <button class="pbtn pbtn--accent" onClick={() => finish(true)}>OK</button>
            : <button class="pbtn" onClick={() => { setBoard(fresh()); setMoves(0); }}>{tr(L('Mélanger', 'Shuffle'))}</button>}
        </div>
      </div>
    </Frame>
  );
}
