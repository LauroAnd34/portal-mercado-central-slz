/**
 * Botões "Experimentar" da página de Acessibilidade: ligam e desligam cada
 * recurso na hora, refletindo o estado atual (aria-pressed).
 */
import { preferencias } from '../../nucleo/preferencias.js';

export function iniciarExperimentarRecursos(raiz = document) {
  const botoes = [...raiz.querySelectorAll('[data-alternar-preferencia]')];
  if (!botoes.length) return;

  const ativo = (botao, estado) => {
    const chave = botao.dataset.alternarPreferencia;
    return botao.dataset.valor ? estado[chave] === botao.dataset.valor : Boolean(estado[chave]);
  };
  const refletir = (estado) =>
    botoes.forEach((botao) => {
      const ligado = ativo(botao, estado);
      botao.setAttribute('aria-pressed', String(ligado));
      botao.closest('.recurso')?.classList.toggle('recurso--ativo', ligado);
      const rotulo = botao.firstChild;
      if (rotulo?.nodeType === Node.TEXT_NODE)
        rotulo.textContent = ligado ? 'Ativado' : 'Experimentar';
    });

  raiz.addEventListener('click', (evento) => {
    const botao = evento.target.closest('[data-alternar-preferencia]');
    if (!botao) return;
    const chave = botao.dataset.alternarPreferencia;
    if (botao.dataset.valor) {
      const ligado = ativo(botao, preferencias.obter());
      preferencias.definir({ [chave]: ligado ? 'padrao' : botao.dataset.valor });
    } else preferencias.alternar(chave);
  });

  refletir(preferencias.obter());
  preferencias.assinar(refletir);
}
