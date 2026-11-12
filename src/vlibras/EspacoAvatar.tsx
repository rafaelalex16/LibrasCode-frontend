import { Hand } from "lucide-react";
import { useEffect, useRef } from "react";
import { abrirAvatar, encaixarAvatar } from "./vlibras";

// Espaço reservado para a janela do avatar VLibras; a janela é posicionada exatamente sobre ele
export function EspacoAvatar() {
  const espaco = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!espaco.current) return;
    return encaixarAvatar(espaco.current);
  }, []);

  return (
    <div
      ref={espaco}
      className="flex-1 min-h-[220px] mt-5 rounded-xl border border-dashed border-gray-300 flex flex-col items-center justify-center gap-2 text-center"
    >
      <p className="text-xs text-gray-400 px-4">O avatar VLibras aparece aqui.</p>
      <button
        onClick={() => abrirAvatar()}
        className="flex items-center gap-2 rounded-md bg-blue-100 px-3 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-200 transition"
      >
        <Hand size={14} />
        Abrir avatar
      </button>
    </div>
  );
}
