import { Copy, Plus, Trash2, UserMinus, Users } from "lucide-react";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useAuth } from "../../auth/contextoAuth";
import { supabase } from "../../supabase/cliente";
import { traduzirErro } from "../../supabase/tipos";

interface TurmaComAlunos {
  id: string;
  nome: string;
  codigo: string;
  matriculas: { aluno_id: string; perfis: { nome: string } | null }[];
}

// Professor cria turmas e compartilha o código para os alunos entrarem
export function Turmas() {
  const { perfil } = useAuth();
  const [turmas, setTurmas] = useState<TurmaComAlunos[]>([]);
  const [nome, setNome] = useState("");
  const [erro, setErro] = useState("");
  const [copiado, setCopiado] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    const { data, error } = await supabase
      .from("turmas")
      .select("id, nome, codigo, matriculas(aluno_id, perfis(nome))")
      .order("criado_em");
    if (error) setErro(traduzirErro(error.message));
    else setTurmas((data ?? []) as unknown as TurmaComAlunos[]);
  }, []);

  useEffect(() => {
    // Carrega as turmas ao abrir a tela (o setState acontece depois da resposta do banco)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void carregar();
  }, [carregar]);

  const criar = async (evento: FormEvent) => {
    evento.preventDefault();
    if (!perfil) return;
    setErro("");
    const { error } = await supabase.from("turmas").insert({ nome: nome.trim(), professor_id: perfil.id });
    if (error) return setErro(traduzirErro(error.message));
    setNome("");
    await carregar();
  };

  const apagar = async (turma: TurmaComAlunos) => {
    if (!window.confirm(`Apagar a turma "${turma.nome}"? As matrículas e o histórico das aulas também serão apagados.`)) return;
    const { error } = await supabase.from("turmas").delete().eq("id", turma.id);
    if (error) return setErro(traduzirErro(error.message));
    await carregar();
  };

  const removerAluno = async (turmaId: string, alunoId: string, nomeAluno: string) => {
    if (!window.confirm(`Remover ${nomeAluno} da turma?`)) return;
    const { error } = await supabase.from("matriculas").delete().eq("turma_id", turmaId).eq("aluno_id", alunoId);
    if (error) return setErro(traduzirErro(error.message));
    await carregar();
  };

  const copiarCodigo = async (codigo: string) => {
    await navigator.clipboard.writeText(codigo);
    setCopiado(codigo);
    window.setTimeout(() => setCopiado(null), 2000);
  };

  return (
    <div className="flex flex-col gap-4 text-start">
      <div>
        <h1 className="text-black font-bold text-lg">Minhas turmas</h1>
        <h3 className="text-gray-400 font-semibold">
          Compartilhe o código da turma com os alunos para eles entrarem no Portal do Aluno.
        </h3>
      </div>

      <form onSubmit={criar} className="flex gap-2 bg-white border rounded-lg p-3">
        <input
          required
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          maxLength={80}
          placeholder="Nome da nova turma (ex.: Desenvolvimento de Sistemas - 1º ano)"
          className="flex-1 border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-blue-500"
        />
        <button type="submit" className="flex items-center gap-1 rounded-md bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-500">
          <Plus size={16} />
          Criar turma
        </button>
      </form>

      {erro && <p className="text-sm font-semibold text-red-600">{erro}</p>}
      {turmas.length === 0 && <p className="text-sm text-gray-400">Você ainda não criou nenhuma turma.</p>}

      {turmas.map((turma) => (
        <div key={turma.id} className="bg-white border rounded-lg p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-bold">{turma.nome}</h2>
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <Users size={12} />
                {turma.matriculas.length} aluno(s)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => void copiarCodigo(turma.codigo)}
                title="Copiar código"
                className="flex items-center gap-2 rounded-md bg-blue-50 border border-blue-200 px-3 py-1 font-mono text-lg font-bold tracking-widest text-blue-700 hover:bg-blue-100"
              >
                {turma.codigo}
                <Copy size={14} />
              </button>
              {copiado === turma.codigo && <span className="text-xs font-semibold text-green-600">Copiado!</span>}
              <button onClick={() => void apagar(turma)} title="Apagar turma" className="rounded-md p-2 text-gray-400 hover:bg-red-50 hover:text-red-600">
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          {turma.matriculas.length > 0 && (
            <ul className="flex flex-wrap gap-2">
              {turma.matriculas.map(({ aluno_id, perfis }) => (
                <li key={aluno_id} className="flex items-center gap-1 rounded-full bg-slate-100 pl-3 pr-1 py-1 text-sm">
                  {perfis?.nome ?? "Aluno"}
                  <button
                    onClick={() => void removerAluno(turma.id, aluno_id, perfis?.nome ?? "o aluno")}
                    title="Remover da turma"
                    className="rounded-full p-1 text-gray-400 hover:bg-red-100 hover:text-red-600"
                  >
                    <UserMinus size={12} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}
