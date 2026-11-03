/**
 * Monta as seções "Setores do Mercado" (sanfona com <details> nativo —
 * acessível sem JavaScript extra) e "Sabores do Mercado".
 */
import { escaparHtml } from '../../nucleo/dom.js';

export function montarSetores(raiz, setores) {
  raiz.innerHTML = setores
    .map(
      (setor, i) => `
      <details class="setor" ${i === 0 ? 'open' : ''}>
        <summary>${escaparHtml(setor.nome)}</summary>
        <p>${escaparHtml(setor.texto)}</p>
      </details>`,
    )
    .join('');
}

export function montarSabores(raiz, sabores) {
  raiz.innerHTML = sabores
    .map(
      (sabor) => `
      <li class="sabor">
        <h3 class="sabor__nome">${escaparHtml(sabor.nome)}</h3>
        <p>${escaparHtml(sabor.texto)}</p>
      </li>`,
    )
    .join('');
}
