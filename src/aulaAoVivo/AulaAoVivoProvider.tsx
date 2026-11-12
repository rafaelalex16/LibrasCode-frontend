import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { URL_WEBSOCKET } from "../config";
import { buscarTermo } from "../glossario/glossario";
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

const CHAVE_HISTORICO = "librascode:historicoAula";
const LIMITE_HISTORICO = 300;
const RECONEXAO_MS = 3000;
const PROFESSOR_FALANDO_MS = 5000;

function carregarHistorico(): MensagemAula[] {
  try {
    const salvo = localStorage.getItem(CHAVE_HISTORICO);
    return salvo ? JSON.parse(salvo) : [];
  } catch {
    return [];
  }
}

// Mensagens do professor: { tipo: "parcial" | "final", texto }. Texto puro é tratado como fala final.
function lerMensagem(dado: string): { tipo: string; texto: string } {
  try {
    const mensagem = JSON.parse(dado);
    if (mensagem && typeof mensagem.texto === "string") {
      return { tipo: mensagem.tipo === "parcial" ? "parcial" : "final", texto: mensagem.texto.trim() };
    }
  } catch {
    // não é JSON
  }
  return { tipo: "final", texto: dado.trim() };
}

// Mantém a conexão da aula ao vivo enquanto o aluno navega pelo portal,
// assim ele pode consultar o glossário ou a IDE sem perder a aula.
export function AulaAoVivoProvider({ children }: { children: ReactNode }) {
  const [conexao, setConexao] = useState<StatusConexao>("conectando");
  const [textoParcial, setTextoParcial] = useState("");
  const [historico, setHistorico] = useState<MensagemAula[]>(carregarHistorico);
  const [ultimaFala, setUltimaFala] = useState(0);
  const [agora, setAgora] = useState(() => Date.now());
  const [pausado, setPausado] = useState(false);
  const [velocidade, setVelocidade] = useState(1);
  const [sinalizacaoAutomatica, setSinalizacaoAutomatica] = useState(true);
  const [fila, setFila] = useState<string[]>([]);

  const sinalizacaoAutomaticaRef = useRef(sinalizacaoAutomatica);
  const contadorMensagens = useRef(0);

  useEffect(() => {
    sinalizacaoAutomaticaRef.current = sinalizacaoAutomatica;
  }, [sinalizacaoAutomatica]);

  // Abre o avatar ao entrar no portal do aluno
  useEffect(() => {
    abrirAvatar();
  }, []);

  // Conexão com o servidor, com reconexão automática
  useEffect(() => {
    let socket: WebSocket;
    let encerrado = false;
    let reconexao: number | undefined;

    const receber = (dado: string) => {
      const { tipo, texto } = lerMensagem(dado);
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
      setHistorico((anterior) => [...anterior, mensagem].slice(-LIMITE_HISTORICO));
      if (sinalizacaoAutomaticaRef.current) setFila((anterior) => [...anterior, texto]);
    };

    const conectar = () => {
      socket = new WebSocket(URL_WEBSOCKET);
      socket.onopen = () => setConexao("conectado");
      socket.onmessage = (evento) => receber(String(evento.data));
      socket.onclose = () => {
        if (encerrado) return;
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
  }, []);

  // Relógio para saber se o professor está falando agora
  useEffect(() => {
    const relogio = window.setInterval(() => setAgora(Date.now()), 1000);
    return () => window.clearInterval(relogio);
  }, []);

  // Histórico persistente para revisão autônoma
  useEffect(() => {
    try {
      localStorage.setItem(CHAVE_HISTORICO, JSON.stringify(historico));
    } catch {
      // armazenamento indisponível: o histórico fica só nesta sessão
    }
  }, [historico]);

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
    // Do mais recente para o mais antigo: termos citados por último aparecem primeiro
    for (const mensagem of [...historico].reverse()) {
      for (const nome of mensagem.termos) {
        const termo = buscarTermo(nome);
        if (!termo) continue;
        const atual = contagem.get(nome);
        if (atual) atual.vezes += 1;
        else contagem.set(nome, { termo, vezes: 1 });
      }
    }
    return [...contagem.values()];
  }, [historico]);

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
