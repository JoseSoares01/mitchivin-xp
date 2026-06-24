const XP_PAINT_URL = 'https://chowderman.github.io/xp-paint.html';

function getXpPaintFrame() {
  return document.getElementById('xp-paint-frame');
}

function initXpPaint() {
  const frame = getXpPaintFrame();
  if (!frame) return;

  const isLoaded = frame.src && !frame.src.includes('about:blank');
  if (isLoaded) return;

  frame.src = XP_PAINT_URL;
}

function stopXpPaint() {
  const frame = getXpPaintFrame();
  if (!frame) return;
  frame.src = 'about:blank';
}
