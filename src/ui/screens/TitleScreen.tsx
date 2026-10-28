import { useEffect, useState } from 'preact/hooks';
import { effect } from '@preact/signals';
import { L, t, tr } from '../../i18n';
import { artUrl, dexNo, dexCount } from '../../data/creatures';
import { originals } from '../../data/originals';
import { enterWorld } from '../../overworld/controller';
import { hasSave, loadSave, outdatedSave, peekSlot, savedSlots, slot, SLOTS } from '../../state/game';
import { go } from '../../state/router';
import type { SaveData } from '../../save/schema';
import { personUrl } from '../personArt';
import { MenuList, Window, YesNo } from '../paper';
import { playMusic } from '../../audio/music';
import { firstOfflineReady, install, installLater, installToastDue, installWay } from '../../state/pwa';
import './title.css';

/** Offers to install the game, over the logo. « Plus tard » hides it for a week. */
function InstallToast() {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setShown(installToastDue()), 1200);
    return () => clearTimeout(id);
  }, []);
  const way = installWay.value;
  if (!shown || !way) return null;
  const later = () => { installLater(); setShown(false); };
  return (
    <div class="title__install">
      <Window>
        <p>
          {way === 'prompt'
            ? tr(L('Installe le jeu sur ton appareil : il s’ouvrira comme une appli, même sans Internet.', 'Install the game on your device: it opens like an app, even without the Internet.'))
            : tr(L('Pour installer le jeu, touche le bouton Partager, puis « Sur l’écran d’accueil ».', 'To install the game, tap the Share button, then “Add to Home Screen”.'))}
        </p>
        <div class="title__install-row">
          {way === 'prompt' && <button class="pbtn pbtn--accent" onClick={() => { setShown(false); void install(); }}>{tr(L('Installer', 'Install'))}</button>}
          <button class="pbtn" onClick={later}>{tr(way === 'prompt' ? L('Plus tard', 'Later') : L('OK', 'OK'))}</button>
        </div>
      </Window>
    </div>
  );
}

/** A few pencil stars around the edges (kept away from the middle). */
const STARS: [x: number, y: number, size: number, delay: number][] = [
  [6, 6, 14, 0], [88, 4, 10, 1.2], [94, 22, 16, 0.4], [4, 30, 10, 2.1], [12, 52, 12, 0.8],
  [91, 48, 10, 1.7], [7, 78, 14, 2.6], [90, 74, 12, 0.2], [80, 90, 10, 1.4], [18, 92, 10, 2.9],
];

function Moon() {
  return (
    <svg class="title__moon" viewBox="0 0 40 40" aria-hidden="true">
      <path d="M27 5 A16 16 0 1 0 35 30 A13 13 0 1 1 27 5 Z" fill="#fff3c4" stroke="#2b2536" stroke-width="2.5" stroke-linejoin="round" />
      <path d="M14 15 l3 1 M11 24 l3 -1 M19 31 l2 -2" stroke="#e6c870" stroke-width="2" stroke-linecap="round" />
    </svg>
  );
}

function Sky() {
  return (
    <div class="title__sky" aria-hidden="true">
      {STARS.map(([x, y, size, delay]) => (
        <svg class="title__star" viewBox="0 0 10 10" style={{ left: `${x}%`, top: `${y}%`, width: `${size}px`, animationDelay: `${delay}s` }}>
          <path d="M5 0 L6 4 L10 5 L6 6 L5 10 L4 6 L0 5 L4 4 Z" fill="#ffd75e" />
        </svg>
      ))}
    </div>
  );
}

/** The Bestioles of her own drawings: the title shows only these, players discover the others. */
const BOOK = originals();

/** The open sketchbook: one drawing at a time, the page turns to the next one. */
function Sketchbook({ i }: { i: number }) {
  const c = BOOK[i];
  return (
    <div class="title__book" aria-hidden="true">
      <div class="title__page" key={i}>
        <img class="title__hero mon-art" src={artUrl(c)} alt="" />
        <p class="title__caption"><span class="title__no">N°{dexNo(c.id)} · </span>{tr(c.name)}</p>
      </div>
    </div>
  );
}

const time = (ms: number) => {
  const m = Math.floor(ms / 60000);
  return `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`;
};

/** One saved game on the title screen: who plays it, how far, for how long. */
function SlotCard({ n, s, onPick }: { n: number; s: SaveData | null; onPick: () => void }) {
  return (
    <button class={`title__slot ${s ? '' : 'is-empty'}`} onClick={onPick}>
      {s?.player.look && <img class="title__slot-pic" src={personUrl(s.player.look)} alt="" />}
      <span class="title__slot-text">
        <b>{tr(L('Partie {n}', 'Game {n}'), { n })}</b>
        {s ? (
          <span>{s.player.name} · {s.badges.length} {tr(s.badges.length > 1 ? L('badges', 'badges') : L('badge', 'badge'))} · {tr(L('Bestiodex', 'Critterdex'))} {dexCount(s.dex.caught)} · {time(s.playMs)}</span>
        ) : (
          <span>{tr(L('— vide —', '— empty —'))}</span>
        )}
      </span>
    </button>
  );
}

/** FRLG title: logo, the sketchbook turning its pages, "touch the screen", then the main menu. */
export function TitleScreen() {
  const exists = hasSave();
  const [phase, setPhase] = useState<'press' | 'menu'>('press');
  /** Picking a game to continue, or a slot for a new one; then confirming a slot to overwrite. */
  const [picking, setPicking] = useState<'continue' | 'new' | null>(null);
  const [confirmNew, setConfirmNew] = useState<number | null>(null);
  const [hero, setHero] = useState(() => Math.floor(Math.random() * BOOK.length));
  const [offlineNote, setOfflineNote] = useState(false);
  // said once per device, when every file has been downloaded
  useEffect(() => effect(() => void (firstOfflineReady() && setOfflineNote(true))), []);
  useEffect(() => {
    const id = setInterval(() => setHero((h) => (h + 1) % BOOK.length), 3200);
    return () => clearInterval(id);
  }, []);
  // from the first page: an installed app may play right away, a browser tab at the first touch (the
  // music is ready by then, so the touch itself starts it, even on iPhone)
  useEffect(() => playMusic('title'), []);
  useEffect(() => {
    if (phase !== 'press') return;
    const go = () => setPhase('menu');
    window.addEventListener('keydown', go, { once: true });
    return () => window.removeEventListener('keydown', go);
  }, [phase]);
  const saved = exists ? savedSlots() : [];
  const startNew = (n: number) => { slot.value = n; go({ id: 'newgame' }); };
  const items = [
    // one game: straight in; several: pick whose
    ...(exists ? [{ label: t('menu.continue'), onSelect: () => (saved.length === 1 ? loadSave(saved[0]) && enterWorld() : setPicking('continue')) }] : []),
    { label: t('menu.newGame'), onSelect: () => (exists ? setPicking('new') : startNew(1)) },
    { label: tr(L('MUSIQUES', 'MUSIC')), onSelect: () => go({ id: 'jukebox' }) },
    { label: t('menu.settings'), onSelect: () => go({ id: 'settings', back: { id: 'title' } }) },
    { label: tr(L('Crédits', 'Credits')), onSelect: () => go({ id: 'credits' }) },
  ];
  return (
    // taps on the install toast don't open the menu (it may already be gone when the tap gets here)
    <div class={`title ${phase === 'menu' ? 'is-menu' : ''}`} onClick={(e) => phase === 'press' && !(e.target as Element).closest('.title__install') && setPhase('menu')}>
      <InstallToast />
      <Sky />
      <div class="title__logo-wrap">
        <h1 class="title__logo">{t('game.title')}</h1>
        <p class="title__sub"><Moon />{tr(L('Le Rêve de Papeterre', 'The Dream of Papeterra'))}</p>
      </div>
      <Sketchbook i={hero} />
      {phase === 'press' ? (
        <p class="title__press blip">{tr(L('TOUCHE L’ÉCRAN', 'TOUCH THE SCREEN'))}</p>
      ) : (
        <div class="title__menu" onClick={(e) => e.stopPropagation()}>
          {outdatedSave.value && (
            <Window seyes class="title__note">{tr(L('Le jeu a beaucoup changé : ton ancienne partie ne peut plus être chargée. Commence une nouvelle aventure !', 'The game changed a lot: your old save can’t be loaded anymore. Start a new adventure!'))}</Window>
          )}
          {offlineNote && (
            <Window seyes class="title__note">{tr(L('Le jeu est maintenant sur ton appareil : tu peux jouer même sans Internet !', 'The game is now on your device: you can play even without the Internet!'))}</Window>
          )}
          {confirmNew !== null ? (
            <>
              <Window seyes class="title__note">{tr(L('La partie {n} ({p}) sera effacée. Continuer ?', 'Game {n} ({p}) will be erased. Continue?'), { n: confirmNew, p: peekSlot(confirmNew)?.player.name ?? '' })}</Window>
              <YesNo onAnswer={(yes) => (yes ? startNew(confirmNew) : setConfirmNew(null))} />
            </>
          ) : picking ? (
            <Window class="title__slots">
              <p class="title__slots-title">{picking === 'continue' ? tr(L('Quelle partie ?', 'Which game?')) : tr(L('Où commencer la nouvelle partie ?', 'Where should the new game go?'))}</p>
              {Array.from({ length: SLOTS }, (_, i) => i + 1)
                .filter((n) => picking === 'new' || saved.includes(n))
                .map((n) => {
                  const g = peekSlot(n);
                  return <SlotCard n={n} s={g} onPick={() => (picking === 'continue' ? loadSave(n) && enterWorld() : g ? setConfirmNew(n) : startNew(n))} />;
                })}
              <button class="pbtn pbtn--back" onClick={() => setPicking(null)}>{tr(L('Retour', 'Back'))}</button>
            </Window>
          ) : (
            <Window class="title__list"><MenuList items={items} /></Window>
          )}
        </div>
      )}
    </div>
  );
}
