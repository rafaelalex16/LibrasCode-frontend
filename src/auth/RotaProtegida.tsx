import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { LOGIN_ATIVO } from "../config";
import { supabaseConfigurado } from "../supabase/cliente";
import { portalDoPapel, type Papel } from "../supabase/tipos";
import { AvisoConfiguracao } from "./AvisoConfiguracao";
import { useAuth } from "./contextoAuth";

// Só deixa entrar quem está logado e tem o papel certo (aluno ou professor)
export function RotaProtegida({ papel, children }: { papel: Papel; children: ReactNode }) {
  const { sessao, perfil, carregando, sair } = useAuth();
  const location = useLocation();

  // Login desligado: o portal abre direto, sem cadastro
  if (!LOGIN_ATIVO) return children;
  if (!supabaseConfigurado) return <AvisoConfiguracao />;

  if (carregando) {
    return (
      <div className="h-screen flex items-center justify-center gap-2 text-gray-500">
        <Loader2 className="animate-spin" size={20} />
        Carregando...
      </div>
    );
  }

  if (!sessao) return <Navigate to="/entrar" replace state={{ de: location.pathname }} />;

  if (!perfil) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-3 text-center px-4">
        <p className="text-gray-600">Não encontramos o perfil desta conta.</p>
        <button onClick={() => void sair()} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white">
          Sair e entrar novamente
        </button>
      </div>
    );
  }

  if (perfil.papel !== papel) return <Navigate to={portalDoPapel(perfil.papel)} replace />;

  return children;
}
