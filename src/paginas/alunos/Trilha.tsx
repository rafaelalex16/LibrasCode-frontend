import { Check, Lock, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { modulos } from "../../trilha/conteudo";
import { itensFeitos, moduloLiberado, useProgresso } from "../../trilha/progresso";

type Estado = "concluido" | "atual" | "bloqueado";

// Cores do círculo de cada módulo no mapa
const CIRCULO: Record<Estado, string> = {
  concluido: "bg-green-500 text-white",
  atual: "bg-blue-600 text-white ring-8 ring-blue-200",
  bloqueado: "bg-gray-200 text-gray-400",
};

export function Trilha() {
  const progresso = useProgresso();

  const etapas = modulos.map((modulo) => {
    const { feitos, total } = itensFeitos(modulo, progresso[modulo.id]);
    const estado: Estado = feitos === total ? "concluido" : moduloLiberado(modulo, progresso) ? "atual" : "bloqueado";
    return { modulo, feitos, total, estado };
  });
  const feitos = etapas.reduce((soma, etapa) => soma + etapa.feitos, 0);
  const total = etapas.reduce((soma, etapa) => soma + etapa.total, 0);
  const porcentagem = Math.round((feitos / total) * 100);
  const concluidos = etapas.filter((etapa) => etapa.estado === "concluido").length;
  const trilhaCompleta = concluidos === modulos.length;

  return (
    <div className="px-4">
      <div className="flex flex-col py-2 my-4 px-4 gap-4 bg-white border border-gray-100 shadow-md rounded-lg">
        {/*Progresso total */}
        <div className="flex items-center justify-between">
          <div className="text-gray-700 flex text-start font-bold text-sm2 ">
            Progresso Total
          </div>
          <div className="flex flex-row text-sm-6 font-bold p-1 text-blue-600">
            {porcentagem}%
          </div>
        </div>

        {/* Barra de progresso */}
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-blue-600 rounded-full transition-all" style={{ width: `${porcentagem}%` }}></div>
        </div>
        {/* Quantidade modúlos feitos */}
        <div className="mb-2 mt-2 text-gray-400 font-bold text-sm text-start">
          {concluidos} de {modulos.length} módulos concluídos · conclua um módulo para desbloquear o próximo
        </div>
      </div>

      {/* Mapa da trilha: um círculo com ícone por módulo */}
      <ol className="relative flex flex-col gap-6 py-4">
        {etapas.map(({ modulo, feitos: feitosModulo, total: totalModulo, estado }, indice) => {
          const Icone = modulo.icone;
          const anterior = modulos[indice - 1];
          // Ziguezague, como num mapa de jogo
          const deslocamento = ["ml-0", "ml-12", "ml-24", "ml-12", "ml-0"][indice % 5];

          const conteudo = (
            <div className={`flex items-center gap-4 ${deslocamento}`}>
              <div className={`relative w-16 h-16 shrink-0 rounded-full flex items-center justify-center shadow-md transition ${CIRCULO[estado]}`}>
                <Icone size={30} />
                {estado === "concluido" && (
                  <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white text-green-600 border-2 border-green-500 flex items-center justify-center">
                    <Check size={14} strokeWidth={3} />
                  </span>
                )}
                {estado === "bloqueado" && (
                  <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white text-gray-500 border-2 border-gray-300 flex items-center justify-center">
                    <Lock size={12} />
                  </span>
                )}
              </div>

              <div
                className={`flex-1 flex flex-col items-start gap-1 bg-white border rounded-lg px-4 py-3 shadow-sm ${
                  estado === "atual" ? "border-blue-300" : estado === "bloqueado" ? "opacity-70" : ""
                }`}
              >
                <div className="flex items-center gap-2">
                  <h2 className={`font-bold ${estado === "bloqueado" ? "text-gray-400" : ""}`}>
                    {modulo.numero}. {modulo.titulo}
                  </h2>
                  {estado === "atual" && (
                    <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white">
                      {feitosModulo === 0 ? "COMECE AQUI" : "CONTINUE"}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 text-start">
                  {estado === "bloqueado" && anterior
                    ? `Conclua o módulo ${anterior.numero} para desbloquear.`
                    : modulo.resumo}
                </p>
                {estado !== "bloqueado" && (
                  <div className="w-full flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${estado === "concluido" ? "bg-green-500" : "bg-blue-600"}`}
                        style={{ width: `${(feitosModulo / totalModulo) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-semibold text-gray-500">
                      {estado === "concluido" ? "Concluído" : `${feitosModulo} de ${totalModulo}`}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );

          return (
            <li key={modulo.id} className="relative">
              {estado === "bloqueado" ? (
                <div aria-disabled="true" title="Módulo bloqueado" className="cursor-not-allowed">
                  {conteudo}
                </div>
              ) : (
                <Link to={`/aluno/trilha/${modulo.id}`} className="block hover:scale-[1.01] transition">
                  {conteudo}
                </Link>
              )}
            </li>
          );
        })}

        {/* Fim da trilha */}
        <li className="flex items-center gap-4 ml-12">
          <div
            className={`w-16 h-16 shrink-0 rounded-full flex items-center justify-center shadow-md ${
              trilhaCompleta ? "bg-yellow-400 text-white" : "bg-gray-200 text-gray-400"
            }`}
          >
            <Trophy size={30} />
          </div>
          <p className={`font-bold ${trilhaCompleta ? "text-yellow-600" : "text-gray-400"}`}>
            {trilhaCompleta ? "Trilha completa! Parabéns!" : "Complete todos os módulos para ganhar o troféu"}
          </p>
        </li>
      </ol>
    </div>
  );
}
