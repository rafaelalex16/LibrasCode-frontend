import { Hand } from "lucide-react";
import { textoParaSinalizar } from "../glossario/glossario";
import { sinalizar } from "../vlibras/vlibras";
import { useAulaAoVivo } from "./contextoAula";

// Termos técnicos citados pelo professor na aula ao vivo
export function SinaisDetectados() {
  const { termosDetectados } = useAulaAoVivo();

  return (
    <div className="h-[40%] flex flex-col overflow-y-auto pb-3">
      {/* cabeçalho */}
      <div className="flex flex-row justify-between items-center mb-3 pt-3">
        <h3 className="font-bold text-sm text-start">Sinais Detectados</h3>
        <div className="bg-blue-100 rounded-full py-1 px-2">
          <p>{termosDetectados.length}</p>
        </div>
      </div>

      {termosDetectados.length === 0 && (
        <p className="text-xs text-gray-400">
          Os termos de programação citados pelo professor na aula ao vivo aparecem aqui.
        </p>
      )}

      {/* Lista de items */}
      {termosDetectados.map(({ termo, vezes }) => (
        <button
          key={termo.termo}
          onClick={() => sinalizar(textoParaSinalizar(termo))}
          title="Ver sinal em Libras"
          className="flex flex-row mb-2 gap-2 justify-between items-center text-left border border-gray-150 rounded-lg p-2 hover:bg-blue-50 transition"
        >
          <div className="flex flex-col">
            <h3 className="font-semibold font-mono">{termo.termo}</h3>
            <span className="text-[10px] text-gray-400">
              {termo.traducao} · {vezes}x
            </span>
          </div>
          <div className="rounded-lg bg-blue-100 p-2 max-w-[60%] flex items-center gap-1">
            <Hand size={14} className="text-blue-600 shrink-0" />
            <h3 className="text-blue-600 text-xs font-bold">{termo.explicacaoSOV}</h3>
          </div>
        </button>
      ))}
    </div>
  );
}
