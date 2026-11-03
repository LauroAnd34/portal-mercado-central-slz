/**
 * Ícones dos marcadores (SVG desenhado em código: nítido em qualquer zoom e
 * fácil de recolorir no alto contraste).
 */
import L from 'leaflet';

const SIMBOLOS = {
  casarao:
    '<path d="M6 17V10l6-4 6 4v7M9 17v-4h6v4" fill="none" stroke="#fff" stroke-width="2" stroke-linejoin="round"/>',
  igreja:
    '<path d="M12 4v4M10 6h4M8 18v-6l4-3 4 3v6zM11 18v-3h2v3" fill="none" stroke="#fff" stroke-width="1.8" stroke-linejoin="round"/>',
  museu:
    '<path d="M5 9l7-4 7 4M6 18h12M7 10v6M10 10v6M14 10v6M17 10v6" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/>',
  onda: '<path d="M4 11c2-2 4-2 6 0s4 2 6 0 3-2 4-1M4 15c2-2 4-2 6 0s4 2 6 0 3-2 4-1" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"/>',
  folha:
    '<path d="M6 17c0-7 5-11 12-11 0 7-4 12-11 12M6 17l6-6" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"/>',
  barco:
    '<path d="M4 14h16l-2 4H6zM12 5v9M12 6l5 6h-5" fill="none" stroke="#fff" stroke-width="1.8" stroke-linejoin="round"/>',
  mercado:
    '<path d="M5 10h14l-1-4H6zM6 10v8h12v-8M10 18v-4h4v4" fill="none" stroke="#144670" stroke-width="2" stroke-linejoin="round"/>',
};

/** Pino colorido por categoria. */
export function criarIconeDeCategoria(categoria, { selecionado = false } = {}) {
  const tamanho = selecionado ? 48 : 38;
  return L.divIcon({
    className: `marcador marcador--${selecionado ? 'selecionado' : 'normal'}`,
    iconSize: [tamanho, tamanho * 1.25],
    iconAnchor: [tamanho / 2, tamanho * 1.25],
    popupAnchor: [0, -tamanho],
    html: `<svg viewBox="0 0 32 40" width="${tamanho}" height="${tamanho * 1.25}" aria-hidden="true">
      <path d="M16 39C16 39 3 24 3 15a13 13 0 0 1 26 0c0 9-13 24-13 24z" fill="${categoria.cor}" stroke="#fff" stroke-width="2.5"/>
      <g transform="translate(4 3)">${SIMBOLOS[categoria.simbolo] ?? ''}</g>
    </svg>`,
  });
}

/** Marcador especial do Mercado Central (centro do mapa), com pulso animado. */
export function criarIconeDoMercado() {
  return L.divIcon({
    className: 'marcador marcador--mercado',
    iconSize: [64, 64],
    iconAnchor: [32, 32],
    popupAnchor: [0, -30],
    html: `<span class="marcador__pulso" aria-hidden="true"></span>
      <svg viewBox="0 0 24 24" width="64" height="64" aria-hidden="true">
        <circle cx="12" cy="12" r="11" fill="#bbd050" stroke="#144670" stroke-width="1.5"/>
        <g transform="translate(0 0.5)">${SIMBOLOS.mercado}</g>
      </svg>`,
  });
}
