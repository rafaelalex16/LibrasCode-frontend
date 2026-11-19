import { buscarModulo } from "../trilha/conteudo";
import type { ProgressoModulo } from "../trilha/progresso";

// Tipos dos eventos de aprendizagem (tabela eventos_aprendizagem) e reconstrução do progresso.
// Sem acesso ao banco: usado pelo painel, pela demonstração e pela sincronização da Trilha.

export type TipoEvento = "tentativa" | "item_concluido" | "erro_ide" | "consulta_termo";

export interface EventoAprendizagem {
  aluno_id: string;
  tipo: TipoEvento;
  modulo: string | null;
  item: string | null; // exercício, "tutorial", "pergunta" ou, na consulta de termo, a tela de origem
  termo: string | null;
  erro_tipo: string | null;
  aprovado: boolean | null;
  criado_em: string;
}

// Reconstrói o progresso da Trilha a partir dos eventos (para o painel e para o aluno em outro computador).
// Tentativas contam só até o primeiro acerto.
export function progressoDeEventos(eventos: Pick<EventoAprendizagem, "tipo" | "modulo" | "item" | "aprovado" | "criado_em">[]) {
  const progresso: Record<string, ProgressoModulo> = {};
  const ordenados = [...eventos].sort((a, b) => a.criado_em.localeCompare(b.criado_em));

  for (const evento of ordenados) {
    const modulo = evento.modulo ? buscarModulo(evento.modulo) : undefined;
    if (!modulo || !evento.item) continue;
    const atual = (progresso[modulo.id] ??= { passosVistos: 0, exercicios: {}, pergunta: false });

    if (evento.tipo === "item_concluido") {
      if (evento.item === "tutorial") atual.passosVistos = modulo.passos.length;
      if (evento.item === "pergunta") atual.pergunta = true;
    } else if (evento.tipo === "tentativa" && modulo.exercicios.some((e) => e.id === evento.item)) {
      const exercicio = (atual.exercicios[evento.item] ??= { concluido: false, tentativas: 0 });
      if (exercicio.concluido) continue;
      exercicio.tentativas += 1;
      if (evento.aprovado) exercicio.concluido = true;
    }
  }
  return progresso;
}
