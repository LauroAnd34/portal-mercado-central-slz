/**
 * Funções puras para transformar os capítulos em Markdown em objetos que o
 * leitor entende. Sem acesso ao DOM: fáceis de testar (ver testes/).
 */

/** "A cidade antes do Mercado" → "a-cidade-antes-do-mercado" */
export function gerarIdentificador(texto) {
  return String(texto)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Extrai o título (primeira linha "# ...") e o corpo sem o título. */
export function separarTitulo(markdown) {
  const linhas = markdown.replace(/\r\n/g, '\n').split('\n');
  const indice = linhas.findIndex((linha) => /^#\s+/.test(linha));
  if (indice === -1) return { titulo: 'Sem título', corpo: markdown.trim() };
  const titulo = linhas[indice].replace(/^#\s+/, '').trim();
  const corpo = [...linhas.slice(0, indice), ...linhas.slice(indice + 1)].join('\n').trim();
  return { titulo, corpo };
}

/** Estima o tempo de leitura (média de 200 palavras por minuto). */
export function estimarMinutosDeLeitura(texto, palavrasPorMinuto = 200) {
  const palavras = String(texto).trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(palavras / palavrasPorMinuto));
}

/** Remove a marcação Markdown, deixando só texto (para busca e voz). */
export function markdownParaTextoSimples(markdown) {
  return String(markdown)
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, 'Imagem: $1')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[*_`>#-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Monta a lista ordenada de capítulos a partir de { caminho: markdown }.
 * A ordem vem do prefixo numérico do arquivo (00-, 01-, ...).
 */
export function montarCapitulos(arquivos) {
  return Object.entries(arquivos)
    .sort(([a], [b]) => a.localeCompare(b, 'pt-BR', { numeric: true }))
    .map(([caminho, markdown], ordem) => {
      const { titulo, corpo } = separarTitulo(markdown);
      const textoSimples = markdownParaTextoSimples(corpo);
      return {
        ordem,
        id: gerarIdentificador(titulo),
        arquivo: caminho.split('/').pop(),
        titulo,
        markdown: corpo,
        textoSimples,
        minutos: estimarMinutosDeLeitura(textoSimples),
      };
    });
}

/**
 * Busca um termo em todos os capítulos, sem diferenciar acentos e maiúsculas.
 * Devolve trechos com contexto para exibir nos resultados.
 */
export function buscarNoLivro(capitulos, termo, tamanhoContexto = 60) {
  const normalizar = (t) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const alvo = normalizar(termo.trim());
  if (alvo.length < 2) return [];
  const resultados = [];
  for (const capitulo of capitulos) {
    const texto = capitulo.textoSimples;
    const base = normalizar(texto); // normalizar preserva o tamanho em pt-BR
    let posicao = base.indexOf(alvo);
    while (posicao !== -1) {
      const inicio = Math.max(0, posicao - tamanhoContexto);
      const fim = Math.min(texto.length, posicao + alvo.length + tamanhoContexto);
      resultados.push({
        capituloId: capitulo.id,
        capituloTitulo: capitulo.titulo,
        antes: (inicio > 0 ? '…' : '') + texto.slice(inicio, posicao),
        encontrado: texto.slice(posicao, posicao + alvo.length),
        depois: texto.slice(posicao + alvo.length, fim) + (fim < texto.length ? '…' : ''),
      });
      posicao = base.indexOf(alvo, posicao + alvo.length);
    }
  }
  return resultados;
}
