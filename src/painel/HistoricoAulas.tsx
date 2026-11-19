import { ChevronDown, ChevronRight, History } from "lucide-react";
import { useState } from "react";
import type { AulaDoHistorico, FalaDoHistorico } from "./dadosDemonstracao";

interface Props {
  aulas: AulaDoHistorico[];
  carregarFalas: (aulaId: string) => Promise<FalaDoHistorico[]>;
}

// Aulas da turma com as falas transcritas (o que foi sinalizado para os alunos)
export function HistoricoAulas({ aulas, carregarFalas }: Props) {
  const [aberta, setAberta] = useState<string | null>(null);
  const [falas, setFalas] = useState<Record<string, FalaDoHistorico[]>>({});

  const alternar = async (aulaId: string) => {
    if (aberta === aulaId) return setAberta(null);
    setAberta(aulaId);
    if (!falas[aulaId]) {
      const carregadas = await carregarFalas(aulaId);
      setFalas((atual) => ({ ...atual, [aulaId]: carregadas }));
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col gap-2 text-start">
      <h3 className="flex items-center gap-2 font-bold">
        <History size={16} />
        Histórico das aulas
      </h3>
      {aulas.length === 0 && <p className="text-sm text-gray-400">Nenhuma aula ao vivo registrada nesta turma.</p>}
      {aulas.map((aula) => (
        <div key={aula.id} className="border border-gray-100 rounded-md">
          <button onClick={() => void alternar(aula.id)} className="w-full flex items-center justify-between gap-2 px-3 py-2 text-sm hover:bg-slate-50">
            <span className="flex items-center gap-2 font-semibold">
              {aberta === aula.id ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              {new Date(aula.iniciada_em).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
            </span>
            <span className="text-xs text-gray-500">
              {aula.totalFalas} fala(s){aula.encerrada_em ? "" : " · em andamento"}
            </span>
          </button>
          {aberta === aula.id && (
            <ul className="px-8 pb-3 flex flex-col gap-1 text-sm text-slate-700 list-disc">
              {(falas[aula.id] ?? []).map((fala, indice) => (
                <li key={indice}>{fala.texto}</li>
              ))}
              {falas[aula.id]?.length === 0 && <li className="text-gray-400">Sem falas registradas.</li>}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}
