import { useNavigate } from "react-router-dom";

export function PaginaInicial() {
  const navigate = useNavigate("/Aluno");

  return (
    <div className="h-screen flex bg-white">
      {/* Divisão principal */}

      {/* Esquerda */}
      <div className="w-1/2 flex items-center justify-center ml-52">
        <div className="flex flex-col items-center">
          <img src="logo.inicio.png" alt="Logo" className="w-12 2xl" />
          {/* Logo */}

          <h1 className="text-6xl text-black font-extrabold text-slate-800 mb-4">
            LibrasCode
          </h1>
          {/* Divisão nome */}

          <p className="text-gray-500 text-center mt-4 text-xl max-w-xl">
            Plataforma inclusiva para ensino de programação com suporte em
            Libras.
          </p>
          {/* Divisão descrição */}

          <div className="flex gap-4 mt-10">
            <button
              onClick={() => navigate("/Aluno")}
              className="bg-blue-600 text-white hover:bg-blue-500 transition text-white px-8 py-4 rounded-2xl flex items-center gap-2 shadow-lg"
            >
              Portal do Aluno
            </button>
            {/* Botão aluno*/}

            <button className="border border-gray-300 px-8 py-4 rounded-2xl flex items-center gap-2 hover:bg-gray-100 transition">
              Área do Professor
            </button>
            {/* Botão professor */}
          </div>
        </div>
      </div>

      {/* Direito */}
      <div className="w-1/2 flex items-center justify-end">
        <img
          src="imagem.inicio.jpeg"
          alt="Imagem de início"
          className="w-[300px] h-auto"
        />
      </div>
      {/* Imagem de início */}
    </div>
  );
}
