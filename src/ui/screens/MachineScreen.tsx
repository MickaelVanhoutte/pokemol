import { useState } from 'preact/hooks';
import { L, tr } from '../../i18n';
import { CREATURES, monLabel } from '../../data/creatures';
import { monArtUrl } from '../monArt';
import { RARITIES } from '../../data/types';
import { createMon, type Mon } from '../../engine/pk/creature';
import { newSeed, pickWeighted } from '../../engine/rng';
import { backToWorld } from '../../overworld/controller';
import { addMon, allMons, save, update } from '../../state/game';
import { NicknameView } from '../views/NicknameView';
import { sfx } from '../../audio/sfx';
import { Frame, TypeBadges, Window } from '../paper';
import '../screens.css';

export const MACHINE_PRICE = 1000;

/** Picks a random creature (rarity-weighted) close to the player's strongest level. */
export function machineRoll(seed: number, topLevel: number): Mon {
  const st = { rng: seed };
  const sp = pickWeighted(st, CREATURES, (c) => RARITIES[c.rarity].weight);
  const level = Math.max(3, Math.min(40, topLevel - 2));
  return createMon(sp.id, level, st);
}

export function MachineScreen() {
  const d = save.value!;
  const [spinning, setSpinning] = useState(false);
  const [got, setGot] = useState<{ mon: Mon; where: 'party' | 'box' } | null>(null);
  const [naming, setNaming] = useState(false);
  const run = () => {
    if (save.value!.money < MACHINE_PRICE || spinning) return;
    setGot(null);
    setSpinning(true);
    sfx.sparkle();
    setTimeout(() => {
      const top = Math.max(1, ...[...save.value!.party, ...save.value!.boxes.flat()].map((m) => m.level));
      const mon = machineRoll(newSeed(), top);
      let where: 'party' | 'box' = 'party';
      update((x) => {
        x.money -= MACHINE_PRICE;
        where = addMon(x, mon, 'tombola');
      });
      setSpinning(false);
      setGot({ mon, where });
      sfx.capture();
    }, 1400);
  };
  return (
    <Frame title={tr(L('Tombola', 'Fair Raffle'))} onBack={backToWorld} backLabel={tr(L('Sortir', 'Leave'))} right={<Window class="money-win">{d.money} ₽</Window>}>
      <Window class="machine">
        <p>{tr(L('Un ticket = {p} ₽. La machine dessine une Bestiole surprise ; les plus rares sortent moins souvent !', 'One ticket = ₽{p}. The machine draws a surprise Critter; rare ones come out less often!'), { p: MACHINE_PRICE })}</p>
        <div class={`machine__box ${spinning ? 'is-spinning' : ''}`}>
          {got && <img key={got.mon.uid} src={monArtUrl(got.mon)} alt="" />}
        </div>
        {got && (
          <p>
            {tr(L('{n} (N.{l}) rejoint {w} !', '{n} (Lv{l}) joins {w}!'), {
              n: monLabel(got.mon), l: got.mon.level,
              w: got.where === 'party' ? tr(L('ton équipe', 'your party')) : tr(L('le PC', 'the PC')),
            })} <TypeBadges species={got.mon.species} />
          </p>
        )}
        {got && !spinning && <button class="pbtn" onClick={() => setNaming(true)}>{tr(L('Donner un surnom', 'Give a nickname'))}</button>}
        <button class="pbtn pbtn--accent" disabled={d.money < MACHINE_PRICE || spinning} onClick={run}>
          {tr(L('Acheter un ticket', 'Buy a ticket'))} · {MACHINE_PRICE} ₽
        </button>
      </Window>
      {naming && got && (
        <NicknameView
          mon={got.mon}
          onDone={(name) => {
            setNaming(false);
            update((x) => {
              const t = allMons(x).find((m) => m.uid === got.mon.uid);
              if (!t) return;
              if (name) t.nickname = name;
              else delete t.nickname;
            });
            setGot({ ...got, mon: { ...got.mon, nickname: name ?? undefined } });
          }}
        />
      )}
    </Frame>
  );
}
