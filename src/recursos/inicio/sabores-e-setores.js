/**
 * Monta as seções "Setores do Mercado" (sanfona com <details> nativo —
 * acessível sem JavaScript extra) e "Sabores do Mercado".
 */
import { escaparHtml } from '../../nucleo/dom.js';

const ICONES = {
  cuia: '<path d="M4 11h16a8 8 0 0 1-16 0z" fill="currentColor" opacity=".9"/><path d="M7 11c1-2 3-3 5-3s4 1 5 3" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="9" cy="7" r="1.2" fill="currentColor"/><circle cx="13" cy="6" r="1.2" fill="currentColor"/><circle cx="15.5" cy="7.5" r="1.2" fill="currentColor"/>',
  camarao:
    '<path d="M17 6c-5 0-10 3-10 8 0 3 2 5 5 5h2l-2-3c-2 0-3-1-3-2 0-3 4-5 8-5z" fill="currentColor"/><path d="M17 6l3-2M17 6l3 1" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
  folha:
    '<path d="M5 19c0-8 6-14 14-14 0 8-6 14-14 14z" fill="currentColor"/><path d="M5 19 15 9" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/>',
  grao: '<path d="M4 18h16l-2-6H6z" fill="currentColor"/><g fill="currentColor"><circle cx="9" cy="9" r="1.4"/><circle cx="12" cy="7" r="1.4"/><circle cx="15" cy="9" r="1.4"/><circle cx="12" cy="10.5" r="1.4"/></g>',
  garrafa:
    '<path d="M10 3h4v4l2 3v10a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V10l2-3z" fill="currentColor"/><rect x="9.5" y="12" width="5" height="5" rx="1" fill="#fff" opacity=".7"/>',
  ramo: '<path d="M12 21V8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M12 9c-4 0-6-2-6-5 4 0 6 2 6 5zM12 13c4 0 6-2 6-5-4 0-6 2-6 5zM12 17c-4 0-6-2-6-5 4 0 6 2 6 5z" fill="currentColor"/>',
};

export function montarSetores(raiz, setores) {
  raiz.innerHTML = setores
    .map(
      (setor, i) => `
      <details class="setor" ${i === 0 ? 'open' : ''}>
        <summary><span class="setor__numero" aria-hidden="true">${i + 1}</span>${escaparHtml(setor.nome)}</summary>
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
        <span class="sabor__icone" aria-hidden="true"><svg viewBox="0 0 24 24" width="40" height="40">${ICONES[sabor.icone] ?? ''}</svg></span>
        <h3 class="sabor__nome">${escaparHtml(sabor.nome)}</h3>
        <p>${escaparHtml(sabor.texto)}</p>
      </li>`,
    )
    .join('');
}
