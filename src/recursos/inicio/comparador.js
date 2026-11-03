/**
 * Comparador "antes e depois": a faixa (input range nativo) controla quanto
 * da foto antiga aparece por cima da imagem do projeto. Funciona com mouse,
 * toque e teclado (setas), e o leitor de tela ouve o valor em palavras.
 */
export function iniciarComparador(raiz) {
  const faixa = raiz.querySelector('[data-comparador-faixa]');
  if (!faixa) return;
  const atualizar = () => {
    const valor = Number(faixa.value);
    raiz.style.setProperty('--posicao', `${valor}%`);
    faixa.setAttribute(
      'aria-valuetext',
      valor <= 5
        ? 'Mostrando só o projeto novo'
        : valor >= 95
          ? 'Mostrando só a foto de 1940'
          : `${valor}% foto de 1940, ${100 - valor}% projeto novo`,
    );
  };
  faixa.addEventListener('input', atualizar);
  atualizar();
}
