import { Backpack } from "lucide-react";

export function Trilha() {
  const ConteudoTrilha = [
    {
      titulo: "📦  Variáveis",
      subtitulo:
        "Aprenda a declarar e usar variáveis em Python com sinais em Libras.",
    },
    {
      titulo: " 🔀  Condicionais IF",
      subtitulo:
        "Entenda estruturas condicionais e seus sinais correspondentes.",
    },
    {
      titulo: "🔁  Repetição WHILE",
      subtitulo: "Domine laços de repetição enquanto for verdadeira.",
    },
  ];

  return (
    <div className="px-4">
      <div className="flex flex-col py-2 my-4 px-4 gap-4 bg-white border border-gray-100 shadow-md rounded-lg">
        {/*Progresso total */}
        <div className="flex items-center justify-between">
          <div className="text-gray-700 flex text-start font-bold text-sm2 ">
            Progresso Total
          </div>
          <div className="flex flex-row text-sm-6 font-bold p-1 text-blue-600">
            40%
          </div>
        </div>

        {/* Barra de progresso */}
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full w-[60%] bg-blue-600 rounded-full"></div>
        </div>
        {/* Quantidade modúlos feitos */}
        <div className="mb-2 mt-2 text-gray-400 font-bold text-sm">
          2 de 5 módulos concluídos
        </div>
      </div>

      {ConteudoTrilha.map((item, index) => (
        <div
          key={index}
          className="py-2 my-4 px-4 bg-white flex flex-col items-start border border-gray-100 shadow-md rounded-lg"
        >
          <h1 className="font-bold">{item.titulo}</h1>
          <h3 className="font-semibold text-gray-500">{item.subtitulo}</h3>
        </div>
      ))}
    </div>
  );
}
