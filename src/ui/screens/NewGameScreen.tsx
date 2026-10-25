import { useMemo, useState } from 'preact/hooks';
import { L, tr } from '../../i18n';
import { AVATARS, SpriteSheet } from '../../overworld/sprites';
import { enterWorld, runScript } from '../../overworld/controller';
import { newGame } from '../../state/game';
import { go } from '../../state/router';
import { Frame, Window } from '../paper';
import '../screens.css';

export function NewGameScreen() {
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(0);
  const pics = useMemo(() => AVATARS.map((look) => {
    const sheet = new SpriteSheet(look);
    const c = document.createElement('canvas');
    c.width = 16;
    c.height = 16;
    c.getContext('2d')!.drawImage(sheet.canvas, 0, 0, 16, 16, 0, 0, 16, 16);
    return c.toDataURL();
  }), []);
  const start = () => {
    newGame(name.trim() || tr(L('Mol', 'Mol')), avatar);
    enterWorld();
    void runScript('intro');
  };
  return (
    <Frame title={tr(L('Nouvelle partie', 'New game'))} onBack={() => go({ id: 'title' })}>
      <Window class="newgame__panel">
        <label for="pname">{tr(L('Comment t’appelles-tu ?', 'What’s your name?'))}</label>
        <input
          id="pname"
          class="newgame__input"
          maxLength={12}
          value={name}
          placeholder={tr(L('Ton prénom', 'Your name'))}
          onInput={(e) => setName((e.target as HTMLInputElement).value)}
          onKeyDown={(e) => e.key === 'Enter' && start()}
        />
        <p>{tr(L('Choisis ton personnage :', 'Choose your character:'))}</p>
        <div class="newgame__avatars">
          {pics.map((src, i) => (
            <button class={`newgame__avatar ${i === avatar ? 'is-on' : ''}`} onClick={() => setAvatar(i)} aria-pressed={i === avatar}>
              <img src={src} alt="" />
            </button>
          ))}
        </div>
        <button class="pbtn pbtn--accent" onClick={start}>{tr(L('C’est parti !', 'Let’s go!'))}</button>
      </Window>
    </Frame>
  );
}
