/**
 * Linha do tempo interativa no padrão "abas" da WAI-ARIA:
 * setas ←/→ (e Home/End) navegam entre os anos; Tab entra no conteúdo.
 */
import { escaparHtml } from '../../nucleo/dom.js';

export function iniciarLinhaDoTempo(raiz, marcos) {
  const listaAbas = raiz.querySelector('[role="tablist"]');
  const painel = raiz.querySelector('[role="tabpanel"]');

  listaAbas.innerHTML = marcos
    .map(
      (marco, i) => `
      <button type="button" role="tab" id="aba-${i}" class="linha__aba"
        aria-selected="${i === 0}" aria-controls="painel-linha" tabindex="${i === 0 ? 0 : -1}">
        <span class="linha__ano">${escaparHtml(marco.ano)}</span>
        <span class="linha__ponto" aria-hidden="true"></span>
      </button>`,
    )
    .join('');
  const abas = [...listaAbas.querySelectorAll('[role="tab"]')];

  const ativar = (indice, { focar = false } = {}) => {
    abas.forEach((aba, i) => {
      const ativa = i === indice;
      aba.setAttribute('aria-selected', String(ativa));
      aba.tabIndex = ativa ? 0 : -1;
    });
    const marco = marcos[indice];
    painel.setAttribute('aria-labelledby', abas[indice].id);
    // reinicia a animação de troca de conteúdo
    painel.classList.remove('trocando');
    void painel.offsetWidth;
    painel.classList.add('trocando');
    painel.dataset.ano = marco.ano; // número grande decorativo (CSS ::before)
    painel.innerHTML = `
      <h3>${escaparHtml(marco.titulo)}</h3>
      <p>${escaparHtml(marco.texto)}</p>
      <p class="linha__contador">${indice + 1} de ${marcos.length}</p>`;
    raiz.style.setProperty('--progresso-linha-numero', String(indice / (marcos.length - 1)));
    if (focar) abas[indice].focus();
  };

  listaAbas.addEventListener('click', (evento) => {
    const aba = evento.target.closest('[role="tab"]');
    if (aba) ativar(abas.indexOf(aba));
  });
  listaAbas.addEventListener('keydown', (evento) => {
    const atual = abas.indexOf(document.activeElement);
    const destinos = {
      ArrowRight: (atual + 1) % abas.length,
      ArrowLeft: (atual - 1 + abas.length) % abas.length,
      Home: 0,
      End: abas.length - 1,
    };
    if (!(evento.key in destinos)) return;
    evento.preventDefault();
    ativar(destinos[evento.key], { focar: true });
  });

  ativar(0);
}
