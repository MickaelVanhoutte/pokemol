/** The paper doll standing in for a Bestiole behind a Pantin de papier, as an image. */
import { seeded } from '../../paper/pencilCanvas';
import { DOODLES } from './doodles';

let url = '';

export function dollUrl(): string {
  if (!url) {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    DOODLES.doll(c.getContext('2d')!, '#ffffff', seeded(5));
    url = c.toDataURL('image/png');
  }
  return url;
}
