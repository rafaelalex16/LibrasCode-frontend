// Tipos das tabelas do banco (LibrasCode-backend/supabase/migrations)

export type Papel = "aluno" | "professor";

export interface Perfil {
  id: string;
  nome: string;
  papel: Papel;
  menor_de_idade: boolean;
  responsavel_nome: string | null;
  consentimento_em: string;
  versao_termos: string;
  criado_em: string;
}

export interface Turma {
  id: string;
  nome: string;
  codigo: string;
  professor_id: string;
  criado_em: string;
}

// Versão da política de privacidade aceita no cadastro
export const VERSAO_TERMOS = "2026-11-19";

export function portalDoPapel(papel: Papel) {
  return papel === "professor" ? "/professor" : "/aluno";
}

// Mensagens do Supabase Auth traduzidas para o aluno e o professor
const ERROS_AUTH: [RegExp, string][] = [
  [/invalid login credentials/i, "E-mail ou senha incorretos."],
  [/email not confirmed/i, "Confirme seu e-mail pelo link que enviamos antes de entrar."],
  [/already registered|already exists/i, "Já existe uma conta com este e-mail."],
  [/password should be at least/i, "A senha precisa ter pelo menos 6 caracteres."],
  [/unable to validate email|invalid email/i, "E-mail inválido."],
  [/rate limit|too many/i, "Muitas tentativas. Espere alguns minutos e tente de novo."],
  [/database error saving new user/i, "Não foi possível criar o perfil. Confira se aceitou a política de privacidade e preencheu o responsável."],
  [/failed to fetch|network/i, "Sem conexão com o servidor. Verifique a internet."],
];

export function traduzirErro(mensagem: string) {
  return ERROS_AUTH.find(([padrao]) => padrao.test(mensagem))?.[1] ?? mensagem;
}
