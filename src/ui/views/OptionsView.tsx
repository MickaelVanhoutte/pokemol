import { useState } from 'preact/hooks';
import { L, locale, setLocale, tr, type LText } from '../../i18n';
import { prefs, setPref, type Difficulty } from '../../state/prefs';
import { deleteSave, exportSave, importSave, peekSlot, persist, save, slot, SLOTS, update } from '../../state/game';
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
    // the game being played keeps it (each game has its own)
    set: (v) => {
      setPref('difficulty', v as Difficulty);
      if (save.value) update((d) => (d.difficulty = v as Difficulty));
    },
  },
  {
    label: L('COMBATS', 'BATTLE SPEED'),
    values: [{ v: 1, label: L('NORMAL', 'NORMAL') }, { v: 0.55, label: L('RAPIDE', 'FAST') }, { v: 0.3, label: L('ÉCLAIR', 'TURBO') }],
    get: () => prefs.value.battleAnim,
    set: (v) => setPref('battleAnim', v as number),
  },
  {
    label: L('ANIMATIONS', 'ANIMATIONS'),
    values: [{ v: true, label: L('OUI', 'ON') }, { v: false, label: L('NON', 'OFF') }],
    get: () => prefs.value.moveFx,
    set: (v) => setPref('moveFx', v as boolean),
  },
  {
    // DOUX: simple fades, no camera moves or shakes (for players who feel unwell with motion)
    label: L('MOUVEMENTS', 'MOTION'),
    values: [{ v: 'full', label: L('NORMAUX', 'FULL') }, { v: 'calm', label: L('DOUX', 'GENTLE') }],
    get: () => prefs.value.motion,
    set: (v) => setPref('motion', v as 'full'),
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
  const [confirmQuit, setConfirmQuit] = useState(false);
  // a file picked to replace a game already in this slot: imported only once the player says so
  const [pending, setPending] = useState<File | null>(null);
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
  const doImport = async (f: File) => {
    setPending(null);
    const ok = await importSave(f, slot.value);
    setMsg(ok ? tr(L('Sauvegarde importée !', 'Save imported!')) : tr(L('Fichier invalide.', 'Invalid file.')));
  };
  const onImport = (e: Event) => {
    const input = e.target as HTMLInputElement;
    const f = input.files?.[0];
    // the same file can be picked again later
    input.value = '';
    if (!f) return;
    setMsg('');
    if (peekSlot(slot.value)) setPending(f);
    else void doImport(f);
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
                  <button class="opt__arrow" onClick={() => cycle(r, -1)} aria-label={tr(L('Précédent', 'Previous'))}>◀</button>
                  {/* a tap on the value changes it too: the arrows alone are small targets */}
                  <span class="opt__val" onClick={() => cycle(r, 1)}>{tr(val.label)}</span>
                  <button class="opt__arrow" onClick={() => cycle(r, 1)} aria-label={tr(L('Suivant', 'Next'))}>▶</button>
                </span>
              </div>
            );
          })}
        </div>
      </Window>
      <Window seyes class="opts__save">
        <p>{tr(L('Les parties sont enregistrées dans ce navigateur. Exporte-les de temps en temps pour ne rien perdre.', 'Your games are stored in this browser. Export them now and then so nothing gets lost.'))}</p>
        {/* from the title screen, the tools work on the game picked here; in a game, on that game */}
        <div class="opts__row">
          {!inGame && (
            <button class="opt__arrow" onClick={() => { slot.value = (slot.value + SLOTS - 2) % SLOTS + 1; setConfirmDel(false); setPending(null); setMsg(''); }} aria-label={tr(L('Précédent', 'Previous'))}>◀</button>
          )}
          <span class="opts__slot">{tr(L('Partie {n}', 'Game {n}'), { n: slot.value })} · {(inGame ? save.value : peekSlot(slot.value))?.player.name ?? tr(L('vide', 'empty'))}</span>
          {!inGame && (
            <button class="opt__arrow" onClick={() => { slot.value = (slot.value % SLOTS) + 1; setConfirmDel(false); setPending(null); setMsg(''); }} aria-label={tr(L('Suivant', 'Next'))}>▶</button>
          )}
        </div>
        <div class="opts__row">
          <button class="pbtn" disabled={!(inGame ? save.value : peekSlot(slot.value))} onClick={() => exportSave(inGame ? save.value : peekSlot(slot.value))}>{tr(L('Exporter', 'Export'))}</button>
          {/* importing replaces a whole game: from the title screen only, where none is being played */}
          {!inGame && (
            <label class="pbtn">
              {tr(L('Importer', 'Import'))}
              <input type="file" accept="application/json,.json" hidden onChange={onImport} />
            </label>
          )}
          {!inGame && (
            <button class="pbtn" disabled={!peekSlot(slot.value)} onClick={() => {
              if (!confirmDel) return setConfirmDel(true);
              deleteSave(slot.value);
              setConfirmDel(false);
              setMsg(tr(L('Partie effacée.', 'Save deleted.')));
            }}>
              {confirmDel ? tr(L('Vraiment effacer ?', 'Really delete?')) : tr(L('Effacer', 'Delete'))}
            </button>
          )}
          {inGame && onTitle && (
            <button class="pbtn" onClick={() => {
              // without auto-save, everything since the last SAUVER is lost: ask first
              if (!prefs.value.autosave && !confirmQuit) return setConfirmQuit(true);
              onTitle();
            }}>
              {prefs.value.autosave ? tr(L('Écran titre', 'Title screen'))
                : confirmQuit ? tr(L('Quitter quand même ?', 'Quit anyway?'))
                : tr(L('Quitter sans sauver', 'Quit without saving'))}
            </button>
          )}
        </div>
        {pending && (
          <div class="opts__row">
            <p class="opts__ask">{tr(L('La partie {n} ({p}) sera remplacée. Continuer ?', 'Game {n} ({p}) will be replaced. Continue?'), { n: slot.value, p: peekSlot(slot.value)?.player.name ?? '' })}</p>
            <button class="pbtn" onClick={() => void doImport(pending)}>{tr(L('Oui', 'Yes'))}</button>
            <button class="pbtn" onClick={() => setPending(null)}>{tr(L('Non', 'No'))}</button>
          </div>
        )}
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
