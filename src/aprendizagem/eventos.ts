import { LOGIN_ATIVO } from "../config";
import { textoParaSinalizar, type TermoGlossario } from "../glossario/glossario";
import { supabase, supabaseConfigurado } from "../supabase/cliente";
import { sinalizar } from "../vlibras/vlibras";
import type { EventoAprendizagem, TipoEvento } from "./progressoDeEventos";

export type { EventoAprendizagem, TipoEvento } from "./progressoDeEventos";

// Eventos de aprendizagem do aluno (tabela eventos_aprendizagem), base do painel do professor.
// Só são gravados com o login ligado; o banco preenche o aluno com o usuário logado.

type NovoEvento = { tipo: TipoEvento } & Partial<Pick<EventoAprendizagem, "modulo" | "item" | "termo" | "erro_tipo" | "aprovado">>;

export function registrarEvento(evento: NovoEvento) {
  if (!LOGIN_ATIVO || !supabaseConfigurado) return;
  // Sem internet o evento se perde, mas a tela continua funcionando
  void supabase
    .from("eventos_aprendizagem")
    .insert(evento)
    .then(({ error }) => {
      if (error) console.warn("Evento de aprendizagem não gravado:", error.message);
    });
}

// Sinaliza um termo do glossário e registra a consulta (dúvidas da turma no painel)
export function sinalizarTermo(termo: TermoGlossario, origem: string) {
  sinalizar(textoParaSinalizar(termo));
  registrarEvento({ tipo: "consulta_termo", termo: termo.termo, item: origem });
}
