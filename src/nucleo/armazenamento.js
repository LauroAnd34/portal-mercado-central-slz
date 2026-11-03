/**
 * Acesso seguro ao localStorage.
 * O navegador pode bloquear o armazenamento (modo privado, política de
 * cookies), então toda leitura/gravação é protegida e nunca quebra o site.
 */

const PREFIXO = 'slz-mercado:';

/** @param {string} chave @param {*} valorPadrao */
export function ler(chave, valorPadrao = null) {
  try {
    const bruto = globalThis.localStorage?.getItem(PREFIXO + chave);
    return bruto === null || bruto === undefined ? valorPadrao : JSON.parse(bruto);
  } catch {
    return valorPadrao;
  }
}

/** @param {string} chave @param {*} valor */
export function gravar(chave, valor) {
  try {
    globalThis.localStorage?.setItem(PREFIXO + chave, JSON.stringify(valor));
    return true;
  } catch {
    return false;
  }
}

/** @param {string} chave */
export function remover(chave) {
  try {
    globalThis.localStorage?.removeItem(PREFIXO + chave);
  } catch {
    /* sem armazenamento disponível: nada a fazer */
  }
}
