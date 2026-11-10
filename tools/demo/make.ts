/**
 * Builds a demo page for the owner (`npm run demo -- m1`): `tools/demo/<m>.tsx` with the game's own
 * modules, so timings are the game's, into `tools/out/demo-<m>/`, ready to publish as an Artifact
 * (`page.html` plus the files next to it: scripts, styles, recordings, the Bestioles' drawings and
 * the world screenshots from `tools/out/demo-shots/`).
 */
import { build } from 'vite';
import preact from '@preact/preset-vite';
import { copyFileSync, cpSync, existsSync, mkdirSync, readdirSync, readFileSync, renameSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const which = process.argv[2] ?? 'm1';
const root = resolve('tools/demo');
const out = resolve(`tools/out/demo-${which}`);
const shots = resolve('tools/out/demo-shots');

/** The Bestioles each demo shows: their cards and battle rigs are copied next to the page. */
const SPECIES: Record<string, string[]> = {
  m1: ['013', '030', '060', '012', '006', '056', '015', '007', '025', '010', '071', '021', '009'],
  m1b: ['021', '008', '001', '012', '006', '007'],
  m1c: ['021', '008', '012'],
  // the follower, Kid Leo's team and what lives on the Crayon Road
  m2a: ['021', '012', '006', '009', '004', '013', '005', '008', '089', '091'],
  m2b: ['021'],
  m3a: ['021', '073', '011'],
  // the three first Bestioles, one after the other in the Prof's photo
  m3b: ['001', '002', '003'],
  // your Bestiole and the wild ones to catch for the first time
  m4a: ['021', '012', '013', '005', '009', '006'],
  // the evolutions shown (and the ending's Coconfus becoming Libellune)
  m4b: ['012', '015', '007', '073', '071'],
  // the party, the box and the wild one of the menus demo
  menus: ['012', '013', '021', '030', '040', '014', '001', '002'],
  // lighter battles: the weather and darkening moves
  m5: ['036', '021', '012', '008'],
  // phones: the party, the box and the wild one
  m6: ['012', '013', '021', '030', '040', '014', '001', '002'],
  // trainers who think: your Braisaure against Marine's team
  m7: ['021', '008', '022', '001'],
  // the post-game that grows: Mireille's rematch team and Marine's Concours team after three wins
  m8: ['025', '024', '092', '090', '048', '038', '104', '007', '100', '060', '017', '042', '070', '023'],
  // the rival's two post-game teams
  m9: ['025', '036', '008', '050', '053', '007', '027', '024'],
  // the people of the night: your Braisaure
  m10: ['021'],
  // the music box only
  m11: [],
  // moves that change the field
  m12: ['090', '028', '007', '021', '008', '055', '001', '013'],
  // the epilogue: your team, Buvard's and the doubt's
  m13: ['025', '024', '023', '036', '027', '014', '042', '059', '070', '100', '008', '007', '088', '097', '011'],
  // the weather on Route 3: your team and what lives there
  m14: ['021', '013', '006', '005', '004', '007', '008', '009', '003', '014', '031', '054', '051', '082', '093', '121', '095', '107'],
};
/** Demos showing her original drawings (the credits). */
const ORIGINALS: Record<string, boolean> = { m4b: true, m6: true };
/** Demos running the whole game: every miniature (people in the world carry Bestioles too). */
const ALL_MINIS: Record<string, boolean> = { m10: true, m13: true, m14: true, m2a: true, m2b: true, m3a: true, m3b: true, m4a: true, m4b: true, menus: true, m6: true };
/** Demos that drive the battle through `window.__battle` are built in development mode, where it exists. */
const DEV: Record<string, boolean> = { m1b: true, m1c: true, m4a: true, m5: true, m7: true, m8: true, m9: true, m12: true };

// `import.meta.env.DEV` follows NODE_ENV, not the mode
if (DEV[which]) process.env.NODE_ENV = 'development';
await build({
  configFile: false,
  mode: DEV[which] ? 'development' : 'production',
  root,
  base: './',
  publicDir: false,
  logLevel: 'warn',
  plugins: [
    preact(),
    // the game's app registers its service worker: a demo page has none
    {
      name: 'demo-no-pwa',
      resolveId: (id: string) => (id === 'virtual:pwa-register' ? '\0demo-pwa' : null),
      load: (id: string) => (id === '\0demo-pwa' ? 'export function registerSW() { return () => Promise.resolve(); }' : null),
    },
  ],
  define: { __APP_BUILD__: JSON.stringify('demo') },
  build: {
    outDir: out,
    emptyOutDir: true,
    reportCompressedSize: false,
    rollupOptions: { input: join(root, `${which}.html`) },
  },
});

// Artifacts don't serve .m4a: the same AAC audio goes as .mp4 (the page only decodes it)
const assets = join(out, 'assets');
const renamed = readdirSync(assets).filter((f) => f.endsWith('.m4a'));
for (const f of renamed) renameSync(join(assets, f), join(assets, f.replace(/\.m4a$/, '.mp4')));
for (const f of readdirSync(assets).filter((n) => n.endsWith('.js'))) {
  let code = readFileSync(join(assets, f), 'utf8');
  for (const r of renamed) code = code.replaceAll(r, r.replace(/\.m4a$/, '.mp4'));
  writeFileSync(join(assets, f), code);
}

// the drawings the page loads by URL (public/ is not copied whole: it is big)
for (const dir of ['cards', 'rigs', 'minis']) {
  for (const name of readdirSync(resolve('public', dir))) {
    if (!(dir === 'minis' && ALL_MINIS[which]) && !(SPECIES[which] ?? []).some((id) => name.startsWith(`${id}-`))) continue;
    mkdirSync(join(out, dir), { recursive: true });
    cpSync(resolve('public', dir, name), join(out, dir, name), { recursive: true });
  }
}
if (ORIGINALS[which]) cpSync(resolve('public', 'originals'), join(out, 'originals'), { recursive: true });
if (existsSync(shots)) {
  mkdirSync(join(out, 'world'), { recursive: true });
  for (const name of readdirSync(shots)) if (name.endsWith('.webp')) copyFileSync(join(shots, name), join(out, 'world', name.replace(/^world-/, '')));
} else console.warn(`No world screenshots in ${relative('.', shots)}: the demo shows black behind the transitions.`);

// an Artifact page is wrapped in its own document: keep the head's tags and the body's content only
const html = readFileSync(join(out, `${which}.html`), 'utf8');
const head = /<head>([\s\S]*?)<\/head>/.exec(html)?.[1] ?? '';
const body = /<body>([\s\S]*?)<\/body>/.exec(html)?.[1] ?? '';
const page = `${head.replace(/<meta charset[^>]*>\s*/, '').replace(/<meta name="viewport"[^>]*>\s*/, '').trim()}\n${body.trim()}\n`
  .replaceAll('"./', '"');
writeFileSync(join(out, 'page.html'), page);

const files: string[] = [];
const walk = (d: string) => {
  for (const name of readdirSync(d)) {
    const p = join(d, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (!p.endsWith('.html')) files.push(relative(out, p));
  }
};
walk(out);
writeFileSync(join(out, 'files.json'), JSON.stringify(files, null, 1));
const size = files.reduce((n, f) => n + statSync(join(out, f)).size, 0);
console.log(`${relative('.', join(out, 'page.html'))}: ${files.length} files, ${(size / 1e6).toFixed(1)} MB`);
