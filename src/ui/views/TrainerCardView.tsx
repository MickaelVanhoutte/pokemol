import { L, tr } from '../../i18n';
import { badgeDef } from '../../data/badges';
import { TYPES } from '../../data/types';
import type { SaveData } from '../../save/schema';
import { Frame, Window } from '../paper';
import { useMenuNav } from '../paper/nav';
import './views.css';

const time = (ms: number) => {
  const m = Math.floor(ms / 60000);
  return `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`;
};

/** FRLG trainer card: name, ID, money, Bestiodex, play time and the 8 badge slots. */
export function TrainerCardView({ save, avatar, onClose }: { save: SaveData; avatar: string; onClose: () => void }) {
  useMenuNav(1, { onSelect: onClose, onCancel: onClose });
  const id = String(save.createdAt % 100000).padStart(5, '0');
  const slots = Array.from({ length: 8 }, (_, i) => save.badges[i]);
  return (
    <Frame title={tr(L('Carte de dresseur', 'Trainer card'))} onBack={onClose}>
      <Window class="tcard">
        <div class="tcard__top">
          <span>{tr(L('N° ID', 'IDNo.'))} {id}</span>
        </div>
        <div class="tcard__body">
          <dl class="kv tcard__kv">
            <dt>{tr(L('NOM', 'NAME'))}</dt><dd>{save.player.name}</dd>
            <dt>{tr(L('ARGENT', 'MONEY'))}</dt><dd>{save.money} ₽</dd>
            <dt>{tr(L('BESTIODEX', 'CRITTERDEX'))}</dt><dd>{save.dex.caught.length}</dd>
            <dt>{tr(L('TEMPS', 'TIME'))}</dt><dd>{time(save.playMs)}</dd>
          </dl>
          <img class="tcard__avatar picon" src={avatar} alt="" />
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
    </Frame>
  );
}
