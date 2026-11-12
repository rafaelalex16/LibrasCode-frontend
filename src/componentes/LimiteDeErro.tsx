import { AlertTriangle } from "lucide-react";
import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface Estado {
  erro: Error | null;
}

// Se uma tela quebrar, mostra o erro no lugar dela em vez de deixar a página toda em branco
export class LimiteDeErro extends Component<Props, Estado> {
  state: Estado = { erro: null };

  static getDerivedStateFromError(erro: Error): Estado {
    return { erro };
  }

  componentDidCatch(erro: Error, info: ErrorInfo) {
    console.error("Erro na tela do LibrasCode:", erro, info.componentStack);
  }

  render() {
    if (!this.state.erro) return this.props.children;

    return (
      <div className="m-6 p-6 bg-white rounded-lg border border-red-200 flex flex-col gap-3 text-start">
        <h2 className="flex items-center gap-2 font-bold text-red-600">
          <AlertTriangle size={18} />
          Esta tela encontrou um erro
        </h2>
        <pre className="font-mono text-xs whitespace-pre-wrap text-slate-600 bg-slate-50 rounded-md p-3">
          {this.state.erro.message}
        </pre>
        <button
          onClick={() => this.setState({ erro: null })}
          className="self-start rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
        >
          Tentar novamente
        </button>
      </div>
    );
  }
}
