import { useEffect, useRef, useState } from 'preact/hooks';
import { L, tr, type LText } from '../../i18n';
import { currentTrack, jingleIds, musicPosition, playJingle, playMusic, stopMusic, trackIds, trackSeconds, type JingleId, type TrackId } from '../../audio/music';
import { go } from '../../state/router';
import { Frame, MenuList, Window } from '../paper';
import './title.css';

/** Names of the tunes and where they play in the game. */
const TRACKS: Record<TrackId, { name: LText; where: LText }> = {
  title: { name: L('Le Rêve de Papeterre', 'The Dream of Papeterra'), where: L('Écran titre', 'Title screen') },
  bourg: { name: L('Chez moi', 'Home Sweet Home'), where: L('Bourg-Gribouille', 'Bourg-Gribouille') },
  pastel: { name: L('Pastel en fête', 'Pastel Party'), where: L('Ville-Pastel', 'Pastel City') },
  plume: { name: L('Le vent dans les plumes', 'Wind in the Feathers'), where: L('Village-Plume', 'Featherby') },
  port: { name: L('Chanson de marin', 'Sailor’s Song'), where: L('Port-Aquarelle', 'Port Aquarelle') },
  feutre: { name: L('Néons fluo', 'Neon Lights'), where: L('Ville-Feutre', 'Felt City') },
  braise: { name: L('Au pied du volcan', 'At the Foot of the Volcano'), where: L('Village-Braise', 'Embervale') },
  paillette: { name: L('Pluie d’étoiles', 'Shower of Stars'), where: L('Bourg-Paillette', 'Glimmerton') },
  gouache: { name: L('Promenade au jardin', 'A Walk in the Garden'), where: L('Jardin-Gouache', 'Gouache Garden') },
  encre: { name: L('Jazz à l’encre', 'Ink Jazz'), where: L('Cité-Encre', 'Ink City') },
  galerie: { name: L('La grande parade', 'The Grand Parade'), where: L('Place des Chefs-d’Œuvre', 'Masterpiece Square') },
  town: { name: L('Petites rues en couleurs', 'Little Coloured Streets'), where: L('Autres maisons', 'Other houses') },
  route: { name: L('En route !', 'On the Road!'), where: L('Routes et chemins', 'Routes and paths') },
  cave: { name: L('Échos du Fusain', 'Charcoal Echoes'), where: L('Grottes et tours', 'Caves and towers') },
  gomme: { name: L('La Team Gomme', 'Team Gomme'), where: L('Repaires de la Team Gomme', 'Team Gomme hideouts') },
  edge: { name: L('La Page Blanche', 'The Blank Page'), where: L('Route Blanche et Bord de la Page', 'Blank Road and the Edge of the Page') },
  center: { name: L('Pause goûter', 'Snack Break'), where: L('Auberges et boutiques', 'Inns and shops') },
  atelier: { name: L('L’Atelier', 'The Atelier'), where: L('Dans les Ateliers et au Grand Concours', 'Inside the Ateliers and the Grand Contest') },
  rival: { name: L('Mon voisin', 'My Neighbour'), where: L('Quand le rival arrive, et ses combats', 'When the rival shows up, and his battles') },
  wild: { name: L('Une Bestiole sauvage !', 'A Wild Critter!'), where: L('Combats contre les Bestioles sauvages', 'Wild Critter battles') },
  trainer: { name: L('Duel de dresseurs', 'Trainer Duel'), where: L('Combats de dresseurs', 'Trainer battles') },
  gommeBattle: { name: L('Gommés !', 'Rubbed Out!'), where: L('Combats contre la Team Gomme', 'Team Gomme battles') },
  leader: { name: L('Maître d’Atelier', 'Atelier Master'), where: L('Combats des Ateliers et du Grand Concours', 'Atelier and Grand Contest battles') },
  final: { name: L('Le Grand Effaceur', 'The Great Eraser'), where: L('Le dernier combat de l’histoire', 'The story’s last battle') },
  champion: { name: L('Le Chef-d’Œuvre', 'The Masterpiece'), where: L('Finale du Grand Concours', 'Grand Contest final') },
  ending: { name: L('Bonne nuit, petite artiste', 'Good Night, Little Artist'), where: L('Fin et générique', 'Ending and credits') },
};

/** The little tunes played once: badge, item, catch… */
const JINGLES: Record<JingleId, LText> = {
  badge: L('Badge !', 'Badge!'), item: L('Objet trouvé', 'Item found'), caught: L('Attrapée !', 'Caught!'),
  victory: L('Victoire', 'Victory'), evolved: L('Évolution', 'Evolution'), heal: L('Soins', 'Healing'),
};

const clock = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

/** Music box (title menu): listen to every tune of the game, even with the music option off. */
export function JukeboxScreen() {
  const ids = trackIds();
  const [playing, setPlaying] = useState<TrackId | null>(currentTrack());
  const [cursor, setCursor] = useState(Math.max(0, ids.indexOf(currentTrack() ?? 'title')));
  const [pos, setPos] = useState(0);
  const raf = useRef(0);

  // the loop position, redrawn every frame while a tune plays
  useEffect(() => {
    const tick = () => {
      setPos(musicPosition());
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, []);

  const play = (id: TrackId) => {
    playMusic(id, true);
    setPlaying(id);
  };
  const stop = () => {
    stopMusic();
    setPlaying(null);
  };
  const step = (d: 1 | -1) => {
    const i = (ids.indexOf(playing ?? ids[cursor]) + d + ids.length) % ids.length;
    setCursor(i);
    play(ids[i]);
  };
  const close = () => {
    stopMusic();
    go({ id: 'title' });
  };

  const shown = playing ?? ids[cursor];
  const len = trackSeconds(shown);
  return (
    <Frame title={tr(L('Musiques', 'Music'))} onBack={close} class="jukebox">
      <Window class="jukebox__now">
        <p class="jukebox__name">{playing ? '♪ ' : ''}{tr(TRACKS[shown].name)}</p>
        <p class="jukebox__where">{tr(TRACKS[shown].where)}</p>
        <div class="jukebox__bar" role="progressbar" aria-valuemin={0} aria-valuemax={Math.round(len)} aria-valuenow={Math.round(playing ? pos : 0)}>
          <span style={{ width: `${playing ? (100 * pos) / len : 0}%` }} />
        </div>
        <div class="jukebox__controls">
          <button class="pbtn" onClick={() => step(-1)} aria-label={tr(L('Précédente', 'Previous'))}>◀◀</button>
          {playing
            ? <button class="pbtn pbtn--accent" onClick={stop}>■ {tr(L('Stop', 'Stop'))}</button>
            : <button class="pbtn pbtn--accent" onClick={() => play(shown)}>▶ {tr(L('Jouer', 'Play'))}</button>}
          <button class="pbtn" onClick={() => step(1)} aria-label={tr(L('Suivante', 'Next'))}>▶▶</button>
          <span class="jukebox__time">{clock(playing ? pos : 0)} / {clock(len)}</span>
        </div>
      </Window>
      <div class="jukebox__jingles">
        <span>{tr(L('Petits airs :', 'Jingles:'))}</span>
        {jingleIds().map((id) => (
          <button class="pbtn" onClick={() => { setPlaying(null); playJingle(id, { force: true, resume: false }); }}>{tr(JINGLES[id])}</button>
        ))}
      </div>
      <Window class="jukebox__list">
        <MenuList
          onCursor={setCursor}
          onCancel={close}
          items={ids.map((id) => ({
            label: `${id === playing ? '♪ ' : ''}${tr(TRACKS[id].name)}`,
            side: clock(trackSeconds(id)),
            onSelect: () => (id === playing ? stop() : play(id)),
          }))}
        />
      </Window>
    </Frame>
  );
}
