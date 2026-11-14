# Instruções para o Claude neste projeto

- Fale e escreva em **português do Brasil**.
- Antes de mexer em qualquer tela, leia **`DESIGN.md`** e siga-o. Ele é a referência visual do portal.
- Skills de design instaladas em `.claude/skills/`:
  - `frontend-design` (Anthropic): direção visual com personalidade, sem cara de modelo pronto. Use ao criar ou redesenhar telas.
  - `ui-ux-pro-max`: banco de estilos, paletas, fontes e regras de UX. Busca local: `python3 .claude/skills/ui-ux-pro-max/scripts/search.py "<consulta>" --domain <ux|style|color|typography>`.
  - `web-design-guidelines` (Vercel): revisão de código de interface contra +100 regras.
- Plugins sugeridos em `.claude/settings.json` (o Claude Code pergunta na primeira vez):
  - `impeccable`: comandos `/impeccable audit`, `critique`, `polish`, `quieter`, `typeset`…
  - `accesslint`: auditoria WCAG 2.2 (`accessibility-scan`, `accessibility-audit`, `accessibility-fix`).
- Acessibilidade é obrigatória: WCAG 2.2 AA, três esquemas de cor, teclado, VLibras, letras até 200%. Rode `npm run auditar` (com o site servido) antes de publicar.
- O site precisa ser leve e funcionar bem no celular (360–390 px, dobráveis, letras grandes).
- Commits e PRs: **não** adicione linhas de coautoria ou de sessão do Claude (`Co-Authored-By`, `Claude-Session`, "Generated with Claude Code").
