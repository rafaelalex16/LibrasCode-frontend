import { Editor, type OnMount } from "@monaco-editor/react";
import { CheckCircle2, Hand, Lightbulb, Loader2, Play, XCircle } from "lucide-react";
import { useState } from "react";
import { explicarErro, textoDoErroParaSinalizar, type ErroExplicado } from "../ide/errosPython";
import { executarPython } from "../ide/executarPython";
import { registrarSugestoesLibras } from "../ide/sugestoesLibras";
import { sinalizar } from "../vlibras/vlibras";
import type { Exercicio, Modulo } from "./conteudo";
import { avaliar, type Avaliacao, type ResultadoCaso } from "./corrigir";
import { registrarTentativa, useProgresso } from "./progresso";

const aoMontarEditor: OnMount = (_editor, monaco) => registrarSugestoesLibras(monaco);

// Exercício de código: roda o programa com as entradas de cada caso e confere a saída
export function ExercicioTrilha({ modulo, exercicio }: { modulo: Modulo; exercicio: Exercicio }) {
  const progresso = useProgresso()[modulo.id]?.exercicios?.[exercicio.id];
  const [codigo, setCodigo] = useState(exercicio.codigoInicial);
  const [executando, setExecutando] = useState(false);
  const [avaliacao, setAvaliacao] = useState<Avaliacao | null>(null);
  const [saida, setSaida] = useState("");
  const [erro, setErro] = useState<ErroExplicado | null>(null);
  const [falhaCarregamento, setFalhaCarregamento] = useState("");
  const [mostrarDica, setMostrarDica] = useState(false);

  const executar = async () => {
    setExecutando(true);
    setAvaliacao(null);
    setErro(null);
    setFalhaCarregamento("");

    const resultados: ResultadoCaso[] = [];
    for (const caso of exercicio.casos) {
      let texto = "";
      const execucao = executarPython(codigo, caso.entradas, { aoEscrever: (t) => (texto += t), aoIniciar: () => {} }, true);
      const resultado = await execucao.resultado;
      if (resultado.falhaCarregamento) {
        setFalhaCarregamento(resultado.falhaCarregamento);
        setExecutando(false);
        return;
      }
      resultados.push({ saida: texto, erro: resultado.erro, tempoEsgotado: resultado.tempoEsgotado });
      // Erro ou laço infinito: não adianta rodar os outros casos
      if (resultado.erro || resultado.tempoEsgotado) break;
    }

    const nova = avaliar(exercicio, codigo, resultados);
    const casoMostrado = resultados[nova.casoComFalha ?? 0];
    setSaida(casoMostrado?.saida ?? "");
    if (casoMostrado?.erro) setErro(explicarErro(casoMostrado.erro));
    setAvaliacao(nova);
    registrarTentativa(modulo.id, exercicio.id, nova.aprovado);
    setExecutando(false);
  };

  return (
    <div className="flex flex-col gap-3 text-start">
      <div className="flex items-start justify-between gap-3">
        <p className="font-semibold text-slate-800">{exercicio.enunciado}</p>
        <button
          onClick={() => sinalizar(exercicio.enunciado)}
          className="shrink-0 flex items-center gap-1 rounded-md bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-200"
        >
          <Hand size={12} />
          Ver em Libras
        </button>
      </div>

      {exercicio.casos.some((caso) => caso.entradas.length > 0) && (
        <p className="text-xs text-gray-500">
          O programa será testado com estas respostas para o input():{" "}
          {exercicio.casos.map((caso) => caso.entradas.join(", ")).join(" | ")}
        </p>
      )}

      <div className="h-[200px] border rounded-md overflow-hidden bg-white pt-2">
        <Editor
          height="100%"
          language="python"
          theme="vs"
          defaultValue={exercicio.codigoInicial}
          onChange={(valor) => setCodigo(valor ?? "")}
          onMount={aoMontarEditor}
          options={{ fontSize: 15, minimap: { enabled: false }, tabSize: 4, scrollBeyondLastLine: false }}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => void executar()}
          disabled={executando}
          className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-60"
        >
          {executando ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
          {executando ? "Conferindo..." : "Executar e conferir"}
        </button>
        <button
          onClick={() => setMostrarDica(!mostrarDica)}
          className="flex items-center gap-1 rounded-md bg-yellow-50 border border-yellow-200 px-3 py-2 text-sm font-semibold text-yellow-700 hover:bg-yellow-100"
        >
          <Lightbulb size={14} />
          Dica
        </button>
        <span className="text-xs text-gray-500">
          {progresso?.concluido
            ? `Concluído em ${progresso.tentativas} tentativa(s)`
            : `Tentativas: ${progresso?.tentativas ?? 0}`}
        </span>
      </div>

      {mostrarDica && (
        <div className="flex items-start justify-between gap-3 rounded-md bg-yellow-50 p-3 text-sm text-yellow-800">
          {exercicio.dica}
          <button onClick={() => sinalizar(exercicio.dica)} className="shrink-0 text-xs font-semibold underline">
            Ver em Libras
          </button>
        </div>
      )}

      {falhaCarregamento && (
        <p className="text-sm font-semibold text-red-600">
          Não foi possível carregar o Python ({falhaCarregamento}). Verifique a internet.
        </p>
      )}

      {avaliacao && (
        <div
          className={`flex flex-col gap-2 rounded-md p-3 text-sm ${
            avaliacao.aprovado ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
          }`}
        >
          <span className="flex items-center gap-2 font-bold">
            {avaliacao.aprovado ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
            {avaliacao.aprovado ? "Parabéns! Exercício concluído." : "Ainda não está certo."}
          </span>
          {avaliacao.motivo && <pre className="font-sans whitespace-pre-wrap">{avaliacao.motivo}</pre>}
          <button
            onClick={() => sinalizar(avaliacao.aprovado ? "Parabéns! Exercício concluído." : avaliacao.motivo ?? "")}
            className="self-start flex items-center gap-1 text-xs font-semibold underline"
          >
            <Hand size={12} />
            Ver em Libras
          </button>
        </div>
      )}

      {erro && (
        <div className="flex flex-col gap-1 rounded-md border border-red-200 p-3 text-sm">
          <span className="font-bold text-red-600">
            {erro.termo?.traducao ?? erro.tipo}
            {erro.linha && ` · linha ${erro.linha}`}
          </span>
          <span className="font-semibold text-blue-700">{erro.explicacao}</span>
          <span className="text-slate-700">O que aconteceu: {erro.mensagemTraduzida}</span>
          <span className="text-slate-700">Dica: {erro.dica}</span>
          <button
            onClick={() => sinalizar(textoDoErroParaSinalizar(erro))}
            className="self-start flex items-center gap-1 text-xs font-semibold text-blue-600 underline"
          >
            <Hand size={12} />
            Sinalizar erro
          </button>
        </div>
      )}

      {avaliacao && !erro && (
        <div>
          <span className="text-xs font-bold text-gray-500">Saída do programa</span>
          <pre className="font-mono text-sm bg-slate-50 border rounded-md p-2 whitespace-pre-wrap min-h-[40px]">{saida || "(nada)"}</pre>
        </div>
      )}
    </div>
  );
}
