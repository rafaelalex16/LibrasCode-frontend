import { Editor, type Monaco, type OnMount } from "@monaco-editor/react";
import { AlertTriangle, FileText, Hand, Keyboard, Loader2, Play, Square, Terminal } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { buscarTermo, textoParaSinalizar, type TermoGlossario } from "../../glossario/glossario";
import { explicarErro, textoDoErroParaSinalizar, type ErroExplicado } from "../../ide/errosPython";
import { executarPython, type ResultadoExecucao } from "../../ide/executarPython";
import { resumirCodigo } from "../../ide/resumoCodigo";
import { buscarTermoDeCodigo, registrarSugestoesLibras } from "../../ide/sugestoesLibras";
import { sinalizar } from "../../vlibras/vlibras";

type Aba = "terminal" | "erro" | "resumo" | "entradas";
type Estado = "parado" | "carregando" | "executando";
type EditorMonaco = Parameters<OnMount>[0];

const CHAVE_CODIGO = "librascode:codigoIDE";
const LIMITE_SAIDA = 20000;
const CODIGO_EXEMPLO = `# Bem-vindo à IDE do LibrasCode!
nome = input("Qual é o seu nome? ")
print("Olá,", nome)

for numero in range(1, 4):
    print("Contando:", numero)
`;

function carregarCodigo() {
  try {
    return localStorage.getItem(CHAVE_CODIGO) ?? CODIGO_EXEMPLO;
  } catch {
    return CODIGO_EXEMPLO;
  }
}

// Laço infinito não gera traceback: a explicação é montada a partir do glossário
function erroTempoEsgotado(): ErroExplicado {
  const termo = buscarTermo("laço infinito");
  return {
    tipo: "Tempo esgotado",
    mensagemOriginal: "a execução passou de 10 segundos",
    mensagemTraduzida: "a execução passou de 10 segundos",
    termo,
    explicacao: termo?.explicacaoSOV ?? "",
    dica: "Confira se a condição do while fica falsa em algum momento, ou use break para sair do laço.",
    traceback: "",
  };
}

export function IDE() {
  const [codigo, setCodigo] = useState(carregarCodigo);
  const [entradas, setEntradas] = useState("Ana");
  const [saida, setSaida] = useState("");
  const [estado, setEstado] = useState<Estado>("parado");
  const [erro, setErro] = useState<ErroExplicado | null>(null);
  const [aba, setAba] = useState<Aba>("terminal");
  const [termoAtual, setTermoAtual] = useState<TermoGlossario | null>(null);
  const [sinalizacaoAutomatica, setSinalizacaoAutomatica] = useState(false);

  const editorRef = useRef<EditorMonaco | null>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const execucaoRef = useRef<{ parar: () => void } | null>(null);
  const ultimoSinalizado = useRef<string | null>(null);
  const saidaPendente = useRef("");
  const atualizacaoSaida = useRef<number | undefined>(undefined);

  const resumos = useMemo(() => resumirCodigo(codigo), [codigo]);

  // Interrompe a execução ao sair da tela
  useEffect(() => () => execucaoRef.current?.parar(), []);

  // Sinaliza em Libras o termo em que o aluno está digitando
  useEffect(() => {
    if (!sinalizacaoAutomatica || !termoAtual || ultimoSinalizado.current === termoAtual.termo) return;
    const espera = window.setTimeout(() => {
      ultimoSinalizado.current = termoAtual.termo;
      sinalizar(textoParaSinalizar(termoAtual));
    }, 1000);
    return () => window.clearTimeout(espera);
  }, [termoAtual, sinalizacaoAutomatica]);

  const aoMontarEditor: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    registrarSugestoesLibras(monaco);

    editor.onDidChangeCursorPosition((evento) => {
      const palavra = editor.getModel()?.getWordAtPosition(evento.position);
      setTermoAtual((palavra && buscarTermoDeCodigo(palavra.word)) || null);
    });
  };

  const limparMarcadores = () => {
    const modelo = editorRef.current?.getModel();
    if (modelo && monacoRef.current) monacoRef.current.editor.setModelMarkers(modelo, "librascode", []);
  };

  const marcarErro = (explicado: ErroExplicado) => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    const modelo = editor?.getModel();
    if (!editor || !monaco || !modelo || !explicado.linha || explicado.linha > modelo.getLineCount()) return;

    monaco.editor.setModelMarkers(modelo, "librascode", [
      {
        startLineNumber: explicado.linha,
        endLineNumber: explicado.linha,
        startColumn: 1,
        endColumn: modelo.getLineMaxColumn(explicado.linha),
        message: `${explicado.termo?.traducao ?? explicado.tipo}: ${explicado.explicacao} ${explicado.dica}`,
        severity: monaco.MarkerSeverity.Error,
      },
    ]);
    editor.revealLineInCenter(explicado.linha);
  };

  const irParaLinha = (linha: number) => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.revealLineInCenter(linha);
    editor.setPosition({ lineNumber: linha, column: 1 });
    editor.focus();
  };

  const mostrarErro = (explicado: ErroExplicado) => {
    setErro(explicado);
    setAba("erro");
    marcarErro(explicado);
    if (sinalizacaoAutomatica) sinalizar(textoDoErroParaSinalizar(explicado));
  };

  // A saída é juntada e mostrada a cada 100 ms para a tela não travar com muitos print()
  const descarregarSaida = () => {
    window.clearTimeout(atualizacaoSaida.current);
    atualizacaoSaida.current = undefined;
    const novo = saidaPendente.current;
    saidaPendente.current = "";
    if (!novo) return;
    setSaida((anterior) => {
      const completo = anterior + novo;
      return completo.length > LIMITE_SAIDA
        ? `[... início da saída cortado ...]\n${completo.slice(-LIMITE_SAIDA)}`
        : completo;
    });
  };

  const escreverSaida = (texto: string) => {
    saidaPendente.current += texto;
    atualizacaoSaida.current ??= window.setTimeout(descarregarSaida, 100);
  };

  const executar = async () => {
    limparMarcadores();
    setErro(null);
    setSaida("");
    setAba("terminal");
    setEstado("carregando");

    let resultado: ResultadoExecucao;
    try {
      const execucao = executarPython(codigo, entradas === "" ? [] : entradas.split("\n"), {
        aoEscrever: escreverSaida,
        aoIniciar: () => setEstado("executando"),
      });
      execucaoRef.current = execucao;
      resultado = await execucao.resultado;
    } catch (falha) {
      // Ex.: navegador sem suporte a workers de módulo
      resultado = { falhaCarregamento: falha instanceof Error ? falha.message : String(falha) };
    }
    execucaoRef.current = null;
    descarregarSaida();
    setEstado("parado");

    if (resultado.falhaCarregamento) {
      setSaida(`Não foi possível carregar o Python (${resultado.falhaCarregamento}).\nVerifique a conexão com a internet e tente novamente.`);
    } else if (resultado.interrompido) {
      setSaida((anterior) => `${anterior}\n[Execução interrompida]`);
    } else if (resultado.tempoEsgotado) {
      setSaida((anterior) => `${anterior}\n[Execução interrompida: passou de 10 segundos]`);
      mostrarErro(erroTempoEsgotado());
    } else if (resultado.erro) {
      const explicado = explicarErro(resultado.erro);
      setSaida((anterior) => `${anterior}${explicado.traceback}`);
      mostrarErro(explicado);
    } else {
      setSaida((anterior) => `${anterior}\n[Programa finalizado]`);
    }
  };

  const alterarCodigo = (valor = "") => {
    setCodigo(valor);
    limparMarcadores();
    try {
      localStorage.setItem(CHAVE_CODIGO, valor);
    } catch {
      // sem armazenamento: o código fica só nesta sessão
    }
  };

  const abas: { id: Aba; nome: string; icone: typeof Terminal }[] = [
    { id: "terminal", nome: "Terminal", icone: Terminal },
    { id: "erro", nome: "Erro em Libras", icone: AlertTriangle },
    { id: "resumo", nome: "Resumo do código", icone: FileText },
    { id: "entradas", nome: "Entradas (input)", icone: Keyboard },
  ];

  return (
    <div className="h-[calc(100vh-3rem)] flex flex-col gap-3 overflow-hidden bg-slate-100">
      {/* Cabeçalho */}
      <header className="flex flex-row items-center justify-between p-4 bg-white border-b border-b-gray-100">
        <h1 className="font-semibold">LibrasCode IDE</h1>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={sinalizacaoAutomatica}
              onChange={() => setSinalizacaoAutomatica(!sinalizacaoAutomatica)}
              className="accent-blue-600"
            />
            Sinalizar automaticamente
          </label>

          {estado === "parado" ? (
            <button
              onClick={executar}
              className="flex flex-row items-center gap-2 rounded-md bg-blue-600 text-sm py-1 p-4 font-semibold text-white hover:bg-blue-400 transition"
            >
              <Play size={14} />
              Executar
            </button>
          ) : (
            <button
              onClick={() => execucaoRef.current?.parar()}
              className="flex flex-row items-center gap-2 rounded-md bg-red-600 text-sm py-1 p-4 font-semibold text-white hover:bg-red-500 transition"
            >
              {estado === "carregando" ? <Loader2 size={14} className="animate-spin" /> : <Square size={14} />}
              {estado === "carregando" ? "Carregando Python..." : "Parar"}
            </button>
          )}
        </div>
      </header>

      {/* Sinal em Libras do termo em que o cursor está */}
      <div className="flex items-center justify-between gap-3 px-4 py-2 bg-white rounded-lg border border-gray-100 min-h-[52px]">
        {termoAtual ? (
          <>
            <div className="flex items-center gap-2 text-sm text-start">
              <span className="font-mono font-bold text-blue-600">{termoAtual.termo}</span>
              <span className="text-gray-400">({termoAtual.traducao})</span>
              <span className="text-gray-700 font-medium">{termoAtual.explicacaoSOV}</span>
            </div>
            <button
              onClick={() => sinalizar(textoParaSinalizar(termoAtual))}
              className="shrink-0 flex items-center gap-1 rounded-md bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-200"
            >
              <Hand size={12} />
              Sinalizar
            </button>
          </>
        ) : (
          <span className="text-xs text-gray-400">
            Coloque o cursor sobre um comando (ex.: print, for, while) para ver a explicação em Libras.
            Digite para receber sugestões com o significado de cada comando.
          </span>
        )}
      </div>

      {/* Editor */}
      <div className="flex-1 min-h-[220px] pt-3 bg-white rounded-lg">
        <Editor
          height="100%"
          language="python"
          theme="vs"
          defaultValue={codigo}
          onChange={alterarCodigo}
          onMount={aoMontarEditor}
          options={{ fontSize: 16, minimap: { enabled: false }, tabSize: 4 }}
        />
      </div>

      {/* Painel inferior */}
      <div className="h-[240px] bg-white border border-slate-200 flex flex-col shadow-sm rounded-xl">
        <div className="border-b flex items-center px-2 gap-1">
          {abas.map(({ id, nome, icone: Icone }) => (
            <button
              key={id}
              onClick={() => setAba(id)}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium border-b-2 transition ${
                aba === id ? "border-blue-600 text-blue-600" : "border-transparent text-slate-600 hover:text-blue-600"
              }`}
            >
              <Icone size={15} className={id === "erro" && erro ? "text-red-500" : undefined} />
              {nome}
              {id === "erro" && erro && <span className="w-2 h-2 rounded-full bg-red-500" />}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4 text-start">
          {aba === "terminal" && (
            <pre className="font-mono text-sm whitespace-pre-wrap text-slate-800">
              {saida || <span className="text-gray-400">Clique em Executar para rodar o código.</span>}
            </pre>
          )}

          {aba === "erro" &&
            (erro ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-bold text-red-600">
                    {erro.termo?.traducao ?? erro.tipo}
                    {erro.linha && <span className="text-slate-500 font-semibold"> · linha {erro.linha}</span>}
                    <span className="ml-2 font-mono text-xs text-slate-400">{erro.tipo}</span>
                  </h3>
                  <div className="flex gap-2 shrink-0">
                    {erro.linha && (
                      <button
                        onClick={() => irParaLinha(erro.linha!)}
                        className="rounded-md bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-200"
                      >
                        Ir para a linha
                      </button>
                    )}
                    <button
                      onClick={() => sinalizar(textoDoErroParaSinalizar(erro))}
                      className="flex items-center gap-1 rounded-md bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-200"
                    >
                      <Hand size={12} />
                      Sinalizar erro
                    </button>
                  </div>
                </div>

                <div className="rounded-lg bg-blue-50 p-3 text-sm font-semibold text-blue-700">{erro.explicacao}</div>
                <p className="text-sm text-slate-700">
                  <span className="font-semibold">O que aconteceu:</span> {erro.mensagemTraduzida}
                </p>
                <p className="text-sm text-slate-700">
                  <span className="font-semibold">Dica:</span> {erro.dica}
                </p>
                {erro.traceback && (
                  <details className="text-xs text-slate-500">
                    <summary className="cursor-pointer">Mensagem original do Python</summary>
                    <pre className="font-mono whitespace-pre-wrap mt-2">{erro.traceback}</pre>
                  </details>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-400">Nenhum erro na última execução.</p>
            ))}

          {aba === "resumo" && (
            <div className="flex flex-col gap-1">
              {resumos.length > 0 && (
                <button
                  onClick={() => sinalizar(resumos.map((r) => r.resumo).join(" "))}
                  className="self-end mb-2 flex items-center gap-1 rounded-md bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-200"
                >
                  <Hand size={12} />
                  Sinalizar resumo completo
                </button>
              )}
              {resumos.length === 0 && <p className="text-sm text-gray-400">Escreva código para ver o resumo.</p>}
              {resumos.map((resumo) => (
                <button
                  key={resumo.linha}
                  onClick={() => {
                    irParaLinha(resumo.linha);
                    sinalizar(resumo.resumo);
                  }}
                  style={{ paddingLeft: `${resumo.nivel * 20 + 8}px` }}
                  className="flex items-start gap-3 rounded-md py-1 pr-2 text-left text-sm hover:bg-blue-50"
                >
                  <span className="font-mono text-xs text-gray-400 w-8 shrink-0 pt-0.5">{resumo.linha}</span>
                  <span className="text-slate-700">{resumo.resumo}</span>
                </button>
              ))}
            </div>
          )}

          {aba === "entradas" && (
            <div className="flex flex-col gap-2 h-full">
              <p className="text-xs text-gray-500">
                Cada linha é a resposta de um <span className="font-mono">input()</span>, na ordem em que o programa pergunta.
              </p>
              <textarea
                value={entradas}
                onChange={(evento) => setEntradas(evento.target.value)}
                className="flex-1 min-h-[100px] font-mono text-sm border border-slate-200 rounded-md p-2 outline-none focus:border-blue-400"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
