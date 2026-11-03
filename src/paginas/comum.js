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

import '../estilos/tokens.css';
import '../estilos/basico.css';
import '../estilos/componentes/cabecalho.css';
import '../estilos/componentes/controles.css';
import '../estilos/componentes/painel-e-rodape.css';

import { iniciarControlesDeAcessibilidade } from '../recursos/acessibilidade/controles-de-acessibilidade.js';
import { iniciarReguaDeLeitura } from '../recursos/acessibilidade/regua-de-leitura.js';
import { iniciarVLibras } from '../recursos/acessibilidade/vlibras.js';
import { iniciarLeituraDeSelecao } from '../recursos/acessibilidade/leitura-de-selecao.js';
import { iniciarAtalhosDeTeclado } from '../recursos/acessibilidade/atalhos-de-teclado.js';
import { iniciarMenuMovel } from '../recursos/navegacao/menu-movel.js';

export function iniciarPaginaComum() {
  const { abrirPainel } = iniciarControlesDeAcessibilidade();
  iniciarAtalhosDeTeclado({ abrirPainel });
  iniciarReguaDeLeitura();
  iniciarVLibras();
  iniciarLeituraDeSelecao();
  iniciarMenuMovel();
  registrarModoOffline();
}

/** Guarda o site no aparelho para funcionar sem internet (só na versão publicada). */
function registrarModoOffline() {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return;
  if (!/^https?:$/.test(location.protocol)) return;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {
      /* sem modo offline: o site continua funcionando normalmente */
    });
  });
}
