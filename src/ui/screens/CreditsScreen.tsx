import { L, tr } from '../../i18n';
import { CREATURES, artUrl } from '../../data/creatures';
import { go } from '../../state/router';

export function CreditsScreen() {
  return (
    <div class="screen credits">
      <div class="screen__bar">
        <button class="btn btn--small" onClick={() => go({ id: 'title' })}>← {tr(L('Retour', 'Back'))}</button>
        <h1>{tr(L('Crédits', 'Credits'))}</h1>
      </div>
      <div class="credits__body">
        <h2 class="pixel">{tr(L('Toutes les Bestioles ont été dessinées par', 'Every Critter was drawn by'))}</h2>
        <p class="credits__artist pixel">{tr(L('la petite artiste ✏️', 'the little artist ✏️'))}</p>
        <div class="credits__parade">
          {CREATURES.map((c) => <img src={artUrl(c)} alt={tr(c.name)} title={tr(c.name)} />)}
        </div>
        <p>{tr(L('Jeu, décors et musique de pixels faits maison.', 'Game, scenery and pixels made at home.'))}</p>
        <p>{tr(L('Polices : Inter et Pixelify Sans (SIL Open Font License).', 'Fonts: Inter and Pixelify Sans (SIL Open Font License).'))}</p>
        <p class="credits__small">{tr(L('Un jeu de fans, inspiré des jeux de monstres de poche et des jeux de cartes « roguelike ». Aucun lien avec une marque existante.', 'A fan game inspired by pocket-monster games and roguelike card games. Not affiliated with any existing brand.'))}</p>
      </div>
    </div>
  );
}
