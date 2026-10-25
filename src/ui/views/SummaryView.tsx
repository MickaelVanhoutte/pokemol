import { useState } from 'preact/hooks';
import { L, tr, type LText } from '../../i18n';
import { artUrl, creature } from '../../data/creatures';
import { move } from '../../data/moves';
import { STAT_NAMES, TYPES } from '../../data/types';
import { MAX_LEVEL, maxHp, statsOf, xpAt, type Mon } from '../../engine/pk/creature';
import { HpBar, MenuList, PixelIcon, StatusTag, TextBox, TypeBadge, Window, XpBar, YesNo, lv } from '../paper';
import { item } from '../../data/items';
import { judge } from '../../engine/pk/judge';
import { useMenuNav } from '../paper/nav';
import './views.css';

type Page = 0 | 1 | 2;
const PAGES = [L('INFOS', 'INFO'), L('STATS', 'SKILLS'), L('CAPACITÉS', 'MOVES')];

const POTENTIAL: LText[] = [
  L('Globalement, son potentiel est correct.', 'Overall, its potential is decent.'),
  L('Globalement, son potentiel est au-dessus de la moyenne.', 'Overall, its potential is above average.'),
  L('Globalement, son potentiel est vraiment remarquable.', 'Overall, its potential is relatively superior.'),
  L('Globalement, son potentiel est exceptionnel !', 'Overall, its potential is outstanding!'),
];
const RATING: LText[] = [
  L('C’est plutôt correct.', 'That stat is rather decent.'),
  L('C’est très bon !', 'It’s very good!'),
  L('C’est fantastique !', 'It’s fantastic!'),
  L('On ne peut pas faire mieux !', 'It can’t be any better!'),
];

/** What the judge says about the IVs (the qualities a creature was born with). */
function verdictText(mon: Mon): string {
  const v = judge(mon);
  const names = v.best.map((k) => tr(STAT_NAMES[k]));
  const and = tr(L(' et ', ' and '));
  const best = names.length > 1 ? `${names.slice(0, -1).join(', ')}${and}${names[names.length - 1]}` : names[0];
  return [
    tr(POTENTIAL[v.potential]),
    tr(names.length > 1 ? L('Ses meilleures qualités : {s}.', 'Its best qualities: {s}.') : L('Sa meilleure qualité : {s}.', 'Its best quality: {s}.'), { s: best }),
    tr(RATING[v.bestRating]),
  ].join(' ');
}

/**
 * FRLG summary: INFOS / STATS / CAPACITÉS. With `learn`, opens on the moves page with the new
 * move as a 5th row: picking a row forgets it (`null` = give up the new move).
 */
export function SummaryView({ mon, onClose, learn }: {
  mon: Mon; onClose: () => void; learn?: { move: string; onPick: (forget: number | null) => void };
}) {
  const [page, setPage] = useState<Page>(learn ? 2 : 0);
  const [sel, setSel] = useState<number | null>(null);
  const [confirm, setConfirm] = useState<number | null>(null);
  const [judging, setJudging] = useState(false);
  const sp = creature(mon.species);
  const color = TYPES[sp.type].color;
  const turn = (d: 1 | -1) => !learn && setPage((p) => (((p + d + 3) % 3) as Page));
  useMenuNav(0, {
    active: confirm === null && !judging,
    onSelect: () => undefined,
    onCancel: () => (learn ? setConfirm(4) : onClose()),
  });
  // swipe between pages
  let x0 = 0;
  const down = (e: PointerEvent) => (x0 = e.clientX);
  const up = (e: PointerEvent) => {
    const dx = e.clientX - x0;
    if (Math.abs(dx) > 50) turn(dx < 0 ? 1 : -1);
  };
  const moves = learn ? [...mon.moves.map((m) => m.id), learn.move] : mon.moves.map((m) => m.id);
  const detail = sel !== null ? move(moves[sel]) : null;
  const stats = statsOf(mon);
  const toNext = mon.level >= MAX_LEVEL ? 0 : xpAt(mon.level + 1) - mon.xp;
  const xpPct = mon.level >= MAX_LEVEL ? 100 : ((mon.xp - xpAt(mon.level)) / (xpAt(mon.level + 1) - xpAt(mon.level))) * 100;

  return (
    <div class="frame graph summary" style={{ '--type': color }} onPointerDown={down} onPointerUp={up}>
      <div class="summary__tabs">
        {!learn && <button class="pbtn" onClick={() => turn(-1)} aria-label="◀">◀</button>}
        <div class="summary__tabnames">
          {PAGES.map((p, i) => <span class={i === page ? 'is-on' : ''} onClick={() => !learn && setPage(i as Page)}>{tr(p)}</span>)}
        </div>
        {!learn && <button class="pbtn" onClick={() => turn(1)} aria-label="▶">▶</button>}
      </div>
      <Window class="summary__head">
        <div class="summary__art"><img class="mon-art" src={artUrl(sp)} alt="" /></div>
        <div class="summary__id">
          <b class="summary__name">{tr(sp.name)}</b>
          <span>{lv(mon.level)} {mon.status && <StatusTag s={mon.status} />}</span>
          <TypeBadge type={sp.type} />
        </div>
      </Window>

      <div class="summary__page">
        {page === 0 && (
          <Window class="summary__box">
            <dl class="kv">
              <dt>{tr(L('N° Dex', 'Dex No.'))}</dt><dd>{sp.id}</dd>
              <dt>{tr(L('Espèce', 'Kind'))}</dt><dd>{tr(sp.kind)}</dd>
              <dt>{tr(L('Type', 'Type'))}</dt><dd><TypeBadge type={sp.type} /></dd>
              <dt>{tr(L('Objet tenu', 'Item'))}</dt>
              <dd class="summary__held">{mon.item ? <><PixelIcon id={mon.item} size={18} /> {tr(item(mon.item).name)}</> : tr(L('Aucun', 'None'))}</dd>
              {sp.evolvesTo && sp.evolveLevel && (
                <><dt>{tr(L('Évolution', 'Evolves'))}</dt><dd>{tr(L('{n} au N.{l}', '{n} at Lv{l}'), { n: tr(creature(sp.evolvesTo).name), l: sp.evolveLevel })}</dd></>
              )}
            </dl>
            <p class="summary__dex">{tr(sp.dex)}</p>
          </Window>
        )}
        {page === 1 && (
          <Window class="summary__box">
            <div class="summary__hp">
              <span class="hp-label">{tr(L('PV', 'HP'))}</span>
              <HpBar hp={mon.hp} max={maxHp(mon)} />
              <span>{mon.hp}/{maxHp(mon)}</span>
            </div>
            <dl class="kv kv--stats">
              {(['atk', 'def', 'spa', 'spd', 'spe'] as const).map((k) => (
                <><dt>{tr(STAT_NAMES[k])}</dt><dd>{stats[k]}</dd></>
              ))}
              <dt>{tr(L('Points Exp.', 'Exp. Points'))}</dt><dd>{mon.xp}</dd>
              <dt>{tr(L('Niveau suivant', 'Next Lv.'))}</dt><dd>{toNext || '—'}</dd>
            </dl>
            <div class="summary__xp"><span>EXP</span><XpBar pct={xpPct} /></div>
          </Window>
        )}
        {page === 2 && (
          <>
            {learn && <p class="summary__hint">{tr(L('Quelle capacité oublier ?', 'Which move should be forgotten?'))}</p>}
            <Window class="summary__box summary__moves">
              <MenuList
                active={confirm === null}
                onCursor={(i) => setSel(i)}
                onCancel={() => (learn ? setConfirm(4) : onClose())}
                items={moves.map((id, i) => {
                  const mv = move(id);
                  const pp = i < mon.moves.length ? mon.moves[i].pp : mv.pp;
                  return {
                    label: <span class={`mvline ${learn && i === 4 ? 'is-new' : ''}`}><TypeBadge type={mv.type} /> {tr(mv.name)}</span>,
                    side: `PP ${pp}/${mv.pp}`,
                    onSelect: () => (learn ? setConfirm(i) : setSel(i)),
                  };
                })}
              />
            </Window>
            <Window class="summary__box summary__detail">
              {detail ? (
                <>
                  <p class="summary__stats">
                    {detail.cat === 'status' ? tr(L('Statut', 'Status')) : `${tr(L('Puissance', 'Power'))} ${detail.power}`}
                    {' · '}{tr(L('Précision', 'Accuracy'))} {detail.acc ?? '—'}
                  </p>
                  <p>{tr(detail.desc)}</p>
                </>
              ) : <p>{tr(L('Touche une capacité pour la décrire.', 'Tap a move to read about it.'))}</p>}
            </Window>
          </>
        )}
      </div>

      <div class="frame__foot summary__foot">
        {page === 1 && !learn && <button class="pbtn" onClick={() => setJudging(true)}>{tr(L('Juger', 'Judge'))}</button>}
        <button class="pbtn pbtn--b" onClick={() => (learn ? setConfirm(4) : onClose())}>{tr(L('Retour', 'Back'))}</button>
      </div>

      {judging && (
        <div class="view-modal">
          <TextBox class="view-modal__text" speaker={tr(L('Juge', 'Judge'))} text={verdictText(mon)} keys onAdvance={() => setJudging(false)} />
        </div>
      )}

      {learn && confirm !== null && (
        <div class="view-modal">
          <Window seyes class="view-modal__text">
            {confirm === 4
              ? tr(L('Abandonner l’apprentissage de {m} ?', 'Stop learning {m}?'), { m: tr(move(learn.move).name) })
              : tr(L('Oublier {o} pour apprendre {m} ?', 'Forget {o} to learn {m}?'), { o: tr(move(moves[confirm]).name), m: tr(move(learn.move).name) })}
          </Window>
          <YesNo onAnswer={(yes) => {
            const c = confirm;
            setConfirm(null);
            if (yes) learn.onPick(c === 4 ? null : c);
          }} />
        </div>
      )}
    </div>
  );
}
