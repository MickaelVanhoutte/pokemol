import { useState } from 'preact/hooks';
import { L, locale, setLocale, t, tr } from '../../i18n';
import { deleteSave, exportSave, hasSave, importSave, loadSave, save } from '../../state/game';
import { go, type Screen } from '../../state/router';
import { battleSpeed } from '../battle/BattleScreen';

export function SettingsScreen({ back }: { back: Screen }) {
  const [msg, setMsg] = useState('');
  const [confirmDel, setConfirmDel] = useState(false);
  const [speed, setSpeed] = useState(battleSpeed());
  const setSpeedPref = (v: number) => {
    try {
      localStorage.setItem('atelier-bestioles.speed', String(v));
    } catch {
      // storage unavailable
    }
    setSpeed(v);
  };
  const onImport = async (e: Event) => {
    const f = (e.target as HTMLInputElement).files?.[0];
    if (!f) return;
    const ok = await importSave(f);
    setMsg(ok ? tr(L('Sauvegarde importée !', 'Save imported!')) : tr(L('Fichier invalide.', 'Invalid file.')));
  };
  return (
    <div class="screen">
      <div class="screen__bar">
        <button class="btn btn--small" onClick={() => go(back)}>← {t('menu.back')}</button>
        <h1>{t('menu.settings')}</h1>
      </div>
      <section class="settings">
        <h2 class="pixel">{t('menu.language')}</h2>
        <div class="tabs">
          <button class="btn" aria-pressed={locale.value === 'fr'} onClick={() => setLocale('fr')}>Français</button>
          <button class="btn" aria-pressed={locale.value === 'en'} onClick={() => setLocale('en')}>English</button>
        </div>
        <h2 class="pixel">{tr(L('Vitesse des combats', 'Battle speed'))}</h2>
        <div class="tabs">
          {([[1, L('Normale', 'Normal')], [0.55, L('Rapide', 'Fast')], [0.3, L('Très rapide', 'Very fast')]] as const).map(([v, label]) => (
            <button class="btn" aria-pressed={speed === v} onClick={() => setSpeedPref(v)}>{tr(label)}</button>
          ))}
        </div>
        <h2 class="pixel">{tr(L('Sauvegarde', 'Save data'))}</h2>
        <p class="settings__hint">
          {tr(L(
            'La partie est enregistrée dans ce navigateur. Exporte-la de temps en temps pour ne rien perdre, ou pour la copier sur une autre tablette.',
            'Your game is stored in this browser. Export it now and then so nothing gets lost, or to copy it to another tablet.',
          ))}
        </p>
        <div class="settings__row">
          <button class="btn" disabled={!save.value && !hasSave()} onClick={() => { if (!save.value) loadSave(); exportSave(); }}>⬇️ {tr(L('Exporter', 'Export'))}</button>
          <label class="btn">
            ⬆️ {tr(L('Importer', 'Import'))}
            <input type="file" accept="application/json,.json" hidden onChange={onImport} />
          </label>
          <button class="btn btn--ghost" disabled={!hasSave()} onClick={() => {
            if (!confirmDel) return setConfirmDel(true);
            deleteSave();
            setConfirmDel(false);
            setMsg(tr(L('Partie effacée.', 'Save deleted.')));
          }}>
            🗑️ {confirmDel ? tr(L('Vraiment effacer ?', 'Really delete?')) : tr(L('Effacer la partie', 'Delete save'))}
          </button>
        </div>
        {msg && <p class="settings__msg">{msg}</p>}
      </section>
    </div>
  );
}
