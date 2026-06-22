// MitchIvin XP - Lógica do Aplicativo e Mecanismo do Paint

// Estado de arrastar janela
let draggingWindow = null;
let dragStartX = 0;
let dragStartY = 0;
let windowStartX = 0;
let windowStartY = 0;

// Estado de desenho do aplicativo Paint
let paintCanvas = null;
let paintCtx = null;
let isDrawing = false;
let paintTool = 'pencil'; // lápis (pencil), pincel (brush), borracha (eraser)
let paintColor = '#000000';
let paintBgColor = '#FFFFFF';
let paintSize = 1;
let lastX = 0;
let lastY = 0;

// Inicializa quando o DOM estiver carregado
window.addEventListener('DOMContentLoaded', () => {
  // Login mobile + bloqueio de acesso
  initMobileLogin();

  // Garante animação do GIF no login ao carregar
  requestAnimationFrame(() => {
    if (!document.body.classList.contains('xp-logged-in')) {
      restartLoginAvatarGif();
    }
  });

  // Inicia o relógio
  updateClock();
  setInterval(updateClock, 1000);

  // Inicializa os manipuladores da barra de tarefas
  updateTaskbarHandles();

  // Inicializa o aplicativo Paint no Canvas
  initPaint();

  // Inicializa os comportamentos de passar o mouse/clicar no Menu Iniciar
  initStartMenuInteraction();

  // Renderiza os cards do portfólio a partir da configuração
  renderPortfolio();

  // Renderiza o submenu Usado Recentemente
  if (typeof renderRecentApps === 'function') renderRecentApps();

  // Toolbar de edição do formulário de contato
  initContactMailToolbar();

  // Windows Media Player
  initWmp();

  // Adiciona um listener de clique no desktop para limpar seleções/menus
  document.getElementById('desktop').addEventListener('click', (e) => {
    // 1. Fecha o Menu Iniciar ao clicar fora dele
    const startMenu = document.getElementById('start-menu');
    const startBtn = document.querySelector('.xp-start-btn');
    if (startMenu.style.display === 'flex' && !startMenu.contains(e.target) && !startBtn.contains(e.target)) {
      startMenu.style.display = 'none';
      if (startBtn) startBtn.classList.remove('active');
    }

    // 2. Limpa a seleção do ícone ao clicar no plano de fundo do desktop
    if (e.target.id === 'desktop' || e.target.classList.contains('xp-desktop-icons')) {
      clearIconSelections();
    }
  });

  // Associa ouvintes globais de mousemove e mouseup para arrastar janelas
  document.addEventListener('mousemove', dragMove);
  document.addEventListener('mouseup', dragEnd);
});

// Atualiza o relógio do sistema na bandeja da barra de tarefas
function updateClock() {
  const clockEl = document.getElementById('system-time');
  if (!clockEl) return;
  
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  
  clockEl.textContent = `${hours}:${minutes}`;
}

// Manipuladores de seleção de ícones
function selectIcon(element, event) {
  event.stopPropagation(); // Impede que o ouvinte de clique do desktop desmarque imediatamente
  clearIconSelections();
  element.classList.add('selected');
}

function clearIconSelections() {
  document.querySelectorAll('.xp-desktop-icon').forEach(icon => {
    icon.classList.remove('selected');
  });
}

// Gerenciamento de janelas: Abrir
function openWindow(id) {
  const win = document.getElementById(id);
  if (!win) return;

  win.style.display = 'flex';
  focusWindow(id);
  updateTaskbarHandles();

  if (id === 'window-wmp') wmpOpenDefault();
}

// Gerenciamento de janelas: Foco (trazer para a frente)
function focusWindow(id) {
  // Remove a classe ativa de todas as janelas
  document.querySelectorAll('.xp-window').forEach(w => {
    w.classList.remove('active');
  });
  
  // Adiciona a classe ativa a esta janela
  const win = document.getElementById(id);
  if (win) {
    win.classList.add('active');
  }
  
  // Fecha o menu iniciar
  const startMenu = document.getElementById('start-menu');
  if (startMenu) startMenu.style.display = 'none';
  const startBtn = document.querySelector('.xp-start-btn');
  if (startBtn) startBtn.classList.remove('active');

  updateTaskbarHandles();
}

// Gerenciamento de janelas: Fechar
function closeWindow(id) {
  const win = document.getElementById(id);
  if (!win) return;

  if (win.classList.contains('maximized')) {
    win.classList.remove('maximized');
    win.style.width = win.dataset.prevWidth || win.style.width;
    win.style.height = win.dataset.prevHeight || 'auto';
    win.style.left = win.dataset.prevLeft || win.style.left;
    win.style.top = win.dataset.prevTop || win.style.top;
    const maxBtnIcon = win.querySelector('.maximize-btn .xp-window-control-icon');
    if (maxBtnIcon) maxBtnIcon.src = 'assets/icons/Windows XP Icons/Maximize.png';
  }

  win.style.display = 'none';
  if (id === 'window-wmp') document.getElementById('wmp-media')?.pause();
  updateTaskbarHandles();
}

// Gerenciamento de janelas: Minimizar (alternar exibição)
function minimizeWindow(id) {
  const win = document.getElementById(id);
  if (!win) return;
  win.style.display = 'none';
  if (id === 'window-wmp') document.getElementById('wmp-media')?.pause();
  updateTaskbarHandles();
}

// Gerenciamento de janelas: Alternar maximização
function maximizeWindow(id) {
  const win = document.getElementById(id);
  if (!win) return;

  const maxBtnIcon = win.querySelector('.maximize-btn .xp-window-control-icon');
  const isMaximized = win.classList.contains('maximized');

  if (isMaximized) {
    win.classList.remove('maximized');
    win.style.width = win.dataset.prevWidth || '500px';
    win.style.height = win.dataset.prevHeight || 'auto';
    win.style.left = win.dataset.prevLeft || '100px';
    win.style.top = win.dataset.prevTop || '100px';
    if (maxBtnIcon) maxBtnIcon.src = 'assets/icons/Windows XP Icons/Maximize.png';
  } else {
    win.dataset.prevWidth = win.style.width;
    win.dataset.prevHeight = win.style.height;
    win.dataset.prevLeft = win.style.left;
    win.dataset.prevTop = win.style.top;

    win.classList.add('maximized');
    win.style.width = '100vw';
    win.style.height = 'calc(100vh - 40px)';
    win.style.left = '0px';
    win.style.top = '0px';
    if (maxBtnIcon) maxBtnIcon.src = 'assets/icons/Windows XP Icons/Restore.png';
  }

  focusWindow(id);
}

// Manipuladores para arrastar janelas
function dragStart(e, id) {
  // Traz a janela para a frente
  focusWindow(id);
  
  const win = document.getElementById(id);
  if (!win || win.classList.contains('maximized')) return; // Não arrasta janelas maximizadas

  // Impede o início do arrasto ao clicar nos botões de controle da janela
  if (e.target.classList.contains('xp-window-control-btn')) return;

  draggingWindow = win;
  dragStartX = e.clientX;
  dragStartY = e.clientY;
  
  // Analisa os valores de left/top (padrão é 0 se não estiver definido)
  windowStartX = parseInt(win.style.left) || 0;
  windowStartY = parseInt(win.style.top) || 0;
  
  e.preventDefault();
}

function dragMove(e) {
  if (!draggingWindow) return;
  
  const deltaX = e.clientX - dragStartX;
  const deltaY = e.clientY - dragStartY;
  
  // Calcula as novas coordenadas
  let newX = windowStartX + deltaX;
  let newY = windowStartY + deltaY;

  // Mantém os títulos das janelas legíveis e parcialmente limitados ao desktop
  const desktopWidth = window.innerWidth;
  const desktopHeight = window.innerHeight;
  
  if (newY < 0) newY = 0; // Não deixa a barra de título sumir sob o cabeçalho do navegador
  if (newY > desktopHeight - 60) newY = desktopHeight - 60;
  if (newX < -200) newX = -200;
  if (newX > desktopWidth - 100) newX = desktopWidth - 100;

  draggingWindow.style.left = `${newX}px`;
  draggingWindow.style.top = `${newY}px`;
}

function dragEnd() {
  draggingWindow = null;
}

// Redefine as posições das janelas para um layout em cascata limpo
function resetWindowPositions() {
  const windows = [
    { id: 'window-overview', left: '60px', top: '40px', width: '300px' },
    { id: 'window-colors', left: '100px', top: '80px', width: '640px' },
    { id: 'window-typography', left: '140px', top: '120px', width: '660px' },
    { id: 'window-paint', left: '80px', top: '60px', width: '696px' },
    { id: 'window-components', left: '180px', top: '160px', width: '700px' },
    { id: 'window-layout', left: '220px', top: '200px', width: '640px' },
    { id: 'window-depth', left: '260px', top: '240px', width: '720px' },
    { id: 'window-wmp', left: '120px', top: '80px', width: '420px' },
    { id: 'window-dos', left: '300px', top: '280px', width: '680px' },
    { id: 'window-responsive', left: '340px', top: '320px', width: '660px' }
  ];

  windows.forEach((cfg) => {
    const win = document.getElementById(cfg.id);
    if (win) {
      win.style.left = cfg.left;
      win.style.top = cfg.top;
      win.style.width = cfg.width;
      win.style.height = 'auto';
    }
  });

  const startMenu = document.getElementById('start-menu');
  if (startMenu) startMenu.style.display = 'none';
  const startBtn = document.querySelector('.xp-start-btn');
  if (startBtn) startBtn.classList.remove('active');
}

// Reinicia GIF animado (browsers pausam GIF em elementos ocultos)
function restartAnimatedGifImg(img) {
  if (!img) return;
  const src = (img.getAttribute('src') || '').split('?')[0];
  if (!src.toLowerCase().endsWith('.gif')) return;
  const fresh = img.cloneNode(true);
  fresh.src = `${src}?t=${Date.now()}`;
  img.replaceWith(fresh);
}

function restartLoginAvatarGif() {
  restartAnimatedGifImg(document.querySelector('.xp-login-avatar'));
}

// Alterna a exibição do pop-up do Menu Iniciar
function toggleStartMenu() {
  const startMenu = document.getElementById('start-menu');
  const startBtn = document.querySelector('.xp-start-btn');
  if (!startMenu) return;
  
  if (startMenu.style.display === 'flex') {
    startMenu.style.display = 'none';
    if (startBtn) startBtn.classList.remove('active');
    if (typeof window.hideRecentPanel === 'function') window.hideRecentPanel();
  } else {
    // Redefine para a visualização padrão do lado direito sempre que abrir
    const allProgramsBtn = document.getElementById('all-programs-btn');
    const defaultRight = document.getElementById('start-menu-right-default');
    const programsPanel = document.getElementById('start-menu-programs-panel');
    if (allProgramsBtn && defaultRight && programsPanel) {
      programsPanel.style.display = 'none';
      defaultRight.style.display = 'flex';
      allProgramsBtn.classList.remove('active');
    }
    if (typeof window.hideRecentPanel === 'function') window.hideRecentPanel();
    startMenu.style.display = 'flex';
    if (startBtn) startBtn.classList.add('active');
  }
}

// Inicializa as interações de clique/hover do Menu Iniciar
function initStartMenuInteraction() {
  const allProgramsBtn = document.getElementById('all-programs-btn');
  const startMenu = document.getElementById('start-menu');
  const defaultRight = document.getElementById('start-menu-right-default');
  const programsPanel = document.getElementById('start-menu-programs-panel');
  const recentTrigger = document.getElementById('recent-used-trigger');
  const recentPanel = document.getElementById('start-menu-recent-panel');
  const leftItems = document.querySelectorAll('.xp-start-menu-left .xp-start-menu-item');

  if (!allProgramsBtn || !startMenu || !defaultRight || !programsPanel) return;

  function showPrograms() {
    hideRecentPanel();
    programsPanel.style.display = 'flex';
    defaultRight.style.display = 'none';
    allProgramsBtn.classList.add('active');
  }

  function hidePrograms() {
    programsPanel.style.display = 'none';
    defaultRight.style.display = 'flex';
    allProgramsBtn.classList.remove('active');
  }

  function showRecentPanel() {
    if (!recentTrigger || !recentPanel) return;
    hidePrograms();
    const columns = recentTrigger.closest('.xp-start-menu-columns');
    if (columns) {
      const columnsRect = columns.getBoundingClientRect();
      const triggerRect = recentTrigger.getBoundingClientRect();
      recentPanel.style.top = `${triggerRect.top - columnsRect.top}px`;
    }
    recentPanel.style.display = 'flex';
    recentPanel.setAttribute('aria-hidden', 'false');
    recentTrigger.classList.add('active');
    startMenu.classList.add('recent-open');
  }

  function hideRecentPanel() {
    if (!recentTrigger || !recentPanel) return;
    recentPanel.style.display = 'none';
    recentPanel.setAttribute('aria-hidden', 'true');
    recentTrigger.classList.remove('active');
    startMenu.classList.remove('recent-open');
  }

  window.hideRecentPanel = hideRecentPanel;

  // Passar o mouse no botão Todos os Programas abre o sub-menu
  allProgramsBtn.addEventListener('mouseenter', showPrograms);
  // Clicar no botão Todos os Programas alterna/abre o sub-menu
  allProgramsBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    showPrograms();
  });

  // Passar o mouse em qualquer item regular da coluna esquerda restaura a visualização padrão
  leftItems.forEach(item => {
    item.addEventListener('mouseenter', () => {
      hidePrograms();
      hideRecentPanel();
    });
  });

  if (recentTrigger && recentPanel) {
    recentTrigger.addEventListener('mouseenter', showRecentPanel);

    recentTrigger.addEventListener('mouseleave', (e) => {
      if (!recentPanel.contains(e.relatedTarget)) hideRecentPanel();
    });

    recentPanel.addEventListener('mouseleave', (e) => {
      if (!recentTrigger.contains(e.relatedTarget)) hideRecentPanel();
    });

    defaultRight.querySelectorAll('.xp-start-menu-right-item:not(#recent-used-trigger)').forEach(item => {
      item.addEventListener('mouseenter', hideRecentPanel);
    });
  }

  // Sair completamente do menu iniciar restaura a visualização padrão
  startMenu.addEventListener('mouseleave', () => {
    hidePrograms();
    hideRecentPanel();
  });
}

// Atualiza os manipuladores na barra de tarefas para representar janelas visíveis
function updateTaskbarHandles() {
  const container = document.getElementById('taskbar-handles');
  if (!container) return;
  
  container.innerHTML = '';
  
  // Mapeia os IDs das janelas para seus nomes na barra de tarefas
  const winNames = {
    'window-about': 'Sobre Mim',
    'window-ie': 'Meus Projetos',
    'window-overview': 'Meu Computador',
    'window-colors': 'Contact Me',
    'window-typography': 'Tipografia',
    'window-paint': 'Paint',
    'window-components': 'Componentes',
    'window-layout': 'Grade de Layout',
    'window-depth': 'Meu Currículo',
    'window-wmp': 'Media Player',
    'window-dos': 'Lixeira',
    'window-responsive': 'Simulador Vídeo'
  };

  // Mapeia os IDs das janelas para seus respectivos ícones na barra de tarefas
  const winIcons = {
    'window-about': 'assets/icons/Windows XP Icons/HTML.png',
    'window-ie': 'assets/icons/Windows XP Icons/Internet Explorer 6.png',
    'window-overview': 'assets/icons/Windows XP Icons/My Computer.png',
    'window-colors': 'assets/icons/Windows XP Icons/Email.png',
    'window-typography': 'assets/icons/Windows XP Icons/Fonts.png',
    'window-paint': 'assets/icons/Windows XP Icons/Paint.png',
    'window-components': 'assets/icons/Windows XP Icons/Control Panel.png',
    'window-layout': 'assets/icons/Windows XP Icons/Tweak UI.png',
    'window-depth': 'assets/images/janyel/curriculo-pdf.png',
    'window-wmp': 'assets/icons/Windows XP Icons/Windows Media Player 10.png',
    'window-dos': 'assets/icons/Windows XP Icons/Recycle Bin (empty).png',
    'window-responsive': 'assets/icons/Windows XP Icons/Display Properties.png'
  };

  document.querySelectorAll('.xp-window').forEach(win => {
    // Só mostra o manipulador se a janela NÃO estiver fechada (ou seja, display diferente de 'none')
    if (win.style.display !== 'none') {
      const id = win.id;
      const isActive = win.classList.contains('active');
      
      const handle = document.createElement('div');
      handle.className = `xp-taskbar-item ${isActive ? 'active' : ''}`;
      
      // Carrega o ícone PNG autêntico do aplicativo
      handle.innerHTML = `
        <img src="${winIcons[id] || 'assets/icons/Windows XP Icons/Default.png'}" style="width: 16px; height: 16px; margin-right: 4px; flex-shrink: 0;">
        <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${winNames[id] || id}</span>
      `;
      
      handle.onclick = () => {
        if (isActive) {
          minimizeWindow(id);
        } else {
          openWindow(id);
        }
      };
      
      container.appendChild(handle);
    }
  });
}

// Lógica de atualização do testador de tipografia ao vivo
function updateTypoPreview(val) {
  if (!val) val = ' ';
  document.getElementById('preview-ms').textContent = val;
  document.getElementById('preview-tahoma').textContent = val;
  document.getElementById('preview-arial').textContent = val;
}

// Auxiliar para copiar o valor do token de cor
function copyColor(hex) {
  navigator.clipboard.writeText(hex).then(() => {
    showNotification(`Valor HEX ${hex} copiado com sucesso para a área de transferência!`);
  }).catch(() => {
    alert(`HEX value: ${hex}`);
  });
}

// Mostra um balão de notificação clássico do XP a partir do ícone da bandeja
function showNotification(msg) {
  closeWelcomeBalloon(false);

  const desktop = document.getElementById('desktop');
  if (!desktop) return;

  const balloon = document.createElement('div');
  balloon.id = 'xp-balloon';
  balloon.className = 'xp-balloon';
  balloon.innerHTML = `
    <div class="xp-balloon-header">
      <div class="xp-balloon-header-title">
        <img class="xp-balloon-header-icon" src="assets/icons/Windows XP Icons/Information.png" alt="">
        <span>Área de Transferência</span>
      </div>
      <button class="xp-balloon-close" type="button" onclick="closeWelcomeBalloon()" aria-label="Fechar">×</button>
    </div>
    <div class="xp-balloon-content">
      <img class="xp-balloon-icon" src="assets/icons/Windows XP Icons/Information.png" alt="">
      <div class="xp-balloon-body">${msg}</div>
    </div>
  `;

  desktop.appendChild(balloon);
  positionWelcomeBalloon();
  requestAnimationFrame(() => balloon.classList.add('visible'));

  setTimeout(() => closeWelcomeBalloon(), 5000);
}

// Alternar abas dentro da janela de demonstração de componentes
function switchComponentTab(el, tabId) {
  // Desativa todos os links na barra de navegação
  el.parentNode.querySelectorAll('.xp-nav-link').forEach(link => {
    link.classList.remove('active');
  });
  
  // Ativa o link clicado
  el.classList.add('active');
  
  // Oculta todos os painéis de abas
  document.querySelectorAll('.component-tab-content').forEach(panel => {
    panel.style.display = 'none';
  });
  
  // Mostra o painel de aba correspondente
  document.getElementById(tabId).style.display = 'block';
}

// Simulador de viewport para o Playground Responsivo
function setSimulatedWidth(width) {
  const container = document.getElementById('simulated-viewport');
  if (!container) return;
  
  container.style.width = width;
  
  // Modifica as classes das colunas na visualização se a largura simulada for móvel
  const leftCol = document.getElementById('simulated-col-left');
  const rightCol = document.getElementById('simulated-col-right');
  const btn = document.getElementById('simulated-btn');

  if (width === '420px') {
    leftCol.style.gridColumn = 'span 12';
    rightCol.style.gridColumn = 'span 12';
    btn.style.width = '100%';
    btn.style.height = '44px'; // Altura mínima do alvo de toque no celular
  } else {
    leftCol.style.gridColumn = 'span 8';
    rightCol.style.gridColumn = 'span 4';
    btn.style.width = '94px'; // Largura padrão no desktop
    btn.style.height = '30px'; // Altura padrão no desktop
  }
}

// ==========================================
//          MECANISMO DO CANVAS DO MS PAINT
// ==========================================

function initPaint() {
  renderPaintUI();
  paintCanvas = document.getElementById('paint-canvas');
  if (!paintCanvas) return;

  paintCtx = paintCanvas.getContext('2d');
  paintCtx.lineCap = 'round';
  paintCtx.lineJoin = 'round';
  clearCanvas();

  paintCanvas.addEventListener('mousedown', startDrawing);
  paintCanvas.addEventListener('mousemove', paintPointerMove);
  paintCanvas.addEventListener('mouseup', stopDrawing);
  paintCanvas.addEventListener('mouseleave', paintPointerLeave);

  paintCanvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    paintCanvas.dispatchEvent(new MouseEvent('mousedown', { clientX: touch.clientX, clientY: touch.clientY }));
  }, { passive: false });

  paintCanvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    paintCanvas.dispatchEvent(new MouseEvent('mousemove', { clientX: touch.clientX, clientY: touch.clientY }));
  }, { passive: false });

  paintCanvas.addEventListener('touchend', () => {
    paintCanvas.dispatchEvent(new MouseEvent('mouseup', {}));
  }, { passive: true });

  selectPaintTool('pencil');
}

function paintPointerMove(e) {
  updatePaintCoords(e);
  draw(e);
}

function paintPointerLeave(e) {
  updatePaintCoords(e);
  stopDrawing();
}

function updatePaintCoords(e) {
  const coords = document.getElementById('paint-status-coords');
  if (!paintCanvas || !coords) return;
  const rect = paintCanvas.getBoundingClientRect();
  const x = Math.max(0, Math.floor(e.clientX - rect.left));
  const y = Math.max(0, Math.floor(e.clientY - rect.top));
  coords.textContent = `${x}, ${y}px`;
}

function getCanvasPoint(e) {
  const rect = paintCanvas.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  };
}

function startDrawing(e) {
  const { x, y } = getCanvasPoint(e);
  lastX = x;
  lastY = y;

  if (paintTool === 'pick-color') {
    pickPaintColor(x, y);
    return;
  }
  if (paintTool === 'fill') {
    floodFillCanvas(Math.floor(x), Math.floor(y));
    return;
  }

  const nonDrawingTools = ['magnifier', 'text', 'freeform', 'rect-select'];
  if (nonDrawingTools.includes(paintTool)) {
    const status = document.getElementById('paint-status-text');
    if (status) status.textContent = `${PAINT_TOOLS.find(t => t.id === paintTool)?.title || paintTool} (not implemented)`;
    return;
  }

  isDrawing = true;
  draw(e);
}

function draw(e) {
  if (!isDrawing) return;
  const { x: currentX, y: currentY } = getCanvasPoint(e);

  if (paintTool === 'airbrush') {
    for (let i = 0; i < 6; i++) {
      const ox = (Math.random() - 0.5) * paintSize * 2;
      const oy = (Math.random() - 0.5) * paintSize * 2;
      paintCtx.fillStyle = paintColor;
      paintCtx.fillRect(currentX + ox, currentY + oy, 1.2, 1.2);
    }
    lastX = currentX;
    lastY = currentY;
    return;
  }

  paintCtx.beginPath();
  paintCtx.moveTo(lastX, lastY);
  paintCtx.lineTo(currentX, currentY);

  if (paintTool === 'eraser') {
    paintCtx.strokeStyle = '#FFFFFF';
    paintCtx.lineWidth = 16;
  } else if (paintTool === 'pencil') {
    paintCtx.strokeStyle = paintColor;
    paintCtx.lineWidth = 1;
  } else {
    paintCtx.strokeStyle = paintColor;
    paintCtx.lineWidth = paintSize;
  }

  paintCtx.stroke();
  lastX = currentX;
  lastY = currentY;
}

function stopDrawing() {
  isDrawing = false;
}

function selectPaintTool(tool) {
  paintTool = tool;
  document.querySelectorAll('.xp-paint-tool-btn').forEach(btn => btn.classList.remove('active'));
  const activeBtn = document.getElementById(`tool-${tool}`);
  if (activeBtn) activeBtn.classList.add('active');

  const status = document.getElementById('paint-status-text');
  const toolMeta = PAINT_TOOLS?.find(t => t.id === tool);
  if (status && toolMeta) status.textContent = toolMeta.title;

  const sizeBox = document.getElementById('paint-size-options');
  if (sizeBox) {
    sizeBox.style.display = ['pencil', 'brush', 'airbrush', 'eraser'].includes(tool) ? 'flex' : 'none';
  }
}

function selectPaintSize(size, el) {
  paintSize = size;
  document.querySelectorAll('.xp-paint-size-option').forEach(opt => opt.classList.remove('active'));
  el.classList.add('active');
}

function selectPaintColor(hex, isBackground = false, event) {
  if (isBackground) paintBgColor = hex;
  else paintColor = hex;
  updatePaintColorPreview();
}

function updatePaintColorPreview() {
  const fg = document.getElementById('paint-fg-swatch');
  const bg = document.getElementById('paint-bg-swatch');
  if (fg) fg.style.backgroundColor = paintColor;
  if (bg) bg.style.backgroundColor = paintBgColor;
}

function swapPaintColors() {
  [paintColor, paintBgColor] = [paintBgColor, paintColor];
  updatePaintColorPreview();
}

function pickPaintColor(x, y) {
  const pixel = paintCtx.getImageData(Math.floor(x), Math.floor(y), 1, 1).data;
  const hex = `#${[pixel[0], pixel[1], pixel[2]].map(v => v.toString(16).padStart(2, '0')).join('')}`;
  selectPaintColor(hex, false);
  const status = document.getElementById('paint-status-text');
  if (status) status.textContent = `Color picked: ${hex}`;
}

function floodFillCanvas(startX, startY) {
  const w = paintCanvas.width;
  const h = paintCanvas.height;
  if (startX < 0 || startY < 0 || startX >= w || startY >= h) return;

  const imageData = paintCtx.getImageData(0, 0, w, h);
  const data = imageData.data;
  const startPos = (startY * w + startX) * 4;
  const startR = data[startPos];
  const startG = data[startPos + 1];
  const startB = data[startPos + 2];
  const fill = hexToRgb(paintColor);
  if (!fill) return;
  if (startR === fill.r && startG === fill.g && startB === fill.b) return;

  const stack = [[startX, startY]];
  const visited = new Uint8Array(w * h);

  while (stack.length) {
    const [x, y] = stack.pop();
    const pos = (y * w + x) * 4;
    if (visited[y * w + x]) continue;
    if (data[pos] !== startR || data[pos + 1] !== startG || data[pos + 2] !== startB) continue;

    visited[y * w + x] = 1;
    data[pos] = fill.r;
    data[pos + 1] = fill.g;
    data[pos + 2] = fill.b;
    data[pos + 3] = 255;

    if (x > 0) stack.push([x - 1, y]);
    if (x < w - 1) stack.push([x + 1, y]);
    if (y > 0) stack.push([x, y - 1]);
    if (y < h - 1) stack.push([x, y + 1]);
  }

  paintCtx.putImageData(imageData, 0, 0);
}

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function paintMenuAction(action) {
  if (action === 'file') clearCanvas();
  if (action === 'view') {
    const status = document.getElementById('paint-status-text');
    if (status) status.textContent = 'For Help, click Help Topics on the Help Menu.';
  }
}

function clearCanvas() {
  if (!paintCtx || !paintCanvas) return;
  paintCtx.fillStyle = '#FFFFFF';
  paintCtx.fillRect(0, 0, paintCanvas.width, paintCanvas.height);
}

// Internet Explorer — portfólio
function renderPortfolio() {
  const grid = document.getElementById('portfolio-grid');
  if (!grid || typeof PORTFOLIO_PROJECTS === 'undefined') return;

  grid.innerHTML = PORTFOLIO_PROJECTS.map(project => {
    const labelHtml = project.label
      ? `<span class="portfolio-mitchivin-label">${project.label}</span>`
      : '';
    return `
      <article class="portfolio-card"
        data-id="${project.id}"
        data-category="${project.category}"
        data-repo="${project.repo || ''}"
        data-demo="${project.demo || ''}"
        data-description="${project.description || ''}"
        onclick="selectPortfolioProject(this)"
        ondblclick="openPortfolioRepo(this)"
        title="Clique para selecionar · Duplo clique para abrir no GitHub">
        <div class="portfolio-card-thumb portfolio-thumb--preview" style="background: ${project.previewGradient || '#1a3a5c'};">
          <img class="portfolio-card-preview"
            src="${project.preview}"
            alt="${project.title}"
            onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
          <span class="portfolio-thumb-emoji portfolio-thumb-emoji--fallback">${project.previewFallback || '📁'}</span>
          ${labelHtml}
          <a class="portfolio-card-github" href="${project.repo}" target="_blank" rel="noopener"
            onclick="event.stopPropagation()" title="Abrir no GitHub">
            <img src="assets/icons/Windows XP Icons/Github.png" alt="GitHub">
          </a>
        </div>
        <div class="portfolio-card-info">
          <div class="portfolio-card-title-row">
            <img class="portfolio-card-avatar" src="assets/images/janyel/avatar.png" alt="">
            <h3>${project.title}</h3>
          </div>
          <p>${project.tags}</p>
        </div>
      </article>
    `;
  }).join('');
}

function filterPortfolio(category, btn) {
  document.querySelectorAll('.portfolio-nav-item').forEach(item => {
    item.classList.remove('active');
  });
  if (btn) btn.classList.add('active');

  document.querySelectorAll('.portfolio-card').forEach(card => {
    const cats = (card.dataset.category || '').split(' ');
    const show = category === 'all' || cats.includes(category);
    card.classList.toggle('hidden', !show);
  });

  const status = document.getElementById('ie-statusbar');
  if (status) {
    status.textContent = category === 'all'
      ? 'Clique para selecionar · Duplo clique para abrir no GitHub'
      : `Filtrando: ${btn ? btn.textContent.trim() : category}`;
  }
}

function selectPortfolioProject(card) {
  document.querySelectorAll('.portfolio-card').forEach(c => c.classList.remove('selected'));
  card.classList.add('selected');
  const status = document.getElementById('ie-statusbar');
  const title = card.querySelector('h3')?.textContent || '';
  const description = card.dataset.description || '';
  const repo = card.dataset.repo;
  const demo = card.dataset.demo;
  if (!status) return;

  const baseText = description ? `${title} — ${description}` : `Projeto selecionado: ${title}`;
  const links = [];
  if (repo) links.push(`<a href="${repo}" target="_blank" rel="noopener" class="xp-ie-status-link">GitHub ↗</a>`);
  if (demo) links.push(`<a href="${demo}" target="_blank" rel="noopener" class="xp-ie-status-link">Demo ↗</a>`);
  status.innerHTML = links.length
    ? `${baseText} &nbsp;·&nbsp; ${links.join(' &nbsp;|&nbsp; ')}`
    : baseText;
}

function openPortfolioRepo(card) {
  const repo = card?.dataset?.repo;
  if (repo) window.open(repo, '_blank', 'noopener');
}

function showMacMoreInfo() {
  showNotification('Mac mini (2023) · Apple M2 · 8 GB · macOS Tahoe 26.6');
}

// Windows Media Player
const WMP_DEFAULT_MEDIA = 'assets/media/videos/The Pursuit Of Vikings (Amon Amarth).mp4';
let wmpObjectUrl = null;

function wmpSetPlayState(playing) {
  document.getElementById('wmp-play-btn')?.classList.toggle('is-playing', playing);
}

function wmpUpdateTimeDisplay() {
  const media = document.getElementById('wmp-media');
  const el = document.getElementById('wmp-time-display');
  if (!media || !el) return;
  const cur = wmpFormatTime(media.currentTime);
  const tot = wmpFormatTime(media.duration || 0);
  el.textContent = `${cur} / ${tot}`;
}

function wmpUpdateProgressBar() {
  const media = document.getElementById('wmp-media');
  const seek = document.getElementById('wmp-seek');
  if (!media || !seek) return;
  const pct = media.duration ? (media.currentTime / media.duration) * 100 : 0;
  seek.value = pct;
  seek.style.setProperty('--val', `${pct}%`);
}

function initWmp() {
  const media = document.getElementById('wmp-media');
  const volume = document.getElementById('wmp-volume');
  if (!media) return;

  media.volume = 0.8;
  if (volume) volume.style.setProperty('--vol', `${volume.value}%`);

  media.addEventListener('timeupdate', () => {
    wmpUpdateProgressBar();
    wmpUpdateTimeDisplay();
  });

  media.addEventListener('loadedmetadata', () => {
    wmpUpdateTimeDisplay();
    wmpUpdateProgressBar();
  });

  media.addEventListener('play', () => wmpSetPlayState(true));

  media.addEventListener('pause', () => wmpSetPlayState(false));

  media.addEventListener('ended', () => {
    if (media.loop) {
      media.currentTime = 0;
      media.play();
      return;
    }
    wmpStop();
  });
}

function wmpOpenDefault() {
  wmpLoadFromUrl(WMP_DEFAULT_MEDIA);
}

function wmpLoadFromUrl(src) {
  const media = document.getElementById('wmp-media');
  if (!media) return;

  if (wmpObjectUrl) {
    URL.revokeObjectURL(wmpObjectUrl);
    wmpObjectUrl = null;
  }

  media.src = src;
  media.load();
  media.play().catch(() => wmpSetPlayState(false));
}

function wmpFormatTime(seconds) {
  if (!Number.isFinite(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

function wmpOpenFile() {
  document.getElementById('wmp-file-input')?.click();
}

function wmpLoadFile(input) {
  const file = input.files?.[0];
  const media = document.getElementById('wmp-media');
  if (!file || !media) return;

  if (wmpObjectUrl) URL.revokeObjectURL(wmpObjectUrl);
  wmpObjectUrl = URL.createObjectURL(file);
  media.src = wmpObjectUrl;
  media.load();
  media.play().catch(() => wmpSetPlayState(false));
}

function wmpTogglePlay() {
  const media = document.getElementById('wmp-media');
  if (!media) return;
  if (!media.src) {
    wmpOpenDefault();
    return;
  }
  if (media.paused) media.play();
  else media.pause();
}

function wmpStop() {
  const media = document.getElementById('wmp-media');
  if (!media) return;
  media.pause();
  media.currentTime = 0;
  wmpUpdateProgressBar();
  wmpUpdateTimeDisplay();
  wmpSetPlayState(false);
}

function wmpPrev() {
  const media = document.getElementById('wmp-media');
  if (!media || !media.src) return;
  media.currentTime = Math.max(0, media.currentTime - 10);
}

function wmpNext() {
  const media = document.getElementById('wmp-media');
  if (!media || !media.src || !media.duration) return;
  media.currentTime = Math.min(media.duration, media.currentTime + 10);
}

function wmpToggleRepeat() {
  const media = document.getElementById('wmp-media');
  const btn = document.getElementById('wmp-repeat-btn');
  if (!media) return;
  media.loop = !media.loop;
  btn?.classList.toggle('is-active', media.loop);
}

function wmpSeek(value) {
  const media = document.getElementById('wmp-media');
  const seek = document.getElementById('wmp-seek');
  if (!media || !media.duration) return;
  media.currentTime = (value / 100) * media.duration;
  if (seek) seek.style.setProperty('--val', `${value}%`);
  wmpUpdateTimeDisplay();
}

function wmpSetVolume(value) {
  const media = document.getElementById('wmp-media');
  const volume = document.getElementById('wmp-volume');
  if (media) media.volume = value / 100;
  if (volume) volume.style.setProperty('--vol', `${value}%`);
}

function sendContactMessage() {
  const from = document.getElementById('contact-from')?.value?.trim() || '';
  const subject = document.getElementById('contact-subject')?.value?.trim() || 'Contact via Zé dos Dados XP';
  const message = document.getElementById('contact-message')?.value?.trim() || '';

  if (!from) {
    setContactStatus('Please enter your email address.');
    document.getElementById('contact-from')?.focus();
    return;
  }
  if (!message) {
    setContactStatus('Please write your message before sending.');
    document.getElementById('contact-message')?.focus();
    return;
  }

  const body = `From: ${from}\n\n${message}`;
  const mailto = `mailto:janyelrodrigues@hotmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.location.href = mailto;
  setContactStatus('Opening your email client...');
}

function resetContactForm() {
  const from = document.getElementById('contact-from');
  const subject = document.getElementById('contact-subject');
  const message = document.getElementById('contact-message');
  if (from) from.value = '';
  if (subject) subject.value = '';
  if (message) message.value = '';
  setContactStatus('Compose a message to Janyel');
  from?.focus();
}

function setContactStatus(text) {
  const bar = document.getElementById('contact-statusbar');
  if (bar) bar.textContent = text;
}

function mailEditAction(action) {
  const field = document.getElementById('contact-message');
  if (!field) return;
  field.focus();
  try {
    document.execCommand(action);
  } catch (_) { /* decorative fallback */ }
}

function initContactMailToolbar() {
  const message = document.getElementById('contact-message');
  const cutBtn = document.querySelector('.xp-mail-toolbar-btn[title="Cut"]');
  const copyBtn = document.querySelector('.xp-mail-toolbar-btn[title="Copy"]');
  const pasteBtn = document.querySelector('.xp-mail-toolbar-btn[title="Paste"]');
  if (!message) return;

  const updateEditButtons = () => {
    const hasSelection = message.selectionStart !== message.selectionEnd;
    if (cutBtn) cutBtn.disabled = !hasSelection;
    if (copyBtn) copyBtn.disabled = !hasSelection;
    if (pasteBtn) pasteBtn.disabled = false;
  };

  message.addEventListener('select', updateEditButtons);
  message.addEventListener('keyup', updateEditButtons);
  message.addEventListener('mouseup', updateEditButtons);
  message.addEventListener('focus', updateEditButtons);
}

function togglePortfolioTheme() {
  const site = document.getElementById('portfolio-site');
  if (site) site.classList.toggle('portfolio-light');
}

function ieNavigateHome(e) {
  if (e) e.preventDefault();
  filterPortfolio('all', document.querySelector('.portfolio-nav-item[data-filter="all"]'));
  document.querySelectorAll('.portfolio-card').forEach(c => c.classList.remove('selected'));
  const status = document.getElementById('ie-statusbar');
  if (status) status.textContent = 'Clique para selecionar · Duplo clique para abrir no GitHub';
}

// Mobile — login, boas-vindas e acesso bloqueado
const MOBILE_BREAKPOINT = 639;

function isMobile() {
  return window.innerWidth <= MOBILE_BREAKPOINT;
}

function initMobileLogin() {
  const loginBtn = document.getElementById('xp-login-user-btn');
  if (loginBtn) loginBtn.addEventListener('click', startLogin);

  const loggedIn = sessionStorage.getItem('xp-logged-in') === 'true';
  const requireLogin = sessionStorage.getItem('xp-require-login') === 'true';

  if (loggedIn) {
    document.body.classList.add('xp-logged-in');
  } else if (isMobile() || requireLogin) {
    document.body.classList.remove('xp-logged-in');
  } else {
    document.body.classList.add('xp-logged-in');
    sessionStorage.setItem('xp-logged-in', 'true');
  }

  document.querySelectorAll('.xp-desktop-icon[data-window]').forEach(icon => {
    icon.addEventListener('click', (e) => {
      if (!isMobile()) return;
      const windowId = icon.dataset.window;
      if (windowId) {
        selectIcon(icon, e);
        openWindow(windowId);
      }
    });
  });

  window.addEventListener('resize', () => {
    if (!isMobile() && sessionStorage.getItem('xp-require-login') !== 'true') {
      if (sessionStorage.getItem('xp-logged-in') === 'true') {
        document.body.classList.add('xp-logged-in');
      }
    }
  });
}

function startLogin() {
  const login = document.getElementById('xp-login-screen');
  const welcome = document.getElementById('xp-welcome-screen');

  if (login) login.style.display = 'none';

  if (!welcome) {
    completeLogin();
    return;
  }

  welcome.classList.add('active');
  welcome.setAttribute('aria-hidden', 'false');

  setTimeout(() => {
    welcome.classList.add('fade-out');
    setTimeout(() => {
      welcome.classList.remove('active', 'fade-out');
      welcome.setAttribute('aria-hidden', 'true');
      completeLogin();
    }, 450);
  }, 1800);
}

function completeLogin() {
  document.body.classList.add('xp-logged-in');
  sessionStorage.setItem('xp-logged-in', 'true');
  sessionStorage.removeItem('xp-require-login');
  setTimeout(showWelcomeBalloon, 350);
}

function closeStartMenu() {
  const startMenu = document.getElementById('start-menu');
  const startBtn = document.querySelector('.xp-start-btn');
  if (startMenu) startMenu.style.display = 'none';
  if (startBtn) startBtn.classList.remove('active');
  if (typeof window.hideRecentPanel === 'function') window.hideRecentPanel();
}

function showShutdownDialog() {
  closeStartMenu();
  document.body.classList.add('xp-power-active');
  document.getElementById('xp-power-overlay')?.classList.add('visible');
  document.getElementById('xp-shutdown-dialog')?.classList.add('visible');
  document.getElementById('xp-logoff-dialog')?.classList.remove('visible');
}

function showLogoffDialog() {
  closeStartMenu();
  document.body.classList.add('xp-power-active');
  document.getElementById('xp-power-overlay')?.classList.add('visible');
  document.getElementById('xp-logoff-dialog')?.classList.add('visible');
  document.getElementById('xp-shutdown-dialog')?.classList.remove('visible');
}

function closePowerDialog(immediate = false) {
  document.getElementById('xp-shutdown-dialog')?.classList.remove('visible');
  document.getElementById('xp-logoff-dialog')?.classList.remove('visible');

  const removeDim = () => {
    document.body.classList.remove('xp-power-active');
    document.getElementById('xp-power-overlay')?.classList.remove('visible');
  };

  if (immediate) {
    removeDim();
  } else {
    setTimeout(removeDim, 450);
  }
}

function performLogoff() {
  closePowerDialog(true);
  closeWelcomeBalloon(false);
  closeStartMenu();

  sessionStorage.removeItem('xp-logged-in');
  sessionStorage.setItem('xp-require-login', 'true');
  document.body.classList.remove('xp-logged-in');

  const login = document.getElementById('xp-login-screen');
  if (login) login.style.display = '';

  requestAnimationFrame(() => restartLoginAvatarGif());

  document.querySelectorAll('.xp-window').forEach(w => {
    w.style.display = 'none';
    if (w.classList.contains('maximized')) {
      w.classList.remove('maximized');
      const maxBtnIcon = w.querySelector('.maximize-btn .xp-window-control-icon');
      if (maxBtnIcon) maxBtnIcon.src = 'assets/icons/Windows XP Icons/Maximize.png';
    }
  });
  updateTaskbarHandles();
}

function positionWelcomeBalloon() {
  const balloon = document.getElementById('xp-balloon');
  const trayBtn = document.getElementById('xp-tray-info-btn');
  const desktop = document.getElementById('desktop');
  if (!balloon || !trayBtn || !desktop) return;

  const dRect = desktop.getBoundingClientRect();
  const tRect = trayBtn.getBoundingClientRect();
  const tailOffset = 28;

  balloon.style.bottom = `${dRect.bottom - tRect.top + 4}px`;
  balloon.style.left = 'auto';

  const iconCenterFromRight = dRect.right - (tRect.left + tRect.width / 2);
  balloon.style.right = `${Math.max(8, iconCenterFromRight - tailOffset)}px`;
  balloon.style.setProperty('--balloon-tail-right', `${tailOffset}px`);

  requestAnimationFrame(() => {
    const bRect = balloon.getBoundingClientRect();
    const iconCenterX = tRect.left + tRect.width / 2;
    const tailX = bRect.right - tailOffset;
    const diff = iconCenterX - tailX;
    if (Math.abs(diff) > 2) {
      const currentRight = parseFloat(balloon.style.right) || 8;
      balloon.style.right = `${Math.max(8, currentRight - diff)}px`;
    }
  });
}

function closeWelcomeBalloon(animate = true) {
  const balloon = document.getElementById('xp-balloon');
  const trayBtn = document.getElementById('xp-tray-info-btn');
  if (trayBtn) trayBtn.classList.remove('active');
  if (!balloon) return;

  window.removeEventListener('resize', positionWelcomeBalloon);

  if (animate) {
    balloon.classList.remove('visible');
    setTimeout(() => balloon.remove(), 220);
  } else {
    balloon.remove();
  }
}

function toggleWelcomeBalloon() {
  const existing = document.getElementById('xp-balloon');
  if (existing && existing.classList.contains('visible')) {
    closeWelcomeBalloon();
    return;
  }
  showWelcomeBalloon();
}

function showWelcomeBalloon() {
  closeWelcomeBalloon(false);

  const desktop = document.getElementById('desktop');
  const trayBtn = document.getElementById('xp-tray-info-btn');
  if (!desktop) return;

  const balloon = document.createElement('div');
  balloon.id = 'xp-balloon';
  balloon.className = 'xp-balloon';
  balloon.innerHTML = `
    <div class="xp-balloon-header">
      <div class="xp-balloon-header-title">
        <img class="xp-balloon-header-icon" src="assets/icons/Windows XP Icons/Information.png" alt="">
        <span>Bem-vindo ao Zé dos Dados XP</span>
      </div>
      <button class="xp-balloon-close" type="button" onclick="closeWelcomeBalloon()" aria-label="Fechar">×</button>
    </div>
    <div class="xp-balloon-content">
      <img class="xp-balloon-icon" src="assets/icons/Windows XP Icons/Information.png" alt="">
      <div class="xp-balloon-body">
        Analista de dados e BI — explore meus projetos, currículo e entre em contato.
        <div class="xp-balloon-links">
          Começar:
          <a href="#" onclick="openWindow('window-about'); return false;">Sobre Mim</a> |
          <a href="#" onclick="openWindow('window-ie'); return false;">Meus Projetos</a> |
          <a href="#" onclick="openWindow('window-colors'); return false;">Contato</a>
        </div>
      </div>
    </div>
  `;
  desktop.appendChild(balloon);

  positionWelcomeBalloon();
  window.addEventListener('resize', positionWelcomeBalloon);

  requestAnimationFrame(() => {
    balloon.classList.add('visible');
    if (trayBtn) trayBtn.classList.add('active');
  });
}
