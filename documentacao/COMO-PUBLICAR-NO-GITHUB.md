# Como colocar o site no GitHub (sem usar comandos)

Você vai precisar de uma conta no GitHub (é grátis, em github.com) e do programa **GitHub Desktop**.

## 1. Instalar o GitHub Desktop
1. Baixe em **desktop.github.com** e instale.
2. Abra o programa e entre com a sua conta do GitHub.

## 2. Enviar o projeto
1. No GitHub Desktop, clique em **File → Add Local Repository…** (Arquivo → Adicionar repositório local).
2. Escolha a pasta **`site-mercado-central`**.
   O projeto já vem preparado, então o programa reconhece a pasta na hora.
3. Clique em **Publish repository** (Publicar repositório).
4. Mantenha o nome **portal-mercado-central-slz** e **desmarque** a opção *Keep this code private* (manter o código privado).
   No plano grátis, o site só pode ir para a internet se o projeto for público.
5. Clique em **Publish Repository**.

## 3. Ligar o site na internet (só na primeira vez)
1. Abra o projeto no site do GitHub. No GitHub Desktop: **Repository → View on GitHub**.
2. Vá em **Settings** (Configurações) → **Pages**.
3. Em **Source** (Origem), escolha **GitHub Actions**.
4. Volte ao GitHub Desktop e clique em **Push origin**.
   Se o botão não aparecer, faça qualquer pequena mudança no projeto e envie de novo.

Em 1 ou 2 minutos o site fica no ar em:

**https://SEU-USUARIO.github.io/portal-mercado-central-slz/**

O andamento aparece na aba **Actions** do projeto no GitHub. Quando ficar verde ✓, o site está no ar.

## Depois disso
Sempre que mudar algo, abra o GitHub Desktop, escreva um resumo da mudança (ex.: "troquei a logo") e clique em **Commit to main** e depois em **Push origin**. O site se atualiza sozinho.

> A versão no GitHub mostra uma faixa amarela escrito **"Versão de demonstração"**. Assim ninguém confunde a demonstração com o site oficial da Prefeitura.
