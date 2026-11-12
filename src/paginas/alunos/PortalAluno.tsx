import { Book, Code2, LogOut, Route, Video } from "lucide-react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { AulaAoVivoProvider } from "../../aulaAoVivo/AulaAoVivoProvider";
import { SinaisDetectados } from "../../aulaAoVivo/SinaisDetectados";
import { LimiteDeErro } from "../../componentes/LimiteDeErro";
import { EspacoAvatar } from "../../vlibras/EspacoAvatar";

export default function PortalAluno() {
  const { pathname } = useLocation();

  return (
    // O provider mantém a aula ao vivo conectada em todas as telas do aluno
    <AulaAoVivoProvider>
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
        <LimiteDeErro key={pathname}>
          <Outlet />
        </LimiteDeErro>
      </main>

      <aside className="h-screen px-5 border border-gray-200 bg-white  flex flex-col w-96 shrink-0 justify-between">
        {/* Avatar VLibras encaixado acima dos sinais detectados */}
        <EspacoAvatar />

        {/* Palavras detectadas na aula ao vivo */}
        <SinaisDetectados />
      </aside>
    </div>
    </AulaAoVivoProvider>
  );
}
