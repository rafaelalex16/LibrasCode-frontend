// Executa o código Python do aluno com o Pyodide (Python compilado para WebAssembly), direto no navegador.
// Roda em um worker para não travar a tela e para poder ser interrompido em caso de laço infinito.

const URL_PYODIDE = "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/";

interface Pyodide {
  setStdout(opcoes: { write: (buffer: Uint8Array) => number }): void;
  setStderr(opcoes: { write: (buffer: Uint8Array) => number }): void;
  setStdin(opcoes: { stdin: () => string | undefined }): void;
  toPy(valor: unknown): unknown;
  runPythonAsync(codigo: string, opcoes?: { globals?: unknown; filename?: string }): Promise<unknown>;
}

export interface PedidoExecucao {
  codigo: string;
  entradas: string[];
  semEco?: boolean; // não mostra o texto do input() nem as respostas (usado na correção da Trilha)
}

// Troca o input() por um que não escreve a pergunta na saída
const INPUT_SEM_ECO = `import builtins as _librascode_builtins
def input(prompt=""):
    return _librascode_builtins.input()
`;

export type MensagemWorker =
  | { tipo: "saida"; texto: string }
  | { tipo: "iniciou" }
  | { tipo: "fim"; erro?: string }
  | { tipo: "falhaCarregamento"; erro: string };

// Escopo do worker (o tsconfig usa os tipos do DOM, então tipamos só o que é usado)
const escopoWorker = self as unknown as {
  postMessage: (mensagem: MensagemWorker) => void;
  onmessage: ((evento: MessageEvent<PedidoExecucao>) => void) | null;
};

let carregando: Promise<Pyodide> | null = null;

function carregarPyodide() {
  carregando ??= import(/* @vite-ignore */ `${URL_PYODIDE}pyodide.mjs`).then(
    (modulo) => modulo.loadPyodide({ indexURL: URL_PYODIDE }) as Promise<Pyodide>,
  );
  return carregando;
}

function enviar(mensagem: MensagemWorker) {
  escopoWorker.postMessage(mensagem);
}

const decodificador = new TextDecoder();
const escrever = (buffer: Uint8Array) => {
  enviar({ tipo: "saida", texto: decodificador.decode(buffer) });
  return buffer.length;
};

escopoWorker.onmessage = async (evento) => {
  const { codigo, entradas, semEco = false } = evento.data;

  let pyodide: Pyodide;
  try {
    pyodide = await carregarPyodide();
  } catch (erro) {
    carregando = null;
    enviar({ tipo: "falhaCarregamento", erro: erro instanceof Error ? erro.message : String(erro) });
    return;
  }

  // Cada input() consome uma linha da aba "Entradas"; a resposta aparece no terminal
  const fila = [...entradas];
  pyodide.setStdout({ write: escrever });
  pyodide.setStderr({ write: escrever });
  pyodide.setStdin({
    stdin: () => {
      const resposta = fila.shift();
      if (resposta !== undefined && !semEco) enviar({ tipo: "saida", texto: `${resposta}\n` });
      return resposta;
    },
  });

  enviar({ tipo: "iniciou" });
  try {
    const escopo = pyodide.toPy({ __name__: "__main__" });
    if (semEco) await pyodide.runPythonAsync(INPUT_SEM_ECO, { globals: escopo, filename: "<preparo>" });
    await pyodide.runPythonAsync(codigo, { globals: escopo, filename: "<aluno>" });
    enviar({ tipo: "fim" });
  } catch (erro) {
    enviar({ tipo: "fim", erro: erro instanceof Error ? erro.message : String(erro) });
  }
};
