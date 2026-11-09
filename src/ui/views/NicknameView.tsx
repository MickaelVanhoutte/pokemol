import { useState } from 'preact/hooks';
import { L, tr } from '../../i18n';
import { creature } from '../../data/creatures';
import type { Mon } from '../../engine/pk/creature';
import { ActionBar, TextBox, Window } from '../paper';
import { monArtUrl } from '../monArt';
import './views.css';

export const NICKNAME_MAX = 10;

/**
 * Nickname entry, like the prologue's name entry: type up to 10 letters, or keep the species'
 * name. `onDone(null)` means no nickname (it also removes an older one).
 */
export function NicknameView({ mon, onDone }: { mon: Mon; onDone: (name: string | null) => void }) {
  const [value, setValue] = useState(mon.nickname ?? '');
  const species = tr(creature(mon.species).name);
  const ok = () => onDone(value.trim() || null);
  return (
    <div class="view-modal nickname">
      <div class="nickname__box">
        <img class="mon-art nickname__art" src={monArtUrl(mon)} alt="" />
        <TextBox text={tr(L('Quel surnom pour {n} ?', 'What nickname for {n}?'), { n: species })} arrow={false} instant />
        <Window class="prologue__input">
          <input
            class="newgame__input"
            maxLength={NICKNAME_MAX}
            value={value}
            placeholder={species}
            autoFocus
            onInput={(e) => setValue((e.target as HTMLInputElement).value)}
            onKeyDown={(e) => {
              // typing must not walk the player around or answer menus
              e.stopPropagation();
              if (e.key === 'Enter') ok();
              if (e.key === 'Escape') onDone(null);
            }}
          />
        </Window>
        {/* no nickname is the B button (left), OK the A button (right) */}
        <ActionBar
          onBack={() => onDone(null)}
          backLabel={tr(L('Sans surnom', 'No nickname'))}
          action={<button class="pbtn pbtn--accent" onClick={ok}>OK ▶</button>}
        />
      </div>
    </div>
  );
}
