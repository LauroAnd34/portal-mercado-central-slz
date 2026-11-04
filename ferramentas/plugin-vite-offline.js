import { readdirSync, statSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { createHash } from 'node:crypto';

/**
 * Gera o service worker (sw.js) na construção do site, com a lista exata de
 * arquivos para guardar no aparelho. Assim o site — inclusive o livro —
 * funciona sem internet depois da primeira visita.
 * O modelo do service worker fica em ferramentas/modelo-sw.js.
 */
export function modoOffline({ pastaPublica, modelo }) {
  const listarPublicos = (pasta) =>
    readdirSync(pasta).flatMap((nome) => {
      const caminho = join(pasta, nome);
      return statSync(caminho).isDirectory()
        ? listarPublicos(caminho)
        : [relative(pastaPublica, caminho)];
    });

  return {
    name: 'modo-offline',
    apply: 'build',
    generateBundle(_opcoes, pacote) {
      const arquivos = [
        './',
        ...Object.keys(pacote).filter(
          (nome) =>
            !nome.endsWith('.map') &&
            !nome.endsWith('.woff') &&
            !/three\.module|modelos-do-mercado|OrbitControls|GLTFLoader/.test(nome), // 3D: só baixa se a pessoa abrir
        ), // navegadores atuais usam .woff2
        ...listarPublicos(pastaPublica).filter((nome) => nome !== 'sw.js'),
      ].map((nome) => (nome.startsWith('./') ? nome : `./${nome.split('\\').join('/')}`));
      const versao = createHash('sha1').update(arquivos.join('|')).digest('hex').slice(0, 10);
      const codigo = readFileSync(modelo, 'utf8')
        .replace('__VERSAO__', versao)
        .replace('__ARQUIVOS__', JSON.stringify(arquivos, null, 2));
      this.emitFile({ type: 'asset', fileName: 'sw.js', source: codigo });
    },
  };
}
