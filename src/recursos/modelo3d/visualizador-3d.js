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
      'O térreo mantém as fachadas antigas em vermelho e branco, com toldos laranja. Acima, dois andares novos recuados, com vidro, pilares brancos e cobertura branca; no centro, um painel de azulejos colorido. Na frente, praça com escadaria e árvores. Modelo ilustrativo feito a partir da imagem de divulgação da Prefeitura.',
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
  const renderizador = new THREE.WebGLRenderer({ canvas: tela, antialias: true });
  renderizador.setPixelRatio(Math.min(window.devicePixelRatio, 2));
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
  sol.shadow.mapSize.set(2048, 2048);
  Object.assign(sol.shadow.camera, { left: -80, right: 80, top: 80, bottom: -80, far: 300 });
  cena.add(sol);

  const controles = new OrbitControls(camera, tela);
  controles.enableDamping = true;
  controles.minDistance = 25;
  controles.maxDistance = 220;
  controles.maxPolarAngle = Math.PI / 2.05; // não passa para baixo do chão
  controles.target.set(0, 6, 0);
  return { renderizador, cena, camera, controles };
}

const VISTAS = {
  frente: [0, 22, 95],
  lado: [105, 20, 0],
  cima: [0, 130, 20],
  diagonal: [58, 32, 66],
};

function irParaVista(nome, suave = true) {
  const { camera, controles } = estado;
  const destino = new THREE.Vector3(...VISTAS[nome]);
  if (!suave || document.documentElement.dataset.movimento) {
    camera.position.copy(destino);
    controles.target.set(0, 6, 0);
    return;
  }
  const inicio = camera.position.clone();
  const t0 = performance.now();
  const passo = (agora) => {
    const t = Math.min(1, (agora - t0) / 700);
    const e = 1 - (1 - t) ** 3;
    camera.position.lerpVectors(inicio, destino, e);
    if (t < 1) requestAnimationFrame(passo);
  };
  requestAnimationFrame(passo);
  controles.target.set(0, 6, 0);
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
}

function ajustarTamanho() {
  const { renderizador, camera } = estado;
  const tela = renderizador.domElement;
  const { clientWidth: l, clientHeight: a } = tela.parentElement;
  renderizador.setSize(l, a, false);
  camera.aspect = l / a;
  camera.updateProjectionMatrix();
}

function animar() {
  if (!estado?.aberto) return;
  estado.controles.update();
  estado.renderizador.render(estado.cena, estado.camera);
  requestAnimationFrame(animar);
}

function girar(angulo) {
  const { camera, controles } = estado;
  const alvo = controles.target;
  const v = camera.position.clone().sub(alvo);
  v.applyAxisAngle(new THREE.Vector3(0, 1, 0), angulo);
  camera.position.copy(alvo).add(v);
}

function aproximar(fator) {
  const { camera, controles } = estado;
  const v = camera.position.clone().sub(controles.target).multiplyScalar(fator);
  const d = Math.min(controles.maxDistance, Math.max(controles.minDistance, v.length()));
  camera.position.copy(controles.target).add(v.setLength(d));
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
  janela.querySelector('[data-fechar-3d]').addEventListener('click', () => janela.close());
  janela.addEventListener('close', () => {
    if (estado) {
      estado.aberto = false;
      estado.controles.autoRotate = false;
      botaoGiro?.setAttribute('aria-pressed', 'false');
    }
  });
  window.addEventListener('resize', () => estado?.aberto && ajustarTamanho());
}
