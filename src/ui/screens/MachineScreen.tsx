import { useState } from 'preact/hooks';
import { L, tr } from '../../i18n';
import { CREATURES, artUrl, creature } from '../../data/creatures';
import { RARITIES } from '../../data/types';
import { createMon, type Mon } from '../../engine/pk/creature';
import { newSeed, pickWeighted } from '../../engine/rng';
import { backToWorld } from '../../overworld/controller';
import { addMon, save, update } from '../../state/game';
import { sfx } from '../../audio/sfx';
import { Frame, TypeBadge, Window } from '../paper';
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
  const run = () => {
    if (save.value!.money < MACHINE_PRICE || spinning) return;
    setGot(null);
    setSpinning(true);
    sfx.sparkle();
    setTimeout(() => {
      const top = Math.max(1, ...[...save.value!.party, ...save.value!.box].map((m) => m.level));
      const mon = machineRoll(newSeed(), top);
      let where: 'party' | 'box' = 'party';
      update((x) => {
        x.money -= MACHINE_PRICE;
        where = addMon(x, mon);
      });
      setSpinning(false);
      setGot({ mon, where });
      sfx.capture();
    }, 1400);
  };
  return (
    <Frame title={tr(L('Machine à Bestioles', 'Critter Machine'))} onBack={backToWorld} backLabel={tr(L('Sortir', 'Leave'))} right={<Window class="money-win">{d.money} ₽</Window>}>
      <Window class="machine">
        <p>{tr(L('Pour {p} ₽, la machine dessine une Bestiole surprise. Les plus rares sortent moins souvent !', 'For ₽{p}, the machine draws a surprise Critter. Rare ones come out less often!'), { p: MACHINE_PRICE })}</p>
        <div class={`machine__box ${spinning ? 'is-spinning' : ''}`}>
          {got && <img key={got.mon.uid} src={artUrl(creature(got.mon.species))} alt="" />}
        </div>
        {got && (
          <p>
            {tr(L('{n} (N.{l}) rejoint {w} !', '{n} (Lv{l}) joins {w}!'), {
              n: tr(creature(got.mon.species).name), l: got.mon.level,
              w: got.where === 'party' ? tr(L('ton équipe', 'your party')) : tr(L('le PC', 'the PC')),
            })} <TypeBadge type={creature(got.mon.species).type} />
          </p>
        )}
        <button class="pbtn pbtn--accent" disabled={d.money < MACHINE_PRICE || spinning} onClick={run}>
          {tr(L('Lancer la machine', 'Start the machine'))} · {MACHINE_PRICE} ₽
        </button>
      </Window>
    </Frame>
  );
}
