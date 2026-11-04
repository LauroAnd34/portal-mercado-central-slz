/**
 * Modelos 3D ILUSTRATIVOS do Mercado Central, montados com formas simples a
 * partir das fotos (cartão-postal de 1940 e imagem de divulgação do projeto).
 * Não são o projeto técnico: servem para testar a visualização em 3D.
 * Quando a Prefeitura tiver o modelo oficial (.glb), basta indicar o arquivo
 * em MODELOS (visualizador-3d.js) que ele é usado no lugar destes.
 *
 * Medidas em metros. Frente do prédio voltada para +z.
 */
import * as THREE from 'three';

const LARGURA = 72;
const FUNDO = 44;

const material = (cor, extra = {}) =>
  new THREE.MeshStandardMaterial({ color: cor, roughness: 0.85, metalness: 0, ...extra });

function caixa(grupo, mat, l, a, p, x, y, z, { sombra = true } = {}) {
  const malha = new THREE.Mesh(new THREE.BoxGeometry(l, a, p), mat);
  malha.position.set(x, y + a / 2, z);
  malha.castShadow = sombra;
  malha.receiveShadow = true;
  grupo.add(malha);
  return malha;
}

/** Repete algo ao longo das 4 fachadas. fn(x, z, rotY, comprimentoDaFachada) */
function aoRedor(passo, fn, margem = 3) {
  const lados = [
    { comp: LARGURA, centro: [0, FUNDO / 2], rot: 0 },
    { comp: LARGURA, centro: [0, -FUNDO / 2], rot: Math.PI },
    { comp: FUNDO, centro: [LARGURA / 2, 0], rot: Math.PI / 2 },
    { comp: FUNDO, centro: [-LARGURA / 2, 0], rot: -Math.PI / 2 },
  ];
  for (const lado of lados) {
    const n = Math.floor((lado.comp - 2 * margem) / passo);
    for (let i = 0; i <= n; i++) {
      const t = -lado.comp / 2 + margem + i * ((lado.comp - 2 * margem) / n);
      const [cx, cz] = lado.centro;
      const x = lado.rot === 0 || lado.rot === Math.PI ? cx + t : cx;
      const z = lado.rot === 0 || lado.rot === Math.PI ? cz : cz + t;
      fn(x, z, lado.rot, i, n);
    }
  }
}

/** Coloca um objeto "na fachada", girado para fora. */
function naFachada(grupo, objeto, x, y, z, rot, afastamento = 0) {
  objeto.position.set(x + Math.sin(rot) * afastamento, y, z + Math.cos(rot) * afastamento);
  objeto.rotation.y = rot;
  grupo.add(objeto);
}

function arvore(grupo, x, z, escala = 1) {
  const tronco = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18 * escala, 0.25 * escala, 2.4 * escala, 6),
    material('#6b4a2b'),
  );
  tronco.position.set(x, 1.2 * escala, z);
  tronco.castShadow = true;
  const copa = new THREE.Mesh(new THREE.IcosahedronGeometry(1.9 * escala, 1), material('#3f8a3a'));
  copa.position.set(x, 3.4 * escala, z);
  copa.castShadow = true;
  grupo.add(tronco, copa);
}

/** Coroamento Art Déco escalonado (blocos que diminuem para cima). */
function coroamento(grupo, mat, x, y, z, rot, largura = 6) {
  const g = new THREE.Group();
  [
    [largura, 1.2],
    [largura * 0.7, 1.0],
    [largura * 0.4, 0.9],
  ].reduce((alt, [l, a]) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(l, a, 0.8), mat);
    m.position.y = alt + a / 2;
    m.castShadow = true;
    g.add(m);
    return alt + a;
  }, 0);
  naFachada(grupo, g, x, y, z, rot, 0.1);
}

function chaoERua(grupo, { corChao, comRua }) {
  const chao = new THREE.Mesh(new THREE.PlaneGeometry(260, 260), material(corChao));
  chao.rotation.x = -Math.PI / 2;
  chao.receiveShadow = true;
  grupo.add(chao);
  if (comRua) {
    caixa(grupo, material('#3b3f45'), 260, 0.05, 14, 0, 0, FUNDO / 2 + 18, { sombra: false });
    // faixa de pedestres
    for (let i = 0; i < 9; i++)
      caixa(grupo, material('#f4f4f4'), 6, 0.06, 0.6, 0, 0, FUNDO / 2 + 13 + i * 1.2, {
        sombra: false,
      });
    caixa(grupo, material('#c9c6bf'), LARGURA + 30, 0.25, 10, 0, 0, FUNDO / 2 + 6, {
      sombra: false,
    });
  }
}

/* ======================= 1940: Mercado Art Déco ======================= */
export function montarMercado1940() {
  const g = new THREE.Group();
  const reboco = material('#d8d0bd');
  const sombraVao = material('#2a2622', { roughness: 1 });
  chaoERua(g, { corChao: '#b9a688', comRua: false });

  // corpo do prédio (térreo comprido)
  caixa(g, reboco, LARGURA - 1, 6.2, FUNDO - 1, 0, 0, 0);
  // vãos escuros entre as colunas
  aoRedor(3.6, (x, z, rot, i, n) => {
    if (i === n) return;
    const vao = new THREE.Mesh(new THREE.BoxGeometry(2.6, 5, 0.3), sombraVao);
    naFachada(
      g,
      vao,
      x + (rot === 0 || rot === Math.PI ? 1.8 : 0),
      2.5,
      z + (rot === 0 || rot === Math.PI ? 0 : 1.8),
      rot,
      -0.05,
    );
  });
  // colunas (pilastras)
  aoRedor(3.6, (x, z, rot) => {
    const col = new THREE.Mesh(new THREE.BoxGeometry(0.7, 6.2, 0.7), reboco);
    col.castShadow = true;
    naFachada(g, col, x, 3.1, z, rot, 0.2);
  });
  // laje e platibanda
  caixa(g, reboco, LARGURA + 1.2, 0.5, FUNDO + 1.2, 0, 6.2, 0);
  caixa(g, reboco, LARGURA + 0.6, 1.3, FUNDO + 0.6, 0, 6.7, 0);
  // coroamentos escalonados nas esquinas e no meio das fachadas
  for (const [x, z, rot] of [
    [-LARGURA / 2 + 6, FUNDO / 2 + 0.3, 0],
    [LARGURA / 2 - 6, FUNDO / 2 + 0.3, 0],
    [0, FUNDO / 2 + 0.3, 0],
    [-LARGURA / 2 + 6, -FUNDO / 2 - 0.3, Math.PI],
    [LARGURA / 2 - 6, -FUNDO / 2 - 0.3, Math.PI],
    [LARGURA / 2 + 0.3, 0, Math.PI / 2],
    [-LARGURA / 2 - 0.3, 0, -Math.PI / 2],
  ])
    coroamento(g, reboco, x, 8, z, rot, x === 0 && z > 0 ? 10 : 6);
  // pátio interno coberto (telhado mais baixo no miolo)
  caixa(g, material('#9c8f7a'), LARGURA - 16, 0.4, FUNDO - 16, 0, 7.4, 0);
  // algumas árvores jovens, como no cartão-postal
  arvore(g, -14, FUNDO / 2 + 5, 0.6);
  arvore(g, 6, FUNDO / 2 + 6, 0.55);
  return g;
}

/* ======================= Projeto: novo Mercado ======================= */
function texturaPainel() {
  // painel de azulejos colorido no topo (triângulos), desenhado num canvas
  const tela = document.createElement('canvas');
  tela.width = tela.height = 256;
  const c = tela.getContext('2d');
  const cores = ['#1d4f9a', '#f2b632', '#c8402f', '#2f8f5b', '#7a3e9d', '#ffffff'];
  for (let y = 0; y < 8; y++)
    for (let x = 0; x < 8; x++) {
      c.fillStyle = cores[(x * 3 + y * 5) % cores.length];
      c.fillRect(x * 32, y * 32, 32, 32);
      c.fillStyle = cores[(x + y * 2 + 2) % cores.length];
      c.beginPath();
      c.moveTo(x * 32, y * 32);
      c.lineTo(x * 32 + 32, y * 32);
      c.lineTo(x * 32, y * 32 + 32);
      c.fill();
    }
  const t = new THREE.CanvasTexture(tela);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function montarMercadoProjeto() {
  const g = new THREE.Group();
  const tijolo = material('#b4442f');
  const branco = material('#f3f1ec');
  const vidro = new THREE.MeshPhysicalMaterial({
    color: '#9fc3d8',
    roughness: 0.1,
    metalness: 0.1,
    transparent: true,
    opacity: 0.45,
  });
  const toldo = material('#e9a072');
  const escuro = material('#3a4652', { roughness: 0.4 });
  chaoERua(g, { corChao: '#d9d6cf', comRua: true });

  // base / praça elevada com escadaria
  caixa(g, material('#cfcac0'), LARGURA + 20, 1, FUNDO + 16, 0, 0, 2);
  for (let i = 0; i < 5; i++)
    caixa(g, material('#bdb8ae'), 14, 0.2, 1, 0, i * 0.2, FUNDO / 2 + 10 - i * 0.6);

  // térreo: fachadas antigas preservadas (vermelho com detalhes brancos)
  caixa(g, tijolo, LARGURA - 1, 8, FUNDO - 1, 0, 1, 0);
  aoRedor(4, (x, z, rot, i, n) => {
    if (i === n) return;
    const ao = rot === 0 || rot === Math.PI;
    const dx = ao ? 2 : 0;
    const dz = ao ? 0 : 2;
    const meio = rot === 0 && Math.abs(x + dx) < 3;
    // porta/vão de vidro escuro
    const porta = new THREE.Mesh(
      new THREE.BoxGeometry(meio ? 5 : 2.6, meio ? 5 : 3.2, 0.3),
      meio ? vidro : escuro,
    );
    naFachada(g, porta, x + dx, 1 + (meio ? 2.5 : 1.6), z + dz, rot, 0.05);
    if (!meio) {
      // toldo laranja inclinado
      const t = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.12, 1.1), toldo);
      t.rotation.x = 0.35;
      const grupoToldo = new THREE.Group();
      grupoToldo.add(t);
      t.position.z = 0.5;
      t.castShadow = true;
      naFachada(g, grupoToldo, x + dx, 1 + 3.6, z + dz, rot, 0.2);
      // janelinha alta com moldura branca
      const jan = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1, 0.25), branco);
      naFachada(g, jan, x + dx, 1 + 5.4, z + dz, rot, 0.1);
      const janVidro = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.6, 0.3), escuro);
      naFachada(g, janVidro, x + dx, 1 + 5.4, z + dz, rot, 0.12);
    }
  });
  // pilastras brancas finas
  aoRedor(4, (x, z, rot) => {
    const p = new THREE.Mesh(new THREE.BoxGeometry(0.35, 8, 0.35), branco);
    naFachada(g, p, x, 5, z, rot, 0.25);
  });
  // cornija branca e platibanda com ornamentos Art Déco
  caixa(g, branco, LARGURA + 1.6, 0.35, FUNDO + 1.6, 0, 7, 0);
  caixa(g, tijolo, LARGURA - 0.6, 1.6, FUNDO - 0.6, 0, 9, 0);
  caixa(g, branco, LARGURA + 6, 0.25, FUNDO + 6, 0, 8.6, 0); // marquise branca
  for (let i = 0; i < 9; i++) {
    const x = -LARGURA / 2 + 4 + i * ((LARGURA - 8) / 8);
    coroamento(g, branco, x, 10.6, FUNDO / 2 - 0.2, 0, 2.2);
    coroamento(g, branco, x, 10.6, -FUNDO / 2 + 0.2, Math.PI, 2.2);
  }

  // anexos baixos nas pontas da frente
  caixa(g, tijolo, 14, 4.5, 9, -LARGURA / 2 - 2, 1, FUNDO / 2 + 3);
  caixa(g, branco, 14.4, 0.4, 9.4, -LARGURA / 2 - 2, 5.5, FUNDO / 2 + 3);
  caixa(g, tijolo, 9, 4.5, 7, LARGURA / 2 - 10, 1, FUNDO / 2 + 4);
  caixa(g, branco, 9.4, 0.4, 7.4, LARGURA / 2 - 10, 5.5, FUNDO / 2 + 4);

  // andares novos recuados: vidro + pilares brancos
  const L2 = LARGURA - 14;
  const F2 = FUNDO - 12;
  caixa(g, material('#e7e4de'), L2, 0.4, F2, 0, 10.6, 0);
  caixa(g, vidro, L2 - 0.4, 6, F2 - 0.4, 0, 11, 0, { sombra: false });
  for (let i = 0; i <= 12; i++) {
    const x = -L2 / 2 + i * (L2 / 12);
    caixa(g, branco, 0.4, 6, 0.4, x, 11, F2 / 2);
    caixa(g, branco, 0.4, 6, 0.4, x, 11, -F2 / 2);
  }
  // painéis brises (laterais brancas com frisos)
  for (const lado of [-1, 1]) {
    caixa(g, branco, 14, 5.6, 0.4, lado * (L2 / 2 - 7), 11.2, F2 / 2 + 0.3);
    for (let k = 0; k < 10; k++)
      caixa(
        g,
        material('#d5d2cc'),
        14,
        0.08,
        0.5,
        lado * (L2 / 2 - 7),
        11.6 + k * 0.5,
        F2 / 2 + 0.35,
        {
          sombra: false,
        },
      );
  }
  // cobertura branca
  caixa(g, branco, L2 + 8, 0.6, F2 + 6, 0, 17, 0);
  caixa(g, branco, 30, 1.4, 12, 0, 17.6, 4);
  // painel de azulejos colorido no centro
  const painel = new THREE.Mesh(
    new THREE.PlaneGeometry(5, 5),
    new THREE.MeshStandardMaterial({ map: texturaPainel(), roughness: 0.5 }),
  );
  painel.position.set(0, 14, F2 / 2 - 2);
  g.add(painel);

  // árvores da praça
  for (const x of [-46, -40, -33, 20, 33, 42]) arvore(g, x, FUNDO / 2 + 9, 0.9);
  return g;
}

export const DIMENSOES = { LARGURA, FUNDO };
