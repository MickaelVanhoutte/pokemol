import { L, tr } from '../../i18n';
import { PAGES } from '../../data/pages';
import { Window } from '../paper';
import { useMenuNav } from '../paper/nav';
import './views.css';

/** A torn sketchbook page: one memory of the real world. */
export function PageView({ n, onClose }: { n: number; onClose: () => void }) {
  useMenuNav(1, { onSelect: onClose, onCancel: onClose });
  return (
    <div class="view-modal page-modal" onClick={onClose}>
      <Window seyes class="torn-page">
        <p class="torn-page__title">{tr(L('Page n°{n}', 'Page #{n}'), { n })}</p>
        <p class="torn-page__text">{tr(PAGES[n - 1])}</p>
      </Window>
    </div>
  );
}
