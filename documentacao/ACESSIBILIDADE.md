# Acessibilidade

Referências: **eMAG 3.1**, **WCAG 2.2 nível AA**, **Lei Brasileira de Inclusão (Lei 13.146/2015, art. 63)**.

## O que foi implementado

| Recurso | Onde | Critério |
|---|---|---|
| Atalhos Alt+1/2/4/5 e links "Ir para…" | todas | eMAG 1.5, WCAG 2.4.1 |
| Foco sempre visível (contorno duplo azul/amarelo) | todas | WCAG 2.4.7, 2.4.13 |
| Cabeçalho fixo não cobre o foco (`scroll-padding-top`) | todas | WCAG 2.4.11 |
| Alto contraste (preto/branco/amarelo) e modo escuro | todas | eMAG 4.1, WCAG 1.4.3 |
| A−/A/A+ até 200% sem rolagem horizontal | todas | WCAG 1.4.4, 1.4.10 |
| Espaçamento de texto ampliado | todas | WCAG 1.4.12 |
| Fontes Atkinson Hyperlegible e OpenDyslexic | todas + livro | boa prática |
| Régua de leitura, cursor grande, destaque de links | todas | boa prática |
| Pausar animações + respeita `prefers-reduced-motion` | todas | WCAG 2.2.2, 2.3.3 |
| Painel em `<dialog>` nativo (prende e devolve o foco, fecha com Esc) | todas | WCAG 2.4.3 |
| Mensagens para leitor de tela (`role="status"`) | todas | WCAG 4.1.3 |
| VLibras ativo por padrão (botão oficial no canto direito; pode ser escondido) | todas | eMAG 3.11 |
| Leitura em voz alta com destaque do trecho | livro | boa prática |
| Ajustes de tema/fonte/tamanho/entrelinha/largura no leitor | livro | WCAG 1.4.8 (AAA) |
| Descrição longa expansível das imagens | livro | WCAG 1.1.1 |
| PDF/UA marcado, EPUB 3 e TXT | livro | eMAG 3.8 |
| Lista equivalente ao mapa + rota em texto | mapa | WCAG 1.1.1, 2.1.1 |
| Marcadores com nome acessível e acionáveis pelo teclado | mapa | WCAG 4.1.2 |
| Linha do tempo no padrão de abas WAI-ARIA (setas) | início | WCAG 2.1.1 |
| Alvos de toque com no mínimo 44 px | todas | WCAG 2.5.8 |

## Verificação
- `npm run auditar`: axe-core nas 4 páginas × 3 esquemas de cor (padrão, escuro, alto contraste) — **0 problemas** na última execução.
- Contraste de todas as cores de texto conferido (mínimo 4,5:1).

## Ainda precisa de teste humano
Ferramentas automáticas pegam cerca de metade dos problemas. Antes de publicar, testar com:
- **NVDA** (Windows) e **VoiceOver** (Mac/iPhone) — navegar pelo livro e escolher um destino no mapa;
- **TalkBack** (Android);
- uma pessoa usuária de Libras para avaliar o VLibras no conteúdo;
- navegação só por teclado em todas as páginas.
