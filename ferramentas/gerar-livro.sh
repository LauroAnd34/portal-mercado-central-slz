#!/usr/bin/env bash
# Gera as versões para download do livro a partir dos capítulos em Markdown:
#   - PDF acessível (PDF/UA, com marcação de estrutura) via WeasyPrint
#   - EPUB 3 (o formato mais acessível para leitores de tela e apps de leitura)
#   - TXT simples
# Requisitos: pandoc e weasyprint (pip install weasyprint)
# Uso: npm run gerar-livro
set -euo pipefail
export LC_ALL=C.UTF-8 LANG=C.UTF-8 PYTHONIOENCODING=utf-8
cd "$(dirname "$0")/.."

ORIGEM="conteudo/livro"
DESTINO="publico/livro"
NOME="mercado-central-sao-luis"
TITULO=$(python3 -c "import json;print(json.load(open('$ORIGEM/livro.json'))['titulo'])")
SUBTITULO=$(python3 -c "import json;print(json.load(open('$ORIGEM/livro.json'))['subtitulo'])")
AUTORIA=$(python3 -c "import json;print(json.load(open('$ORIGEM/livro.json'))['autoria'])")
EDICAO=$(python3 -c "import json;print(json.load(open('$ORIGEM/livro.json')).get('edicao',''))")
mkdir -p "$DESTINO"
CAPITULOS=$(ls "$ORIGEM"/[0-9]*.md | sort)
TMP=$(mktemp -d)

# --- capa em Markdown para EPUB/TXT
printf '%% %s\n%% %s\n\n' "$TITULO: $SUBTITULO" "$AUTORIA" > "$TMP/meta.md"

# --- EPUB
pandoc "$TMP/meta.md" $CAPITULOS \
  --resource-path="$ORIGEM" --toc --toc-depth=1 --split-level=1 \
  -M lang=pt-BR -M title="$TITULO" -M subtitle="$SUBTITULO" -M author="$AUTORIA" \
  -o "$DESTINO/$NOME.epub"

# --- TXT
{ echo "$TITULO — $SUBTITULO"; echo "$AUTORIA"; echo; echo "$EDICAO"; echo;
  pandoc $CAPITULOS -t plain --wrap=auto --columns=80; } > "$DESTINO/$NOME.txt"

# --- PDF (HTML intermediário + CSS de impressão)
pandoc $CAPITULOS --resource-path="$ORIGEM" -s --toc --toc-depth=1 \
  -M lang=pt-BR -M title="$TITULO" -M subtitle="$SUBTITULO" -M author="$AUTORIA" \
  -M aviso="$EDICAO" --template=ferramentas/modelo-livro.html \
  -o "$TMP/livro.html"
cp "$ORIGEM"/*.svg "$ORIGEM"/*.jpg "$ORIGEM"/*.png "$TMP/" 2>/dev/null || true
weasyprint --pdf-variant pdf/ua-1 -s ferramentas/livro-pdf.css "$TMP/livro.html" "$DESTINO/$NOME.pdf"

rm -rf "$TMP"
echo "Livro gerado em $DESTINO:"; ls -lh "$DESTINO"
