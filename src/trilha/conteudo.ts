// Conteúdo da Trilha: 5 módulos do nível introdutório de Python.
// Cada módulo tem tutorial guiado (explicações em estrutura SOV), 2 exercícios de código e 1 pergunta.
// Os "termos" são nomes do glossário (src/glossario/glossario.ts).

import { GitBranch, Keyboard, ListOrdered, Monitor, Repeat, type LucideIcon } from "lucide-react";

export interface PassoTutorial {
  titulo: string;
  explicacaoSOV: string;
  exemplo?: string;
  termos: string[];
}

// Uma execução do exercício: respostas dos input() e a saída que o programa deve mostrar
export interface CasoTeste {
  entradas: string[];
  saidaEsperada: string;
}

export interface Exercicio {
  id: string;
  enunciado: string;
  codigoInicial: string;
  casos: CasoTeste[];
  precisaUsar?: string; // comando que o código precisa usar (ex.: "for")
  dica: string;
}

export interface PerguntaConceito {
  pergunta: string;
  opcoes: string[];
  correta: number;
  explicacao: string;
}

export interface Modulo {
  id: string;
  numero: number;
  titulo: string;
  icone: LucideIcon; // ícone que representa o assunto do módulo
  resumo: string;
  passos: PassoTutorial[];
  exercicios: [Exercicio, Exercicio];
  pergunta: PerguntaConceito;
}

const COMECE_AQUI = "# Escreva seu código abaixo\n";

export const modulos: Modulo[] = [
  {
    id: "mostrar-na-tela",
    numero: 1,
    titulo: "Mostrar na tela",
    icone: Monitor,
    resumo: "Use print para mostrar mensagens e valores.",
    passos: [
      {
        titulo: "O comando print",
        explicacaoSOV: "Computador mensagem na tela mostra.",
        exemplo: 'print("Olá, mundo!")',
        termos: ["print"],
      },
      {
        titulo: "Texto entre aspas",
        explicacaoSOV: "Texto entre aspas Python igual mostra; sem aspas Python nome de variável procura.",
        exemplo: 'print("Libras")',
        termos: ["aspas", "str"],
      },
      {
        titulo: "Vários valores na mesma linha",
        explicacaoSOV: "Vírgula valores separa; Python espaço entre eles coloca.",
        exemplo: 'print("Idade:", 15)',
        termos: ["print"],
      },
      {
        titulo: "Comentários",
        explicacaoSOV: "Programador depois do # explicação escreve; computador ignora.",
        exemplo: '# isto não aparece\nprint("isto aparece")',
        termos: ["comentário"],
      },
    ],
    exercicios: [
      {
        id: "frase",
        enunciado: "Mostre na tela a frase: Eu programo em Python",
        codigoInicial: COMECE_AQUI,
        casos: [{ entradas: [], saidaEsperada: "Eu programo em Python" }],
        precisaUsar: "print",
        dica: "Use print com a frase entre aspas.",
      },
      {
        id: "duas-linhas",
        enunciado: "Mostre duas linhas: na primeira, Desenvolvimento de Sistemas; na segunda, Turma 2026.",
        codigoInicial: COMECE_AQUI,
        casos: [{ entradas: [], saidaEsperada: "Desenvolvimento de Sistemas\nTurma 2026" }],
        precisaUsar: "print",
        dica: "Cada print mostra uma linha. Use um print para cada frase.",
      },
    ],
    pergunta: {
      pergunta: "O que o comando print faz?",
      opcoes: ["Guarda um valor na memória", "Mostra uma mensagem na tela", "Lê o que o usuário digita", "Repete um bloco de código"],
      correta: 1,
      explicacao: "print mostra na tela. Para ler o teclado usamos input.",
    },
  },
  {
    id: "variaveis-entrada",
    numero: 2,
    titulo: "Variáveis e entrada",
    icone: Keyboard,
    resumo: "Guarde valores em variáveis e leia o que o usuário digita.",
    passos: [
      {
        titulo: "Variável",
        explicacaoSOV: "Memória valor guarda; nome da variável etiqueta funciona.",
        exemplo: 'nome = "Ana"\nprint(nome)',
        termos: ["variável", "atribuição"],
      },
      {
        titulo: "Números",
        explicacaoSOV: "Número sem aspas escreve; Python conta faz.",
        exemplo: "idade = 15\nprint(idade + 1)",
        termos: ["int", "float"],
      },
      {
        titulo: "O comando input",
        explicacaoSOV: "Usuário pelo teclado texto digita; input esse texto devolve.",
        exemplo: 'nome = input("Seu nome: ")\nprint("Olá,", nome)',
        termos: ["input"],
      },
      {
        titulo: "Transformar texto em número",
        explicacaoSOV: "input sempre texto devolve; int texto em número inteiro transforma.",
        exemplo: 'idade = int(input("Idade: "))\nprint(idade + 1)',
        termos: ["conversão de tipo", "int"],
      },
    ],
    exercicios: [
      {
        id: "boas-vindas",
        enunciado: "Leia o nome do aluno com input e mostre: Bem-vindo, <nome>",
        codigoInicial: COMECE_AQUI,
        casos: [
          { entradas: ["Ana"], saidaEsperada: "Bem-vindo, Ana" },
          { entradas: ["Caio"], saidaEsperada: "Bem-vindo, Caio" },
        ],
        precisaUsar: "input",
        dica: 'Guarde o nome numa variável e use print("Bem-vindo,", nome).',
      },
      {
        id: "ano-que-vem",
        enunciado: "Leia a idade do aluno (número inteiro) e mostre só o número da idade que ele terá no ano que vem.",
        codigoInicial: COMECE_AQUI,
        casos: [
          { entradas: ["15"], saidaEsperada: "16" },
          { entradas: ["17"], saidaEsperada: "18" },
        ],
        precisaUsar: "int",
        dica: "Use int(input()) para transformar o texto em número e some 1.",
      },
    ],
    pergunta: {
      pergunta: "Por que usamos int(input()) para ler a idade?",
      opcoes: [
        "Porque input devolve texto, e int transforma em número",
        "Para mostrar a idade na tela",
        "Para guardar a idade sem variável",
        "Porque int repete a pergunta",
      ],
      correta: 0,
      explicacao: "input sempre devolve texto. Para fazer conta, int transforma o texto em número inteiro.",
    },
  },
  {
    id: "condicoes",
    numero: 3,
    titulo: "Condições",
    icone: GitBranch,
    resumo: "Use if e else para o programa escolher um caminho.",
    passos: [
      {
        titulo: "O comando if",
        explicacaoSOV: "Programa condição testa; verdadeira, bloco executa.",
        exemplo: 'nota = 8\nif nota >= 7:\n    print("Aprovado")',
        termos: ["if", "condição"],
      },
      {
        titulo: "Comparações",
        explicacaoSOV: "Operadores dois valores comparam: maior, menor, igual, diferente.",
        exemplo: "print(5 > 3)\nprint(5 == 3)",
        termos: [">", "==", "!="],
      },
      {
        titulo: "O comando else",
        explicacaoSOV: "Condição falsa, programa caminho do else executa.",
        exemplo: 'idade = 15\nif idade >= 18:\n    print("Maior de idade")\nelse:\n    print("Menor de idade")',
        termos: ["else"],
      },
      {
        titulo: "Espaços do bloco",
        explicacaoSOV: "Dois-pontos bloco começa; linhas com espaços na frente bloco formam.",
        exemplo: 'if 2 > 1:\n    print("dentro do if")\nprint("fora do if")',
        termos: ["dois-pontos", "indentação"],
      },
    ],
    exercicios: [
      {
        id: "aprovado",
        enunciado: "Leia uma nota (número inteiro). Se for 7 ou mais, mostre Aprovado; senão, mostre Recuperação.",
        codigoInicial: COMECE_AQUI,
        casos: [
          { entradas: ["8"], saidaEsperada: "Aprovado" },
          { entradas: ["5"], saidaEsperada: "Recuperação" },
          { entradas: ["7"], saidaEsperada: "Aprovado" },
        ],
        precisaUsar: "if",
        dica: "Leia com int(input()), compare com if nota >= 7: e use else para o outro caso.",
      },
      {
        id: "votar",
        enunciado: "Leia a idade. Se tiver 16 anos ou mais, mostre Pode votar; senão, mostre Ainda não pode votar.",
        codigoInicial: COMECE_AQUI,
        casos: [
          { entradas: ["17"], saidaEsperada: "Pode votar" },
          { entradas: ["15"], saidaEsperada: "Ainda não pode votar" },
          { entradas: ["16"], saidaEsperada: "Pode votar" },
        ],
        precisaUsar: "else",
        dica: "Com 16 anos já pode votar: use >= na comparação.",
      },
    ],
    pergunta: {
      pergunta: "Em if nota >= 7:, o que acontece se a nota for 6?",
      opcoes: ["O bloco do if é executado", "O bloco do if é pulado", "O programa dá erro", "A nota vira 7"],
      correta: 1,
      explicacao: "6 >= 7 é falso, então o bloco do if é pulado.",
    },
  },
  {
    id: "repeticao",
    numero: 4,
    titulo: "Repetição",
    icone: Repeat,
    resumo: "Use for e while para repetir um bloco de código.",
    passos: [
      {
        titulo: "for com range",
        explicacaoSOV: "range números em sequência gera; for para cada número bloco repete.",
        exemplo: "for i in range(3):\n    print(i)",
        termos: ["for", "range"],
      },
      {
        titulo: "Início e fim do range",
        explicacaoSOV: "range(1, 6) do 1 até antes do 6 conta.",
        exemplo: "for i in range(1, 6):\n    print(i)",
        termos: ["range", "laço de repetição"],
      },
      {
        titulo: "O comando while",
        explicacaoSOV: "Código repetição enquanto condição verdadeira mantém.",
        exemplo: "x = 1\nwhile x <= 3:\n    print(x)\n    x += 1",
        termos: ["while", "contador"],
      },
      {
        titulo: "Cuidado com o laço infinito",
        explicacaoSOV: "Condição nunca falsa, programa não para; contador sempre atualizar.",
        exemplo: "x = 1\nwhile x <= 3:\n    print(x)\n    x += 1  # sem esta linha o laço não termina",
        termos: ["laço infinito", "+="],
      },
    ],
    exercicios: [
      {
        id: "um-a-cinco",
        enunciado: "Mostre os números de 1 a 5, um por linha.",
        codigoInicial: COMECE_AQUI,
        casos: [{ entradas: [], saidaEsperada: "1\n2\n3\n4\n5" }],
        precisaUsar: "for",
        dica: "range(1, 6) gera os números de 1 a 5.",
      },
      {
        id: "tabuada",
        enunciado: "Leia um número N e mostre a tabuada de N de 1 a 5, no formato: N x 1 = resultado",
        codigoInicial: COMECE_AQUI,
        casos: [
          { entradas: ["3"], saidaEsperada: "3 x 1 = 3\n3 x 2 = 6\n3 x 3 = 9\n3 x 4 = 12\n3 x 5 = 15" },
          { entradas: ["7"], saidaEsperada: "7 x 1 = 7\n7 x 2 = 14\n7 x 3 = 21\n7 x 4 = 28\n7 x 5 = 35" },
        ],
        dica: 'Use for i in range(1, 6): e print(n, "x", i, "=", n * i).',
      },
    ],
    pergunta: {
      pergunta: "Quantas vezes o bloco de for i in range(4): repete?",
      opcoes: ["3 vezes", "4 vezes", "5 vezes", "Sem fim"],
      correta: 1,
      explicacao: "range(4) gera 0, 1, 2 e 3: quatro números, então o bloco repete 4 vezes.",
    },
  },
  {
    id: "listas",
    numero: 5,
    titulo: "Listas",
    icone: ListOrdered,
    resumo: "Guarde vários valores numa lista e percorra os itens.",
    passos: [
      {
        titulo: "Lista",
        explicacaoSOV: "Colchetes vários valores ordenados guardam.",
        exemplo: 'frutas = ["maçã", "uva", "banana"]\nprint(frutas)',
        termos: ["list"],
      },
      {
        titulo: "Posição do item",
        explicacaoSOV: "Contagem do zero começa; frutas[0] primeiro item mostra.",
        exemplo: 'frutas = ["maçã", "uva", "banana"]\nprint(frutas[0])',
        termos: ["índice"],
      },
      {
        titulo: "append e len",
        explicacaoSOV: "append item no fim coloca; len quantidade de itens conta.",
        exemplo: 'frutas = ["maçã", "uva"]\nfrutas.append("caju")\nprint(len(frutas))',
        termos: ["append", "len"],
      },
      {
        titulo: "Percorrer a lista",
        explicacaoSOV: "for cada item da lista um por vez visita.",
        exemplo: 'frutas = ["maçã", "uva", "banana"]\nfor fruta in frutas:\n    print(fruta)',
        termos: ["for", "iterável"],
      },
    ],
    exercicios: [
      {
        id: "notas",
        enunciado: "Crie a lista notas = [7, 9, 6]. Mostre a quantidade de notas e, na linha de baixo, a soma delas.",
        codigoInicial: COMECE_AQUI,
        casos: [{ entradas: [], saidaEsperada: "3\n22" }],
        precisaUsar: "len",
        dica: "len(notas) conta os itens e sum(notas) soma os valores.",
      },
      {
        id: "tres-nomes",
        enunciado: "Leia 3 nomes (um input para cada), guarde numa lista com append e mostre cada nome numa linha.",
        codigoInicial: "nomes = []\n",
        casos: [
          { entradas: ["Ana", "Bia", "Caio"], saidaEsperada: "Ana\nBia\nCaio" },
          { entradas: ["Davi", "Eva", "Fábio"], saidaEsperada: "Davi\nEva\nFábio" },
        ],
        precisaUsar: "append",
        dica: "Repita 3 vezes nomes.append(input()) e depois use for nome in nomes: print(nome).",
      },
    ],
    pergunta: {
      pergunta: 'Em cores = ["azul", "verde", "rosa"], o que print(cores[1]) mostra?',
      opcoes: ["azul", "verde", "rosa", "Um erro"],
      correta: 1,
      explicacao: "A contagem começa no zero: cores[0] é azul e cores[1] é verde.",
    },
  },
];

export function buscarModulo(id: string) {
  return modulos.find((modulo) => modulo.id === id);
}
