import { useCallback, useEffect, useState } from "react";
import { LOGIN_ATIVO } from "../config";
import { supabase } from "../supabase/cliente";

export interface TurmaResumo {
  id: string;
  nome: string;
}

function lerEscolha(chave: string) {
  try {
    return localStorage.getItem(chave);
  } catch {
    return null;
  }
}

// Turmas do usuário logado (as que ensina ou em que está matriculado; o RLS do banco filtra)
// e a turma escolhida, lembrada neste navegador. Com o login desligado não há turmas.
export function useTurmas(chaveEscolha: string) {
  const [turmas, setTurmas] = useState<TurmaResumo[]>([]);
  const [carregando, setCarregando] = useState(LOGIN_ATIVO);
  const [escolhida, setEscolhida] = useState<string | null>(() => lerEscolha(chaveEscolha));

  const carregar = useCallback(async () => {
    const { data } = await supabase.from("turmas").select("id, nome").order("criado_em");
    setTurmas(data ?? []);
    setCarregando(false);
  }, []);

  useEffect(() => {
    if (!LOGIN_ATIVO) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void carregar();
  }, [carregar]);

  const escolher = useCallback(
    (id: string) => {
      setEscolhida(id);
      try {
        localStorage.setItem(chaveEscolha, id);
      } catch {
        // sem armazenamento: a escolha vale só nesta sessão
      }
    },
    [chaveEscolha],
  );

  // Se a turma lembrada não existe mais, usa a primeira
  const turmaAtual = turmas.find((t) => t.id === escolhida) ?? turmas[0] ?? null;

  return { turmas, turmaAtual, carregando, escolher, recarregar: carregar };
}
