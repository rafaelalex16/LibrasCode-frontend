import type { Monaco } from "@monaco-editor/react";
import type { editor, Position } from "monaco-editor";
import { glossario, type TermoGlossario } from "../glossario/glossario";

// Sugestões preditivas e explicações em Libras dentro do editor Monaco

// Termos que podem ser escritos no código (palavras-chave, funções, métodos)
const termosDeCodigo = glossario.filter((t) => t.ehCodigo && /^[A-Za-z_]\w*$/.test(t.termo));
const termosPorNome = new Map(termosDeCodigo.map((t) => [t.termo, t]));

// Modelos inseridos ao aceitar a sugestão ($1, $2... são os campos que o aluno preenche)
const MODELOS: Record<string, string> = {
  if: "if ${1:condicao}:\n\t$0",
  elif: "elif ${1:condicao}:\n\t$0",
  else: "else:\n\t$0",
  while: "while ${1:condicao}:\n\t$0",
  for: "for ${1:item} in ${2:lista}:\n\t$0",
  def: "def ${1:nome}(${2:parametros}):\n\t$0",
  class: "class ${1:Nome}:\n\tdef __init__(self${2}):\n\t\t$0",
  try: "try:\n\t$1\nexcept ${2:Exception} as erro:\n\t$0",
  with: 'with open("${1:arquivo.txt}") as ${2:arquivo}:\n\t$0',
  match: "match ${1:valor}:\n\tcase ${2:1}:\n\t\t$0",
  print: "print($0)",
  input: 'input("${1:Digite: }")',
  range: "range(${1:10})",
  __init__: "__init__(self${1}):\n\t$0",
};

// Palavras-chave e módulos: inseridos sem parênteses
const SEM_PARENTESES = new Set([
  "and", "or", "not", "in", "is", "as", "from", "import", "global", "nonlocal", "pass", "break",
  "continue", "return", "yield", "lambda", "del", "raise", "assert", "async", "await", "case",
  "except", "finally", "self", "math", "random", "datetime", "time", "os", "sys", "json", "pip",
]);

// Funções e métodos: ao aceitar a sugestão os parênteses já vêm junto
function ehChamavel(termo: TermoGlossario) {
  return /^[a-z]/.test(termo.termo) && !SEM_PARENTESES.has(termo.termo);
}

export function buscarTermoDeCodigo(palavra: string): TermoGlossario | undefined {
  return termosPorNome.get(palavra);
}

function documentacao(termo: TermoGlossario) {
  const exemplo = termo.exemplo ? `\n\n\`\`\`python\n${termo.exemplo}\n\`\`\`` : "";
  return `**Libras (SOV):** ${termo.explicacaoSOV}${exemplo}`;
}

let registrado = false;

export function registrarSugestoesLibras(monaco: Monaco) {
  if (registrado) return;
  registrado = true;

  monaco.languages.registerCompletionItemProvider("python", {
    provideCompletionItems(modelo: editor.ITextModel, posicao: Position) {
      const palavra = modelo.getWordUntilPosition(posicao);
      const intervalo = new monaco.Range(posicao.lineNumber, palavra.startColumn, posicao.lineNumber, palavra.endColumn);

      return {
        suggestions: termosDeCodigo.map((termo) => {
          const snippet = MODELOS[termo.termo];
          const chamavel = !snippet && ehChamavel(termo);
          return {
            label: { label: termo.termo, description: termo.traducao },
            kind: snippet
              ? monaco.languages.CompletionItemKind.Snippet
              : chamavel
                ? monaco.languages.CompletionItemKind.Function
                : monaco.languages.CompletionItemKind.Keyword,
            detail: `${termo.traducao} — ${termo.explicacaoSOV}`,
            documentation: { value: documentacao(termo) },
            insertText: snippet ?? (chamavel ? `${termo.termo}($0)` : termo.termo),
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range: intervalo,
          };
        }),
      };
    },
  });

  monaco.languages.registerHoverProvider("python", {
    provideHover(modelo: editor.ITextModel, posicao: Position) {
      const palavra = modelo.getWordAtPosition(posicao);
      const termo = palavra && buscarTermoDeCodigo(palavra.word);
      if (!palavra || !termo) return null;
      return {
        range: new monaco.Range(posicao.lineNumber, palavra.startColumn, posicao.lineNumber, palavra.endColumn),
        contents: [{ value: `**${termo.termo}** — ${termo.traducao}` }, { value: documentacao(termo) }],
      };
    },
  });
}
