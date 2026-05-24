import { Award, Clock, TrendingUp, Users } from "lucide-react";

export function ProgressoTurma() {
  return (
    <div className="h-screen flex flex-col gap-2 overflow-hidden overflow-y-auto bg-slate-50">
      {/* Cabeçalho */}
      <h1 className="text-black font-bold text-lg ">Progresso da Turma</h1>
      <h3 className="text-gray-400 font-semibold">
        Acompanhe o desempenho de cada aluno nas trilhas de aprendizado
      </h3>

      {/* Cards */}
      <div className="flex justify-between">
        <div className="flex items-center gap-1 justify-between">
          <div className="w-40 h-32 bg-white border border-gray-200 gap-2 items-start mb-12 flex flex-col justify-between rounded-lg">
            <div className="w-8 h-8 mt-2 bg-blue-100 flex text-start justify-start rounded-lg ml-2">
              <Users className="text-blue-600 mt-1 mb-1 mr-1 ml-1 " size={20} />
            </div>
            <div className="flex flex-col">
              <h3 className="text-gray-500 font-semibold ml-2 mb-2">
                Total de alunos
              </h3>
            </div>
            <h1 className="font-bold ml-6 mb-2">4</h1>
          </div>
        </div>
        <div className="flex items-center gap-1 justify-between">
          <div className="w-40 h-32 bg-white border border-gray-200 gap-2 items-start mb-12 flex flex-col justify-between rounded-lg">
            <div className="w-8 h-8 mt-2 bg-green-100 flex text-start justify-start rounded-lg ml-2">
              <TrendingUp
                className="text-green-600 mt-1 ml-1 mb-1 mr-1"
                size={20}
              />
            </div>
            <div className="flex flex-col">
              <h3 className="text-gray-500 font-semibold ml-2 mb-2">
                Progresso Médio
              </h3>
            </div>
            <h1 className=" font-bold ml-6 mb-2">60%</h1>
          </div>
        </div>
        <div className="flex items-center gap-1 justify-between">
          <div className="w-40 h-32 bg-white border border-gray-200 gap-2 items-start mb-12 flex flex-col justify-between rounded-lg">
            <div className="w-8 h-8 mt-2 bg-yellow-100 flex text-start justify-start rounded-lg ml-2">
              <Award
                className="text-yellow-600 mt-1 ml-1 mb-1 mr-1"
                size={20}
              />
            </div>
            <div className="flex flex-col">
              <h3 className="text-gray-500 font-semibold ml-2 mb-2">
                Mais Avançado
              </h3>
            </div>
            <h1 className=" font-bold ml-6 mb-2">Diana</h1>
          </div>
        </div>
        <div className="flex items-center gap-1 justify-between">
          <div className="w-40 h-32 bg-white border border-gray-200 gap-2 items-start mb-12 flex flex-col justify-between rounded-lg">
            <div className="w-8 h-8 mt-2 bg-red-100 flex text-start justify-start rounded-lg ml-2">
              <Clock className="text-red-600 mt-1 ml-1 mb-1 mr-1" size={20} />
            </div>
            <div className="flex flex-col">
              <h3 className="text-gray-500 font-semibold ml-2 mb-2">
                Precisam Atenção
              </h3>
            </div>
            <h1 className="font-bold ml-6 mb-2">1</h1>
          </div>
        </div>
      </div>

      {/* Desempenho individual */}
      <div className="w-full h-[40%] bg-white border border-gray-200 gap-2 mb-12 flex flex-col rounded-lg ">
        <div className="border-b border-gray-200 p-4 flex items-center justify-between">
          <h3 className="flex font-bold text-start ">Desempenho Individual</h3>
        </div>

        <div className="w-full flex flex-col bg-white border-b border-gray-200 gap-2 mb-4 rounded-lg ">
          <div className="w-full flex items-start gap-3 p-4">
            {/* Círculo DR */}
            <div className="w-10 h-10 rounded-full bg-purple-700 flex items-center justify-center text-white font-bold text-sm shrink-0">
              DR
            </div>

            {/* Conteúdo */}
            <div className="flex-1">
              {/* Linha de cima */}
              <div className="flex justify-between items-start mb-1">
                {/* Aluno */}
                <div>
                  <h3 className="font-bold text-sm text-gray-900 leading-none">
                    Diana Rocha
                  </h3>
                </div>

                {/* Direita */}
                <div className="flex items-center gap-3">
                  <span className="text-green-600 font-semibold text-xs">
                    Avançado
                  </span>

                  <span className="font-bold text-sm text-gray-800">100%</span>
                </div>
              </div>

              {/* Barra / porcentagem */}
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full w-full bg-green-600 rounded-full"></div>
              </div>

              {/* Descricao */}
              <p className="text-xs text-gray-400 mt-1">
                5 de 5 módulos concluídos
              </p>
            </div>
          </div>

          {/* Segundo aluno */}
          <div className="w-full h-[35%] bg-white border border-gray-200 gap-3 mb-1 rounded-lg ">
            <div className="w-full flex items-start gap-3 p-4">
              {/* Círculo DR */}
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                AS
              </div>

              {/* Conteúdo */}
              <div className="flex-1">
                {/* Linha de cima */}
                <div className="flex justify-between items-start mb-1">
                  {/* Aluno */}
                  <div>
                    <h3 className="font-bold text-sm text-gray-900 leading-none">
                      Ana Silva
                    </h3>
                  </div>

                  {/* Direita */}
                  <div className="flex items-center gap-3">
                    <span className="text-blue-600 font-semibold text-xs">
                      Regular
                    </span>

                    <span className="font-bold text-sm text-gray-800">60%</span>
                  </div>
                </div>

                {/* Barra / porcentagem */}
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full w-[60%] bg-blue-600 rounded-full"></div>
                </div>

                {/* Descricao */}
                <p className="text-xs text-gray-400 mt-1">
                  3 de 5 módulos concluídos
                </p>
              </div>
            </div>
          </div>

          {/* Terceiro aluno */}
          <div className="w-full h-[20%] bg-white border-b border-gray-200 gap-2 mb-2 rounded-lg ">
            <div className="w-full flex items-start gap-3 p-4">
              {/* Círculo DR */}
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                BS
              </div>

              {/* Conteúdo */}
              <div className="flex-1">
                {/* Linha de cima */}
                <div className="flex justify-between items-start mb-1">
                  {/* Aluno */}
                  <div>
                    <h3 className="font-bold text-sm text-gray-900 leading-none">
                      Bruno Souza
                    </h3>
                  </div>

                  {/* Direita */}
                  <div className="flex items-center gap-3">
                    <span className="text-orange-400 font-semibold text-xs">
                      Em progresso
                    </span>

                    <span className="font-bold text-sm text-gray-800">40%</span>
                  </div>
                </div>

                {/* Barra / porcentagem */}
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full w-[40%] bg-orange-400 rounded-full"></div>
                </div>

                {/* Descricao */}
                <p className="text-xs text-gray-400 mt-1">
                  2 de 5 módulos concluídos
                </p>
              </div>
            </div>
          </div>

          {/* Quarto aluno */}
          <div className="w-full h-[20%] bg-white border-b border-gray-200 gap-2 mb-12 rounded-lg ">
            <div className="w-full flex items-start gap-3 p-4">
              {/* Círculo DR */}
              <div className="w-10 h-10 rounded-full bg-purple-700 flex items-center justify-center text-white font-bold text-sm shrink-0">
                CL
              </div>

              {/* Conteúdo */}
              <div className="flex-1">
                {/* Linha de cima */}
                <div className="flex justify-between items-start mb-1">
                  {/* Aluno */}
                  <div>
                    <h3 className="font-bold text-sm text-gray-900 leading-none">
                      Carlos Lima
                    </h3>
                  </div>

                  {/* Direita */}
                  <div className="flex items-center gap-3">
                    <span className="text-red-600 font-semibold text-xs">
                      Atenção
                    </span>

                    <span className="font-bold text-sm text-gray-800">0%</span>
                  </div>
                </div>

                {/* Barra / porcentagem */}
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full w-[0%] bg-red-600 rounded-full"></div>
                </div>

                {/* Descricao */}
                <p className="text-xs text-gray-400 mt-1">
                  0 de 5 módulos concluídos
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
