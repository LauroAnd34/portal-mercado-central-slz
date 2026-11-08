/**
 * Zoom em foto como nos apps de galeria:
 *  - pinça com dois dedos aproxima e afasta (centrado entre os dedos);
 *  - toque duplo / clique duplo aproxima onde tocou (e volta ao normal);
 *  - roda do mouse aproxima no ponto do cursor;
 *  - arrastar (um dedo ou mouse) move a foto quando ela está aproximada;
 *  - teclado: + e − aproximam, 0 volta ao normal, setas movem.
 * Devolve { aproximar(fator), restaurar() } para os botões da tela.
 */
const MAX = 5;

export function ativarZoomDeImagem(area, imagem, { aoMudar } = {}) {
  let escala = 1;
  let x = 0;
  let y = 0;
  const ponteiros = new Map();
  let pinca = null;
  let arraste = null;
  let ultimoToque = 0;

  const limitar = () => {
    const l = area.clientWidth;
    const a = area.clientHeight;
    const maxX = Math.max(0, (l * escala - l) / 2);
    const maxY = Math.max(0, (a * escala - a) / 2);
    x = Math.min(maxX, Math.max(-maxX, x));
    y = Math.min(maxY, Math.max(-maxY, y));
  };
  const desenhar = (suave = false) => {
    limitar();
    imagem.style.transition = suave ? 'transform 0.25s ease' : 'none';
    imagem.style.transform = `translate(${x}px, ${y}px) scale(${escala})`;
    area.classList.toggle('zoom--aproximado', escala > 1.01);
    aoMudar?.(escala);
  };
  /** muda a escala mantendo parado o ponto (px, py), relativo ao centro da área */
  const zoomEm = (nova, px = 0, py = 0, suave = false) => {
    nova = Math.min(MAX, Math.max(1, nova));
    const fator = nova / escala;
    x = px - (px - x) * fator;
    y = py - (py - y) * fator;
    escala = nova;
    if (escala === 1) x = y = 0;
    desenhar(suave);
  };
  const relativo = (evento) => {
    const r = area.getBoundingClientRect();
    return [evento.clientX - r.left - r.width / 2, evento.clientY - r.top - r.height / 2];
  };

  let tipoDoUltimo = 'mouse';
  area.addEventListener('pointerdown', (evento) => {
    tipoDoUltimo = evento.pointerType;
    area.setPointerCapture(evento.pointerId);
    ponteiros.set(evento.pointerId, evento);
    if (ponteiros.size === 2) {
      const [p1, p2] = [...ponteiros.values()];
      pinca = {
        dist: Math.hypot(p1.clientX - p2.clientX, p1.clientY - p2.clientY),
        escala,
        x,
        y,
        centro: relativo({
          clientX: (p1.clientX + p2.clientX) / 2,
          clientY: (p1.clientY + p2.clientY) / 2,
        }),
      };
      arraste = null;
    } else if (ponteiros.size === 1) {
      arraste = { cx: evento.clientX, cy: evento.clientY, x, y };
      // toque duplo
      const agora = performance.now();
      if (evento.pointerType !== 'mouse' && agora - ultimoToque < 300) {
        const [px, py] = relativo(evento);
        zoomEm(escala > 1.01 ? 1 : 2.5, px, py, true);
        ultimoToque = 0;
      } else ultimoToque = agora;
    }
  });
  area.addEventListener('pointermove', (evento) => {
    if (!ponteiros.has(evento.pointerId)) return;
    ponteiros.set(evento.pointerId, evento);
    if (pinca && ponteiros.size === 2) {
      const [p1, p2] = [...ponteiros.values()];
      const dist = Math.hypot(p1.clientX - p2.clientX, p1.clientY - p2.clientY);
      escala = pinca.escala;
      x = pinca.x;
      y = pinca.y;
      zoomEm(pinca.escala * (dist / pinca.dist), ...pinca.centro);
    } else if (arraste && escala > 1) {
      x = arraste.x + (evento.clientX - arraste.cx);
      y = arraste.y + (evento.clientY - arraste.cy);
      desenhar();
    }
  });
  const soltar = (evento) => {
    ponteiros.delete(evento.pointerId);
    if (ponteiros.size < 2) pinca = null;
    if (ponteiros.size === 0) arraste = null;
    else if (ponteiros.size === 1) {
      const [p] = [...ponteiros.values()];
      arraste = { cx: p.clientX, cy: p.clientY, x, y };
    }
  };
  area.addEventListener('pointerup', soltar);
  area.addEventListener('pointercancel', soltar);
  area.addEventListener('dblclick', (evento) => {
    if (tipoDoUltimo !== 'mouse') return; // no toque, o toque duplo já foi tratado acima
    const [px, py] = relativo(evento);
    zoomEm(escala > 1.01 ? 1 : 2.5, px, py, true);
  });
  area.addEventListener(
    'wheel',
    (evento) => {
      evento.preventDefault();
      const [px, py] = relativo(evento);
      zoomEm(escala * Math.exp(-evento.deltaY * 0.0015), px, py);
    },
    { passive: false },
  );
  area.addEventListener('keydown', (evento) => {
    const passo = 60;
    const acoes = {
      '+': () => zoomEm(escala * 1.4, 0, 0, true),
      '=': () => zoomEm(escala * 1.4, 0, 0, true),
      '-': () => zoomEm(escala / 1.4, 0, 0, true),
      0: () => zoomEm(1, 0, 0, true),
      ArrowLeft: () => ((x += passo), desenhar(true)),
      ArrowRight: () => ((x -= passo), desenhar(true)),
      ArrowUp: () => ((y += passo), desenhar(true)),
      ArrowDown: () => ((y -= passo), desenhar(true)),
    };
    if (acoes[evento.key]) {
      evento.preventDefault();
      acoes[evento.key]();
    }
  });

  return {
    aproximar: (fator) => zoomEm(escala * fator, 0, 0, true),
    restaurar: () => zoomEm(1, 0, 0, true),
  };
}
