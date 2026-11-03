# Arquitetura

Site **estático multipágina** (MPA) feito com **Vite + JavaScript moderno (módulos ES)**, sem framework.
Motivos: carrega rápido em conexões lentas, funciona em qualquer servidor da Prefeitura, é fácil de manter por equipes diferentes e cada página continua acessível mesmo antes do JavaScript carregar.

Todos os nomes (pastas, arquivos, funções, variáveis e classes CSS) estão em **português**.

## Pastas

```
├── index.html, livro.html, mapa.html, acessibilidade.html   ← páginas
├── conteudo/livro/        ← capítulos do livro em Markdown + livro.json (metadados)
├── publico/               ← arquivos copiados como estão (logo, ícone, PDF/EPUB/TXT do livro)
├── src/
│   ├── parciais/          ← pedaços de HTML compartilhados (cabeçalho, rodapé, painel)
│   ├── paginas/           ← um "ponto de entrada" JS por página + comum.js
│   ├── nucleo/            ← utilitários sem regra de negócio (armazenamento, voz, DOM…)
│   ├── recursos/
│   │   ├── acessibilidade/   ← barra, painel, régua, VLibras, atalhos, leitura de seleção
│   │   ├── livro/            ← analisador de capítulos, repositório, leitor, voz, ajustes
│   │   ├── mapa/             ← geografia, rotas, ícones, mapa (Leaflet), guia de pontos
│   │   ├── inicio/           ← linha do tempo, mini-mapa
│   │   └── navegacao/        ← menu móvel
│   ├── dados/             ← pontos turísticos e linha do tempo (fácil de editar)
│   ├── estilos/
│   │   ├── tokens.css     ← cores, fontes, espaços (identidade visual em um lugar só)
│   │   ├── basico.css     ← reset, tipografia, foco, preferências globais
│   │   ├── componentes/   ← cabeçalho, controles, módulos, painel e rodapé
│   │   └── paginas/       ← estilos específicos de cada página
│   └── imagens/           ← ilustrações SVG originais (fachada, azulejo)
├── ferramentas/           ← plugins (parciais, offline, sitemap), geração do livro, auditoria
├── testes/                ← testes automáticos (Vitest)
└── site-pronto/           ← resultado do `npm run construir` (é isto que vai para o servidor)
```

## Princípios

- **Separação de responsabilidades.** Funções puras (cálculos, análise de texto, tradução de rotas) ficam separadas do código que mexe no DOM e são cobertas por testes.
- **Estado único de acessibilidade.** `nucleo/preferencias.js` é uma "loja" observável: a barra, o painel e o leitor leem e escrevem nela; o visual é aplicado por atributos `data-*` no `<html>` e resolvido no CSS.
- **Sem piscar o tema.** Um script mínimo em `parciais/cabeca.html` aplica as preferências antes da página aparecer.
- **Dados fora do código.** Livro em Markdown, pontos e linha do tempo em `src/dados/`.
- **Melhoria progressiva.** Links de download e navegação funcionam sem JavaScript; mapa tem alternativa completa em lista.
- **Tokens de design.** Nenhuma cor "solta" nos componentes: tudo vem de `tokens.css`, o que permite os temas escuro e alto contraste.

## Fluxo do mapa
`paginas/mapa.js` é o controlador: guarda o estado (filtros, busca, ponto selecionado) e conecta
`mapa-interativo.js` (desenho no Leaflet) com `guia-de-pontos.js` (lista e detalhes em HTML acessível) e
`rotas.js` (rota real pelo OSRM/OpenStreetMap; se falhar, usa linha reta e avisa).

## Funcionamento sem internet
`ferramentas/plugin-vite-offline.js` gera o `sw.js` na construção, com a lista exata de arquivos do site.
Na primeira visita tudo é guardado no aparelho (páginas, livro, fontes, PDF/EPUB/TXT); os quadradinhos do mapa
já vistos também ficam guardados (até 400). Rotas e VLibras precisam de internet.
O modo offline só funciona na versão publicada (`npm run construir`), não no `npm run iniciar`.

## Serviços externos
| Serviço | Uso | Sem internet |
|---|---|---|
| tile.openstreetmap.org | imagens do mapa | marcadores e lista continuam funcionando |
| routing.openstreetmap.de | rota pelas ruas | mostra linha reta + estimativa |
| vlibras.gov.br | tradutor de Libras (ativo por padrão) | botão some e o leitor de tela é avisado |

Para muito tráfego, a política do OpenStreetMap pede um servidor de mapas próprio ou contratado: troque `URL_MAPA_DE_FUNDO` em `src/recursos/mapa/mapa-interativo.js`.
