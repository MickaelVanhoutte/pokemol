import { Component, type ComponentChildren } from 'preact';
import { L, tr } from '../i18n';
import { exportSave, save } from '../state/game';
import { go, screen } from '../state/router';
import { worldBroken } from '../state/crash';
import { ActionBar, Window } from './paper';
import './screens.css';

interface State { failed: boolean }

/**
 * Around the screen being shown: a screen that crashes shows a torn page (go back, reload, keep the game
 * being played as a file) instead of leaving a blank screen with no way out.
 */
export class Guard extends Component<{ children: ComponentChildren }, State> {
  state: State = { failed: false };

  componentDidCatch(err: unknown) {
    console.error(err);
    this.setState({ failed: true });
  }

  render() {
    if (!this.state.failed && !worldBroken.value) return this.props.children;
    const inWorld = screen.value.id === 'overworld';
    const back = () => {
      worldBroken.value = false;
      this.setState({ failed: false });
      // the world itself broke: back to the title, where the game can be loaded again
      go(inWorld || !save.value ? { id: 'title' } : { id: 'overworld' });
    };
    return (
      <div class="frame graph crash" role="alert">
        <Window seyes class="crash__note">
          <p class="crash__title">{tr(L('Oups, une page s’est déchirée…', 'Oops, a page got torn…'))}</p>
          <p>{tr(L('Le jeu a rencontré un problème. Ta dernière sauvegarde n’a pas bougé.', 'The game ran into a problem. Your last save is safe.'))}</p>
          {save.value && <p>{tr(L('Tu peux aussi garder la partie en cours dans un fichier.', 'You can also keep the game being played in a file.'))}</p>}
        </Window>
        {save.value && (
          <button class="pbtn" onClick={() => exportSave()}>{tr(L('Exporter la partie', 'Export the game'))}</button>
        )}
        <ActionBar
          onBack={back}
          action={<button class="pbtn pbtn--accent" onClick={() => location.reload()}>{tr(L('Recharger', 'Reload'))}</button>}
        />
      </div>
    );
  }
}
