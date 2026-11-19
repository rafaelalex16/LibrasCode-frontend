import { BookOpen, Hand, Search, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { normalizar } from "../../glossario/detectarTermos";
import { useGlossario } from "../../glossario/carregarGlossario";
import { sinalizarTermo } from "../../aprendizagem/eventos";
import type { Categoria } from "../../glossario/glossario";

// Os termos vêm da tabela "glossario" do Supabase (com a cópia embutida como reserva).

export function Dicionario() {
  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState<Categoria | null>(null);
  const glossario = useGlossario();
  const categorias = [...new Set(glossario.map((t) => t.categoria))];

  const termoBuscado = normalizar(busca);
  const filtrados = glossario.filter((termo) => {
    if (categoria && termo.categoria !== categoria) return false;
    if (!termoBuscado) return true;
    return normalizar(
      [termo.termo, termo.traducao, termo.explicacaoSOV, ...termo.sinonimos].join(" "),
    ).includes(termoBuscado);
  });
  const validados = glossario.filter((termo) => termo.validacao === "validado").length;

  return (
    <div className="h-screen overflow-y-auto bg-slate-100">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between p-4 bg-white border-b">
        <h1 className="font-semibold text-lg">Glossário Python ↔ Libras</h1>

        <h4 className="text-sm font-bold text-gray-500">
          {filtrados.length} de {glossario.length} termos
        </h4>
      </div>

      <p className="px-4 pt-3 text-xs text-gray-500 text-start">
        Explicações na estrutura SOV da Libras. {validados} de {glossario.length} termos validados pela
        comissão técnica (intérpretes Prolibras + especialistas em T.I.).
      </p>

      {/* Pesquisa */}
      <div className="p-4 flex flex-col gap-3">
        <div className="bg-white rounded-xl border shadow-sm flex items-center px-4 py-3">
          <Search size={18} className="text-gray-400" />

          <input
            type="text"
            placeholder="Pesquisar termo, tradução ou explicação..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full ml-3 outline-none bg-transparent"
          />
        </div>

        {/* Categorias */}
        <div className="flex flex-wrap gap-2">
          {[null, ...categorias].map((opcao) => (
            <button
              key={opcao ?? "todas"}
              onClick={() => setCategoria(opcao)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                categoria === opcao ? "bg-purple-600 text-white" : "bg-white border text-gray-600 hover:bg-purple-50"
              }`}
            >
              {opcao ?? "Todas"}
            </button>
          ))}
        </div>
      </div>

      {/* Cards */}
      <div className="px-4 pb-5 flex flex-col gap-5">
        {filtrados.length === 0 && <p className="text-sm text-gray-400">Nenhum termo encontrado.</p>}

        {filtrados.map((termo) => (
          <div key={termo.termo} className="bg-white rounded-2xl border overflow-hidden text-start">
            {/* Topo */}
            <div className="flex items-center justify-between gap-2 p-3 border-b">
              <div className="flex items-center gap-2 flex-wrap">
                <BookOpen size={18} className="text-purple-600" />
                <h2 className={`font-bold text-2sm ${termo.ehCodigo ? "font-mono" : "capitalize"}`}>{termo.termo}</h2>
                {termo.traducao !== termo.termo && <span className="text-sm text-gray-500">{termo.traducao}</span>}
                <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-semibold text-purple-700">
                  {termo.categoria}
                </span>
              </div>

              <button
                onClick={() => sinalizarTermo(termo, "glossario")}
                className="shrink-0 flex items-center gap-1 rounded-md bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-200"
              >
                <Hand size={12} />
                Ver em Libras
              </button>
            </div>

            {/* Conteúdo */}
            <div className="p-3 flex flex-col gap-2">
              <p className="text-gray-700 font-medium">{termo.explicacaoSOV}</p>

              {termo.exemplo && (
                <pre className="font-mono text-xs bg-slate-50 border rounded-md p-2 whitespace-pre-wrap text-slate-700">
                  {termo.exemplo}
                </pre>
              )}

              {termo.video && <video src={termo.video} controls className="w-full max-w-sm rounded-md" />}

              <span
                className={`flex items-center gap-1 text-[11px] font-semibold ${
                  termo.validacao === "validado" ? "text-green-600" : "text-yellow-600"
                }`}
              >
                <ShieldCheck size={12} />
                {termo.validacao === "validado" ? "Sinal validado pela comissão" : "Validação Prolibras pendente"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
