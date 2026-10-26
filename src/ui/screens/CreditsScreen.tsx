import { useEffect } from 'preact/hooks';
import { L, tr } from '../../i18n';
import { playMusic } from '../../audio/music';
import { CREATURES, artUrl } from '../../data/creatures';
import { go } from '../../state/router';
import { backToWorld } from '../../overworld/controller';
import { save } from '../../state/game';
import { Frame, Window } from '../paper';
import '../screens.css';

export function CreditsScreen({ fromWorld }: { fromWorld?: boolean }) {
  const ended = !!save.value?.flags.ending;
  useEffect(() => playMusic('ending'), []);
  return (
    <Frame title={tr(L('Crédits', 'Credits'))} onBack={() => (fromWorld ? backToWorld() : go({ id: 'title' }))}>
      <Window class="credits__body">
        <p>{tr(L('Toutes les Bestioles ont été dessinées par', 'Every Critter was drawn by'))}</p>
        <p class="credits__artist">{tr(L('la petite artiste', 'the little artist'))}</p>
        <p>{tr(L('… et photographiées par Papa, pour qu’elles ne se perdent jamais.', '… and photographed by Daddy, so they never get lost.'))}</p>
        <div class="credits__parade">
          {CREATURES.filter((c) => !c.draft).map((c) => <img class="mon-art" src={artUrl(c)} alt={tr(c.name)} title={tr(c.name)} />)}
        </div>
        {CREATURES.some((c) => c.draft) && (
          <>
            <p>{tr(L('Et quelques brouillons, griffonnés en attendant ses dessins :', 'And a few drafts, scribbled while waiting for her drawings:'))}</p>
            <div class="credits__parade">
              {CREATURES.filter((c) => c.draft).map((c) => <img class="mon-art" src={artUrl(c)} alt={tr(c.name)} title={tr(c.name)} />)}
            </div>
          </>
        )}
        <p>{tr(L('Jeu, décors et pixels faits maison.', 'Game, scenery and pixels made at home.'))}</p>
        <p>{tr(L('Polices : Inter et Jersey 15 (SIL Open Font License).', 'Fonts: Inter and Jersey 15 (SIL Open Font License).'))}</p>
        {ended && <p class="credits__end">{tr(L('Fin… ou presque. Les Bestioles t’attendent à Papeterre !', 'The end… almost. The Critters are waiting for you in Papeterra!'))}</p>}
        <p class="credits__small">{tr(L('Un jeu de fans, inspiré des jeux de monstres de poche sur Game Boy Advance. Aucun lien avec une marque existante.', 'A fan game inspired by the Game Boy Advance pocket-monster games. Not affiliated with any existing brand.'))}</p>
      </Window>
    </Frame>
  );
}
