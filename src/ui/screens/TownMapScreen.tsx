import { useMemo } from 'preact/hooks';
import { backToWorld } from '../../overworld/controller';
import { save } from '../../state/game';
import { TownMapView } from '../views/TownMapView';
import { avatarImage } from './TrainerCardScreen';

export function TownMapScreen() {
  const d = save.value!;
  const avatar = useMemo(() => avatarImage(d.player.avatar), [d.player.avatar]);
  return <TownMapView save={d} avatar={avatar} onClose={backToWorld} />;
}
