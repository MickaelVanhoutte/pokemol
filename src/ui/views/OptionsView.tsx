import { useState } from 'preact/hooks';
import { L, locale, setLocale, tr, type LText } from '../../i18n';
import { prefs, setPref } from '../../state/prefs';
import { deleteSave, exportSave, hasSave, importSave, loadSave, save } from '../../state/game';
import { sfx } from '../../audio/sfx';
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
    label: L('COMBATS', 'BATTLE SPEED'),
    values: [{ v: 1, label: L('NORMAL', 'NORMAL') }, { v: 0.55, label: L('RAPIDE', 'FAST') }, { v: 0.3, label: L('ÉCLAIR', 'TURBO') }],
    get: () => prefs.value.battleAnim,
    set: (v) => setPref('battleAnim', v as number),
  },
  {
    label: L('SONS', 'SOUND'),
    values: [{ v: true, label: L('OUI', 'ON') }, { v: false, label: L('NON', 'OFF') }],
    get: () => prefs.value.sound,
    set: (v) => { setPref('sound', v as boolean); if (v) sfx.confirm(); },
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
                <button class="opt__arrow" onClick={() => cycle(r, -1)} aria-label="◀">◀</button>
                <span class="opt__val">{tr(val.label)}</span>
                <button class="opt__arrow" onClick={() => cycle(r, 1)} aria-label="▶">▶</button>
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
          {inGame && onTitle && <button class="pbtn" onClick={onTitle}>{tr(L('Écran titre', 'Title screen'))}</button>}
        </div>
        {msg && <p class="opts__msg">{msg}</p>}
      </Window>
    </Frame>
  );
}
