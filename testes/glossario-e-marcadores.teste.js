import { describe, it, expect } from 'vitest';
import { encontrarTermos } from '../src/recursos/livro/glossario-do-livro.js';
import { adicionarNaLista } from '../src/recursos/livro/marcadores-e-progresso.js';
import { GLOSSARIO } from '../src/dados/glossario.js';

describe('glossário', () => {
  it('encontra termos sem diferenciar acento e maiúsculas, só palavras inteiras', () => {
    const achados = encontrarTermos('O estilo ART DECO usa Marquise; a marquiseta não conta.', [
      'art déco',
      'marquise',
    ]);
    expect(achados.map((a) => a.termo)).toEqual(['art déco', 'marquise']);
    expect(achados[1].inicio).toBe('O estilo ART DECO usa '.length);
  });
  it('aceita plural simples e apóstrofos diferentes', () => {
    const texto = "ideias sanitaristas e farinha d'água";
    const achados = encontrarTermos(texto, ['sanitarista', 'farinha d’água']);
    expect(achados.map((a) => texto.slice(a.inicio, a.fim))).toEqual([
      'sanitaristas',
      "farinha d'água",
    ]);
  });
  it('não marca termos sobrepostos', () => {
    const achados = encontrarTermos('patrimônio imaterial', ['patrimônio imaterial', 'imaterial']);
    expect(achados).toHaveLength(1);
  });
  it('todas as definições estão preenchidas', () => {
    for (const [termo, definicao] of Object.entries(GLOSSARIO)) {
      expect(definicao.length, termo).toBeGreaterThan(20);
    }
  });
});

describe('marcadores', () => {
  it('não duplica o mesmo trecho e limita a 50', () => {
    const m = { capitulo: 'a', indice: 1, trecho: 'x' };
    expect(adicionarNaLista([m], { ...m })).toHaveLength(1);
    const muitos = Array.from({ length: 60 }, (_, i) => ({ capitulo: 'a', indice: i, trecho: '' }));
    expect(muitos.reduce(adicionarNaLista, [])).toHaveLength(50);
  });
});
