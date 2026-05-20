import { BookOpen, Search } from "lucide-react";

export function Dicionario() {
  return (
    <div className="h-screen flex flex-col overflow-y-auto overflow-hidden bg-slate-100">
      {/* Cabeçalho */}
      <div
        className="flex flex-row items-center justify-between 
        p-3 bg-white border-b border-b-gray-100"
      >
        <h1 className="font-semibold">Dicionário Libras</h1>
        <h4 className="text-xs font-bold text-gray-500">
          5 termos encontrados
        </h4>
      </div>
      {/* Barra de pesquisa */}
      <div className="flex items-center justify-center">
        <div className="w-screen mt-5 ml-2 mr-2 mb-4 bg-white flex flex-row items-center justify-between border border-gray-100 shadow-md rounded-lg">
          <div className="text-gray-400 text-bold text-sm-2 mt-3 mb-3 ml-3">
            Pesquisar termo...
          </div>
        </div>
      </div>
      {/* Termos */}
      <div className="border-b border-gray-200 bg-white p-2 rounded mr-2 ml-2 mt-5 flex items-center justify-between">
        <h3 className="flex font-bold gap-2 text-start text-sm ">
          <BookOpen className="mt-1" size={15} />
          Variable
        </h3>
      </div>
      <div className="border-b border-gray-200 bg-white p-2 rounded mr-2 ml-2 flex items-center justify-between">
        <h4 className="text-gray-500 text-sm">
          MEMÓRIA NOME TER, DADO DENTRO MUDAR PODE.
        </h4>
      </div>

      <div className="border-b border-gray-200 bg-white p-2 rounded mr-2 ml-2 mt-5 flex items-center justify-between">
        <h3 className="flex font-bold gap-2 text-start text-sm ">
          <BookOpen className="mt-1" size={15} />
          String
        </h3>
      </div>
      <div className="border-b border-gray-200 bg-white p-2 rounded mr-2 ml-2 flex items-center justify-between">
        <h4 className="text-gray-500 text-sm">
          TEXTO ASPAS DENTRO, LETRA NÚMERO JUNTO.
        </h4>
      </div>

      <div className="border-b border-gray-200 bg-white p-2 rounded mr-2 ml-2 mt-5 flex items-center justify-between">
        <h3 className="flex font-bold gap-2 text-start text-sm ">
          <BookOpen className="mt-1" size={15} />
          Integer
        </h3>
      </div>
      <div className="border-b border-gray-200 bg-white p-2 rounded mr-2 ml-2 flex items-center justify-between">
        <h4 className="text-gray-500 text-sm">
          NÚMERO INTEIRO, VÍRGULA NÃO-TER.
        </h4>
      </div>

      <div className="border-b border-gray-200 bg-white p-2 rounded mr-2 ml-2 mt-5 flex items-center justify-between">
        <h3 className="flex font-bold gap-2 text-start text-sm ">
          <BookOpen className="mt-1" size={15} />
          Float
        </h3>
      </div>
      <div className="border-b border-gray-200 bg-white p-2 rounded mr-2 ml-2 flex items-center justify-between">
        <h4 className="text-gray-500 text-sm">
          NÚMERO PONTO TER, VÍRGULA TER.
        </h4>
      </div>

      <div className="border-b border-gray-200 bg-white p-2 rounded mt-5 mr-2 ml-2  flex items-center justify-between">
        <h3 className="flex font-bold gap-2 text-start text-sm ">
          <BookOpen className="mt-1" size={15} />
          Boolean
        </h3>
      </div>
      <div className="border-b border-gray-200 bg-white p-2 rounded mr-2 ml-2 flex items-center justify-between">
        <h4 className="text-gray-500 text-sm">
          RESPOSTA DUAS:VERDADEIRO OU FALSO.
        </h4>
      </div>
    </div>
  );
}
