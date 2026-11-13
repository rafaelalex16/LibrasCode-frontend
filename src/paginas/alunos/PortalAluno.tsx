import { Book, Code2, LogOut, Route, UserRound, Video } from "lucide-react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/contextoAuth";
import { LOGIN_ATIVO, SALA_SEM_LOGIN } from "../../config";
import { AulaAoVivoProvider } from "../../aulaAoVivo/AulaAoVivoProvider";
import { SinaisDetectados } from "../../aulaAoVivo/SinaisDetectados";
import { LimiteDeErro } from "../../componentes/LimiteDeErro";
import { SeletorTurma } from "../../turmas/SeletorTurma";
import { useTurmas } from "../../turmas/useTurmas";
import { EspacoAvatar } from "../../vlibras/EspacoAvatar";

export default function PortalAluno() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { perfil, sair } = useAuth();
  const { turmas, turmaAtual, escolher, recarregar } = useTurmas("librascode:turmaAluno");

  // Com o login desligado todos ficam na mesma sala
  const turmaId = LOGIN_ATIVO ? turmaAtual?.id ?? null : SALA_SEM_LOGIN;

  const sairDaConta = async () => {
    if (LOGIN_ATIVO) await sair();
    navigate("/home", { replace: true });
  };

  return (
    // O provider mantém a aula ao vivo da turma conectada em todas as telas do aluno
    <AulaAoVivoProvider key={turmaId ?? "sem-turma"} turmaId={turmaId}>
    <div className="bg-slate-100 flex">
      <aside className="w-64 h-screen  bg-white border border-l  border-gray-200 flex flex-col justify-between">
        {/* Menu de Navegação Estudante */}
        <div className="p-3 space-y-4 flex-col items-start ">
          {/* Cabeçalho */}
          <div className="flex flex-col border-1 border-b border-gray-200">
            <h2 className="text-blue-600 font-bold mt-3 ml-3 text-2xl ">
              Portal do Aluno
            </h2>
            <h6 className="text-gray-500 ml-3 text-xs pb-3">{perfil?.nome ?? "LibrasCode"}</h6>
          </div>

          {LOGIN_ATIVO && (
            <SeletorTurma
              turmas={turmas}
              turmaAtual={turmaAtual}
              escolher={escolher}
              aoEntrar={async (id) => {
                await recarregar();
                escolher(id);
              }}
            />
          )}

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

          {LOGIN_ATIVO && (
            <Link
              to="/aluno/conta"
              className="w-full bg-blue-100 text-sm text-blue-600 flex items-center 
                              gap-3 px-3 py-2 rounded-md font-bold hover:bg-blue-200 transition"
            > <UserRound className="text-blue-600" size={20}/>
              Minha conta
            </Link>
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
