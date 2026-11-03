import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  gerarIdentificador,
  separarTitulo,
  estimarMinutosDeLeitura,
  montarCapitulos,
  buscarNoLivro,
} from '../src/recursos/livro/analisador-de-capitulos.js';

const pasta = resolve(process.cwd(), 'conteudo/livro');
const arquivos = Object.fromEntries(
  readdirSync(pasta)
    .filter((n) => n.endsWith('.md'))
    .map((n) => [`/conteudo/livro/${n}`, readFileSync(resolve(pasta, n), 'utf8')]),
);

describe('analisador de capítulos', () => {
  it('gera identificadores sem acentos', () => {
    expect(gerarIdentificador('Do Largo do Açougue Velho ao Mercado')).toBe(
      'do-largo-do-acougue-velho-ao-mercado',
    );
    expect(gerarIdentificador('  São Luís!  ')).toBe('sao-luis');
  });
  it('separa o título do corpo', () => {
    expect(separarTitulo('# Título\n\nTexto')).toEqual({ titulo: 'Título', corpo: 'Texto' });
    expect(separarTitulo('Sem título').titulo).toBe('Sem título');
  });
  it('estima tempo de leitura', () => {
    expect(estimarMinutosDeLeitura('palavra '.repeat(400))).toBe(2);
    expect(estimarMinutosDeLeitura('')).toBe(1);
  });
  it('ordena os capítulos reais pelo prefixo numérico', () => {
    const capitulos = montarCapitulos(arquivos);
    expect(capitulos[0].titulo).toBe('Apresentação');
    expect(capitulos.map((c) => c.ordem)).toEqual(capitulos.map((_, i) => i));
    expect(new Set(capitulos.map((c) => c.id)).size).toBe(capitulos.length);
  });
  it('busca sem diferenciar acentos e maiúsculas', () => {
    const capitulos = montarCapitulos(arquivos);
    const resultados = buscarNoLivro(capitulos, 'JUCARA');
    expect(resultados.length).toBeGreaterThan(0);
    expect(resultados[0].encontrado.toLowerCase()).toBe('juçara');
    expect(buscarNoLivro(capitulos, 'a')).toEqual([]);
  });
});
