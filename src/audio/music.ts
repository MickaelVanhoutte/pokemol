/**
 * Tiny music-box player (Web Audio), scheduled a little ahead of time and looped. Each tune has up
 * to three voices, each played by its own soft instrument: the melody on a music box, the bass on a
 * felt piano, the harmony or arpeggio on chimes. Brushes, a shaker, a wood block and a little bell
 * keep the beat, and a small room reverb ties it all together. All tunes are original.
 *
 * Patterns are space-separated notes with a length in eighth notes: "C5:2 E5 G5:4 .:2 A5:.5"
 * (no length = 1 eighth, ".5" = a sixteenth, "." = rest, "|" = bar line). Every bar of every voice
 * must last `bar` eighths (a test checks it).
 */
import { prefs } from '../state/prefs';

export type TrackId =
  | 'title' | 'bourg' | 'pastel' | 'plume' | 'port' | 'feutre' | 'braise' | 'paillette' | 'gouache' | 'encre' | 'galerie'
  | 'town' | 'route' | 'cave' | 'gomme' | 'edge' | 'center' | 'atelier' | 'rival'
  | 'wild' | 'trainer' | 'gommeBattle' | 'leader' | 'final' | 'champion' | 'ending';

/** Short tunes played once over the music, which comes back after them. */
export type JingleId = 'badge' | 'item' | 'caught' | 'victory' | 'evolved' | 'heal';

/** The first voice is the melody, the second the bass, the third the harmony. */
interface Voice {
  notes: string;
  /** A second, out-of-tune music box this many cents off: a wobbly, uneasy chorus (Team Gomme). */
  detune?: number;
  /** A soft repeat of each note this many eighths later (caves, dreams). */
  echo?: number;
}

interface Track {
  bpm: number;
  /** Eighths per bar: 8 for 4/4, 6 for a waltz or a lullaby. */
  bar?: number;
  /** Delay of the off-beat eighths (0–0.5 of an eighth): a shuffle. */
  swing?: number;
  /** The melody first. */
  voices: Voice[];
  /**
   * k soft kick, s brush, h shaker, o long shaker, r wood block, t low tom, c bell, . nothing; one
   * character per `drumStep` eighths (spaces and bar lines ignored).
   */
  drums?: string;
  drumStep?: number;
}

const NOTE: Record<string, number> = { C: 0, 'C#': 1, D: 2, 'D#': 3, E: 4, F: 5, 'F#': 6, G: 7, 'G#': 8, A: 9, 'A#': 10, B: 11 };
const NAMES = Object.keys(NOTE);

// ------------------------------------------------------------------ writing helpers

const bars = (...b: string[]) => b.join(' | ');
const rep = (p: string, n: number) => Array.from({ length: n }, () => p).join(' | ');
/** Moves every note of a pattern by some semitones. */
function transpose(p: string, semis: number): string {
  return p.replace(/([A-G]#?)(\d)/g, (_, n: string, o: string) => {
    const m = (Number(o) + 1) * 12 + NOTE[n] + semis;
    return `${NAMES[m % 12]}${Math.floor(m / 12) - 1}`;
  });
}
/** `n` notes going round a chord, each `len` eighths long. */
const arp = (chord: string, n: number, len = 0.5) => {
  const t = chord.split(' ');
  return Array.from({ length: n }, (_, i) => `${t[i % t.length]}:${len}`).join(' ');
};
/** Eighth notes jumping between a note and its octave. */
const oct = (root: string, n = 8) => Array.from({ length: n }, (_, i) => (i % 2 ? transpose(root, 12) : root)).join(' ');
/** Root, root, fifth… in eighths: a running bass. */
const drive = (r: string, f: string) => `${r} ${r} ${f} ${r} ${r} ${f} ${r} ${f}`;
/** A galloping bass for one bar (da-da-dum). */
const gallop = (r: string) => {
  const o = transpose(r, 12);
  return `${r} ${r}:.5 ${r}:.5 ${o} ${r} ${r} ${r}:.5 ${r}:.5 ${o} ${r}`;
};
/** Root, then its fifth and octave: a strummed bass for one bar. */
const strum = (r: string) => {
  const f = transpose(r, 7), o = transpose(r, 12);
  return `${r}:3 ${f} ${o}:2 ${f}:2`;
};
/** Off-beat chord stabs for one bar. */
const stab = (a: string, b = a) => `. ${a} . ${a} . ${b} ${b} .`;

// ------------------------------------------------------------------ the tunes

const TRACKS: Record<TrackId, Track> = {
  // C major, a hopeful theme with a harp underneath; the second half soars
  title: {
    bpm: 112,
    voices: [
      {
        notes: bars(
          'E5 G5 C6:2 B5 G5 A5:2', 'F5 A5 D6:2 C6 A5 B5:2', 'G5 C6 E6:2 D6 C6 B5 A5', 'G5:4 .:2 G4 A4',
          'C5 E5 G5:2 F5 E5 D5:2', 'E5 G5 C6:2 B5 A5 G5:2', 'A5 F5 D5 F5 E5 C5 D5 B4', 'C5:6 .:2',
          'A5:3 G5 E5:2 C5:2', 'F5:3 E5 F5:2 A5:2', 'G5:3 E5 C6:2 G5:2', 'B5:4 D6:2 B5 G5',
          'A5:3 B5 C6:2 E6:2', 'F6:2 E6 D6 C6:2 A5:2', 'D6 C6 B5 A5 G5:2 B5:2', 'C6:6 .:2',
        ),
      },
      {
        notes: bars(
          'C3:2 G3:2 C3:2 G3:2', 'F3:2 C4:2 G3:2 D4:2', 'E3:2 B3:2 A3:2 E3:2', 'G3:2 D4:2 G3:2 D4:2',
          'C3:2 G3:2 F3:2 C4:2', 'C3:2 G3:2 E3:2 B3:2', 'F3:2 C4:2 G3:2 D4:2', 'C3:4 G3:4',
          'A2:2 E3:2 A3:2 E3:2', 'F2:2 C3:2 F3:2 C3:2', 'C3:2 G3:2 C4:2 G3:2', 'G2:2 D3:2 G3:2 B3:2',
          'A2:2 E3:2 A3:2 C4:2', 'F2:2 C3:2 F3:2 A3:2', 'D3:2 A3:2 G2:2 D3:2', 'C3:2 G3:2 C4:4',
        ),
      },
      {
        notes: bars(
          arp('C4 E4 G4 C5', 16), `${arp('F4 A4 C5 A4', 8)} ${arp('G4 B4 D5 B4', 8)}`, `${arp('E4 G4 B4 G4', 8)} ${arp('A4 C5 E5 C5', 8)}`, arp('G4 B4 D5 B4', 16),
          arp('C4 E4 G4 C5', 16), `${arp('C4 E4 G4 E4', 8)} ${arp('E4 G4 B4 G4', 8)}`, `${arp('F4 A4 C5 A4', 8)} ${arp('G4 B4 D5 B4', 8)}`, arp('C4 E4 G4 C5', 16),
          arp('A3 C4 E4 A4', 16), arp('F4 A4 C5 A4', 16), arp('C4 E4 G4 C5', 16), arp('G4 B4 D5 G5', 16),
          arp('A3 C4 E4 A4', 16), arp('F4 A4 C5 F5', 16), `${arp('D4 F4 A4 F4', 8)} ${arp('G4 B4 D5 B4', 8)}`, arp('C4 E4 G4 C5', 16),
        ),
      },
    ],
    drums: `${rep('k.h.s.h.', 7)} k.h.s.ss | ${rep('k.hos.ho', 7)} k.s.sscc`,
  },

  // ------------------------------------------------------------ one theme per town
  // Bourg-Gribouille: home, a warm music-box tune in G with a light swing
  bourg: {
    bpm: 92, swing: 0.2,
    voices: [
      { notes: bars('B4:3 D5 G5:2 F#5 E5', 'E5:3 G5 B5:2 A5 G5', 'E5:2 C5:2 D5 E5 G5:2', 'F#5:4 A5:2 .:2', 'B5:3 A5 G5:2 D5:2', 'E5 F#5 G5 B5 A5:2 G5:2', 'C5 E5 A5 G5 F#5 D5 E5 F#5', 'G5:6 .:2') },
      { notes: bars(strum('G2'), strum('E2'), strum('C3'), strum('D3'), strum('G2'), strum('E2'), 'A2:2 E3:2 D3:2 A3:2', 'G2:4 D3:4') },
      { notes: bars(arp('G4 B4 D5 B4', 8, 1), arp('E4 G4 B4 G4', 8, 1), arp('C4 E4 G4 E4', 8, 1), arp('D4 F#4 A4 F#4', 8, 1), arp('G4 B4 D5 B4', 8, 1), arp('E4 G4 B4 G4', 8, 1), `${arp('A4 C5 E5 C5', 4, 1)} ${arp('D4 F#4 A4 F#4', 4, 1)}`, arp('G4 B4 D5 G5', 8, 1)) },
    ],
    drums: 'k.h.r.h.k.h.r.hh',
  },

  // Ville-Pastel: bouncy and bright, D major
  pastel: {
    bpm: 116,
    voices: [
      { notes: bars('A4 D5 F#5 A5 . F#5 A5:2', 'B5 . A5 F#5 D5:2 F#5:2', 'G5 . B5 G5 D5 G5 B5:2', 'A5:2 C#6:2 E5:4', 'F#5 A5 D6 . C#6 D6 A5:2', 'C#6 A5 F#5 . A5:2 C#6:2', 'B5 A5 G5 B5 A5 G5 E5 C#5', 'D5:4 .:2 A4:2') },
      { notes: bars(oct('D3'), oct('B2'), oct('G2'), oct('A2'), oct('D3'), oct('F#2'), `${oct('G2', 4)} ${oct('A2', 4)}`, oct('D3')) },
      { notes: bars(stab('F#4', 'A4'), stab('D4', 'F#4'), stab('B4', 'D5'), stab('C#5', 'E4'), stab('F#4', 'A4'), stab('A4', 'C#5'), stab('B4', 'C#5'), stab('F#4', 'D4')) },
    ],
    drums: 'k.h.s.hkk.h.s.h.',
  },

  // Village-Plume: airy, with birds chirping in sixteenths (6/8)
  plume: {
    bpm: 100, bar: 6,
    voices: [
      { notes: bars('E5:2 A5 C#6:3', 'D6:2 C#6 A5:3', 'B5:2 G#5 E5:3', 'A5:6', 'C#6:2 B5 A5:2 F#5', 'D5:2 F#5 A5:3', 'G#5:2 B5 E6:2 D6', 'C#6:3 A5:3') },
      { notes: bars('A2:3 E3:3', 'D3:3 A3:3', 'E3:3 B3:3', 'A2:3 E3:3', 'F#2:3 C#3:3', 'D3:3 A3:3', 'E3:3 B2:3', 'A2:6') },
      { notes: bars('.:3 E6:.5 F#6:.5 E6:.5 C#6:.5 .', '.:6', '.:3 B6:.5 A6:.5 G#6:.5 E6:.5 .', '.:6', '.:3 C#6:.5 D6:.5 C#6:.5 A5:.5 .', '.:6', '.:3 E6:.5 F#6:.5 G#6:.5 E6:.5 .', '.:6') },
    ],
    drums: 'k..h..',
  },

  // Port-Aquarelle: a jaunty sea shanty (6/8, A minor)
  port: {
    bpm: 120, bar: 6,
    voices: [
      { notes: bars('A4 C5 E5 A5:2 G5', 'B5:2 A5 G5:2 D5', 'C5 E5 A5 C6:2 B5', 'G#5:3 E5:3', 'A5 B5 C6 E6:2 D6', 'C6:2 B5 G5:2 E5', 'D5 G5 B5 G#5 B5 E6', 'A5:3 A4:3') },
      { notes: bars('A2 E3 A3 E3 A2 E3', 'G2 D3 G3 D3 G2 D3', 'A2 E3 A3 E3 A2 E3', 'E2 B2 E3 B2 E2 G#2', 'A2 E3 A3 E3 A2 E3', 'C3 G3 C4 G3 C3 G3', 'G2 D3 G3 E2 B2 E3', 'A2 E3 A3 A2:3') },
      { notes: bars('E4:6', 'D4:6', 'E4:6', 'E4:6', 'C5:6', 'E4:6', 'D4:3 E4:3', 'E4:6') },
    ],
    drums: 'k.hs.h',
  },

  // Ville-Feutre: a funky neon city (E dorian), sixteenth hats and a slap bass
  feutre: {
    bpm: 118,
    voices: [
      { notes: bars('.:2 B4 D5 . E5 .:2', '.:2 C#5 E5 . G5 F#5 E5', '.:2 B4 D5 . E5 G5 A5', 'B5:2 A5 G5 E5:2 .:2', 'E5 G5 B5 . B5 A5 G5 E5', 'D5 F#5 A5 . A5 G5 F#5 D5', 'C5 E5 A5 G5 F#5 A5 D6 C6', 'B5:4 .:4') },
      { notes: bars('E2 . E3 E2 . E2 D3 B2', 'A2 . A3 A2 . A2 G3 E3', 'E2 . E3 E2 . E2 D3 B2', 'A2 . A3 A2 . A2 G3 E3', 'C3 . C4 C3 . C3 B3 G3', 'B2 . B3 B2 . B2 A3 F#3', 'A2 . A3 A2 D3 . D4 C4', 'E2 . E3 E2 B2 D3 E3 .') },
      { notes: bars('.:2 G4 .:3 G4 .', '.:2 C#5 .:3 C#5 .', '.:2 G4 .:3 G4 .', '.:2 C#5 .:3 C#5 .', '.:2 E4 .:3 E4 .', '.:2 D5 .:3 D5 .', '.:2 C5 .:3 F#4 .', '.:2 B4 .:3 B4 .') },
    ],
    drums: 'k.h.s.h.k.hks.ho', drumStep: 0.5,
  },

  // Village-Braise: warm and Spanish-tinged at the foot of the volcano, castanets
  braise: {
    bpm: 104,
    voices: [
      { notes: bars('A5 B5 C6 B5 A5:2 E5:2', 'G5 A5 B5 A5 G5:2 D5:2', 'F5 G5 A5 G5 F5 E5 F5 A5', 'G#5:4 E5:2 .:2', 'E6:2 D6 C6 B5 C6 A5:2', 'D6:2 C6 B5 A5 B5 G5:2', 'C6 B5 A5 G5 F5 G5 A5 F5', 'E5:2 F5 E5 G#5:4') },
      { notes: bars('A2:2 E3 A3 A2:2 E3:2', 'G2:2 D3 G3 G2:2 D3:2', 'F2:2 C3 F3 F2:2 C3:2', 'E2:2 B2 E3 E2:2 G#2:2', 'A2:2 E3 A3 A2:2 E3:2', 'G2:2 D3 G3 G2:2 D3:2', 'F2:2 C3 F3 F2:2 C3:2', 'E2:2 B2 E3 E2:4') },
    ],
    drums: 'k.r.rrr.k.r.rrrr',
  },

  // Bourg-Paillette: twinkling stars, F lydian, celesta over a slow bass
  paillette: {
    bpm: 96,
    voices: [
      { echo: 2,
        notes: bars('C6:3 A5 F5:2 G5:2', 'B5:3 G5 D5:2 B4:2', 'C6:2 E6:2 A5:4', 'B5:4 D6:4', 'F6:3 E6 C6:2 A5:2', 'D6:3 B5 G5:2 D6:2', 'E6 D6 B5 G5 A5 C6 E6:2', 'F6:6 .:2') },
      { notes: bars('F2:8', 'G2:8', 'A2:8', 'G2:8', 'F2:8', 'G2:8', 'E2:4 A2:4', 'F2:8') },
      { notes: bars(arp('F5 A5 C6 E6', 16), arp('G5 B5 D6 G6', 16), arp('A5 C6 E6 A6', 16), arp('G5 B5 D6 G6', 16), arp('F5 A5 C6 E6', 16), arp('G5 B5 D6 G6', 16), `${arp('E5 G5 B5 E6', 8)} ${arp('A5 C6 E6 A6', 8)}`, arp('F5 A5 C6 F6', 16)) },
    ],
  },

  // Jardin-Gouache: a calm garden stroll, flowing arpeggios
  gouache: {
    bpm: 84, swing: 0.15,
    voices: [
      { notes: bars('A5:3 C6 F5:4', 'D5 F5 A5 D6 C6:2 A5:2', 'A#5:3 A5 G5:2 F5:2', 'E5:3 F5 G5:4', 'C6:3 A5 F5:2 C6:2', 'E6:2 C6 A5 E5:2 A5:2', 'D6 C6 A#5 A5 G5 A5 A#5 G5', 'F5:6 .:2') },
      { notes: bars(arp('F3 C4 A4 C4', 8, 1), arp('D3 A3 F4 A3', 8, 1), arp('A#2 F3 D4 F3', 8, 1), arp('C3 G3 E4 G3', 8, 1), arp('F3 C4 A4 C4', 8, 1), arp('A2 E3 C4 E3', 8, 1), `${arp('A#2 F3 D4 F3', 4, 1)} ${arp('C3 G3 E4 G3', 4, 1)}`, arp('F3 C4 A4 F4', 8, 1)) },
    ],
    drums: 'k...h...',
  },

  // Cité-Encre: night jazz with a walking bass and a swing
  encre: {
    bpm: 96, swing: 0.33,
    voices: [
      { notes: bars('.:2 A4 C5 D5:2 F5 E5', 'D5:3 B4 G4:2 .:2', '.:2 E5 G5 B5:2 A5 G5', 'C#5:4 E5:2 .:2', '.:2 F5 A5 C6:2 A5 F5', 'D5:3 F5 G#5:2 .:2', 'G5 E5 A#4 G5 C#5 E5 G5 A5', 'D5:6 .:2') },
      { notes: bars('D3:2 F3:2 A3:2 C4:2', 'G2:2 B2:2 D3:2 F3:2', 'C3:2 E3:2 G3:2 B3:2', 'A2:2 C#3:2 E3:2 G3:2', 'D3:2 E3:2 F3:2 A3:2', 'A#2:2 D3:2 F3:2 G#3:2', 'E3:2 A#2:2 A2:2 C#3:2', 'D3:2 A2:2 D3:4') },
      { notes: bars('F4:8', 'F4:8', 'E4:8', 'E4:8', 'F4:8', 'F4:8', 'D4:4 C#4:4', 'F4:8') },
    ],
    drums: 'k.h.r.hhk.h.r.hh',
  },

  // Place des Chefs-d’Œuvre: a grand march in C
  galerie: {
    bpm: 104,
    voices: [
      { notes: bars('C5:2 E5 G5 C6:3 G5', 'A5:2 F5 A5 C6:4', 'B5:2 D6:2 G5:4', 'E6:3 D6 C6:4', 'C6:2 E6 C6 A5:3 E5', 'F5:2 A5 C6 A5:4', 'G5 B5 D6 F6 D6:2 B5:2', 'C6:6 .:2') },
      { notes: bars('C3:2 G2:2 C3:2 G2:2', 'F2:2 C3:2 F2:2 C3:2', 'G2:2 D3:2 G2:2 D3:2', 'C3:2 G2:2 C3:2 G2:2', 'A2:2 E3:2 A2:2 E3:2', 'F2:2 C3:2 F2:2 C3:2', 'G2:2 D3:2 G2:2 B2:2', 'C3:4 G2:2 C3:2') },
      { notes: bars('E4:8', 'F4:8', 'D4:8', 'E4:8', 'E4:8', 'F4:8', 'F4:4 D4:4', 'E4:8') },
    ],
    drums: `${rep('k.s.k.s.', 7)} k.ssk.ss`,
  },

  // F major with a shuffle: bouncy staccato tune, boom-chick bass, off-beat chords
  town: {
    bpm: 100, swing: 0.3,
    voices: [
      {
        notes: bars(
          'C5 F5 A5:2 G5 F5 . A4', 'D5 F5 A5:2 G5 F5 D5:2', 'D5 G5 A#5:2 A5 G5 D5:2', 'E5 G5 C6:2 A#5 G5 E5 C5',
          'F5 A5 C6 A5 F5:2 C5:2', 'D6 C6 A#5 A5 A#5:2 F5:2', 'E5 G5 A#5 G5 E5 C5 D5 E5', 'F5:4 .:2 E5 C5',
        ),
      },
      {
        notes: bars(
          'F2 . C3 . F3 . C3 .', 'D2 . A2 . D3 . A2 .', 'G2 . D3 . G3 . D3 .', 'C3 . G2 . A#2 . G2 .',
          'F2 . C3 . F3 . C3 .', 'A#2 . F3 . A#3 . F3 .', 'C3 . E3 . G3 . A#3 .', 'F2 . C3 . F2:2 .:2',
        ),
      },
      {
        notes: bars(
          '. A4 . C5 . A4 . C5', '. F4 . A4 . F4 . A4', '. A#4 . D5 . A#4 . D5', '. A#4 . E5 . A#4 . E5',
          '. A4 . C5 . A4 . C5', '. D5 . F5 . D5 . F5', '. A#4 . E5 . A#4 . E5', '. A4 . C5 . A4:3',
        ),
      },
    ],
    drums: 'k..hs.hhk.khs..h',
  },

  // G mixolydian (F naturals): an adventurous walk, then a wider B part in E minor
  route: {
    bpm: 138,
    voices: [
      {
        notes: bars(
          'D5 G5 B5:2 A5 G5 D5:2', 'C5 F5 A5:2 G5 F5 C5:2', 'E5 G5 C6:3 B5 A5 G5', 'F#5:2 A5:2 D6:3 .',
          'B5 A5 G5 D5 G5:2 B5:2', 'C6 A5 F5 C5 F5:2 A5:2', 'G5 E5 C5 E5 F#5 A5 D6 C6', 'B5:4 G5:2 .:2',
          'E5:3 F#5 G5:2 B5:2', 'C6:3 B5 A5:2 G5:2', 'B5 D6 B5 G5 D5:2 G5:2', 'F#5:4 A5:2 D5:2',
          'G5:3 F#5 E5:2 B4:2', 'C5 E5 G5 C6 B5:2 G5:2', 'A5 C6 E6 C6 D6:2 F#5:2', 'G5:6 .:2',
        ),
      },
      {
        notes: bars(
          drive('G2', 'D3'), drive('F2', 'C3'), drive('C3', 'G3'), drive('D3', 'A3'),
          drive('G2', 'D3'), drive('F2', 'C3'), 'C3 C3 G3 C3 D3 D3 A3 D3', drive('G2', 'D3'),
          drive('E2', 'B2'), drive('C3', 'G3'), drive('G2', 'D3'), drive('D3', 'A3'),
          drive('E2', 'B2'), drive('C3', 'G3'), 'A2 A2 E3 A2 D3 D3 A3 D3', 'G2 G2 D3 G2 G2:4',
        ),
      },
      {
        notes: bars(
          'B4:8', 'A4:8', 'G4:8', 'A4:8', 'B4:8', 'A4:8', 'G4:4 F#4:4', 'G4:8',
          'G4:8', 'E4:8', 'D4:8', 'F#4:8', 'B4:8', 'G4:8', 'A4:4 F#4:4', 'B4:8',
        ),
      },
    ],
    drums: `${rep('k.h.s.h.k.k.s.h.', 7)} k.h.s.h.k.s.sss.`,
  },

  // D dorian, slow and sparse: a lonely melody with an echo, water drops, tom drips
  cave: {
    bpm: 80,
    voices: [
      {
        echo: 3,
        notes: bars('A4:3 D5 F5:2 E5:2', 'E5:4 G4:2 .:2', 'B4:3 D5 G5:2 F5 E5', 'D5:6 .:2', 'F5:3 A5 C6:2 A5:2', 'A5:3 G5 F5:2 C5:2', 'B4:2 D5:2 C5:2 E5:2', 'D5:6 .:2'),
      },
      { notes: bars('D2:8', 'C2:8', 'G2:8', 'D2:8', 'D2:8', 'F2:8', 'G2:4 A2:4', 'D2:8') },
      { echo: 2, notes: bars('.:5 A5 .:2', '.:6 G5 .', '.:3 D6 .:4', '.:8', '.:5 C6 .:2', '.:6 A5 .', '.:2 E6 .:5', '.:8') },
    ],
    drums: 't.......t...r...',
  },

  // Team Gomme hideouts: tiptoeing chromatic steps over a tritone bass, wobbly out-of-tune lead
  // and whole-tone pads that never settle
  gomme: {
    bpm: 118,
    voices: [
      {
        detune: 22,
        notes: bars(
          '.:2 E5 F5 .:2 E5 D#5', 'E5 .:3 G5 F#5 F5 E5', '.:2 F5 F#5 .:2 F5 E5', 'A#5:2 . A5 .:2 E5:2',
          '.:2 G5 G#5 .:2 G5 F#5', 'C6:2 B5 A#5 A5:2 .:2', 'F5 E5 F5 E5 F5:2 B5:2', 'E5:3 .:3 B4 C5',
        ),
      },
      {
        notes: bars(
          'E2 . E3 . A#2 . B2 .', 'E2 . E3 . A#2 . B2 .', 'F2 . F3 . B2 . C3 .', 'E2 . E3 . A#2 . B2 .',
          'G2 . G3 . C#3 . D3 .', 'F#2 . F#3 . C3 . C#3 .', 'F2 . F3 . B2 . C3 .', 'E2 . A#2 . E2 .:3',
        ),
      },
      { notes: bars('A#4:8', 'G#4:8', 'F#4:8', 'E4:8', 'D5:8', 'C5:8', 'A#4:8', 'E4:4 .:4') },
    ],
    drums: 'k..r..h.k.r...h.',
  },

  // the blank page: C lydian (F#), floating sine melody with long echoes, no drums
  edge: {
    bpm: 66,
    voices: [
      { echo: 4, notes: bars('G5:4 F#5:2 E5:2', 'D5:6 A4:2', 'B4:4 C5:2 E5:2', 'F#5:8', 'G5:3 A5 B5:2 G5:2', 'F#5:4 D5:4', 'E5:3 D5 C5:2 E5:2', 'D5:8') },
      { notes: bars('C3:8', 'C3:8', 'E3:8', 'D3:8', 'C3:8', 'B2:8', 'A2:8', 'D3:8') },
      { notes: bars('E4:8', 'F#4:8', 'G4:8', 'A4:8', 'E4:8', 'D4:8', 'C4:8', 'F#4:8') },
    ],
  },

  // a cosy waltz in B flat (oom-pah-pah)
  center: {
    bpm: 120, bar: 6,
    voices: [
      {
        notes: bars(
          'F5:2 A#5:2 D6:2', 'C6:3 A#5 F5:2', 'G5:2 A#5:2 D#6:2', 'D6:4 .:2', 'D6:2 C6 A#5 G5:2', 'D#5:2 G5:2 C6:2', 'A5:2 G5 F5 D#5 C5', 'F5:4 .:2',
          'F5:2 A#5:2 D6:2', 'F6:3 D6 A#5:2', 'G5:2 A#5:2 D#6:2', 'F#5:3 D#5 A#4:2', 'D5:2 F5:2 A#5:2', 'A#5:3 A5 G5:2', 'D#5:2 G5 A5 C6:2', 'A#5:4 .:2',
        ),
      },
      {
        notes: bars(
          'A#2:2 .:4', 'F2:2 .:4', 'D#2:2 .:4', 'A#2:2 .:4', 'G2:2 .:4', 'C3:2 .:4', 'F2:2 .:4', 'C3:2 .:4',
          'A#2:2 .:4', 'F2:2 .:4', 'D#2:2 .:4', 'D#2:2 .:4', 'A#2:2 .:4', 'G2:2 .:4', 'C3:2 F2:2 .:2', 'A#2:2 F2:2 A#2:2',
        ),
      },
      {
        notes: bars(
          '.:2 D4:2 F4:2', '.:2 D4:2 F4:2', '.:2 G4:2 A#4:2', '.:2 D4:2 F4:2', '.:2 A#3:2 D4:2', '.:2 D#4:2 G4:2', '.:2 A3:2 C4:2', '.:2 A3:2 D#4:2',
          '.:2 D4:2 F4:2', '.:2 D4:2 F4:2', '.:2 G4:2 A#4:2', '.:2 F#4:2 A#4:2', '.:2 D4:2 F4:2', '.:2 A#3:2 D4:2', '.:2 D#4 . A3 .', '.:2 D4:2 F4:2',
        ),
      },
    ],
    drums: 'k.h.h.',
  },

  // inside the Ateliers: driving, but not a battle yet
  atelier: {
    bpm: 128,
    voices: [
      { notes: bars('E5 A5 C6 A5 E5 A5 C6 E6', 'F5 A5 C6 A5 F5 A5 C6 F6', 'E5 G5 C6 G5 E5 G5 C6 E6', 'D5 G5 B5 G5 D6:2 B5:2', 'A5:2 C6:2 E6:2 A5:2', 'F5:2 A5:2 C6:2 F5:2', 'G#5 B5 E6 B5 G#5 E5 G#5 B5', 'E6:4 .:2 E5:2') },
      { notes: bars(oct('A2'), oct('F2'), oct('C3'), oct('G2'), oct('A2'), oct('F2'), oct('E2'), oct('E2')) },
    ],
    drums: 'k.h.s.hkk.h.s.h.',
  },

  // the rival: cheeky and sure of himself, E major
  rival: {
    bpm: 152,
    voices: [
      { notes: bars('B4 E5 G#5 B5:2 G#5 E5:2', 'C#6:2 B5 G#5 E5:2 C#5:2', 'A5 C#6 E6:2 C#6 A5 E5:2', 'D#6:3 C#6 B5:4', 'E6 D#6 E6 B5 G#5:2 E5:2', 'D#5 F#5 B5 D#6 C#6:2 B5:2', 'A5 G#5 F#5 E5 F#5 G#5 A5 B5', 'E6:4 B5:2 E5:2') },
      { notes: bars(gallop('E2'), gallop('C#2'), gallop('A2'), gallop('B2'), gallop('E2'), gallop('G#2'), `${oct('A2', 4)} ${oct('B2', 4)}`, 'E2 E2:.5 E2:.5 E3 E2 E2:4') },
      { notes: bars(stab('G#4', 'B4'), stab('E4', 'G#4'), stab('C#5', 'E5'), stab('D#5', 'F#4'), stab('G#4', 'B4'), stab('D#5', 'B4'), stab('C#5', 'D#5'), stab('G#4', 'E4')) },
    ],
    drums: 'k.hsk.hsk.hsk.ss',
  },

  // B minor, fast: a burst of sixteenths, syncopated stabs
  wild: {
    bpm: 158,
    voices: [
      {
        notes: bars(
          'B4:.5 C#5:.5 D5:.5 F#5:.5 B5:2 A5 F#5 D5:2', 'G5:2 F#5 E5 D5 E5 G5:2', 'A5:.5 G5:.5 F#5:.5 E5:.5 C#5:2 E5 A5 C#6:2', 'A#5:3 C#6 A#5:2 F#5:2',
          'D6:.5 C#6:.5 B5 F#5 D5 B4:2 D5 F#5', 'G5 B5 D6 B5 G5:2 E5:2', 'E5 G5 B5 G5 F#5 A#5 C#6 E6', 'D6:2 B5:2 F#5:.5 E5:.5 D5:.5 C#5:.5 B4:2',
        ),
      },
      { notes: bars(oct('B2'), oct('G2'), oct('A2'), oct('F#2'), oct('B2'), oct('G2'), `${oct('E2', 4)} ${oct('F#2', 4)}`, oct('B2')) },
      { notes: bars(stab('D5'), stab('B4'), stab('C#5'), stab('A#4'), stab('D5'), stab('B4'), stab('G4', 'A#4'), stab('D5', 'F#4')) },
    ],
    drums: 'kkhsk.hskkhsk.ss',
  },

  // D minor trainer battle with a running bass and chord stabs
  trainer: {
    bpm: 164,
    voices: [
      {
        notes: bars(
          'D5 F5 A5 D6 C6 A5 F5 A5', 'G5 A5 A#5 A5 G5 F5 E5 C5', 'D5 F5 A5 D6 E6 D6 C6 A5', 'A#5 A5 G5 E5 F5:4',
          'A#5 A5 G5 F5 E5 F5 G5 A5', 'C6 A#5 A5 G5 F5 E5 D5 E5', 'F5 G5 A5 C6 D6 C6 A5 F5', 'E5 C#5 E5 A5 D5:4',
        ),
      },
      {
        notes: bars(
          oct('D3'), `${oct('G2', 4)} ${oct('C3', 4)}`, `${oct('D3', 4)} ${oct('A2', 4)}`, 'A#2 A#3 C3 C4 F3 F4 F3 F4',
          `${oct('A#2', 4)} ${oct('C3', 4)}`, `${oct('F3', 4)} ${oct('G3', 4)}`, `${oct('D3', 4)} ${oct('A#2', 4)}`, `${oct('A2', 4)} ${oct('D3', 4)}`,
        ),
      },
      {
        notes: bars(stab('F4'), stab('A#4', 'E4'), stab('F4', 'E4'), stab('D4', 'F4'), stab('D4', 'E4'), stab('A4', 'B4'), stab('F4', 'D4'), stab('C#4', 'D4')),
      },
    ],
    drums: 'k.hsk.hsk.hsk.ss',
  },

  // Team Gomme battles: diminished (octatonic) runs, tritone leaps, out-of-tune sawtooth, pounding drums
  gommeBattle: {
    bpm: 156,
    voices: [
      {
        detune: 14,
        notes: bars(
          'A5 C6 A5 D#5 E5 .:3', 'A5:.5 A#5:.5 A5 G5 E5 D#5:2 C5:2', 'C6 D#6 C6 F#5 G5 .:3', 'C6:.5 C#6:.5 C6 A#5 G5 F#5:2 D#5:2',
          'D#5:2 F#5:2 A5:2 C6:2', 'D#6:3 C6 A5:2 F#5:2', 'F#5 G5 F#5 F5 E5 D#5 D5 C#5', 'E5:4 G#5:2 A#5:2',
        ),
      },
      {
        notes: bars(oct('A2'), 'A2 A3 A2 A3 D#3 D#2 E3 E2', oct('C3'), 'C3 C4 C3 C4 F#3 F#2 G3 G2', oct('D#3'), 'D#3 D#2 D#3 D#2 C3 C2 A2 A3', 'F#2 F#3 F#2 F#3 F2 F3 E2 E3', 'E2 E3 E2 E3 E2 E3 G#2 A#2'),
      },
      { notes: bars('.:2 D#5 .:3 D#5 .', '.:2 D#5 .:3 D#5 .', '.:2 F#5 .:3 F#5 .', '.:2 F#5 .:3 F#5 .', '.:2 A5 .:3 A5 .', '.:2 A5 .:3 A5 .', '.:2 C6 .:3 C6 .', '.:2 D6 .:3 D6 .') },
    ],
    drums: 'k.s.kks.k.s.kkss',
  },

  // Atelier Masters: E major and proud, galloping bass, power-chord pads, crash on every phrase
  leader: {
    bpm: 172,
    voices: [
      {
        notes: bars(
          'E5:2 B5:2 G#5 B5 E6:2', 'D6:3 C#6 B5:2 A5:2', 'A5 C#6 E6:2 C#6 A5 E5:2', 'G#5:4 B5:4',
          'C#6:2 B5 G#5 E5:2 G#5:2', 'A5:2 C#6:2 E6:2 C#6:2', 'D#6:3 C#6 B5:2 F#5:2', 'B5:.5 C#6:.5 D#6:.5 E6:.5 F#6:2 D#6:2 B5:2',
          'E6:4 B5:2 G#5:2', 'D#6:3 B5 G#5:2 D#5:2', 'C#6:2 B5 A5 E5:2 A5:2', 'G#5:3 A5 B5:2 E6:2',
          'F#5:2 A5:2 C#6:2 A5:2', 'E6:3 D6 C#6:2 A5:2', 'B5 C#6 D#6 E6 F#6:2 D#6:2', 'E6:6 .:2',
        ),
      },
      {
        notes: bars(
          gallop('E2'), gallop('D2'), gallop('A2'), gallop('E2'), gallop('C#2'), gallop('A2'), gallop('B2'), gallop('B2'),
          gallop('E2'), gallop('G#2'), gallop('A2'), gallop('E2'), gallop('F#2'), gallop('A2'), gallop('B2'), 'E2 E2:.5 E2:.5 E3 E2 E2:4',
        ),
      },
      {
        notes: bars(
          'B4:8', 'A4:8', 'E5:8', 'B4:8', 'G#4:8', 'E5:8', 'F#4:4 A4:4', 'D#5:8',
          'B4:8', 'D#5:8', 'E5:8', 'B4:8', 'C#5:8', 'E5:8', 'F#5:4 A5:4', 'G#4:4 B4:4',
        ),
      },
    ],
    drums: `c.hsk.hs | ${rep('k.hskkhs', 6)} | k.sssssc | c.hsk.hs | ${rep('k.hskkhs', 6)} | kssskscc`,
  },

  // the Great Eraser: C harmonic minor and a pounding tonic, then a desperate climb through A flat and B flat
  final: {
    bpm: 150,
    voices: [
      {
        notes: bars(
          'C5 D#5 G5 C6 B5 G5 D#5 G5', 'G#5 G5 F5 D#5 D5 D#5 F5 D5', 'C5 D#5 G5 C6 D6 C6 B5 G5', 'G#5 G5 F5 D5 G5:4',
          'D#6 D6 C6 G#5 G5 G#5 G5 F5', 'D#5 F5 G5 G#5 G5 F5 D#5 D5', 'C5 D5 D#5 F5 G5 G#5 B5 D6', 'C6:4 G5:4',
          'G#5:2 C6:2 D#6:2 C6:2', 'D6:3 C6 A#5:2 F5:2', 'G5:2 A#5:2 D#6:3 D6', 'D6:4 B5:2 G5:2',
          'G#5 G5 G#5 C6 D#6:2 C6:2', 'D6 C6 D6 F6 A#5:4', 'C6 D#6 G6 D#6 G#5 C6 D#6 C6', 'B5:2 D6:2 G6:2 F6 D6',
        ),
      },
      {
        notes: bars(
          oct('C3'), `${oct('F2', 4)} ${oct('G2', 4)}`, `${oct('C3', 4)} ${oct('G#2', 4)}`, `${oct('F2', 4)} ${oct('G2', 4)}`,
          `${oct('G#2', 4)} ${oct('D#3', 4)}`, `${oct('F2', 4)} ${oct('G2', 4)}`, `${oct('G#2', 4)} ${oct('G2', 4)}`, `${oct('C3', 4)} ${oct('G2', 4)}`,
          oct('G#2'), oct('A#2'), oct('D#2'), oct('G2'), oct('G#2'), oct('A#2'), `${oct('C3', 4)} ${oct('G#2', 4)}`, oct('G2'),
        ),
      },
      {
        detune: 8,
        notes: bars(
          'G4:8', 'C5:4 B4:4', 'G4:4 G#4:4', 'C5:4 B4:4', 'C5:4 A#4:4', 'C5:4 B4:4', 'D#5:4 D5:4', 'D#5:4 D5:4',
          'D#5:8', 'F5:8', 'G5:8', 'G5:8', 'D#5:8', 'F5:8', 'G5:4 D#5:4', 'F5:4 D5:4',
        ),
      },
    ],
    drums: `${rep('c.hsk.hsk.hsk.ks', 3)} k.hskshsk.sssscs | ${rep('k.hsk.hsk.hsk.hs', 3)} kssskssskksskscc`,
  },

  // Grand Concours champion: a D major fanfare, bright and on the tonic
  champion: {
    bpm: 168,
    voices: [
      {
        notes: bars(
          'D5:.5 D5:.5 D5 A5:2 F#5 A5 D6:2', 'B5:3 A5 G5:2 D5:2', 'E5:.5 E5:.5 E5 C#6:2 A5 C#6 E6:2', 'F#6:4 D6:4',
          'D6:2 C#6 B5 F#5:2 B5:2', 'G5 B5 D6 G6:2 D6 B5 G5', 'E6:2 D6 B5 C#6:2 A5 E5', 'D6:6 .:2',
          'B5:2 D6:2 G6:2 D6:2', 'C#6:3 B5 A5:2 E5:2', 'F#5:2 A5:2 C#6:3 B5', 'D6:4 B5:4',
          'D6 C#6 B5 A5 G5:2 B5:2', 'C#6 D6 E6 F#6 E6:2 C#6:2', 'D6 B5 G5 B5 C#6 E6 A6:2', 'F#6:2 D6:2 A5 D6:3',
        ),
      },
      {
        notes: bars(
          gallop('D2'), gallop('G2'), gallop('A2'), gallop('D2'), gallop('B2'), gallop('G2'), `${oct('E2', 4)} ${oct('A2', 4)}`, gallop('D2'),
          gallop('G2'), gallop('A2'), gallop('F#2'), gallop('B2'), gallop('G2'), gallop('A2'), `${oct('G2', 4)} ${oct('A2', 4)}`, 'D2 D2:.5 D2:.5 D3 D2 D2:4',
        ),
      },
      {
        notes: bars(
          'F#4:4 A4:4', 'D5:4 B4:4', 'C#5:4 E5:4', 'A4:4 F#4:4', 'F#4:4 D5:4', 'B4:4 D5:4', 'G4:4 A4:4', 'F#4:8',
          'D5:4 B4:4', 'E5:4 C#5:4', 'C#5:4 A4:4', 'F#4:4 B4:4', 'B4:4 G4:4', 'A4:4 C#5:4', 'B4:4 C#5:4', 'A4:4 F#4:4',
        ),
      },
    ],
    drums: `c.hsk.hs | ${rep('k.hsk.hs', 6)} | k.ssk.sc | c.hsk.hs | ${rep('k.hsk.hs', 6)} | sssssscc`,
  },

  // a lullaby in 6/8: music-box melody with an echo over rocking arpeggios
  ending: {
    bpm: 100, bar: 6,
    voices: [
      {
        echo: 3,
        notes: bars(
          'E5:2 G5 C6:3', 'B5:2 A5 E5:3', 'F5:2 A5 C6:2 A5', 'G5:3 D5:3', 'E5:2 G5 C6:2 D6', 'E6:3 B5:3', 'A5:2 F5 D5:2 B4', 'C5:6',
          'C6:2 A5 F5:2 A5', 'G5:2 E5 C5:3', 'D5:2 F5 A5:2 D6', 'B5:3 G5:3', 'C6:2 B5 A5:2 E5', 'F5:2 A5 C6:3', 'B5:2 F5 D5:2 G5', 'E5:2 D5 C5:3',
        ),
      },
      {
        notes: bars(
          'C3:3 G3:3', 'A2:3 E3:3', 'F2:3 C3:3', 'G2:3 D3:3', 'C3:3 G3:3', 'E2:3 B2:3', 'F2:3 G2:3', 'C3:6',
          'F2:3 C3:3', 'C3:3 G3:3', 'D3:3 A3:3', 'G2:3 D3:3', 'A2:3 E3:3', 'F2:3 C3:3', 'G2:3 F3:3', 'C3:6',
        ),
      },
      {
        notes: bars(
          arp('C4 E4 G4', 6, 1), arp('A3 C4 E4', 6, 1), arp('F3 A3 C4', 6, 1), arp('G3 B3 D4', 6, 1), arp('C4 E4 G4', 6, 1), arp('E3 G3 B3', 6, 1), `${arp('F3 A3 C4', 3, 1)} ${arp('G3 B3 D4', 3, 1)}`, arp('C4 E4 G4', 6, 1),
          arp('F3 A3 C4', 6, 1), arp('C4 E4 G4', 6, 1), arp('D4 F4 A4', 6, 1), arp('G3 B3 D4', 6, 1), arp('A3 C4 E4', 6, 1), arp('F3 A3 C4', 6, 1), arp('G3 B3 F4', 6, 1), arp('C4 E4 G4', 6, 1),
        ),
      },
    ],
  },
};

/** Jingles: two bars at most, played once. */
const JINGLES: Record<JingleId, Track> = {
  // a new badge: a proud fanfare
  badge: {
    bpm: 120,
    voices: [
      { notes: bars('C5 E5 G5 C6:2 G5 C6:2', 'E6:6 .:2') },
      { notes: bars('C3:2 G3:2 C3:2 G3:2', 'C3:6 .:2') },
      { notes: bars('E4:4 G4:4', 'G4:6 .:2') },
    ],
    drums: 'k.s.k.ssc.......',
  },
  // something found
  item: {
    bpm: 160,
    voices: [
      { notes: 'G5 B5 D6 G6:4 .' },
      { notes: 'G3:3 D4:4 .' },
    ],
  },
  // a Bestiole caught
  caught: {
    bpm: 140,
    voices: [
      { notes: bars('C5 E5 G5 E5 C6:2 G5:2', 'E6:4 .:4') },
      { notes: bars('C3:2 E3:2 G3:2 E3:2', 'C3:4 .:4') },
    ],
    drums: 'k.h.k.h.c.......',
  },
  // a trainer (or a wild Bestiole) beaten
  victory: {
    bpm: 150,
    voices: [
      { notes: bars('G5 A5 B5 D6 C6 B5 A5 G5', 'C6:2 E6:2 G6:4') },
      { notes: bars('G2:2 D3:2 G2:2 D3:2', 'C3:2 G3:2 C4:4') },
    ],
    drums: 'k.hsk.hsk.s.c...',
  },
  // an evolution
  evolved: {
    bpm: 132,
    voices: [
      { notes: bars('E5 G#5 B5 E6 D#6 B5 G#5 B5', 'E6:6 .:2') },
      { notes: bars('E3:4 B3:4', 'E3:6 .:2') },
    ],
  },
  // the Inn: everyone feels better
  heal: {
    bpm: 110,
    voices: [
      { notes: bars('G5:2 C6 E6 G6:2 E6:2', 'C6:4 .:4') },
      { notes: bars('C4:4 E4:4', 'G3:4 .:4') },
    ],
  },
};

/** "C#5" → frequency; "." → null. */
function freq(n: string): number | null {
  if (n === '.') return null;
  const m = /^([A-G]#?)(\d)$/.exec(n);
  if (!m) return null;
  const midi = (Number(m[2]) + 1) * 12 + NOTE[m[1]];
  return 440 * 2 ** ((midi - 69) / 12);
}

/** Parses a pattern into [frequency|null, length in eighths]. */
export function parse(pattern: string): [number | null, number][] {
  return pattern
    .split(/\s+/)
    .filter((t) => t && t !== '|')
    .map((t) => {
      const [n, len] = t.split(':');
      return [freq(n), len ? Number(len) : 1];
    });
}

/** Total length in eighths (every voice of a track must last as long). */
export const lengthOf = (pattern: string) => parse(pattern).reduce((a, [, l]) => a + l, 0);
const drumHits = (t: Track) => (t.drums ?? '').replace(/[\s|]/g, '');

export function trackIds(): TrackId[] {
  return Object.keys(TRACKS) as TrackId[];
}
export function jingleIds(): JingleId[] {
  return Object.keys(JINGLES) as JingleId[];
}
const tune = (id: TrackId | JingleId): Track => (id in TRACKS ? TRACKS[id as TrackId] : JINGLES[id as JingleId]);
/** Lengths in eighths of each voice and of the drum loop, plus the bar length (tests). */
export function trackLengths(id: TrackId | JingleId): { voices: number[]; drums: number; bar: number; bars: number[][] } {
  const t = tune(id);
  return {
    voices: t.voices.map((v) => lengthOf(v.notes)),
    drums: drumHits(t).length * (t.drumStep ?? 1),
    bar: t.bar ?? 8,
    bars: t.voices.map((v) => v.notes.split('|').map(lengthOf)),
  };
}
/** Notes used by a tune (tests: every one must be readable). */
export function trackNotes(id: TrackId | JingleId): string[] {
  return tune(id).voices.flatMap((v) => v.notes.split(/[\s|]+/).filter(Boolean).map((t) => t.split(':')[0]));
}

let ctx: AudioContext | null = null;
/** The music's volume (fades move it), through a gentle compressor. */
let master: GainNode | null = null;
/** The room every note plays in: straight through a little warmth (`dry`), and into its reverb (`wet`). */
let room: { dry: BiquadFilterNode; wet: GainNode } | null = null;
/**
 * Where the notes of the tune playing go, on their way to the room. Each tune gets a new lane, so
 * stopping cuts the notes already scheduled while the room rings out.
 */
let lane: { dry: GainNode; wet: GainNode } | null = null;
let current: TrackId | null = null;
let timer: ReturnType<typeof setInterval> | null = null;
let noise: AudioBuffer | null = null;

const LEVEL = 0.042;

function audio(): AudioContext | null {
  try {
    ctx ??= new AudioContext();
    if (ctx.state === 'suspended') void ctx.resume();
    if (!master) {
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -20;
      comp.ratio.value = 3;
      comp.attack.value = 0.01;
      comp.release.value = 0.2;
      comp.connect(ctx.destination);
      master = ctx.createGain();
      master.gain.value = LEVEL;
      master.connect(comp);
      const dry = ctx.createBiquadFilter();
      dry.type = 'lowpass';
      dry.frequency.value = 6500;
      dry.connect(master);
      const wet = ctx.createGain();
      wet.gain.value = 0.32;
      const reverb = ctx.createConvolver();
      reverb.buffer = roomEcho(ctx);
      wet.connect(reverb).connect(master);
      room = { dry, wet };
    }
    return ctx;
  } catch {
    return null;
  }
}

/** A small room's echo: two seconds of noise dying away, made once. */
function roomEcho(c: AudioContext): AudioBuffer {
  const len = Math.floor(c.sampleRate * 2.4);
  const b = c.createBuffer(2, len, c.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = b.getChannelData(ch);
    let prev = 0;
    for (let i = 0; i < len; i++) {
      // smoothed a little, so the echo sounds soft rather than hissy
      prev = prev * 0.55 + (Math.random() * 2 - 1) * Math.exp((-3.2 * i) / c.sampleRate) * 0.45;
      d[i] = prev;
    }
  }
  return b;
}

/** A new lane for a tune or a jingle, at full volume or rising from silence over `fadeIn` seconds. */
function openLane(c: AudioContext, fadeIn = 0) {
  closeLane();
  const dry = c.createGain(), wet = c.createGain();
  dry.connect(room!.dry);
  wet.connect(room!.wet);
  lane = { dry, wet };
  const g = master!.gain;
  g.cancelScheduledValues(c.currentTime);
  g.setValueAtTime(fadeIn > 0 ? 0.0001 : LEVEL, c.currentTime);
  if (fadeIn > 0) g.linearRampToValueAtTime(LEVEL, c.currentTime + fadeIn);
}

function closeLane() {
  lane?.dry.disconnect();
  lane?.wet.disconnect();
  lane = null;
}

/** Sends a note into the room, and into its reverb unless `wet` is false. */
function out(node: AudioNode, wet = true) {
  if (!lane) return;
  node.connect(lane.dry);
  if (wet) node.connect(lane.wet);
}

function osc(c: AudioContext, type: OscillatorType, f: number, cents = 0): OscillatorNode {
  const o = c.createOscillator();
  o.type = type;
  o.frequency.value = f;
  o.detune.value = cents;
  return o;
}

/** Played by hand, never quite in tune: a few cents either way. */
const wobble = (cents: number) => (Math.random() - 0.5) * cents;

/** [frequency ratio, level, how long it rings compared with the fundamental] */
type Overtone = [number, number, number];
const MUSIC_BOX: Overtone[] = [[1, 1, 1], [2, 0.22, 0.6], [4.2, 0.07, 0.3]];
const CHIME: Overtone[] = [[1, 1, 1], [2.76, 0.28, 0.5], [5.4, 0.08, 0.25]];

/**
 * A struck note that rings and fades away, the music box's and the chimes' (`ring`: seconds for a
 * C5, low notes ring longer). `detune` adds an out-of-tune double of the fundamental.
 */
function struck(c: AudioContext, f: number, t: number, dur: number, amp: number, tones: Overtone[], ring: number, detune = 0) {
  const decay = Math.min(ring * (523 / f) ** 0.35, dur * 2.5 + 0.35);
  const parts: [number, number, number, number][] = tones.map(([m, a, k]) => [m, a, k, wobble(9)]);
  if (detune) parts.push([1, 0.7, 1, detune]);
  for (const [m, a, k, cents] of parts) {
    const o = osc(c, 'sine', f * m, cents), g = c.createGain(), end = t + decay * k;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(amp * a, t + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, end);
    o.connect(g);
    out(g);
    o.start(t);
    o.stop(end + 0.02);
  }
}

const chime = (c: AudioContext, f: number, t: number, dur: number, amp: number, detune = 0) =>
  struck(c, f, t, dur, amp, CHIME, 1.2, detune);

/** A felt piano: a soft hammer, its tone darkening as the note fades, a short release. */
function piano(c: AudioContext, f: number, t: number, dur: number, amp: number) {
  const fl = c.createBiquadFilter();
  fl.type = 'lowpass';
  fl.Q.value = 0.6;
  fl.frequency.setValueAtTime(Math.min(1500, f * 8), t);
  fl.frequency.setTargetAtTime(Math.max(300, f * 1.5), t + 0.02, 0.35);
  const g = c.createGain(), end = t + Math.max(dur, 0.12);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(amp, t + 0.008);
  g.gain.setTargetAtTime(amp * 0.25, t + 0.01, 0.6);
  g.gain.setTargetAtTime(0.0001, end, 0.09);
  fl.connect(g);
  out(g);
  for (const [type, m, a, cents] of [['triangle', 1, 1, 0], ['sine', 1, 0.6, 5], ['sine', 2, 0.18, -3]] as const) {
    const o = osc(c, type, f * m, cents + wobble(6)), og = c.createGain();
    og.gain.value = a;
    o.connect(og).connect(fl);
    o.start(t);
    o.stop(end + 0.6);
  }
}

/** Plays one note of a voice: the melody on a music box, the bass on a felt piano, the harmony on chimes. */
function play(c: AudioContext, role: number, v: Voice, f: number, t: number, dur: number, soft = 1) {
  if (role === 0) struck(c, f, t, dur, soft, MUSIC_BOX, 1.7, v.detune);
  else if (role === 1) piano(c, f, t, dur, 0.85 * soft);
  else chime(c, f, t, dur, 0.42 * soft, v.detune);
}

/** A soft burst of filtered noise: brushes and shakers. */
function hiss(c: AudioContext, type: BiquadFilterType, hz: number, q: number, vol: number, attack: number, len: number, t: number) {
  if (!noise) {
    noise = c.createBuffer(1, c.sampleRate * 1.5, c.sampleRate);
    const d = noise.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const s = c.createBufferSource();
  s.buffer = noise;
  const f = c.createBiquadFilter();
  f.type = type;
  f.frequency.value = hz;
  f.Q.value = q;
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(vol, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + len);
  s.connect(f).connect(g);
  out(g);
  // from a different place in the noise each time, so no two hits sound the same
  s.start(t, Math.random() * 0.5);
  s.stop(t + len + 0.02);
}

/** Brushes, a shaker, a wood block and a little bell keep the beat, softly. */
function drum(c: AudioContext, kind: string, t: number) {
  const lvl = 0.45;
  if (kind === 'k' || kind === 't') {
    // a soft kick (dry), or a low tom ringing in the room: [from, to, glide, length, volume]
    const [from, to, glide, len, vol] = kind === 'k' ? [110, 48, 0.14, 0.18, 0.55] : [160, 100, 0.25, 0.3, 0.45];
    const o = osc(c, 'sine', from), g = c.createGain();
    o.frequency.setValueAtTime(from, t);
    o.frequency.exponentialRampToValueAtTime(to, t + glide);
    g.gain.setValueAtTime(vol * lvl, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + len);
    o.connect(g);
    out(g, kind === 't');
    o.start(t);
    o.stop(t + len + 0.02);
    return;
  }
  if (kind === 'r') {
    for (const [m, a] of [[1, 1], [1.5, 0.4]]) {
      const o = osc(c, 'sine', 950 * m), g = c.createGain();
      g.gain.setValueAtTime(0.22 * lvl * a, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
      o.connect(g);
      out(g);
      o.start(t);
      o.stop(t + 0.08);
    }
    return;
  }
  if (kind === 'c') {
    chime(c, 2093, t, 0.6, 0.25 * lvl);
    chime(c, 1568, t, 0.6, 0.18 * lvl);
    return;
  }
  // [filter, frequency, resonance, volume, attack, length]
  const [type, hz, q, vol, attack, len]: [BiquadFilterType, number, number, number, number, number] =
    kind === 'h' ? ['highpass', 7500, 0.7, 0.055, 0.006, 0.05]
      : kind === 'o' ? ['highpass', 6500, 0.7, 0.06, 0.01, 0.14]
        : ['bandpass', 2300, 0.8, 0.17, 0.012, 0.17];
  hiss(c, type, hz, q, vol * lvl, attack, len, t);
}

/** Length of one loop of a tune, in seconds. */
export function trackSeconds(id: TrackId | JingleId): number {
  const t = tune(id);
  return (lengthOf(t.voices[0].notes) * 60) / t.bpm / 2;
}

let startedAt = 0;

/** How far the playing tune is into its loop (seconds), 0 when nothing plays. */
export function musicPosition(): number {
  if (!ctx || !current || !timer) return 0;
  return Math.max(0, ctx.currentTime - startedAt) % trackSeconds(current);
}

/**
 * Starts a looping tune (no-op if it is already playing or music is off). `force`: the music box
 * plays even when the music option is off. `fadeIn`: seconds to rise from silence (the prologue).
 */
export function playMusic(id: TrackId, force = false, fadeIn = 0) {
  if (!force && (!prefs.value.music || !prefs.value.sound)) return stopMusic();
  if (current === id && timer) return;
  stopMusic();
  const c = audio();
  if (!c) return;
  openLane(c, fadeIn);
  current = id;
  const tr = TRACKS[id];
  const eighth = 60 / tr.bpm / 2;
  const swing = (tr.swing ?? 0) * eighth;
  const start = c.currentTime + 0.08;
  startedAt = start;
  // time of a position counted in eighths: off-beat eighths come a little late with a shuffle
  const at = (pos: number) => start + pos * eighth + (swing && Math.abs((pos % 2) - 1) < 1e-6 ? swing : 0);
  const voices = tr.voices.map((v, role) => ({ v, role, notes: parse(v.notes), i: 0, pos: 0 }));
  const drums = drumHits(tr);
  const step = tr.drumStep ?? 1;
  let drumI = 0;
  let drumPos = 0;
  const tick = () => {
    const horizon = c.currentTime + 0.25;
    for (const s of voices) {
      while (at(s.pos) < horizon) {
        const [f, len] = s.notes[s.i];
        const t0 = at(s.pos), t1 = at(s.pos + len);
        if (f) {
          play(c, s.role, s.v, f, t0, t1 - t0);
          if (s.v.echo) play(c, s.role, s.v, f, t0 + s.v.echo * eighth, t1 - t0, 0.3);
        }
        s.pos += len;
        s.i = (s.i + 1) % s.notes.length;
      }
    }
    if (drums) {
      while (at(drumPos) < horizon) {
        const k = drums[drumI];
        if (k !== '.') drum(c, k, at(drumPos));
        drumPos += step;
        drumI = (drumI + 1) % drums.length;
      }
    }
  };
  tick();
  timer = setInterval(tick, 60);
}

export function stopMusic() {
  if (timer) clearInterval(timer);
  timer = null;
  current = null;
  // cut the notes already scheduled
  closeLane();
}

/** Lowers the music to silence over `seconds`, then stops it (unless another tune started meanwhile). */
export function fadeOutMusic(seconds: number) {
  if (!master || !ctx || !timer) return stopMusic();
  const was = current, l = lane, g = master.gain;
  g.cancelScheduledValues(ctx.currentTime);
  g.setValueAtTime(g.value, ctx.currentTime);
  g.linearRampToValueAtTime(0.0001, ctx.currentTime + seconds);
  setTimeout(() => {
    if (current === was && lane === l) stopMusic();
  }, seconds * 1000);
}

let jingleTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Plays a jingle once over the music (which stops), then brings the music back (unless `resume` is
 * false or something else started meanwhile). With the music off, `fallback` (a short sound effect)
 * plays instead.
 */
export function playJingle(id: JingleId, opts: { fallback?: () => void; resume?: boolean; force?: boolean } = {}) {
  if (!opts.force && (!prefs.value.music || !prefs.value.sound)) {
    opts.fallback?.();
    return;
  }
  const back = opts.resume === false ? null : current ?? resumeAfter;
  stopMusic();
  const c = audio();
  if (!c) return;
  openLane(c);
  const tr = JINGLES[id];
  const eighth = 60 / tr.bpm / 2;
  const start = c.currentTime + 0.05;
  tr.voices.forEach((v, role) => {
    let pos = 0;
    for (const [f, len] of parse(v.notes)) {
      if (f) play(c, role, v, f, start + pos * eighth, len * eighth);
      pos += len;
    }
  });
  const hits = drumHits(tr);
  for (let i = 0; i < hits.length; i++) if (hits[i] !== '.') drum(c, hits[i], start + i * (tr.drumStep ?? 1) * eighth);
  resumeAfter = back;
  if (jingleTimer) clearTimeout(jingleTimer);
  jingleTimer = setTimeout(() => {
    jingleTimer = null;
    const again = resumeAfter;
    resumeAfter = null;
    if (!current && again) playMusic(again);
  }, (trackSeconds(id) + 0.4) * 1000);
}
/** The tune to bring back once the jingle is over. */
let resumeAfter: TrackId | null = null;

// browsers only start sound after a touch or a key press
if (typeof window !== 'undefined') {
  const unlock = () => void ctx?.resume();
  window.addEventListener('pointerdown', unlock, { passive: true });
  window.addEventListener('keydown', unlock);
}

export function currentTrack(): TrackId | null {
  return current;
}
