import { AlertTriangle, Award, BarChart3, Bug, Clock, Hand, MessageCircleQuestion, TrendingUp, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { EventoAprendizagem } from "../../aprendizagem/progressoDeEventos";
import { LOGIN_ATIVO } from "../../config";
import { buscarTermo, textoParaSinalizar } from "../../glossario/glossario";
import { dadosDemonstracao, type AulaDoHistorico, type FalaDoHistorico } from "../../painel/dadosDemonstracao";
import { HistoricoAulas } from "../../painel/HistoricoAulas";
import { montarPainel, TENTATIVAS_ALERTA, type AlunoDaTurma, type Painel } from "../../painel/montarPainel";
import { supabase } from "../../supabase/cliente";
import { useTurmas } from "../../turmas/useTurmas";
import { sinalizar } from "../../vlibras/vlibras";

// Erros que não são do Python: vêm da correção dos exercícios da Trilha
const ERROS_DA_TRILHA: Record<string, string> = {
  SaidaDiferente: "Saída diferente da esperada",
  FaltouComando: "Não usou o comando pedido",
  TempoEsgotado: "Laço infinito (tempo esgotado)",
};

const CORES_AVATAR = ["bg-purple-700", "bg-blue-600", "bg-teal-600", "bg-orange-500", "bg-pink-600"];

function iniciais(nome: string) {
  return nome.split(" ").filter(Boolean).slice(0, 2).map((parte) => parte[0].toUpperCase()).join("");
}

function quandoFoi(data: string | null, agora: Date) {
  if (!data) return "nunca";
  const dias = Math.round((agora.getTime() - new Date(data).getTime()) / (24 * 60 * 60 * 1000));
  return dias <= 0 ? "hoje" : dias === 1 ? "ontem" : `há ${dias} dias`;
}

interface DadosTurma {
  turmaId: string;
  alunos: AlunoDaTurma[];
  eventos: EventoAprendizagem[];
  aulas: AulaDoHistorico[];
}

// Busca no banco os alunos da turma, os eventos deles e as aulas
async function carregarTurma(turmaId: string): Promise<DadosTurma> {
  const { data: matriculas } = await supabase.from("matriculas").select("aluno_id, perfis(nome)").eq("turma_id", turmaId);
  const alunos = ((matriculas ?? []) as unknown as { aluno_id: string; perfis: { nome: string } | null }[]).map((m) => ({
    id: m.aluno_id,
    nome: m.perfis?.nome ?? "Aluno",
  }));

  const [eventos, aulas] = await Promise.all([
    alunos.length
      ? supabase.from("eventos_aprendizagem").select("*").in("aluno_id", alunos.map((a) => a.id)).order("criado_em").limit(10000)
      : Promise.resolve({ data: [] }),
    supabase.from("aulas").select("id, iniciada_em, encerrada_em, falas(count)").eq("turma_id", turmaId).order("iniciada_em", { ascending: false }).limit(20),
  ]);

  return {
    turmaId,
    alunos,
    eventos: (eventos.data ?? []) as EventoAprendizagem[],
    aulas: ((aulas.data ?? []) as unknown as { id: string; iniciada_em: string; encerrada_em: string | null; falas: { count: number }[] }[]).map((a) => ({
      id: a.id,
      iniciada_em: a.iniciada_em,
      encerrada_em: a.encerrada_em,
      totalFalas: a.falas[0]?.count ?? 0,
    })),
  };
}

async function carregarFalasDoBanco(aulaId: string): Promise<FalaDoHistorico[]> {
  const { data } = await supabase.from("falas").select("texto, criado_em").eq("aula_id", aulaId).order("criado_em");
  return data ?? [];
}

function Cartao({ icone: Icone, cor, titulo, valor }: { icone: typeof Users; cor: string; titulo: string; valor: string | number }) {
  return (
    <div className="flex-1 min-w-[150px] h-32 bg-white border border-gray-200 flex flex-col justify-between rounded-lg p-3 text-start">
      <div className={`w-8 h-8 flex items-center justify-center rounded-lg ${cor}`}>
        <Icone size={20} />
      </div>
      <h3 className="text-gray-500 font-semibold text-sm">{titulo}</h3>
      <span className="font-bold text-lg truncate">{valor}</span>
    </div>
  );
}

function ConteudoPainel({ painel, agora, aulas, carregarFalas }: { painel: Painel; agora: Date; aulas: AulaDoHistorico[]; carregarFalas: (aulaId: string) => Promise<FalaDoHistorico[]> }) {
  const maiorErro = painel.errosComuns[0]?.quantidade ?? 1;
  const maiorMedia = Math.max(1, ...painel.autonomiaPorModulo.map((m) => m.mediaTentativas ?? 0));

  return (
    <>
      {/* Cards */}
      <div className="flex flex-wrap gap-3">
        <Cartao icone={Users} cor="bg-blue-100 text-blue-600" titulo="Total de alunos" valor={painel.resumo.totalAlunos} />
        <Cartao icone={TrendingUp} cor="bg-green-100 text-green-600" titulo="Progresso médio" valor={`${painel.resumo.progressoMedio}%`} />
        <Cartao icone={Award} cor="bg-yellow-100 text-yellow-600" titulo="Mais avançado" valor={painel.resumo.maisAvancado ?? "—"} />
        <Cartao icone={Clock} cor="bg-red-100 text-red-600" titulo="Precisam atenção" valor={painel.resumo.precisamAtencao} />
      </div>

      {/* Desempenho individual */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="border-b border-gray-200 p-4 text-start">
          <h3 className="font-bold">Desempenho individual na Trilha</h3>
          <p className="text-xs text-gray-400">Média de tentativas até acertar: quanto menor, mais autonomia.</p>
        </div>
        {painel.alunos.map((aluno, indice) => (
          <div key={aluno.id} className="flex items-start gap-3 p-4 border-b border-gray-100 last:border-b-0 text-start">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 ${CORES_AVATAR[indice % CORES_AVATAR.length]}`}>
              {iniciais(aluno.nome)}
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <div className="flex justify-between items-start gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-sm text-gray-900">{aluno.nome}</h3>
                  {aluno.motivoAtencao && (
                    <span className="flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-600">
                      <AlertTriangle size={11} />
                      {aluno.motivoAtencao}
                    </span>
                  )}
                </div>
                <span className="font-bold text-sm text-gray-800">{aluno.porcentagem}%</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${aluno.motivoAtencao ? "bg-red-500" : aluno.porcentagem === 100 ? "bg-green-600" : "bg-blue-600"}`}
                  style={{ width: `${aluno.porcentagem}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500">
                {aluno.modulosConcluidos} de 5 módulos · {aluno.ondeEsta} · média de tentativas:{" "}
                {aluno.mediaTentativas ?? "—"} · último acesso: {quandoFoi(aluno.ultimoAcesso, agora)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
        {/* Erros mais comuns */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col gap-2 text-start">
          <h3 className="flex items-center gap-2 font-bold">
            <Bug size={16} />
            Erros mais comuns
          </h3>
          {painel.errosComuns.length === 0 && <p className="text-sm text-gray-400">Nenhum erro registrado.</p>}
          {painel.errosComuns.map(({ tipo, quantidade }) => {
            const termo = buscarTermo(tipo);
            return (
              <div key={tipo} className="flex items-center gap-2 text-sm">
                <span className="w-48 shrink-0 truncate" title={tipo}>
                  {ERROS_DA_TRILHA[tipo] ?? termo?.traducao ?? tipo}
                </span>
                <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-red-400 rounded-full" style={{ width: `${(quantidade / maiorErro) * 100}%` }}></div>
                </div>
                <span className="w-6 text-right font-semibold">{quantidade}</span>
                {termo && (
                  <button onClick={() => sinalizar(textoParaSinalizar(termo))} title={termo.explicacaoSOV} className="text-blue-600">
                    <Hand size={14} />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Dúvidas */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col gap-2 text-start">
          <h3 className="flex items-center gap-2 font-bold">
            <MessageCircleQuestion size={16} />
            Dúvidas: termos mais consultados em Libras
          </h3>
          {painel.termosConsultados.length === 0 && <p className="text-sm text-gray-400">Nenhum termo consultado ainda.</p>}
          <div className="flex flex-wrap gap-2">
            {painel.termosConsultados.map(({ termo: nome, quantidade }) => {
              const termo = buscarTermo(nome);
              return (
                <button
                  key={nome}
                  onClick={() => termo && sinalizar(textoParaSinalizar(termo))}
                  title={termo?.explicacaoSOV}
                  className="flex items-center gap-1 rounded-full bg-purple-100 px-3 py-1 text-sm font-semibold text-purple-700 hover:bg-purple-200"
                >
                  {nome}
                  <span className="rounded-full bg-white px-1.5 text-xs">{quantidade}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Autonomia por módulo */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col gap-2 text-start">
        <h3 className="flex items-center gap-2 font-bold">
          <BarChart3 size={16} />
          Evolução da autonomia por módulo
        </h3>
        <p className="text-xs text-gray-400">
          Média de tentativas até acertar os exercícios (quanto menor, mais autonomia). Alerta a partir de {TENTATIVAS_ALERTA} tentativas sem acerto.
        </p>
        {painel.autonomiaPorModulo.map((modulo) => (
          <div key={modulo.numero} className="flex items-center gap-2 text-sm">
            <span className="w-48 shrink-0 truncate">
              {modulo.numero}. {modulo.titulo}
            </span>
            <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: `${((modulo.mediaTentativas ?? 0) / maiorMedia) * 100}%` }}></div>
            </div>
            <span className="w-40 text-right text-xs text-gray-500">
              {modulo.mediaTentativas === null ? "sem dados" : `${modulo.mediaTentativas} tentativas`} · {modulo.alunosQueConcluiram} concluíram
            </span>
          </div>
        ))}
      </div>

      <HistoricoAulas aulas={aulas} carregarFalas={carregarFalas} />
    </>
  );
}

// Login desligado: alunos fictícios
function PainelDemonstracao() {
  const [agora] = useState(() => new Date());
  const [demo] = useState(() => dadosDemonstracao(agora));
  const painel = montarPainel(demo.alunos, demo.eventos, agora);

  return (
    <>
      <div className="flex items-start gap-2 rounded-lg border border-yellow-300 bg-yellow-50 p-3 text-sm text-yellow-800 text-start">
        <AlertTriangle size={16} className="shrink-0 mt-0.5" />
        <span>
          <strong>Demonstração — dados fictícios.</strong> Ligue o login (VITE_LOGIN_ATIVO=true) para ver os alunos reais das suas turmas.
        </span>
      </div>
      <ConteudoPainel painel={painel} agora={agora} aulas={demo.aulas} carregarFalas={async (id) => demo.falas[id] ?? []} />
    </>
  );
}

// Login ligado: alunos cadastrados na turma
function PainelReal() {
  const { turmas, turmaAtual, carregando, escolher } = useTurmas("librascode:turmaProfessor");
  const [dados, setDados] = useState<DadosTurma | null>(null);
  const [agora] = useState(() => new Date());
  const turmaId = turmaAtual?.id;

  useEffect(() => {
    if (!turmaId) return;
    let cancelado = false;
    void carregarTurma(turmaId).then((carregados) => {
      if (!cancelado) setDados(carregados);
    });
    return () => {
      cancelado = true;
    };
  }, [turmaId]);

  if (!carregando && turmas.length === 0) {
    return (
      <div className="flex flex-col gap-3 items-start">
        <p className="text-gray-500">Você ainda não tem turmas.</p>
        <Link to="/professor/turmas" className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white">
          Criar turma
        </Link>
      </div>
    );
  }

  const atualizados = dados && dados.turmaId === turmaId ? dados : null;

  return (
    <>
      {turmas.length > 1 && (
        <select value={turmaId ?? ""} onChange={(e) => escolher(e.target.value)} className="self-start border border-gray-300 rounded-md px-2 py-1 text-sm">
          {turmas.map((turma) => (
            <option key={turma.id} value={turma.id}>
              {turma.nome}
            </option>
          ))}
        </select>
      )}

      {!atualizados ? (
        <p className="text-sm text-gray-400">Carregando dados da turma...</p>
      ) : atualizados.alunos.length === 0 ? (
        <div className="rounded-lg border bg-white p-4 text-sm text-gray-600 text-start">
          Nenhum aluno cadastrado em <strong>{turmaAtual?.nome}</strong> ainda. Compartilhe o código da turma em{" "}
          <Link to="/professor/turmas" className="text-blue-600 underline">
            Minhas turmas
          </Link>{" "}
          para os alunos entrarem.
        </div>
      ) : (
        <ConteudoPainel
          painel={montarPainel(atualizados.alunos, atualizados.eventos, agora)}
          agora={agora}
          aulas={atualizados.aulas}
          carregarFalas={carregarFalasDoBanco}
        />
      )}
    </>
  );
}

export function ProgressoTurma() {
  return (
    <div className="flex flex-col gap-4 bg-slate-50">
      {/* Cabeçalho */}
      <div className="text-start">
        <h1 className="text-black font-bold text-lg">Progresso da Turma</h1>
        <h3 className="text-gray-400 font-semibold">
          Acompanhe o desempenho de cada aluno, as dúvidas e os erros mais comuns da turma
        </h3>
      </div>

      {LOGIN_ATIVO ? <PainelReal /> : <PainelDemonstracao />}
    </div>
  );
}
