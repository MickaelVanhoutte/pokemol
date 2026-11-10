/**
 * How a battle begins: which transition covers the world, how the battle is revealed, and whether a
 * VS splash comes in between (bosses only). Pure, so tests can go through every case.
 */
import { L, tr, type LText } from '../../i18n';
import type { TrackId } from '../../audio/music';
import type { Appearance } from '../../data/appearance';
import { badgeDef } from '../../data/badges';
import type { CoverKind, RevealKind } from '../curtain/wipes';
import type { VsCard, VsKind } from '../curtain/VsSplash';

export interface IntroInput {
  kind: 'wild' | 'trainer';
  /** Where a wild Bestiole jumped out: 'water', 'cave', or a tile id (grass). */
  ground?: string;
  music?: TrackId;
  trainerId?: string;
  /** The Atelier badge this trainer gives (or gave, for a rematch). */
  badge?: string;
  /** Team Gomme. */
  grey?: boolean;
  legendary?: boolean;
  /** Challenge Tower: borrowed teams, no splash. */
  borrowed?: boolean;
}

export interface Intro {
  cover: CoverKind;
  reveal: RevealKind;
  vs?: VsKind;
}

export function introOf(i: IntroInput): Intro {
  if (i.kind === 'wild') {
    // legends, and the story's big wild encounters (they play the final battle's music)
    if (i.legendary || i.music === 'final' || i.music === 'legende') return { cover: 'legend', reveal: 'tear', vs: 'legend' };
    if (i.ground === 'water') return { cover: 'water', reveal: 'lift' };
    if (i.ground === 'cave') return { cover: 'cave', reveal: 'lift' };
    return { cover: 'grass', reveal: 'lift' };
  }
  if (i.trainerId === 'effaceur') return { cover: 'boss', reveal: 'erase', vs: 'boss' };
  if (i.borrowed) return { cover: i.music === 'leader' ? 'boss' : 'trainer', reveal: 'tear' };
  if (i.music === 'champion') return { cover: 'boss', reveal: 'tear', vs: 'champion' };
  if (i.badge) return { cover: 'boss', reveal: 'tear', vs: 'leader' };
  if (i.music === 'leader' || i.music === 'concours') return { cover: 'boss', reveal: 'tear', vs: 'concours' };
  if (i.music === 'rival') return { cover: 'trainer', reveal: 'tear', vs: 'rival' };
  if (i.grey) return { cover: 'gomme', reveal: 'erase' };
  return { cover: 'trainer', reveal: 'tear' };
}

/** The small line over the foe's name on the VS splash. */
export const VS_TITLES: Record<VsKind, LText> = {
  leader: L('Maître d’Atelier', 'Atelier Master'),
  rival: L('Rival', 'Rival'),
  boss: L('Team Gomme', 'Team Eraser'),
  legend: L('Rencontre hors du commun', 'An extraordinary encounter'),
  champion: L('Grand Concours · Finale', 'Grand Contest · Final'),
  concours: L('Grand Concours', 'Grand Contest'),
};

/** The foe's half of the page, when it has no badge colour. */
const VS_COLOURS: Record<VsKind, string> = {
  leader: '#8a6cd0', rival: '#6a3ab0', boss: '#2b2536', legend: '#3d3272', champion: '#c99a2e', concours: '#b0563a',
};

export interface VsFoe {
  /** The foe's name as the battle shows it (« Maître d’Atelier Mireille », a Bestiole's name…). */
  name: LText;
  badge?: string;
  person?: Appearance;
  /** A Bestiole's drawing (legends). */
  art?: string;
}

export function vsCardOf(kind: VsKind, foe: VsFoe, me: { person: Appearance; name: string }): VsCard {
  const badge = foe.badge ? badgeDef(foe.badge) : undefined;
  // a leader's name already says « Maître d'Atelier »: the badge knows the name alone
  const name = kind === 'leader' && badge ? tr(badge.leader) : tr(foe.name);
  return {
    kind,
    title: tr(VS_TITLES[kind]),
    name,
    color: badge?.color ?? VS_COLOURS[kind],
    foe: { person: foe.person, art: foe.art },
    me,
  };
}
