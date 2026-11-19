import { useSyncExternalStore } from "react";
import { buscarModulo, modulos, type Modulo } from "./conteudo";

// Progresso da Trilha guardado neste navegador.
// Quando o login for ligado, pode ir para o banco e para o "Progresso da Turma" do professor.

const CHAVE = "librascode:trilha";

export interface ProgressoExercicio {
  concluido: boolean;
  tentativas: number; // tentativas até acertar (base para medir a autonomia do aluno)
}

export interface ProgressoModulo {
  passosVistos: number;
  exercicios: Record<string, ProgressoExercicio>;
  pergunta: boolean;
}

type Progresso = Record<string, ProgressoModulo>;

let atual: Progresso | null = null;
const ouvintes = new Set<() => void>();

export function lerProgresso(): Progresso {
  if (atual) return atual;
  try {
    const dados = JSON.parse(localStorage.getItem(CHAVE) ?? "{}");
    atual = dados && typeof dados === "object" && !Array.isArray(dados) ? dados : {};
  } catch {
    atual = {};
  }
  return atual!;
}

function salvar(novo: Progresso) {
  atual = novo;
  try {
    localStorage.setItem(CHAVE, JSON.stringify(novo));
  } catch {
    // sem armazenamento: o progresso vale só nesta sessão
  }
  ouvintes.forEach((avisar) => avisar());
}

function progressoDoModulo(moduloId: string): ProgressoModulo {
  const salvo = lerProgresso()[moduloId];
  return {
    passosVistos: typeof salvo?.passosVistos === "number" ? salvo.passosVistos : 0,
    exercicios: salvo?.exercicios && typeof salvo.exercicios === "object" ? salvo.exercicios : {},
    pergunta: salvo?.pergunta === true,
  };
}

// As funções abaixo devolvem true quando algo novo aconteceu (quem chama registra o evento no banco)

// true quando o último passo do tutorial é visto pela primeira vez
export function marcarPasso(moduloId: string, indice: number) {
  const modulo = progressoDoModulo(moduloId);
  if (indice + 1 <= modulo.passosVistos) return false;
  salvar({ ...lerProgresso(), [moduloId]: { ...modulo, passosVistos: indice + 1 } });
  return indice + 1 === buscarModulo(moduloId)?.passos.length;
}

// true quando a tentativa conta (o exercício ainda não estava concluído)
export function registrarTentativa(moduloId: string, exercicioId: string, aprovado: boolean) {
  const modulo = progressoDoModulo(moduloId);
  const exercicio = modulo.exercicios[exercicioId] ?? { concluido: false, tentativas: 0 };
  // Depois de concluído, novas execuções não mudam a contagem
  if (exercicio.concluido) return false;
  const novo = { concluido: aprovado, tentativas: exercicio.tentativas + 1 };
  salvar({ ...lerProgresso(), [moduloId]: { ...modulo, exercicios: { ...modulo.exercicios, [exercicioId]: novo } } });
  return true;
}

// true na primeira vez que a pergunta é respondida certo
export function marcarPergunta(moduloId: string) {
  const modulo = progressoDoModulo(moduloId);
  if (modulo.pergunta) return false;
  salvar({ ...lerProgresso(), [moduloId]: { ...modulo, pergunta: true } });
  return true;
}

// Junta o progresso vindo do banco com o deste navegador, mantendo o maior avanço
export function mesclarProgresso(remoto: Record<string, ProgressoModulo>) {
  const local = lerProgresso();
  const juntado = { ...local };
  for (const [moduloId, deFora] of Object.entries(remoto)) {
    const daqui = progressoDoModulo(moduloId);
    const exercicios = { ...daqui.exercicios };
    for (const [exercicioId, remotoEx] of Object.entries(deFora.exercicios)) {
      const localEx = exercicios[exercicioId] ?? { concluido: false, tentativas: 0 };
      exercicios[exercicioId] = {
        concluido: localEx.concluido || remotoEx.concluido,
        tentativas: Math.max(localEx.tentativas, remotoEx.tentativas),
      };
    }
    juntado[moduloId] = {
      passosVistos: Math.max(daqui.passosVistos, deFora.passosVistos),
      exercicios,
      pergunta: daqui.pergunta || deFora.pergunta,
    };
  }
  salvar(juntado);
}

// Itens do módulo: tutorial (todos os passos vistos) + exercícios + pergunta
export function itensFeitos(modulo: Modulo, progresso?: ProgressoModulo) {
  const total = 1 + modulo.exercicios.length + 1;
  if (!progresso) return { feitos: 0, total };
  const feitos =
    (progresso.passosVistos >= modulo.passos.length ? 1 : 0) +
    modulo.exercicios.filter((exercicio) => progresso.exercicios?.[exercicio.id]?.concluido === true).length +
    (progresso.pergunta === true ? 1 : 0);
  return { feitos, total };
}

export function moduloConcluido(modulo: Modulo, progresso?: ProgressoModulo) {
  const { feitos, total } = itensFeitos(modulo, progresso);
  return feitos === total;
}

// Desbloqueio em ordem: o módulo 1 já vem aberto; os outros abrem quando o anterior é concluído
export function moduloLiberado(modulo: Modulo, progresso: Record<string, ProgressoModulo>) {
  const anterior = modulos[modulo.numero - 2];
  return !anterior || moduloConcluido(anterior, progresso[anterior.id]);
}

function assinar(avisar: () => void) {
  ouvintes.add(avisar);
  return () => {
    ouvintes.delete(avisar);
  };
}

// Progresso atual; a tela atualiza quando algo é concluído
export function useProgresso() {
  return useSyncExternalStore(assinar, lerProgresso);
}
