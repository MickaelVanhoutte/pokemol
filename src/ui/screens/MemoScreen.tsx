import { useEffect, useRef, useState } from 'preact/hooks';
import { L, tr } from '../../i18n';
import { artUrl, creature, CREATURES } from '../../data/creatures';
import { backToWorld } from '../../overworld/controller';
import { sfx } from '../../audio/sfx';
import { Frame, Window } from '../paper';
import { deal, MEMO_PAIRS, pickSpecies, prizeTier } from '../logic/memo';
import './minigames.css';

/** Mémo-Bestioles: turn the cards over two by two and find the pairs of drawings. */
export function MemoScreen({ onEnd }: { onEnd: (tries: number | null) => void }) {
  const [cards] = useState(() => deal(pickSpecies(CREATURES.map((c) => c.id), MEMO_PAIRS, Math.random), Math.random));
  const [up, setUpState] = useState<number[]>([]);
  // two quick taps can land in the same frame: the ref always holds the cards turned over
  const upRef = useRef<number[]>([]);
  const setUp = (v: number[]) => {
    upRef.current = v;
    setUpState(v);
  };
  const [found, setFound] = useState<Set<number>>(new Set());
  const [tries, setTries] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const done = found.size === cards.length;
  useEffect(() => () => clearTimeout(timer.current), []);

  const flip = (i: number) => {
    const cur = upRef.current;
    if (done || found.has(i) || cur.includes(i) || cur.length >= 2) return;
    sfx.blip();
    const now = [...cur, i];
    setUp(now);
    if (now.length < 2) return;
    setTries((t) => t + 1);
    const [a, b] = now;
    if (cards[a] === cards[b]) {
      timer.current = setTimeout(() => {
        sfx.confirm();
        setFound((f) => new Set([...f, a, b]));
        setUp([]);
      }, 350);
    } else {
      timer.current = setTimeout(() => setUp([]), 900);
    }
  };
  useEffect(() => {
    if (done) sfx.victory();
  }, [done]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (done && (e.key === 'z' || e.key === 'Z' || e.key === 'Enter')) finish();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });
  const finish = () => {
    onEnd(done ? tries : null);
    backToWorld();
  };
  const medal = { gold: L('Médaille d’or !', 'Gold medal!'), silver: L('Médaille d’argent !', 'Silver medal!'), bronze: L('Médaille de bronze !', 'Bronze medal!') }[prizeTier(tries)];
  return (
    <Frame title={tr(L('Mémo', 'Memo'))} onBack={finish} backLabel={done ? 'OK' : tr(L('Quitter', 'Quit'))} class="memo">
      <Window seyes class="memo__note">
        {done
          ? `${tr(L('Toutes les paires en {t} essais.', 'All pairs in {t} tries.'), { t: tries })} ${tr(medal)}`
          : tr(L('Retourne deux cartes : trouve les paires de dessins ! Essais : {t}', 'Turn over two cards: find the matching drawings! Tries: {t}'), { t: tries })}
      </Window>
      <div class="memo__grid">
        {cards.map((sp, i) => {
          const shown = found.has(i) || up.includes(i);
          return (
            <button class={`memo__card ${shown ? 'is-up' : ''} ${found.has(i) ? 'is-found' : ''}`} onClick={() => flip(i)} aria-label={shown ? tr(creature(sp).name) : '?'}>
              {shown ? <img class="mon-art" src={artUrl(creature(sp))} alt="" /> : <span class="memo__back" aria-hidden="true" />}
            </button>
          );
        })}
      </div>
      {done && <button class="pbtn pbtn--accent memo__ok" onClick={finish}>OK</button>}
    </Frame>
  );
}
