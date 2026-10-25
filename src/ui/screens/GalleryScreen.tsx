import { useEffect, useState } from 'preact/hooks';
import { t } from '../../i18n';
import { CREATURES } from '../../data/creatures';
import { SUPPORT_CARDS } from '../../data/supportCards';
import type { CreatureDef, SupportDef } from '../../data/schema';
import { go } from '../../state/router';
import { Card, SupportCard } from '../Card';
import { L } from '../../i18n';
import { STARTER_DECK } from '../../data/supportCards';
import { newSeed } from '../../engine/rng';

function quickBattle(wild: boolean) {
  const ids = CREATURES.map((c) => c.id);
  const pick = (n: number) => [...ids].sort(() => Math.random() - 0.5).slice(0, n).map((defId) => ({ defId, level: 3 }));
  go({
    id: 'battle',
    props: {
      setup: {
        kind: wild ? 'wild' : 'trainer',
        seed: newSeed(),
        player: { name: L('Toi', 'You'), team: pick(3), deck: [...STARTER_DECK, 'professeur', 'piece'], isAI: false },
        enemy: { name: L('Gomme', 'Eraser'), team: pick(wild ? 1 : 3), deck: wild ? [] : [...STARTER_DECK], isAI: true },
      },
      blankCards: 3,
      backdrop: wild ? 'grass' : 'lab',
      onEnd: () => go({ id: 'gallery' }),
    },
  });
}

function useCardWidth(): number {
  const calc = () => Math.min(260, Math.floor((Math.min(window.innerWidth, 1200) - 48) / 2));
  const [w, setW] = useState(calc);
  useEffect(() => {
    const on = () => setW(calc());
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);
  return w;
}

export function GalleryScreen() {
  const [tab, setTab] = useState<'creatures' | 'supports'>('creatures');
  const [zoom, setZoom] = useState<CreatureDef | SupportDef | null>(null);
  const w = useCardWidth();
  const big = Math.min(440, window.innerWidth - 32, Math.floor((window.innerHeight - 32) * 0.7));
  return (
    <div class="screen">
      <div class="screen__bar">
        <button class="btn btn--small" onClick={() => go({ id: 'title' })}>← {t('menu.back')}</button>
        <h1>{t('gallery.title')}</h1>
        <div class="tabs">
          <button class="btn btn--small" aria-pressed={tab === 'creatures'} onClick={() => setTab('creatures')}>{t('gallery.creatures')}</button>
          <button class="btn btn--small" aria-pressed={tab === 'supports'} onClick={() => setTab('supports')}>{t('gallery.supports')}</button>
        </div>
        <div class="tabs">
          <button class="btn btn--small btn--ghost" onClick={() => quickBattle(false)}>⚔️ {t('gallery.testBattle')}</button>
          <button class="btn btn--small btn--ghost" onClick={() => quickBattle(true)}>🌿 {t('gallery.testWild')}</button>
        </div>
      </div>
      <div class="card-grid">
        {tab === 'creatures'
          ? CREATURES.map((c) => <Card def={c} width={w} onClick={() => setZoom(c)} />)
          : SUPPORT_CARDS.map((s) => <SupportCard def={s} width={w} onClick={() => setZoom(s)} />)}
      </div>
      {zoom && (
        <div class="overlay" onClick={() => setZoom(null)}>
          {'attacks' in zoom ? <Card def={zoom} width={big} /> : <SupportCard def={zoom} width={big} />}
        </div>
      )}
    </div>
  );
}
