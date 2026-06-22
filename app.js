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
let paintSize = 1;
let lastX = 0;
let lastY = 0;

// Inicializa quando o DOM estiver carregado
window.addEventListener('DOMContentLoaded', () => {
  // Inicia o relógio
  updateClock();
  setInterval(updateClock, 1000);

  // Inicializa os manipuladores da barra de tarefas
  updateTaskbarHandles();

  // Inicializa o aplicativo Paint no Canvas
  initPaint();

  // Inicializa os comportamentos de passar o mouse/clicar no Menu Iniciar
  initStartMenuInteraction();

  // Adiciona um listener de clique no desktop para limpar seleções/menus
  document.getElementById('desktop').addEventListener('click', (e) => {
    // 1. Fecha o Menu Iniciar ao clicar fora dele
    const startMenu = document.getElementById('start-menu');
    const startBtn = document.querySelector('.xp-start-btn');
    if (startMenu.style.display === 'flex' && !startMenu.contains(e.target) && !startBtn.contains(e.target)) {
      startMenu.style.display = 'none';
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

  updateTaskbarHandles();
}

// Gerenciamento de janelas: Fechar
function closeWindow(id) {
  const win = document.getElementById(id);
  if (!win) return;
  win.style.display = 'none';
  updateTaskbarHandles();
}

// Gerenciamento de janelas: Minimizar (alternar exibição)
function minimizeWindow(id) {
  const win = document.getElementById(id);
  if (!win) return;
  win.style.display = 'none';
  updateTaskbarHandles();
}

// Gerenciamento de janelas: Alternar maximização
function maximizeWindow(id) {
  const win = document.getElementById(id);
  if (!win) return;
  
  if (win.style.width === '100vw' && win.style.height === 'calc(100vh - 40px)') {
    // Restaura o tamanho original
    win.style.width = win.dataset.prevWidth || '500px';
    win.style.height = win.dataset.prevHeight || 'auto';
    win.style.left = win.dataset.prevLeft || '100px';
    win.style.top = win.dataset.prevTop || '100px';
  } else {
    // Salva as dimensões anteriores
    win.dataset.prevWidth = win.style.width;
    win.dataset.prevHeight = win.style.height;
    win.dataset.prevLeft = win.style.left;
    win.dataset.prevTop = win.style.top;
    
    // Maximiza
    win.style.width = '100vw';
    win.style.height = 'calc(100vh - 40px)';
    win.style.left = '0px';
    win.style.top = '0px';
  }
}

// Manipuladores para arrastar janelas
function dragStart(e, id) {
  // Traz a janela para a frente
  focusWindow(id);
  
  const win = document.getElementById(id);
  if (!win || win.style.width === '100vw') return; // Não arrasta janelas maximizadas

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
    { id: 'window-overview', left: '60px', top: '40px', width: '620px' },
    { id: 'window-colors', left: '100px', top: '80px', width: '680px' },
    { id: 'window-typography', left: '140px', top: '120px', width: '660px' },
    { id: 'window-paint', left: '80px', top: '60px', width: '620px' },
    { id: 'window-components', left: '180px', top: '160px', width: '700px' },
    { id: 'window-layout', left: '220px', top: '200px', width: '640px' },
    { id: 'window-depth', left: '260px', top: '240px', width: '620px' },
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
}

// Alterna a exibição do pop-up do Menu Iniciar
function toggleStartMenu() {
  const startMenu = document.getElementById('start-menu');
  if (!startMenu) return;
  
  if (startMenu.style.display === 'flex') {
    startMenu.style.display = 'none';
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
    startMenu.style.display = 'flex';
  }
}

// Inicializa as interações de clique/hover do Menu Iniciar
function initStartMenuInteraction() {
  const allProgramsBtn = document.getElementById('all-programs-btn');
  const startMenu = document.getElementById('start-menu');
  const defaultRight = document.getElementById('start-menu-right-default');
  const programsPanel = document.getElementById('start-menu-programs-panel');
  const leftItems = document.querySelectorAll('.xp-start-menu-left .xp-start-menu-item');

  if (!allProgramsBtn || !startMenu || !defaultRight || !programsPanel) return;

  function showPrograms() {
    programsPanel.style.display = 'flex';
    defaultRight.style.display = 'none';
    allProgramsBtn.classList.add('active');
  }

  function hidePrograms() {
    programsPanel.style.display = 'none';
    defaultRight.style.display = 'flex';
    allProgramsBtn.classList.remove('active');
  }

  // Passar o mouse no botão Todos os Programas abre o sub-menu
  allProgramsBtn.addEventListener('mouseenter', showPrograms);
  // Clicar no botão Todos os Programas alterna/abre o sub-menu
  allProgramsBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    showPrograms();
  });

  // Passar o mouse em qualquer item regular da coluna esquerda restaura a visualização padrão
  leftItems.forEach(item => {
    item.addEventListener('mouseenter', hidePrograms);
  });

  // Sair completamente do menu iniciar restaura a visualização padrão
  startMenu.addEventListener('mouseleave', hidePrograms);
}

// Atualiza os manipuladores na barra de tarefas para representar janelas visíveis
function updateTaskbarHandles() {
  const container = document.getElementById('taskbar-handles');
  if (!container) return;
  
  container.innerHTML = '';
  
  // Mapeia os IDs das janelas para seus nomes na barra de tarefas
  const winNames = {
    'window-overview': 'Visão Geral',
    'window-colors': 'Cores',
    'window-typography': 'Tipografia',
    'window-paint': 'Paint',
    'window-components': 'Componentes',
    'window-layout': 'Grade de Layout',
    'window-depth': 'Elevação',
    'window-dos': 'Fazer / Não Fazer',
    'window-responsive': 'Simulador Vídeo'
  };

  // Mapeia os IDs das janelas para seus respectivos ícones na barra de tarefas
  const winIcons = {
    'window-overview': 'icons/Windows XP Icons/My Computer.png',
    'window-colors': 'icons/Windows XP Icons/Color Profile.png',
    'window-typography': 'icons/Windows XP Icons/Fonts.png',
    'window-paint': 'icons/Windows XP Icons/Paint.png',
    'window-components': 'icons/Windows XP Icons/Control Panel.png',
    'window-layout': 'icons/Windows XP Icons/Tweak UI.png',
    'window-depth': 'icons/Windows XP Icons/Appearance.png',
    'window-dos': 'icons/Windows XP Icons/Checklist.png',
    'window-responsive': 'icons/Windows XP Icons/Display Properties.png'
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
        <img src="${winIcons[id] || 'icons/Windows XP Icons/Default.png'}" style="width: 16px; height: 16px; margin-right: 4px; flex-shrink: 0;">
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

// Mostra um balão de notificação clássico do XP no canto inferior direito
function showNotification(msg) {
  // Verifica se a notificação já existe, remove-a
  const oldNotif = document.getElementById('xp-balloon');
  if (oldNotif) oldNotif.remove();
  
  const balloon = document.createElement('div');
  balloon.id = 'xp-balloon';
  balloon.className = 'xp-balloon';
  
  balloon.innerHTML = `
    <div class="xp-balloon-header">
      <span>Área de Transferência do Sistema</span>
      <span class="xp-balloon-close" onclick="document.getElementById('xp-balloon').remove()">X</span>
    </div>
    <div class="xp-balloon-content">
      <img class="xp-balloon-icon" src="icons/Windows XP Icons/Information.png" alt="Info">
      <div>${msg}</div>
    </div>
  `;
  
  document.getElementById('desktop').appendChild(balloon);
  
  // Remove automaticamente após 5 segundos
  setTimeout(() => {
    if (balloon.parentNode) {
      balloon.remove();
    }
  }, 5000);
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
  paintCanvas = document.getElementById('paint-canvas');
  if (!paintCanvas) return;
  
  paintCtx = paintCanvas.getContext('2d');
  
  // Configura o formato das pontas do pincel
  paintCtx.lineCap = 'round';
  paintCtx.lineJoin = 'round';
  
  // Preenche inicialmente a tela com branco
  clearCanvas();
  
  // Ouvintes para desenhar com mouse
  paintCanvas.addEventListener('mousedown', startDrawing);
  paintCanvas.addEventListener('mousemove', draw);
  paintCanvas.addEventListener('mouseup', stopDrawing);
  paintCanvas.addEventListener('mouseleave', stopDrawing);
  
  // Suporte a toque para dispositivos móveis
  paintCanvas.addEventListener('touchstart', (e) => {
    const touch = e.touches[0];
    const rect = paintCanvas.getBoundingClientRect();
    const mouseEvent = new MouseEvent('mousedown', {
      clientX: touch.clientX,
      clientY: touch.clientY
    });
    paintCanvas.dispatchEvent(mouseEvent);
  }, { passive: true });

  paintCanvas.addEventListener('touchmove', (e) => {
    const touch = e.touches[0];
    const rect = paintCanvas.getBoundingClientRect();
    const mouseEvent = new MouseEvent('mousemove', {
      clientX: touch.clientX,
      clientY: touch.clientY
    });
    paintCanvas.dispatchEvent(mouseEvent);
  }, { passive: true });

  paintCanvas.addEventListener('touchend', () => {
    const mouseEvent = new MouseEvent('mouseup', {});
    paintCanvas.dispatchEvent(mouseEvent);
  }, { passive: true });
}

function startDrawing(e) {
  isDrawing = true;
  
  // Obtém o deslocamento das coordenadas com base no retângulo do canvas
  const rect = paintCanvas.getBoundingClientRect();
  lastX = e.clientX - rect.left;
  lastY = e.clientY - rect.top;
  
  // Desenha um ponto imediatamente após o clique
  draw(e);
}

function draw(e) {
  if (!isDrawing) return;
  
  const rect = paintCanvas.getBoundingClientRect();
  const currentX = e.clientX - rect.left;
  const currentY = e.clientY - rect.top;
  
  paintCtx.beginPath();
  paintCtx.moveTo(lastX, lastY);
  paintCtx.lineTo(currentX, currentY);
  
  // Configura cores e tamanhos de traço de acordo com a ferramenta ativa
  if (paintTool === 'eraser') {
    paintCtx.strokeStyle = '#FFFFFF';
    paintCtx.lineWidth = 15; // Tamanho fixo da borracha
  } else {
    paintCtx.strokeStyle = paintColor;
    paintCtx.lineWidth = paintTool === 'pencil' ? 1.5 : paintSize;
  }
  
  paintCtx.stroke();
  
  lastX = currentX;
  lastY = currentY;
}

function stopDrawing() {
  isDrawing = false;
}

// Seleção de ferramenta
function selectPaintTool(tool) {
  paintTool = tool;
  
  // Atualiza classe ativa da barra de ferramentas
  document.querySelectorAll('.xp-paint-tool-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  const activeBtn = document.getElementById(`tool-${tool}`);
  if (activeBtn) activeBtn.classList.add('active');
}

// Seleção de tamanho do pincel
function selectPaintSize(size, el) {
  paintSize = size;
  
  // Atualiza classe ativa do tamanho do pincel
  document.querySelectorAll('.xp-paint-size-option').forEach(opt => {
    opt.classList.remove('active');
  });
  
  el.classList.add('active');
}

// Seleção de cor
function selectPaintColor(hex) {
  paintColor = hex;
  document.getElementById('paint-color-preview').style.backgroundColor = hex;
}

// Limpa a área de desenho
function clearCanvas() {
  if (!paintCtx || !paintCanvas) return;
  paintCtx.fillStyle = '#FFFFFF';
  paintCtx.fillRect(0, 0, paintCanvas.width, paintCanvas.height);
}
