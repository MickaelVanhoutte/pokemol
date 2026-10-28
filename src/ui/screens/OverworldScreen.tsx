import { useEffect, useRef, useState } from 'preact/hooks';
import { L, tr } from '../../i18n';
import type { Dir } from '../../save/schema';
import { evoOverlay, getGame, hatchOverlay, learnOverlay, menuOpen, monOverlay, nameOverlay, openScreen, pictureOverlay, showToast, toast, toggleBike } from '../../overworld/controller';
import { PictureView } from '../views/PictureView';
import { NicknameView } from '../views/NicknameView';
import { HatchView } from '../views/HatchView';
import { EvolutionView } from '../views/EvolutionView';
import { SummaryView } from '../views/SummaryView';
import { dialog } from '../../overworld/dialog';
import { persist, save, saveFailed } from '../../state/game';
import { sfx } from '../../audio/sfx';
import { playMusic } from '../../audio/music';
import { trackForMap } from '../../audio/mapMusic';
import { MenuList, TextBox, Window, YesNo } from '../paper';
import { sketchIconUrl } from '../sketchIcons';
import { go } from '../../state/router';
import { MonPick } from '../MonPick';
import { DialogBox } from '../DialogBox';
import './overworld.css';

const DIR_KEY: Record<Dir, string> = { up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight' };

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
  const joystick = useJoystick();

  useEffect(() => {
    const g = getGame();
    const el = host.current!;
    el.appendChild(g.canvas);
    const ro = new ResizeObserver(() => g.resize(el.clientWidth, el.clientHeight));
    ro.observe(el);
    g.start();
    g.input.clear();
    const down = (e: KeyboardEvent) => {
      if (menuOpen.value || monOverlay.value || evoOverlay.value || learnOverlay.value || hatchOverlay.value || nameOverlay.value || pictureOverlay.value) return;
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
    playMusic(trackForMap(g.map.def, save.value?.player.returnTo));
    const id = setTimeout(() => setMapName(null), 1800);
    return () => clearTimeout(id);
  }, [currentMap]);

  return (
    <div class="ow" {...joystick.handlers}>
      <div class="ow__stage">
        <div class="ow__view" ref={host} />
        {mapName && <Window class="ow__mapname">{mapName}</Window>}
        <button class="ow__menu-btn" onClick={() => (menuOpen.value = true)} aria-label="Menu"><img class="sicon" src={sketchIconUrl('bag')!} width={34} height={34} alt="" /></button>
        {toast.value && <Window class="ow__toast">{toast.value}</Window>}
        <DialogBox />
      </div>
      {monOverlay.value && <MonOverlay />}
      {hatchOverlay.value && <HatchView key={hatchOverlay.value.mon.uid} mon={hatchOverlay.value.mon} onEnd={hatchOverlay.value.resolve} />}
      {evoOverlay.value && <EvolutionView key={evoOverlay.value.mon.uid} mon={evoOverlay.value.mon} to={evoOverlay.value.to} onEnd={evoOverlay.value.resolve} />}
      {learnOverlay.value && (
        <SummaryView
          mon={learnOverlay.value.mon}
          learn={{ move: learnOverlay.value.move, onPick: learnOverlay.value.resolve }}
          onClose={() => learnOverlay.value!.resolve(null)}
        />
      )}
      {pictureOverlay.value && <PictureView key={pictureOverlay.value.src} src={pictureOverlay.value.src} caption={pictureOverlay.value.caption} onClose={() => { const o = pictureOverlay.value!; pictureOverlay.value = null; o.resolve(); }} />}
      {nameOverlay.value && <NicknameView key={nameOverlay.value.mon.uid} mon={nameOverlay.value.mon} onDone={nameOverlay.value.resolve} />}
      {menuOpen.value && <StartMenu />}
      <TouchControls />
      {joystick.view}
    </div>
  );
}

function MonOverlay() {
  const o = monOverlay.value!;
  return (
    <MonPick
      ids={o.ids}
      title={o.title}
      pick={o.pick}
      onChoose={(i) => {
        monOverlay.value = null;
        o.resolve(i);
      }}
    />
  );
}

function StartMenu() {
  const d = save.value!;
  const close = () => (menuOpen.value = false);
  const [desc, setDesc] = useState(0);
  const [saving, setSaving] = useState<'ask' | 'done' | null>(null);
  const open = (sc: Parameters<typeof openScreen>[0]) => {
    close();
    void openScreen(sc);
  };
  const items = [
    ...(d.flags.dex ? [{ icon: 'dex', label: tr(L('BESTIODEX', 'CRITTERDEX')), info: L('Les Bestioles que tu as vues et attrapées.', 'Critters you have seen and caught.'), onSelect: () => open({ id: 'dex' }) }] : []),
    ...(d.party.length ? [{ icon: 'party', label: tr(L('BESTIOLES', 'CRITTERS')), info: L('Ton équipe : résumés et ordre de passage.', 'Your party: summaries and order.'), onSelect: () => open({ id: 'party' }) }] : []),
    ...(d.bag.velo ? [{
      icon: 'velo', label: tr(L('VÉLO', 'BIKE')), info: L('Monter sur le Vélo-Crayon ou en descendre.', 'Get on or off the Pencil Bike.'),
      onSelect: () => { close(); const no = toggleBike(); if (no) showToast(tr(no)); },
    }] : []),
    { icon: 'bag', label: tr(L('SAC', 'BAG')), info: L('Tes objets, rangés dans ta trousse.', 'Your items, packed in your pencil case.'), onSelect: () => open({ id: 'bag' }) },
    ...(d.bag.carte ? [{ icon: 'carte', label: tr(L('CARTE', 'MAP')), info: L('Où tu es, et où aller ensuite.', 'Where you are, and where to go next.'), onSelect: () => open({ id: 'townmap' }) }] : []),
    { icon: 'card', label: d.player.name.toUpperCase(), info: L('Ta carte de dresseur et tes badges.', 'Your trainer card and badges.'), onSelect: () => open({ id: 'trainercard' }) },
    { icon: 'save', label: tr(L('SAUVER', 'SAVE')), info: L('Enregistrer ta progression.', 'Save your progress.'), onSelect: () => setSaving('ask') },
    { icon: 'options', label: tr(L('OPTIONS', 'OPTIONS')), info: L('Vitesse du texte, sons, langue, sauvegarde.', 'Text speed, sound, language, save file.'), onSelect: () => { close(); go({ id: 'settings', back: { id: 'overworld' } }); } },
    { icon: 'close', label: tr(L('FERMER', 'EXIT')), info: L('Fermer ce menu.', 'Close this menu.'), onSelect: close },
  ];
  return (
    <div class="startmenu" onClick={close}>
      <div onClick={(e) => e.stopPropagation()}>
        <Window class="startmenu__list">
          <MenuList items={items} active={!saving} onCancel={close} onCursor={setDesc} />
        </Window>
      </div>
      <div class="startmenu__desc" onClick={(e) => e.stopPropagation()}>
        {saving === 'ask' ? (
          <div class="startmenu__save">
            <Window seyes class="startmenu__text">{tr(L('Sauvegarder la partie ?', 'Would you like to save the game?'))}</Window>
            <YesNo onAnswer={(yes) => {
              if (!yes) return setSaving(null);
              persist();
              sfx.confirm();
              setSaving('done');
            }} />
          </div>
        ) : saving === 'done' ? (
          <TextBox text={tr(saveFailed.value
            ? L('La sauvegarde n’a pas marché : la mémoire du téléphone est pleine.', 'The game could not be saved: the phone’s storage is full.')
            : L('{name} a sauvegardé la partie.', '{name} saved the game.'))} keys onAdvance={close} />
        ) : (
          <Window seyes class="startmenu__text">{tr(items[desc]?.info ?? items[0].info)}</Window>
        )}
      </div>
    </div>
  );
}

const JOY_R = 44;

/**
 * Floating joystick: touching anywhere on the map makes it appear under the finger.
 * Drag to walk (hold B with the other thumb to run), a quick tap is the A button (talk, read, next line).
 * While a question waits for an answer, each push moves the choice cursor instead.
 */
function useJoystick() {
  const [joy, setJoy] = useState<{ x: number; y: number; kx: number; ky: number } | null>(null);
  const cur = useRef<{ id: number; x: number; y: number; t: number; moved: boolean; dir: Dir | null } | null>(null);
  const setDir = (dir: Dir | null) => {
    const c = cur.current;
    if (!c || c.dir === dir) return;
    if (dialog.value?.choices) {
      if (dir) { key(DIR_KEY[dir], true); key(DIR_KEY[dir], false); }
      c.dir = dir;
      return;
    }
    const g = getGame();
    if (c.dir) g.input.release(c.dir);
    if (dir) g.input.press(dir);
    c.dir = dir;
  };
  const end = (e: PointerEvent) => {
    const c = cur.current;
    if (!c || c.id !== e.pointerId) return;
    setDir(null);
    // a tap is A (in a question: picks the choice under the cursor)
    if (!c.moved && performance.now() - c.t < 350) {
      key('z', true);
      key('z', false);
    }
    cur.current = null;
    setJoy(null);
  };
  const handlers = {
    onPointerDown: (e: PointerEvent) => {
      if (cur.current || menuOpen.value || monOverlay.value || evoOverlay.value || learnOverlay.value || hatchOverlay.value || nameOverlay.value || pictureOverlay.value) return;
      if ((e.target as HTMLElement).closest('button, .dialog, .dialog-choices, .startmenu')) return;
      cur.current = { id: e.pointerId, x: e.clientX, y: e.clientY, t: performance.now(), moved: false, dir: null };
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      setJoy({ x: e.clientX, y: e.clientY, kx: 0, ky: 0 });
    },
    onPointerMove: (e: PointerEvent) => {
      const c = cur.current;
      if (!c || c.id !== e.pointerId) return;
      const dx = e.clientX - c.x, dy = e.clientY - c.y;
      const dist = Math.hypot(dx, dy);
      if (dist > 10) c.moved = true;
      const k = Math.min(1, JOY_R / Math.max(dist, 1));
      setJoy({ x: c.x, y: c.y, kx: dx * k, ky: dy * k });
      setDir(dist < 14 ? null : Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up');
    },
    onPointerUp: end,
    onPointerCancel: end,
  };
  const view = joy && (
    <div class="joy" style={{ left: `${joy.x}px`, top: `${joy.y}px` }} aria-hidden="true">
      <span class="joy__knob" style={{ transform: `translate(${joy.kx}px, ${joy.ky}px)` }} />
    </div>
  );
  return { handlers, view };
}

function TouchControls() {
  const hold = (k: string) => ({
    onPointerDown: (e: PointerEvent) => { e.preventDefault(); e.stopPropagation(); (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); key(k, true); },
    onPointerUp: () => key(k, false),
    onPointerCancel: () => key(k, false),
    onPointerLeave: () => key(k, false),
  });
  const inDialog = !!dialog.value;
  return (
    <div class="touch">
      <p class="touch__hint">{tr(L('Touche l’écran et glisse pour marcher', 'Touch the screen and slide to walk'))}</p>
      <div class="ab">
        <button class="ab__b" {...hold('x')}>B</button>
        <button class="ab__a" onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); key(inDialog ? 'Enter' : 'z', true); }}>A</button>
      </div>
    </div>
  );
}
