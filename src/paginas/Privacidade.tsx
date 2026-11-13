import { ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { VERSAO_TERMOS } from "../supabase/tipos";

// Política de privacidade (LGPD - Lei nº 13.709/2018). Texto base: deve ser revisado pela escola/SEDUC.
const SECOES: [string, string[]][] = [
  ["Quais dados coletamos", [
    "Nome, e-mail e senha (a senha é guardada de forma criptografada pelo Supabase).",
    "Se você é aluno ou professor e, para menores de 18 anos, o nome do responsável.",
    "As turmas que você participa.",
    "O texto transcrito da fala do professor durante a aula ao vivo. O áudio não é gravado nem guardado.",
  ]],
  ["Para que usamos", [
    "Permitir o acesso à plataforma e às turmas.",
    "Mostrar a transcrição e a sinalização em Libras da aula ao vivo e guardar o histórico para revisão.",
    "Não vendemos nem compartilhamos seus dados com terceiros para publicidade.",
  ]],
  ["Quem pode ver", [
    "Você vê apenas os seus dados e os das turmas que participa.",
    "O professor vê o nome dos alunos matriculados nas turmas dele.",
    "O código que você escreve na IDE fica só no seu navegador.",
  ]],
  ["Crianças e adolescentes", [
    "Menores de 18 anos só podem criar conta com a autorização de um responsável, informado no cadastro.",
  ]],
  ["Seus direitos", [
    "Em \"Minha conta\" você pode ver e baixar seus dados, corrigir seu nome e excluir sua conta.",
    "Ao excluir a conta, seus dados são apagados do banco de dados. Se você é professor, as suas turmas e o histórico delas também são apagados.",
  ]],
  ["Onde os dados ficam", [
    "Em um banco de dados Supabase, protegido por regras de acesso que impedem que uma pessoa veja dados de turmas das quais não participa.",
  ]],
];

export function Privacidade() {
  return (
    <div className="min-h-screen overflow-y-auto bg-slate-50 px-4 py-10">
      <div className="max-w-2xl mx-auto bg-white border rounded-2xl p-6 flex flex-col gap-5 text-start">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-800">
          <ShieldCheck className="text-blue-600" />
          Política de Privacidade
        </h1>
        <p className="text-sm text-gray-500">
          LibrasCode · versão {VERSAO_TERMOS} · de acordo com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).
        </p>

        {SECOES.map(([titulo, itens]) => (
          <section key={titulo} className="flex flex-col gap-2">
            <h2 className="font-bold text-slate-700">{titulo}</h2>
            <ul className="list-disc pl-5 text-sm text-gray-700 flex flex-col gap-1">
              {itens.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        ))}

        <Link to="/entrar" className="self-start text-sm font-semibold text-blue-600 underline">
          Voltar
        </Link>
      </div>
    </div>
  );
}
