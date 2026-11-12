import { buscarTermo } from "../glossario/glossario";

// Gera resumos automáticos, em estrutura SOV, de cada linha e bloco do código do aluno

export interface ResumoLinha {
  linha: number;
  nivel: number; // profundidade do bloco (indentação)
  resumo: string;
  termo?: string; // termo do glossário relacionado
}

const OPERACOES: Record<string, string> = {
  "+": "mais",
  "-": "menos",
  "*": "vezes",
  "/": "dividido por",
  "//": "divisão inteira por",
  "%": "resto da divisão por",
};

function descreverRange(argumentos: string) {
  const partes = argumentos.split(",").map((parte) => parte.trim());
  if (partes.length === 1) return `de 0 até antes de ${partes[0]}`;
  const passo = partes[2] ? `, de ${partes[2]} em ${partes[2]}` : "";
  return `de ${partes[0]} até antes de ${partes[1]}${passo}`;
}

function resumirLinha(texto: string): Omit<ResumoLinha, "linha" | "nivel"> | undefined {
  let m: RegExpMatchArray | null;

  if ((m = texto.match(/^def (\w+)\s*\((.*)\)\s*(->.*)?:$/))) {
    const parametros = m[2].trim();
    return {
      resumo: `Programador função ${m[1]} ${parametros ? `com parâmetros ${parametros}` : "sem parâmetros"} cria.`,
      termo: "def",
    };
  }
  if ((m = texto.match(/^class (\w+)\s*(?:\((.*)\))?\s*:$/))) {
    return { resumo: `Programador classe ${m[1]} ${m[2] ? `filha de ${m[2]} ` : ""}cria.`, termo: "class" };
  }
  if ((m = texto.match(/^for (.+?) in range\((.*)\)\s*:$/))) {
    return { resumo: `Código repetição ${descreverRange(m[2])} com ${m[1]} contando faz.`, termo: "for" };
  }
  if ((m = texto.match(/^for (.+?) in (.+):$/))) {
    return { resumo: `Código cada item de ${m[2].trim()} em ${m[1]} guarda e bloco repete.`, termo: "for" };
  }
  if ((m = texto.match(/^while (.+):$/))) {
    const condicao = m[1].trim();
    return condicao === "True"
      ? { resumo: "Código repetição sem fim mantém; só break interrompe.", termo: "while" }
      : { resumo: `Código repetição enquanto ${condicao} verdadeiro mantém.`, termo: "while" };
  }
  if ((m = texto.match(/^if (.+):$/))) return { resumo: `Programa condição ${m[1].trim()} testa.`, termo: "if" };
  if ((m = texto.match(/^elif (.+):$/))) return { resumo: `Programa outra condição ${m[1].trim()} verifica.`, termo: "elif" };
  if (/^else\s*:$/.test(texto)) return { resumo: "Programa caso contrário caminho executa.", termo: "else" };
  if (/^try\s*:$/.test(texto)) return { resumo: "Programa código perigoso testa.", termo: "try" };
  if ((m = texto.match(/^except\s*([\w.]+)?.*:$/))) {
    return { resumo: `Sistema erro ${m[1] ?? "qualquer"} captura.`, termo: "except" };
  }
  if (/^finally\s*:$/.test(texto)) return { resumo: "Sistema código final sempre executa.", termo: "finally" };
  if ((m = texto.match(/^with open\((.+?)\)(?:\s+as\s+(\w+))?\s*:$/))) {
    return { resumo: `Programa arquivo ${m[1]} abre${m[2] ? `, ${m[2]} usa` : ""} e no fim fecha.`, termo: "with" };
  }
  if ((m = texto.match(/^return\s*(.*)$/))) {
    return { resumo: `Função ${m[1] || "nada"} devolve.`, termo: "return" };
  }
  if ((m = texto.match(/^from (\S+) import (.+)$/))) {
    return { resumo: `Programa ${m[2]} do módulo ${m[1]} puxa.`, termo: "from" };
  }
  if ((m = texto.match(/^import (.+)$/))) return { resumo: `Programa módulo ${m[1]} puxa.`, termo: "import" };
  if ((m = texto.match(/^print\((.*)\)$/))) {
    return { resumo: `Computador ${m[1] || "linha vazia"} na tela mostra.`, termo: "print" };
  }
  if ((m = texto.match(/^(\w+)\s*=\s*(int|float)\(input\((.*)\)\)$/))) {
    const tipo = m[2] === "int" ? "inteiro" : "decimal";
    return { resumo: `Usuário número ${tipo} digita; variável ${m[1]} guarda.`, termo: "input" };
  }
  if ((m = texto.match(/^(\w+)\s*=\s*input\((.*)\)$/))) {
    return { resumo: `Usuário texto digita; variável ${m[1]} guarda.`, termo: "input" };
  }
  if ((m = texto.match(/^([\w.[\]]+)\.(\w+)\((.*)\)$/))) {
    const metodo = buscarTermo(m[2]);
    if (metodo?.ehCodigo) {
      return { resumo: `${m[1]}: ${metodo.explicacaoSOV}${m[3] ? ` (valor: ${m[3]})` : ""}`, termo: metodo.termo };
    }
    return { resumo: `Objeto ${m[1]} método ${m[2]} executa.`, termo: "método" };
  }
  if ((m = texto.match(/^([\w.[\]]+)\s*(\/\/|[+\-*/%])=\s*(.+)$/))) {
    return { resumo: `Variável ${m[1]} valor atual ${OPERACOES[m[2]]} ${m[3]} guarda.`, termo: m[2] === "+" ? "+=" : m[2] === "-" ? "-=" : "atribuição" };
  }
  if ((m = texto.match(/^([\w, .[\]]+?)\s*=(?!=)\s*(.+)$/))) {
    return { resumo: `Variável ${m[1].trim()} valor ${m[2]} guarda.`, termo: "variável" };
  }
  if ((m = texto.match(/^(break|continue|pass)$/))) {
    return { resumo: buscarTermo(m[1])?.explicacaoSOV ?? m[1], termo: m[1] };
  }
  if ((m = texto.match(/^raise (.+)$/))) return { resumo: `Programador erro ${m[1]} força.`, termo: "raise" };
  if ((m = texto.match(/^(\w+)\((.*)\)$/))) {
    return { resumo: `Programa função ${m[1]}${m[2] ? ` com ${m[2]}` : ""} chama.`, termo: "chamada de função" };
  }
  return undefined;
}

// Quantas linhas pertencem ao bloco que começa na linha `inicio`
function contarBloco(linhas: string[], inicio: number, recuo: number) {
  let total = 0;
  for (let i = inicio + 1; i < linhas.length; i++) {
    if (!linhas[i].trim()) continue;
    const recuoAtual = linhas[i].length - linhas[i].trimStart().length;
    if (recuoAtual <= recuo) break;
    total++;
  }
  return total;
}

export function resumirCodigo(codigo: string): ResumoLinha[] {
  const linhas = codigo.split("\n");
  const resumos: ResumoLinha[] = [];

  linhas.forEach((original, indice) => {
    const texto = original.trim();
    if (!texto || texto.startsWith("#")) return;

    const resumo = resumirLinha(texto);
    if (!resumo) return;

    const recuo = original.length - original.trimStart().length;
    const tamanhoBloco = texto.endsWith(":") ? contarBloco(linhas, indice, recuo) : 0;
    resumos.push({
      linha: indice + 1,
      nivel: Math.floor(recuo / 4),
      resumo: tamanhoBloco ? `${resumo.resumo} Bloco: ${tamanhoBloco} linha(s).` : resumo.resumo,
      termo: resumo.termo,
    });
  });

  return resumos;
}
