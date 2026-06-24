const CV_PDF_PATH = 'assets/images/janyel/White Black Elegant Modern Corporate CV Resume.pdf';
const CV_PDF_DOWNLOAD_NAME = 'Anyel-Rodrigues-CV.pdf';

function getCvPdfUrl() {
  return encodeURI(CV_PDF_PATH);
}

function getCvFileMenu() {
  return document.getElementById('cv-file-menu');
}

function closeCvFileMenu() {
  const menu = getCvFileMenu();
  if (!menu) return;
  menu.classList.remove('open');
  const trigger = menu.querySelector('.xp-window-menu-item--trigger');
  const flyout = menu.querySelector('.xp-window-menu-flyout');
  if (trigger) trigger.setAttribute('aria-expanded', 'false');
  if (flyout) flyout.hidden = true;
}

function toggleCvFileMenu(event) {
  event.preventDefault();
  event.stopPropagation();

  const menu = getCvFileMenu();
  if (!menu) return;

  const isOpen = menu.classList.contains('open');
  closeCvFileMenu();

  if (!isOpen) {
    menu.classList.add('open');
    const trigger = menu.querySelector('.xp-window-menu-item--trigger');
    const flyout = menu.querySelector('.xp-window-menu-flyout');
    if (trigger) trigger.setAttribute('aria-expanded', 'true');
    if (flyout) flyout.hidden = false;
  }
}

function downloadCvPdf() {
  closeCvFileMenu();

  const link = document.createElement('a');
  link.href = getCvPdfUrl();
  link.download = CV_PDF_DOWNLOAD_NAME;
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  if (typeof showNotification === 'function') {
    showNotification('A transferir currículo em PDF...');
  }
}

function initCvFileMenu() {
  document.addEventListener('click', (event) => {
    const menu = getCvFileMenu();
    if (!menu || !menu.classList.contains('open')) return;
    if (!menu.contains(event.target)) closeCvFileMenu();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeCvFileMenu();
  });
}

document.addEventListener('DOMContentLoaded', initCvFileMenu);
