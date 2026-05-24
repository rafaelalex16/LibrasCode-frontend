import { Book, Code2, LogOut, Route, Video } from "lucide-react";
import { Link, Outlet } from "react-router-dom";
import { dicionarioPythonSOV } from "../../dicionarioMocado/dicionarioMocado";

export default function PortalAluno() {
  const sinaisDetectados = Object.entries(dicionarioPythonSOV);

  return (
    <div className="bg-slate-100 flex">
      <aside className="w-64 h-screen  bg-white border border-l  border-gray-200 flex flex-col justify-between">
        {/* Menu de Navegação Estudante */}
        <div className="p-3 space-y-4 flex-col items-start ">
          {/* Cabeçalho */}
          <div className="flex flex-col border-1 border-b border-gray-200">
            <h2 className="text-blue-600 font-bold mt-3 ml-3 text-2xl ">
              Portal do Aluno
            </h2>
            <h6 className="text-gray-500 ml-3 text-xs pb-3">LibrasCode</h6>
          </div>

          {/* Items do menu  */}
          {/* Botão ir para IDE Python */}
          <Link
            to="/aluno/ide"
            className="w-full bg-blue-100 text-sm text-blue-600 
            flex items-center gap-3 px-3 py-2 rounded-md font-bold 
            hover:bg-blue-200 transition"
          > <Code2 className="text-blue-600" size={20}/>
            IDE Python
          </Link>

          {/* Botao ir para aula ao vivo */}
          <Link
            to="/aluno/aula"
            className="w-full bg-blue-100 text-sm text-blue-600 flex items-center 
            gap-3 px-3 py-2 rounded-md font-bold hover:bg-blue-200 transition"
          > <Video className="text-blue-600" size={20}/>
            Aula ao Vivo
          </Link>

          {/* Botao ir para trilha */}
          <Link
            to="/Aluno/trilha"
            className="w-full bg-blue-100 text-sm text-blue-600 flex items-center 
                            gap-3 px-3 py-2 rounded-md font-bold hover:bg-blue-200 transition"
          > <Route className="text-blue-600" size={20}/>
            Trilha
          </Link>

          <Link
            to="/Aluno/glossario"
            className="w-full bg-blue-100 text-sm text-blue-600 flex items-center 
                            gap-3 px-3 py-2 rounded-md font-bold hover:bg-blue-200 transition"
          > <Book className="text-blue-600" size={20}/>
            Glossário
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
      <main className="flex-1 bg-slate-50 p-6 overflow-y-auto ">
        <Outlet />
      </main>

      <aside className="h-screen px-5 border border-gray-200 bg-white  flex flex-col w-96  justify-between">
        <div></div>

        {/* Palavras detectadas */}
        <div className="h-[30%] flex flex-col overflow-y-auto ">
          {/* cabeçalho */}
          <div className=" flex flex-row justify-between mb-5">
            <h3 className="font-bold text-sm text-start ">Sinais Detectados</h3>
            <div className="bg-blue-100  rounded-full py-1 px-2">
              <p>2</p>
            </div>
          </div>

          {/* Lista de items */}
          {sinaisDetectados.map(([termo, descricao]) => (
            <div
              key={termo}
              className="flex flex-row mb-2 justify-between border border-gray-150 rounded-lg p-2"
            >
              <h3 className="font-semibold">{termo}</h3>
              <div className="rounded-lg bg-blue-100 p-2 max-w-[60%]">
                <h3 className="text-blue-600 text-xs font-bold text-center">
                  {descricao}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
