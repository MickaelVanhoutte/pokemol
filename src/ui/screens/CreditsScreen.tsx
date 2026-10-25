import { L, tr } from '../../i18n';
import { CREATURES, artUrl } from '../../data/creatures';
import { go } from '../../state/router';
import { backToWorld } from '../../overworld/controller';
import { Frame, Window } from '../paper';
import '../screens.css';

export function CreditsScreen({ fromWorld }: { fromWorld?: boolean }) {
  return (
    <Frame title={tr(L('Crédits', 'Credits'))} onBack={() => (fromWorld ? backToWorld() : go({ id: 'title' }))}>
      <Window class="credits__body">
        <p>{tr(L('Toutes les Bestioles ont été dessinées par', 'Every Critter was drawn by'))}</p>
        <p class="credits__artist">{tr(L('la petite artiste', 'the little artist'))}</p>
        <div class="credits__parade">
          {CREATURES.map((c) => <img class="mon-art" src={artUrl(c)} alt={tr(c.name)} title={tr(c.name)} />)}
        </div>
        <p>{tr(L('Jeu, décors et pixels faits maison.', 'Game, scenery and pixels made at home.'))}</p>
        <p>{tr(L('Polices : Inter et Jersey 15 (SIL Open Font License).', 'Fonts: Inter and Jersey 15 (SIL Open Font License).'))}</p>
        <p class="credits__small">{tr(L('Un jeu de fans, inspiré des jeux de monstres de poche sur Game Boy Advance. Aucun lien avec une marque existante.', 'A fan game inspired by the Game Boy Advance pocket-monster games. Not affiliated with any existing brand.'))}</p>
      </Window>
    </Frame>
  );
}
