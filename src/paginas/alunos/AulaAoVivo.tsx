import { BookOpen, DotIcon, Hand, History, Pause, Play, Trash2, Volume2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useAulaAoVivo, type StatusConexao } from "../../aulaAoVivo/contextoAula";
import { sinalizarTermo } from "../../aprendizagem/eventos";
import { buscarTermo } from "../../glossario/glossario";
import { abrirAvatar, sinalizar, VELOCIDADES } from "../../vlibras/vlibras";

const STATUS: Record<StatusConexao, { texto: string; cor: string }> = {
  semTurma: { texto: "Entre em uma turma pelo código no menu", cor: "text-gray-400" },
  conectando: { texto: "Conectando à aula...", cor: "text-yellow-500" },
  conectado: { texto: "Aguardando o professor", cor: "text-gray-400" },
  desconectado: { texto: "Sem conexão com a aula", cor: "text-red-500" },
  negado: { texto: "Sem permissão para esta turma", cor: "text-red-500" },
};

export function AulaAoVivo() {
  const {
    conexao,
    professorFalando,
    textoParcial,
    historico,
    pausado,
    frasesNaFila,
    velocidade,
    sinalizacaoAutomatica,
    alternarPausa,
    mudarVelocidade,
    alternarSinalizacaoAutomatica,
    limparHistorico,
  } = useAulaAoVivo();

  const status = professorFalando ? { texto: "Professor falando", cor: "text-green-500" } : STATUS[conexao];
  const ultimaFala = historico[historico.length - 1];

  return (
    <div className="flex flex-col gap-4 bg-slate-100">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between p-4 bg-white border-b border-b-gray-100">
        <div className="flex flex-col justify-between">
          <h1 className="flex flex-col font-bold">Aula ao Vivo</h1>
          <h3 className="flex-col text-xs font-bold text-gray-400">
            Transcrição em tempo real + Libras
          </h3>
        </div>

        <div className={`flex flex-row items-center text-sm py-1 font-semibold ${status.cor}`}>
          <DotIcon size={35} />
          {status.texto}
        </div>
      </div>

      {/* Controles do aluno */}
      <div className="flex flex-wrap items-center gap-3 p-4 bg-white rounded-lg border border-gray-100">
        <button
          onClick={alternarPausa}
          className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold text-white transition ${
            pausado ? "bg-green-600 hover:bg-green-500" : "bg-blue-600 hover:bg-blue-500"
          }`}
        >
          {pausado ? <Play size={14} /> : <Pause size={14} />}
          {pausado ? "Retomar sinalização" : "Pausar sinalização"}
        </button>

        <div className="flex items-center gap-1 text-sm">
          <span className="font-semibold text-gray-600 mr-1">Velocidade</span>
          {VELOCIDADES.map((opcao) => (
            <button
              key={opcao}
              onClick={() => mudarVelocidade(opcao)}
              className={`rounded-md px-2 py-1 font-semibold transition ${
                velocidade === opcao ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-600 hover:bg-blue-200"
              }`}
            >
              {opcao}x
            </button>
          ))}
        </div>

        <label className="flex items-center gap-2 text-sm font-semibold text-gray-600 cursor-pointer">
          <input
            type="checkbox"
            checked={sinalizacaoAutomatica}
            onChange={alternarSinalizacaoAutomatica}
            className="accent-blue-600"
          />
          Sinalizar automaticamente
        </label>

        <button
          onClick={() => abrirAvatar()}
          className="flex items-center gap-2 rounded-md bg-blue-100 px-3 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-200 transition"
        >
          <Hand size={14} />
          Abrir avatar
        </button>

        <Link
          to="/aluno/glossario"
          className="flex items-center gap-2 rounded-md bg-purple-100 px-3 py-2 text-sm font-semibold text-purple-700 hover:bg-purple-200 transition"
        >
          <BookOpen size={14} />
          Consultar glossário
        </Link>

        {(pausado || frasesNaFila > 0) && (
          <p className="w-full text-xs font-semibold text-yellow-600">
            {pausado && "Sinalização pausada — a transcrição continua chegando. "}
            {frasesNaFila > 0 && `${frasesNaFila} fala(s) aguardando sinalização.`}
          </p>
        )}
        <p className="w-full text-xs text-gray-400">
          A aula continua sendo recebida enquanto você consulta o glossário ou a IDE.
        </p>
      </div>

      {/* Transcrição em tempo real */}
      <div className="flex flex-col p-4 bg-white rounded-lg border border-gray-100">
        <h2 className="flex mb-4 font-bold text-sm items-center gap-2">
          <Volume2 size={15} />
          Transcrição em Tempo Real
        </h2>

        <div className="min-h-[80px] text-start">
          {textoParcial ? (
            <p className="text-sm text-slate-500 italic leading-relaxed">{textoParcial}</p>
          ) : ultimaFala ? (
            <p className="text-sm text-slate-700 leading-relaxed">{ultimaFala.texto}</p>
          ) : (
            <p className="text-sm text-slate-400">Aguardando o professor iniciar...</p>
          )}
        </div>
      </div>

      {/* Histórico da aula */}
      <div className="flex flex-col p-4 bg-white rounded-lg border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="flex font-bold text-sm items-center gap-2">
            <History size={15} />
            Histórico da aula ({historico.length})
          </h2>
          <button
            onClick={limparHistorico}
            className="font-semibold text-xs text-gray-500 flex flex-row items-center gap-1 hover:text-red-500"
          >
            <Trash2 size={15} />
            Limpar
          </button>
        </div>

        {historico.length === 0 && (
          <p className="text-sm text-slate-400">As falas do professor ficam guardadas aqui para você revisar.</p>
        )}

        <div className="flex flex-col gap-2 max-h-[420px] overflow-y-auto">
          {[...historico].reverse().map((mensagem) => (
            <div key={mensagem.id} className="border border-gray-100 rounded-lg p-3 flex flex-col gap-2">
              <div className="flex items-start justify-between gap-3">
                <div className="text-start">
                  <span className="text-[10px] font-bold text-gray-400">{mensagem.horario}</span>
                  <p className="text-sm text-slate-700">{mensagem.texto}</p>
                </div>
                <button
                  onClick={() => sinalizar(mensagem.texto)}
                  title="Sinalizar esta fala novamente"
                  className="shrink-0 flex items-center gap-1 rounded-md bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-200"
                >
                  <Hand size={12} />
                  Sinalizar
                </button>
              </div>

              {mensagem.termos.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {mensagem.termos.map((nome) => {
                    const termo = buscarTermo(nome);
                    if (!termo) return null;
                    return (
                      <button
                        key={nome}
                        onClick={() => sinalizarTermo(termo, "aula")}
                        title={termo.explicacaoSOV}
                        className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-semibold text-purple-700 hover:bg-purple-200"
                      >
                        {termo.termo}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
