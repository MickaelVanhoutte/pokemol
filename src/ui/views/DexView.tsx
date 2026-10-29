import { useState } from 'preact/hooks';
import { L, tr } from '../../i18n';
import { CREATURES, CREATURE_BY_ID, CUSTOM_ID, artUrl, dexCount, dexNo } from '../../data/creatures';
import type { SpeciesDef } from '../../data/schema';
import { FAIR_RIG_OF, fairFile } from '../../data/rigs';
import { monTypes } from '../../data/fairCopies';
import { RigPicture } from '../RigPicture';
import { FairStar } from '../battle/FairStar';
import { Frame, MenuList, PixelIcon, TypeBadges, Window } from '../paper';
import { sfx } from '../../audio/sfx';
import { evolutionHints } from '../evolutionText';
import { habitatsOf, type HabitatHow } from '../../data/habitats';
import { MAPS } from '../../data/maps';
import type { LText } from '../../i18n';

const HOW: Record<HabitatHow, LText> = {
  grass: L('hautes herbes', 'tall grass'), cave: L('grotte', 'cave'), seaweed: L('algues, en plongée', 'seaweed, diving'), surf: L('en bateau', 'sailing'),
  old: L('Canne en Bois', 'Old Rod'), good: L('Bonne Canne', 'Good Rod'), super: L('Super Canne', 'Super Rod'),
  gift: L('cadeau', 'gift'), tombola: L('tirage', 'raffle'), drawn: L('dessinée à l’atelier', 'drawn at the workshop'),
};
import './views.css';

/** Bestiodex: numbered list, then an entry page (drawing on paper, kind, type, text). */
export function DexView({ seen, caught, visited = () => true, fairSeen = () => false, onClose }: {
  seen: string[]; caught: string[]; visited?: (map: string) => boolean;
  /** Its fair copy was seen in a battle (`fair:<id>`). */
  fairSeen?: (id: string) => boolean;
  onClose: () => void;
}) {
  const [open, setOpen] = useState<number | null>(null);
  const isSeen = (id: string) => seen.includes(id);
  const isCaught = (id: string) => caught.includes(id);
  // the player's own Bestiole, drawn at the workshop, comes first: « N°000, hors série »
  const list: SpeciesDef[] = isCaught(CUSTOM_ID) && CREATURE_BY_ID[CUSTOM_ID] ? [CREATURE_BY_ID[CUSTOM_ID], ...CREATURES] : CREATURES;

  if (open !== null) return <DexEntry key={open} list={list} index={open} isSeen={isSeen} isCaught={isCaught} fairSeen={fairSeen} visited={visited} onMove={setOpen} onClose={() => setOpen(null)} />;
  return (
    <Frame
      title={tr(L('Bestiodex', 'Critterdex'))}
      onBack={onClose}
      right={<Window class="dex__count"><span>{tr(L('VUS', 'SEEN'))} {dexCount(seen)}</span> <span>{tr(L('PRIS', 'OWN'))} {dexCount(caught)}</span></Window>}
    >
      <Window class="dex__list">
        <MenuList
          onCancel={onClose}
          items={list.map((c, i) => ({
            label: (
              <span class="dexrow">
                <span class="dexrow__no">{dexNo(c.id)}</span>
                {isSeen(c.id) ? <img class="mon-art dexrow__art" src={artUrl(c)} alt="" /> : <span class="dexrow__art dexrow__q">?</span>}
                <span>{isSeen(c.id) ? tr(c.name) : '-----'}</span>
              </span>
            ),
            side: isCaught(c.id) ? <PixelIcon id="crayon-ball" size={18} /> : undefined,
            disabled: !isSeen(c.id),
            onSelect: () => setOpen(i),
          }))}
        />
      </Window>
    </Frame>
  );
}

/** « Où le trouver » : places (named once visited) and how, with levels. */
function Habitats({ species, visited }: { species: string; visited: (map: string) => boolean }) {
  const lines = habitatsOf(species).map((h) => {
    const place = visited(h.map) && MAPS[h.map] ? tr(MAPS[h.map].name) : '???';
    const lv = h.min !== undefined ? ` · N.${h.min}${h.max !== h.min ? `–${h.max}` : ''}` : '';
    const when = h.time === 'night' ? tr(L(', la nuit', ', at night')) : h.time === 'day' ? tr(L(', le jour', ', by day')) : '';
    return `${place} (${tr(HOW[h.how])}${when})${lv}`;
  });
  return (
    <div class="dex__where">
      <b>{tr(L('Où le trouver', 'Where to find it'))}</b>
      <ul>{lines.map((l) => <li>{l}</li>)}</ul>
    </div>
  );
}

function DexEntry({ list, index, isSeen, isCaught, fairSeen, visited, onMove, onClose }: {
  list: SpeciesDef[]; index: number; isSeen: (id: string) => boolean; isCaught: (id: string) => boolean; fairSeen: (id: string) => boolean;
  visited: (map: string) => boolean; onMove: (i: number) => void; onClose: () => void;
}) {
  const sp = list[index];
  // its fair copy (« mise au propre »), once seen in a battle
  const fairRig = isCaught(sp.id) && fairSeen(sp.id) ? FAIR_RIG_OF[sp.id] : undefined;
  const [inked, setInked] = useState(false);
  const fair = inked && !!fairRig;
  const step = (d: 1 | -1) => {
    for (let k = 1; k < list.length; k++) {
      const j = (index + d * k + list.length) % list.length;
      if (isSeen(list[j].id)) return onMove(j);
    }
  };
  return (
    <Frame title={`N°${dexNo(sp.id)} ${tr(sp.name)}`} onBack={onClose}>
      <Window class="dex__entry">
        <div class="dex__paper">
          {fair ? <RigPicture class="mon-art" rig={fairRig} file={(layer) => fairFile(sp.id, fairRig, layer)} />
            : <img class="mon-art" src={artUrl(sp)} alt="" style={isCaught(sp.id) ? undefined : { filter: 'brightness(0) opacity(0.75)' }} />}
        </div>
        <div class="dex__facts">
          <b class="dex__name">{tr(sp.name)}</b>
          <span>{tr(sp.kind)}</span>
          <TypeBadges species={sp.id} types={fair ? monTypes({ species: sp.id, fair: true }) : undefined} />
          {fairRig && (
            <button class={`pbtn dex__fair ${fair ? 'pbtn--accent' : ''}`} aria-pressed={fair} onClick={() => setInked((v) => !v)}>
              <FairStar />{tr(L('Au propre', 'Fair copy'))}
            </button>
          )}
          {isCaught(sp.id) && <button class="pbtn dex__cry" onClick={() => sfx.cry(sp.id)}>♪ {tr(L('Cri', 'Cry'))}</button>}
        </div>
      </Window>
      <Window seyes class="dex__text">
        {isCaught(sp.id) ? (
          <>
            <p>{tr(sp.dex)}</p>
            {evolutionHints(sp).length > 0 && (
              <p class="dex__evo">{tr(L('Évolution : {h}.', 'Evolves: {h}.'), { h: evolutionHints(sp).join(' · ') })}</p>
            )}
          </>
        ) : <p>{tr(L('Attrape cette Bestiole pour en savoir plus !', 'Catch this Critter to learn more about it!'))}</p>}
        {isSeen(sp.id) && <Habitats species={sp.id} visited={visited} />}
      </Window>
      <div class="dex__nav">
        <button class="pbtn" onClick={() => step(-1)}>◀ {tr(L('Préc.', 'Prev'))}</button>
        <button class="pbtn" onClick={() => step(1)}>{tr(L('Suiv.', 'Next'))} ▶</button>
      </div>
    </Frame>
  );
}
