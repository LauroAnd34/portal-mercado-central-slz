/**
 * Atalhos no padrão eMAG (Alt + número; no Mac, Option + número):
 *  Alt+1 conteúdo · Alt+2 menu · Alt+4 rodapé · Alt+5 painel de acessibilidade
 * Usamos `event.code` porque no Mac Option+1 produz o caractere "¡".
 */
import { focarProgramaticamente } from '../../nucleo/dom.js';

export const MAPA_DE_ATALHOS = {
  Digit1: '#conteudo',
  Digit2: '#menu-principal',
  Digit4: '#rodape',
};

export function iniciarAtalhosDeTeclado({ abrirPainel }) {
  document.addEventListener('keydown', (evento) => {
    if (!evento.altKey || evento.ctrlKey || evento.metaKey) return;
    if (evento.code === 'Digit5') {
      evento.preventDefault();
      abrirPainel();
      return;
    }
    const alvo = MAPA_DE_ATALHOS[evento.code];
    if (!alvo) return;
    evento.preventDefault();
    const elemento = document.querySelector(alvo);
    elemento?.scrollIntoView({ block: 'start' });
    focarProgramaticamente(elemento);
  });

  // links de "pular para" também movem o foco (não apenas a rolagem)
  document.querySelectorAll('.barra-gov__atalhos a').forEach((link) =>
    link.addEventListener('click', (evento) => {
      const alvo = document.querySelector(link.getAttribute('href'));
      if (!alvo) return;
      evento.preventDefault();
      alvo.scrollIntoView({ block: 'start' });
      focarProgramaticamente(alvo);
    }),
  );
}
