/**
 * Fotos reais (Wikimedia Commons) e seus créditos.
 *  - <img data-foto="chave"> recebe o endereço da foto automaticamente;
 *  - o rodapé ganha a lista "Créditos das fotos" (autor e licença).
 */
import { FOTOS, urlDaFoto } from '../../dados/fotos.js';
import { escaparHtml } from '../../nucleo/dom.js';

export function preencherFotos(raiz = document) {
  raiz.querySelectorAll('img[data-foto]').forEach((img) => {
    const endereco = urlDaFoto(img.dataset.foto);
    if (endereco && !img.getAttribute('src')) img.src = endereco;
  });
}

export function montarCreditos(raiz = document) {
  const lista = raiz.querySelector('[data-creditos-fotos]');
  if (!lista) return;
  lista.innerHTML = Object.values(FOTOS)
    .map(
      (f) =>
        `<li>${escaparHtml(f.lugar)} — ${escaparHtml(f.autor)}, <a href="${f.fonte}" rel="noopener" target="_blank">${escaparHtml(f.licenca)}<span class="somente-leitor"> (abre em nova aba)</span></a></li>`,
    )
    .join('');
}
