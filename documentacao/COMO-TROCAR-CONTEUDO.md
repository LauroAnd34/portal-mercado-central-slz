# Como trocar o conteúdo provisório

## 1. Livro
1. Apague os arquivos `.md` de `conteudo/livro/` e coloque os capítulos reais, um por arquivo, com prefixo numérico para a ordem: `00-apresentacao.md`, `01-...md`.
2. A primeira linha de cada arquivo é o título: `# Nome do capítulo`. Subtítulos usam `##`.
3. Imagens: coloque o arquivo na mesma pasta e use `![descrição detalhada da imagem](nome-do-arquivo.jpg)` — a descrição é obrigatória (vira texto alternativo e "Descrição da imagem").
4. Edite `conteudo/livro/livro.json` (título, subtítulo, autoria, edição, aviso — apague o aviso de "texto provisório").
5. Rode `npm run gerar-livro` para recriar PDF, EPUB e TXT em `publico/livro/`.
   (Se tiver o PDF oficial diagramado, basta substituir `publico/livro/mercado-central-sao-luis.pdf`, de preferência exportado como PDF acessível/marcado.)

## 2. Logomarca
Substitua `publico/img/logo-prefeitura.svg` (cabeçalho) e `publico/img/logo-prefeitura-branca.svg` (rodapé) pelos arquivos oficiais da SECOM, com os mesmos nomes. PNG também serve: troque a extensão em `src/parciais/cabecalho.html` e `src/parciais/rodape.html`.

## 3. Pontos turísticos
Edite `src/dados/pontos-turisticos.js`. Cada ponto tem `id`, `nome`, `categoria`, `coordenadas` `[latitude, longitude]`, `endereco` e `descricao`. As coordenadas podem ser copiadas do Google Maps (botão direito → copiar coordenadas).

## 4. Linha do tempo
Edite `src/dados/linha-do-tempo.js`.

## 5. Roteiros, setores, sabores e glossário
- Roteiros prontos: `src/dados/roteiros.js` (lista de ids de pontos, na ordem).
- Setores e sabores da página inicial: `src/dados/mercado.js`.
- Glossário do livro: `src/dados/glossario.js` — basta acrescentar `'palavra': 'explicação simples'`. A primeira vez que a palavra aparece em cada capítulo vira um botão com a explicação.

## 6. Endereço do site e imagem de compartilhamento
- Endereço público: arquivo `.env` (`VITE_ENDERECO_SITE`).
- Imagem que aparece no WhatsApp/redes: `publico/img/compartilhar.png` (1200 × 630 px).

## 7. Textos fixos
- Horário e endereço: `src/parciais/rodape.html`.
- Horário de funcionamento: procure `[confirmar com a administração]` em `index.html`.
- Canal da Ouvidoria: procure `[inserir e-mail ou canal da Ouvidoria]` em `acessibilidade.html`.
- Cores e fontes: `src/estilos/tokens.css`.

Depois de qualquer mudança: `npm run testar` e `npm run construir`.
