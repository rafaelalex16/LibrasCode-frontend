import type { MensagemWorker, PedidoExecucao } from "./pythonWorker";

const TEMPO_LIMITE_MS = 10000;

export interface ResultadoExecucao {
  erro?: string; // traceback do Python
  falhaCarregamento?: string; // o Python não pôde ser baixado (sem internet, por exemplo)
  tempoEsgotado?: boolean;
  interrompido?: boolean;
}

interface Eventos {
  aoEscrever: (texto: string) => void;
  aoIniciar: () => void; // Python carregado, código começou a rodar
}

// O worker é reaproveitado entre execuções para não baixar o Python de novo
let worker: Worker | null = null;

export function executarPython(codigo: string, entradas: string[], eventos: Eventos, semEco = false) {
  worker ??= new Worker(new URL("./pythonWorker.ts", import.meta.url), { type: "module" });
  const atual = worker;

  let terminar: (resultado: ResultadoExecucao) => void = () => {};
  const resultado = new Promise<ResultadoExecucao>((resolver) => (terminar = resolver));
  let limite: number | undefined;

  const descartarWorker = () => {
    window.clearTimeout(limite);
    atual.terminate();
    if (worker === atual) worker = null;
  };

  atual.onmessage = (evento: MessageEvent<MensagemWorker>) => {
    const mensagem = evento.data;
    if (mensagem.tipo === "saida") {
      eventos.aoEscrever(mensagem.texto);
    } else if (mensagem.tipo === "iniciou") {
      eventos.aoIniciar();
      // Laço infinito: o worker é encerrado e recriado na próxima execução
      limite = window.setTimeout(() => {
        descartarWorker();
        terminar({ tempoEsgotado: true });
      }, TEMPO_LIMITE_MS);
    } else if (mensagem.tipo === "fim") {
      window.clearTimeout(limite);
      terminar({ erro: mensagem.erro });
    } else {
      descartarWorker();
      terminar({ falhaCarregamento: mensagem.erro });
    }
  };
  atual.onerror = (evento) => {
    descartarWorker();
    terminar({ falhaCarregamento: evento.message || "erro desconhecido" });
  };

  atual.postMessage({ codigo, entradas, semEco } satisfies PedidoExecucao);

  return {
    resultado,
    parar: () => {
      descartarWorker();
      terminar({ interrompido: true });
    },
  };
}
