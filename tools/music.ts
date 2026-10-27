/**
 * npm run music [-- <id> ...]
 * Records the tunes of src/audio/tunes.ts (all of them, or the ones named) on the music box of
 * tools/music/synth.ts into src/audio/recordings/<id>.m4a, which the game plays: phones only read the
 * recordings, so the music costs them almost nothing and never crackles. The tunes are played in
 * Google Chrome (headless, faster than real time) and encoded to AAC by macOS's afconvert. Set CHROME
 * to Chrome's path if it isn't in /Applications. The WAVs stay in tools/out/music for listening.
 */
import { execFileSync, spawn } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createServer } from 'vite';
import { jingleIds, trackIds } from '../src/audio/tunes.ts';

const root = new URL('..', import.meta.url).pathname;
const outDir = join(root, 'src/audio/recordings');
const wavDir = join(root, 'tools/out/music');
const CHROME = process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
/** AAC bitrate: soft mono music box, 64 kbit/s is plenty. */
const BITRATE = 64000;

const all: string[] = [...trackIds(), ...jingleIds()];
const ids = process.argv.slice(2).length ? process.argv.slice(2) : all;
const unknown = ids.filter((id) => !all.includes(id));
if (unknown.length) throw new Error(`unknown tunes: ${unknown.join(', ')}`);
mkdirSync(outDir, { recursive: true });
mkdirSync(wavDir, { recursive: true });

// Vite serves the synth (TypeScript) to Chrome
const server = await createServer({ root, logLevel: 'error', server: { port: 5197 } });
await server.listen();
const base = server.resolvedUrls!.local[0];

const profile = mkdtempSync(join(tmpdir(), 'music-chrome-'));
const chrome = spawn(CHROME, ['--headless=new', '--remote-debugging-port=0', `--user-data-dir=${profile}`, '--no-first-run', 'about:blank'], {
  stdio: ['ignore', 'ignore', 'pipe'],
});
const browserWs = await new Promise<string>((ok, ko) => {
  let log = '';
  chrome.stderr.on('data', (d) => {
    log += d;
    const m = /DevTools listening on (ws:\S+)/.exec(log);
    if (m) ok(m[1]);
  });
  chrome.on('exit', () => ko(new Error(`Chrome did not start:\n${log}`)));
});

try {
  // a page on Vite's origin, so it can import the synth
  const port = new URL(browserWs).port;
  const target = await (await fetch(`http://127.0.0.1:${port}/json/new?${base}@vite/client`, { method: 'PUT' })).json();
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((ok) => ws.addEventListener('open', ok, { once: true }));
  let next = 0;
  const waiting = new Map<number, (m: { result?: { result?: { value?: unknown }; exceptionDetails?: { exception?: { description?: string } } } }) => void>();
  ws.addEventListener('message', (e) => {
    const m = JSON.parse(String(e.data));
    waiting.get(m.id)?.(m);
    waiting.delete(m.id);
  });
  const evaluate = <T>(expression: string) =>
    new Promise<T>((ok, ko) => {
      const id = ++next;
      waiting.set(id, (m) => {
        const failed = m.result?.exceptionDetails;
        if (failed) ko(new Error(failed.exception?.description ?? 'evaluation failed'));
        else ok(m.result?.result?.value as T);
      });
      ws.send(JSON.stringify({ id, method: 'Runtime.evaluate', params: { expression, awaitPromise: true, returnByValue: true } }));
    });
  await evaluate(`new Promise((ok) => document.readyState === 'complete' ? ok() : addEventListener('load', ok))`);

  let bytes = 0;
  for (const id of ids) {
    const r = await evaluate<{ wav: string; peak: number; seconds: number }>(
      `import('/pokemol/tools/music/synth.ts').then((m) => m.record(${JSON.stringify(id)}))`,
    );
    const wav = join(wavDir, `${id}.wav`), m4a = join(outDir, `${id}.m4a`);
    writeFileSync(wav, Buffer.from(r.wav, 'base64'));
    execFileSync('afconvert', ['-f', 'm4af', '-d', 'aac', '-b', String(BITRATE), wav, m4a]);
    const size = statSync(m4a).size;
    bytes += size;
    console.log(`${id.padEnd(12)} ${r.seconds.toFixed(1).padStart(5)} s  peak ${r.peak.toFixed(2)}  ${(size / 1024).toFixed(0).padStart(4)} KB`);
  }
  console.log(`${ids.length} recordings, ${(bytes / 1024 / 1024).toFixed(1)} MB`);
  ws.close();
} finally {
  const exited = new Promise((ok) => chrome.once('exit', ok));
  chrome.kill();
  await exited;
  await server.close();
  rmSync(profile, { recursive: true, force: true });
}
