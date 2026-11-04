"""
Cria versões leves (WebP) das fotos em vários tamanhos, para o navegador
baixar só o tamanho que a tela precisa (atributo srcset).
Uso: npm run otimizar-imagens   (precisa do Python com Pillow)
Gera, ao lado de cada foto.jpg: foto-480.webp, foto-960.webp, foto-1600.webp
(só os tamanhos menores que a foto original).
"""
from pathlib import Path
from PIL import Image

PASTAS = ['src/imagens/fotos', 'src/imagens/historia', 'src/imagens']
LARGURAS = [480, 960, 1600]

for pasta in PASTAS:
    for foto in sorted(Path(pasta).glob('*.jpg')):
        with Image.open(foto) as original:
            original = original.convert('RGB')
            for largura in LARGURAS:
                destino = foto.with_name(f'{foto.stem}-{largura}.webp')
                if largura > original.width and largura != LARGURAS[0]:
                    continue
                if destino.exists() and destino.stat().st_mtime > foto.stat().st_mtime:
                    continue
                copia = original.copy()
                if copia.width > largura:
                    copia = copia.resize((largura, round(copia.height * largura / copia.width)), Image.LANCZOS)
                copia.save(destino, 'WEBP', quality=78, method=6)
                print('criada', destino)
