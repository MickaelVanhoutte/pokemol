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
};
/** Demos that drive the battle through `window.__battle` are built in development mode, where it exists. */
const DEV: Record<string, boolean> = { m1b: true };

// `import.meta.env.DEV` follows NODE_ENV, not the mode
if (DEV[which]) process.env.NODE_ENV = 'development';
await build({
  configFile: false,
  mode: DEV[which] ? 'development' : 'production',
  root,
  base: './',
  publicDir: false,
  logLevel: 'warn',
  plugins: [preact()],
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
for (const dir of ['cards', 'rigs']) {
  for (const name of readdirSync(resolve('public', dir))) {
    if (!(SPECIES[which] ?? []).some((id) => name.startsWith(`${id}-`))) continue;
    mkdirSync(join(out, dir), { recursive: true });
    cpSync(resolve('public', dir, name), join(out, dir, name), { recursive: true });
  }
}
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
