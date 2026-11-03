/** Pequenos utilitários de DOM — sem dependências. */

export const selecionar = (seletor, raiz = document) => raiz.querySelector(seletor);
export const selecionarTodos = (seletor, raiz = document) => [...raiz.querySelectorAll(seletor)];

/**
 * Cria um elemento com atributos e filhos.
 * @param {string} tag
 * @param {Record<string, any>} [atributos]
 * @param {(Node|string)[]} [filhos]
 */
export function criarElemento(tag, atributos = {}, filhos = []) {
  const elemento = document.createElement(tag);
  for (const [nome, valor] of Object.entries(atributos)) {
    if (valor === false || valor === null || valor === undefined) continue;
    if (nome === 'texto') elemento.textContent = valor;
    else if (nome === 'html') elemento.innerHTML = valor;
    else if (nome.startsWith('ao') && typeof valor === 'function') {
      // aoClicar → click, aoTeclar → keydown
      const eventos = { aoClicar: 'click', aoTeclar: 'keydown', aoMudar: 'change' };
      elemento.addEventListener(eventos[nome] ?? nome.slice(2).toLowerCase(), valor);
    } else elemento.setAttribute(nome, valor === true ? '' : valor);
  }
  elemento.append(...filhos);
  return elemento;
}

/** Escapa texto para uso seguro dentro de innerHTML. */
export function escaparHtml(texto) {
  return String(texto)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

/** Move o foco para um elemento que normalmente não é focável. */
export function focarProgramaticamente(elemento) {
  if (!elemento) return;
  if (!elemento.hasAttribute('tabindex')) elemento.setAttribute('tabindex', '-1');
  elemento.focus({ preventScroll: false });
}
