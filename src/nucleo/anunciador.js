/**
 * Anuncia mensagens para leitores de tela (região aria-live do cabeçalho).
 * Limpa e reescreve para que mensagens repetidas também sejam lidas.
 */
let temporizador;

export function anunciar(mensagem) {
  const regiao = document.getElementById('anunciador');
  if (!regiao) return;
  regiao.textContent = '';
  clearTimeout(temporizador);
  temporizador = setTimeout(() => {
    regiao.textContent = mensagem;
  }, 60);
}
