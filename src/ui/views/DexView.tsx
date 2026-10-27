import { useState } from 'preact/hooks';
import { L, tr } from '../../i18n';
import { CREATURES, artUrl, dexNo } from '../../data/creatures';
import { Frame, MenuList, PixelIcon, TypeBadges, Window } from '../paper';
import { sfx } from '../../audio/sfx';
import { evolutionHints } from '../evolutionText';
import { habitatsOf, type HabitatHow } from '../../data/habitats';
import { MAPS } from '../../data/maps';
import type { LText } from '../../i18n';

const HOW: Record<HabitatHow, LText> = {
  grass: L('hautes herbes', 'tall grass'), cave: L('grotte', 'cave'), surf: L('en bateau', 'sailing'),
  old: L('Canne en Bois', 'Old Rod'), good: L('Bonne Canne', 'Good Rod'), super: L('Super Canne', 'Super Rod'),
  gift: L('cadeau', 'gift'), tombola: L('tirage', 'raffle'),
};
import './views.css';

/** Bestiodex: numbered list, then an entry page (drawing on paper, kind, type, text). */
export function DexView({ seen, caught, all, visited = () => true, onClose }: {
  seen: string[]; caught: string[]; all?: boolean; visited?: (map: string) => boolean; onClose: () => void;
}) {
  const [open, setOpen] = useState<number | null>(null);
  const isSeen = (id: string) => all || seen.includes(id);
  const isCaught = (id: string) => all || caught.includes(id);

  if (open !== null) return <DexEntry index={open} isSeen={isSeen} isCaught={isCaught} visited={visited} onMove={setOpen} onClose={() => setOpen(null)} />;
  return (
    <Frame
      title={tr(L('Bestiodex', 'Critterdex'))}
      onBack={onClose}
      right={!all && <Window class="dex__count"><span>{tr(L('VUS', 'SEEN'))} {seen.length}</span> <span>{tr(L('PRIS', 'OWN'))} {caught.length}</span></Window>}
    >
      <Window class="dex__list">
        <MenuList
          onCancel={onClose}
          items={CREATURES.map((c, i) => ({
            label: (
              <span class="dexrow">
                <span class="dexrow__no">{dexNo(c.id)}</span>
                {isSeen(c.id) ? <img class="mon-art dexrow__art" src={artUrl(c)} alt="" /> : <span class="dexrow__art dexrow__q">?</span>}
                <span>{isSeen(c.id) ? tr(c.name) : '-----'}</span>
              </span>
            ),
            side: isCaught(c.id) && !all ? <PixelIcon id="crayon-ball" size={18} /> : undefined,
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

function DexEntry({ index, isSeen, isCaught, visited, onMove, onClose }: {
  index: number; isSeen: (id: string) => boolean; isCaught: (id: string) => boolean; visited: (map: string) => boolean; onMove: (i: number) => void; onClose: () => void;
}) {
  const sp = CREATURES[index];
  const step = (d: 1 | -1) => {
    for (let k = 1; k < CREATURES.length; k++) {
      const j = (index + d * k + CREATURES.length) % CREATURES.length;
      if (isSeen(CREATURES[j].id)) return onMove(j);
    }
  };
  return (
    <Frame title={`N°${dexNo(sp.id)} ${tr(sp.name)}`} onBack={onClose}>
      <Window class="dex__entry">
        <div class="dex__paper">
          <img class="mon-art" src={artUrl(sp)} alt="" style={isCaught(sp.id) ? undefined : { filter: 'brightness(0) opacity(0.75)' }} />
        </div>
        <div class="dex__facts">
          <b class="dex__name">{tr(sp.name)}</b>
          <span>{tr(sp.kind)}</span>
          {sp.draft && <span class="dex__draft">{tr(L('BROUILLON', 'DRAFT'))}</span>}
          <TypeBadges species={sp.id} />
          {isCaught(sp.id) && <button class="pbtn dex__cry" onClick={() => sfx.cry(sp.id)}>♪ {tr(L('Cri', 'Cry'))}</button>}
        </div>
      </Window>
      <Window seyes class="dex__text">
        {isCaught(sp.id) ? (
          <>
            <p>{tr(sp.dex)}</p>
            {sp.draft && <p class="dex__evo">{tr(L('Un brouillon, griffonné vite fait.', 'A draft, scribbled quickly.'))}</p>}
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
