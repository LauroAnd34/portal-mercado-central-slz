import { describe, it, expect, vi } from 'vitest';
import {
  criarLojaDePreferencias,
  normalizar,
  limitarEscala,
  aplicarNoDocumento,
  PREFERENCIAS_PADRAO,
  ESCALA_MAXIMA,
} from '../src/nucleo/preferencias.js';

const criarLoja = (inicial = null) => {
  const salvar = vi.fn();
  return { loja: criarLojaDePreferencias({ carregar: () => inicial, salvar }), salvar };
};

describe('preferências de acessibilidade', () => {
  it('começa com os padrões', () => {
    expect(criarLoja().loja.obter()).toEqual(PREFERENCIAS_PADRAO);
  });
  it('descarta valores inválidos vindos do armazenamento', () => {
    expect(
      normalizar({ cores: 'roxo', escala: 99, links: 'sim', fonte: 'dislexia' }),
    ).toMatchObject({
      cores: 'padrao',
      escala: ESCALA_MAXIMA,
      links: false,
      fonte: 'dislexia',
    });
  });
  it('aumenta e diminui a fonte dentro dos limites', () => {
    const { loja } = criarLoja();
    for (let i = 0; i < 20; i++) loja.aumentarFonte();
    expect(loja.obter().escala).toBe(ESCALA_MAXIMA);
    expect(limitarEscala(0.1)).toBe(0.85);
  });
  it('salva e avisa os ouvintes só quando algo muda', () => {
    const { loja, salvar } = criarLoja();
    const ouvinte = vi.fn();
    loja.assinar(ouvinte);
    loja.definir({ cores: 'alto' });
    loja.definir({ cores: 'alto' });
    expect(ouvinte).toHaveBeenCalledTimes(1);
    expect(ouvinte.mock.calls[0][1]).toEqual(['cores']);
    expect(salvar).toHaveBeenCalledTimes(1);
  });
  it('alterna e redefine', () => {
    const { loja } = criarLoja({ links: true });
    loja.alternar('links');
    expect(loja.obter().links).toBe(false);
    loja.definir({ regua: true });
    loja.redefinir();
    expect(loja.obter()).toEqual(PREFERENCIAS_PADRAO);
  });
  it('aplica atributos data-* no <html>', () => {
    const raiz = document.createElement('html');
    aplicarNoDocumento(
      { ...PREFERENCIAS_PADRAO, cores: 'alto', fonte: 'dislexia', escala: 1.3 },
      raiz,
    );
    expect(raiz.getAttribute('data-contraste')).toBe('alto');
    expect(raiz.getAttribute('data-fonte')).toBe('dislexia');
    expect(raiz.style.getPropertyValue('--escala-fonte')).toBe('1.3');
    aplicarNoDocumento(PREFERENCIAS_PADRAO, raiz);
    expect(raiz.hasAttribute('data-contraste')).toBe(false);
  });
});
