import type { EventoAprendizagem } from "../aprendizagem/progressoDeEventos";
import { modulos } from "../trilha/conteudo";
import type { AlunoDaTurma } from "./montarPainel";

// Alunos e aulas fictícios, mostrados no painel quando o login está desligado

export interface AulaDoHistorico {
  id: string;
  iniciada_em: string;
  encerrada_em: string | null;
  totalFalas: number;
}

export interface FalaDoHistorico {
  texto: string;
  criado_em: string;
}

const DIA_MS = 24 * 60 * 60 * 1000;

export function dadosDemonstracao(agora: Date) {
  const alunos: AlunoDaTurma[] = [
    { id: "demo-diana", nome: "Diana Rocha" },
    { id: "demo-ana", nome: "Ana Silva" },
    { id: "demo-bruno", nome: "Bruno Souza" },
    { id: "demo-fernanda", nome: "Fernanda Alves" },
    { id: "demo-carlos", nome: "Carlos Lima" },
  ];
  const eventos: EventoAprendizagem[] = [];
  let segundo = 0;
  // Um segundo entre eventos: mantém a ordem sem mudar o dia
  const quando = (diasAtras: number) => new Date(agora.getTime() - diasAtras * DIA_MS + segundo++ * 1000).toISOString();

  const evento = (aluno: string, diasAtras: number, dados: Partial<EventoAprendizagem> & Pick<EventoAprendizagem, "tipo">) =>
    eventos.push({ aluno_id: aluno, modulo: null, item: null, termo: null, erro_tipo: null, aprovado: null, ...dados, criado_em: quando(diasAtras) });

  // n tentativas num exercício; a última acerta se "acertou"
  const tentativas = (aluno: string, diasAtras: number, modulo: string, item: string, n: number, acertou: boolean, erros: string[]) => {
    for (let i = 1; i <= n; i++) {
      const aprovado = acertou && i === n;
      evento(aluno, diasAtras, { tipo: "tentativa", modulo, item, aprovado, erro_tipo: aprovado ? null : erros[i % erros.length] });
    }
  };

  const concluirModulo = (aluno: string, indice: number, diasAtras: number, porExercicio: [number, number], erros: string[]) => {
    const modulo = modulos[indice];
    evento(aluno, diasAtras, { tipo: "item_concluido", modulo: modulo.id, item: "tutorial" });
    tentativas(aluno, diasAtras, modulo.id, modulo.exercicios[0].id, porExercicio[0], true, erros);
    tentativas(aluno, diasAtras, modulo.id, modulo.exercicios[1].id, porExercicio[1], true, erros);
    evento(aluno, diasAtras, { tipo: "item_concluido", modulo: modulo.id, item: "pergunta" });
  };

  // Diana: trilha completa, poucas tentativas
  const diana: [number, number][] = [[1, 1], [1, 2], [1, 1], [2, 1], [1, 1]];
  diana.forEach((porExercicio, i) => concluirModulo("demo-diana", i, 20 - i * 4, porExercicio, ["SaidaDiferente"]));

  // Ana: 3 módulos, começando o 4º
  concluirModulo("demo-ana", 0, 12, [2, 3], ["SyntaxError", "SaidaDiferente"]);
  concluirModulo("demo-ana", 1, 8, [3, 2], ["ValueError", "NameError"]);
  concluirModulo("demo-ana", 2, 4, [2, 4], ["IndentationError", "SaidaDiferente"]);
  evento("demo-ana", 1, { tipo: "item_concluido", modulo: "repeticao", item: "tutorial" });

  // Bruno: travado no exercício de condição
  concluirModulo("demo-bruno", 0, 10, [2, 2], ["SyntaxError"]);
  concluirModulo("demo-bruno", 1, 6, [4, 3], ["NameError", "ValueError"]);
  evento("demo-bruno", 2, { tipo: "item_concluido", modulo: "condicoes", item: "tutorial" });
  tentativas("demo-bruno", 2, "condicoes", "aprovado", 6, false, ["IndentationError", "SyntaxError", "SaidaDiferente"]);

  // Fernanda: parou há 10 dias
  concluirModulo("demo-fernanda", 0, 10, [3, 2], ["SyntaxError", "SaidaDiferente"]);

  // Carlos: ainda não começou (sem eventos)

  // Erros na IDE e consultas: só dos alunos ativos (Diana, Ana e Bruno)
  const ativos = ["demo-diana", "demo-ana", "demo-bruno"];

  // Erros na IDE
  const errosIde: [string, number][] = [["SyntaxError", 6], ["NameError", 4], ["IndentationError", 3], ["TypeError", 2]];
  errosIde.forEach(([tipo, n], i) => {
    for (let j = 0; j < n; j++) evento(ativos[(i + j) % ativos.length], 1 + j, { tipo: "erro_ide", erro_tipo: tipo });
  });

  // Termos consultados em Libras
  const consultas: [string, number][] = [["while", 7], ["for", 6], ["if", 5], ["variável", 4], ["list", 3], ["range", 3], ["input", 2], ["append", 2]];
  consultas.forEach(([termo, n], i) => {
    for (let j = 0; j < n; j++) evento(ativos[(i + j) % ativos.length], 1 + j, { tipo: "consulta_termo", termo, item: "glossario" });
  });

  const aulas: AulaDoHistorico[] = [
    { id: "demo-aula-2", iniciada_em: new Date(agora.getTime() - 2 * DIA_MS).toISOString(), encerrada_em: new Date(agora.getTime() - 2 * DIA_MS + 50 * 60000).toISOString(), totalFalas: 3 },
    { id: "demo-aula-1", iniciada_em: new Date(agora.getTime() - 9 * DIA_MS).toISOString(), encerrada_em: new Date(agora.getTime() - 9 * DIA_MS + 50 * 60000).toISOString(), totalFalas: 3 },
  ];
  const falas: Record<string, FalaDoHistorico[]> = {
    "demo-aula-2": [
      { texto: "hoje vamos estudar o laço while", criado_em: aulas[0].iniciada_em },
      { texto: "o while repete o bloco enquanto a condição for verdadeira", criado_em: aulas[0].iniciada_em },
      { texto: "cuidado com o laço infinito, atualizem o contador", criado_em: aulas[0].iniciada_em },
    ],
    "demo-aula-1": [
      { texto: "vamos começar com o comando print", criado_em: aulas[1].iniciada_em },
      { texto: "o input lê o que o usuário digita", criado_em: aulas[1].iniciada_em },
      { texto: "para fazer conta usamos int no input", criado_em: aulas[1].iniciada_em },
    ],
  };

  return { alunos, eventos, aulas, falas };
}
