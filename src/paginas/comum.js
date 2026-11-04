/**
 * Inicialização compartilhada por todas as páginas:
 * fontes locais (funcionam sem internet), estilos globais e recursos de
 * acessibilidade.
 */
import '@fontsource/montserrat/latin-400.css';
import '@fontsource/montserrat/latin-600.css';
import '@fontsource/montserrat/latin-700.css';
import '@fontsource/montserrat/latin-800.css';
import '@fontsource/atkinson-hyperlegible/latin-400.css';
import '@fontsource/atkinson-hyperlegible/latin-700.css';
import '@fontsource/opendyslexic/latin-400.css';
import '@fontsource/opendyslexic/latin-700.css';
import '@fontsource/fraunces/latin-600.css';
import '@fontsource/fraunces/latin-600-italic.css';

import '../estilos/tokens.css';
import '../estilos/basico.css';
import '../estilos/componentes/cabecalho.css';
import '../estilos/componentes/controles.css';
import '../estilos/componentes/painel-e-rodape.css';
import '../estilos/componentes/animacoes.css';

import { iniciarControlesDeAcessibilidade } from '../recursos/acessibilidade/controles-de-acessibilidade.js';
import { iniciarReguaDeLeitura } from '../recursos/acessibilidade/regua-de-leitura.js';
import { iniciarVLibras } from '../recursos/acessibilidade/vlibras.js';
import { iniciarLeituraDeSelecao } from '../recursos/acessibilidade/leitura-de-selecao.js';
import { iniciarBotaoFlutuante } from '../recursos/acessibilidade/botao-flutuante.js';
import { iniciarAtalhosDeTeclado } from '../recursos/acessibilidade/atalhos-de-teclado.js';
import { iniciarMenuMovel } from '../recursos/navegacao/menu-movel.js';
import { iniciarAnimacoes } from '../recursos/animacoes/animacoes.js';
import { preencherFotos, montarCreditos } from '../recursos/fotos/fotos.js';

/**
 * Proteção contra páginas falsas que tentam mostrar o portal "dentro" delas
 * (clickjacking). No servidor da Prefeitura, use também o cabeçalho
 * Content-Security-Policy: frame-ancestors 'self'.
 */
function impedirSiteDentroDeOutro() {
  try {
    if (window.top !== window.self) window.top.location.href = window.location.href;
  } catch {
    document.documentElement.innerHTML = '';
  }
}

export function iniciarPaginaComum() {
  impedirSiteDentroDeOutro();
  const { abrirPainel } = iniciarControlesDeAcessibilidade();
  iniciarAtalhosDeTeclado({ abrirPainel });
  iniciarBotaoFlutuante();
  iniciarReguaDeLeitura();
  iniciarVLibras();
  iniciarLeituraDeSelecao();
  iniciarMenuMovel();
  preencherFotos();
  montarCreditos();
  iniciarVoltarAoTopo();
  registrarModoOffline();
  // depois que cada página montou seu conteúdo dinâmico (cartões, sabores…)
  queueMicrotask(iniciarAnimacoes);
}

/** "Voltar ao topo": rola até o início e leva o foco para o primeiro atalho. */
function iniciarVoltarAoTopo() {
  document.querySelectorAll('[data-voltar-topo]').forEach((botao) =>
    botao.addEventListener('click', () => {
      const reduzido = document.documentElement.dataset.movimento === 'reduzido';
      window.scrollTo({ top: 0, behavior: reduzido ? 'auto' : 'smooth' });
      const primeiro = document.querySelector('.barra-gov__atalhos a, .marca');
      primeiro?.focus({ preventScroll: true });
    }),
  );
}

/** Guarda o site no aparelho para funcionar sem internet (só na versão publicada). */
function registrarModoOffline() {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return;
  if (!/^https?:$/.test(location.protocol)) return;
  // Quando sair uma versão nova do site, a página recarrega sozinha uma vez,
  // para ninguém ficar vendo a versão antiga guardada.
  const jaTinhaVersao = Boolean(navigator.serviceWorker.controller);
  let recarregou = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!jaTinhaVersao || recarregou) return;
    recarregou = true;
    location.reload();
  });
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('./sw.js', { updateViaCache: 'none' })
      .then((registro) => registro.update())
      .catch(() => {
        /* sem modo offline: o site continua funcionando normalmente */
      });
  });
}
