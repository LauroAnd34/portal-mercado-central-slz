/**
 * Visualizador 3D do Mercado (1940 e projeto novo).
 * - Arrastar gira; roda do mouse / pinça aproxima; dois dedos movem.
 * - Botões e teclado fazem tudo sem precisar arrastar (WCAG 2.5.7).
 * - O Three.js só é baixado quando a pessoa abre o 3D (página fica leve).
 * Para usar o modelo oficial, informe o arquivo .glb em MODELOS.arquivo.
 */
const MODELOS = {
  1940: {
    titulo: 'Mercado Central em 1940',
    descricao:
      'Prédio térreo comprido, em estilo Art Déco, com colunas lado a lado em todas as fachadas, platibanda reta e blocos escalonados nas esquinas e no centro. Modelo ilustrativo feito a partir do cartão-postal de 1940.',
    arquivo: null, // ex.: './modelos/mercado-1940.glb'
  },
  projeto: {
    titulo: 'Projeto do novo Mercado Central',
    descricao:
      'Como na imagem divulgada pela Prefeitura: o térreo com fachadas no estilo antigo, em vermelho e branco, com toldos laranja. Acima, dois andares novos recuados, com vidro, pilares brancos e cobertura branca; no centro, um painel de azulejos colorido. Na frente, praça com escadaria e árvores. Modelo ilustrativo feito a partir da imagem de divulgação da Prefeitura.',
    arquivo: null, // ex.: './modelos/mercado-projeto.glb'
  },
};

let THREE;
let OrbitControls;
let MODELOS_PROCEDURAIS;
let estado = null;

async function carregarBibliotecas() {
  if (THREE) return;
  THREE = await import('three');
  ({ OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js'));
  MODELOS_PROCEDURAIS = await import('./modelos-do-mercado.js');
}

function criarCena(tela) {
  // no celular, menos pixels e sombras mais leves: o giro fica fluido e a bateria agradece
  const celular = window.matchMedia('(pointer: coarse)').matches;
  const renderizador = new THREE.WebGLRenderer({
    canvas: tela,
    antialias: !celular || window.devicePixelRatio < 2,
    powerPreference: 'high-performance',
  });
  renderizador.setPixelRatio(Math.min(window.devicePixelRatio, celular ? 1.5 : 2));
  renderizador.shadowMap.enabled = true;
  renderizador.shadowMap.type = THREE.PCFSoftShadowMap;
  renderizador.outputColorSpace = THREE.SRGBColorSpace;
  renderizador.toneMapping = THREE.ACESFilmicToneMapping;

  const cena = new THREE.Scene();
  cena.background = new THREE.Color('#cfe3f1');
  cena.fog = new THREE.Fog('#cfe3f1', 140, 260);
  const camera = new THREE.PerspectiveCamera(40, 1, 0.5, 600);

  cena.add(new THREE.HemisphereLight('#ffffff', '#b9a98f', 1.1));
  const sol = new THREE.DirectionalLight('#fff4e0', 2.4);
  sol.position.set(60, 90, 70);
  sol.castShadow = true;
  sol.shadow.mapSize.set(celular ? 1024 : 2048, celular ? 1024 : 2048);
  Object.assign(sol.shadow.camera, { left: -80, right: 80, top: 80, bottom: -80, far: 300 });
  cena.add(sol);

  const controles = new OrbitControls(camera, tela);
  controles.enableDamping = true;
  controles.minDistance = 25;
  controles.maxDistance = 220;
  controles.maxPolarAngle = Math.PI / 2.05; // não passa para baixo do chão
  controles.target.set(0, 6, 0);
  // gestos como nos apps de mapa: 1 dedo gira, pinça aproxima, 2 dedos movem;
  // mouse: arrastar gira, roda aproxima no cursor, botão direito move
  controles.enablePan = true;
  controles.screenSpacePanning = true;
  controles.zoomToCursor = true;
  controles.rotateSpeed = celular ? 0.9 : 0.7;
  controles.zoomSpeed = celular ? 1.2 : 1;
  controles.dampingFactor = 0.12;
  controles.touches = { ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN };
  // não deixa o prédio "fugir" da tela ao mover
  controles.addEventListener('change', () => {
    const t = controles.target;
    t.x = Math.max(-60, Math.min(60, t.x));
    t.z = Math.max(-50, Math.min(50, t.z));
    t.y = Math.max(0, Math.min(25, t.y));
  });
  return { renderizador, cena, camera, controles };
}

const VISTAS = {
  frente: [0, 22, 95],
  lado: [105, 20, 0],
  cima: [0, 130, 20],
  diagonal: [58, 32, 66],
};

/** Anima câmera e alvo até novas posições. */
function voar(destinoCamera, destinoAlvo, duracao = 650) {
  const { camera, controles } = estado;
  if (document.documentElement.dataset.movimento) {
    camera.position.copy(destinoCamera);
    controles.target.copy(destinoAlvo);
    redesenhar();
    return;
  }
  const c0 = camera.position.clone();
  const a0 = controles.target.clone();
  const t0 = performance.now();
  const passo = (agora) => {
    const t = Math.min(1, (agora - t0) / duracao);
    const e = 1 - (1 - t) ** 3;
    camera.position.lerpVectors(c0, destinoCamera, e);
    controles.target.lerpVectors(a0, destinoAlvo, e);
    redesenhar();
    if (t < 1) requestAnimationFrame(passo);
  };
  requestAnimationFrame(passo);
}

/** Clique duplo / toque duplo: aproxima no ponto do prédio que a pessoa tocou. */
function aproximarNoPonto(clienteX, clienteY) {
  const { camera, controles, renderizador } = estado;
  const r = renderizador.domElement.getBoundingClientRect();
  const ponto = new THREE.Vector2(
    ((clienteX - r.left) / r.width) * 2 - 1,
    -((clienteY - r.top) / r.height) * 2 + 1,
  );
  const raio = new THREE.Raycaster();
  raio.setFromCamera(ponto, camera);
  const [acerto] = raio.intersectObject(estado.modelo, true);
  if (!acerto) return;
  const alvo = acerto.point;
  const direcao = camera.position.clone().sub(controles.target);
  const distancia = Math.max(controles.minDistance, direcao.length() * 0.5);
  voar(alvo.clone().add(direcao.setLength(distancia)), alvo);
}

// tela em pé (celular) mostra menos dos lados: a câmera recua para o prédio caber inteiro
const recuoPelaTela = () => Math.min(3, Math.max(1, 1.5 / estado.camera.aspect));

function irParaVista(nome, suave = true) {
  const { camera, controles } = estado;
  const destino = new THREE.Vector3(...VISTAS[nome]).multiplyScalar(recuoPelaTela());
  const alvo = new THREE.Vector3(0, 6, 0);
  if (!suave) {
    camera.position.copy(destino);
    controles.target.copy(alvo);
    redesenhar();
    return;
  }
  voar(destino, alvo, 700);
}

async function mostrarModelo(chave) {
  const { cena } = estado;
  if (estado.modelo) cena.remove(estado.modelo);
  const info = MODELOS[chave];
  let modelo;
  if (info.arquivo) {
    const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
    modelo = (await new GLTFLoader().loadAsync(info.arquivo)).scene;
  } else {
    modelo =
      chave === '1940'
        ? MODELOS_PROCEDURAIS.montarMercado1940()
        : MODELOS_PROCEDURAIS.montarMercadoProjeto();
  }
  estado.modelo = modelo;
  cena.add(modelo);
  estado.chave = chave;
  redesenhar(4);
}

function ajustarTamanho() {
  const { renderizador, camera } = estado;
  const tela = renderizador.domElement;
  const { clientWidth: l, clientHeight: a } = tela.parentElement;
  renderizador.setSize(l, a, false);
  camera.aspect = l / a;
  camera.updateProjectionMatrix();
  estado.controles.maxDistance = 220 * recuoPelaTela();
  estado.cena.fog.near = 140 * recuoPelaTela();
  estado.cena.fog.far = 260 * recuoPelaTela();
  redesenhar();
}

// desenha só quando algo mudou (gesto, botão, giro automático): economiza bateria
function animar() {
  if (!estado?.aberto) return;
  const mudou = estado.controles.update();
  if (mudou || estado.sujo > 0) {
    estado.renderizador.render(estado.cena, estado.camera);
    if (estado.sujo > 0) estado.sujo -= 1;
  }
  requestAnimationFrame(animar);
}
const redesenhar = (quadros = 2) => {
  if (estado) estado.sujo = Math.max(estado.sujo ?? 0, quadros);
};

function girar(angulo) {
  const { camera, controles } = estado;
  const alvo = controles.target;
  const v = camera.position.clone().sub(alvo);
  v.applyAxisAngle(new THREE.Vector3(0, 1, 0), angulo);
  camera.position.copy(alvo).add(v);
  redesenhar();
}

function aproximar(fator) {
  const { camera, controles } = estado;
  const v = camera.position.clone().sub(controles.target).multiplyScalar(fator);
  const d = Math.min(controles.maxDistance, Math.max(controles.minDistance, v.length()));
  camera.position.copy(controles.target).add(v.setLength(d));
  redesenhar();
}

export function iniciarVisualizador3D() {
  const janela = document.querySelector('[data-janela-3d]');
  if (!janela) return;
  const tela = janela.querySelector('[data-tela-3d]');
  const titulo = janela.querySelector('[data-titulo-3d]');
  const descricao = janela.querySelector('[data-descricao-3d]');
  const carregando = janela.querySelector('[data-carregando-3d]');
  const abas = janela.querySelectorAll('[data-trocar-3d]');
  const botaoGiro = janela.querySelector('[data-giro-automatico]');

  const atualizarTextos = (chave) => {
    titulo.textContent = MODELOS[chave].titulo;
    descricao.textContent = MODELOS[chave].descricao;
    abas.forEach((a) =>
      a.setAttribute('aria-pressed', String(a.getAttribute('data-trocar-3d') === chave)),
    );
  };

  async function abrir(chave) {
    atualizarTextos(chave);
    janela.showModal();
    const dicaGestos = janela.querySelector('[data-dica-3d]');
    dicaGestos.classList.remove('janela-3d__dica--escondida');
    setTimeout(() => dicaGestos.classList.add('janela-3d__dica--escondida'), 5000);
    carregando.hidden = false;
    try {
      await carregarBibliotecas();
      if (!estado) estado = criarCena(tela);
      estado.aberto = true;
      ajustarTamanho();
      await mostrarModelo(chave);
      irParaVista('diagonal', false);
      carregando.hidden = true;
      animar();
    } catch (erro) {
      console.error(erro);
      carregando.textContent =
        'Não foi possível abrir o 3D neste aparelho. A descrição abaixo conta como é o prédio.';
    }
  }

  document
    .querySelectorAll('[data-abrir-3d]')
    .forEach((botao) =>
      botao.addEventListener('click', () => abrir(botao.getAttribute('data-abrir-3d'))),
    );
  abas.forEach((aba) =>
    aba.addEventListener('click', async () => {
      atualizarTextos(aba.getAttribute('data-trocar-3d'));
      if (estado) await mostrarModelo(aba.getAttribute('data-trocar-3d'));
    }),
  );
  janela.addEventListener('click', (evento) => {
    const acao = evento.target.closest('[data-acao-3d]')?.getAttribute('data-acao-3d');
    if (!acao || !estado) return;
    if (acao === 'esquerda') girar(-Math.PI / 8);
    if (acao === 'direita') girar(Math.PI / 8);
    if (acao === 'mais') aproximar(0.8);
    if (acao === 'menos') aproximar(1.25);
    if (VISTAS[acao]) irParaVista(acao);
    if (acao === 'inicio') irParaVista('diagonal');
  });
  botaoGiro?.addEventListener('click', () => {
    if (!estado) return;
    const ligado = botaoGiro.getAttribute('aria-pressed') !== 'true';
    botaoGiro.setAttribute('aria-pressed', String(ligado));
    estado.controles.autoRotate = ligado;
    estado.controles.autoRotateSpeed = 1.2;
  });
  // teclado na área do 3D: setas giram, + e − aproximam
  tela.addEventListener('keydown', (evento) => {
    if (!estado) return;
    const mapa = {
      ArrowLeft: () => girar(-Math.PI / 16),
      ArrowRight: () => girar(Math.PI / 16),
      ArrowUp: () => aproximar(0.9),
      ArrowDown: () => aproximar(1.1),
      '+': () => aproximar(0.9),
      '=': () => aproximar(0.9),
      '-': () => aproximar(1.1),
    };
    if (mapa[evento.key]) {
      evento.preventDefault();
      mapa[evento.key]();
    }
  });
  // clique duplo (mouse) e toque duplo (celular) aproximam no ponto tocado
  let tipoDoUltimo = 'mouse';
  tela.addEventListener('pointerdown', (evento) => (tipoDoUltimo = evento.pointerType));
  tela.addEventListener(
    'dblclick',
    (evento) =>
      estado && tipoDoUltimo === 'mouse' && aproximarNoPonto(evento.clientX, evento.clientY),
  );
  let ultimoToque = null;
  tela.addEventListener('pointerup', (evento) => {
    if (evento.pointerType === 'mouse' || !estado) return;
    const agora = performance.now();
    if (
      ultimoToque &&
      agora - ultimoToque.t < 300 &&
      Math.hypot(evento.clientX - ultimoToque.x, evento.clientY - ultimoToque.y) < 30
    ) {
      aproximarNoPonto(evento.clientX, evento.clientY);
      ultimoToque = null;
    } else ultimoToque = { t: agora, x: evento.clientX, y: evento.clientY };
  });
  // dica de gestos: some no primeiro toque
  const dica = janela.querySelector('[data-dica-3d]');
  const toque = window.matchMedia('(pointer: coarse)').matches;
  const icone = (d) =>
    `<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24"><path d="${d}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const GIRAR = 'M20 12a8 8 0 1 1-2.3-5.7M20 4v4h-4';
  const ZOOM = 'M14 4h6v6M10 20H4v-6M20 4l-6 6M4 20l6-6';
  const MOVER =
    'M12 3v18M3 12h18M12 3l-3 3M12 3l3 3M12 21l-3-3M12 21l3-3M3 12l3-3M3 12l3 3M21 12l-3-3M21 12l-3 3';
  const itens = toque
    ? [
        [GIRAR, 'Girar'],
        [ZOOM, 'Pinça: zoom'],
        [MOVER, '2 dedos: mover'],
      ]
    : [
        [GIRAR, 'Arraste: girar'],
        [ZOOM, 'Rodinha: zoom'],
        [MOVER, 'Botão direito: mover'],
      ];
  dica.innerHTML = itens.map(([d, texto]) => `<span>${icone(d)}${texto}</span>`).join('');
  tela.addEventListener('pointerdown', () => dica.classList.add('janela-3d__dica--escondida'), {
    passive: true,
  });
  // vistas: um botão só, que passa por frente, lado, de cima e volta ao início
  const SEQUENCIA = [
    ['frente', 'Frente', 'de frente'],
    ['lado', 'Lado', 'de lado'],
    ['cima', 'De cima', 'de cima'],
    ['diagonal', 'Início', 'a vista inicial'],
  ];
  let vista = 0;
  const botaoVista = janela.querySelector('[data-proxima-vista]');
  const nomeVista = janela.querySelector('[data-nome-vista]');
  const mostrarProximaVista = () => {
    const [, curto, longo] = SEQUENCIA[vista];
    nomeVista.textContent = curto;
    botaoVista.setAttribute('aria-label', `Trocar a vista: ${longo}`);
  };
  mostrarProximaVista();
  botaoVista.addEventListener('click', () => {
    if (!estado) return;
    irParaVista(SEQUENCIA[vista][0]);
    vista = (vista + 1) % SEQUENCIA.length;
    mostrarProximaVista();
  });
  // no celular, girar e aproximar com botões ficam num "⋯" (o gesto já faz isso)
  const botaoExtras = janela.querySelector('[data-mais-controles-3d]');
  botaoExtras?.addEventListener('click', () => {
    const aberto = botaoExtras.getAttribute('aria-expanded') !== 'true';
    botaoExtras.setAttribute('aria-expanded', String(aberto));
    janela.classList.toggle('janela-3d--extras', aberto);
  });
  // informações sobre o modelo
  const info = janela.querySelector('#info-3d');
  const botaoInfo = janela.querySelector('[data-info-3d]');
  const mostrarInfo = (aberta) => {
    info.hidden = !aberta;
    botaoInfo.setAttribute('aria-expanded', String(aberta));
    if (aberta) info.querySelector('h3')?.setAttribute('tabindex', '-1');
    if (aberta) info.querySelector('h3')?.focus();
    else botaoInfo.focus();
  };
  botaoInfo.addEventListener('click', () => mostrarInfo(info.hidden));
  janela.querySelector('[data-fechar-info-3d]').addEventListener('click', () => mostrarInfo(false));
  janela.querySelector('[data-atalhos-3d]').textContent = toque
    ? 'Gestos: 1 dedo gira, pinça aproxima e afasta, 2 dedos movem, toque duplo chega perto.'
    : 'Mouse: arrastar gira, rodinha aproxima, botão direito move, clique duplo chega perto. Teclado: setas giram, + e − aproximam.';
  // Esc fecha primeiro as informações, depois o 3D
  janela.addEventListener('cancel', (evento) => {
    if (!info.hidden) {
      evento.preventDefault();
      mostrarInfo(false);
    }
  });
  janela.querySelector('[data-fechar-3d]').addEventListener('click', () => janela.close());
  janela.addEventListener('close', () => {
    if (estado) {
      estado.aberto = false;
      estado.controles.autoRotate = false;
      botaoGiro?.setAttribute('aria-pressed', 'false');
      info.hidden = true;
      botaoInfo.setAttribute('aria-expanded', 'false');
    }
  });
  window.addEventListener('resize', () => estado?.aberto && ajustarTamanho());
}
