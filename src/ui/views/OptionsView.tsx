import { useState } from 'preact/hooks';
import { L, locale, setLocale, tr, type LText } from '../../i18n';
import { prefs, setPref } from '../../state/prefs';
import { deleteSave, exportSave, hasSave, importSave, loadSave, persist, save } from '../../state/game';
import { sfx } from '../../audio/sfx';
import { stopMusic } from '../../audio/music';
import { checkForUpdate, install, installWay, offlineReady, pwaActive, updateReady } from '../../state/pwa';
import { Frame, Window } from '../paper';
import { useMenuNav } from '../paper/nav';
import './views.css';

interface Row<T> { label: LText; values: { v: T; label: LText }[]; get: () => T; set: (v: T) => void }

const ROWS: Row<unknown>[] = [
  {
    label: L('VITESSE TEXTE', 'TEXT SPEED'),
    values: [{ v: 'slow', label: L('LENTE', 'SLOW') }, { v: 'mid', label: L('MOYENNE', 'MID') }, { v: 'fast', label: L('RAPIDE', 'FAST') }],
    get: () => prefs.value.textSpeed,
    set: (v) => setPref('textSpeed', v as 'slow'),
  },
  {
    label: L('DIFFICULTÉ', 'DIFFICULTY'),
    values: [{ v: 'easy', label: L('FACILE', 'EASY') }, { v: 'normal', label: L('NORMAL', 'NORMAL') }, { v: 'hard', label: L('DIFFICILE', 'HARD') }],
    get: () => prefs.value.difficulty,
    set: (v) => setPref('difficulty', v as 'normal'),
  },
  {
    label: L('COMBATS', 'BATTLE SPEED'),
    values: [{ v: 1, label: L('NORMAL', 'NORMAL') }, { v: 0.55, label: L('RAPIDE', 'FAST') }, { v: 0.3, label: L('ÉCLAIR', 'TURBO') }],
    get: () => prefs.value.battleAnim,
    set: (v) => setPref('battleAnim', v as number),
  },
  {
    label: L('SONS', 'SOUND'),
    values: [{ v: true, label: L('OUI', 'ON') }, { v: false, label: L('NON', 'OFF') }],
    get: () => prefs.value.sound,
    set: (v) => { setPref('sound', v as boolean); if (v) sfx.confirm(); else stopMusic(); },
  },
  {
    label: L('MUSIQUE', 'MUSIC'),
    values: [{ v: true, label: L('OUI', 'ON') }, { v: false, label: L('NON', 'OFF') }],
    get: () => prefs.value.music,
    set: (v) => { setPref('music', v as boolean); if (!v) stopMusic(); },
  },
  {
    label: L('BESTIOLE QUI SUIT', 'FOLLOWING CRITTER'),
    values: [{ v: true, label: L('OUI', 'ON') }, { v: false, label: L('NON', 'OFF') }],
    get: () => prefs.value.follower,
    set: (v) => setPref('follower', v as boolean),
  },
  {
    label: L('SAUVEGARDE AUTO', 'AUTO-SAVE'),
    values: [{ v: false, label: L('NON', 'OFF') }, { v: true, label: L('OUI', 'ON') }],
    get: () => prefs.value.autosave,
    // turning it on saves right away
    set: (v) => { setPref('autosave', v as boolean); if (v) persist(); },
  },
  {
    label: L('LANGUE', 'LANGUAGE'),
    values: [{ v: 'fr', label: L('FRANÇAIS', 'FRANÇAIS') }, { v: 'en', label: L('ENGLISH', 'ENGLISH') }],
    get: () => locale.value,
    set: (v) => setLocale(v as 'fr'),
  },
];

/** FRLG options: one row per setting, ◀ value ▶. Save tools below. */
export function OptionsView({ inGame, onClose, onTitle }: { inGame: boolean; onClose: () => void; onTitle?: () => void }) {
  const [, force] = useState(0);
  const [msg, setMsg] = useState('');
  const [confirmDel, setConfirmDel] = useState(false);
  const [checking, setChecking] = useState(false);
  const cycle = (r: Row<unknown>, d: 1 | -1) => {
    const i = r.values.findIndex((x) => x.v === r.get());
    r.set(r.values[(i + d + r.values.length) % r.values.length].v);
    force((n) => n + 1);
  };
  const [cur, setCur] = useMenuNav(ROWS.length, {
    onSelect: (i) => cycle(ROWS[i], 1),
    onCancel: onClose,
    onSide: (d, i) => cycle(ROWS[i], d),
  });
  const onImport = async (e: Event) => {
    const f = (e.target as HTMLInputElement).files?.[0];
    if (!f) return;
    const ok = await importSave(f);
    setMsg(ok ? tr(L('Sauvegarde importée !', 'Save imported!')) : tr(L('Fichier invalide.', 'Invalid file.')));
  };
  return (
    <Frame title={tr(L('Options', 'Options'))} onBack={onClose}>
      <Window class="opts" >
        <div>
          {ROWS.map((r, i) => {
            const val = r.values.find((x) => x.v === r.get()) ?? r.values[0];
            return (
              <div class={`opt has-cursor ${i === cur ? 'is-on' : ''}`} onClick={() => setCur(i)}>
                <span class="opt__label">{tr(r.label)}</span>
                <span class="opt__ctl">
                  <button class="opt__arrow" onClick={() => cycle(r, -1)} aria-label="◀">◀</button>
                  <span class="opt__val">{tr(val.label)}</span>
                  <button class="opt__arrow" onClick={() => cycle(r, 1)} aria-label="▶">▶</button>
                </span>
              </div>
            );
          })}
        </div>
      </Window>
      <Window seyes class="opts__save">
        <p>{tr(L('La partie est enregistrée dans ce navigateur. Exporte-la de temps en temps pour ne rien perdre.', 'Your game is stored in this browser. Export it now and then so nothing gets lost.'))}</p>
        <div class="opts__row">
          <button class="pbtn" disabled={!save.value && !hasSave()} onClick={() => { if (!save.value) loadSave(); exportSave(); }}>{tr(L('Exporter', 'Export'))}</button>
          <label class="pbtn">
            {tr(L('Importer', 'Import'))}
            <input type="file" accept="application/json,.json" hidden onChange={onImport} />
          </label>
          {!inGame && (
            <button class="pbtn" disabled={!hasSave()} onClick={() => {
              if (!confirmDel) return setConfirmDel(true);
              deleteSave();
              setConfirmDel(false);
              setMsg(tr(L('Partie effacée.', 'Save deleted.')));
            }}>
              {confirmDel ? tr(L('Vraiment effacer ?', 'Really delete?')) : tr(L('Effacer', 'Delete'))}
            </button>
          )}
          {inGame && onTitle && (
            <button class="pbtn" onClick={onTitle}>
              {prefs.value.autosave ? tr(L('Écran titre', 'Title screen')) : tr(L('Quitter sans sauver', 'Quit without saving'))}
            </button>
          )}
        </div>
        {msg && <p class="opts__msg">{msg}</p>}
      </Window>
      <Window class="opts__app">
        <p>
          {tr(L('Version', 'Version'))} {__APP_BUILD__}
          {' · '}
          {offlineReady.value
            ? tr(L('Jouable hors ligne ✓', 'Playable offline ✓'))
            : pwaActive.value ? tr(L('Téléchargement pour jouer hors ligne…', 'Downloading to play offline…')) : tr(L('Hors ligne : pas encore prêt', 'Offline: not ready yet'))}
        </p>
        {updateReady.value && <p class="opts__msg">{tr(L('Nouvelle version prête : elle démarrera à la prochaine ouverture du jeu.', 'New version ready: it starts the next time you open the game.'))}</p>}
        {installWay.value === 'ios' && (
          <p>{tr(L('Pour installer le jeu : bouton Partager, puis « Sur l’écran d’accueil ».', 'To install the game: the Share button, then “Add to Home Screen”.'))}</p>
        )}
        <div class="opts__row">
          {pwaActive.value && !updateReady.value && (
            <button class="pbtn" disabled={checking} onClick={async () => {
              setChecking(true);
              await checkForUpdate();
              setChecking(false);
              setMsg(!navigator.onLine
                ? tr(L('Pas de connexion : réessaie plus tard.', 'No connection: try again later.'))
                : updateReady.value ? '' : tr(L('Le jeu est à jour (ou la nouvelle version se télécharge).', 'The game is up to date (or the new version is downloading).')));
            }}>
              {tr(L('Chercher une mise à jour', 'Check for updates'))}
            </button>
          )}
          {installWay.value === 'prompt' && (
            <button class="pbtn" onClick={() => void install()}>{tr(L('Installer le jeu', 'Install the game'))}</button>
          )}
        </div>
      </Window>
    </Frame>
  );
}
