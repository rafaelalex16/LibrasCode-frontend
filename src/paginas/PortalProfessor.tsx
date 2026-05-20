import { Code2, LogOut, Monitor, Users } from "lucide-react";
import { Link, Outlet, useNavigate } from "react-router-dom";

export function PortalProfessor() {
  const navigate = useNavigate();

  return (
    <div className="bg-slate-100 flex">
      <aside className="w-64 h-screen bg-white border border-l border-gray-200 flex flex-col justify-between">
        {/* Menu de Navegação Estudante */}
        <div className="p-3 space-y-4 flex-col items-start ">
          {/* Cabeçalho */}
          <div className="flex flex-col border-1 border-b border-gray-200">
            <h2 className="text-blue-600 font-bold mt-3 ml-3 mb-3 text-2xl ">
              Área do Professor
            </h2>

            <div className="flex ">
              <h6 className="text-gray-500 flex flex-row gap-1 text-xs">
                LibrasCode
              </h6>
            </div>
          </div>

          {/* Items do menu (PROFESSOR) */}
          {/* Botão ir para Modo Aula*/}
          <Link
            to="/professor/aovivo"
            className="w-full bg-blue-100 text-sm text-blue-600 
            flex items-center gap-3 px-3 py-2 rounded-md font-bold 
            hover:bg-blue-200 transition"
          >
            <Monitor size={20} />
            Modo Aula
          </Link>

          {/* Botao ir para aula ao vivo */}
          <Link
            to="/professor/progresso"
            className="w-full bg-blue-100 text-sm text-blue-600 flex items-center 
            gap-3 px-3 py-2 rounded-md font-bold hover:bg-blue-200 transition"
          >
            <Users size={20} />
            Progresso da turma
          </Link>
        </div>

        {/* Botão de Sair */}
        <div className="p-3 border-t border-gray-200">
          <Link
            to="/Inicial"
            className="w-full bg-red-100 text-sm text-blue-600 
            flex items-center gap-3 px-3 py-2 rounded-md 
            font-bold hover:bg-red-200 transition"
          >
            <LogOut size={18} />
            Sair
          </Link>
        </div>
      </aside>
      {/* Conteúdo Principal */}
      <main className=" flex-1 bg-slate-50 p-6 overflow-y-auto ">
        <Outlet />
      </main>

      <aside className=" px-5 border border-gray-200 bg-white  flex flex-col w-80  justify-between">
        <div></div>

        {/* Palavras detectadas */}
        <div className="h-[50%] flex flex-col ">
          {/* Cabeçalho */}
          <div className="flex flex-row justify-between mb-5">
            <h3 className="font-bold text-sm text-start ">Sinais Detectados</h3>
            <div className="bg-blue-100  rounded-full py-1 px-2">
              <p>2</p>
            </div>
          </div>

          {/* Lista de items */}
          <div className="flex flex-row mb-2  justify-between border border-gray-150 rounded-lg p-2">
            <h3>if</h3>
            <div className="rounded-lg bg-blue-100 p-2">
              <h3 className="text-blue-600 text-xs font-bold text-center">
                CONDIÇÃO TESTAR:SE SIM
              </h3>
            </div>
          </div>
          <div className="flex flex-row  justify-between border border-gray-150 rounded-lg p-2">
            <h3>if</h3>
            <div className="rounded-lg bg-blue-100 p-2">
              <h3 className="text-blue-600 text-xs font-bold text-center">
                CONDIÇÃO TESTAR:SE SIM
              </h3>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
