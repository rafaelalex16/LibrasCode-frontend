import { supabase } from "../supabase/cliente";
import { mesclarProgresso } from "../trilha/progresso";
import { progressoDeEventos, type EventoAprendizagem } from "./progressoDeEventos";

// Com o login ligado, traz o progresso da Trilha gravado no banco para este navegador
// (o aluno continua de onde parou em qualquer computador)
export async function sincronizarTrilha() {
  const { data, error } = await supabase
    .from("eventos_aprendizagem")
    .select("tipo, modulo, item, aprovado, criado_em")
    .in("tipo", ["tentativa", "item_concluido"])
    .order("criado_em");
  if (error || !data) return;
  mesclarProgresso(progressoDeEventos(data as EventoAprendizagem[]));
}
