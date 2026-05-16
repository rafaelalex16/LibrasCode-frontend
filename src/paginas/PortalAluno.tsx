import { useNavigate } from "react-router-dom";

export default function PortalAluno() {
  const navigate = useNavigate("/Inicial");

  return (
    <div className=" bg-white flex flex-col">
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
          <button
            className="w-full bg-blue-100 text-sm text-blue-600 flex items-center 
                            gap-3 px-3 py-2 rounded-md font-bold hover:bg-blue-200 transition"
          >
            IDE Python
          </button>

          <button
            className="w-full bg-blue-100 text-sm text-blue-600 flex items-center 
                            gap-3 px-3 py-2 rounded-md font-bold hover:bg-blue-200 transition"
          >
            Aula ao Vivo
          </button>

          <button
            className="w-full bg-blue-100 text-sm text-blue-600 flex items-center 
                            gap-3 px-3 py-2 rounded-md font-bold hover:bg-blue-200 transition"
          >
            Trilha
          </button>
        </div>

        <div className="p-3 border-t border-gray-200">
          <button
            onClick={() => navigate("/Inicial")}
            className="w-full bg-red-100 text-sm text-blue-600 flex items-center 
                            gap-3 px-3 py-2 rounded-md font-bold hover:bg-red-200 transition"
          >
            ⍈ Sair
          </button>
        </div>
      </aside>
      {/* Conteúdo Principal */}
      
    </div>
  );
}
