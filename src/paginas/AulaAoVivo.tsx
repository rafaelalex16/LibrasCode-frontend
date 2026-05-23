import { Dot, DotIcon, Volume2 } from "lucide-react";

export function AulaAoVivo() {
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-slate-100">
      {/* Cabeçalho */}
      <div
        className="flex items-center justify-between 
        p-4 bg-white border-b border-b-gray-100"
      >
        <div className="flex flex-col justify-between">
          <h1 className="flex flex-col font-bold">Aula ao Vivo</h1>
          <h3 className="flex-col text-xs font-bold text-gray-400  ">
            Transcrição em tempo real + Libras
          </h3>
        </div>

        <div
          className="flex flex-row items-center  mt-1 ml-40 text-sm text-green-500 py-1 
             p-4 font-semibold"
        >
          <DotIcon size={35} />
          Professor iniciando...
        </div>
      </div>

      {/* Conteúdo */}
      <div
        className="h-screen flex flex-col 
        p-4 bg-white border-b border-b-gray-100"
      >
        <h2 className="overflow-hidden flex mb-4 font-bold text-sm-2 items-center gap-2  ">
          <Volume2 size={15} />
          Transcrição em Tempo Real
        </h2>

        {/* Conteúdo  a ser transcrito */}
        <div className=" min-h-[220px] text-start">
          <p className="text-sm text-start text-slate-700 leading-relaxed">
            Aguardando o professor iniciar...
          </p>
        </div>
      </div>
    </div>
  );
}
