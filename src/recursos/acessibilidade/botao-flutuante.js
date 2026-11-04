/**
 * Botão flutuante de acessibilidade (como o do VLibras).
 * - Clique (ou Enter/Espaço): abre o painel de acessibilidade.
 * - Arrastar com o mouse ou o dedo: muda o botão de lugar.
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

  const aplicar = () => {
    const livreX = window.innerWidth - botao.offsetWidth - MARGEM * 2;
    const livreY = window.innerHeight - botao.offsetHeight - MARGEM * 2;
    botao.style.left = `${MARGEM + Math.round(livreX * posicao.x)}px`;
    botao.style.top = `${MARGEM + Math.round(livreY * posicao.y)}px`;
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
    inicio = { x: evento.clientX, y: evento.clientY, dx: evento.clientX - caixa.left, dy: evento.clientY - caixa.top };
    arrastou = false;
    botao.setPointerCapture(evento.pointerId);
  });
  botao.addEventListener('pointermove', (evento) => {
    if (!inicio) return;
    if (!arrastou && Math.hypot(evento.clientX - inicio.x, evento.clientY - inicio.y) < LIMIAR_ARRASTE)
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
