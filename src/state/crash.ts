import { signal } from '@preact/signals';

/** The world's game loop gave up (one frame after another failing): `Guard` shows its torn page. */
export const worldBroken = signal(false);
