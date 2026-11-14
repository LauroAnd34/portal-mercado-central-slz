# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Todos por igual, sem público prioritário (confirmado por Lauro):

- moradores de São Luís que compram no Mercado e querem saber da obra e de onde estão os feirantes;
- turistas que procuram roteiros, o mapa e um pouco da história;
- estudantes e pesquisadores que vêm pelo livro, pelos documentos e pela linha do tempo.

Muitas visitas vêm do celular, inclusive de pessoas idosas, com baixa visão, surdas (Libras) ou que usam leitor de tela.

## Product Purpose

Portal do Mercado Central de São Luís. Ele reúne num só lugar:

- o livro do Mercado, para ler online, ouvir ou baixar;
- o acompanhamento da obra de reconstrução;
- onde estão os feirantes durante a obra (Mercado da Cidade);
- um mapa turístico que parte do Mercado.

O portal deu certo quando a pessoa encontra rápido a informação prática (onde comprar, como chegar) e, se quiser, se aprofunda na história.

## Positioning

É o único lugar que conta a história do Mercado com o material de pesquisa do próprio projeto:

- documentos do Arquivo Público (1843, 1854, 1855);
- entrevistas com feirantes;
- fotos e cartões-postais de 1940 e 1941.

Ao lado disso, traz a situação real da obra e um mapa que começa no Mercado.

## Operating Context

- **Situação do projeto:** é uma **demonstração/proposta** feita por Lauro Andrade para apresentar à Prefeitura de São Luís, e ainda não é o site oficial. O rodapé e o README avisam isso.
- **Hospedagem:** site estático no GitHub Pages, porque a Prefeitura ainda não oferece infraestrutura própria.
- **Estado do prédio:** o prédio de 1941 foi demolido em 10/09/2026 e um novo está sendo construído. Os feirantes atendem no Mercado da Cidade (Av. Senador Vitorino Freire, Aterro do Bacanga) desde fevereiro e março de 2026.

## Capabilities and Constraints

- **Tecnologia:** Vite multipágina com JavaScript puro, sem framework.
- **Páginas:** index, livro, mapa, en, es e 404.
- **Leveza:** o site precisa ser leve e rápido, inclusive no celular e em internet fraca. Ele funciona offline por service worker.
- **Fora do escopo:** realidade aumentada não entra.
- **Inglês e espanhol:** são páginas-resumo para turistas, com tradução que ainda precisa de revisão humana.
- **Mapa:** usa Leaflet com OpenStreetMap. As rotas a pé, de bicicleta e de carro vêm do OSRM. As linhas de ônibus vêm do Wikiroutes, que é colaborativo.
- **3D:** os modelos são ilustrativos (three.js), não o projeto técnico.

## Brand Commitments

- **Identidade:** segue a identidade visual da Prefeitura de São Luís (portal saoluis.ma.gov.br), com o azul-marinho institucional, a faixa de 7 cores e a logomarca oficial.
- **Texto:** português do Brasil, em linguagem simples, sem jargão.
- **Fatos:** os fatos precisam bater com a pesquisa da pasta do projeto. O que não tiver fonte fica marcado como "a confirmar".

## Evidence on Hand

- **Livro:** texto em `conteudo/livro/*.md`, ainda provisório. O texto completo está no material da pesquisa (`MATERIAL DE TODOS OS CAPITULOS.docx`).
- **Fotos e imagens:**
  - fotos do Wikimedia Commons, com crédito;
  - foto do painel de azulejos do Fórum Eleitoral (TRE-MA), de Lauro Andrade;
  - cartões-postais de 1940 e 1941;
  - imagem de divulgação do projeto novo (Prefeitura).
- **Entrevistas com 11 feirantes:** **não podem ser publicadas** sem a autorização assinada de cada pessoa.
- **Informações sem fonte:** o horário oficial do Mercado da Cidade não tem fonte e não deve ser inventado.

## Product Principles

1. **O prático primeiro.** Onde comprar, como chegar e o que está acontecendo com a obra vêm antes da história.
2. **Acessível para todos, sempre.** Leitor de tela, teclado, Libras (VLibras), letras até 200%, alto contraste e tema escuro funcionam em todas as páginas.
3. **Poucos botões no celular.** Uma ação clara por tela, em gavetas com X, e nada de enfeite que atrapalhe.
4. **Verdade com fonte.** Datas e fatos vêm com fonte e, na dúvida, ficam marcados como "a confirmar".
5. **Leve e rápido.** O que é pesado (3D, mapa, VLibras) carrega só quando a pessoa pede.

## Accessibility & Inclusion

- WCAG 2.2 AA, verificado com axe em todas as páginas nos temas padrão, escuro e alto contraste.
- Alvos de toque de pelo menos 44 px.
- Nada pode quebrar ou sumir com letras a 200%.
- Movimento reduzido respeitado.
- VLibras disponível pelo botão único de acessibilidade.
