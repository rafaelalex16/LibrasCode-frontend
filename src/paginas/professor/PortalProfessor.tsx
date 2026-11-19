import { GraduationCap, LogOut, Monitor, UserRound, Users } from "lucide-react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/contextoAuth";
import { LOGIN_ATIVO } from "../../config";
import { LimiteDeErro } from "../../componentes/LimiteDeErro";

export function PortalProfessor() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { perfil, sair } = useAuth();

  const sairDaConta = async () => {
    if (LOGIN_ATIVO) await sair();
    navigate("/home", { replace: true });
  };

  return (
    <div className="bg-slate-100 flex h-screen overflow-hidden">
      <aside className="w-64 h-screen bg-white border border-l border-gray-200 flex flex-col justify-between">
        {/* Menu de Navegação Estudante */}
        <div className="p-3 space-y-4 flex-col items-start ">
          {/* Cabeçalho */}
          <div className="flex flex-col border-1 border-b border-gray-200">
            <h2 className="text-blue-600 font-bold mt-3 ml-3  text-2xl ">
              Área do Professor
            </h2>

            <div className="flex ">
              <h6 className="text-gray-500 flex flex-row gap-1 ml-3 mb-3 text-xs">
                {perfil?.nome ?? "LibrasCode"}
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
            <Monitor className="text-blue-600" size={20} />
            Modo Aula
          </Link>

          {/* Botao ir para aula ao vivo */}
          <Link
            to="/professor/progresso"
            className="w-full bg-blue-100 text-sm text-blue-600 flex items-center 
            gap-3 px-3 py-2 rounded-md font-bold hover:bg-blue-200 transition"
          >
            <Users className="text-blue-600" size={20} />
            Progresso da turma
          </Link>

          {LOGIN_ATIVO && (
          <>
          <Link
            to="/professor/turmas"
            className="w-full bg-blue-100 text-sm text-blue-600 flex items-center 
            gap-3 px-3 py-2 rounded-md font-bold hover:bg-blue-200 transition"
          >
            <GraduationCap className="text-blue-600" size={20} />
            Minhas turmas
          </Link>

          <Link
            to="/professor/conta"
            className="w-full bg-blue-100 text-sm text-blue-600 flex items-center 
            gap-3 px-3 py-2 rounded-md font-bold hover:bg-blue-200 transition"
          >
            <UserRound className="text-blue-600" size={20} />
            Minha conta
          </Link>
          </>
          )}
        </div>

        {/* Botão de Sair */}
        <div className="p-3 border-t border-gray-200">
          <button
            onClick={() => void sairDaConta()}
            className="w-full bg-red-100 text-sm text-blue-600 
            flex items-center gap-3 px-3 py-2 rounded-md 
            font-bold hover:bg-red-200 transition"
          >
            <LogOut size={18} />
            Sair
          </button>
        </div>
      </aside>
      {/* Conteúdo Principal */}
      <main className=" flex-1 bg-slate-50 p-6 overflow-y-auto ">
        <LimiteDeErro key={pathname}>
          <Outlet />
        </LimiteDeErro>
      </main>

      <aside className=" px-5 border border-gray-200 bg-white  flex flex-col w-96 justify-between">
        <div></div>

       
      </aside>
    </div>
  );
}
