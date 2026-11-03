/**
 * Régua (máscara) de leitura: escurece a tela e deixa uma faixa clara que
 * acompanha o ponteiro do mouse ou o elemento focado pelo teclado.
 */
import { preferencias } from '../../nucleo/preferencias.js';

export function iniciarReguaDeLeitura() {
  const regua = document.querySelector('.regua-leitura');
  if (!regua) return;

  const posicionar = (y) => {
    regua.style.top = `${y}px`;
  };
  const aoMover = (evento) => posicionar(evento.clientY);
  const aoFocar = (evento) => {
    const caixa = evento.target.getBoundingClientRect?.();
    if (caixa) posicionar(caixa.top + caixa.height / 2);
  };

  const atualizar = ({ regua: ativa }) => {
    regua.hidden = !ativa;
    if (ativa) {
      posicionar(window.innerHeight / 2);
      window.addEventListener('pointermove', aoMover, { passive: true });
      document.addEventListener('focusin', aoFocar);
    } else {
      window.removeEventListener('pointermove', aoMover);
      document.removeEventListener('focusin', aoFocar);
    }
  };

  atualizar(preferencias.obter());
  preferencias.assinar((estado, mudancas) => mudancas.includes('regua') && atualizar(estado));
}
