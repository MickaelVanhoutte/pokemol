import { useEffect, useRef, useState } from 'preact/hooks';
import { L, tr, type LText } from '../../i18n';
import {
  CUSTOM_TALENTS, NAME_MAX, STAT_MAX, STAT_MIN, STAT_PRESETS, STAT_STEP, STAT_TOTAL,
  customMovePool, designProblems, statTotal, typesOfDesign, type CustomDesign,
} from '../../data/custom';
import { move } from '../../data/moves';
import { talent } from '../../data/talents';
import { STAT_NAMES, TYPES } from '../../data/types';
import type { StatKey, TypeId } from '../../data/schema';
import { drawnBox, fillArea, miniOfDrawing } from '../../art/drawn';
import { Frame, MoveButton, MoveInfo, TypeBadge, Window, YesNo } from '../paper';
import './atelier.css';

type Tab = 'draw' | 'types' | 'stats' | 'talent' | 'moves' | 'name';
const TABS: { id: Tab; name: LText }[] = [
  { id: 'draw', name: L('Dessin', 'Drawing') },
  { id: 'types', name: L('Types', 'Types') },
  { id: 'stats', name: L('Stats', 'Stats') },
  { id: 'talent', name: L('Talent', 'Talent') },
  { id: 'moves', name: L('Capas', 'Moves') },
  { id: 'name', name: L('Nom', 'Name') },
];
const STATS: StatKey[] = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'];

/**
 * L'Atelier des Brouillons: the player draws their own Bestiole and makes it what they like (src/data/custom.ts).
 * A pure view: the design in, the finished design out (`onDone`), or nothing (`onCancel`).
 */
export function AtelierView({ design, onDone, onCancel }: { design: CustomDesign; onDone: (d: CustomDesign) => void; onCancel: () => void }) {
  const [d, setD] = useState<CustomDesign>(design);
  const [tab, setTab] = useState<Tab>(design.art ? 'name' : 'draw');
  const [leaving, setLeaving] = useState(false);
  // a change made from the latest design, so quick taps never undo each other
  const set = (patch: Partial<CustomDesign> | ((x: CustomDesign) => Partial<CustomDesign>)) => setD((x) => ({ ...x, ...(typeof patch === 'function' ? patch(x) : patch) }));
  const problems = designProblems(d);
  const dirty = d !== design;
  return (
    <Frame
      class="atelier"
      title={tr(L('Atelier des Brouillons', 'Draft Workshop'))}
      onBack={() => (dirty ? setLeaving(true) : onCancel())}
      backLabel={tr(L('Partir', 'Leave'))}
      foot={leaving ? (
        <div class="atelier__foot">
          <Window seyes class="atelier__note">{tr(L('Partir sans garder ce que tu as changé ?', 'Leave without keeping your changes?'))}</Window>
          <YesNo onAnswer={(yes) => (yes ? onCancel() : setLeaving(false))} />
        </div>
      ) : (
        <div class="atelier__foot">
          <Window seyes class="atelier__note">{problems.length ? tr(problems[0]) : tr(L('Elle est prête !', 'It’s ready!'))}</Window>
          <button class="pbtn pbtn--accent" disabled={!!problems.length} onClick={() => onDone(d)}>{tr(L('Terminer', 'Finish'))}</button>
        </div>
      )}
    >
      <div class="atelier__tabs">
        {TABS.map((t) => <button class={`atelier__tab ${t.id === tab ? 'is-on' : ''}`} onClick={() => setTab(t.id)}>{tr(t.name)}</button>)}
      </div>
      <div class="atelier__page">
        {tab === 'draw' && <DrawPad art={d.art} onChange={(art, mini) => set({ art, mini })} />}
        {tab === 'types' && <TypesPage d={d} set={set} />}
        {tab === 'stats' && <StatsPage d={d} set={set} />}
        {tab === 'talent' && <TalentPage d={d} set={set} />}
        {tab === 'moves' && <MovesPage d={d} set={set} />}
        {tab === 'name' && <NamePage d={d} set={set} />}
      </div>
    </Frame>
  );
}

type PageProps = { d: CustomDesign; set: (patch: Partial<CustomDesign> | ((x: CustomDesign) => Partial<CustomDesign>)) => void };

/** Graphite, a black felt for the outline, then the crayons; white goes over colours like paper showing through. */
const CRAYONS = ['#4d4858', '#231d2b', '#e0574f', '#f39a3e', '#f2c84e', '#5fb35a', '#2f8f7a', '#5b8fd6', '#9a7ad0', '#ee8fb0', '#9b6a45', '#fffaf0'];
const SIZES = [4, 10, 22];
const SIDE = 512;

/**
 * The drawing sheet: a see-through canvas over ruled paper, drawn with the finger or the mouse. After each
 * stroke the drawing is trimmed and saved with its miniature (`onChange`).
 */
function DrawPad({ art, onChange }: { art: string; onChange: (art: string, mini: string) => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [colour, setColour] = useState(CRAYONS[0]);
  const [size, setSize] = useState(1);
  const [tool, setTool] = useState<'pencil' | 'eraser' | 'fill'>('pencil');
  const eraser = tool === 'eraser';
  const [oops, setOops] = useState(false);
  const undo = useRef<ImageData[]>([]);
  const [undoable, setUndoable] = useState(0);
  const stroke = useRef<{ id: number; x: number; y: number } | null>(null);

  // the saved drawing comes back on the sheet, centred, to retouch it
  useEffect(() => {
    if (!art) return;
    const img = new Image();
    img.onload = () => {
      const g = ref.current?.getContext('2d');
      if (!g) return;
      const k = Math.min((SIDE * 0.86) / img.naturalWidth, (SIDE * 0.86) / img.naturalHeight, 2);
      const w = img.naturalWidth * k, h = img.naturalHeight * k;
      g.drawImage(img, (SIDE - w) / 2, (SIDE - h) / 2, w, h);
    };
    img.src = art;
  }, []);

  const ctx = () => ref.current!.getContext('2d', { willReadFrequently: true })!;
  const at = (e: PointerEvent) => {
    const r = ref.current!.getBoundingClientRect();
    return { x: ((e.clientX - r.left) * SIDE) / r.width, y: ((e.clientY - r.top) * SIDE) / r.height };
  };
  const remember = () => {
    undo.current.push(ctx().getImageData(0, 0, SIDE, SIDE));
    if (undo.current.length > 12) undo.current.shift();
    setUndoable(undo.current.length);
  };
  // a pencil line: the stroke, then two lighter passes a little off it, like a crayon on paper
  const line = (x0: number, y0: number, x1: number, y1: number) => {
    const g = ctx();
    const w = SIZES[size];
    g.lineCap = g.lineJoin = 'round';
    g.globalCompositeOperation = eraser ? 'destination-out' : 'source-over';
    g.strokeStyle = eraser ? '#000' : colour;
    const passes = eraser ? [[0, 1, 1]] : [[0, 0.9, 1], [w * 0.18, 0.35, 0.55], [-w * 0.15, 0.3, 0.5]];
    for (const [off, alpha, k] of passes) {
      g.globalAlpha = alpha;
      g.lineWidth = Math.max(1.5, w * k);
      g.beginPath();
      g.moveTo(x0 + off, y0 - off * 0.5);
      g.lineTo(x1 + off, y1 - off * 0.5);
      g.stroke();
    }
    g.globalAlpha = 1;
    g.globalCompositeOperation = 'source-over';
  };
  /**
   * The fill pencil: the area colours in with crayon strokes, coarse and visible, two passes crossing with paper
   * showing between them, slipping a little under the lines (on the paper it goes behind what is drawn).
   */
  const fill = (x: number, y: number) => {
    const g = ctx();
    const area = fillArea(g.getImageData(0, 0, SIDE, SIDE), x, y);
    if (!area) {
      setOops(true);
      setTimeout(() => setOops(false), 2200);
      return false;
    }
    const onPaper = g.getImageData(Math.round(x), Math.round(y), 1, 1).data[3] < 40;
    const t = document.createElement('canvas');
    t.width = t.height = SIDE;
    const h = t.getContext('2d')!;
    let seed = Math.round(x * 31 + y * 17);
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    h.strokeStyle = colour;
    h.lineCap = 'round';
    for (const [k, step, width, alpha] of [[0.65, 5, 5, 0.85], [-1.3, 9, 3, 0.4]]) {
      for (let d = -SIDE * 1.4; d < SIDE * 1.4; d += step + rnd() * 2.5) {
        h.globalAlpha = alpha * (0.75 + rnd() * 0.25);
        h.lineWidth = width * (0.75 + rnd() * 0.5);
        h.beginPath();
        h.moveTo(d, 0);
        h.quadraticCurveTo(d + (k * SIDE) / 2 + (rnd() - 0.5) * 8, SIDE / 2, d + k * SIDE, SIDE);
        h.stroke();
      }
    }
    const mask = h.createImageData(SIDE, SIDE);
    for (let i = 0; i < area.length; i++) mask.data[i * 4 + 3] = area[i] ? 255 : 0;
    const m = document.createElement('canvas');
    m.width = m.height = SIDE;
    m.getContext('2d')!.putImageData(mask, 0, 0);
    h.globalAlpha = 1;
    h.globalCompositeOperation = 'destination-in';
    h.drawImage(m, 0, 0);
    g.globalCompositeOperation = onPaper ? 'destination-over' : 'source-over';
    g.drawImage(t, 0, 0);
    g.globalCompositeOperation = 'source-over';
    return true;
  };
  const save = () => {
    const g = ctx();
    const full = g.getImageData(0, 0, SIDE, SIDE);
    const box = drawnBox(full);
    if (!box) return onChange('', '');
    const cut = document.createElement('canvas');
    const k = Math.min(1, 384 / Math.max(box.w, box.h));
    cut.width = Math.round(box.w * k);
    cut.height = Math.round(box.h * k);
    cut.getContext('2d')!.drawImage(ref.current!, box.x, box.y, box.w, box.h, 0, 0, cut.width, cut.height);
    const webp = cut.toDataURL('image/webp', 0.86);
    const mini = miniOfDrawing(g.getImageData(box.x, box.y, box.w, box.h));
    const mc = document.createElement('canvas');
    mc.width = mini.width;
    mc.height = mini.height;
    mc.getContext('2d')!.putImageData(new ImageData(new Uint8ClampedArray(mini.data), mini.width, mini.height), 0, 0);
    onChange(webp.startsWith('data:image/webp') ? webp : cut.toDataURL('image/png'), mc.toDataURL('image/png'));
  };

  return (
    <div class="drawpad">
      <div class="drawpad__fit"><div class="drawpad__sheet">
        <canvas
          ref={ref}
          width={SIDE}
          height={SIDE}
          class="drawpad__canvas"
          onPointerDown={(e) => {
            if (stroke.current) return;
            if (tool === 'fill') {
              remember();
              const p = at(e);
              if (fill(p.x, p.y)) save();
              else undo.current.pop();
              setUndoable(undo.current.length);
              return;
            }
            (e.currentTarget as HTMLCanvasElement).setPointerCapture(e.pointerId);
            remember();
            const p = at(e);
            stroke.current = { id: e.pointerId, ...p };
            line(p.x, p.y, p.x + 0.1, p.y + 0.1);
          }}
          onPointerMove={(e) => {
            const s = stroke.current;
            if (!s || s.id !== e.pointerId) return;
            const p = at(e);
            line(s.x, s.y, p.x, p.y);
            stroke.current = { id: s.id, ...p };
          }}
          onPointerUp={(e) => {
            if (stroke.current?.id !== e.pointerId) return;
            stroke.current = null;
            save();
          }}
          onPointerCancel={() => {
            stroke.current = null;
            save();
          }}
        />
      </div></div>
      <div class="drawpad__tools">
        <p class={`drawpad__hint ${oops ? 'is-oops' : ''}`}>{tr(oops
          ? L('Le contour n’est pas fermé : referme-le avant de remplir !', 'The outline isn’t closed: close it before filling!')
          : tool === 'fill' ? L('Touche une zone fermée pour la colorier.', 'Tap a closed shape to colour it in.')
          : L('← Dessine-la tournée vers la gauche, en trois-quarts.', '← Draw it turned to the left, three-quarters on.'))}</p>
        <div class="drawpad__crayons">
          {CRAYONS.map((c) => (
            <button
              class={`drawpad__crayon ${!eraser && c === colour ? 'is-on' : ''}`}
              style={{ '--c': c }}
              aria-label={c}
              onClick={() => { setColour(c); if (eraser) setTool('pencil'); }}
            />
          ))}
        </div>
        <div class="drawpad__row">
          {SIZES.map((s, i) => (
            <button class={`pbtn drawpad__size ${i === size ? 'is-on' : ''}`} aria-label={`${s}`} onClick={() => { setSize(i); if (tool === 'fill') setTool('pencil'); }}>
              <span style={{ width: `${4 + i * 6}px`, height: `${4 + i * 6}px` }} />
            </button>
          ))}
          <button class={`pbtn ${tool === 'fill' ? 'is-on' : ''}`} onClick={() => setTool((v) => (v === 'fill' ? 'pencil' : 'fill'))}>{tr(L('Remplir', 'Fill'))}</button>
          <button class={`pbtn ${eraser ? 'is-on' : ''}`} onClick={() => setTool((v) => (v === 'eraser' ? 'pencil' : 'eraser'))}>{tr(L('Gomme', 'Eraser'))}</button>
          <button class="pbtn" disabled={!undoable} onClick={() => {
            const last = undo.current.pop();
            setUndoable(undo.current.length);
            if (last) ctx().putImageData(last, 0, 0);
            save();
          }}>{tr(L('Annuler', 'Undo'))}</button>
          <button class="pbtn" onClick={() => {
            remember();
            ctx().clearRect(0, 0, SIDE, SIDE);
            save();
          }}>{tr(L('Tout effacer', 'Clear'))}</button>
        </div>
      </div>
    </div>
  );
}

const ALL_TYPES = Object.keys(TYPES) as TypeId[];

function TypesPage({ d, set }: PageProps) {
  const chosen = typesOfDesign(d);
  const toggle = (t: TypeId) => set((x) => {
    const now = typesOfDesign(x);
    // a third pick takes the place of the oldest one
    const next = now.includes(t) ? now.filter((y) => y !== t) : now.length < 2 ? [...now, t] : [now[1], t];
    if (!next.length) return {};
    // its moves must stay among those its types allow
    const pool = customMovePool(next);
    return { type: next[0], type2: next[1], moves: x.moves.filter((m) => pool.includes(m)) };
  });
  return (
    <div class="atelier__types">
      <p class="atelier__help">{tr(L('Un ou deux types : touche-en un pour le choisir, encore pour l’enlever. Elle pourra apprendre les capacités de ses types et les capacités Normal.', 'One or two types: tap one to pick it, again to drop it. It can learn moves of its types and Normal moves.'))}</p>
      <div class="atelier__typegrid">
        {ALL_TYPES.map((t) => (
          <button class={`atelier__type ${chosen.includes(t) ? 'is-on' : ''}`} style={{ '--c': TYPES[t].color }} onClick={() => toggle(t)}>
            <TypeBadge type={t} />
          </button>
        ))}
      </div>
    </div>
  );
}

function StatsPage({ d, set }: PageProps) {
  const total = statTotal(d.base);
  const bump = (k: StatKey, by: number) => set((x) => {
    const v = x.base[k] + by;
    if (v < STAT_MIN || v > STAT_MAX || (by > 0 && statTotal(x.base) + by > STAT_TOTAL)) return {};
    return { base: { ...x.base, [k]: v } };
  });
  return (
    <div class="atelier__stats">
      <p class="atelier__help">
        {tr(L('Répartis {t} points ({min} à {max} par stat).', 'Spread {t} points ({min} to {max} per stat).'), { t: STAT_TOTAL, min: STAT_MIN, max: STAT_MAX })}
        {' '}<b class={total === STAT_TOTAL ? 'is-ok' : ''}>{tr(L('Reste {n}', '{n} left'), { n: STAT_TOTAL - total })}</b>
      </p>
      <div class="atelier__presets">
        {STAT_PRESETS.map((p) => <button class="pbtn" onClick={() => set({ base: { ...p.base } })}>{tr(p.name)}</button>)}
      </div>
      {STATS.map((k) => (
        <div class="atelier__stat">
          <span class="atelier__statname">{tr(STAT_NAMES[k])}</span>
          <button class="pbtn" aria-label="−" disabled={d.base[k] <= STAT_MIN} onClick={() => bump(k, -STAT_STEP)}>−</button>
          <b class="atelier__statval">{d.base[k]}</b>
          <button class="pbtn" aria-label="+" disabled={d.base[k] >= STAT_MAX || total >= STAT_TOTAL} onClick={() => bump(k, STAT_STEP)}>+</button>
          <span class="atelier__bar"><span style={{ width: `${(d.base[k] / STAT_MAX) * 100}%` }} /></span>
        </div>
      ))}
    </div>
  );
}

function TalentPage({ d, set }: PageProps) {
  return (
    <div class="atelier__talents">
      {CUSTOM_TALENTS.map((id) => {
        const t = talent(id);
        return (
          <button class={`atelier__talent ${id === d.talent ? 'is-on' : ''}`} onClick={() => set({ talent: id })}>
            <b>{tr(t.name)}</b>
            <span>{tr(t.desc)}</span>
          </button>
        );
      })}
    </div>
  );
}

function MovesPage({ d, set }: PageProps) {
  const pool = customMovePool(typesOfDesign(d));
  const [info, setInfo] = useState<string | null>(null);
  const toggle = (id: string) => set((x) => (x.moves.includes(id) ? { moves: x.moves.filter((m) => m !== id) } : x.moves.length < 4 ? { moves: [...x.moves, id] } : {}));
  const sorted = [...pool].sort((a, b) => (move(a).type === move(b).type ? move(a).power - move(b).power : move(a).type < move(b).type ? -1 : 1));
  return (
    <div class="atelier__movespage">
      <p class="atelier__help">{tr(L('Choisis jusqu’à 4 capacités ({n}/4). Appui long : détails.', 'Pick up to 4 moves ({n}/4). Hold for details.'), { n: d.moves.length })}</p>
      <div class="atelier__moves">
        {sorted.map((id) => (
          <MoveButton
            id={id}
            class={d.moves.includes(id) ? 'is-on' : ''}
            disabled={!d.moves.includes(id) && d.moves.length >= 4}
            onClick={() => toggle(id)}
            onHold={() => setInfo(id)}
          />
        ))}
      </div>
      {info && (
        <div class="bpanel__info" onClick={() => setInfo(null)}>
          <Window seyes><MoveInfo id={info} /></Window>
        </div>
      )}
    </div>
  );
}

function NamePage({ d, set }: PageProps) {
  const input = (value: string, placeholder: string, on: (v: string) => void) => (
    <input
      class="newgame__input"
      maxLength={NAME_MAX}
      value={value}
      placeholder={placeholder}
      onInput={(e) => on((e.target as HTMLInputElement).value)}
      // typing must not walk the player around or answer menus
      onKeyDown={(e) => e.stopPropagation()}
    />
  );
  return (
    <div class="atelier__name">
      <div class="atelier__card">
        {d.art ? <img class="mon-art" src={d.art} alt="" /> : <span class="atelier__empty">?</span>}
        <div class="atelier__badges">{typesOfDesign(d).map((t) => <TypeBadge type={t} />)}</div>
      </div>
      <label class="atelier__field">
        <span>{tr(L('Son nom', 'Its name'))}</span>
        <Window class="prologue__input">{input(d.name, tr(L('Gribouillon', 'Scribblet')), (name) => set({ name }))}</Window>
      </label>
      <label class="atelier__field">
        <span>{tr(L('Bestiole…', 'What kind…'))}</span>
        <Window class="prologue__input">{input(d.kind, tr(L('Rigolote', 'Funny')), (kind) => set({ kind }))}</Window>
      </label>
    </div>
  );
}
