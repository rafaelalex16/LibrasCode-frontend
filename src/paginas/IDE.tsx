import { Editor } from "@monaco-editor/react";
import { Play, Terminal } from "lucide-react";

export function IDE() {
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-slate-100 ">
      {/* Cabeçalho */}
      <header
        className="flex flex-row items-center justify-between 
        p-4 bg-white border-b border-b-gray-100"
      >
        <h1 className="font-semibold">LibrasCode IDE</h1>
        <button
          className="flex flex-row items-center gap-2 mt-5 ml-40 rounded-md bg-blue-600 text-sm text-white py-1 
             p-4 font-semibold text-white hover:bg-blue-400 transition"
        >
          <Play size={14} />
          Executar
        </button>
      </header>

      {/* Editor  */}
      <div className="flex-1 pt-5 bg-white">
        <Editor
          height="100%"
          language="python"
          theme="vs"
          options={{ fontSize: 16, minimap: { enabled: true } }}
        />
      </div>

      {/* Terminal */}
      <div className="h-[180px] bg-white border border-slate-200 flex flex-col shadow-sm rounded-xl mb-10">
        {/* Cabeçalho do terminal */}
        <div className="border-b flex items-center px-4 gap-2">
          <Terminal size={15} className="text-blue-600" />
          <span className="text-sm font-medium text-slate-700">Terminal</span>
        </div>
        {/*  saida do terminal */}
        <div className="flex-1 overflow-y-auto p-4 font-mono">
          {/*  Adicionar saida depois.... */}
        </div>
      </div>
    </div>
  );
}
