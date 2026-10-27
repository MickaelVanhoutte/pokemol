import { Window } from '../paper';
import { useMenuNav } from '../paper/nav';
import '../screens.css';

/** A picture shown big, in a frame, with its caption (the museum's drawings). A or B closes it. */
export function PictureView({ src, caption, onClose }: { src: string; caption: string; onClose: () => void }) {
  useMenuNav(1, { onSelect: onClose, onCancel: onClose });
  return (
    <div class="picture" onClick={onClose}>
      <Window class="picture__frame">
        <img class="picture__img" src={src} alt={caption} />
        <p class="picture__caption">{caption}</p>
      </Window>
      <button class="pbtn pbtn--accent picture__ok" onClick={onClose}>OK ▶</button>
    </div>
  );
}
