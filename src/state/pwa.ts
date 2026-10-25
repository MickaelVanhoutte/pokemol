import { effect, signal } from '@preact/signals';
import { screen } from './router';

/** Every file of the game is stored on the device: it plays without a network. */
export const offlineReady = signal(false);
/** A new version was downloaded; it starts the next time the game is opened. */
export const updateReady = signal(false);
/** The service worker is registered (the update check button works). */
export const pwaActive = signal(false);

const SEEN_KEY = 'atelier-bestioles.offline';
const LATER_KEY = 'atelier-bestioles.install-later';
const LATER_DAYS = 7;
const HOUR = 60 * 60 * 1000;
const RESUME_GAP = 10 * 60 * 1000;

let registration: ServiceWorkerRegistration | undefined;
let applyUpdate: (() => Promise<void>) | undefined;
let lastCheck = 0;

/** Asks the server for a new version (only the changed files are downloaded, the cache is kept). */
export async function checkForUpdate(): Promise<void> {
  if (!registration || !navigator.onLine) return;
  lastCheck = Date.now();
  try {
    await registration.update();
  } catch {
    // offline or server unreachable: try again later
  }
}

/** True the first time the game reports it can be played offline on this device. */
export function firstOfflineReady(): boolean {
  if (!offlineReady.value) return false;
  try {
    if (localStorage.getItem(SEEN_KEY)) return false;
    localStorage.setItem(SEEN_KEY, '1');
  } catch {
    return false;
  }
  return true;
}

/** Chrome, Edge and Samsung Internet's install offer, kept until the player asks for it. */
interface InstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/**
 * How the game can be installed on this device: the browser's own dialog, the Share menu on
 * iPhone and iPad (Safari has no install dialog), or not at all (already installed, or unsupported).
 */
export const installWay = signal<'prompt' | 'ios' | null>(null);
let installEvent: InstallPromptEvent | undefined;

function runsInstalled(): boolean {
  return matchMedia('(display-mode: standalone), (display-mode: fullscreen)').matches
    || (navigator as Navigator & { standalone?: boolean }).standalone === true;
}

function isIos(): boolean {
  const ua = navigator.userAgent;
  // iPadOS says it is a Mac: touch gives it away
  return /iPad|iPhone|iPod/.test(ua) || (ua.includes('Macintosh') && navigator.maxTouchPoints > 1);
}

/** False for a week after the player answered « Plus tard ». */
export function installToastDue(): boolean {
  try {
    return Date.now() - Number(localStorage.getItem(LATER_KEY) ?? 0) > LATER_DAYS * 24 * HOUR;
  } catch {
    return true;
  }
}

export function installLater() {
  try {
    localStorage.setItem(LATER_KEY, String(Date.now()));
  } catch {
    // storage unavailable: the toast comes back next time
  }
}

/** Opens the browser's install dialog. True if the player installed the game. */
export async function install(): Promise<boolean> {
  const e = installEvent;
  if (!e) return false;
  // the browser offers each event only once; it sends a new one if the player said no
  installEvent = undefined;
  installWay.value = null;
  await e.prompt();
  const { outcome } = await e.userChoice;
  if (outcome === 'dismissed') installLater();
  return outcome === 'accepted';
}

function watchInstall() {
  if (typeof window === 'undefined' || runsInstalled()) return;
  if (isIos()) installWay.value = 'ios';
  window.addEventListener('beforeinstallprompt', (e) => {
    // keep the offer for our own toast instead of the browser's banner
    e.preventDefault();
    installEvent = e as InstallPromptEvent;
    installWay.value = 'prompt';
  });
  window.addEventListener('appinstalled', () => {
    installEvent = undefined;
    installWay.value = null;
  });
}

/**
 * Listens for the install offer and registers the service worker. Every asset is precached in the
 * background on the first visit; new versions are downloaded silently and only switched on from the
 * title screen (normally right when the game is opened again), so a running adventure is never
 * interrupted.
 */
export function startPwa() {
  watchInstall();
  if (!import.meta.env.PROD || typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;
  void import('virtual:pwa-register').then(({ registerSW }) => {
    const update = registerSW({
      immediate: true,
      onOfflineReady() {
        offlineReady.value = true;
        void navigator.storage?.persist?.().catch(() => undefined);
      },
      onNeedRefresh() {
        updateReady.value = true;
      },
      // another tab may switch the new version on: only the tab that asked for it reloads
      onNeedReload() {
        if (applying) window.location.reload();
      },
      onRegisteredSW(_url, reg) {
        if (!reg) return;
        registration = reg;
        pwaActive.value = true;
        // a worker already controlling the page means everything is cached
        if (reg.active && navigator.serviceWorker.controller) offlineReady.value = true;
        if (reg.waiting && navigator.serviceWorker.controller) updateReady.value = true;
        setInterval(() => void checkForUpdate(), HOUR);
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible' && Date.now() - lastCheck > RESUME_GAP) void checkForUpdate();
        });
        window.addEventListener('online', () => void checkForUpdate());
        void checkForUpdate();
      },
    });
    applyUpdate = () => update(true);
  });
}

// the title screen is a safe moment: nothing is in progress and the save is on disk
let applying = false;
effect(() => {
  if (!updateReady.value || screen.value.id !== 'title' || applying || !applyUpdate) return;
  applying = true;
  void applyUpdate();
});
