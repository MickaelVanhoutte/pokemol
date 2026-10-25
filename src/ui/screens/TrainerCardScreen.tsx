import { useMemo } from 'preact/hooks';
import { AVATARS, SpriteSheet } from '../../overworld/sprites';
import { backToWorld } from '../../overworld/controller';
import { save } from '../../state/game';
import { TrainerCardView } from '../views/TrainerCardView';

export function avatarImage(i: number): string {
  const sheet = new SpriteSheet(AVATARS[i] ?? AVATARS[0]);
  const c = document.createElement('canvas');
  c.width = 16;
  c.height = 16;
  c.getContext('2d')!.drawImage(sheet.canvas, 0, 0, 16, 16, 0, 0, 16, 16);
  return c.toDataURL();
}

export function TrainerCardScreen() {
  const d = save.value!;
  const avatar = useMemo(() => avatarImage(d.player.avatar), [d.player.avatar]);
  return <TrainerCardView save={d} avatar={avatar} onClose={backToWorld} />;
}
