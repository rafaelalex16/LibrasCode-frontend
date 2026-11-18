import type { Exercicio } from "./conteudo";

// Correção dos exercícios da Trilha: compara a saída do programa com a esperada
// e confere se o código usou o comando pedido.

export interface ResultadoCaso {
  saida: string;
  erro?: string; // traceback do Python
  tempoEsgotado?: boolean;
}

export interface Avaliacao {
  aprovado: boolean;
  motivo?: string;
  casoComFalha?: number;
}

// Ignora espaços no fim das linhas e linhas vazias no fim
export function normalizarSaida(texto: string) {
  return texto
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((linha) => linha.trimEnd())
    .join("\n")
    .replace(/\n+$/, "");
}

// O comando só conta se aparecer no código de verdade (fora de comentários e de textos entre aspas)
export function usaComando(codigo: string, comando: string) {
  const semTextos = codigo
    .replace(/("""|''')[\s\S]*?\1/g, "")
    .replace(/(["'])(?:\\.|(?!\1).)*\1/g, "")
    .replace(/#.*$/gm, "");
  return new RegExp(`\\b${comando}\\b`).test(semTextos);
}

function descreverEntradas(entradas: string[]) {
  return entradas.length ? `Com as respostas ${entradas.join(", ")}` : "Neste exercício";
}

export function avaliar(exercicio: Exercicio, codigo: string, resultados: ResultadoCaso[]): Avaliacao {
  for (const [indice, caso] of exercicio.casos.entries()) {
    const resultado = resultados[indice];
    if (!resultado || resultado.tempoEsgotado) {
      return { aprovado: false, casoComFalha: indice, motivo: "O programa demorou demais. Confira se existe um laço infinito." };
    }
    if (resultado.erro) {
      return { aprovado: false, casoComFalha: indice, motivo: "O programa deu erro. Veja a explicação em Libras abaixo." };
    }

    const obtida = normalizarSaida(resultado.saida);
    const esperada = normalizarSaida(caso.saidaEsperada);
    if (obtida !== esperada) {
      return {
        aprovado: false,
        casoComFalha: indice,
        motivo: `${descreverEntradas(caso.entradas)}, o programa deveria mostrar:\n${esperada}\n\nmas mostrou:\n${obtida || "(nada)"}`,
      };
    }
  }

  if (exercicio.precisaUsar && !usaComando(codigo, exercicio.precisaUsar)) {
    return { aprovado: false, motivo: `A saída está certa, mas este exercício pede para usar ${exercicio.precisaUsar}.` };
  }
  return { aprovado: true };
}
