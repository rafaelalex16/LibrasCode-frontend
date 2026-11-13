import { LogIn, Users } from "lucide-react";
import { useState, type FormEvent } from "react";
import { supabase } from "../supabase/cliente";
import { traduzirErro } from "../supabase/tipos";
import type { TurmaResumo } from "./useTurmas";

interface Props {
  turmas: TurmaResumo[];
  turmaAtual: TurmaResumo | null;
  escolher: (id: string) => void;
  aoEntrar: (id: string) => Promise<void>;
}

// Turma atual do aluno + entrada em nova turma pelo código do professor
export function SeletorTurma({ turmas, turmaAtual, escolher, aoEntrar }: Props) {
  const [codigo, setCodigo] = useState("");
  const [aberto, setAberto] = useState(false);
  const [erro, setErro] = useState("");

  const entrar = async (evento: FormEvent) => {
    evento.preventDefault();
    setErro("");
    const { data, error } = await supabase.rpc("entrar_na_turma", { codigo_turma: codigo });
    if (error) return setErro(traduzirErro(error.message));
    const turma = (data as TurmaResumo[] | null)?.[0];
    if (!turma) return;
    setCodigo("");
    setAberto(false);
    await aoEntrar(turma.id);
  };

  const mostrarFormulario = aberto || turmas.length === 0;

  return (
    <div className="flex flex-col gap-2 text-start">
      <span className="flex items-center gap-1 text-xs font-bold text-gray-500">
        <Users size={12} />
        Turma
      </span>

      {turmas.length > 1 ? (
        <select
          value={turmaAtual?.id ?? ""}
          onChange={(e) => escolher(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
        >
          {turmas.map((turma) => (
            <option key={turma.id} value={turma.id}>
              {turma.nome}
            </option>
          ))}
        </select>
      ) : (
        turmaAtual && <span className="text-sm font-semibold text-slate-700">{turmaAtual.nome}</span>
      )}

      {mostrarFormulario ? (
        <form onSubmit={entrar} className="flex flex-col gap-1">
          <div className="flex gap-1">
            <input
              required
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.toUpperCase())}
              placeholder="Código da turma"
              maxLength={6}
              className="w-full min-w-0 border border-gray-300 rounded-md px-2 py-1 font-mono text-sm uppercase outline-none focus:border-blue-500"
            />
            <button type="submit" title="Entrar na turma" className="rounded-md bg-blue-600 px-2 text-white">
              <LogIn size={14} />
            </button>
          </div>
          {erro && <span className="text-xs font-semibold text-red-600">{erro}</span>}
        </form>
      ) : (
        <button onClick={() => setAberto(true)} className="self-start text-xs font-semibold text-blue-600 hover:underline">
          + Entrar em outra turma
        </button>
      )}
    </div>
  );
}
