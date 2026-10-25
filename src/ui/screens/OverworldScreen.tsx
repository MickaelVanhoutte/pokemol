import { useEffect, useRef, useState } from 'preact/hooks';
import { L, tr } from '../../i18n';
import { creature } from '../../data/creatures';
import type { Dir } from '../../save/schema';
import { cardOverlay, getGame, menuOpen, openScreen, toast } from '../../overworld/controller';
import { dialog } from '../../overworld/dialog';
import { exportSave, persist, save } from '../../state/game';
import { go } from '../../state/router';
import { Card } from '../Card';
import { DialogBox } from '../DialogBox';
import './overworld.css';

const KEY_DIR: Record<string, Dir> = {
  ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
  w: 'up', s: 'down', a: 'left', d: 'right', W: 'up', S: 'down', A: 'left', D: 'right',
};

function key(k: string, down: boolean) {
  window.dispatchEvent(new KeyboardEvent(down ? 'keydown' : 'keyup', { key: k, bubbles: true }));
}

export function OverworldScreen() {
  const host = useRef<HTMLDivElement>(null);
  const [mapName, setMapName] = useState<string | null>(null);

  useEffect(() => {
    const g = getGame();
    const el = host.current!;
    el.appendChild(g.canvas);
    const ro = new ResizeObserver(() => g.resize(el.clientWidth, el.clientHeight));
    ro.observe(el);
    g.start();
    g.input.clear();
    const down = (e: KeyboardEvent) => {
      if (menuOpen.value || cardOverlay.value) return;
      const d = KEY_DIR[e.key];
      if (d) { e.preventDefault(); g.input.press(d); return; }
      if (e.key === 'z' || e.key === 'Z' || e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (!e.repeat) g.input.pressA(); }
      if (e.key === 'x' || e.key === 'X' || e.key === 'Shift') g.input.run = true;
      if (e.key === 'Escape' || e.key === 'm' || e.key === 'M') g.input.pressMenu();
    };
    const up = (e: KeyboardEvent) => {
      const d = KEY_DIR[e.key];
      if (d) g.input.release(d);
      if (e.key === 'x' || e.key === 'X' || e.key === 'Shift') g.input.run = false;
    };
    const blur = () => g.input.clear();
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    window.addEventListener('blur', blur);
    return () => {
      g.stop();
      ro.disconnect();
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      window.removeEventListener('blur', blur);
      g.canvas.remove();
    };
  }, []);

  // show the place name when the map changes
  const currentMap = save.value?.player.map;
  useEffect(() => {
    const g = getGame();
    if (!g.map) return;
    setMapName(tr(g.map.def.name));
    const id = setTimeout(() => setMapName(null), 1800);
    return () => clearTimeout(id);
  }, [currentMap]);

  return (
    <div class="ow">
      <div class="ow__stage">
        <div class="ow__view" ref={host} />
        {mapName && <div class="ow__mapname pixel">{mapName}</div>}
        <button class="ow__menu-btn pixel" onClick={() => (menuOpen.value = true)} aria-label="Menu">☰</button>
        {toast.value && <div class="ow__toast pixel">{toast.value}</div>}
        <DialogBox />
      </div>
      {cardOverlay.value && <CardPick />}
      {menuOpen.value && <StartMenu />}
      <TouchControls />
    </div>
  );
}

function CardPick() {
  const o = cardOverlay.value!;
  const n = o.ids.length;
  const w = Math.min(260, Math.floor((window.innerWidth - 32 - (n - 1) * 12) / n), Math.floor((window.innerHeight - 140) * 0.7));
  const pick = (i: number) => {
    cardOverlay.value = null;
    o.resolve(i);
  };
  return (
    <div class="overlay ow__cards">
      {o.title && <h2 class="pixel">{o.title}</h2>}
      <div class="ow__cards-row">
        {o.ids.map((id, i) => <Card def={creature(id)} width={w} onClick={() => pick(i)} class="card--reveal" />)}
      </div>
      {n === 1 && <button class="btn btn--primary" onClick={() => pick(0)}>OK</button>}
    </div>
  );
}

function StartMenu() {
  const d = save.value!;
  const close = () => (menuOpen.value = false);
  const [bag, setBag] = useState(false);
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'x' || e.key === 'X' || e.key === 'm') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  return (
    <div class="overlay" onClick={close}>
      <div class="menu pixel" onClick={(e) => e.stopPropagation()}>
        <div class="menu__head">
          <b>{d.player.name}</b>
          <span>🪙 {d.coins}</span>
          <span>✨ {d.glitter}</span>
          <span>🃏 {d.items.blank}</span>
        </div>
        {bag ? (
          <div class="menu__bag">
            <p>🃏 {tr(L('Cartes vierges', 'Blank Cards'))} × {d.items.blank}</p>
            <p>🪙 {tr(L('Pièces', 'Coins'))} : {d.coins}</p>
            <p>✨ {tr(L('Paillettes', 'Glitter'))} : {d.glitter}</p>
            <p>🏅 {tr(L('Badges', 'Badges'))} : {d.badges.length ? d.badges.join(', ') : '—'}</p>
            <p>📖 {tr(L('Bestioles vues / attrapées', 'Critters seen / caught'))} : {d.seen.length} / {Object.keys(d.collection).length}</p>
            <button class="btn btn--small" onClick={() => setBag(false)}>{tr(L('Retour', 'Back'))}</button>
          </div>
        ) : (
          <div class="menu__list">
            <button class="btn" disabled={!d.team.length} onClick={() => { close(); void openScreen({ id: 'collection', back: { id: 'overworld' } }); }}>
              🃏 {tr(L('Bestioles & deck', 'Critters & deck'))}
            </button>
            <button class="btn" onClick={() => setBag(true)}>🎒 {tr(L('Sac', 'Bag'))}</button>
            <button class="btn" onClick={() => { persist(); setSaved(true); }}>💾 {saved ? tr(L('Sauvegardé !', 'Saved!')) : tr(L('Sauvegarder', 'Save'))}</button>
            <button class="btn" onClick={() => exportSave()}>⬇️ {tr(L('Exporter la sauvegarde', 'Export save'))}</button>
            <button class="btn" onClick={() => { close(); go({ id: 'settings', back: { id: 'overworld' } }); }}>⚙️ {tr(L('Options', 'Options'))}</button>
            <button class="btn btn--ghost" onClick={() => { persist(); close(); go({ id: 'title' }); }}>🏠 {tr(L('Écran titre', 'Title screen'))}</button>
            <button class="btn btn--primary" onClick={close}>{tr(L('Fermer', 'Close'))}</button>
          </div>
        )}
      </div>
    </div>
  );
}

function TouchControls() {
  const hold = (k: string) => ({
    onPointerDown: (e: PointerEvent) => { e.preventDefault(); (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); key(k, true); },
    onPointerUp: () => key(k, false),
    onPointerCancel: () => key(k, false),
    onPointerLeave: () => key(k, false),
  });
  const inDialog = !!dialog.value;
  return (
    <div class="touch">
      <div class="dpad">
        <button class="dpad__up" {...hold('ArrowUp')}>▲</button>
        <button class="dpad__left" {...hold('ArrowLeft')}>◀</button>
        <button class="dpad__right" {...hold('ArrowRight')}>▶</button>
        <button class="dpad__down" {...hold('ArrowDown')}>▼</button>
      </div>
      <div class="ab">
        <button class="ab__b" {...hold('x')}>B</button>
        <button class="ab__a" onPointerDown={(e) => { e.preventDefault(); key(inDialog ? 'Enter' : 'z', true); }}>A</button>
      </div>
    </div>
  );
}
