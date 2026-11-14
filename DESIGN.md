# DESIGN.md — Portal do Mercado Central de São Luís

Guia visual do portal. Toda mudança de interface deve seguir este arquivo.
Ele existe para o site ter cara de **São Luís e do Mercado**, não de modelo pronto.
As skills de design do projeto (`.claude/skills/`) leem este arquivo antes de criar ou revisar telas.

## 1. Assunto, público e tarefa principal

- **Assunto:** o Mercado Central de São Luís (fundado em 1864, prédio Art Déco de 1941, demolido em 2026 para um novo prédio) e a ilha ao redor: Praia Grande, azulejos, peixe, juçara, camarão seco, cofo, ervas.
- **Quem usa:** moradores (muitos com pouca leitura digital e celular simples), turistas, estudantes e pessoas com deficiência (leitor de tela, VLibras, baixa visão, dislexia, mobilidade reduzida).
- **Tarefa principal:** saber **onde comprar agora** e **como chegar**; depois, conhecer a história (livro) e explorar a ilha (mapa).
- **Dono da marca:** Prefeitura de São Luís. O portal segue a identidade de saoluis.ma.gov.br.

## 2. De onde vem a personalidade (materiais do lugar)

Use estes elementos — e não enfeites genéricos — para dar caráter:

| Material                                                    | Como aparece no site                                                                                              |
| ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| **Azulejos portugueses** dos casarões                       | Faixas de azulejo entre seções e fotos reais (Wikimedia Commons, creditadas). Nunca azulejo "desenhado" genérico. |
| **Faixa de 7 cores** da Prefeitura (amarelo → verde → azul) | Assinatura: linha fina sob o cabeçalho, progresso, bordas de destaque. Não usar como degradê de fundo.            |
| **Azul-marinho institucional**                              | Cor de títulos, botões principais e áreas de destaque.                                                            |
| **Fotos reais** do Mercado e do Centro                      | Peixe, camarão seco, garrafadas, casarões. Sempre com crédito e texto alternativo descritivo.                     |
| **Cartões-postais antigos** (1940, 1941)                    | História; com legenda de origem.                                                                                  |
| **Linguagem do Mercado**                                    | Palavras como banca, boxe, freguês, cofo, juçara, no texto e no glossário.                                        |

## 3. Cores (tokens em `src/estilos/tokens.css`)

| Papel                                   | Token                 | Valor                       |
| --------------------------------------- | --------------------- | --------------------------- |
| Principal (títulos, botões)             | `--marca-marinho-700` | `#144670` (9,8:1 no branco) |
| Fundo escuro de marca                   | `--marca-marinho-900` | `#0b2a45`                   |
| Links                                   | `--marca-azul-600`    | `#1a6fa3` (5,5:1)           |
| Azul-céu (só decoração)                 | `--marca-azul-400`    | `#39a6de`                   |
| Verde-limão da faixa (botão secundário) | `--faixa-3`           | `#bbd050` com texto marinho |
| Amarelo de alerta / foco                | `--faixa-1`           | `#faea25`                   |
| Texto                                   | `--cor-texto`         | `#1b2530`                   |

Regras:

- Usar **sempre os tokens**; não criar cores soltas no CSS.
- Todo par texto/fundo precisa de **4,5:1** (texto normal) ou **3:1** (texto grande e ícones). Conferir com o axe (`node ferramentas/auditar-acessibilidade.mjs`).
- Três esquemas obrigatórios: padrão, escuro (`data-tema="escuro"`) e alto contraste (`data-contraste="alto"`). Toda tela nova precisa funcionar nos três.

## 4. Tipografia

| Papel                     | Fonte                                       | Uso                                                           |
| ------------------------- | ------------------------------------------- | ------------------------------------------------------------- |
| Títulos de seção e capa   | **Fraunces** (serifada, 600)                | Títulos grandes, com personalidade.                           |
| Interface e texto corrido | **Montserrat** (400/600/700/800)            | Botões, menus, parágrafos. É a fonte do portal da Prefeitura. |
| Livro                     | **Merriweather**                            | Leitura longa no leitor.                                      |
| Opções de acessibilidade  | **Atkinson Hyperlegible**, **OpenDyslexic** | Escolhidas pela pessoa no painel.                             |

Regras:

- Escala em `--texto-xs` … `--texto-3xl`; não inventar tamanhos.
- Linhas de texto com no máximo ~68 caracteres (`--largura-texto`).
- Não partir palavras no meio (`hyphens: manual`). Com letras grandes (`data-letras="grandes"`), títulos e rótulos de botão têm teto pela largura da tela (`min(..., Nvw)`).
- Sem frases em CAIXA ALTA longas. Rótulos curtos em caixa alta (ex.: categoria) são aceitos, mas não acima de **todo** título.

## 5. Layout e navegação

- **Celular primeiro.** Testar em 320, 360, 390 px, dobráveis (~717 e 884 px) e com letras a 200%. Nunca rolagem lateral.
- **Celular:** navegação fixa embaixo (Início · Visitar · Livro · Mapa); cabeçalho só com logo e Menu; sem a barra A− A A+ (fica no painel de acessibilidade).
- **Página inicial:** primeiro o que é útil (aviso da obra, Visite, Onde encontro?), depois a história.
- **Ferramentas em tela cheia (livro, mapa, 3D):** o conteúdo ocupa a tela; os controles flutuam. Painéis abrem como **gaveta que sobe de baixo, com título e botão X**, fecham com Esc, toque fora ou no X, e a página de trás não rola.
- **Poucos botões.** Mostrar só o essencial; o resto vai para "Mais" (⋯). Alvos de toque com no mínimo 44×44 px.
- **Um único botão flutuante** de acessibilidade (com selo de Libras), arrastável para as laterais. O VLibras abre pelo painel.

## 6. Movimento

- Movimento só para responder a uma ação (abrir gaveta, trocar capítulo) ou num único momento de abertura.
- Nada de "aparecer subindo" em cada seção, cards pulando no hover, selos girando.
- Respeitar `prefers-reduced-motion` e a opção "reduzir movimento" do painel (`data-movimento="reduzido"`).

## 7. Texto e tom

- Português do Brasil, frases curtas, palavras simples, voz ativa. Escrever para quem vai ao Mercado, não para quem fez o site.
- Botões dizem exatamente o que fazem: "Ver o caminho", "Ler online", "Traduzir para Libras".
- Fatos com fonte. Datas e números conferidos com o material de pesquisa do projeto.
- Nada de textos explicando o site ("Feito para todas as pessoas…"), dicas óbvias ou parágrafos de instrução longos.

## 8. Acessibilidade (piso, não enfeite)

- WCAG 2.2 AA em todas as telas, nos três esquemas de cor; axe sem violações.
- Teclado completo, foco visível (amarelo `#faea25` com contorno), atalho para o conteúdo.
- VLibras disponível; leitura em voz alta no livro; texto alternativo em toda imagem informativa.
- Alternativa com botões para todo gesto (pinça, arrastar) — WCAG 2.5.7.

## 9. Evitar (pedido do dono do projeto e sinais de "site genérico de IA")

- Emojis como ícones ou em dicas. Usar SVG simples, traço de 2px, cantos arredondados.
- Numeração decorativa (01 / 02 / 03) quando o conteúdo não é sequência.
- Antes/depois arrastável, selos girando, efeitos que não ajudam a entender.
- Degradês roxos/rosa, fundo creme com acento terracota, tudo em cards iguais com a mesma sombra, "→" em todo link.
- Telas cheias de botões; textos gigantes de instrução; QR codes/placas.
- Ícone de acessibilidade diferente entre páginas.

## 10. Como verificar antes de publicar

```sh
npm run verificar && npm run testar   # lint + testes
npm run construir && npm run visualizar
# em outro terminal, com o site servido:
npm run auditar                        # axe em todas as páginas e esquemas de cor
```

E olhar as telas no celular (390 px), num dobrável e com letras a 200%.
