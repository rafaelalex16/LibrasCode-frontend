import { Mic, Send, Square, Trash2 } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { LOGIN_ATIVO, SALA_SEM_LOGIN, URL_WEBSOCKET } from "../../config";
import { detectarTermos } from "../../glossario/detectarTermos";
import { supabase } from "../../supabase/cliente";
import { traduzirErro } from "../../supabase/tipos";
import { useTurmas } from "../../turmas/useTurmas";

// Tipos mínimos da API de reconhecimento de voz do navegador
interface ResultadoFala {
  isFinal: boolean;
  0: { transcript: string };
}
interface EventoFala {
  resultIndex: number;
  results: ArrayLike<ResultadoFala>;
}
interface ReconhecimentoFala {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((evento: EventoFala) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => ReconhecimentoFala;
    webkitSpeechRecognition?: new () => ReconhecimentoFala;
  }
}

type StatusSala = "conectando" | "conectado" | "desconectado" | "negado";

const TEXTO_STATUS: Record<StatusSala, string> = {
  conectando: "Conectando à sala da turma...",
  conectado: "Sala da turma conectada",
  desconectado: "Sem conexão com o servidor da aula",
  negado: "Sem permissão para transmitir nesta turma",
};

export function GravarAulaProfessor() {
  const { turmas, turmaAtual, carregando, escolher } = useTurmas("librascode:turmaProfessor");
  const [gravando, setGravando] = useState(false);
  const [texto, setTexto] = useState("");
  const [anotacao, setAnotacao] = useState("");
  const [aulaId, setAulaId] = useState<string | null>(null);
  const [statusSala, setStatusSala] = useState<StatusSala>("conectando");
  const [erro, setErro] = useState("");

  const websocket = useRef<WebSocket | null>(null);
  const reconhecimento = useRef<ReconhecimentoFala | null>(null);
  const aulaRef = useRef<string | null>(null);
  const gravandoRef = useRef(false);

  // Com o login desligado todos ficam na mesma sala
  const turmaId = LOGIN_ATIVO ? turmaAtual?.id ?? null : SALA_SEM_LOGIN;
  const suportaVoz = Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);

  // Envia um trecho para os alunos e, se for fala final, guarda no histórico da aula
  const transmitir = (tipo: "parcial" | "final", trecho: string) => {
    const limpo = trecho.trim();
    if (!limpo || !aulaRef.current) return;
    if (websocket.current?.readyState === WebSocket.OPEN) {
      websocket.current.send(JSON.stringify({ tipo, texto: limpo, aula_id: aulaRef.current }));
    }
    if (tipo === "final" && LOGIN_ATIVO) {
      void supabase
        .from("falas")
        .insert({ aula_id: aulaRef.current, texto: limpo, termos: detectarTermos(limpo).map((t) => t.termo) })
        .then(({ error }) => error && setErro(`A fala não foi salva no histórico: ${traduzirErro(error.message)}`));
    }
  };
  const transmitirRef = useRef(transmitir);
  useEffect(() => {
    transmitirRef.current = transmitir;
  });

  // Conexão com a sala da turma no servidor
  useEffect(() => {
    if (!turmaId) return;
    let encerrado = false;
    let reconexao: number | undefined;

    const conectar = () => {
      const socket = new WebSocket(`${URL_WEBSOCKET}/${turmaId}`);
      websocket.current = socket;
      socket.onopen = async () => {
        // A primeira mensagem identifica o professor; com login, o servidor confere o token e a turma
        const token = LOGIN_ATIVO ? (await supabase.auth.getSession()).data.session?.access_token ?? "" : "";
        socket.send(JSON.stringify({ tipo: "auth", token, papel: "professor" }));
        setStatusSala("conectado");
      };
      socket.onclose = (evento) => {
        if (encerrado) return;
        if (evento.code === 1008) return setStatusSala("negado");
        setStatusSala("desconectado");
        reconexao = window.setTimeout(() => {
          setStatusSala("conectando");
          conectar();
        }, 3000);
      };
    };

    conectar();
    return () => {
      encerrado = true;
      window.clearTimeout(reconexao);
      websocket.current?.close();
      websocket.current = null;
    };
  }, [turmaId]);

  // Reconhecimento de voz em português
  useEffect(() => {
    const ReconhecimentoDeFala = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!ReconhecimentoDeFala) return;

    const fala = new ReconhecimentoDeFala();
    fala.lang = "pt-BR";
    fala.continuous = true;
    fala.interimResults = true;

    fala.onresult = (evento) => {
      // junta todas as palavras formando frases prontas
      let textoCompleto = "";
      for (let i = 0; i < evento.results.length; i++) {
        textoCompleto += evento.results[i][0].transcript;
      }
      setTexto(textoCompleto);

      // Envia só os trechos novos: "parcial" enquanto o professor fala, "final" quando a frase termina
      for (let i = evento.resultIndex; i < evento.results.length; i++) {
        const resultado = evento.results[i];
        transmitirRef.current(resultado.isFinal ? "final" : "parcial", resultado[0].transcript);
      }
    };

    // O navegador encerra o reconhecimento depois de um silêncio: recomeça se ainda estiver gravando
    fala.onend = () => {
      if (gravandoRef.current) fala.start();
    };

    reconhecimento.current = fala;
    return () => {
      gravandoRef.current = false;
      fala.stop();
    };
  }, []);

  const iniciarAula = async () => {
    if (aulaRef.current) return aulaRef.current;
    if (!turmaId) return null;

    // Sem login a aula não vai para o banco: só identifica a aula atual para os alunos
    if (!LOGIN_ATIVO) {
      aulaRef.current = crypto.randomUUID();
      setAulaId(aulaRef.current);
      return aulaRef.current;
    }

    const { data, error } = await supabase.from("aulas").insert({ turma_id: turmaId }).select("id").single();
    if (error) {
      setErro(`Não foi possível iniciar a aula: ${traduzirErro(error.message)}`);
      return null;
    }
    aulaRef.current = data.id;
    setAulaId(data.id);
    return data.id as string;
  };

  const alternarGravacao = async () => {
    if (!reconhecimento.current) return;
    setErro("");

    if (gravando) {
      gravandoRef.current = false;
      reconhecimento.current.stop();
      setGravando(false);
      return;
    }
    if (!(await iniciarAula())) return;
    gravandoRef.current = true;
    reconhecimento.current.start();
    setGravando(true);
  };

  const encerrarAula = async () => {
    if (gravando) await alternarGravacao();
    if (aulaRef.current && LOGIN_ATIVO) {
      await supabase.from("aulas").update({ encerrada_em: new Date().toISOString() }).eq("id", aulaRef.current);
    }
    aulaRef.current = null;
    setAulaId(null);
    setTexto("");
  };

  const enviarAnotacao = async (evento: FormEvent) => {
    evento.preventDefault();
    if (!anotacao.trim() || !(await iniciarAula())) return;
    transmitir("final", anotacao);
    setTexto((anterior) => `${anterior} ${anotacao.trim()}`.trim());
    setAnotacao("");
  };

  if (LOGIN_ATIVO && !carregando && turmas.length === 0) {
    return (
      <div className="flex flex-col gap-3 items-start">
        <h1 className="font-bold text-lg">Modo Aula</h1>
        <p className="text-gray-500">Crie uma turma primeiro para transmitir a aula aos alunos.</p>
        <Link to="/professor/turmas" className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white">
          Criar turma
        </Link>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-slate-50">
      {/* Cabeçalho */}
      <div className="bg-slate-50 flex items-start justify-between gap-4 mb-5">
        <div>
          <h1 className="font-bold text-lg ml-12">Modo Aula</h1>
          <h3 className="text-gray-500 font-semiboldm ml-12">
            Sua fala é convertida em texto em tempo real para os alunos acompanharem
          </h3>
        </div>

        <div className="flex flex-col items-end gap-1 text-sm">
          {LOGIN_ATIVO && (
          <select
            value={turmaId ?? ""}
            disabled={aulaId !== null}
            onChange={(e) => escolher(e.target.value)}
            className="border border-gray-300 rounded-md px-2 py-1"
          >
            {turmas.map((turma) => (
              <option key={turma.id} value={turma.id}>
                {turma.nome}
              </option>
            ))}
          </select>
          )}
          <span className={`text-xs font-semibold ${statusSala === "conectado" ? "text-green-600" : "text-red-500"}`}>
            {TEXTO_STATUS[statusSala]}
          </span>
        </div>
      </div>

      {erro && <p className="mb-3 text-sm font-semibold text-red-600">{erro}</p>}

      {/* Conteudo 1 (MICROFONE) */}
      <div className="w-full h-[40%] bg-white border border-gray-200 gap-2 items-center mb-12 flex flex-col justify-center rounded-lg ">
        {suportaVoz ? (
          <>
            <button onClick={() => void alternarGravacao()}>
              <div
                style={{ backgroundColor: gravando ? "red" : "blue" }}
                className="w-20 h-20 flex items-center justify-center rounded-full bg-red-600 "
              >
                <Mic className="text-white" size={30} />
              </div>
            </button>
            <h3 style={{ color: gravando ? "red" : "blue" }} className="font-bold">
              {gravando ? "Gravando — clique para parar " : aulaId ? "Aula pausada — clique para continuar" : "Clique para iniciar a aula"}
            </h3>
          </>
        ) : (
          <p className="text-gray-500 px-6 text-center">
            Este navegador não reconhece voz. Use o Google Chrome ou o Microsoft Edge, ou escreva as anotações abaixo.
          </p>
        )}

        {aulaId && (
          <button
            onClick={() => void encerrarAula()}
            className="flex items-center gap-1 rounded-md border border-gray-300 px-3 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-100"
          >
            <Square size={12} />
            Encerrar aula
          </button>
        )}
      </div>

      <div
        className="w-full h-[60%] bg-white border border-gray-200 gap-2 mb-12 flex flex-col
              rounded-lg "
      >
        <div className="border-b border-gray-200 p-4 flex items-center justify-between">
          <h3 className="flex font-bold text-start ">Transcrição da Aula</h3>
          <button onClick={() => setTexto("")}>
            <h4 className="font-semibold text-xs text-gray-500 flex flex-row gap-1 ">
              <Trash2 className="text-gray-500" size={15} />
              Limpar
            </h4>
          </button>
        </div>

        {/* Conteudo 2 (transcrição da aula escrita)*/}
        <div className="w-[100%] h-[60%] bg-white flex flex-col items-start rounded-lg overflow-y-auto">
          <div className="text-gray-400 text-bold text-sm-2 mt-3 mb-3 ml-8 mr-2">{texto}</div>
        </div>

        {/* Escrita manual: também vai para os alunos e para o histórico */}
        <form onSubmit={enviarAnotacao} className="gap-2 flex items-center justify-between">
          <input
            value={anotacao}
            onChange={(e) => setAnotacao(e.target.value)}
            maxLength={2000}
            placeholder="Adicionar anotação manualmente..."
            className="w-full mt-6 ml-7 mb-4 px-3 py-3 bg-white border border-gray-100 shadow-md rounded-lg outline-none focus:border-blue-400"
          />
          <button
            type="submit"
            className="w-24 h-12 ml-1 mr-5 mt-2 rounded-lg text-white bg-blue-600 flex items-center justify-center"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
