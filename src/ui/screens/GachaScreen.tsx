import { useState } from 'preact/hooks';
import { L, tr } from '../../i18n';
import { creature } from '../../data/creatures';
import { support } from '../../data/supportCards';
import { PITY, PULL_COST, pull, type Banner } from '../../engine/gacha';
import { newSeed } from '../../engine/rng';
import { backToWorld } from '../../overworld/controller';
import { addCreature, addSupply, save, update } from '../../state/game';
import { Card, SupportCard } from '../Card';
import { sfx } from '../../audio/sfx';
import './shop.css';

interface Shown {
  id: string;
  rarity: string;
  banner: Banner;
  isNew: boolean;
  xp: number;
}

const DAILY_GLITTER = 60;
const today = () => new Date().toISOString().slice(0, 10);

export function GachaScreen() {
  const d = save.value!;
  const [banner, setBanner] = useState<Banner>('creature');
  const [shown, setShown] = useState<Shown[] | null>(null);
  const [open, setOpen] = useState<number>(0);
  const w = Math.min(150, Math.floor((window.innerWidth - 64) / 3));

  const doPull = (count: 1 | 10) => {
    const cost = PULL_COST[count];
    if (save.value!.glitter < cost) return;
    let res: Shown[] = [];
    update((x) => {
      x.glitter -= cost;
      const r = pull({ rng: newSeed() }, banner, count, x.pity[banner]);
      x.pity[banner] = r.pity;
      x.stats.pulls += count;
      const top = Math.max(1, ...Object.values(x.collection).map((o) => o.level));
      const joinLevel = Math.min(8, Math.max(3, top - 2));
      res = r.cards.map((c) => {
        if (banner === 'creature') {
          const a = addCreature(x, c.id, joinLevel);
          return { id: c.id, rarity: c.rarity, banner, isNew: a.isNew, xp: a.xp };
        }
        const isNew = !(x.supplies[c.id] > 0);
        addSupply(x, c.id);
        return { id: c.id, rarity: c.rarity, banner, isNew, xp: 0 };
      });
    });
    setShown(res);
    setOpen(0);
  };

  const claimDaily = () =>
    update((x) => {
      if (x.lastDailyBonus === today()) return;
      x.lastDailyBonus = today();
      x.glitter += DAILY_GLITTER;
    });

  if (shown) {
    const all = open >= shown.length;
    return (
      <div class="screen gacha">
        <div class="screen__bar">
          <h1>{tr(L('Invocation !', 'Summon!'))}</h1>
          <span class="shop__money pixel">✨ {d.glitter}</span>
        </div>
        <div class="pulls">
          {shown.map((s, i) => (
            <div class={`pull r-${s.rarity} ${i < open ? 'is-open' : ''}`} onClick={() => { if (i !== open) return; setOpen(open + 1); if (s.rarity === 'holo' || s.rarity === 'rare') sfx.capture(); else sfx.sparkle(); }}>
              {i < open && <span class={`pull__tag ${s.isNew ? '' : 'pull__tag--dupe'}`}>{s.isNew ? tr(L('NOUVEAU !', 'NEW!')) : s.xp ? `+${s.xp} XP` : '+1'}</span>}
              <div class="pull__inner">
                <div class="pull__front">
                  {s.banner === 'creature' ? <Card def={creature(s.id)} width={w} /> : <SupportCard def={support(s.id)} width={w} />}
                </div>
                <div class="pull__back">✦</div>
              </div>
            </div>
          ))}
        </div>
        <div class="gacha__btns" style={{ marginTop: '18px' }}>
          {!all && <button class="btn" onClick={() => { setOpen(shown.length); sfx.sparkle(); }}>{tr(L('Tout retourner', 'Reveal all'))}</button>}
          {all && <button class="btn btn--primary" onClick={() => setShown(null)}>OK</button>}
        </div>
      </div>
    );
  }

  const pity = PITY[banner] - d.pity[banner];
  return (
    <div class="screen gacha">
      <div class="screen__bar">
        <button class="btn btn--small" onClick={backToWorld}>← {tr(L('Sortir', 'Leave'))}</button>
        <h1>{tr(L('Invocations', 'Summons'))}</h1>
        <span class="shop__money pixel">✨ {d.glitter}</span>
      </div>
      <div class="tabs" style={{ marginBottom: '12px' }}>
        <button class="btn btn--small" aria-pressed={banner === 'creature'} onClick={() => setBanner('creature')}>{tr(L('Bestioles', 'Critters'))}</button>
        <button class="btn btn--small" aria-pressed={banner === 'support'} onClick={() => setBanner('support')}>{tr(L('Fournitures', 'Supplies'))}</button>
        {d.lastDailyBonus !== today() && (
          <button class="btn btn--small gacha__daily" onClick={claimDaily}>🎁 {tr(L('Cadeau du jour : +{n} ✨', 'Daily gift: +{n} ✨'), { n: DAILY_GLITTER })}</button>
        )}
      </div>
      <div class={`gacha__banner ${banner === 'support' ? 'gacha__banner--support' : ''}`}>
        <h2 class="pixel">{banner === 'creature' ? tr(L('Invocation de Bestioles', 'Critter Summon')) : tr(L('Invocation de Fournitures', 'Supply Summon'))}</h2>
        <div class="gacha__show">
          {banner === 'creature'
            ? ['009', '011', '008'].map((id) => <Card def={creature(id)} width={Math.min(130, w)} />)
            : ['double-pile', 'super-potion', 'rappel'].map((id) => <SupportCard def={support(id)} width={Math.min(130, w)} />)}
        </div>
        <p>
          {banner === 'creature'
            ? tr(L('Les nouvelles Bestioles arrivent presque au niveau de ton équipe. Les doublons font gagner de l’expérience !', 'New Critters join close to your team’s level. Duplicates give experience!'))
            : tr(L('Les cartes obtenues rejoignent ta collection de Fournitures.', 'Pulled cards join your Supply collection.'))}
        </p>
        <div class="gacha__btns">
          <button class="btn btn--primary" disabled={d.glitter < PULL_COST[1]} onClick={() => doPull(1)}>×1 · ✨ {PULL_COST[1]}</button>
          <button class="btn btn--primary" disabled={d.glitter < PULL_COST[10]} onClick={() => doPull(10)}>×10 · ✨ {PULL_COST[10]}</button>
        </div>
        <p class="gacha__pity">
          {banner === 'creature'
            ? tr(L('Carte Holo garantie dans {n} invocations au plus.', 'Holo card guaranteed within {n} summons.'), { n: pity })
            : tr(L('Carte rare garantie dans {n} invocations au plus.', 'Rare card guaranteed within {n} summons.'), { n: pity })}
          {' '}{tr(L('×10 : au moins une carte rare.', '×10: at least one rare card.'))}
        </p>
      </div>
    </div>
  );
}
