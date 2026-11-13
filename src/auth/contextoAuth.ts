import type { Session } from "@supabase/supabase-js";
import { createContext, useContext } from "react";
import type { Perfil } from "../supabase/tipos";

export interface ContextoAuth {
  sessao: Session | null;
  perfil: Perfil | null;
  carregando: boolean;
  sair: () => Promise<void>;
  recarregarPerfil: () => Promise<void>;
}

export const AuthContext = createContext<ContextoAuth | null>(null);

export function useAuth() {
  const contexto = useContext(AuthContext);
  if (!contexto) throw new Error("useAuth precisa estar dentro de AuthProvider");
  return contexto;
}
