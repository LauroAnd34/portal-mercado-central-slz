# Portal do Mercado Central de São Luís

Site da **Prefeitura de São Luís** sobre o Mercado Central, feito para que **todas as pessoas** consigam usar.

> **Versão de demonstração.** O texto do livro, a logomarca, o horário de funcionamento e o canal da Ouvidoria ainda são provisórios.

## O que tem no site

- **O livro do Mercado.** Dá para ler na tela, ouvir em voz alta, aumentar as letras, mudar as cores e baixar no celular ou no computador. As palavras difíceis vêm com explicação.
- **Mapa turístico.** O Mercado fica no centro, e de lá saem caminhos para 29 lugares da ilha. Cada lugar mostra a distância, o tempo e o caminho escrito passo a passo. Também há três roteiros prontos.
- **Acessibilidade em todas as páginas:**
  - letras maiores e alto contraste
  - letra própria para dislexia
  - **Libras (VLibras)**
  - leitura em voz alta
  - uso só pelo teclado
- **Funciona sem internet.** Depois da primeira visita, o livro e as páginas continuam abrindo mesmo offline.

---

## Como abrir o site no seu computador

**No Mac:** abra a pasta do projeto e clique duas vezes em **`iniciar.command`**.
Se o Mac avisar que o programa é de desenvolvedor desconhecido, clique com o botão direito no arquivo e escolha **Abrir**.

O site abre sozinho no navegador. Para fechar, feche a janela preta do Terminal.

> Abrir o arquivo `index.html` direto com dois cliques **não funciona**: o navegador bloqueia partes do site quando ele é aberto assim. Use sempre o `iniciar.command`.

## Como ver o site na internet (GitHub)

Cada vez que o projeto é enviado para o GitHub, o site é atualizado sozinho no endereço:

`https://SEU-USUARIO.github.io/portal-mercado-central-slz/`

O passo a passo para enviar está em [documentacao/COMO-PUBLICAR-NO-GITHUB.md](documentacao/COMO-PUBLICAR-NO-GITHUB.md).

## Como trocar textos, logo e informações

Veja [documentacao/COMO-TROCAR-CONTEUDO.md](documentacao/COMO-TROCAR-CONTEUDO.md). O guia diz em qual arquivo fica cada coisa: o livro, a logo, os pontos do mapa, os roteiros, o horário e outras.

## Como colocar no servidor da Prefeitura

Envie para a equipe de TI o conteúdo da pasta **`site-pronto/`**. Ela já tem tudo pronto e não precisa de banco de dados.
Antes, confirme o endereço do site no arquivo **`.env`**, que vem explicado.

---

<details>
<summary><strong>Para quem programa</strong> (comandos e organização do código)</summary>

Requisito: Node.js 18 ou mais novo.

| Comando | O que faz |
|---|---|
| `npm install` | Instala as dependências (uma vez) |
| `npm run iniciar` | Abre o site em modo de edição (recarrega ao salvar) |
| `npm run construir` | Gera a versão final em `site-pronto/` |
| `npm run visualizar` | Abre a versão final |
| `npm run testar` | Testes automáticos |
| `npm run verificar` | Verifica o código (ESLint) |
| `npm run formatar` | Formata o código (Prettier) |
| `npm run gerar-livro` | Gera PDF, EPUB e TXT do livro (precisa de `pandoc` e `weasyprint`) |
| `npm run auditar` | Auditoria de acessibilidade com axe-core (precisa de `npx playwright install chromium` e do site aberto com `npm run visualizar`) |

Arquitetura: [documentacao/ARQUITETURA.md](documentacao/ARQUITETURA.md) · Acessibilidade em detalhe: [documentacao/ACESSIBILIDADE.md](documentacao/ACESSIBILIDADE.md)

</details>
