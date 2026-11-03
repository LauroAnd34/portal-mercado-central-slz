/** Menu recolhível para telas pequenas (botão com aria-expanded). */
export function iniciarMenuMovel() {
  const botao = document.querySelector('.menu-botao');
  const menu = document.getElementById('menu-principal');
  if (!botao || !menu) return;

  const definirAberto = (aberto) => {
    botao.setAttribute('aria-expanded', String(aberto));
    menu.classList.toggle('esta-aberto', aberto);
  };

  botao.addEventListener('click', () =>
    definirAberto(botao.getAttribute('aria-expanded') !== 'true'),
  );
  document.addEventListener('keydown', (evento) => {
    if (evento.key === 'Escape' && botao.getAttribute('aria-expanded') === 'true') {
      definirAberto(false);
      botao.focus();
    }
  });
  window.matchMedia('(min-width: 861px)').addEventListener('change', () => definirAberto(false));
}
