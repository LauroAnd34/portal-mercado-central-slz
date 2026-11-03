/**
 * Loja de preferências de acessibilidade.
 * Estado único e observável (padrão "store"): a barra, o painel e o leitor do
 * livro leem e escrevem aqui; quem precisa reagir chama `assinar()`.
 */
import { ler, gravar } from './armazenamento.js';

export const CHAVE_PREFERENCIAS = 'preferencias';

export const ESCALA_MINIMA = 0.85;
export const ESCALA_MAXIMA = 2;
export const PASSO_ESCALA = 0.15;

/** @typedef {{
 *  escala: number, cores: 'padrao'|'escuro'|'alto', fonte: 'padrao'|'legivel'|'dislexia',
 *  espacamento: boolean, links: boolean, regua: boolean, movimento: boolean,
 *  cursor: boolean, leitorSelecao: boolean, vlibras: boolean }} Preferencias */

/** @type {Preferencias} */
export const PREFERENCIAS_PADRAO = Object.freeze({
  escala: 1,
  cores: 'padrao',
  fonte: 'padrao',
  espacamento: false,
  links: false,
  regua: false,
  movimento: false,
  cursor: false,
  leitorSelecao: false,
  vlibras: true, // ligado por padrão, como nos portais gov.br
});

/** Mantém a escala dentro dos limites e arredondada (evita 1.0000001). */
export function limitarEscala(valor) {
  const limitado = Math.min(ESCALA_MAXIMA, Math.max(ESCALA_MINIMA, Number(valor) || 1));
  return Math.round(limitado * 100) / 100;
}

/** Junta o que veio do armazenamento com os padrões, descartando lixo. */
export function normalizar(bruto) {
  const base = { ...PREFERENCIAS_PADRAO };
  if (!bruto || typeof bruto !== 'object') return base;
  for (const chave of Object.keys(base)) {
    if (!(chave in bruto)) continue;
    const valor = bruto[chave];
    if (typeof valor === typeof base[chave]) base[chave] = valor;
  }
  if (!['padrao', 'escuro', 'alto'].includes(base.cores)) base.cores = 'padrao';
  if (!['padrao', 'legivel', 'dislexia'].includes(base.fonte)) base.fonte = 'padrao';
  base.escala = limitarEscala(base.escala);
  return base;
}

/**
 * Cria a loja. Recebe funções de persistência para poder ser testada sem
 * navegador.
 */
export function criarLojaDePreferencias({ carregar = ler, salvar = gravar } = {}) {
  let estado = normalizar(carregar(CHAVE_PREFERENCIAS, null));
  const ouvintes = new Set();

  const notificar = (mudancas) => {
    salvar(CHAVE_PREFERENCIAS, estado);
    ouvintes.forEach((ouvinte) => ouvinte(estado, mudancas));
  };

  return {
    obter: () => estado,
    definir(parcial) {
      const proximo = normalizar({ ...estado, ...parcial });
      const mudancas = Object.keys(proximo).filter((k) => proximo[k] !== estado[k]);
      if (!mudancas.length) return estado;
      estado = proximo;
      notificar(mudancas);
      return estado;
    },
    alternar(chave) {
      return this.definir({ [chave]: !estado[chave] });
    },
    aumentarFonte() {
      return this.definir({ escala: limitarEscala(estado.escala + PASSO_ESCALA) });
    },
    diminuirFonte() {
      return this.definir({ escala: limitarEscala(estado.escala - PASSO_ESCALA) });
    },
    redefinir() {
      const mudancas = Object.keys(estado);
      estado = { ...PREFERENCIAS_PADRAO };
      notificar(mudancas);
      return estado;
    },
    /** @param {(estado: Preferencias, mudancas: string[]) => void} ouvinte */
    assinar(ouvinte) {
      ouvintes.add(ouvinte);
      return () => ouvintes.delete(ouvinte);
    },
  };
}

/**
 * Traduz as preferências em atributos `data-*` no <html>; todo o visual
 * (temas, fontes, espaçamento…) é resolvido no CSS a partir deles.
 */
export function aplicarNoDocumento(estado, raiz = document.documentElement) {
  raiz.style.setProperty('--escala-fonte', String(estado.escala));
  const alternar = (atributo, ativo, valor) =>
    ativo ? raiz.setAttribute(atributo, valor) : raiz.removeAttribute(atributo);

  alternar('data-tema', estado.cores === 'escuro', 'escuro');
  alternar('data-contraste', estado.cores === 'alto', 'alto');
  alternar('data-fonte', estado.fonte !== 'padrao', estado.fonte);
  alternar('data-espacamento', estado.espacamento, 'amplo');
  alternar('data-links', estado.links, 'destacados');
  alternar('data-movimento', estado.movimento, 'reduzido');
  alternar('data-cursor', estado.cursor, 'grande');
}

/** Instância única compartilhada pelo site. */
export const preferencias = criarLojaDePreferencias();
