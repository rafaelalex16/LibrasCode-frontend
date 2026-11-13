import { createContext, useContext } from "react";
import type { TermoGlossario } from "../glossario/glossario";

export type StatusConexao = "semTurma" | "conectando" | "conectado" | "desconectado" | "negado";

export interface MensagemAula {
  id: string;
  texto: string;
  horario: string;
  termos: string[]; // termos do glossário citados nesta fala
}

export interface TermoDetectado {
  termo: TermoGlossario;
  vezes: number;
}

export interface ContextoAula {
  conexao: StatusConexao;
  professorFalando: boolean;
  textoParcial: string;
  historico: MensagemAula[];
  termosDetectados: TermoDetectado[];
  pausado: boolean;
  frasesNaFila: number;
  velocidade: number;
  sinalizacaoAutomatica: boolean;
  alternarPausa: () => void;
  mudarVelocidade: (velocidade: number) => void;
  alternarSinalizacaoAutomatica: () => void;
  limparHistorico: () => void;
}

export const AulaContext = createContext<ContextoAula | null>(null);

export function useAulaAoVivo() {
  const contexto = useContext(AulaContext);
  if (!contexto) throw new Error("useAulaAoVivo precisa estar dentro de AulaAoVivoProvider");
  return contexto;
}
