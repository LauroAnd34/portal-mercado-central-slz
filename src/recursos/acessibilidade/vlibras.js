/**
 * Tradutor de Libras do Governo Federal (VLibras) — ativado por padrão, como
 * nos portais gov.br. O botão azul com as mãos fica no canto direito da tela;
 * ao clicar, o avatar traduz para Libras o texto que a pessoa selecionar.
 * A pessoa pode esconder o botão no painel de acessibilidade.
 * Documentação: https://www.gov.br/governodigital/pt-br/vlibras
 *
 * A marcação oficial (<div vw ...>) está em src/parciais/rodape.html.
 */
import { preferencias } from '../../nucleo/preferencias.js';
import { anunciar } from '../../nucleo/anunciador.js';

const URL_SCRIPT = 'https://vlibras.gov.br/app/vlibras-plugin.js';
const URL_APLICATIVO = 'https://vlibras.gov.br/app';
let estado = 'nao-carregado'; // 'nao-carregado' | 'carregando' | 'pronto' | 'erro'

const obterContainer = () => document.querySelector('[vw]');
/**
 * A versão 7 do VLibras cria o próprio botão (#vlibras-access-wrapper) e a
 * janela do avatar (#vlibras-app-root); versões antigas usam a <div vw>.
 * Mostramos/escondemos todos, para funcionar com qualquer versão.
 */
const SELETOR_ELEMENTOS_VLIBRAS = '[vw], #vlibras-access-wrapper, #vlibras-app-root';
const definirVisibilidade = (visivel) =>
  document.querySelectorAll(SELETOR_ELEMENTOS_VLIBRAS).forEach((el) => (el.hidden = !visivel));

/** Garante a marcação oficial do VLibras (caso alguma página não tenha o rodapé). */
function garantirContainer() {
  if (obterContainer()) return;
  const container = document.createElement('div');
  container.setAttribute('vw', '');
  container.className = 'enabled';
  container.innerHTML = `
    <div vw-access-button class="active"></div>
    <div vw-plugin-wrapper><div class="vw-plugin-top-wrapper"></div></div>`;
  document.body.append(container);
}

function iniciarWidget() {
  new window.VLibras.Widget(URL_APLICATIVO);
  // versões antigas se montam no evento "load" da janela; se ele já passou, repetimos
  if (document.readyState === 'complete' && !document.getElementById('vlibras-access-wrapper')) {
    window.dispatchEvent(new Event('load'));
  }
}

function mostrarVLibras() {
  garantirContainer();
  definirVisibilidade(true);
  if (estado === 'pronto' || estado === 'carregando') return;
  estado = 'carregando';
  const script = document.createElement('script');
  script.src = URL_SCRIPT;
  script.async = true;
  script.onload = () => {
    estado = 'pronto';
    iniciarWidget();
  };
  script.onerror = () => {
    // sem internet: avisa, mas mantém a preferência (volta a funcionar online)
    estado = 'erro';
    definirVisibilidade(false);
    anunciar('O tradutor VLibras precisa de internet e não pôde ser carregado agora.');
  };
  document.head.append(script);
}

function esconderVLibras() {
  definirVisibilidade(false);
}

export function iniciarVLibras() {
  const aplicar = ({ vlibras }) => (vlibras ? mostrarVLibras() : esconderVLibras());
  aplicar(preferencias.obter());
  preferencias.assinar((novo, mudancas) => mudancas.includes('vlibras') && aplicar(novo));
}
