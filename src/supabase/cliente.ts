import { createClient } from "@supabase/supabase-js";

// Dados do projeto Supabase (Project Settings > API), definidos no arquivo .env
const url: string | undefined = import.meta.env.VITE_SUPABASE_URL;
const chave: string | undefined = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabaseConfigurado = Boolean(url && chave);

// Sem configuração o cliente aponta para um endereço inválido e as telas mostram o aviso de configuração
export const supabase = createClient(url || "http://supabase-nao-configurado.invalid", chave || "sem-chave");
