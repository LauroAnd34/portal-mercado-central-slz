#!/usr/bin/env python3
"""
Calcula, uma vez, os caminhos REAIS pelas ruas (OpenStreetMap/OSRM) do
Mercado Central até cada ponto turístico e dos roteiros prontos, e salva em
src/dados/rotas-calculadas.json. Assim o mapa mostra caminhos pelas ruas na
hora — inclusive sem internet — em vez de linhas retas.

Uso: npm run calcular-rotas   (rode de novo se mudar pontos ou roteiros)
"""
import json, subprocess, time, urllib.request, pathlib, math

RAIZ = pathlib.Path(__file__).resolve().parent.parent
SERVIDORES = {
    'a-pe': 'https://routing.openstreetmap.de/routed-foot/route/v1/foot',
    'carro': 'https://routing.openstreetmap.de/routed-car/route/v1/driving',
}

def carregar_dados():
    codigo = """
      const p = await import('./src/dados/pontos-turisticos.js');
      const r = await import('./src/dados/roteiros.js');
      console.log(JSON.stringify({ mercado: p.MERCADO_CENTRAL, pontos: p.PONTOS_TURISTICOS, roteiros: r.ROTEIROS }));
    """
    saida = subprocess.run(['node', '--input-type=module', '-e', codigo], cwd=RAIZ, capture_output=True, text=True, check=True)
    return json.loads(saida.stdout)

def simplificar(pontos, tolerancia=0.00002):
    """Douglas-Peucker: tira pontos desnecessários (arquivo menor, mesmo desenho)."""
    if len(pontos) < 3:
        return pontos
    (x1, y1), (x2, y2) = pontos[0], pontos[-1]
    def distancia(p):
        if (x1, y1) == (x2, y2):
            return math.dist(p, (x1, y1))
        return abs((y2 - y1) * p[0] - (x2 - x1) * p[1] + x2 * y1 - y2 * x1) / math.dist((x1, y1), (x2, y2))
    indice, maior = max(((i, distancia(p)) for i, p in enumerate(pontos[1:-1], 1)), key=lambda t: t[1])
    if maior > tolerancia:
        return simplificar(pontos[: indice + 1], tolerancia)[:-1] + simplificar(pontos[indice:], tolerancia)
    return [pontos[0], pontos[-1]]

def buscar(coordenadas, modo):
    caminho = ';'.join(f'{lon},{lat}' for lat, lon in coordenadas)
    url = f"{SERVIDORES[modo]}/{caminho}?overview=full&geometries=geojson&steps=true"
    for tentativa in range(4):
        try:
            requisicao = urllib.request.Request(url, headers={'User-Agent': 'portal-mercado-central-slz/1.0'})
            dados = json.load(urllib.request.urlopen(requisicao, timeout=30))
            rota = dados['routes'][0]
            linha = [[round(lat, 5), round(lon, 5)] for lon, lat in rota['geometry']['coordinates']]
            return {
                'distancia': rota['distance'],
                'duracao': rota['duration'],
                'coordenadas': simplificar(linha),
                'trechos': [
                    [{'tipo': s['maneuver']['type'], 'lado': s['maneuver'].get('modifier'),
                      'saida': s['maneuver'].get('exit'), 'rua': s.get('name', ''),
                      'distancia': round(s['distance'])} for s in perna['steps']]
                    for perna in rota['legs']
                ],
            }
        except Exception as erro:
            print('  tentando de novo…', erro)
            time.sleep(2 + tentativa * 2)
    raise RuntimeError(f'falhou: {modo} {coordenadas[:2]}')

def main():
    dados = carregar_dados()
    origem = dados['mercado']['coordenadas']
    resultado = {'gerado_em': time.strftime('%Y-%m-%d'), 'pontos': {}, 'roteiros': {}}
    for ponto in dados['pontos']:
        print('→', ponto['nome'])
        resultado['pontos'][ponto['id']] = {modo: buscar([origem, ponto['coordenadas']], modo) for modo in SERVIDORES}
        time.sleep(0.5)
    por_id = {p['id']: p for p in dados['pontos']}
    for roteiro in dados['roteiros']:
        print('→ roteiro', roteiro['nome'])
        coords = [origem] + [por_id[i]['coordenadas'] for i in roteiro['paradas']]
        resultado['roteiros'][roteiro['id']] = buscar(coords, roteiro['modo'])
    destino = RAIZ / 'src' / 'dados' / 'rotas-calculadas.json'
    destino.write_text(json.dumps(resultado, ensure_ascii=False, separators=(',', ':')), encoding='utf8')
    # resumo leve (só distância e tempo) para a página inicial, que não precisa dos caminhos
    resumo = {
        id_ponto: {modo: {'km': round(r['distancia'] / 1000, 3), 'min': round(r['duracao'] / 60, 1)} for modo, r in modos.items()}
        for id_ponto, modos in resultado['pontos'].items()
    }
    (RAIZ / 'src' / 'dados' / 'resumo-das-rotas.json').write_text(json.dumps(resumo, separators=(',', ':')), encoding='utf8')
    print(f'Salvo em {destino} ({destino.stat().st_size // 1024} KB)')

if __name__ == '__main__':
    main()
