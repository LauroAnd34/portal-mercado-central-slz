/**
 * Fonte de dados do livro. Hoje lê os arquivos Markdown de `conteudo/livro`
 * (empacotados pelo Vite). Para trocar o livro, basta substituir esses
 * arquivos — o restante do site não muda.
 */
import { marked } from 'marked';
import metadados from '../../../conteudo/livro/livro.json';
import { montarCapitulos } from './analisador-de-capitulos.js';
import { escaparHtml } from '../../nucleo/dom.js';

const arquivosMarkdown = import.meta.glob('../../../conteudo/livro/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
});
const imagens = import.meta.glob('../../../conteudo/livro/*.{svg,png,jpg,jpeg,webp}', {
  query: '?url',
  import: 'default',
  eager: true,
});
const urlDaImagem = (nome) =>
  Object.entries(imagens).find(([caminho]) => caminho.endsWith(`/${nome}`))?.[1] ?? nome;

/** Renderizador: imagens viram <figure> com descrição expansível. */
const renderizador = new marked.Renderer();
renderizador.image = ({ href, text }) => `
  <figure class="figura-livro">
    <img src="${urlDaImagem(href)}" alt="${escaparHtml(text)}" loading="lazy" />
    <details class="figura-livro__descricao">
      <summary>Descrição da imagem</summary>
      <p>${escaparHtml(text)}</p>
    </details>
  </figure>`;
marked.use({ renderer: renderizador, gfm: true });

const capitulos = montarCapitulos(arquivosMarkdown);

export const repositorioDoLivro = {
  metadados,
  listarCapitulos: () => capitulos,
  obterCapitulo: (id) => capitulos.find((c) => c.id === id) ?? capitulos[0],
  /** HTML do capítulo (marked já escapa o texto do Markdown). */
  renderizarCapitulo: (capitulo) => marked.parse(capitulo.markdown),
};
