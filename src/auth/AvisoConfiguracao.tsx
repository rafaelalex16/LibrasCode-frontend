import { Database } from "lucide-react";

// Mostrado quando o arquivo .env do frontend ainda não tem os dados do Supabase
export function AvisoConfiguracao() {
  return (
    <div className="h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-lg bg-white border rounded-xl p-6 flex flex-col gap-3 text-start">
        <h1 className="flex items-center gap-2 font-bold text-lg">
          <Database size={20} className="text-blue-600" />
          Banco de dados não configurado
        </h1>
        <p className="text-sm text-gray-600">
          Crie o arquivo <span className="font-mono">.env</span> na pasta do frontend (copie de{" "}
          <span className="font-mono">.env.example</span>) com os dados do projeto Supabase e reinicie o{" "}
          <span className="font-mono">npm run dev</span>:
        </p>
        <pre className="font-mono text-xs bg-slate-50 border rounded-md p-3">
          {"VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co\nVITE_SUPABASE_ANON_KEY=sua-chave-anon"}
        </pre>
      </div>
    </div>
  );
}
