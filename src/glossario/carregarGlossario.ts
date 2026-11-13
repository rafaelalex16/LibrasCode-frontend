import { useSyncExternalStore } from "react";
import { supabase, supabaseConfigurado } from "../supabase/cliente";
import {
  assinarGlossario,
  glossario,
  substituirGlossario,
  versaoGlossario,
  type Categoria,
  type StatusValidacao,
  type TermoGlossario,
} from "./glossario";

interface LinhaGlossario {
  termo: string;
  traducao: string;
  categoria: Categoria;
  explicacao_sov: string;
  exemplo: string | null;
  sinonimos: string[];
  eh_codigo: boolean;
  validacao: StatusValidacao;
  video_url: string | null;
}

// Busca o glossário oficial no Supabase. Se falhar (sem internet), fica a cópia embutida.
export async function carregarGlossarioDoBanco() {
  if (!supabaseConfigurado) return;
  const { data, error } = await supabase.from("glossario").select("*").order("ordem");
  if (error || !data?.length) return;

  substituirGlossario(
    (data as LinhaGlossario[]).map((linha) => ({
      termo: linha.termo,
      traducao: linha.traducao,
      categoria: linha.categoria,
      explicacaoSOV: linha.explicacao_sov,
      exemplo: linha.exemplo ?? undefined,
      sinonimos: linha.sinonimos,
      ehCodigo: linha.eh_codigo,
      validacao: linha.validacao,
      video: linha.video_url ?? undefined,
    })),
  );
}

// Lista atual do glossário; a tela atualiza quando a versão do banco chega
export function useGlossario(): TermoGlossario[] {
  useSyncExternalStore(assinarGlossario, versaoGlossario);
  return glossario;
}
