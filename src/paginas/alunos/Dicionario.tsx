import { BookOpen, Search } from "lucide-react";
import { useState } from "react"
import { dicionarioPythonSOV } from "../../dicionarioMocado/dicionarioMocado";

// Essa tela tela está mocada (simulada) somente para mostrar como seria, e futuramente pretendemos
// torna-la real, conectando-a a um banco de dados.

export function Dicionario() {
  const [busca, setBusca] = useState("")

  

  const filtrados = Object.entries(dicionarioPythonSOV).filter(([palavra]) =>
    palavra.toLowerCase().includes(busca.toLowerCase())
  )

  return (
    <div className="h-screen overflow-y-auto bg-slate-100">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between p-4 bg-white border-b">
        <h1 className="font-semibold text-lg">Dicionário Libras</h1>

        <h4 className="text-sm font-bold text-gray-500">
          {filtrados.length} termos encontrados
        </h4>
      </div>

      {/* Pesquisa */}
      <div className="p-4">
        <div className="bg-white rounded-xl border shadow-sm flex items-center px-4 py-3">
          <Search size={18} className="text-gray-400" />

          <input
            type="text"
            placeholder="Pesquisar termo..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full ml-3 outline-none bg-transparent"
          />
        </div>
      </div>

      {/* Cards */}
      <div className="px-4 pb-5 flex flex-col gap-5">
        {filtrados.map(([palavra, sinal]) => (
          <div
            key={palavra}
            className="bg-white rounded-2xl border overflow-hidden"
          >
            {/* Topo */}
            <div className="flex items-center gap-2 p-3 border-b">
              <BookOpen size={18} className="text-purple-600" />

              <h2 className="font-bold text-2sm capitalize">
                {palavra}
              </h2>
            </div>

            {/* Conteúdo */}
            <div className="p-3 text-gray-600 font-medium">
              {sinal}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}