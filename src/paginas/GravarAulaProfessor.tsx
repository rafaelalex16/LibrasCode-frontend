import { MicOff, Send, Trash2 } from "lucide-react";

export function GravarAulaProfessor() {
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-slate-50">
      {/* cabeçalho */}
      <div className="bg-slate-50">
        <h1 className="font-bold text-lg ml-12">Modo Aula</h1>
        <h3 className="text-gray-500 font-semiboldm mb-5 ml-12">
          Sua fala é convertida em texto em tempo real para os alunos
          acompanharem
        </h3>
      </div>

      {/* conteudo 1 (MICROFONE) */}
      <div className="w-full h-[40%] bg-white border border-gray-200 gap-2 items-center mb-12 flex flex-col justify-center rounded-lg ">
        <div className="w-20 h-20 flex items-center justify-center rounded-full bg-red-600 ">
          <MicOff className="text-white" size={30} />
        </div>
        <h3 className="font-bold text-red-600 ">
          Gravando — clique para parar
        </h3>
      </div>

      <div
        className="w-full h-[60%] bg-white border border-gray-200 gap-2 mb-12 flex flex-col
              rounded-lg "
      >
        <div className="border-b border-gray-200 p-4 flex items-center justify-between">
          <h3 className="flex font-bold text-start ">Transcrição da Aula</h3>
          <h4 className="font-semibold text-xs text-gray-500 flex flex-row gap-1 ">
            <Trash2 className="text-gray-500" size={15} />
            Limpar
          </h4>
        </div>

        {/* conteudo 2 (transcrição da aula escrita)*/}
        <div className="mt-5 ml-10 mr-10 bg-slate-50 flex flex-col items-start border border-gray-100 shadow-md rounded-lg">
          <div className="text-gray-700 text-bold text-sm-2 mt-3 mb-3 ml-3">
            Bom dia, turma! Hoje vamos aprender variáveis em Python.
          </div>
        </div>

        <div className="mt-2 ml-10 mr-10 bg-blue-200 flex flex-col items-start border border-gray-100 shadow-md rounded-lg">
          <div className="text-blue-700 text-bold text-sm-2 mt-3 mb-3 ml-3">
            Uma variável é como uma caixa que guarda um valor na mémo
          </div>
        </div>

        {/* escrita manual */}
        <div className="gap-2 flex items-center justify-between">
          <div className="w-screen mt-10 ml-10 mb-4 bg-white flex items-center justify-between  border border-gray-100 shadow-md rounded-lg">
            <div className="text-gray-400 text-bold text-sm-2 mt-3 mb-3 ml-3">
              Adicionar anotação manualmente...
            </div>
          </div>

          <div className="w-24 h-12 ml-1 mr-5 mt-6 rounded-lg text-white bg-blue-600 flex items-center justify-center">
            <Send size={16} />
          </div>
        </div>
      </div>
    </div>
  );
}
