import { ArrowLeft, ArrowRight, CheckCircle2, Circle, Hand, Lock, PartyPopper, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { buscarTermo, textoParaSinalizar } from "../../glossario/glossario";
import { buscarModulo, modulos, type Modulo } from "../../trilha/conteudo";
import { ExercicioTrilha } from "../../trilha/ExercicioTrilha";
import {
  marcarPasso,
  marcarPergunta,
  moduloConcluido,
  moduloLiberado,
  useProgresso,
  type ProgressoModulo,
} from "../../trilha/progresso";
import { sinalizar } from "../../vlibras/vlibras";

type Aba = "tutorial" | "exercicio-0" | "exercicio-1" | "pergunta";

// Tutorial guiado: um passo por vez, com explicação SOV, exemplo e termos do glossário
function Tutorial({ modulo, aoTerminar }: { modulo: Modulo; aoTerminar: () => void }) {
  const [indice, setIndice] = useState(0);
  const passo = modulo.passos[indice];
  const ultimo = indice === modulo.passos.length - 1;

  useEffect(() => {
    marcarPasso(modulo.id, indice);
  }, [modulo.id, indice]);

  return (
    <div className="flex flex-col gap-3 text-start">
      <span className="text-xs font-bold text-gray-400">
        Passo {indice + 1} de {modulo.passos.length}
      </span>
      <div className="flex items-start justify-between gap-3">
        <h2 className="font-bold text-lg">{passo.titulo}</h2>
        <button
          onClick={() => sinalizar(`${passo.titulo}. ${passo.explicacaoSOV}`)}
          className="shrink-0 flex items-center gap-1 rounded-md bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-200"
        >
          <Hand size={12} />
          Ver em Libras
        </button>
      </div>
      <p className="rounded-lg bg-blue-50 p-3 font-semibold text-blue-800">{passo.explicacaoSOV}</p>
      {passo.exemplo && (
        <pre className="font-mono text-sm bg-slate-50 border rounded-md p-3 whitespace-pre-wrap text-slate-700">{passo.exemplo}</pre>
      )}
      <div className="flex flex-wrap gap-1">
        {passo.termos.map((nome) => {
          const termo = buscarTermo(nome);
          if (!termo) return null;
          return (
            <button
              key={nome}
              onClick={() => sinalizar(textoParaSinalizar(termo))}
              title={termo.explicacaoSOV}
              className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-semibold text-purple-700 hover:bg-purple-200"
            >
              {termo.termo}
            </button>
          );
        })}
      </div>

      <div className="flex justify-between pt-2">
        <button
          onClick={() => setIndice(indice - 1)}
          disabled={indice === 0}
          className="flex items-center gap-1 rounded-md border px-3 py-2 text-sm font-semibold text-gray-600 disabled:opacity-40"
        >
          <ArrowLeft size={14} />
          Anterior
        </button>
        <button
          onClick={() => (ultimo ? aoTerminar() : setIndice(indice + 1))}
          className="flex items-center gap-1 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-500"
        >
          {ultimo ? "Ir para o exercício" : "Próximo"}
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}

// Pergunta de conceito no fim do módulo
function Pergunta({ modulo, respondida }: { modulo: Modulo; respondida: boolean }) {
  const [escolha, setEscolha] = useState<number | null>(null);
  const { pergunta } = modulo;
  const acertou = escolha === pergunta.correta || (escolha === null && respondida);

  const responder = (opcao: number) => {
    setEscolha(opcao);
    if (opcao === pergunta.correta) marcarPergunta(modulo.id);
  };

  return (
    <div className="flex flex-col gap-3 text-start">
      <div className="flex items-start justify-between gap-3">
        <p className="font-semibold text-slate-800">{pergunta.pergunta}</p>
        <button
          onClick={() => sinalizar(pergunta.pergunta)}
          className="shrink-0 flex items-center gap-1 rounded-md bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-200"
        >
          <Hand size={12} />
          Ver em Libras
        </button>
      </div>
      <div className="flex flex-col gap-2">
        {pergunta.opcoes.map((opcao, indice) => (
          <button
            key={opcao}
            onClick={() => responder(indice)}
            className={`rounded-md border px-3 py-2 text-left text-sm transition ${
              escolha === indice
                ? indice === pergunta.correta
                  ? "border-green-500 bg-green-50 font-semibold"
                  : "border-red-400 bg-red-50"
                : "hover:bg-slate-50"
            }`}
          >
            {opcao}
          </button>
        ))}
      </div>
      {acertou && <p className="rounded-md bg-green-50 p-3 text-sm text-green-800">Certo! {pergunta.explicacao}</p>}
      {escolha !== null && escolha !== pergunta.correta && (
        <p className="rounded-md bg-red-50 p-3 text-sm text-red-800">Ainda não. Releia o tutorial e tente de novo.</p>
      )}
    </div>
  );
}

function abaConcluida(aba: Aba, modulo: Modulo, progresso?: ProgressoModulo) {
  if (!progresso) return false;
  if (aba === "tutorial") return progresso.passosVistos >= modulo.passos.length;
  if (aba === "pergunta") return progresso.pergunta === true;
  const exercicio = modulo.exercicios[Number(aba.split("-")[1])];
  return progresso.exercicios?.[exercicio.id]?.concluido === true;
}

export function ModuloTrilha() {
  const { modulo: moduloId = "" } = useParams();
  const modulo = buscarModulo(moduloId);
  const todoProgresso = useProgresso();
  const progresso = todoProgresso[moduloId];
  const [aba, setAba] = useState<Aba>("tutorial");

  // Módulo inexistente ou ainda bloqueado: volta para o mapa da Trilha
  if (!modulo || !moduloLiberado(modulo, todoProgresso)) return <Navigate to="/aluno/trilha" replace />;

  const Icone = modulo.icone;
  const anterior = modulos[modulo.numero - 2];
  const proximo = modulos[modulo.numero];
  const concluido = moduloConcluido(modulo, progresso);
  const abas: { id: Aba; nome: string }[] = [
    { id: "tutorial", nome: "Tutorial" },
    { id: "exercicio-0", nome: "Exercício 1" },
    { id: "exercicio-1", nome: "Exercício 2" },
    { id: "pergunta", nome: "Pergunta" },
  ];

  return (
    <div className="px-4 flex flex-col gap-4">
      <Link to="/aluno/trilha" className="flex items-center gap-1 text-sm font-semibold text-blue-600 hover:underline">
        <ArrowLeft size={14} />
        Voltar para a Trilha
      </Link>

      <div className="flex items-center gap-4 text-start">
        <div
          className={`w-14 h-14 shrink-0 rounded-full flex items-center justify-center shadow-md text-white ${
            concluido ? "bg-green-500" : "bg-blue-600"
          }`}
        >
          <Icone size={26} />
        </div>
        <div>
          <h1 className="font-bold text-xl">
            {modulo.numero}. {modulo.titulo}
          </h1>
          <p className="text-gray-500">{modulo.resumo}</p>
        </div>
      </div>

      {/* Recompensa ao concluir o módulo */}
      {concluido && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-start">
          <div className="flex items-center gap-3">
            {proximo ? <PartyPopper className="text-green-600 shrink-0" size={28} /> : <Trophy className="text-yellow-500 shrink-0" size={28} />}
            <div>
              <p className="font-bold text-green-800">Módulo concluído!</p>
              <p className="text-sm text-green-700">
                {proximo ? `O módulo ${proximo.numero}. ${proximo.titulo} foi desbloqueado.` : "Você completou toda a Trilha. Parabéns!"}
              </p>
            </div>
          </div>
          {proximo && (
            <Link
              to={`/aluno/trilha/${proximo.id}`}
              onClick={() => setAba("tutorial")}
              className="shrink-0 flex items-center gap-1 rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white hover:bg-green-500"
            >
              Ir para o próximo
              <ArrowRight size={14} />
            </Link>
          )}
        </div>
      )}

      <div className="bg-white border rounded-lg flex flex-col">
        <div className="border-b flex px-2">
          {abas.map(({ id, nome }) => (
            <button
              key={id}
              onClick={() => setAba(id)}
              className={`flex items-center gap-1 px-3 py-2 text-sm font-medium border-b-2 transition ${
                aba === id ? "border-blue-600 text-blue-600" : "border-transparent text-slate-600 hover:text-blue-600"
              }`}
            >
              {abaConcluida(id, modulo, progresso) ? (
                <CheckCircle2 size={14} className="text-green-600" />
              ) : (
                <Circle size={14} className="text-gray-300" />
              )}
              {nome}
            </button>
          ))}
        </div>

        <div className="p-4">
          {aba === "tutorial" && <Tutorial key={modulo.id} modulo={modulo} aoTerminar={() => setAba("exercicio-0")} />}
          {aba === "exercicio-0" && <ExercicioTrilha key={`${modulo.id}-0`} modulo={modulo} exercicio={modulo.exercicios[0]} />}
          {aba === "exercicio-1" && <ExercicioTrilha key={`${modulo.id}-1`} modulo={modulo} exercicio={modulo.exercicios[1]} />}
          {aba === "pergunta" && <Pergunta key={modulo.id} modulo={modulo} respondida={progresso?.pergunta === true} />}
        </div>
      </div>

      <div className="flex justify-between">
        {anterior ? (
          <Link to={`/aluno/trilha/${anterior.id}`} onClick={() => setAba("tutorial")} className="text-sm font-semibold text-blue-600 hover:underline">
            ← {anterior.numero}. {anterior.titulo}
          </Link>
        ) : (
          <span />
        )}
        {proximo &&
          (moduloLiberado(proximo, todoProgresso) ? (
            <Link to={`/aluno/trilha/${proximo.id}`} onClick={() => setAba("tutorial")} className="text-sm font-semibold text-blue-600 hover:underline">
              {proximo.numero}. {proximo.titulo} →
            </Link>
          ) : (
            <span className="flex items-center gap-1 text-sm text-gray-400">
              <Lock size={12} />
              Conclua este módulo para desbloquear o {proximo.numero}
            </span>
          ))}
      </div>
    </div>
  );
}
