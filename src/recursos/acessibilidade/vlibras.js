/**
 * Tradutor de Libras do Governo Federal (VLibras) — ativado por padrão, como
 * nos portais gov.br. O botão próprio do VLibras fica escondido para não haver
 * dois botões flutuantes: ele é aberto pelo "Traduzir para Libras" do nosso
 * painel de acessibilidade (botão flutuante único).
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

/** Abre o avatar do VLibras (o botão próprio dele fica escondido: usamos o nosso). */
export function abrirVLibras() {
  const clicar = () => {
    const botao =
      document
        .getElementById('vlibras-access-wrapper')
        ?.shadowRoot?.getElementById('vlibras-button') ??
      document.querySelector('[vw-access-button]');
    if (!botao) return false;
    definirVisibilidade(true);
    botao.click();
    return true;
  };
  if (estado !== 'pronto') mostrarVLibras();
  if (clicar()) return;
  // ainda carregando: tenta por alguns segundos
  let tentativas = 0;
  const espera = setInterval(() => {
    tentativas += 1;
    if (clicar() || tentativas > 40) clearInterval(espera);
    if (tentativas > 40 && estado !== 'pronto')
      anunciar('O tradutor VLibras precisa de internet e não pôde ser carregado agora.');
  }, 250);
}

export function iniciarVLibras() {
  document.addEventListener('click', (evento) => {
    if (!evento.target.closest('[data-abrir-libras]')) return;
    evento.target.closest('dialog')?.close();
    abrirVLibras();
  });
  const aplicar = ({ vlibras }) => (vlibras ? mostrarVLibras() : esconderVLibras());
  aplicar(preferencias.obter());
  preferencias.assinar((novo, mudancas) => mudancas.includes('vlibras') && aplicar(novo));
}
