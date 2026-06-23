const WC_CLICK_SOUND = 'assets/warcraft-menu-master/click.ogg';
const WC_BG_VIDEO = 'assets/warcraft-menu-master/video/videoplayback.mp4';

let wcClickAudio = null;

function getWarcraftVideo() {
  return document.getElementById('wc-bg-video');
}

function setWarcraftVideoMuted(muted) {
  const video = getWarcraftVideo();
  if (!video) return;

  video.muted = muted;
  video.defaultMuted = muted;

  if (muted) {
    video.setAttribute('muted', '');
  } else {
    video.removeAttribute('muted');
  }
}

function enableWarcraftVideoSound() {
  const video = getWarcraftVideo();
  if (!video || !video.muted) return;

  setWarcraftVideoMuted(false);
  video.volume = 1;
  video.play().catch(() => {});
}

function bindWarcraftVideoSoundUnlock() {
  const root = document.getElementById('wc-main');
  if (!root || root.dataset.soundBound === 'true') return;

  root.dataset.soundBound = 'true';

  const unlock = () => enableWarcraftVideoSound();

  root.addEventListener('pointerdown', unlock, { once: true });
  root.addEventListener('touchstart', unlock, { once: true, passive: true });
}

function playWarcraftVideo(options = {}) {
  const { withSound = false } = options;
  const video = getWarcraftVideo();
  if (!video) return;

  video.setAttribute('playsinline', '');
  video.setAttribute('webkit-playsinline', '');
  video.volume = 1;

  if (!video.currentSrc) {
    video.src = WC_BG_VIDEO;
  }

  const tryPlay = () => video.play();

  const playFromStart = () => {
    try {
      video.currentTime = 0;
    } catch (_) {}
    return tryPlay();
  };

  const playMuted = () => {
    setWarcraftVideoMuted(true);
    return playFromStart().catch(() => {});
  };

  const playWithPreferredSound = () => {
    if (!withSound) {
      return playMuted();
    }

    setWarcraftVideoMuted(false);
    return playFromStart().catch(() => {
      setWarcraftVideoMuted(true);
      return playFromStart().catch(() => {});
    });
  };

  if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
    playWithPreferredSound();
    return;
  }

  const onReady = () => playWithPreferredSound();

  video.addEventListener('canplay', onReady, { once: true });
  video.addEventListener('loadeddata', onReady, { once: true });
  video.load();
  playWithPreferredSound();
}

function pauseWarcraftVideo() {
  const video = getWarcraftVideo();
  if (!video) return;
  video.pause();
}

function getWarcraftClickAudio() {
  if (!wcClickAudio) {
    wcClickAudio = new Audio(WC_CLICK_SOUND);
    wcClickAudio.preload = 'auto';
  }
  return wcClickAudio;
}

function playWarcraftClick() {
  enableWarcraftVideoSound();

  const audio = getWarcraftClickAudio();
  audio.currentTime = 0;
  audio.play().catch(() => {});
}

function handleWarcraftItemAction(item) {
  playWarcraftClick();

  if (item.dataset.action === 'quit') {
    closeWindow('window-warcraft');
  }
}

function bindWarcraftItem(item) {
  item.addEventListener('click', (e) => {
    e.stopPropagation();
    handleWarcraftItemAction(item);
  });

  item.addEventListener('touchend', (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleWarcraftItemAction(item);
  }, { passive: false });
}

function restartWarcraftAnimations() {
  const stack = document.getElementById('wc-menu-stack');
  if (!stack) return;

  stack.classList.remove('wc-animate');
  stack.querySelectorAll('.wc-item').forEach((item) => {
    item.style.animation = 'none';
    item.style.opacity = '0';
  });

  void stack.offsetWidth;

  stack.classList.add('wc-animate');
  stack.querySelectorAll('.wc-item').forEach((item) => {
    item.style.animation = '';
    item.style.opacity = '';
  });
}

function initWarcraftMenu() {
  const root = document.getElementById('wc-main');
  if (!root) return;

  if (root.dataset.initialized !== 'true') {
    root.dataset.initialized = 'true';
    root.querySelectorAll('.wc-item').forEach(bindWarcraftItem);
    bindWarcraftVideoSoundUnlock();
  }

  playWarcraftVideo({ withSound: true });

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const video = getWarcraftVideo();
      if (video?.paused) {
        video.play().catch(() => {});
      }
      restartWarcraftAnimations();
    });

    setTimeout(() => {
      root.querySelectorAll('.wc-item').forEach((item) => {
        if (parseFloat(getComputedStyle(item).opacity) < 0.1) {
          item.style.opacity = '1';
        }
      });
    }, 1600);
  });
}
