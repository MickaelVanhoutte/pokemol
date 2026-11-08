import { useEffect, useState } from 'preact/hooks';
import { tr, L } from '../../i18n';
import { STAT_KEYS } from '../../engine/pk/creature';
import { STAT_NAMES } from '../../data/types';
import type { Stats } from '../../data/schema';
import { sfx } from '../../audio/sfx';
import { moneySteps } from './tally';

/**
 * The GBA's level-up window, over the scene: what each stat gained (page 0), then the new stats (page 1).
 * A tap (or A) turns the page; `BattleScreen` turns it by itself after a moment.
 */
export function LevelUpWindow({ level, gain, after, page, onNext }: { level: number; gain: Stats; after: Stats; page: 0 | 1; onNext: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (['z', 'Z', 'Enter', ' '].includes(e.key)) {
        e.preventDefault();
        e.stopImmediatePropagation();
        onNext();
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [onNext]);
  return (
    <div class="pk-lvup" role="status" onPointerDown={onNext}>
      <b class="pk-lvup__head">{tr(L('N.{l}', 'Lv. {l}'), { l: level })}</b>
      <dl class="pk-lvup__rows">
        {STAT_KEYS.map((k) => (
          <div class="pk-lvup__row" key={k}>
            <dt>{tr(STAT_NAMES[k])}</dt>
            <dd class={page === 0 ? 'is-gain' : ''}>{page === 0 ? `+${gain[k]}` : after[k]}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/** The prize money counting up over the scene once the battle is won, a coin sound on the way. */
export function MoneyTicker({ money, speed }: { money: number; speed: number }) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const steps = moneySteps(money);
    const every = Math.max(30, (900 * speed) / steps.length);
    const timers = steps.map((v, i) => setTimeout(() => {
      setShown(v);
      if (i % 2 === 0 || i === steps.length - 1) sfx.coin();
    }, 250 + i * every));
    return () => timers.forEach(clearTimeout);
  }, [money]);
  return <div class="pk-money" aria-live="polite">+ {shown} ₽</div>;
}
