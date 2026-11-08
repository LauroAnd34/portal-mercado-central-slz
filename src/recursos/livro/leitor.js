/**
 * Leitor acessível do livro: sumário, capítulos, progresso, modo foco,
 * busca e integração com a leitura em voz alta.
 * A posição de leitura fica salva e é retomada na próxima visita.
 */
import { repositorioDoLivro } from './repositorio-do-livro.js';
import { buscarNoLivro } from './analisador-de-capitulos.js';
import { iniciarAjustesDoLeitor } from './ajustes-do-leitor.js';
import { criarLeituraEmVozAlta } from './leitura-em-voz-alta.js';
import { anunciar } from '../../nucleo/anunciador.js';
import { ler, gravar } from '../../nucleo/armazenamento.js';
import { criarElemento, escaparHtml, focarProgramaticamente } from '../../nucleo/dom.js';
import { GLOSSARIO } from '../../dados/glossario.js';
import { marcarTermos, iniciarGlossario } from './glossario-do-livro.js';
import { criarPaginador } from './paginador.js';
import {
  obterLidos,
  marcarComoLido,
  obterMarcadores,
  salvarMarcador,
  removerMarcador,
  encontrarTrechoAtual,
  renderizarMarcadores,
} from './marcadores-e-progresso.js';

const CHAVE_POSICAO = 'leitor-posicao';

export function iniciarLeitor(leitor) {
  const capitulos = repositorioDoLivro.listarCapitulos();
  const elementos = {
    sumario: leitor.querySelector('[data-sumario]'),
    texto: leitor.querySelector('[data-texto-capitulo]'),
    posicao: leitor.querySelector('[data-posicao]'),
    barra: leitor.querySelector('[data-barra-progresso]'),
    anterior: leitor.querySelector('[data-capitulo-anterior]'),
    proximo: leitor.querySelector('[data-capitulo-proximo]'),
    rotuloAnterior: leitor.querySelector('[data-rotulo-anterior]'),
    rotuloProximo: leitor.querySelector('[data-rotulo-proximo]'),
  };
  let atual = 0;

  /* ---------- Sumário ---------- */
  const atualizarLidos = () => {
    const lidos = obterLidos();
    elementos.sumario.querySelectorAll('a[data-indice]').forEach((link) => {
      const lido = lidos.has(capitulos[Number(link.dataset.indice)].id);
      link.classList.toggle('leitor__item-sumario--lido', lido);
      link.querySelector('.leitor__lido').textContent = lido ? ' (lido)' : '';
    });
  };

  // marca o capítulo como lido quando a pessoa chega ao fim dele
  let observador;
  const observarFimDoCapitulo = () => {
    observador?.disconnect();
    if (!('IntersectionObserver' in window)) return;
    const idAtual = capitulos[atual].id;
    observador = new IntersectionObserver((entradas) => {
      if (!entradas.some((e) => e.isIntersecting)) return;
      if (marcarComoLido(idAtual)) atualizarLidos();
      observador.disconnect();
    });
    const fim = leitor.querySelector('.leitor__navegacao');
    // espera um pouco para não marcar capítulos curtos no instante em que abrem
    setTimeout(() => fim && capitulos[atual].id === idAtual && observador.observe(fim), 2500);
  };

  const montarSumario = () => {
    elementos.sumario.replaceChildren(
      ...capitulos.map((capitulo, i) =>
        criarElemento('li', {}, [
          criarElemento(
            'a',
            { href: `#cap-${capitulo.id}`, 'data-indice': i, class: 'leitor__item-sumario' },
            [
              criarElemento('span', { class: 'leitor__numero', 'aria-hidden': 'true' }),
              criarElemento('span', { class: 'leitor__nome', texto: capitulo.titulo }),
              criarElemento('span', { class: 'leitor__minutos', texto: `${capitulo.minutos} min` }),
              criarElemento('span', { class: 'leitor__lido somente-leitor' }),
            ],
          ),
        ]),
      ),
    );
  };

  /* ---------- Exibir capítulo ---------- */
  const exibir = (indice, { focar = true, continuarLendo = false, rolagem = 0 } = {}) => {
    const voltando = indice < atual;
    atual = Math.max(0, Math.min(indice, capitulos.length - 1));
    const capitulo = capitulos[atual];

    elementos.texto.innerHTML = `
      <h3 class="leitor__titulo-capitulo" id="cap-${capitulo.id}" tabindex="-1">${escaparHtml(capitulo.titulo)}</h3>
      <p class="leitor__tempo">Tempo de leitura: cerca de ${capitulo.minutos} minuto${capitulo.minutos > 1 ? 's' : ''}</p>
      ${repositorioDoLivro.renderizarCapitulo(capitulo)}`;

    // animação de troca de capítulo (direção conforme avança ou volta)
    elementos.texto.classList.remove('entrando', 'voltando');
    void elementos.texto.offsetWidth;
    elementos.texto.classList.add('entrando');
    elementos.texto.classList.toggle('voltando', voltando);

    // cada trecho ganha um número (marcadores) e os termos do glossário viram botões
    elementos.texto
      .querySelectorAll('h2, h3:not(.leitor__titulo-capitulo), p:not(.leitor__tempo), li')
      .forEach((el, i) => (el.dataset.trecho = String(i)));
    glossario?.fechar();
    marcarTermos(elementos.texto, GLOSSARIO);
    observarFimDoCapitulo();

    elementos.sumario.querySelectorAll('a').forEach((link, i) => {
      if (i === atual) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });

    const total = capitulos.length;
    const tituloTopo = leitor.querySelector('[data-titulo-topo]');
    if (tituloTopo) tituloTopo.textContent = capitulo.titulo;
    elementos.posicao.textContent = '';
    elementos.barra.style.width = `${((atual + 1) / total) * 100}%`;
    elementos.anterior.disabled = atual === 0;
    elementos.proximo.disabled = atual === total - 1;
    elementos.rotuloAnterior.textContent = atual > 0 ? capitulos[atual - 1].titulo : 'Início';
    elementos.rotuloProximo.textContent =
      atual < total - 1 ? capitulos[atual + 1].titulo : 'Fim do livro';

    paginador?.aoTrocarCapitulo();
    if (focar || continuarLendo) history.replaceState(null, '', `#cap-${capitulo.id}`);
    gravar(CHAVE_POSICAO, { capitulo: capitulo.id, rolagem });
    voz.aoTrocarCapitulo({ continuarLendo });

    if (focar) {
      const titulo = elementos.texto.querySelector('.leitor__titulo-capitulo');
      focarProgramaticamente(titulo);
      anunciar(`${capitulo.titulo}. Parte ${atual + 1} de ${total}.`);
    } else if (rolagem) {
      window.scrollTo({ top: rolagem });
    }
  };

  /* ---------- Leitura em páginas (tela cheia) ---------- */
  let paginador = null;
  const CHAVE_PAGINAS = 'leitor-paginas';
  const botaoPaginas = leitor.querySelector('[data-alternar-paginas]');
  const criarPaginas = () =>
    criarPaginador({
      leitor,
      texto: elementos.texto,
      minutosDoCapitulo: () => capitulos[atual].minutos,
      aoPrecisarDeOutroCapitulo: (direcao) => {
        const destino = atual + direcao;
        if (destino < 0) return anunciar('Você está no começo do livro.');
        if (destino >= capitulos.length) return anunciar('Fim do livro. Obrigado pela leitura!');
        exibir(destino, { focar: false });
        history.replaceState(history.state, '', `#cap-${capitulos[destino].id}`);
        paginador.aoTrocarCapitulo({ irParaFim: direcao < 0 });
        anunciar(capitulos[destino].titulo);
      },
    });

  const irPara = (passo) => {
    const destino = atual + passo;
    if (destino < 0 || destino >= capitulos.length) return;
    exibir(destino);
  };

  /* ---------- Voz ---------- */
  const voz = criarLeituraEmVozAlta({
    leitor,
    obterContainerTexto: () => elementos.texto,
    aoTerminarCapitulo: () => {
      if (marcarComoLido(capitulos[atual].id)) atualizarLidos();
      if (atual < capitulos.length - 1) {
        anunciar('Fim do capítulo. Seguindo para o próximo.');
        exibir(atual + 1, { focar: false, continuarLendo: true });
      } else anunciar('Fim do livro.');
    },
  });

  /* ---------- Gavetas (sumário, letras, ouvir, busca, glossário, marcadores, mais) ----------
   * No celular e na tela cheia, cada painel sobe de baixo como uma "gaveta", com título,
   * botão de fechar (X) e um véu escuro atrás: toque fora, no X ou aperte Esc para fechar.
   * No computador, fora da tela cheia, os painéis aparecem logo abaixo da barra. */
  const mediaPequena = window.matchMedia('(max-width: 900px)');
  const veu = leitor.querySelector('[data-veu]');
  const botaoSumario = leitor.querySelector('[data-alternar-sumario]');
  const emTelaCheia = () => document.body.classList.contains('modo-foco');
  const usaGaveta = () => mediaPequena.matches || emTelaCheia();
  const gatilhoDe = (id) => leitor.querySelector(`.leitor__barra [aria-controls="${id}"]`);

  // o sumário é uma coluna ao lado do texto no computador e uma gaveta no celular
  const definirSumario = (aberto) => {
    botaoSumario.setAttribute('aria-expanded', String(aberto));
    leitor.classList.toggle('leitor--sem-sumario', !aberto);
  };
  const mostrar = (folha, visivel) => {
    if (folha.id === 'leitor-sumario') definirSumario(visivel);
    else folha.hidden = !visivel;
    gatilhoDe(folha.id)?.setAttribute('aria-expanded', String(visivel));
  };

  // o botão de acessibilidade (que fica por cima de tudo) sobe para não cobrir a gaveta
  const afastarBotaoAcessibilidade = (folha) => {
    requestAnimationFrame(() => {
      if (folha && usaGaveta()) {
        const altura = window.innerHeight - folha.getBoundingClientRect().top;
        document.body.style.setProperty('--reserva-base', `${Math.round(altura + 8)}px`);
      } else document.body.style.removeProperty('--reserva-base');
      window.dispatchEvent(new Event('resize'));
    });
  };
  let folhaAberta = null;
  let gatilhoFolha = null;
  const fecharFolha = ({ devolverFoco = true } = {}) => {
    if (!folhaAberta) return;
    mostrar(folhaAberta, false);
    veu.hidden = true;
    document.body.classList.remove('com-gaveta');
    afastarBotaoAcessibilidade(null);
    const gatilho = gatilhoFolha;
    folhaAberta = null;
    gatilhoFolha = null;
    if (devolverFoco) gatilho?.focus?.();
  };
  const abrirFolha = (id, gatilho = gatilhoDe(id)) => {
    fecharFolha({ devolverFoco: false });
    const folha = leitor.querySelector(`#${id}`);
    if (!folha) return;
    mostrar(folha, true);
    folhaAberta = folha;
    gatilhoFolha = gatilho;
    const leve = folha.classList.contains('folha--leve'); // "Ouvir" deixa o texto visível
    veu.hidden = !usaGaveta() || leve;
    document.body.classList.toggle('com-gaveta', usaGaveta() && !leve);
    focarProgramaticamente(folha.querySelector('.folha__titulo'));
    afastarBotaoAcessibilidade(folha);
  };
  const alternarFolha = (id) => {
    if (folhaAberta?.id === id) fecharFolha();
    else abrirFolha(id);
  };

  ['leitor-ajustes', 'leitor-busca', 'leitor-voz', 'leitor-mais'].forEach((id) =>
    gatilhoDe(id)?.addEventListener('click', () => alternarFolha(id)),
  );
  botaoSumario.addEventListener('click', () => {
    if (usaGaveta()) return alternarFolha('leitor-sumario');
    // computador: liga e desliga a coluna do sumário
    definirSumario(botaoSumario.getAttribute('aria-expanded') !== 'true');
  });
  leitor.addEventListener('click', (evento) => {
    if (evento.target.closest('[data-fechar-folha]')) {
      const folha = evento.target.closest('[data-folha], .leitor__sumario');
      if (folhaAberta) fecharFolha();
      else if (folha?.id === 'leitor-sumario') {
        definirSumario(false);
        botaoSumario.focus();
      }
      return;
    }
    const abrir = evento.target.closest('[data-abrir-folha]');
    if (abrir) abrirFolha(abrir.dataset.abrirFolha, gatilhoDe('leitor-mais'));
  });
  veu.addEventListener('click', () => fecharFolha());
  leitor.addEventListener('keydown', (evento) => {
    if (evento.key === 'Escape' && folhaAberta) {
      evento.stopPropagation();
      fecharFolha();
    }
  });
  definirSumario(!mediaPequena.matches);
  mediaPequena.addEventListener('change', () => {
    fecharFolha({ devolverFoco: false });
    if (!emTelaCheia()) definirSumario(!mediaPequena.matches);
  });

  /* ---------- Modo leitura em tela cheia ----------
   * Esconde o resto do site e deixa só o livro, ocupando a tela toda.
   * As ferramentas (sumário, letras, ouvir…) continuam na barra do leitor.
   * Sai com o botão "Sair da tela cheia", com Esc ou com o "voltar" do celular. */
  const botaoFoco = leitor.querySelector('[data-modo-foco]');
  const textoFoco = botaoFoco.querySelector('[data-texto-foco]');
  let gatilhoFoco = null;
  const definirFoco = (ativo, { daHistoria = false } = {}) => {
    if (ativo === document.body.classList.contains('modo-foco')) return;
    botaoFoco.setAttribute('aria-pressed', String(ativo));
    if (textoFoco) textoFoco.textContent = ativo ? 'Sair' : 'Ampliar';
    fecharFolha({ devolverFoco: false });
    document.body.classList.toggle('modo-foco', ativo);
    // o botão de acessibilidade se afasta das barras da leitura
    requestAnimationFrame(() => window.dispatchEvent(new Event('resize')));
    paginador ??= criarPaginas();
    // com letras muito grandes, cada página teria poucas palavras: o texto rola
    const letrasGrandes = document.documentElement.dataset.letras === 'grandes';
    if (ativo && ler(CHAVE_PAGINAS, true) && !letrasGrandes) paginador.ligar();
    if (ativo && letrasGrandes) mostrarModoPaginas(false);
    if (!ativo) paginador.desligar();
    if (ativo) {
      gatilhoFoco = document.activeElement;
      definirSumario(false); // na tela cheia o sumário vira gaveta: começa fechado
      const pedido = document.documentElement.requestFullscreen?.();
      pedido?.catch?.(() => {});
      if (!daHistoria) history.pushState({ leitura: true }, '');
      document.getElementById('leitor')?.scrollTo?.(0, 0);
      focarProgramaticamente(
        leitor.querySelector('[data-texto-capitulo] h1, [data-texto-capitulo] h2'),
      );
    } else {
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
      if (!daHistoria && history.state?.leitura) history.back();
      definirSumario(!mediaPequena.matches);
      gatilhoFoco?.focus?.();
    }
    anunciar(ativo ? 'Tela cheia de leitura. Pressione Esc para sair.' : 'Saiu da tela cheia.');
  };
  botaoFoco.addEventListener('click', () =>
    definirFoco(botaoFoco.getAttribute('aria-pressed') !== 'true'),
  );
  leitor.querySelector('[data-sair-foco]')?.addEventListener('click', () => definirFoco(false));
  // páginas (como num leitor digital) ou rolagem contínua, dentro da tela cheia
  const textoPaginas = leitor.querySelector('[data-texto-paginas]');
  const mostrarModoPaginas = (paginas) => {
    botaoPaginas.setAttribute('aria-pressed', String(paginas));
    textoPaginas.textContent = paginas
      ? 'Ligado · desligue para rolar o texto'
      : 'Desligado · o texto rola para baixo';
  };
  mostrarModoPaginas(ler(CHAVE_PAGINAS, true));
  botaoPaginas.addEventListener('click', () => {
    const paginas = botaoPaginas.getAttribute('aria-pressed') !== 'true';
    mostrarModoPaginas(paginas);
    gravar(CHAVE_PAGINAS, paginas);
    paginador ??= criarPaginas();
    if (paginas) paginador.ligar();
    else paginador.desligar();
    anunciar(paginas ? 'Leitura em páginas.' : 'Leitura com rolagem.');
  });
  document
    .querySelectorAll('[data-abrir-leitura]')
    .forEach((botao) => botao.addEventListener('click', () => definirFoco(true)));
  window.addEventListener('popstate', () => {
    if (document.body.classList.contains('modo-foco')) definirFoco(false, { daHistoria: true });
  });
  document.addEventListener('fullscreenchange', () => {
    // a pessoa saiu da tela cheia do navegador (tecla Esc): sai também do modo leitura
    if (!document.fullscreenElement && document.body.classList.contains('modo-foco'))
      definirFoco(false);
  });
  document.addEventListener('keydown', (evento) => {
    if (
      evento.key === 'Escape' &&
      document.body.classList.contains('modo-foco') &&
      !folhaAberta &&
      !document.querySelector('dialog[open]')
    )
      definirFoco(false);
  });

  /* ---------- Busca ---------- */
  const formularioBusca = leitor.querySelector('[data-formulario-busca]');
  const areaResultados = leitor.querySelector('[data-resultados-busca]');
  formularioBusca.addEventListener('submit', (evento) => {
    evento.preventDefault();
    const termo = formularioBusca.elements.termo.value;
    const resultados = buscarNoLivro(capitulos, termo);
    if (!resultados.length) {
      areaResultados.innerHTML = `<p>Nenhum resultado para “${escaparHtml(termo)}”.</p>`;
      return;
    }
    areaResultados.innerHTML = `
      <p><strong>${resultados.length}</strong> resultado${resultados.length > 1 ? 's' : ''} para “${escaparHtml(termo)}”:</p>
      <ol class="resultados-busca__lista">
        ${resultados
          .slice(0, 30)
          .map(
            (
              r,
            ) => `<li><button type="button" class="resultado-busca" data-ir-capitulo="${r.capituloId}">
              <span class="resultado-busca__capitulo">${escaparHtml(r.capituloTitulo)}</span>
              <span>${escaparHtml(r.antes)}<mark>${escaparHtml(r.encontrado)}</mark>${escaparHtml(r.depois)}</span>
            </button></li>`,
          )
          .join('')}
      </ol>`;
  });
  areaResultados.addEventListener('click', (evento) => {
    const botao = evento.target.closest('[data-ir-capitulo]');
    if (!botao) return;
    if (usaGaveta()) fecharFolha({ devolverFoco: false });
    exibir(capitulos.findIndex((c) => c.id === botao.dataset.irCapitulo));
  });

  /* ---------- Eventos de navegação ---------- */
  elementos.sumario.addEventListener('click', (evento) => {
    const link = evento.target.closest('a[data-indice]');
    if (!link) return;
    evento.preventDefault();
    if (folhaAberta) fecharFolha({ devolverFoco: false });
    exibir(Number(link.dataset.indice));
  });

  elementos.anterior.addEventListener('click', () => irPara(-1));
  elementos.proximo.addEventListener('click', () => irPara(1));

  document.addEventListener('keydown', (evento) => {
    if (!evento.altKey || !evento.shiftKey) return;
    if (evento.key === 'ArrowRight') irPara(1);
    else if (evento.key === 'ArrowLeft') irPara(-1);
    else if (evento.code === 'KeyL') voz.tocarOuPausar();
    else return;
    evento.preventDefault();
  });

  // botão "Ouvir o livro" no topo da página
  document.querySelector('[data-ouvir-livro]')?.addEventListener('click', () => {
    exibir(0, { focar: false });
    document.getElementById('leitor')?.scrollIntoView();
    voz.iniciarDoComeco();
  });

  // salva a posição de rolagem (com intervalo, para não pesar)
  let espera;
  window.addEventListener(
    'scroll',
    () => {
      clearTimeout(espera);
      espera = setTimeout(
        () => gravar(CHAVE_POSICAO, { capitulo: capitulos[atual].id, rolagem: window.scrollY }),
        400,
      );
    },
    { passive: true },
  );

  /* ---------- Glossário ---------- */
  const glossario = iniciarGlossario(leitor, GLOSSARIO);

  /* ---------- Marcadores ---------- */
  const listaMarcadores = leitor.querySelector('[data-lista-marcadores]');
  const contador = leitor.querySelector('[data-contador-marcadores]');
  const tituloDoCapitulo = (id) => capitulos.find((c) => c.id === id)?.titulo ?? 'Capítulo';
  const mostrarMarcadores = (lista = obterMarcadores()) => {
    listaMarcadores.innerHTML = renderizarMarcadores(lista, tituloDoCapitulo);
    contador.hidden = !lista.length;
    contador.textContent = lista.length ? String(lista.length) : '';
    const resumo = leitor.querySelector('[data-resumo-marcadores]');
    if (resumo)
      resumo.textContent = lista.length
        ? `${lista.length} trecho${lista.length > 1 ? 's' : ''} salvo${lista.length > 1 ? 's' : ''}`
        : 'Trechos que você salvou';
  };
  const marcarTrecho = () => {
    const trecho = encontrarTrechoAtual(elementos.texto);
    if (!trecho) return;
    const texto = trecho.textContent.replace(/\s+/g, ' ').trim();
    mostrarMarcadores(
      salvarMarcador({
        capitulo: capitulos[atual].id,
        indice: Number(trecho.dataset.trecho),
        trecho: texto.length > 90 ? `${texto.slice(0, 90)}…` : texto,
        criadoEm: new Date().toISOString(),
      }),
    );
    trecho.classList.add('trecho-marcado');
    setTimeout(() => trecho.classList.remove('trecho-marcado'), 1800);
    anunciar(`Marcador salvo em “${capitulos[atual].titulo}”.`);
  };
  leitor.querySelector('[data-adicionar-marcador]').addEventListener('click', marcarTrecho);
  leitor.querySelector('[data-marcar-rapido]')?.addEventListener('click', marcarTrecho);
  listaMarcadores.addEventListener('click', (evento) => {
    const ir = evento.target.closest('[data-ir-marcador]');
    const remover = evento.target.closest('[data-remover-marcador]');
    if (remover) {
      const [capitulo, indice] = remover.dataset.removerMarcador.split('|');
      mostrarMarcadores(removerMarcador(capitulo, Number(indice)));
      anunciar('Marcador removido.');
      listaMarcadores.querySelector('button')?.focus();
      return;
    }
    if (!ir) return;
    if (usaGaveta()) fecharFolha({ devolverFoco: false });
    const [capitulo, indice] = ir.dataset.irMarcador.split('|');
    exibir(
      Math.max(
        0,
        capitulos.findIndex((c) => c.id === capitulo),
      ),
      { focar: false },
    );
    const alvo = elementos.texto.querySelector(`[data-trecho="${indice}"]`);
    if (!alvo) return;
    alvo.scrollIntoView({ block: 'center' });
    focarProgramaticamente(alvo);
    alvo.classList.add('trecho-marcado');
    setTimeout(() => alvo.classList.remove('trecho-marcado'), 2500);
  });
  mostrarMarcadores();

  /* ---------- Imprimir capítulo ---------- */
  leitor.querySelector('[data-imprimir-capitulo]').addEventListener('click', () => {
    fecharFolha({ devolverFoco: false });
    document.body.classList.add('imprimindo-capitulo');
    window.addEventListener(
      'afterprint',
      () => document.body.classList.remove('imprimindo-capitulo'),
      {
        once: true,
      },
    );
    window.print();
  });

  /* ---------- Início ---------- */
  iniciarAjustesDoLeitor(leitor);
  montarSumario();
  atualizarLidos();
  const doEndereco = location.hash.startsWith('#cap-') ? location.hash.slice(5) : null;
  const salvo = ler(CHAVE_POSICAO, null);
  const idInicial = doEndereco ?? salvo?.capitulo;
  const indiceInicial = Math.max(
    0,
    capitulos.findIndex((c) => c.id === idInicial),
  );
  exibir(indiceInicial, { focar: false });
  if (salvo && indiceInicial > 0 && !doEndereco) {
    anunciar(
      `Você parou em “${capitulos[indiceInicial].titulo}”. O livro foi aberto nesse capítulo.`,
    );
  }
}

/** Preenche título, subtítulo, aviso e tamanhos dos arquivos para download. */
export async function preencherInformacoesDoLivro() {
  const { metadados } = repositorioDoLivro;
  document.querySelectorAll('[data-livro]').forEach((el) => {
    const valor = metadados[el.dataset.livro];
    if (valor) el.textContent = valor;
  });
  // tamanhos dos arquivos (HEAD) — ajuda quem tem internet limitada
  await Promise.all(
    Object.entries(metadados.arquivos).map(async ([formato, caminho]) => {
      const alvo = document.querySelector(`[data-tamanho="${formato}"]`);
      try {
        const resposta = await fetch(`./${caminho}`, { method: 'HEAD' });
        const bytes = Number(resposta.headers.get('content-length'));
        if (alvo && bytes) alvo.textContent = `${Math.max(1, Math.round(bytes / 1024))} KB`;
      } catch {
        /* sem informação de tamanho: tudo bem */
      }
    }),
  );
}
