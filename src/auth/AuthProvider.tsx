import type { Session } from "@supabase/supabase-js";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { LOGIN_ATIVO } from "../config";
import { supabase, supabaseConfigurado } from "../supabase/cliente";
import type { Perfil } from "../supabase/tipos";
import { AuthContext } from "./contextoAuth";

// Mantém a sessão do Supabase Auth e o perfil (aluno ou professor) do usuário logado
export function AuthProvider({ children }: { children: ReactNode }) {
  const [sessao, setSessao] = useState<Session | null>(null);
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [carregando, setCarregando] = useState(supabaseConfigurado && LOGIN_ATIVO);
  const usuarioAtual = useRef<string | null>(null);

  const buscarPerfil = useCallback(async (usuarioId: string | null) => {
    if (!usuarioId) {
      setPerfil(null);
      return;
    }
    const { data } = await supabase.from("perfis").select("*").eq("id", usuarioId).maybeSingle();
    setPerfil(data as Perfil | null);
  }, []);

  useEffect(() => {
    if (!supabaseConfigurado || !LOGIN_ATIVO) return;

    const { data } = supabase.auth.onAuthStateChange((_evento, novaSessao) => {
      setSessao(novaSessao);
      const usuarioId = novaSessao?.user.id ?? null;
      if (usuarioId === usuarioAtual.current) {
        setCarregando(false);
        return;
      }
      usuarioAtual.current = usuarioId;
      // O Supabase recomenda não chamar o banco dentro deste callback
      window.setTimeout(() => {
        void buscarPerfil(usuarioId).finally(() => setCarregando(false));
      }, 0);
    });
    return () => data.subscription.unsubscribe();
  }, [buscarPerfil]);

  const sair = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const recarregarPerfil = useCallback(() => buscarPerfil(usuarioAtual.current), [buscarPerfil]);

  return (
    <AuthContext.Provider value={{ sessao, perfil, carregando, sair, recarregarPerfil }}>
      {children}
    </AuthContext.Provider>
  );
}
