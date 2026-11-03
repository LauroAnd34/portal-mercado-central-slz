/**
 * Quando ativado no painel, lê em voz alta qualquer texto selecionado
 * (com o mouse ou com Shift + setas).
 */
import { preferencias } from '../../nucleo/preferencias.js';
import { falar, pararFala, vozDisponivel } from '../../nucleo/voz.js';

export function iniciarLeituraDeSelecao() {
  if (!vozDisponivel()) return;
  let espera;

  document.addEventListener('selectionchange', () => {
    if (!preferencias.obter().leitorSelecao) return;
    clearTimeout(espera);
    espera = setTimeout(() => {
      const texto = String(document.getSelection() ?? '').trim();
      if (texto.length < 2) return;
      pararFala();
      falar(texto);
    }, 600); // espera o usuário terminar de selecionar
  });
}
