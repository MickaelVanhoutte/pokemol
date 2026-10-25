import { useState } from 'preact/hooks';
import { L, t, tr } from '../../i18n';
import { CREATURES, artUrl } from '../../data/creatures';
import { enterWorld } from '../../overworld/controller';
import { hasSave, loadSave } from '../../state/game';
import { go } from '../../state/router';
import './title.css';

export function TitleScreen() {
  const exists = hasSave();
  const [confirmNew, setConfirmNew] = useState(false);
  const cont = () => {
    if (loadSave()) enterWorld();
  };
  const fresh = () => {
    if (exists && !confirmNew) return setConfirmNew(true);
    go({ id: 'newgame' });
  };
  return (
    <div class="screen title">
      <div class="title__float" aria-hidden="true">
        {CREATURES.map((c, i) => (
          <img
            src={artUrl(c)}
            style={{
              left: `${(i * 37 + 5) % 92}%`,
              top: `${(i * 53 + 8) % 80}%`,
              animationDelay: `${-i * 1.7}s`,
              width: `${70 + ((i * 29) % 50)}px`,
            }}
          />
        ))}
      </div>
      <div class="title__panel">
        <h1 class="title__logo pixel">{t('game.title')}</h1>
        <p class="title__sub">{t('game.subtitle')}</p>
        <div class="title__menu">
          {exists && <button class="btn btn--primary" onClick={cont}>{t('menu.continue')}</button>}
          <button class={`btn ${exists ? '' : 'btn--primary'}`} onClick={fresh}>
            {confirmNew ? tr(L('Effacer l’ancienne partie ?', 'Erase the old save?')) : t('menu.newGame')}
          </button>
          <button class="btn" onClick={() => go({ id: 'gallery' })}>{t('menu.gallery')}</button>
          <button class="btn btn--ghost" onClick={() => go({ id: 'settings', back: { id: 'title' } })}>{t('menu.settings')}</button>
          <button class="btn btn--ghost" onClick={() => go({ id: 'credits' })}>{tr(L('Crédits', 'Credits'))}</button>
        </div>
      </div>
    </div>
  );
}
