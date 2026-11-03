/**
 * Serviço de síntese de voz (Web Speech API) em português.
 * Funciona sem internet na maioria dos sistemas (usa as vozes do aparelho).
 */

export const vozDisponivel = () => typeof window !== 'undefined' && 'speechSynthesis' in window;

/** Lista vozes em português, com pt-BR primeiro. */
export function listarVozesEmPortugues() {
  if (!vozDisponivel()) return [];
  return speechSynthesis
    .getVoices()
    .filter((v) => v.lang?.toLowerCase().startsWith('pt'))
    .sort((a, b) => Number(b.lang === 'pt-BR') - Number(a.lang === 'pt-BR'));
}

/** As vozes carregam de forma assíncrona em alguns navegadores. */
export function aguardarVozes() {
  return new Promise((resolver) => {
    if (!vozDisponivel()) return resolver([]);
    const vozes = listarVozesEmPortugues();
    if (vozes.length) return resolver(vozes);
    const aoMudar = () => resolver(listarVozesEmPortugues());
    speechSynthesis.addEventListener('voiceschanged', aoMudar, { once: true });
    setTimeout(aoMudar, 1500);
  });
}

/**
 * Fala um texto.
 * @param {string} texto
 * @param {{ velocidade?: number, vozNome?: string, aoIniciar?: Function, aoTerminar?: Function, aoErro?: Function }} opcoes
 */
export function falar(texto, opcoes = {}) {
  if (!vozDisponivel() || !texto?.trim()) return null;
  const fala = new SpeechSynthesisUtterance(texto);
  fala.lang = 'pt-BR';
  fala.rate = opcoes.velocidade ?? 1;
  const vozes = listarVozesEmPortugues();
  fala.voice = vozes.find((v) => v.name === opcoes.vozNome) ?? vozes[0] ?? null;
  if (opcoes.aoIniciar) fala.onstart = opcoes.aoIniciar;
  if (opcoes.aoTerminar) fala.onend = opcoes.aoTerminar;
  if (opcoes.aoErro) fala.onerror = opcoes.aoErro;
  speechSynthesis.speak(fala);
  return fala;
}

export const pausarFala = () => vozDisponivel() && speechSynthesis.pause();
export const retomarFala = () => vozDisponivel() && speechSynthesis.resume();
export const pararFala = () => vozDisponivel() && speechSynthesis.cancel();
export const estaFalando = () => vozDisponivel() && speechSynthesis.speaking;
