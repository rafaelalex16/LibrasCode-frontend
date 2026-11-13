import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { LOGIN_ATIVO, URL_WEBSOCKET } from "../config";
import { supabase } from "../supabase/cliente";
import { useGlossario } from "../glossario/carregarGlossario";
import { detectarTermos } from "../glossario/detectarTermos";
import {
  abrirAvatar,
  avatarLivre,
  definirVelocidade,
  pausarAvatar,
  retomarAvatar,
  sinalizar,
} from "../vlibras/vlibras";
import {
  AulaContext,
  type MensagemAula,
  type StatusConexao,
  type TermoDetectado,
} from "./contextoAula";

const LIMITE_HISTORICO = 300;
const RECONEXAO_MS = 3000;
const PROFESSOR_FALANDO_MS = 5000;
const SEM_PERMISSAO = 1008;
// Com o login desligado o histórico fica guardado só neste navegador
const CHAVE_HISTORICO = "librascode:historicoAula";

function carregarHistoricoLocal(): MensagemAula[] {
  if (LOGIN_ATIVO) return [];
  try {
    const salvo = localStorage.getItem(CHAVE_HISTORICO);
    return salvo ? JSON.parse(salvo) : [];
  } catch {
    return [];
  }
}

interface FalaDoBanco {
  id: number;
  texto: string;
  termos: string[];
  criado_em: string;
}

function falaParaMensagem(fala: FalaDoBanco): MensagemAula {
  return {
    id: `banco-${fala.id}`,
    texto: fala.texto,
    horario: new Date(fala.criado_em).toLocaleTimeString("pt-BR"),
    termos: fala.termos,
  };
}

// Mensagens do professor: { tipo: "parcial" | "final", texto, aula_id }. Texto puro é tratado como fala final.
function lerMensagem(dado: string): { tipo: string; texto: string; aulaId: string | null } {
  try {
    const mensagem = JSON.parse(dado);
    if (mensagem && typeof mensagem.texto === "string") {
      return {
        tipo: mensagem.tipo === "parcial" ? "parcial" : "final",
        texto: mensagem.texto.trim(),
        aulaId: typeof mensagem.aula_id === "string" ? mensagem.aula_id : null,
      };
    }
  } catch {
    // não é JSON
  }
  return { tipo: "final", texto: dado.trim(), aulaId: null };
}

// Mantém a conexão da aula ao vivo da turma enquanto o aluno navega pelo portal,
// assim ele pode consultar o glossário ou a IDE sem perder a aula.
export function AulaAoVivoProvider({ turmaId, children }: { turmaId: string | null; children: ReactNode }) {
  const [conexao, setConexao] = useState<StatusConexao>(turmaId ? "conectando" : "semTurma");
  const [textoParcial, setTextoParcial] = useState("");
  const [historico, setHistorico] = useState<MensagemAula[]>(carregarHistoricoLocal);
  const [ultimaFala, setUltimaFala] = useState(0);
  const [agora, setAgora] = useState(() => Date.now());
  const [pausado, setPausado] = useState(false);
  const [velocidade, setVelocidade] = useState(1);
  const [sinalizacaoAutomatica, setSinalizacaoAutomatica] = useState(true);
  const [fila, setFila] = useState<string[]>([]);

  const glossario = useGlossario();
  const sinalizacaoAutomaticaRef = useRef(sinalizacaoAutomatica);
  const contadorMensagens = useRef(0);
  const aulaAtual = useRef<string | null>(null);

  useEffect(() => {
    sinalizacaoAutomaticaRef.current = sinalizacaoAutomatica;
  }, [sinalizacaoAutomatica]);

  // Abre o avatar ao entrar no portal do aluno
  useEffect(() => {
    abrirAvatar();
  }, []);

  // Histórico da aula mais recente da turma, guardado no banco
  useEffect(() => {
    if (!turmaId || !LOGIN_ATIVO) return;
    let cancelado = false;

    void (async () => {
      const { data: aula } = await supabase
        .from("aulas")
        .select("id")
        .eq("turma_id", turmaId)
        .order("iniciada_em", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (cancelado || !aula) return;

      const { data: falas } = await supabase
        .from("falas")
        .select("id, texto, termos, criado_em")
        .eq("aula_id", aula.id)
        .order("criado_em")
        .limit(LIMITE_HISTORICO);
      if (cancelado) return;

      aulaAtual.current = aula.id;
      const doBanco = ((falas ?? []) as FalaDoBanco[]).map(falaParaMensagem);
      // Falas que chegaram pelo WebSocket enquanto o banco respondia continuam no fim
      setHistorico((recebidas) => [...doBanco, ...recebidas.filter((m) => !doBanco.some((b) => b.texto === m.texto))]);
    })();

    return () => {
      cancelado = true;
    };
  }, [turmaId]);

  // Conexão com a sala da turma no servidor, com reconexão automática
  useEffect(() => {
    if (!turmaId) return;
    let socket: WebSocket;
    let encerrado = false;
    let reconexao: number | undefined;

    const receber = (dado: string) => {
      const { tipo, texto, aulaId } = lerMensagem(dado);
      setUltimaFala(Date.now());

      if (tipo === "parcial") {
        setTextoParcial(texto);
        return;
      }
      setTextoParcial("");
      if (!texto) return;

      contadorMensagens.current += 1;
      const mensagem: MensagemAula = {
        id: `${Date.now()}-${contadorMensagens.current}`,
        texto,
        horario: new Date().toLocaleTimeString("pt-BR"),
        termos: detectarTermos(texto).map((t) => t.termo),
      };

      // O professor começou uma aula nova: o histórico recomeça
      const aulaNova = aulaId !== null && aulaId !== aulaAtual.current;
      if (aulaId) aulaAtual.current = aulaId;
      setHistorico((anterior) => (aulaNova ? [mensagem] : [...anterior, mensagem].slice(-LIMITE_HISTORICO)));
      if (sinalizacaoAutomaticaRef.current) setFila((anterior) => [...anterior, texto]);
    };

    const conectar = () => {
      socket = new WebSocket(`${URL_WEBSOCKET}/${turmaId}`);
      socket.onopen = async () => {
        // A primeira mensagem identifica o aluno; com login, o servidor confere o token e a turma
        const token = LOGIN_ATIVO ? (await supabase.auth.getSession()).data.session?.access_token ?? "" : "";
        socket.send(JSON.stringify({ tipo: "auth", token, papel: "aluno" }));
        setConexao("conectado");
      };
      socket.onmessage = (evento) => receber(String(evento.data));
      socket.onclose = (evento) => {
        if (encerrado) return;
        if (evento.code === SEM_PERMISSAO) {
          setConexao("negado");
          return;
        }
        setConexao("desconectado");
        reconexao = window.setTimeout(() => {
          setConexao("conectando");
          conectar();
        }, RECONEXAO_MS);
      };
    };

    conectar();
    return () => {
      encerrado = true;
      window.clearTimeout(reconexao);
      socket.close();
    };
  }, [turmaId]);

  // Sem login: guarda o histórico neste navegador para revisão
  useEffect(() => {
    if (LOGIN_ATIVO) return;
    try {
      localStorage.setItem(CHAVE_HISTORICO, JSON.stringify(historico));
    } catch {
      // armazenamento indisponível: o histórico fica só nesta sessão
    }
  }, [historico]);

  // Relógio para saber se o professor está falando agora
  useEffect(() => {
    const relogio = window.setInterval(() => setAgora(Date.now()), 1000);
    return () => window.clearInterval(relogio);
  }, []);

  // Envia as falas ao avatar uma por vez, respeitando a pausa do aluno
  useEffect(() => {
    if (pausado || fila.length === 0) return;
    const envio = window.setInterval(() => {
      if (!avatarLivre()) return;
      sinalizar(fila[0]);
      setFila((anterior) => anterior.slice(1));
    }, 400);
    return () => window.clearInterval(envio);
  }, [pausado, fila]);

  const termosDetectados = useMemo(() => {
    const contagem = new Map<string, TermoDetectado>();
    const porNome = new Map(glossario.map((t) => [t.termo, t]));
    // Do mais recente para o mais antigo: termos citados por último aparecem primeiro
    for (const mensagem of [...historico].reverse()) {
      for (const nome of mensagem.termos) {
        const termo = porNome.get(nome);
        if (!termo) continue;
        const atual = contagem.get(nome);
        if (atual) atual.vezes += 1;
        else contagem.set(nome, { termo, vezes: 1 });
      }
    }
    return [...contagem.values()];
  }, [historico, glossario]);

  const alternarPausa = useCallback(() => {
    if (pausado) retomarAvatar();
    else pausarAvatar();
    setPausado(!pausado);
  }, [pausado]);

  const mudarVelocidade = useCallback((nova: number) => {
    definirVelocidade(nova);
    setVelocidade(nova);
  }, []);

  const alternarSinalizacaoAutomatica = useCallback(() => {
    if (sinalizacaoAutomatica) setFila([]);
    setSinalizacaoAutomatica(!sinalizacaoAutomatica);
  }, [sinalizacaoAutomatica]);

  const limparHistorico = useCallback(() => {
    setHistorico([]);
    setTextoParcial("");
  }, []);

  const valor = {
    conexao,
    professorFalando: conexao === "conectado" && agora - ultimaFala < PROFESSOR_FALANDO_MS,
    textoParcial,
    historico,
    termosDetectados,
    pausado,
    frasesNaFila: fila.length,
    velocidade,
    sinalizacaoAutomatica,
    alternarPausa,
    mudarVelocidade,
    alternarSinalizacaoAutomatica,
    limparHistorico,
  };

  return <AulaContext.Provider value={valor}>{children}</AulaContext.Provider>;
}
