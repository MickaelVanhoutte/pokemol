import { CUSTOM_ID, creature, typesOf } from './creatures';
import type { SpeciesDef, Stats, TypeId } from './schema';

/**
 * « Mise au propre » (fair copy): once per battle, with the Feutre d'Or, a fully grown Bestiole (no evolution
 * left) is redrawn in felt-tip until the battle ends (src/engine/pk/battle.ts). Its fair copy keeps its HP and
 * its types; the rest of its base stats grow by a fifth, put where its new look says, and it takes a new talent. Only
 * a few take a new type instead (with moves of it its family learns), where the drawing plainly shows
 * it: the owner wants each Bestiole's identity kept. Drawn by tools/fair (`npm run fair`), checked by
 * src/data/fairCopies.test.ts.
 */
export interface FairCopy {
  /** The type it keeps, when it isn't its first one (a bird keeps Flying). */
  type?: TypeId;
  /** Its new type as a fair copy (one it didn't have), for the few whose drawing shows one. Left out, it keeps its own types. */
  type2?: TypeId;
  base: Stats;
  /** A talent replacing its own: every fair copy that keeps its types has one. */
  talent?: string;
}

export const FAIR_COPY: Record<string, FairCopy> = {
  // Ombrouille: a blue ghost flame lit on each spike, a third eye
  '011': { base: { hp: 65, atk: 80, def: 100, spa: 150, spd: 115, spe: 115 }, talent: 'troisieme-oeil' },
  // Touflot: huge fin ears and tail fin frilled in pink, a pink mane, a taller crest
  '017': { base: { hp: 120, atk: 70, def: 75, spa: 125, spd: 120, spe: 90 }, talent: 'perle-de-pluie' },
  // Toufeu: three flame tails, a bigger ruff of flame-fur, a flame on its brow
  '018': { base: { hp: 65, atk: 135, def: 80, spa: 120, spd: 110, spe: 90 }, talent: 'feu-de-joie' },
  // Toufoudre: its zig-zag fur grown into wings of lightning feathers, a lightning-bolt tail
  '019': { base: { hp: 65, atk: 80, def: 75, spa: 130, spd: 110, spe: 140 }, talent: 'vent-arriere' },
  // Tortorrent: its spouts become one huge steel cannon, a forearm cannon, steel-tipped spikes
  '023': { type2: 'acier', base: { hp: 79, atk: 93, def: 125, spa: 120, spd: 125, spe: 78 } },
  // Bouquétigre: a huge double bloom, a mane of leaves, a flower on its forehead, longer vines
  '024': { base: { hp: 80, atk: 115, def: 103, spa: 115, spd: 112, spe: 95 }, talent: 'herbier' },
  // Dragobraise: huge spiked bat wings and arm wings, three horns, back spikes, blue flames
  '025': { type2: 'dragon', base: { hp: 78, atk: 110, def: 95, spa: 130, spd: 107, spe: 100 } },
  // Lunéclat: a moon twice as big, longer ears, big wings carrying its stars
  '028': { base: { hp: 95, atk: 85, def: 95, spa: 120, spd: 110, spe: 75 }, talent: 'clair-de-lune' },
  // Papivole: bigger veined wings with swallowtails, its dots grown into glittering eyespots
  '007': { base: { hp: 65, atk: 45, def: 71, spa: 136, spd: 114, spe: 134 }, talent: 'mille-yeux' },
  // Piafurie: a long crest, bigger steel-tipped wings and tail fan, a hooked beak
  '036': { base: { hp: 85, atk: 123, def: 103, spa: 70, spd: 84, spe: 125 }, talent: 'coup-de-chance' },
  // Zigzéclair: a spiky mane of electric fur, longer spiral ears, two huge lightning bolts, big fists
  '027': { base: { hp: 60, atk: 124, def: 79, spa: 101, spd: 80, spe: 131 }, talent: 'poils-electriques' },
  // Chantouffe: its fluff grown into a big spiky halo
  '047': { base: { hp: 140, atk: 86, def: 79, spa: 126, spd: 89, spe: 50 }, talent: 'fourrure-douce' },
  // Ronflon: rounder, its cream fur grown into a cloud mane and a cloud tummy
  '008': { base: { hp: 130, atk: 117, def: 106, spa: 55, spd: 122, spe: 35 }, talent: 'rembourrage' },
  // Lamacorne: its rainbow grown into a wing of rainbow feathers, a longer horn and mane
  '014': { base: { hp: 75, atk: 65, def: 65, spa: 141, spd: 117, spe: 112 }, talent: 'ailes-prisme' },
  // Quadripoing: four thicker arms with gloves twice as big, broader shoulders
  '038': { base: { hp: 90, atk: 175, def: 110, spa: 65, spd: 100, spe: 80 }, talent: 'cri-de-charge' },
  // Montagnoc: its rocks piled into a volcano with lava in the cracks
  '040': { type2: 'feu', base: { hp: 85, atk: 149, def: 164, spa: 83, spd: 79, spe: 45 } },
  // Taupitrio: taller moles with steel claws, a bigger molehill with steel crystals
  '041': { type2: 'acier', base: { hp: 50, atk: 141, def: 83, spa: 55, spd: 88, spe: 153 }, talent: 'trio-de-choc' },
  // Banquisette: a horn twice as long, a crest of ice spikes down its back, a bigger floe
  '042': { base: { hp: 90, atk: 82, def: 104, spa: 104, spd: 119, spe: 81 }, talent: 'regard-noir' },
  // Cobrasse: a wider hood with a much bigger, fiercer face on it, a third coil
  '043': { base: { hp: 65, atk: 136, def: 88, spa: 65, spd: 93, spe: 118 }, talent: 'regard-noir' },
  // Dragopataud: its small wings grown into big fins, fins on its arms and tail
  '045': { base: { hp: 88, atk: 143, def: 101, spa: 123, spd: 97, spe: 98 }, talent: 'carapace-pleine' },
  // Triboulon: bigger magnets, a screw grown into an antenna with a fourth magnet, a steel bar
  '046': { base: { hp: 55, atk: 65, def: 129, spa: 163, spd: 75, spe: 103 }, talent: 'foudre-tetue' },
  // Ciseaumante: its scissor arms grown into big steel shears, a thicker body
  '048': { type2: 'acier', base: { hp: 70, atk: 161, def: 113, spa: 55, spd: 80, spe: 121 } },
  // Poupochette: the baby grown out of the pouch, both with fists up
  '049': { base: { hp: 105, atk: 138, def: 94, spa: 40, spd: 94, spe: 119 }, talent: 'poings-d-acier' },
  // Ptérocaille: rock shards jutting from its body, bigger jaws, claws on its wings
  '050': { base: { hp: 80, atk: 150, def: 80, spa: 60, spd: 90, spe: 160 }, talent: 'griffes-malines' },
  // Psymagus: five spoons glowing pink, a longer moustache, a star on its brow
  '053': { base: { hp: 55, atk: 50, def: 45, spa: 186, spd: 128, spe: 136 }, talent: 'trait-assure' },
  // Pantharuse: a mane of spikes, a fighter's build, a blade at the tip of its tail
  '055': { base: { hp: 70, atk: 126, def: 78, spa: 65, spd: 83, spe: 153 }, talent: 'colere-noire' },
  // Fumerax: three gas balls, thicker smog
  '057': { base: { hp: 65, atk: 85, def: 142, spa: 126, spd: 97, spe: 60 }, talent: 'atchoum' },
  // Coquifort: more and longer crystal spikes round its shell, rock shards between them
  '059': { base: { hp: 50, atk: 124, def: 160, spa: 99, spd: 88, spe: 84 }, talent: 'papier-epais' },
  // Glissonde: its shell's ridge grown into a tall blue sail, a longer neck, bigger flippers
  '060': { base: { hp: 120, atk: 92, def: 106, spa: 110, spd: 115, spe: 67 }, talent: 'nage-eclair' },
  // Canarmure: its pencil-sword grown into a greatsword, a tall red plume
  '061': { base: { hp: 60, atk: 153, def: 102, spa: 60, spd: 70, spe: 120 }, talent: 'cri-de-charge' },
  // Gloutoflor: an open maw with two rows of fangs, a crown of leaf points, thorny vines
  '064': { base: { hp: 80, atk: 139, def: 81, spa: 134, spd: 70, spe: 86 }, talent: 'colere-noire' },
  // Ossagarde: a huge bone club ablaze with ghost flames, longer horns
  '066': { base: { hp: 65, atk: 138, def: 147, spa: 50, spd: 100, spe: 65 }, talent: 'cri-de-charge' },
  // Furisinge: the tufts on its crown burst into flames, bigger fists
  '068': { type2: 'feu', base: { hp: 70, atk: 158, def: 80, spa: 60, spd: 70, spe: 132 } },
  // Hippoplume: a pen-nib snout twice as big writing a spiral of violet ink, longer quills
  '070': { base: { hp: 60, atk: 70, def: 100, spa: 141, spd: 82, spe: 122 }, talent: 'atchoum' },
  // Libellune: six bigger stained-glass wings, dragon spines down its tail
  '071': { base: { hp: 90, atk: 83, def: 103, spa: 166, spd: 152, spe: 126 }, talent: 'clair-de-lune' },
  // Noctaile: bigger tattered wings and a third pair trailing ghostly smoke, a fluffy mane
  '072': { base: { hp: 85, atk: 105, def: 95, spa: 180, spd: 105, spe: 150 }, talent: 'vol-de-nuit' },
  // Crocagrafe: six bigger binder clips, bigger stapler jaws
  '075': { base: { hp: 80, atk: 158, def: 134, spa: 50, spd: 70, spe: 103 }, talent: 'trait-assure' },
  // Mammouchaud: its lava plates heaved up into a volcano, longer tusks, four hand stencils
  '077': { base: { hp: 100, atk: 163, def: 129, spa: 60, spd: 93, spe: 55 }, talent: 'rembourrage' },
  // Cerfoudre: antlers twice as tall with eight kites, a thundercloud mane
  '079': { base: { hp: 75, atk: 75, def: 65, spa: 148, spd: 104, spe: 128 }, talent: 'premier-envol' },
  // Allumbattant: a flame mane twice as tall, gloves twice as big in steel cuffs, a V torso
  '081': { base: { hp: 65, atk: 156, def: 87, spa: 75, spd: 60, spe: 137 }, talent: 'poings-d-acier' },
  // Projétoile: a cape spread like bat wings with a galaxy and a moon, a taller hat
  '083': { base: { hp: 75, atk: 45, def: 85, spa: 163, spd: 137, spe: 75 }, talent: 'bonne-etoile' },
  // Festivouivre: a lion-dance mane, a longer parade body, fireworks
  '086': { base: { hp: 90, atk: 152, def: 105, spa: 132, spd: 85, spe: 86 }, talent: 'feu-de-joie' },
  // Globargot: a much bigger snow globe crowned with ice crystals, a steel collar
  '087': { base: { hp: 110, atk: 50, def: 114, spa: 133, spd: 133, spe: 50 }, talent: 'carapace-pleine' },
  // Moutoussière: its fluff grown into two great wings of dust
  '088': { base: { hp: 95, atk: 83, def: 108, spa: 88, spd: 118, spe: 73 }, talent: 'fourrure-douce' },
  // Punaisaure: a pin lance twice as long, four great wings, spurred legs
  '090': { base: { hp: 75, atk: 161, def: 148, spa: 40, spd: 80, spe: 86 }, talent: 'coup-de-chance' },
  // Lampyrette: a flame bursting out of its bulb
  '092': { base: { hp: 65, atk: 45, def: 60, spa: 158, spd: 105, spe: 142 }, talent: 'plein-phare' },
  // Érabreuil: a bigger maple-leaf tail blazing at its tips, leaf tufts on its ears
  '094': { base: { hp: 80, atk: 156, def: 86, spa: 55, spd: 75, spe: 143 }, talent: 'herbier' },
  // Nénurette: a crown of lily petals, a petal frill round its neck, more lilies on its pad
  '095': { base: { hp: 85, atk: 55, def: 90, spa: 138, spd: 122, spe: 75 }, talent: 'jardin-secret' },
  // Tachombre: ink splats grown from its back like wings, a taller crown, a bigger nib
  '097': { base: { hp: 60, atk: 55, def: 60, spa: 176, spd: 101, spe: 143 }, talent: 'mauvais-reves' },
  // Fanétome: its flower in full bloom, leaf arms grown into fans, a longer veil
  '098': { base: { hp: 70, atk: 60, def: 101, spa: 127, spd: 137, spe: 80 }, talent: 'recoloriage' },
  // Léviafarce: its jester's collar grown into a huge crest behind its head, taller fins
  '100': { base: { hp: 95, atk: 181, def: 115, spa: 60, spd: 100, spe: 99 }, talent: 'trait-assure' },
  // Voilamère: a sail twice as tall, longer tentacles with glowing beads
  '102': { base: { hp: 80, atk: 70, def: 100, spa: 133, spd: 120, spe: 117 }, talent: 'recoloriage' },
  // Vampapier: wings twice as big and torn, taller ears, long fangs
  '104': { base: { hp: 80, atk: 117, def: 86, spa: 80, spd: 75, spe: 122 }, talent: 'vol-de-nuit' },
  // Râpépic: longer sandpaper quills, its files turned to steel blades
  '106': { base: { hp: 80, atk: 143, def: 172, spa: 45, spd: 55, spe: 70 }, talent: 'colere-noire' },
  // Galibou: its painted wings grown out into big spread wings, bigger eyes
  '107': { base: { hp: 75, atk: 90, def: 139, spa: 83, spd: 128, spe: 50 }, talent: 'premier-envol' },
  // Givrelynx: frost wings spread wide, bigger ear crystals, longer icicles, a crown of frost on its snowflake
  '109': { base: { hp: 75, atk: 70, def: 85, spa: 140, spd: 115, spe: 135 }, talent: 'patinoire' },
  // Gommichon: both fists up and twice as big, longer ears, a wider sleeve, determined brows
  '110': { base: { hp: 80, atk: 130, def: 105, spa: 45, spd: 95, spe: 120 }, talent: 'poings-d-acier' },
  // Taillou: its collar of shaving doubled, blades glinting in both eye-holes, a polished blade
  '111': { base: { hp: 70, atk: 130, def: 135, spa: 60, spd: 100, spe: 80 }, talent: 'coup-de-chance' },
};

/** A Bestiole that can be made a fair copy: one with no evolution left. */
export const canTransform = (sp: SpeciesDef) => !sp.evolutions?.length;

export function fairCopyOf(id: string): FairCopy | undefined {
  if (id === CUSTOM_ID) return { base: grownBase(creature(id).base) };
  return canTransform(creature(id)) ? FAIR_COPY[id] : undefined;
}

/**
 * The player's own Bestiole goes over its drawing in felt-tip too: HP kept, the total a fifth higher (rounded to
 * 5), the gain spread over its other stats as they already are.
 */
export function grownBase(b: Stats): Stats {
  const keys = ['atk', 'def', 'spa', 'spd', 'spe'] as const;
  const total = b.hp + keys.reduce((s, k) => s + b[k], 0);
  const gain = Math.round((total * 1.2) / 5) * 5 - total;
  const rest = keys.reduce((s, k) => s + b[k], 0);
  const out = { ...b };
  for (const k of keys) out[k] = b[k] + Math.floor((gain * b[k]) / rest);
  // what rounding left goes to its best stat
  const best = keys.reduce((a, k) => (b[k] > b[a] ? k : a), keys[0]);
  out[best] += total + gain - (out.hp + keys.reduce((s, k) => s + out[k], 0));
  return out;
}

/** A Bestiole's types in battle: its fair copy's while it is one. */
export function monTypes(m: { species: string; fair?: boolean }): TypeId[] {
  const fc = m.fair ? fairCopyOf(m.species) : undefined;
  return fc?.type2 ? [fc.type ?? creature(m.species).type, fc.type2] : typesOf(m.species);
}
