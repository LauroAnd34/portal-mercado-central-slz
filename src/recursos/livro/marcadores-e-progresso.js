/**
 * Marcadores (trechos salvos) e capítulos já lidos.
 * Tudo fica no armazenamento local do navegador.
 */
import { ler, gravar } from '../../nucleo/armazenamento.js';
import { escaparHtml } from '../../nucleo/dom.js';

const CHAVE_MARCADORES = 'livro-marcadores';
const CHAVE_LIDOS = 'livro-capitulos-lidos';

/* ---------- Capítulos lidos ---------- */
export const obterLidos = () => new Set(ler(CHAVE_LIDOS, []));
export function marcarComoLido(idCapitulo) {
  const lidos = obterLidos();
  if (lidos.has(idCapitulo)) return false;
  lidos.add(idCapitulo);
  gravar(CHAVE_LIDOS, [...lidos]);
  return true;
}

/* ---------- Marcadores ---------- */
export const obterMarcadores = () => ler(CHAVE_MARCADORES, []);

/** Adiciona sem duplicar (mesmo capítulo + mesmo trecho). Função pura sobre a lista. */
export function adicionarNaLista(lista, novo) {
  const existe = lista.some((m) => m.capitulo === novo.capitulo && m.indice === novo.indice);
  return existe ? lista : [novo, ...lista].slice(0, 50);
}

export function salvarMarcador(marcador) {
  const lista = adicionarNaLista(obterMarcadores(), marcador);
  gravar(CHAVE_MARCADORES, lista);
  return lista;
}

export function removerMarcador(capitulo, indice) {
  const lista = obterMarcadores().filter((m) => !(m.capitulo === capitulo && m.indice === indice));
  gravar(CHAVE_MARCADORES, lista);
  return lista;
}

/** Primeiro parágrafo visível abaixo do cabeçalho fixo — "o trecho que estou lendo". */
export function encontrarTrechoAtual(container) {
  const trechos = [...container.querySelectorAll('[data-trecho]')];
  const destacado = container.querySelector('.lendo-agora[data-trecho]');
  if (destacado) return destacado;
  const topo = 120;
  return trechos.find((el) => el.getBoundingClientRect().bottom > topo) ?? trechos[0];
}

export function renderizarMarcadores(lista, tituloDoCapitulo) {
  if (!lista.length) return '<li class="marcadores__vazio">Nenhum marcador ainda.</li>';
  return lista
    .map(
      (m) => `
      <li class="marcador-item">
        <button type="button" class="marcador-item__ir" data-ir-marcador="${m.capitulo}|${m.indice}">
          <span class="marcador-item__capitulo">${escaparHtml(tituloDoCapitulo(m.capitulo))}</span>
          <span>“${escaparHtml(m.trecho)}”</span>
        </button>
        <button type="button" class="botao-icone" data-remover-marcador="${m.capitulo}|${m.indice}" aria-label="Remover marcador: ${escaparHtml(m.trecho.slice(0, 40))}">
          <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>
        </button>
      </li>`,
    )
    .join('');
}
