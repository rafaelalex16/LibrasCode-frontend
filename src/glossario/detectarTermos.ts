import { glossario, versaoGlossario, type TermoGlossario } from "./glossario";

// Termos que também são palavras comuns do português falado ("se ele for", "as", "os", "super").
// Esses só são detectados pelos sinônimos (ex.: "laço for", "módulo os").
const TERMOS_AMBIGUOS = new Set(["for", "as", "os", "super", "continue", "global", "remove", "case", "time", "id", "programa"]);

export function normalizar(texto: string) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9_]+/g, " ")
    .trim();
}

function montarGatilhos() {
  return glossario
  .flatMap((termo) => {
    const frases = [...termo.sinonimos];
    if (/^[a-z]+$/i.test(termo.termo) && !TERMOS_AMBIGUOS.has(termo.termo.toLowerCase())) {
      frases.push(termo.termo);
    }
    return [...new Set(frases.map(normalizar).filter(Boolean))].map((frase) => ({ termo, frase }));
  })
  // Frases mais longas primeiro: "laço infinito" deve vencer "laço"
  .sort((a, b) => b.frase.length - a.frase.length);
}

let gatilhos = montarGatilhos();
let versaoDosGatilhos = versaoGlossario();

// Encontra os termos do glossário citados em um trecho da fala do professor
export function detectarTermos(texto: string): TermoGlossario[] {
  if (versaoDosGatilhos !== versaoGlossario()) {
    gatilhos = montarGatilhos();
    versaoDosGatilhos = versaoGlossario();
  }
  let alvo = ` ${normalizar(texto)} `;
  const encontrados: TermoGlossario[] = [];

  for (const { termo, frase } of gatilhos) {
    const busca = ` ${frase} `;
    if (!alvo.includes(busca)) continue;

    // Consome a frase para que "laço" não seja contado de novo dentro de "laço infinito"
    alvo = alvo.split(busca).join("  ");
    if (!encontrados.includes(termo)) encontrados.push(termo);
  }

  return encontrados;
}
