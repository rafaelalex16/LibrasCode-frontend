import { progressoDeEventos, type EventoAprendizagem } from "../aprendizagem/progressoDeEventos";
import { modulos } from "../trilha/conteudo";
import { itensFeitos, moduloConcluido, type ProgressoModulo } from "../trilha/progresso";

// Transforma alunos + eventos de aprendizagem no painel do professor.
// Usado com os dados reais do banco e com os dados de demonstração.

export const DIAS_SEM_ATIVIDADE = 7;
export const TENTATIVAS_ALERTA = 5;

export interface AlunoDaTurma {
  id: string;
  nome: string;
}

export interface LinhaAluno {
  id: string;
  nome: string;
  modulosConcluidos: number;
  porcentagem: number;
  ondeEsta: string;
  mediaTentativas: number | null; // tentativas até acertar, nos exercícios concluídos
  ultimoAcesso: string | null;
  motivoAtencao: string | null;
}

export interface Painel {
  resumo: { totalAlunos: number; progressoMedio: number; maisAvancado: string | null; precisamAtencao: number };
  alunos: LinhaAluno[];
  errosComuns: { tipo: string; quantidade: number }[];
  termosConsultados: { termo: string; quantidade: number }[];
  autonomiaPorModulo: { numero: number; titulo: string; mediaTentativas: number | null; alunosQueConcluiram: number }[];
}

const DIA_MS = 24 * 60 * 60 * 1000;

function media(valores: number[]) {
  return valores.length ? Math.round((valores.reduce((a, b) => a + b, 0) / valores.length) * 10) / 10 : null;
}

function contar<T>(itens: T[]) {
  const contagem = new Map<T, number>();
  for (const item of itens) contagem.set(item, (contagem.get(item) ?? 0) + 1);
  return [...contagem.entries()].sort((a, b) => b[1] - a[1]);
}

// Primeiro item que falta: "3. Condições · Exercício 1"
function descreverOndeEsta(progresso: Record<string, ProgressoModulo>) {
  for (const modulo of modulos) {
    const p = progresso[modulo.id];
    if (moduloConcluido(modulo, p)) continue;
    const item =
      (p?.passosVistos ?? 0) < modulo.passos.length
        ? "Tutorial"
        : !p?.exercicios[modulo.exercicios[0].id]?.concluido
          ? "Exercício 1"
          : !p?.exercicios[modulo.exercicios[1].id]?.concluido
            ? "Exercício 2"
            : "Pergunta";
    return `${modulo.numero}. ${modulo.titulo} · ${item}`;
  }
  return "Trilha completa";
}

function linhaDoAluno(aluno: AlunoDaTurma, eventos: EventoAprendizagem[], agora: Date): LinhaAluno {
  const progresso = progressoDeEventos(eventos);
  const itens = modulos.map((modulo) => itensFeitos(modulo, progresso[modulo.id]));
  const feitos = itens.reduce((soma, i) => soma + i.feitos, 0);
  const total = itens.reduce((soma, i) => soma + i.total, 0);

  const exercicios = Object.values(progresso).flatMap((p) => Object.values(p.exercicios));
  const ultimoAcesso = eventos.reduce<string | null>((maior, e) => (!maior || e.criado_em > maior ? e.criado_em : maior), null);

  let motivoAtencao: string | null = null;
  const travado = modulos.find((modulo) =>
    Object.values(progresso[modulo.id]?.exercicios ?? {}).some((e) => !e.concluido && e.tentativas >= TENTATIVAS_ALERTA),
  );
  if (!ultimoAcesso) {
    motivoAtencao = "Ainda não começou";
  } else {
    const dias = Math.round((agora.getTime() - new Date(ultimoAcesso).getTime()) / DIA_MS);
    if (dias >= DIAS_SEM_ATIVIDADE) motivoAtencao = `Sem atividade há ${dias} dias`;
    else if (travado) motivoAtencao = `${TENTATIVAS_ALERTA}+ tentativas sem acertar em ${travado.numero}. ${travado.titulo}`;
  }

  return {
    id: aluno.id,
    nome: aluno.nome,
    modulosConcluidos: modulos.filter((modulo) => moduloConcluido(modulo, progresso[modulo.id])).length,
    porcentagem: Math.round((feitos / total) * 100),
    ondeEsta: descreverOndeEsta(progresso),
    mediaTentativas: media(exercicios.filter((e) => e.concluido).map((e) => e.tentativas)),
    ultimoAcesso,
    motivoAtencao,
  };
}

export function montarPainel(alunos: AlunoDaTurma[], todosEventos: EventoAprendizagem[], agora: Date): Painel {
  const ids = new Set(alunos.map((a) => a.id));
  // Só eventos dos alunos desta turma
  const eventos = todosEventos.filter((e) => ids.has(e.aluno_id));

  const linhas = alunos
    .map((aluno) => linhaDoAluno(aluno, eventos.filter((e) => e.aluno_id === aluno.id), agora))
    .sort((a, b) => b.porcentagem - a.porcentagem || a.nome.localeCompare(b.nome));

  const progressoPorAluno = alunos.map((aluno) => progressoDeEventos(eventos.filter((e) => e.aluno_id === aluno.id)));
  const lider = linhas[0];

  return {
    resumo: {
      totalAlunos: alunos.length,
      progressoMedio: Math.round(media(linhas.map((l) => l.porcentagem)) ?? 0),
      maisAvancado: lider && lider.porcentagem > 0 ? lider.nome : null,
      precisamAtencao: linhas.filter((l) => l.motivoAtencao).length,
    },
    alunos: linhas,
    errosComuns: contar(
      eventos
        .filter((e) => e.erro_tipo && (e.tipo === "erro_ide" || (e.tipo === "tentativa" && !e.aprovado)))
        .map((e) => e.erro_tipo as string),
    )
      .slice(0, 6)
      .map(([tipo, quantidade]) => ({ tipo, quantidade })),
    termosConsultados: contar(eventos.filter((e) => e.tipo === "consulta_termo" && e.termo).map((e) => e.termo as string))
      .slice(0, 10)
      .map(([termo, quantidade]) => ({ termo, quantidade })),
    autonomiaPorModulo: modulos.map((modulo) => ({
      numero: modulo.numero,
      titulo: modulo.titulo,
      mediaTentativas: media(
        progressoPorAluno.flatMap((p) => Object.values(p[modulo.id]?.exercicios ?? {}).filter((e) => e.concluido).map((e) => e.tentativas)),
      ),
      alunosQueConcluiram: progressoPorAluno.filter((p) => moduloConcluido(modulo, p[modulo.id])).length,
    })),
  };
}
