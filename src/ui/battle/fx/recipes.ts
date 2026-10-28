/**
 * The animation of every move, keyed by move id. A new move needs one here
 * (`src/ui/battle/fx/recipes.test.ts` fails without it).
 */
import type { Recipe } from './core';
import { at, INK, NEON, PAL as C, RAINBOW } from './core';
import { aura, doll, glare, orbit, powder, pulse, rise, scribble, shield, thread, vines, weatherIn } from './statusFx';
import {
  beam, bite, blaze, bolt, boo, breath, burrow, buzz, cracks, darken, drain, dust, eyes, fist, flash,
  gather, gust, hands, impactStar, jab, jet, notes, pop, projectile, rainOn, rings, rockfall, shade,
  slash, snip, sparkle, sparks, speedLines, spikes, splat, sweep, swirl, tongue, twirl, wave, whip, wrap,
} from './effects';

const CLAW = '#fdfdfd';
/** Status moves: the target doesn't flinch when the animation reaches it. */
const calm = (r: Recipe): Recipe => ({ hit: 'none', ...r });
const SKIN = '#f2c69a';
const BEAK = '#f2b33d';

export const MOVE_FX: Record<string, Recipe> = {
  // ------------------------------------------------ status moves
  grondement: { user: 'rear', hit: 'knock', layers: [notes({ colors: [C.normal[2], C.combat[2]], n: 4, size: 0.26 })] },
  fretillement: calm({ user: 'wiggle', layers: [sparkle({ who: 'user', kind: 'heart', color: C.fee[0], n: 4, size: 0.22 })] }),
  'gros-baillement': calm({ user: 'hop', layers: [rise({ kind: 'zzz', color: C.vol[2], n: 4 }), at(300, rise({ kind: 'plus', color: C.plante[1], n: 5 }))] }),
  'bouclier-papier': calm({ layers: [shield()] }),
  'pantin-papier': calm({ layers: [doll()] }),
  'cocon-serre': calm({ layers: [wrap({ who: 'user', color: '#f4efe4', loops: 5 })] }),
  'fil-de-soie': calm({ layers: [thread({ n: 4 }), at(300, wrap({ loops: 3, dur: 640 }))] }),
  'poudre-dodo': calm({ layers: [powder({ color: '#7aa8e8' })] }),
  'poudre-piquante': calm({ layers: [powder({ color: C.electrique[1] })] }),
  'poudre-toxique': calm({ layers: [powder({ color: C.poison[1] })] }),
  'poudre-arc-en-ciel': calm({ user: 'hop', layers: RAINBOW.slice(0, 5).map((c, i) => at(i * 90, rise({ kind: 'spark', color: c, n: 3, size: 0.2 }))) }),
  'jet-de-sable': calm({ layers: [breath({ kind: 'clod', colors: ['#c99a4e', '#a8793a'], n: 20, size: 0.2, spread: 0.2 })] }),
  'tempete-de-sable': calm({ user: 'hop', layers: [weatherIn({ kind: 'sable' })] }),
  grele: calm({ user: 'hop', layers: [weatherIn({ kind: 'grele' })] }),
  averse: calm({ user: 'hop', layers: [weatherIn({ kind: 'pluie' })] }),
  'grand-soleil': calm({ user: 'hop', layers: [weatherIn({ kind: 'soleil' })] }),
  'carapace-tambour': calm({ user: 'hop', layers: [pulse({ color: C.eau[1], n: 3, dur: 820 }), aura({ color: C.eau[0] })] }),
  'lueur-brulante': calm({ layers: [darken({ alpha: 0.2 }), projectile({ kind: 'flame', color: C.spectre[1], n: 3, gap: 120, size: 0.42, lift: 0.6, burst: false }), at(460, swirl({ kind: 'flame', color: C.spectre[1], n: 6, dur: 520, size: 0.36 }))] }),
  'graine-dodo': calm({ layers: [projectile({ kind: 'seed', color: '#7aa8e8', size: 0.32, burst: false }), at(380, rise({ who: 'target', kind: 'zzz', color: C.vol[2], n: 3 }))] }),
  'ronron-soleil': calm({ layers: [pop({ kind: 'sun', color: C.electrique[1], who: 'user', dy: -0.75, size: 0.5, dur: 820 }), at(200, rise({ kind: 'plus', color: C.plante[1], n: 6 }))] }),
  'graine-gourmande': calm({ layers: [projectile({ kind: 'seed', color: C.plante[2], size: 0.3, burst: false }), at(380, vines())] }),
  frisson: calm({ layers: [sparks({ n: 5, dur: 720 })] }),
  'agilite-zigzag': calm({ user: 'zigzag', layers: [speedLines({ n: 12, dur: 620 }), at(120, speedLines({ n: 8, dur: 500 }))] }),
  berceuse: calm({ layers: [notes({ colors: [C.fee[1], C.vol[1]], n: 6, size: 0.26, dur: 1000 })] }),
  'chanson-douce': calm({ layers: [notes({ colors: [C.fee[1], C.fee[2]], kind: 'heart', n: 6, size: 0.24 })] }),
  'calin-lunaire': calm({ layers: [darken({ color: '#2a3366', alpha: 0.25 }), pop({ kind: 'moon', color: '#f7e6a0', who: 'user', dy: -0.75, size: 0.5, dur: 820 }), at(250, rise({ kind: 'spark', color: '#f7e6a0', n: 6 }))] }),
  'bisou-magique': calm({ layers: [projectile({ kind: 'heart', color: C.fee[1], n: 3, gap: 100, size: 0.26, lift: 0.4, burst: 'heart' })] }),
  brouillard: calm({ layers: [breath({ kind: 'puff', colors: ['#cfcad8', '#b9b2c8'], n: 14, size: 0.4, spread: 0.25 })] }),
  'regard-hypnotique': calm({ layers: [darken({ alpha: 0.25 }), rings({ colors: [C.psy[1], C.spectre[1]], n: 5 }), at(360, eyes({ dur: 600 }))] }),
  grimace: calm({ layers: [glare()] }),
  'rire-sinistre': calm({ layers: [darken({ alpha: 0.25 }), scribble({ text: 'hi hi', color: C.spectre[2] }), at(200, orbit({ who: 'target', kind: 'star', color: C.spectre[0], n: 3 }))] }),
  'encre-toxique': calm({ layers: [projectile({ kind: 'ink', color: C.poison[2], n: 2, gap: 100, size: 0.3, burst: false }), at(360, splat({ color: C.poison[2], size: 0.6 }))] }),

  // ------------------------------------------------ Normal
  bousculade: { user: 'dash', layers: [speedLines(), at(170, impactStar())] },
  griffe: { user: 'lunge', layers: [slash({ color: CLAW })] },
  'pas-de-loup': { user: 'dash', layers: [speedLines({ n: 11, dur: 360 }), at(130, impactStar({ size: 0.42 }))] },
  'coup-de-boule': { user: 'rear', hit: 'knock', layers: [at(330, impactStar({ size: 0.62 }))] },
  'plat-du-ventre': { user: 'dash', hit: 'squash', shake: 0.6, layers: [speedLines(), at(190, impactStar({ size: 0.75 })), at(190, dust({ n: 7 }))] },
  ronflement: { user: 'shake', layers: [notes({ colors: [C.normal[2], C.vol[2]], kind: 'zzz', n: 5, size: 0.24 }), at(460, impactStar({ size: 0.35 }))] },
  'grosse-voix': { user: 'rear', shake: 0.4, layers: [notes({ colors: [C.normal[2], C.psy[1], C.combat[1]], n: 7, size: 0.27 }), at(470, impactStar({ size: 0.42 }))] },
  picore: { user: 'lunge', layers: [jab({ color: BEAK, n: 2 })] },
  lutte: { user: 'dash', layers: [speedLines(), at(170, impactStar({ color: C.normal[0] }))] },

  // ------------------------------------------------ Flying
  rafale: { layers: [gust({ n: 3 })] },
  'bec-vrille': { user: 'dash', layers: [jab({ color: BEAK, n: 1, size: 0.58, drill: true }), at(160, impactStar({ size: 0.55 }))] },
  'grand-vol': {
    user: 'drop', shake: 0.5,
    layers: [speedLines({ who: 'target', down: true, n: 9, dur: 360 }), at(300, impactStar({ size: 0.72 }))],
    charge: { user: 'rise', layers: [dust({ who: 'user', n: 5 }), sparkle({ who: 'user', kind: 'feather', color: C.vol[0], n: 5, size: 0.28 })] },
  },
  'coup-d-ailes': { layers: [gust({ n: 3, bits: 'feather', bitColor: C.vol[0] })] },

  // ------------------------------------------------ Grass
  'coup-de-liane': { layers: [whip({ color: C.plante[1], kind: 'vine' })] },
  'griffe-pousse': { user: 'lunge', layers: [slash({ color: C.plante[1] }), at(400, drain({ color: C.plante[1] }))] },
  'feuille-coupante': { layers: [projectile({ kind: 'leaf', color: [C.plante[1], C.plante[0]], n: 5, gap: 60, spin: 2, size: 0.32, spread: 0.45 })] },
  'rafale-de-graines': { layers: [projectile({ kind: 'seed', color: '#b07a3c', n: 9, gap: 50, size: 0.2, spread: 0.6, fly: 320, burst: 'clod' })] },
  'rayon-de-soleil': {
    layers: [pop({ kind: 'sun', color: C.electrique[1], who: 'user', size: 0.6, dur: 520, dy: -0.6 }), at(160, beam({ colors: [C.electrique[1]], width: 0.26, dur: 820, glow: 'sun' })), at(160, flash({ color: C.electrique[0], alpha: 0.35 }))],
    charge: { layers: [gather({ color: C.electrique[0] })] },
  },

  // ------------------------------------------------ Fire
  flammeche: { layers: [projectile({ kind: 'flame', color: C.feu[1], n: 3, gap: 110, size: 0.36, burst: 'flame' })] },
  'tourbillon-braises': { layers: [projectile({ kind: 'flame', color: C.feu[1], n: 3, gap: 70, size: 0.26, burst: false }), at(300, swirl({ kind: 'flame', color: C.feu[1], n: 11 }))] },
  'queue-ardente': { user: 'spin', layers: [whip({ color: C.feu[1], kind: 'fire' })] },
  'grand-brasier': { shake: 0.4, layers: [projectile({ kind: 'flame', color: C.feu[1], size: 0.62, fly: 420, burst: false }), at(400, blaze({ n: 18 }))] },

  // ------------------------------------------------ Water
  bulles: { layers: [projectile({ kind: 'bubble', color: C.eau[1], n: 6, gap: 70, size: 0.27, spread: 0.6, lift: 0.1, burst: 'drop' })] },
  'jet-d-eau': { layers: [jet()] },
  'carapace-roulante': { user: 'roll', layers: [speedLines({ dur: 520 }), at(270, impactStar({ size: 0.58 }))] },
  'grosse-vague': { shake: 0.4, layers: [wave()] },
  'pluie-d-aquarelle': { layers: [rainOn({ colors: RAINBOW, n: 26, size: 0.2 })] },

  // ------------------------------------------------ Ground
  secousse: { user: 'hop', shake: 1, layers: [cracks({ dur: 800 }), dust()] },
  galerie: {
    user: 'popUp', shake: 0.4,
    layers: [burrow({ n: 8 }), cracks({ dur: 700 }), at(200, impactStar({ size: 0.6 }))],
    charge: { user: 'sink', layers: [dust({ who: 'user' }), burrow({ who: 'user', n: 6 })] },
  },
  tremblement: { user: 'hop', shake: 1.6, layers: [cracks({ n: 7, dur: 1000 }), dust({ n: 9, dur: 900 }), at(220, dust({ who: 'user', n: 4 }))] },
  surgissement: { user: 'popUp', shake: 0.6, layers: [burrow({ n: 10 }), cracks({ dur: 600 }), at(120, impactStar({ size: 0.66 }))] },

  // ------------------------------------------------ Rock
  'jet-de-cailloux': { layers: [projectile({ kind: 'rock', color: C.roche[1], n: 3, gap: 100, size: 0.32, spin: 1 })] },
  eboulis: { shake: 0.8, layers: [rockfall({ n: 6 })] },
  'pique-fossile': { user: 'dash', layers: [speedLines({ n: 9 }), projectile({ kind: 'rock', color: C.roche[1], n: 2, size: 0.26, fly: 260, gap: 60, burst: false }), at(260, impactStar({ size: 0.62 }))] },
  'lame-de-pierre': { shake: 0.6, layers: [spikes({ n: 6 })] },

  // ------------------------------------------------ Ice
  'souffle-glace': { layers: [breath({ kind: 'snow', colors: [C.glace[1], '#ffffff'], n: 18, size: 0.28 })] },
  'rayon-givre': { layers: [beam({ colors: [C.glace[1]], width: 0.17, glow: 'snow' }), at(300, sparkle({ kind: 'shard', color: C.glace[1], n: 6, size: 0.26 }))] },
  'crocs-givre': { user: 'lunge', layers: [bite({ gum: C.glace[2], tooth: C.glace[0] }), at(250, sparkle({ kind: 'shard', color: C.glace[1], n: 5 }))] },

  // ------------------------------------------------ Poison
  'dard-venin': { user: 'lunge', layers: [jab({ color: C.poison[1], n: 1, size: 0.48 }), at(150, sparkle({ kind: 'bubble', color: C.poison[1], n: 5, size: 0.22 }))] },
  'pate-gluante': { layers: [projectile({ kind: 'blob', color: C.poison[1], n: 3, gap: 100, size: 0.32, burst: false }), at(380, splat({ color: C.poison[1], size: 0.6 }))] },
  'crochet-venin': { user: 'lunge', layers: [bite({ gum: C.poison[2] }), at(260, sparkle({ kind: 'bubble', color: C.poison[1], n: 5, size: 0.18 }))] },
  'boue-toxique': { shake: 0.3, layers: [darken({ color: C.poison[2], alpha: 0.25 }), projectile({ kind: 'blob', color: '#8a5f9a', n: 4, gap: 80, size: 0.3, burst: false }), at(400, splat({ color: C.poison[1], size: 0.9 }))] },

  // ------------------------------------------------ Dragon
  'griffe-dragon': { user: 'lunge', layers: [slash({ color: C.dragon[1], width: 1.4 })] },
  'souffle-dragon': { layers: [breath({ kind: 'puff', colors: [C.dragon[1], C.dragon[0]], n: 18, size: 0.36 })] },
  'colere-dragon': { user: 'rear', shake: 0.6, layers: [darken({ color: C.dragon[2], alpha: 0.32, dur: 1100 }), at(120, breath({ kind: 'flame', colors: [C.dragon[1], C.dragon[0], C.feu[1]], n: 24, size: 0.42, dur: 900 }))] },

  // ------------------------------------------------ Steel
  'aile-d-acier': { user: 'dash', layers: [sparkle({ who: 'user', color: '#ffffff', n: 4 }), at(120, slash({ color: C.acier[1], n: 1, width: 2, len: 1.1 }))] },
  'griffe-metal': { user: 'lunge', layers: [slash({ color: C.acier[1], width: 1.2 }), at(200, sparkle({ color: '#ffffff', n: 4, size: 0.15 }))] },
  'tete-de-fer': { user: 'rear', hit: 'knock', shake: 0.4, layers: [sparkle({ who: 'user', color: '#ffffff', n: 5 }), at(330, impactStar({ size: 0.66, color: C.acier[0] }))] },
  'canon-aimant': { layers: [pop({ kind: 'magnet', color: '#e0453a', who: 'user', size: 0.45, dy: -0.55, dur: 520 }), at(240, projectile({ kind: 'orb', color: C.acier[1], size: 0.36, fly: 320, burst: false })), at(560, sparks({ color: '#7ad0ff' }))] },

  // ------------------------------------------------ Bug
  'fil-enroule': { layers: [whip({ color: '#f4efe4', kind: 'plain', width: 0.4 }), at(330, wrap())] },
  dard: { user: 'lunge', layers: [jab({ color: C.insecte[2], n: 2, size: 0.42 })] },
  'rayon-d-ailes': { layers: [sparkle({ who: 'user', color: C.insecte[0], n: 5 }), at(100, beam({ colors: [C.insecte[0], C.insecte[1], C.fee[0]], width: 0.2 }))] },
  'coup-de-ciseaux': { user: 'lunge', layers: [snip()] },
  bourdonnement: { user: 'shake', shake: 0.3, layers: [notes({ colors: [C.insecte[1]], n: 4, size: 0.18 }), at(200, buzz())] },

  // ------------------------------------------------ Electric
  'petite-etincelle': { layers: [projectile({ kind: 'spark', color: C.electrique[1], n: 2, gap: 90, size: 0.3, burst: false }), at(330, sparks())] },
  'zap-zap': { layers: [bolt({ n: 2, dur: 620, from: 'user' })] },
  'queue-eclair': { user: 'spin', layers: [whip({ color: C.electrique[1], kind: 'bolt' }), at(260, sparks({ dur: 420 }))] },
  'grand-zigzag': { shake: 0.5, layers: [bolt({ n: 2, dur: 760, width: 1.4 }), at(150, sparks({ n: 5, dur: 520 }))] },
  'eclair-fluo': { layers: [bolt({ color: NEON[0], dur: 600 }), at(200, bolt({ color: NEON[1], dur: 420 })), at(250, sparkle({ color: NEON[2], n: 5 }))] },

  // ------------------------------------------------ Fairy
  'micro-magique': { layers: [sparkle({ who: 'user', kind: 'star', color: C.fee[0], n: 4 }), at(80, notes({ colors: [C.fee[1], C.psy[1]], n: 5 }))] },
  pirouette: { user: 'spin', layers: [twirl({ colors: [C.fee[1], C.fee[0], '#ffffff'] }), at(200, impactStar({ size: 0.36, color: C.fee[0] }))] },
  'eclat-de-lune': { layers: [darken({ color: '#2a3366', alpha: 0.3, dur: 1100 }), pop({ kind: 'moon', color: '#f7e6a0', who: 'user', dy: -0.7, size: 0.5, dur: 700 }), at(340, beam({ colors: [C.fee[0], '#f7e6a0'], width: 0.2, glow: 'star' }))] },
  'grand-concert': { shake: 0.3, layers: [notes({ colors: RAINBOW, n: 10, size: 0.26, dur: 1100 }), at(520, sparkle({ kind: 'star', color: C.fee[1], n: 8, size: 0.28 }))] },

  // ------------------------------------------------ Psychic
  'choc-mental': { layers: [rings({ colors: [C.psy[1], C.psy[0]], n: 4 })] },
  'corne-arc-en-ciel': { user: 'rear', layers: [at(160, beam({ colors: RAINBOW, width: 0.24 })), at(460, sparkle({ kind: 'star', color: '#ffffff', n: 6 }))] },
  'reve-eveille': { layers: [rings({ colors: [C.psy[0], C.fee[0], C.vol[0]], n: 5, bubbles: true }), at(450, sparkle({ kind: 'star', color: C.psy[1], n: 5 }))] },

  // ------------------------------------------------ Ghost
  bouh: { hit: 'knock', layers: [darken({ alpha: 0.3, dur: 760 }), boo()] },
  'langue-fantome': { hit: 'squash', layers: [tongue()] },
  cauchemar: { layers: [darken({ alpha: 0.45, dur: 1000 }), eyes(), at(220, sparkle({ kind: 'zzz', color: C.spectre[2], n: 3, size: 0.26, dur: 700 }))] },
  'mains-de-brume': { layers: [darken({ alpha: 0.3 }), hands()] },
  'ombre-farceuse': { layers: [darken({ alpha: 0.35 }), shade()] },

  // ------------------------------------------------ Dark
  mordillage: { user: 'lunge', layers: [bite()] },
  'coup-en-douce': { user: 'dash', layers: [darken({ alpha: 0.2, dur: 500 }), speedLines({ n: 9 }), at(140, slash({ color: C.tenebres[1], n: 1, width: 1.4 }))] },
  'tache-d-encre': { layers: [projectile({ kind: 'ink', color: INK, n: 3, gap: 90, size: 0.32, burst: false }), at(380, splat({ color: INK, size: 0.75 }))] },

  // ------------------------------------------------ Fighting
  'poing-crayon': { user: 'lunge', layers: [fist({ color: SKIN }), at(220, impactStar({ size: 0.5 }))] },
  balayette: { user: 'dash', hit: 'knock', layers: [sweep({ color: C.combat[1] }), at(200, dust())] },
  'gros-poing': { user: 'rear', shake: 0.7, layers: [fist({ color: SKIN, size: 0.85, dur: 560 }), at(280, impactStar({ size: 0.8 }))] },
  'rafale-de-poings': { user: 'lunge', layers: [fist({ color: SKIN, size: 0.45, dur: 340 }), at(170, impactStar({ size: 0.4 }))] },

  // ------------------------------------------------ iteration 11
  'chant-polaire': { layers: [notes({ colors: [C.glace[1], C.glace[2]], n: 7, size: 0.27 }), at(480, sparkle({ kind: 'snow', color: C.glace[1], n: 7, size: 0.26 }))] },
  'epee-crayon': { user: 'dash', layers: [sparkle({ who: 'user', color: '#ffffff', n: 3 }), at(150, slash({ color: '#f2c43a', n: 1, width: 2.4, len: 1.25 })), at(320, impactStar({ size: 0.5, color: C.acier[0] }))] },
  'gueule-piege': { user: 'lunge', hit: 'squash', layers: [bite({ gum: C.plante[2], tooth: '#fffbe0', n: 5 }), at(380, drain({ color: C.plante[1] }))] },
  'os-boomerang': { user: 'rear', layers: [projectile({ kind: 'bone', color: '#f6f1e4', size: 0.36, fly: 340, spin: 3, burst: 'star' })] },
  'griffe-de-nuit': { user: 'dash', layers: [darken({ alpha: 0.32, dur: 700 }), at(120, slash({ color: C.tenebres[1], n: 3, width: 1.4 }))] },
  'reve-vitrail': { layers: [sparkle({ who: 'user', kind: 'star', color: '#f2c43a', n: 5 }), at(120, beam({ colors: ['#f6a7c8', '#bfe2fa', '#f7e37a', '#c9ec9a', '#d9ccf5'], width: 0.26, glow: 'star' })), at(560, drain({ color: C.fee[1] }))] },
  'ombre-songe': { layers: [darken({ alpha: 0.45, dur: 1100 }), shade({ color: '#241e40' }), at(500, sparkle({ kind: 'zzz', color: C.spectre[1], n: 3, size: 0.26, dur: 600 }))] },
  'tempete-psy': { layers: [darken({ color: '#3a1a3a', alpha: 0.25, dur: 1000 }), rings({ colors: [C.psy[1], C.psy[0], C.fee[1]], n: 6 }), at(420, sparkle({ kind: 'star', color: C.psy[1], n: 6, size: 0.24 }))] },
  // the stapler crocodile's jaws clamp shut, then staples pin the foe in place
  agrafage: { user: 'lunge', hit: 'squash', layers: [bite({ gum: C.acier[2], tooth: '#f4f4f8', n: 6 }), at(380, wrap({ color: C.acier[1], loops: 2, dur: 560 }))] },
  // a punch struck like a match: sparks, the brown glove, a burst of flame
  'craque-poing': { user: 'lunge', layers: [sparks({ color: C.feu[1], n: 6, dur: 300 }), at(120, fist({ color: '#6b4a3a' })), at(330, impactStar({ size: 0.6, color: C.feu[1] })), at(330, swirl({ kind: 'flame', color: C.feu[1], n: 5, dur: 460, size: 0.3 }))] },
  // the paper dragon dances in a shower of colours, then charges
  'grand-defile': { user: 'dash', shake: 0.5, layers: [...RAINBOW.slice(0, 5).map((c, i) => at(i * 70, rise({ kind: 'spark', color: c, n: 3, size: 0.22, dur: 600 }))), at(420, speedLines({ n: 10, dur: 380 })), at(620, impactStar({ size: 0.75, color: C.dragon[1] }))] },
  // the autumn squirrel winds up and throws an acorn, spinning
  'lancer-de-gland': { user: 'rear', layers: [projectile({ kind: 'acorn', color: '#c8893e', size: 0.4, fly: 340, spin: 2, burst: 'star' })] },
  // the ink ghost splashes the foe with blots of violet-black ink
  gigotage: calm({ user: 'wiggle', layers: [sparkle({ who: 'user', kind: 'bubble', color: C.eau[1], n: 5, size: 0.2 })] }),
  deferlante: { user: 'lunge', shake: 0.3, layers: [wave(), at(300, impactStar({ size: 0.55 }))] },
  'croc-buvard': { user: 'lunge', hit: 'squash', layers: [bite({ gum: C.poison[2], tooth: '#f7f3ea', n: 4 }), at(380, drain({ color: C.poison[1] }))] },
  'giclee-d-encre': { layers: [projectile({ kind: 'ink', color: C.spectre[2], n: 4, gap: 70, size: 0.36, burst: false }), at(360, splat({ color: C.spectre[2], size: 0.95 })), at(420, sparkle({ kind: 'ink', color: C.spectre[1], n: 4, size: 0.18 }))] },
};

/** The animation of a move, if it has one. */
export function fxFor(id: string): Recipe | undefined {
  return MOVE_FX[id];
}
