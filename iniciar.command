#!/bin/bash
# Clique duas vezes neste arquivo (Mac) para abrir o site no navegador.
# - Com Node.js instalado: roda o modo de desenvolvimento (atualiza ao salvar).
# - Sem Node.js: abre a versão pronta (pasta site-pronto) com o Python do Mac.
cd "$(dirname "$0")"

if command -v npm >/dev/null 2>&1; then
  [ -d node_modules ] || { echo "Instalando dependências (só na primeira vez)..."; npm install; }
  echo "Abrindo o site em http://localhost:5173 — feche esta janela para parar."
  npm run iniciar
elif command -v python3 >/dev/null 2>&1; then
  echo "Node.js não encontrado. Abrindo a versão pronta em http://localhost:8000"
  echo "(Para editar o projeto, instale o Node.js LTS em https://nodejs.org)"
  (sleep 1 && open "http://localhost:8000") &
  cd site-pronto && python3 -m http.server 8000
else
  echo "Instale o Node.js LTS (https://nodejs.org) e clique novamente neste arquivo."
  read -r -p "Pressione Enter para fechar."
fi
