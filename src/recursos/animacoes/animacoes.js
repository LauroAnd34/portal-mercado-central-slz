/**
 * Animações que dependem de JavaScript:
 *  - elementos aparecem suavemente ao rolar a página (em cascata);
 *  - números da página inicial "contam" até o valor final;
 *  - troca de página suave é pulada se a pessoa pausou as animações.
 * Se as animações estiverem pausadas (painel ou sistema), nada disso roda e o
 * conteúdo aparece direto.
 */
import { preferencias } from '../../nucleo/preferencias.js';

const SELETORES_REVELAR = [
  ['.titulo-modulo', ''],
  ['.cartoes > li', ''],
  ['.sabores > li', 'zoom'],
  ['.setor', 'direita'],
  ['.info-bloco', 'esquerda'],
  ['.recursos-grade > li', ''],
  ['.selos > li', 'zoom'],
  ['.roteiros > li', ''],
  ['.downloads > li', 'direita'],
  ['.linha', ''],
  ['.chamada-mapa__texto', 'esquerda'],
  ['.chamada-mapa__arte', 'direita'],
  ['.faixa-institucional__conteudo', 'zoom'],
  ['.glossario-chamada', ''],
  ['.vozes__lista > li', ''],
  ['.comparador', 'esquerda'],
  ['.novo-mercado__texto', 'direita'],
  ['.aviso-obra', ''],
  ['.contato-barreira', ''],
  ['.tabela-rolagem', ''],
  ['.capa-livro', 'esquerda'],
  ['.visite__setores h3, .visite__ajuda', ''],
];

export const animacoesPermitidas = () =>
  !preferencias.obter().movimento &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches &&
  'IntersectionObserver' in window;

function prepararRevelar() {
  const elementos = [];
  for (const [seletor, direcao] of SELETORES_REVELAR) {
    document.querySelectorAll(seletor).forEach((el) => {
      if (el.closest('dialog') || el.dataset.revelar !== undefined) return;
      el.dataset.revelar = direcao;
      // cascata: irmãos do mesmo tipo entram um depois do outro
      const irmaos = [...(el.parentElement?.children ?? [])];
      el.style.setProperty('--atraso', String(Math.min(irmaos.indexOf(el), 8)));
      elementos.push(el);
    });
  }
  return elementos;
}

function contarNumero(el) {
  const final = el.textContent.trim();
  const correspondencia = final.match(/^(\d+)(.*)$/);
  if (!correspondencia) return;
  const alvo = Number(correspondencia[1]);
  const sufixo = correspondencia[2];
  const duracao = 1400;
  const inicio = performance.now();
  el.setAttribute('aria-label', final); // leitor de tela ouve só o valor final
  const passo = (agora) => {
    const t = Math.min(1, (agora - inicio) / duracao);
    const suavizado = 1 - Math.pow(1 - t, 3);
    el.textContent = `${Math.round(alvo * suavizado)}${sufixo}`;
    if (t < 1) requestAnimationFrame(passo);
    else el.textContent = final;
  };
  requestAnimationFrame(passo);
}

export function iniciarAnimacoes() {
  // troca de página suave: respeita a pausa de animações
  window.addEventListener('pageswap', (evento) => {
    if (!animacoesPermitidas()) evento.viewTransition?.skipTransition();
  });
  window.addEventListener('pagereveal', (evento) => {
    if (!animacoesPermitidas()) evento.viewTransition?.skipTransition();
  });

  if (!animacoesPermitidas()) return;
  const raiz = document.documentElement;
  const elementos = prepararRevelar();
  raiz.classList.add('animacoes-ativas');

  const observador = new IntersectionObserver(
    (entradas) => {
      for (const entrada of entradas) {
        if (!entrada.isIntersecting) continue;
        entrada.target.classList.add('revelado');
        entrada.target.querySelectorAll?.('.numeros strong').forEach(contarNumero);
        observador.unobserve(entrada.target);
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
  );
  elementos.forEach((el) => observador.observe(el));

  // se a pessoa pausar as animações no meio, mostra tudo na hora
  preferencias.assinar((estado, mudancas) => {
    if (!mudancas.includes('movimento') || !estado.movimento) return;
    raiz.classList.remove('animacoes-ativas');
    observador.disconnect();
  });
}
