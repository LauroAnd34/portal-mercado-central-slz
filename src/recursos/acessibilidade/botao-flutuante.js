/**
 * Botão flutuante de acessibilidade (como o do VLibras).
 * - Clique (ou Enter/Espaço): abre o painel de acessibilidade.
 * - Arrastar com o mouse ou o dedo: muda o botão de lugar; ao soltar, ele
 *   encosta na lateral mais próxima (esquerda ou direita), na altura escolhida.
 * - Quem não consegue arrastar escolhe um canto no próprio painel (WCAG 2.5.7).
 * O lugar escolhido fica guardado só neste navegador.
 */
const CHAVE = 'mercado-posicao-botao-acessibilidade';
const MARGEM = 12;
const LIMIAR_ARRASTE = 6; // px antes de considerar que é arraste, e não clique

const CANTOS = {
  'inferior-direito': { x: 1, y: 1 },
  'inferior-esquerdo': { x: 0, y: 1 },
  'superior-direito': { x: 1, y: 0 },
  'superior-esquerdo': { x: 0, y: 0 },
};

function ler() {
  try {
    const salvo = JSON.parse(localStorage.getItem(CHAVE));
    if (salvo && Number.isFinite(salvo.x) && Number.isFinite(salvo.y)) return salvo;
  } catch {
    /* sem armazenamento: usa o padrão */
  }
  return { ...CANTOS['inferior-direito'], canto: 'inferior-direito' };
}

function salvar(posicao) {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(posicao));
  } catch {
    /* navegação privada: o botão volta ao padrão na próxima visita */
  }
}

export function iniciarBotaoFlutuante() {
  const botao = document.querySelector('[data-botao-flutuante]');
  if (!botao) return;
  let posicao = ler(); // x e y de 0 a 1 (fração da área livre da tela)

  // áreas da tela cobertas por entalhe, câmera ou barra de gestos (celulares modernos)
  const sonda = document.createElement('div');
  sonda.style.cssText =
    'position:fixed;inset:0;visibility:hidden;pointer-events:none;padding:calc(env(safe-area-inset-top) + var(--reserva-topo, 0px)) env(safe-area-inset-right) calc(env(safe-area-inset-bottom) + var(--reserva-base, 0px)) env(safe-area-inset-left)';
  document.body.append(sonda);
  const seguro = () => {
    const c = getComputedStyle(sonda);
    return {
      t: parseFloat(c.paddingTop) || 0,
      r: parseFloat(c.paddingRight) || 0,
      b: parseFloat(c.paddingBottom) || 0,
      l: parseFloat(c.paddingLeft) || 0,
    };
  };
  const aplicar = () => {
    const m = seguro();
    const livreX = window.innerWidth - botao.offsetWidth - MARGEM * 2 - m.l - m.r;
    const livreY = window.innerHeight - botao.offsetHeight - MARGEM * 2 - m.t - m.b;
    botao.style.left = `${MARGEM + m.l + Math.round(livreX * posicao.x)}px`;
    botao.style.top = `${MARGEM + m.t + Math.round(livreY * posicao.y)}px`;
    botao.classList.toggle('botao-flutuante-acessibilidade--esquerda', posicao.x < 0.5);
  };

  const marcarCanto = () => {
    document
      .querySelectorAll('input[name="posicao-botao"]')
      .forEach((r) => (r.checked = r.value === posicao.canto));
  };

  aplicar();
  marcarCanto();
  botao.classList.add('botao-flutuante-acessibilidade--pronto');
  window.addEventListener('resize', aplicar);

  // ---- arrastar ----
  let inicio = null;
  let arrastou = false;
  botao.addEventListener('pointerdown', (evento) => {
    if (evento.button !== 0) return;
    evento.preventDefault(); // evita que o navegador inicie "arrastar e soltar" nativo
    const caixa = botao.getBoundingClientRect();
    inicio = {
      x: evento.clientX,
      y: evento.clientY,
      dx: evento.clientX - caixa.left,
      dy: evento.clientY - caixa.top,
    };
    arrastou = false;
    botao.setPointerCapture(evento.pointerId);
  });
  botao.addEventListener('pointermove', (evento) => {
    if (!inicio) return;
    if (
      !arrastou &&
      Math.hypot(evento.clientX - inicio.x, evento.clientY - inicio.y) < LIMIAR_ARRASTE
    )
      return;
    arrastou = true;
    botao.classList.add('botao-flutuante-acessibilidade--arrastando');
    const livreX = window.innerWidth - botao.offsetWidth - MARGEM * 2;
    const livreY = window.innerHeight - botao.offsetHeight - MARGEM * 2;
    const x = Math.min(Math.max(evento.clientX - inicio.dx - MARGEM, 0), livreX);
    const y = Math.min(Math.max(evento.clientY - inicio.dy - MARGEM, 0), livreY);
    posicao = { x: livreX ? x / livreX : 1, y: livreY ? y / livreY : 1, canto: null };
    aplicar();
  });
  const terminar = () => {
    if (!inicio) return;
    inicio = null;
    botao.classList.remove('botao-flutuante-acessibilidade--arrastando');
    if (arrastou) {
      // o botão "gruda" na lateral mais próxima (esquerda ou direita), na altura escolhida
      posicao.x = posicao.x < 0.5 ? 0 : 1;
      // na direita, não fica em cima do botão do VLibras (meio da tela)
      if (posicao.x === 1 && Math.abs(posicao.y - 0.5) < 0.1) posicao.y = 0.64;
      botao.classList.add('botao-flutuante-acessibilidade--assentando');
      aplicar();
      setTimeout(() => botao.classList.remove('botao-flutuante-acessibilidade--assentando'), 300);
      salvar(posicao);
      marcarCanto();
    }
  };
  botao.addEventListener('dragstart', (evento) => evento.preventDefault());
  botao.addEventListener('pointerup', terminar);
  botao.addEventListener('pointercancel', terminar);
  // depois de arrastar, o "clique" que o navegador dispara não deve abrir o painel
  botao.addEventListener(
    'click',
    (evento) => {
      if (arrastou) {
        evento.stopImmediatePropagation();
        evento.preventDefault();
        arrastou = false;
      }
    },
    true,
  );

  // ---- escolher um canto pelo painel ----
  document.addEventListener('change', (evento) => {
    const radio = evento.target.closest('input[name="posicao-botao"]');
    if (!radio || !CANTOS[radio.value]) return;
    posicao = { ...CANTOS[radio.value], canto: radio.value };
    salvar(posicao);
    aplicar();
  });
}
