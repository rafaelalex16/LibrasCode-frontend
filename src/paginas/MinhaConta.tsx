import { Download, Save, Trash2, UserRound } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/contextoAuth";
import { supabase } from "../supabase/cliente";
import { traduzirErro } from "../supabase/tipos";

// Direitos do titular (LGPD): ver, corrigir, baixar e excluir os próprios dados
export function MinhaConta() {
  const { sessao, perfil, sair, recarregarPerfil } = useAuth();
  const navigate = useNavigate();
  const [nome, setNome] = useState(perfil?.nome ?? "");
  const [confirmacao, setConfirmacao] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  if (!perfil) return null;

  const salvarNome = async () => {
    setErro("");
    setMensagem("");
    const { error } = await supabase.from("perfis").update({ nome: nome.trim() }).eq("id", perfil.id);
    if (error) return setErro(traduzirErro(error.message));
    await recarregarPerfil();
    setMensagem("Nome atualizado.");
  };

  const baixarDados = async () => {
    const [turmasProfessor, matriculas, eventos] = await Promise.all([
      supabase.from("turmas").select("nome, codigo, criado_em").eq("professor_id", perfil.id),
      supabase.from("matriculas").select("criado_em, turmas(nome)").eq("aluno_id", perfil.id),
      supabase.from("eventos_aprendizagem").select("tipo, modulo, item, termo, erro_tipo, aprovado, criado_em").eq("aluno_id", perfil.id),
    ]);
    const dados = {
      exportado_em: new Date().toISOString(),
      email: sessao?.user.email,
      perfil,
      turmas_que_ensina: turmasProfessor.data ?? [],
      matriculas: matriculas.data ?? [],
      eventos_de_aprendizagem: eventos.data ?? [],
    };
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([JSON.stringify(dados, null, 2)], { type: "application/json" }));
    link.download = "meus-dados-librascode.json";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const excluirConta = async () => {
    setErro("");
    const { error } = await supabase.rpc("excluir_minha_conta");
    if (error) return setErro(traduzirErro(error.message));
    await sair();
    navigate("/home", { replace: true });
  };

  return (
    <div className="flex flex-col gap-4 text-start">
      <h1 className="flex items-center gap-2 font-bold text-lg">
        <UserRound size={20} />
        Minha conta
      </h1>

      <div className="bg-white border rounded-lg p-4 flex flex-col gap-3">
        <label className="text-sm font-semibold text-gray-700 flex flex-col gap-1">
          Nome
          <div className="flex gap-2">
            <input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              maxLength={120}
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-blue-500"
            />
            <button
              onClick={() => void salvarNome()}
              disabled={!nome.trim() || nome.trim() === perfil.nome}
              className="flex items-center gap-1 rounded-md bg-blue-600 px-3 text-sm font-semibold text-white disabled:opacity-50"
            >
              <Save size={14} />
              Salvar
            </button>
          </div>
        </label>
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
          <dt className="text-gray-500">E-mail</dt>
          <dd>{sessao?.user.email}</dd>
          <dt className="text-gray-500">Perfil</dt>
          <dd className="capitalize">{perfil.papel}</dd>
          {perfil.responsavel_nome && (
            <>
              <dt className="text-gray-500">Responsável</dt>
              <dd>{perfil.responsavel_nome}</dd>
            </>
          )}
          <dt className="text-gray-500">Privacidade aceita em</dt>
          <dd>
            {new Date(perfil.consentimento_em).toLocaleDateString("pt-BR")} (versão {perfil.versao_termos}) ·{" "}
            <Link to="/privacidade" target="_blank" className="text-blue-600 underline">
              ver política
            </Link>
          </dd>
        </dl>
        {mensagem && <p className="text-sm font-semibold text-green-600">{mensagem}</p>}
      </div>

      <div className="bg-white border rounded-lg p-4 flex flex-col gap-2">
        <h2 className="font-bold text-sm">Meus dados</h2>
        <p className="text-sm text-gray-500">Baixe uma cópia dos dados que o LibrasCode guarda sobre você.</p>
        <button
          onClick={() => void baixarDados()}
          className="self-start flex items-center gap-2 rounded-md bg-blue-100 px-3 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-200"
        >
          <Download size={14} />
          Baixar meus dados
        </button>
      </div>

      <div className="bg-white border border-red-200 rounded-lg p-4 flex flex-col gap-2">
        <h2 className="font-bold text-sm text-red-600">Excluir conta</h2>
        <p className="text-sm text-gray-600">
          Apaga sua conta e seus dados.
          {perfil.papel === "professor" && " As suas turmas e o histórico das aulas delas também serão apagados."}{" "}
          Não é possível desfazer. Para confirmar, digite <span className="font-mono font-bold">EXCLUIR</span>.
        </p>
        <div className="flex gap-2">
          <input
            value={confirmacao}
            onChange={(e) => setConfirmacao(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-red-400"
          />
          <button
            onClick={() => void excluirConta()}
            disabled={confirmacao !== "EXCLUIR"}
            className="flex items-center gap-1 rounded-md bg-red-600 px-3 text-sm font-semibold text-white disabled:opacity-50"
          >
            <Trash2 size={14} />
            Excluir minha conta
          </button>
        </div>
      </div>

      {erro && <p className="text-sm font-semibold text-red-600">{erro}</p>}
    </div>
  );
}
