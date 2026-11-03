import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Plugin Vite mínimo que substitui `<!-- @include nome.html -->` pelo conteúdo
 * de `src/parciais/nome.html`. Também aceita variáveis simples:
 * `<!-- @include cabecalho.html pagina=livro -->` → `{{pagina}}` vira `livro`.
 * Evita duplicar cabeçalho/rodapé em cada página sem precisar de framework.
 */
export function parciaisHtml({ pasta }) {
  const padrao = /<!--\s*@include\s+([\w.-]+)((?:\s+\w+=[\w-]+)*)\s*-->/g;

  const renderizar = (html, profundidade = 0) => {
    if (profundidade > 5) throw new Error('parciais-html: inclusão recursiva demais');
    return html.replace(padrao, (_, arquivo, varsBrutas) => {
      const vars = Object.fromEntries(
        varsBrutas
          .trim()
          .split(/\s+/)
          .filter(Boolean)
          .map((par) => par.split('=')),
      );
      let conteudo = readFileSync(resolve(pasta, arquivo), 'utf8');
      conteudo = conteudo.replace(/\{\{(\w+)\}\}/g, (__, chave) => vars[chave] ?? '');
      // marca a página atual no menu: data-menu="livro" → aria-current="page"
      if (vars.pagina) {
        conteudo = conteudo.replace(
          new RegExp(`data-menu="${vars.pagina}"`, 'g'),
          `data-menu="${vars.pagina}" aria-current="page"`,
        );
      }
      return renderizar(conteudo, profundidade + 1);
    });
  };

  return {
    name: 'parciais-html',
    transformIndexHtml: { order: 'pre', handler: (html) => renderizar(html) },
    handleHotUpdate({ file, server }) {
      if (file.startsWith(pasta)) server.ws.send({ type: 'full-reload' });
    },
  };
}
