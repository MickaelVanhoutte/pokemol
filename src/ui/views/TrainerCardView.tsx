import { useState } from 'preact/hooks';
import { L, tr } from '../../i18n';
import { dexCount } from '../../data/creatures';
import { item } from '../../data/items';
import type { Reward, TrackState } from '../../data/progress';
import { badgeDef } from '../../data/badges';
import { TYPES } from '../../data/types';
import type { SaveData } from '../../save/schema';
import { Frame, PixelIcon, Window } from '../paper';
import { hourNow, phaseAt } from '../../state/clock';
import { useMenuNav } from '../paper/nav';
import './views.css';

/** Papeterre’s hour, with a sun or a moon. */
const clock = (h: number) => `${String(Math.floor(h)).padStart(2, '0')}:${String(Math.floor((h % 1) * 60)).padStart(2, '0')} ${phaseAt(h) === 'night' ? '☾' : '☼'}`;

const time = (ms: number) => {
  const m = Math.floor(ms / 60000);
  return `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`;
};

/** Gold stars on the card, FRLG style: Grand Concours, full Bestiodex, all pages, a long tower streak. */
export function cardStars(save: SaveData): number {
  return [!!save.hallOfFame?.length, !!save.flags.dexDiploma, !!save.flags.pagesReward, (save.tower?.best ?? 0) >= 21].filter(Boolean).length;
}

type Page = 0 | 1;
const PAGES = [L('CARTE', 'CARD'), L('PROGRÈS', 'PROGRESS')];

/** What a milestone gives, as words: « Super Croque-Carnet ×5 », or a biscuit pack. */
export function rewardText(reward: Reward[]): string {
  if (reward.length > 1 && reward.every((r) => r.item.startsWith('biscuit-'))) {
    return tr(reward[0].n > 1 ? L('Lot de biscuits ×{n}', 'Biscuit pack ×{n}') : L('Lot de biscuits', 'Biscuit pack'), { n: reward[0].n });
  }
  return reward.map((r) => `${tr(item(r.item).name)}${r.n > 1 ? ` ×${r.n}` : ''}`).join(' + ');
}

/**
 * FRLG trainer card: name, ID, money, Bestiodex, play time and the 8 badge slots; a second page shows the
 * Progress tracks and their rewards to collect.
 */
/** A level grown in the real house, as the card shows it. */
export interface RealRow { name: string; pips: string; effect: string }

export function TrainerCardView({ save, avatar, onLook, onClose, progress = [], more, onCollect, note, initialPage = 0, real }: {
  save: SaveData; avatar: string; onLook?: () => void; onClose: () => void;
  /** The Progress tracks shown; `more`: the post-game ones are still to come. */
  progress?: TrackState[]; more?: boolean; onCollect?: (track: string) => void;
  /** What was just collected. */
  note?: string | null;
  initialPage?: Page;
  /** The levels grown in the real house (after the first day there). */
  real?: RealRow[];
}) {
  const [page, setPage] = useState<Page>(initialPage);
  const turn = (d: 1 | -1) => setPage((p) => (((p + d + 2) % 2) as Page));
  const [cur, setCur] = useMenuNav(page === 1 ? Math.max(1, progress.length) : 1, {
    onSelect: (i) => (page === 1 ? progress[i]?.ready && onCollect?.(progress[i].track.id) : onClose()),
    onCancel: onClose,
    onSide: (d) => turn(d),
  });
  const waiting = progress.some((p) => p.ready);
  // swipe between pages
  let x0 = 0;
  const down = (e: PointerEvent) => (x0 = e.clientX);
  const up = (e: PointerEvent) => {
    const dx = e.clientX - x0;
    if (Math.abs(dx) > 50) turn(dx < 0 ? 1 : -1);
  };
  return (
    <Frame title={tr(L('Carte de dresseur', 'Trainer card'))} onBack={onClose}>
      <div class="tcard__pages" onPointerDown={down} onPointerUp={up}>
        <div class="summary__tabs tcard__tabs">
          <button class="pbtn" onClick={() => turn(-1)} aria-label="◀">◀</button>
          <div class="summary__tabnames">
            {PAGES.map((p, i) => (
              <button class={`summary__tab ${i === page ? 'is-on' : ''}`} onClick={() => setPage(i as Page)}>
                {tr(p)}{i === 1 && waiting && <b class="newdot" aria-label="!">!</b>}
              </button>
            ))}
          </div>
          <button class="pbtn" onClick={() => turn(1)} aria-label="▶">▶</button>
        </div>
        {page === 0 ? <CardPage save={save} avatar={avatar} onLook={onLook} /> : (
          <ProgressPage progress={progress} more={more} cur={cur} onCursor={setCur} onCollect={onCollect} note={note} real={real} />
        )}
      </div>
    </Frame>
  );
}

function CardPage({ save, avatar, onLook }: { save: SaveData; avatar: string; onLook?: () => void }) {
  const id = String(save.createdAt % 100000).padStart(5, '0');
  const slots = Array.from({ length: 8 }, (_, i) => save.badges[i]);
  const stars = cardStars(save);
  return (
    <Window class="tcard">
      <div class="tcard__top">
        {stars > 0 && <span class="tcard__stars" aria-label={`${stars} ★`}>{'★'.repeat(stars)}</span>}
        <span>{tr(L('N° ID', 'IDNo.'))} {id}</span>
      </div>
      <div class="tcard__body">
        <dl class="kv tcard__kv">
          <dt>{tr(L('NOM', 'NAME'))}</dt><dd>{save.player.name}</dd>
          <dt>{tr(L('ARGENT', 'MONEY'))}</dt><dd>{save.money} ₽</dd>
          <dt>{tr(L('BESTIODEX', 'CRITTERDEX'))}</dt><dd>{dexCount(save.dex.caught)}</dd>
          <dt>{tr(L('TEMPS', 'TIME'))}</dt><dd>{time(save.playMs)}</dd>
          <dt>{tr(L('HEURE', 'CLOCK'))}</dt><dd>{clock(hourNow(save.clockShift ?? 0))}</dd>
          {!!save.hallOfFame?.length && <><dt>{tr(L('CONCOURS', 'CONTEST'))}</dt><dd>×{save.hallOfFame.length}</dd></>}
          {!!save.tower?.best && <><dt>{tr(L('TOUR', 'TOWER'))}</dt><dd title={tr(L('Meilleure série', 'Best streak'))}>{save.tower.best}</dd></>}
        </dl>
        <div class="tcard__me">
          <img class="tcard__avatar" src={avatar} alt="" />
          {onLook && <button class="pbtn tcard__look" onClick={onLook}>{tr(L('Mon look', 'My look'))}</button>}
        </div>
      </div>
      <p class="tcard__label">{tr(L('BADGES', 'BADGES'))}</p>
      <div class="tcard__badges">
        {slots.map((b) => {
          const def = b ? badgeDef(b) : undefined;
          return (
            <span class={`sticker ${def ? 'is-on' : ''}`} style={def ? { '--b': def.color } : undefined} title={def ? tr(def.name) : ''}>
              {def && <svg viewBox="0 0 24 24" aria-hidden="true"><path d={TYPES[def.type].icon} fill="#fff" /></svg>}
            </span>
          );
        })}
      </div>
    </Window>
  );
}

/** One row per track: its next milestone, how far along you are, and its reward (a button once reached). */
function ProgressPage({ progress, more, cur, onCursor, onCollect, note, real }: {
  progress: TrackState[]; more?: boolean; cur: number; onCursor: (i: number) => void; onCollect?: (track: string) => void; note?: string | null; real?: RealRow[];
}) {
  return (
    <Window class="tcard prog">
      {note && <p class="prog__note" role="status">{note}</p>}
      <div class="prog__list">
        {progress.map((p, i) => {
          const m = p.next;
          const all = p.track.steps.length;
          return (
            <div class={`prog__row ${i === cur ? 'is-on' : ''} ${p.ready ? 'is-ready' : ''} ${m ? '' : 'is-done'}`} onPointerEnter={(e) => e.pointerType === 'mouse' && onCursor(i)}>
              <div class="prog__head">
                <span class="prog__name">{tr(p.track.name)}</span>
                <span class="prog__done" title={tr(L('Récompenses récupérées', 'Rewards collected'))}>{p.done}/{all}</span>
              </div>
              {m ? (
                <>
                  <div class="prog__goal">
                    <span>{tr(m.label ?? p.track.label, { n: m.goal })}</span>
                    <span class="prog__count">{Math.min(p.count, m.goal)}/{m.goal}</span>
                  </div>
                  <span class="prog__bar"><span style={{ width: `${Math.min(100, (p.count / m.goal) * 100)}%` }} /></span>
                  {p.ready ? (
                    <button class="pbtn prog__get" onClick={() => { onCursor(i); onCollect?.(p.track.id); }}>
                      <PixelIcon id={m.reward[0].item} size={20} />
                      <span>{tr(L('Récupérer', 'Collect'))} : {rewardText(m.reward)}</span>
                    </button>
                  ) : (
                    <p class="prog__prize"><PixelIcon id={m.reward[0].item} size={20} /><span>{rewardText(m.reward)}</span></p>
                  )}
                </>
              ) : <p class="prog__goal">{tr(L('Tout est récupéré ! ★', 'All collected! ★'))}</p>}
            </div>
          );
        })}
        {real && (
          <div class="prog__row prog__real">
            <div class="prog__head"><span class="prog__name">{tr(L('Dans ta vraie chambre', 'In your real bedroom'))}</span></div>
            {real.map((r) => (
              <p class="prog__goal"><span>{r.name} <span class="prog__pips">{r.pips}</span></span><span class="prog__count">{r.effect}</span></p>
            ))}
          </div>
        )}
        {more && (
          <div class="prog__row is-locked">
            <div class="prog__head"><span class="prog__name">{tr(L('Après l’histoire', 'After the story'))}</span><span>?</span></div>
            <p class="prog__goal">{tr(L('D’autres défis t’attendront…', 'More challenges will be waiting…'))}</p>
          </div>
        )}
      </div>
    </Window>
  );
}
