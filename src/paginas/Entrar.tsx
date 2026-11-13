import { Code2, Loader2 } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AvisoConfiguracao } from "../auth/AvisoConfiguracao";
import { useAuth } from "../auth/contextoAuth";
import { supabase, supabaseConfigurado } from "../supabase/cliente";
import { portalDoPapel, traduzirErro, VERSAO_TERMOS, type Papel } from "../supabase/tipos";

type Modo = "entrar" | "cadastrar";

const campo = "w-full border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-blue-500";

export function Entrar() {
  const { sessao, perfil } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const destino = (location.state as { de?: string } | null)?.de;

  const [modo, setModo] = useState<Modo>("entrar");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [nome, setNome] = useState("");
  const [papel, setPapel] = useState<Papel>("aluno");
  const [menorDeIdade, setMenorDeIdade] = useState(false);
  const [responsavel, setResponsavel] = useState("");
  const [responsavelAutorizou, setResponsavelAutorizou] = useState(false);
  const [aceitouPrivacidade, setAceitouPrivacidade] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");

  // Já logado: vai para o portal certo
  useEffect(() => {
    if (!sessao || !perfil) return;
    const portal = portalDoPapel(perfil.papel);
    navigate(destino?.startsWith(portal) ? destino : portal, { replace: true });
  }, [sessao, perfil, destino, navigate]);

  if (!supabaseConfigurado) return <AvisoConfiguracao />;

  const enviar = async (evento: FormEvent) => {
    evento.preventDefault();
    setErro("");
    setAviso("");

    if (modo === "cadastrar") {
      if (!aceitouPrivacidade) return setErro("É preciso aceitar a Política de Privacidade.");
      if (menorDeIdade && (!responsavel.trim() || !responsavelAutorizou)) {
        return setErro("Menores de 18 anos precisam informar o responsável e ter a autorização dele.");
      }
    }

    setEnviando(true);
    const { data, error } =
      modo === "entrar"
        ? await supabase.auth.signInWithPassword({ email, password: senha })
        : await supabase.auth.signUp({
            email,
            password: senha,
            options: {
              emailRedirectTo: `${window.location.origin}/entrar`,
              data: {
                nome: nome.trim(),
                papel,
                menor_de_idade: menorDeIdade,
                responsavel_nome: menorDeIdade ? responsavel.trim() : null,
                consentimento_lgpd: true,
                versao_termos: VERSAO_TERMOS,
              },
            },
          });
    setEnviando(false);

    if (error) return setErro(traduzirErro(error.message));
    if (modo === "cadastrar" && !data.session) {
      setAviso("Conta criada! Enviamos um link de confirmação para o seu e-mail. Depois de confirmar, entre aqui.");
      setModo("entrar");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md bg-white border rounded-2xl shadow-sm p-6 flex flex-col gap-5">
        <Link to="/home" className="flex items-center gap-3 self-center">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
            <Code2 className="text-white" size={22} />
          </div>
          <span className="text-2xl font-extrabold text-slate-800">LibrasCode</span>
        </Link>

        {/* Abas */}
        <div className="grid grid-cols-2 bg-slate-100 rounded-lg p-1">
          {(["entrar", "cadastrar"] as Modo[]).map((opcao) => (
            <button
              key={opcao}
              type="button"
              onClick={() => {
                setModo(opcao);
                setErro("");
              }}
              className={`rounded-md py-2 text-sm font-semibold transition ${
                modo === opcao ? "bg-white text-blue-600 shadow-sm" : "text-gray-500"
              }`}
            >
              {opcao === "entrar" ? "Entrar" : "Criar conta"}
            </button>
          ))}
        </div>

        <form onSubmit={enviar} className="flex flex-col gap-3 text-start">
          {modo === "cadastrar" && (
            <>
              <label className="text-sm font-semibold text-gray-700">
                Nome
                <input required value={nome} onChange={(e) => setNome(e.target.value)} className={campo} maxLength={120} />
              </label>

              <fieldset className="flex gap-2">
                {(["aluno", "professor"] as Papel[]).map((opcao) => (
                  <label
                    key={opcao}
                    className={`flex-1 cursor-pointer rounded-md border px-3 py-2 text-center text-sm font-semibold ${
                      papel === opcao ? "border-blue-600 bg-blue-50 text-blue-600" : "border-gray-300 text-gray-600"
                    }`}
                  >
                    <input type="radio" name="papel" className="sr-only" checked={papel === opcao} onChange={() => setPapel(opcao)} />
                    {opcao === "aluno" ? "Sou aluno" : "Sou professor"}
                  </label>
                ))}
              </fieldset>
            </>
          )}

          <label className="text-sm font-semibold text-gray-700">
            E-mail
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={campo} autoComplete="email" />
          </label>
          <label className="text-sm font-semibold text-gray-700">
            Senha
            <input
              required
              type="password"
              minLength={6}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className={campo}
              autoComplete={modo === "entrar" ? "current-password" : "new-password"}
            />
          </label>

          {modo === "cadastrar" && (
            <div className="flex flex-col gap-2 rounded-lg bg-slate-50 border p-3">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={menorDeIdade} onChange={(e) => setMenorDeIdade(e.target.checked)} className="accent-blue-600" />
                Tenho menos de 18 anos
              </label>

              {menorDeIdade && (
                <>
                  <label className="text-sm font-semibold text-gray-700">
                    Nome do responsável
                    <input value={responsavel} onChange={(e) => setResponsavel(e.target.value)} className={campo} maxLength={120} />
                  </label>
                  <label className="flex items-start gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={responsavelAutorizou}
                      onChange={(e) => setResponsavelAutorizou(e.target.checked)}
                      className="accent-blue-600 mt-1"
                    />
                    Meu responsável leu a Política de Privacidade e autorizou o uso do LibrasCode.
                  </label>
                </>
              )}

              <label className="flex items-start gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={aceitouPrivacidade}
                  onChange={(e) => setAceitouPrivacidade(e.target.checked)}
                  className="accent-blue-600 mt-1"
                />
                <span>
                  Li e aceito a{" "}
                  <Link to="/privacidade" target="_blank" className="text-blue-600 underline">
                    Política de Privacidade
                  </Link>
                  .
                </span>
              </label>
            </div>
          )}

          {erro && <p className="text-sm font-semibold text-red-600">{erro}</p>}
          {aviso && <p className="text-sm font-semibold text-green-600">{aviso}</p>}

          <button
            type="submit"
            disabled={enviando}
            className="flex items-center justify-center gap-2 rounded-md bg-blue-600 py-2 font-semibold text-white hover:bg-blue-500 disabled:opacity-60"
          >
            {enviando && <Loader2 size={16} className="animate-spin" />}
            {modo === "entrar" ? "Entrar" : "Criar conta"}
          </button>
        </form>
      </div>
    </div>
  );
}
