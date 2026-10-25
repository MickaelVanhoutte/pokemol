import { useEffect, useState } from 'preact/hooks';
import { L, t, tr } from '../../i18n';
import { CREATURES, artUrl } from '../../data/creatures';
import { enterWorld } from '../../overworld/controller';
import { hasSave, loadSave, outdatedSave } from '../../state/game';
import { go } from '../../state/router';
import type { SaveData } from '../../save/schema';
import { MenuList, Window, YesNo } from '../paper';
import { playMusic } from '../../audio/music';
import './title.css';

function peek(): SaveData | null {
  try {
    const raw = localStorage.getItem('atelier-bestioles.save');
    return raw ? (JSON.parse(raw) as SaveData) : null;
  } catch {
    return null;
  }
}

const time = (ms: number) => {
  const m = Math.floor(ms / 60000);
  return `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`;
};

/** FRLG title: logo and a drawing, "touch the screen", then the main menu. */
export function TitleScreen() {
  const exists = hasSave();
  const [phase, setPhase] = useState<'press' | 'menu'>('press');
  const [confirmNew, setConfirmNew] = useState(false);
  const [hero, setHero] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setHero((h) => (h + 1) % CREATURES.length), 2600);
    return () => clearInterval(id);
  }, []);
  useEffect(() => {
    if (phase === 'menu') playMusic('title');
  }, [phase]);
  useEffect(() => {
    if (phase !== 'press') return;
    const go = () => setPhase('menu');
    window.addEventListener('keydown', go, { once: true });
    return () => window.removeEventListener('keydown', go);
  }, [phase]);
  const s = exists ? peek() : null;
  const items = [
    ...(exists ? [{ label: t('menu.continue'), onSelect: () => { if (loadSave()) enterWorld(); } }] : []),
    { label: t('menu.newGame'), onSelect: () => (exists ? setConfirmNew(true) : go({ id: 'newgame' })) },
    { label: tr(L('BESTIODEX', 'CRITTERDEX')), onSelect: () => go({ id: 'dex', all: true }) },
    { label: t('menu.settings'), onSelect: () => go({ id: 'settings', back: { id: 'title' } }) },
    { label: tr(L('Crédits', 'Credits')), onSelect: () => go({ id: 'credits' }) },
  ];
  return (
    <div class="title" onClick={() => phase === 'press' && setPhase('menu')}>
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
      <div class="title__logo-wrap">
        <h1 class="title__logo">{t('game.title')}</h1>
        <p class="title__sub">{tr(L('Le Rêve de Papeterre', 'The Dream of Papeterra'))}</p>
      </div>
      {phase === 'press' ? (
        <>
          <img key={hero} class="title__hero mon-art" src={artUrl(CREATURES[hero])} alt="" />
          <p class="title__press blip">{tr(L('TOUCHE L’ÉCRAN', 'TOUCH THE SCREEN'))}</p>
        </>
      ) : (
        <div class="title__menu" onClick={(e) => e.stopPropagation()}>
          {outdatedSave.value && (
            <Window seyes class="title__note">{tr(L('Le jeu a beaucoup changé : ton ancienne partie ne peut plus être chargée. Commence une nouvelle aventure !', 'The game changed a lot: your old save can’t be loaded anymore. Start a new adventure!'))}</Window>
          )}
          {s && (
            <Window class="title__save">
              <span>{tr(L('JOUEUR', 'PLAYER'))}</span><b>{s.player.name}</b>
              <span>{tr(L('BADGES', 'BADGES'))}</span><b>{s.badges.length}</b>
              <span>{tr(L('BESTIODEX', 'CRITTERDEX'))}</span><b>{s.dex.caught.length}</b>
              <span>{tr(L('TEMPS', 'TIME'))}</span><b>{time(s.playMs)}</b>
            </Window>
          )}
          {confirmNew ? (
            <>
              <Window seyes class="title__note">{tr(L('Commencer une nouvelle partie efface l’ancienne. Continuer ?', 'Starting a new game erases the old one. Continue?'))}</Window>
              <YesNo onAnswer={(yes) => (yes ? go({ id: 'newgame' }) : setConfirmNew(false))} />
            </>
          ) : (
            <Window class="title__list"><MenuList items={items} /></Window>
          )}
        </div>
      )}
    </div>
  );
}
