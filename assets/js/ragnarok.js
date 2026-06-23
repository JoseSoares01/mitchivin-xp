const RO_DEMO_URL = 'https://demo.robrowser.com/?demo/2.7/';
const RO_MIN_SPLASH_MS = 2600;

let roSplashTimer = null;
let roRevealTimer = null;

function getRagnarokFrame() {
  return document.getElementById('ro-game-frame');
}

function getRagnarokSplash() {
  return document.getElementById('ro-splash');
}

function resetRagnarokSplashBar() {
  const bar = document.querySelector('.ro-loading-bar');
  if (!bar) return;
  bar.style.animation = 'none';
  void bar.offsetWidth;
  bar.style.animation = '';
}

function revealRagnarokGame() {
  const splash = getRagnarokSplash();
  const frame = getRagnarokFrame();
  if (!splash || !frame) return;

  splash.classList.add('hidden');
  frame.classList.add('ready');
}

function initRagnarokGame() {
  const splash = getRagnarokSplash();
  const frame = getRagnarokFrame();
  if (!splash || !frame) return;

  const isLoaded = frame.src && !frame.src.includes('about:blank');
  if (isLoaded) {
    splash.classList.add('hidden');
    frame.classList.add('ready');
    return;
  }

  if (roSplashTimer) clearTimeout(roSplashTimer);
  if (roRevealTimer) clearTimeout(roRevealTimer);

  splash.classList.remove('hidden');
  frame.classList.remove('ready');
  resetRagnarokSplashBar();

  const splashStartedAt = Date.now();

  const scheduleReveal = () => {
    const elapsed = Date.now() - splashStartedAt;
    const delay = Math.max(0, RO_MIN_SPLASH_MS - elapsed);

    roRevealTimer = setTimeout(revealRagnarokGame, delay);
  };

  frame.onload = scheduleReveal;
  frame.src = RO_DEMO_URL;
  roSplashTimer = setTimeout(revealRagnarokGame, RO_MIN_SPLASH_MS + 1200);
}

function stopRagnarokGame() {
  const splash = getRagnarokSplash();
  const frame = getRagnarokFrame();

  if (roSplashTimer) {
    clearTimeout(roSplashTimer);
    roSplashTimer = null;
  }

  if (roRevealTimer) {
    clearTimeout(roRevealTimer);
    roRevealTimer = null;
  }

  if (splash) splash.classList.remove('hidden');
  if (frame) {
    frame.classList.remove('ready');
    frame.onload = null;
    frame.src = 'about:blank';
  }

  resetRagnarokSplashBar();
}
