/**
 * Tradução da interface no próprio lugar (EN/ES), sem trocar de página.
 * O dicionário (src/dados/traducoes.js) só é baixado quando a pessoa escolhe
 * outro idioma. O texto do livro e os nomes de lugares ficam em português.
 */
const CHAVE = 'slz-mercado:idioma';
const IDIOMAS = ['pt', 'en', 'es'];
const ATRIBUTOS = ['alt', 'aria-label', 'title', 'placeholder'];
// partes que não são traduzidas: texto do livro, mapa, VLibras e o próprio seletor
const IGNORAR =
  'script, style, svg, [vw], [data-texto-capitulo], .leaflet-container, [data-sem-traducao]';

const normalizar = (texto) => texto.replace(/\s+/g, ' ').trim();

export function idiomaSalvo() {
  const daUrl = new URLSearchParams(location.search).get('idioma');
  if (IDIOMAS.includes(daUrl)) return daUrl;
  try {
    const salvo = localStorage.getItem(CHAVE);
    return IDIOMAS.includes(salvo) ? salvo : 'pt';
  } catch {
    return 'pt';
  }
}

let dicionario = null;
let indice = 0; // 0 = inglês, 1 = espanhol
let observador = null;
const originaisTexto = new Map(); // nó de texto → texto original
const originaisAtributo = new Map(); // elemento → { atributo: valor original }
let tituloOriginal = '';

function traduzirTexto(original) {
  const limpo = normalizar(original);
  if (!limpo) return null;
  const par = dicionario.TEXTOS[limpo];
  let traduzido = par ? par[indice] : null;
  if (!traduzido)
    for (const [padrao, montar] of dicionario.PADROES) {
      const achado = limpo.match(padrao);
      if (achado) {
        traduzido = montar(achado, indice);
        break;
      }
    }
  if (!traduzido) return null;
  // mantém os espaços das pontas (separam o texto das palavras vizinhas)
  const inicio = original.match(/^\s*/)[0] ? ' ' : '';
  const fim = original.match(/\s*$/)[0] ? ' ' : '';
  return inicio + traduzido + fim;
}

function traduzirEm(raiz) {
  if (!raiz || (raiz.nodeType === 1 && raiz.closest(IGNORAR))) return;
  if (raiz.nodeType === 3) {
    traduzirNoDeTexto(raiz);
    return;
  }
  const caminhante = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT, {
    acceptNode: (no) =>
      no.parentElement?.closest(IGNORAR) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT,
  });
  const nos = [];
  while (caminhante.nextNode()) nos.push(caminhante.currentNode);
  nos.forEach(traduzirNoDeTexto);
  const elementos = raiz.querySelectorAll ? [raiz, ...raiz.querySelectorAll('*')] : [];
  elementos.forEach((el) => {
    if (!el.getAttribute || el.closest(IGNORAR)) return;
    ATRIBUTOS.forEach((nome) => {
      const valor = el.getAttribute(nome);
      if (!valor) return;
      const traduzido = traduzirTexto(valor);
      if (!traduzido) return;
      const guardados = originaisAtributo.get(el) ?? {};
      guardados[nome] ??= valor;
      originaisAtributo.set(el, guardados);
      el.setAttribute(nome, traduzido.trim());
    });
  });
}

function traduzirNoDeTexto(no) {
  const traduzido = traduzirTexto(no.nodeValue);
  if (!traduzido || traduzido === no.nodeValue) return;
  if (!originaisTexto.has(no)) originaisTexto.set(no, no.nodeValue);
  no.nodeValue = traduzido;
}

function restaurar() {
  observador?.disconnect();
  observador = null;
  originaisTexto.forEach((texto, no) => (no.nodeValue = texto));
  originaisAtributo.forEach((valores, el) =>
    Object.entries(valores).forEach(([nome, valor]) => el.setAttribute(nome, valor)),
  );
  originaisTexto.clear();
  originaisAtributo.clear();
  if (tituloOriginal) document.title = tituloOriginal;
}

/** Troca o idioma da página (pt, en ou es) sem recarregar. */
export async function aplicarIdioma(idioma) {
  if (!IDIOMAS.includes(idioma)) idioma = 'pt';
  try {
    localStorage.setItem(CHAVE, idioma);
  } catch {
    /* sem armazenamento: vale só nesta visita */
  }
  restaurar();
  document.documentElement.lang = { pt: 'pt-BR', en: 'en', es: 'es' }[idioma];
  document
    .querySelectorAll('[data-idioma]')
    .forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.idioma === idioma)));
  if (idioma === 'pt') return;

  dicionario ??= await import('../dados/traducoes.js');
  indice = idioma === 'en' ? 0 : 1;
  tituloOriginal ||= document.title;
  document.title = traduzirTexto(tituloOriginal)?.trim() ?? tituloOriginal;
  traduzirEm(document.body);
  // conteúdo que aparece depois (listas, gavetas, legendas) também é traduzido
  observador = new MutationObserver((mudancas) =>
    mudancas.forEach((m) => {
      if (m.type === 'characterData') traduzirNoDeTexto(m.target);
      else m.addedNodes.forEach((no) => traduzirEm(no));
    }),
  );
  observador.observe(document.body, { childList: true, subtree: true, characterData: true });
}

export function iniciarIdioma() {
  document.addEventListener('click', (evento) => {
    const botao = evento.target.closest('[data-idioma]');
    if (botao) aplicarIdioma(botao.dataset.idioma);
  });
  const idioma = idiomaSalvo();
  if (idioma !== 'pt') aplicarIdioma(idioma);
  else
    document
      .querySelectorAll('[data-idioma]')
      .forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.idioma === 'pt')));
}
