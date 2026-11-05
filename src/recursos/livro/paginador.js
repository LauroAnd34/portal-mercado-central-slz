/**
 * Leitura em páginas (estilo leitor digital), usada na tela cheia do livro.
 * Técnica: colunas de CSS — o capítulo é dividido em "páginas" lado a lado e o
 * leitor mostra uma (ou duas, em telas largas) de cada vez. Mesma ideia de
 * leitores como o foliate-js e o epub.js.
 *
 * Como virar a página (todas funcionam juntas):
 *  - tocar/clicar na lateral direita ou esquerda do texto;
 *  - arrastar o dedo para o lado;
 *  - setas, Page Up/Down e barra de espaço;
 *  - a barra de progresso embaixo (arrastar para ir a qualquer página);
 *  - tocar no meio do texto mostra/esconde as ferramentas.
 * Leitores de tela continuam lendo o texto inteiro, na ordem normal.
 */
const VAO = 64; // espaço entre colunas, em px

export function criarPaginador({ leitor, texto, aoPrecisarDeOutroCapitulo, minutosDoCapitulo }) {
  let ativo = false;
  let pagina = 0;
  let total = 1;
  let passo = 1;
  const status = leitor.querySelector('[data-status-pagina]');
  const deslizador = leitor.querySelector('[data-deslizador-pagina]');
  const reduzido = () =>
    document.documentElement.dataset.movimento === 'reduzido' ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const medir = () => {
    if (!ativo) return;
    const largura = texto.clientWidth;
    const colunas = largura >= 960 ? 2 : 1;
    texto.style.columnWidth = `${Math.floor((largura - VAO * (colunas - 1)) / colunas)}px`;
    texto.style.columnGap = `${VAO}px`;
    passo = largura + VAO;
    total = Math.max(1, Math.round((texto.scrollWidth + VAO) / passo));
    deslizador.max = String(total);
    irPara(Math.min(pagina, total - 1), { suave: false });
  };

  const atualizarStatus = () => {
    const restante = Math.max(0, Math.round(minutosDoCapitulo() * (1 - (pagina + 1) / total)));
    status.textContent = `Página ${pagina + 1} de ${total}${
      restante > 0 ? ` · ${restante} min até o fim do capítulo` : ' · fim do capítulo'
    }`;
    deslizador.value = String(pagina + 1);
    deslizador.setAttribute('aria-valuetext', `Página ${pagina + 1} de ${total}`);
  };

  function irPara(nova, { suave = true } = {}) {
    pagina = Math.max(0, Math.min(nova, total - 1));
    texto.scrollTo({ left: pagina * passo, behavior: suave && !reduzido() ? 'smooth' : 'auto' });
    atualizarStatus();
  }

  const proxima = () => {
    if (pagina < total - 1) irPara(pagina + 1);
    else aoPrecisarDeOutroCapitulo(1);
  };
  const anterior = () => {
    if (pagina > 0) irPara(pagina - 1);
    else aoPrecisarDeOutroCapitulo(-1);
  };

  // algo dentro do texto foi trazido à vista (leitura em voz alta, busca, marcador):
  // descobre em que página ficou
  let esperaRolagem;
  texto.addEventListener('scroll', () => {
    if (!ativo) return;
    clearTimeout(esperaRolagem);
    esperaRolagem = setTimeout(() => {
      const calculada = Math.round(texto.scrollLeft / passo);
      if (calculada !== pagina) {
        pagina = calculada;
        atualizarStatus();
      }
      // garante o alinhamento exato com a página
      if (Math.abs(texto.scrollLeft - pagina * passo) > 2) irPara(pagina, { suave: false });
    }, 120);
  });

  /* ---------- toques, cliques e gestos ---------- */
  let inicio = null;
  texto.addEventListener('pointerdown', (evento) => {
    if (!ativo) return;
    inicio = { x: evento.clientX, y: evento.clientY, t: performance.now() };
  });
  texto.addEventListener('pointerup', (evento) => {
    if (!ativo || !inicio) return;
    const dx = evento.clientX - inicio.x;
    const dy = evento.clientY - inicio.y;
    const rapido = performance.now() - inicio.t < 700;
    inicio = null;
    // não atrapalha quem toca num link, num termo do glossário ou seleciona texto
    if (evento.target.closest('a, button, input, summary, .termo')) return;
    if (String(window.getSelection()).trim()) return;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) && rapido) {
      if (dx < 0) proxima();
      else anterior();
      return;
    }
    if (Math.abs(dx) > 10 || Math.abs(dy) > 10) return;
    const caixa = texto.getBoundingClientRect();
    const fracao = (evento.clientX - caixa.left) / caixa.width;
    if (fracao > 0.7) proxima();
    else if (fracao < 0.3) anterior();
    else document.body.classList.toggle('leitura-sem-ferramentas');
  });
  // roda do mouse/trackpad vira a página (com intervalo, para não pular várias)
  let ultimaRoda = 0;
  texto.addEventListener(
    'wheel',
    (evento) => {
      if (!ativo) return;
      evento.preventDefault();
      const agora = performance.now();
      if (agora - ultimaRoda < 450) return;
      const delta =
        Math.abs(evento.deltaY) > Math.abs(evento.deltaX) ? evento.deltaY : evento.deltaX;
      if (Math.abs(delta) < 8) return;
      ultimaRoda = agora;
      if (delta > 0) proxima();
      else anterior();
    },
    { passive: false },
  );
  document.addEventListener('keydown', (evento) => {
    if (!ativo || evento.altKey || evento.ctrlKey || evento.metaKey) return;
    if (evento.target.closest('input, select, textarea, [contenteditable]')) return;
    if (document.querySelector('dialog[open]')) return;
    const teclas = {
      ArrowRight: proxima,
      ArrowLeft: anterior,
      PageDown: proxima,
      PageUp: anterior,
      ' ': evento.shiftKey ? anterior : proxima,
    };
    if (evento.key === ' ' && evento.target.closest('button, a')) return;
    if (teclas[evento.key]) {
      evento.preventDefault();
      teclas[evento.key]();
    }
  });
  deslizador.addEventListener('input', () =>
    irPara(Number(deslizador.value) - 1, { suave: false }),
  );
  leitor.querySelector('[data-pagina-anterior]')?.addEventListener('click', () => anterior());
  leitor.querySelector('[data-pagina-proxima]')?.addEventListener('click', () => proxima());

  // mudou o tamanho da tela ou das letras: refaz as páginas
  const observador = new ResizeObserver(() => medir());
  observador.observe(texto);
  new MutationObserver(() => requestAnimationFrame(medir)).observe(leitor, {
    attributes: true,
    attributeFilter: ['style', 'class'],
  });
  new MutationObserver(() => requestAnimationFrame(medir)).observe(document.documentElement, {
    attributes: true,
  });

  return {
    ligar() {
      ativo = true;
      document.body.classList.add('leitura-paginada');
      pagina = 0;
      requestAnimationFrame(medir);
    },
    desligar() {
      ativo = false;
      document.body.classList.remove('leitura-paginada', 'leitura-sem-ferramentas');
      texto.style.columnWidth = '';
      texto.style.columnGap = '';
      texto.scrollLeft = 0;
    },
    /** chamado quando um capítulo novo aparece: vai para a primeira ou a última página */
    aoTrocarCapitulo({ irParaFim = false } = {}) {
      if (!ativo) return;
      requestAnimationFrame(() => {
        medir();
        irPara(irParaFim ? total - 1 : 0, { suave: false });
      });
    },
    get ativo() {
      return ativo;
    },
  };
}
