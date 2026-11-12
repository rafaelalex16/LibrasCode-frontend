import { buscarTermo, type TermoGlossario } from "../glossario/glossario";

// Converte o traceback do Python em uma explicação acessível em Libras (estrutura SOV)

export interface ErroExplicado {
  tipo: string;
  linha?: number;
  mensagemOriginal: string;
  mensagemTraduzida: string;
  termo?: TermoGlossario;
  explicacao: string;
  dica: string;
  traceback: string;
}

// Erros que são variações de outros já presentes no glossário
const EQUIVALENTES: Record<string, string> = {
  TabError: "IndentationError",
  UnboundLocalError: "NameError",
};

const DICAS: Record<string, string> = {
  SyntaxError: "Confira parênteses, aspas e dois-pontos na linha indicada.",
  IndentationError: "Use o mesmo espaçamento (4 espaços) em todas as linhas do mesmo bloco.",
  NameError: "Confira se o nome está escrito igual e se a variável foi criada antes de ser usada.",
  TypeError: "Converta os valores para o mesmo tipo, por exemplo com int() ou str().",
  ValueError: "Confira se o valor combina com o tipo esperado. Ex.: int() só aceita texto com números.",
  IndexError: "A contagem começa em 0 e vai até len(lista) - 1.",
  KeyError: "Confira se a chave existe no dicionário ou use .get().",
  ZeroDivisionError: "Antes de dividir, verifique se o divisor é diferente de zero.",
  AttributeError: "Confira o nome do método e o tipo do objeto.",
  ImportError: "Confira o nome do que está sendo importado.",
  ModuleNotFoundError: "Confira o nome do módulo. Nesta IDE só existem os módulos que já vêm com o Python.",
  FileNotFoundError: "Confira o nome e o caminho do arquivo.",
  RecursionError: "A função recursiva precisa de uma condição de parada.",
  EOFError: "O programa pediu um input(). Escreva as respostas na aba Entradas, uma por linha.",
};

// Mensagens mais comuns do Python traduzidas para o português
const TRADUCOES: [RegExp, string][] = [
  [/name '(.+)' is not defined/, "o nome '$1' não foi criado"],
  [/cannot access local variable '(.+)'.*/, "a variável local '$1' foi usada antes de receber valor"],
  [/division by zero|division or modulo by zero/, "divisão por zero"],
  [/list index out of range/, "posição fora da lista"],
  [/string index out of range/, "posição fora do texto"],
  [/invalid literal for int\(\) with base 10: (.+)/, "$1 não pode virar número inteiro"],
  [/could not convert string to float: (.+)/, "$1 não pode virar número decimal"],
  [/can only concatenate str \(not "(\w+)"\) to str/, "texto só pode ser juntado com texto (recebeu $1)"],
  [/unsupported operand type\(s\) for (.+): '(\w+)' and '(\w+)'/, "a operação $1 não funciona entre $2 e $3"],
  [/'(\w+)' object has no attribute '(\w+)'/, "o tipo $1 não possui '$2'"],
  [/'(\w+)' object is not callable/, "$1 não é uma função e não pode ser chamado com ()"],
  [/expected ':'/, "faltam os dois-pontos (:)"],
  [/unexpected indent/, "espaçamento inesperado"],
  [/expected an indented block.*/, "o bloco precisa de espaçamento"],
  [/unindent does not match any outer indentation level/, "o espaçamento não combina com o bloco de fora"],
  [/unterminated string literal.*/, "texto sem aspas de fechamento"],
  [/'(.)' was never closed/, "'$1' foi aberto e não foi fechado"],
  [/unmatched '(.)'/, "'$1' fechado sem ter sido aberto"],
  [/invalid syntax.*/, "escrita inválida"],
  [/No module named '(.+)'/, "o módulo '$1' não foi encontrado"],
  [/EOF when reading a line/, "o input() não recebeu resposta"],
  [/maximum recursion depth exceeded.*/, "a função chamou ela mesma vezes demais"],
  [/No such file or directory: (.+)/, "arquivo $1 não existe"],
];

function traduzirMensagem(mensagem: string) {
  // O Python 3.12 sugere a correção no fim: "... Did you mean: 'nome'?"
  const traduzida = mensagem.replace(/Did you mean: (.+)\?$/, "Você quis dizer $1?");
  for (const [padrao, traducao] of TRADUCOES) {
    if (padrao.test(traduzida)) return traduzida.replace(padrao, traducao);
  }
  return traduzida;
}

// Remove as linhas internas do Pyodide e mantém só o que se refere ao código do aluno
function limparTraceback(traceback: string) {
  const linhas = traceback.trimEnd().split("\n");
  const resultado: string[] = [];
  for (let i = 0; i < linhas.length; i++) {
    if (/^\s+File "(?!<)/.test(linhas[i])) {
      // Pula também o trecho de código e os marcadores ^^^ desse quadro interno
      while (linhas[i + 1] && /^\s{4,}/.test(linhas[i + 1])) i++;
      continue;
    }
    resultado.push(linhas[i]);
  }
  return resultado.join("\n");
}

export function explicarErro(traceback: string): ErroExplicado {
  const linhas = traceback.trimEnd().split("\n");
  const ultima = [...linhas].reverse().find((linha) => /^[A-Za-z_][\w.]*(:|$)/.test(linha)) ?? "";
  const [, tipoCompleto = "Erro", mensagemOriginal = ""] = ultima.match(/^([\w.]+)(?::\s*(.*))?$/) ?? [];
  const tipo = tipoCompleto.split(".").pop() ?? tipoCompleto;

  let linha: number | undefined;
  for (const encontrado of traceback.matchAll(/File "<(?:aluno|exec)>", line (\d+)/g)) {
    linha = Number(encontrado[1]);
  }

  const tipoBase = EQUIVALENTES[tipo] ?? tipo;
  const termo = buscarTermo(tipoBase);

  return {
    tipo,
    linha,
    mensagemOriginal,
    mensagemTraduzida: traduzirMensagem(mensagemOriginal),
    termo,
    explicacao: termo?.explicacaoSOV ?? "Programa erro durante a execução encontrou.",
    dica: DICAS[tipoBase] ?? "Leia a linha indicada e compare com os exemplos do glossário.",
    traceback: limparTraceback(traceback),
  };
}

// Texto enviado ao avatar do VLibras
export function textoDoErroParaSinalizar(erro: ErroExplicado) {
  const nome = erro.termo?.traducao ?? "erro";
  const onde = erro.linha ? ` na linha ${erro.linha}` : "";
  return `${nome}${onde}. ${erro.explicacao} ${erro.mensagemTraduzida}. ${erro.dica}`;
}
