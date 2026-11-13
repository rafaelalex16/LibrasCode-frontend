// Glossário técnico bilíngue Python ↔ Libras.
// As explicações seguem a estrutura SOV (Sujeito-Objeto-Verbo) da Libras.
// Todos os termos aguardam a validação da comissão técnica (intérpretes Prolibras + especialistas em T.I.).
// A lista oficial fica na tabela "glossario" do Supabase (carregarGlossario.ts); esta cópia embutida
// é usada enquanto o banco responde ou sem internet.

export type Categoria =
  | "Sintaxe básica"
  | "Tipos de dados"
  | "Operadores"
  | "Controle de fluxo"
  | "Coleções"
  | "Textos (strings)"
  | "Funções"
  | "Orientação a objetos"
  | "Erros e exceções"
  | "Módulos e bibliotecas"
  | "Arquivos"
  | "Conceitos gerais";

export type StatusValidacao = "pendente" | "validado";

export interface TermoGlossario {
  termo: string; // como aparece no código ou nome do conceito
  traducao: string; // nome em português
  categoria: Categoria;
  explicacaoSOV: string; // explicação em estrutura SOV, enviada ao avatar
  exemplo?: string;
  sinonimos: string[]; // palavras faladas pelo professor que ativam o termo na aula ao vivo
  ehCodigo: boolean; // true quando o termo é escrito no código (palavra-chave, função, método...)
  validacao: StatusValidacao;
  video?: string; // vídeo do sinal validado pela comissão (quando existir)
}

// [termo, tradução, explicação SOV, exemplo, sinônimos falados]
type LinhaCodigo = [string, string, string, string?, string[]?];
// [termo, explicação SOV, exemplo, sinônimos falados]
type LinhaConceito = [string, string, string?, string[]?];

function montar(
  categoria: Categoria,
  codigo: LinhaCodigo[],
  conceitos: LinhaConceito[] = [],
): TermoGlossario[] {
  return [
    ...codigo.map(([termo, traducao, explicacaoSOV, exemplo, sinonimos = []]) => ({
      termo, traducao, categoria, explicacaoSOV, exemplo, sinonimos, ehCodigo: true, validacao: "pendente" as const,
    })),
    ...conceitos.map(([termo, explicacaoSOV, exemplo, sinonimos = []]) => ({
      termo, traducao: termo, categoria, explicacaoSOV, exemplo, sinonimos, ehCodigo: false, validacao: "pendente" as const,
    })),
  ];
}

const glossarioEmbutido: TermoGlossario[] = [
  // --- 1. SINTAXE BÁSICA ---
  ...montar("Sintaxe básica", [
    ["print", "mostrar na tela", "Computador mensagem na tela mostra.", 'print("Olá, mundo!")', ["print", "printe", "função print"]],
    ["input", "entrada de dados", "Usuário dados pelo teclado envia.", 'nome = input("Seu nome: ")', ["input", "entrada de dados"]],
    ["pass", "não fazer nada", "Programa bloco vazio sem ação aceita.", "if x > 0:\n    pass", ["pass"]],
    ["None", "valor vazio", "Variável nenhum valor guarda.", "resultado = None", ["none", "valor nulo", "nulo"]],
    ["True", "verdadeiro", "Condição valor verdadeiro representa.", "ativo = True", ["true", "valor verdadeiro"]],
    ["False", "falso", "Condição valor falso representa.", "ativo = False", ["false", "valor falso"]],
    ["del", "apagar", "Programador variável ou item da memória apaga.", "del lista[0]", ["comando del"]],
  ], [
    ["variável", "Memória valor informado guarda.", "idade = 15", ["variável", "variáveis"]],
    ["comentário", "Programador explicação no código escreve; computador ignora.", "# isto é um comentário", ["comentário", "comentários"]],
    ["indentação", "Espaçamento bloco de código organiza.", "if x > 0:\n    print(x)", ["indentação", "identação", "recuo"]],
    ["atribuição", "Sinal de igual valor à variável entrega.", "x = 10", ["atribuição", "atribuir"]],
    ["palavra reservada", "Linguagem Python palavras especiais protege.", "if, for, def, class", ["palavra reservada", "palavras reservadas", "keyword"]],
    ["bloco de código", "Linhas com mesmo espaçamento grupo forma.", "for i in range(3):\n    print(i)", ["bloco de código"]],
    ["dois-pontos", "Dois-pontos início de bloco avisa.", "for i in range(3):", ["dois pontos"]],
    ["aspas", "Aspas texto delimitam.", "\"texto\" ou 'texto'", ["aspas"]],
    ["parênteses", "Parênteses valores para a função envolvem.", "print(x)", ["parênteses"]],
  ]),

  // --- 2. TIPOS DE DADOS ---
  ...montar("Tipos de dados", [
    ["str", "texto (string)", "Texto caracteres entre aspas junta.", 'nome = "Ana"', ["string", "strings", "str"]],
    ["int", "número inteiro", "Número valor inteiro sem vírgula representa.", "idade = 15", ["int", "inteiro", "inteiros", "integer"]],
    ["float", "número decimal", "Número ponto decimal possui.", "altura = 1.65", ["float", "decimal", "ponto flutuante"]],
    ["bool", "lógico (booleano)", "Sistema verdadeiro ou falso valida.", "maior = idade >= 18", ["bool", "booleano", "booleana", "boolean"]],
    ["complex", "número complexo", "Número parte real e imaginária junta.", "z = 2 + 3j", ["número complexo"]],
    ["bytes", "bytes", "Computador dados brutos em bytes guarda.", 'dados = b"abc"', ["bytes"]],
    ["type", "descobrir tipo", "Comando tipo do dado identifica.", "type(10)  # int", ["type", "função type"]],
    ["isinstance", "verificar tipo", "Função objeto pertence a tipo confere.", "isinstance(5, int)", ["isinstance"]],
    ["id", "identidade", "Função endereço do objeto na memória mostra.", "id(x)", ["função id"]],
  ], [
    ["conversão de tipo", "Código um tipo de dado em outro transforma.", 'int("5")  # 5', ["conversão de tipo", "casting", "converter"]],
    ["f-string", "Texto variáveis dentro de chaves mostra.", 'print(f"Olá, {nome}")', ["f string", "fstring"]],
    ["mutável", "Objeto conteúdo depois de criado muda.", "lista.append(4)", ["mutável", "mutáveis"]],
    ["imutável", "Objeto conteúdo depois de criado não muda.", "tupla = (1, 2)", ["imutável", "imutáveis"]],
    ["caractere", "Texto uma letra ou símbolo representa.", 'letra = "a"', ["caractere", "caracteres"]],
  ]),

  // --- 3. OPERADORES ---
  ...montar("Operadores", [
    ["+", "adição", "Operador dois valores soma.", "total = 2 + 3", ["adição", "somar"]],
    ["-", "subtração", "Operador um valor do outro subtrai.", "resto = 10 - 4", ["subtração", "subtrair"]],
    ["*", "multiplicação", "Operador valores multiplica.", "area = base * altura", ["multiplicação", "multiplicar"]],
    ["/", "divisão", "Operador valor por outro divide; resultado decimal entrega.", "media = soma / 2", ["divisão", "dividir"]],
    ["//", "divisão inteira", "Operador divisão sem parte decimal faz.", "7 // 2  # 3", ["divisão inteira"]],
    ["%", "resto da divisão", "Operador resto da divisão entrega.", "7 % 2  # 1", ["resto da divisão", "operador módulo"]],
    ["**", "potência", "Operador número elevado a expoente calcula.", "2 ** 3  # 8", ["potência", "potenciação", "exponenciação", "elevado a"]],
    ["==", "igual a", "Operador dois valores iguais compara.", "if x == 10:", ["igual a", "igualdade", "igual igual"]],
    ["!=", "diferente de", "Operador dois valores diferentes compara.", "if x != 0:", ["diferente de"]],
    [">", "maior que", "Operador valor da esquerda maior verifica.", "if nota > 7:", ["maior que"]],
    ["<", "menor que", "Operador valor da esquerda menor verifica.", "if nota < 5:", ["menor que"]],
    [">=", "maior ou igual", "Operador valor maior ou igual verifica.", "if idade >= 18:", ["maior ou igual"]],
    ["<=", "menor ou igual", "Operador valor menor ou igual verifica.", "if nota <= 10:", ["menor ou igual"]],
    ["and", "e lógico", "Operador duas condições verdadeiras exige.", "if x > 0 and x < 10:", ["and", "operador e"]],
    ["or", "ou lógico", "Operador uma condição verdadeira basta.", "if dia == 6 or dia == 7:", ["or", "operador ou"]],
    ["not", "negação", "Operador condição inverte.", "if not ativo:", ["not", "negação"]],
    ["in", "pertence a", "Código item dentro da coleção procura.", 'if "a" in palavra:', ["operador in"]],
    ["is", "é o mesmo objeto", "Operador mesmo objeto na memória compara.", "if x is None:", ["operador is"]],
    ["+=", "somar e guardar", "Variável valor atual mais novo valor guarda.", "contador += 1", ["mais igual", "incrementar", "incremento"]],
    ["-=", "subtrair e guardar", "Variável valor atual menos novo valor guarda.", "vidas -= 1", ["menos igual", "decrementar", "decremento"]],
  ], [
    ["operador ternário", "Condição em uma linha valor escolhe.", 'status = "par" if n % 2 == 0 else "ímpar"', ["ternário", "operador ternário"]],
    ["precedência", "Python ordem das operações segue.", "2 + 3 * 4  # 14", ["precedência"]],
  ]),

  // --- 4. CONTROLE DE FLUXO ---
  ...montar("Controle de fluxo", [
    ["if", "se (condição)", "Programa condição verdadeira testa.", 'if idade >= 18:\n    print("Maior de idade")', ["if", "condicional", "estrutura condicional"]],
    ["elif", "senão se", "Programa nova condição alternativa verifica.", 'elif nota >= 5:\n    print("Recuperação")', ["elif", "else if"]],
    ["else", "senão", "Programa condição falsa caminho executa.", 'else:\n    print("Reprovado")', ["else", "senão"]],
    ["while", "enquanto (repetição)", "Código repetição enquanto condição verdadeira mantém.", "while x < 5:\n    x += 1", ["while", "laço while", "laço enquanto"]],
    ["for", "para cada (repetição)", "Código repetição com fim definido faz.", "for i in range(5):\n    print(i)", ["laço for", "loop for", "repetição for", "para cada"]],
    ["break", "interromper laço", "Sistema laço de repetição interrompe.", "if x == 3:\n    break", ["break"]],
    ["continue", "pular repetição", "Sistema próxima repetição do laço pula.", "if x == 3:\n    continue", ["comando continue"]],
    ["range", "sequência de números", "Função números em sequência gera.", "range(1, 11)", ["range", "função range"]],
    ["match", "escolher caso", "Programa valor com vários casos compara.", 'match opcao:\n    case 1:\n        print("Um")', ["match"]],
    ["case", "caso", "Programa um caso dentro do match define.", 'case 2:\n    print("Dois")', ["comando case"]],
  ], [
    ["condição", "Programa pergunta verdadeiro ou falso responde.", "x > 10", ["condição", "condições"]],
    ["laço infinito", "Repetição condição nunca falsa; programa não para.", "while True:\n    print(\"sem fim\")", ["laço infinito", "loop infinito"]],
  ]),

  // --- 5. COLEÇÕES ---
  ...montar("Coleções", [
    ["list", "lista", "Colchetes vários valores ordenados guardam.", 'frutas = ["maçã", "uva"]', ["list", "lista", "listas"]],
    ["tuple", "tupla", "Parênteses valores imutáveis protegem.", "ponto = (3, 4)", ["tuple", "tupla", "tuplas"]],
    ["dict", "dicionário", "Chave-valor dados organizados por etiquetas armazena.", 'aluno = {"nome": "Ana", "idade": 15}', ["dict", "dicionário", "dicionários"]],
    ["set", "conjunto", "Chaves elementos únicos não ordenados reúnem.", 'cores = {"azul", "verde"}', ["conjunto", "conjuntos"]],
    ["frozenset", "conjunto congelado", "Conjunto elementos fixos protege.", "fixos = frozenset([1, 2])", ["frozenset"]],
    ["append", "adicionar no fim", "Comando novo item no fim da lista insere.", "lista.append(5)", ["append"]],
    ["insert", "inserir na posição", "Comando item em posição escolhida coloca.", 'lista.insert(0, "x")', ["insert"]],
    ["extend", "estender lista", "Comando itens de outra lista junta.", "lista.extend([6, 7])", ["extend"]],
    ["remove", "remover item", "Comando item pelo valor da lista tira.", 'lista.remove("uva")', ["método remove"]],
    ["pop", "retirar item", "Comando último item da lista remove e devolve.", "ultimo = lista.pop()", ["pop"]],
    ["clear", "esvaziar", "Comando todos os itens da coleção apaga.", "lista.clear()", ["clear"]],
    ["index", "posição do item", "Comando posição do valor na lista encontra.", 'lista.index("uva")', ["index"]],
    ["count", "contar ocorrências", "Comando vezes que valor aparece conta.", "lista.count(3)", ["count"]],
    ["sort", "ordenar lista", "Comando itens da lista em ordem organiza.", "lista.sort()", ["sort"]],
    ["sorted", "cópia ordenada", "Função nova lista ordenada devolve.", "ordenada = sorted(lista)", ["sorted"]],
    ["reverse", "inverter lista", "Comando ordem da lista inverte.", "lista.reverse()", ["reverse"]],
    ["len", "tamanho", "Função quantidade de elementos conta.", "len(lista)", ["len", "função len", "tamanho da lista"]],
    ["keys", "chaves", "Dicionário todas as chaves mostra.", "aluno.keys()", ["keys"]],
    ["values", "valores", "Dicionário todos os valores mostra.", "aluno.values()", ["values"]],
    ["items", "pares chave-valor", "Dicionário pares chave e valor entrega.", "for k, v in aluno.items():", ["items"]],
    ["get", "buscar com segurança", "Dicionário valor da chave sem erro busca.", 'aluno.get("nota", 0)', ["método get"]],
    ["update", "atualizar dicionário", "Dicionário novos pares recebe.", 'aluno.update({"nota": 9})', ["update"]],
    ["enumerate", "numerar itens", "Função posição e item juntos entrega.", "for i, fruta in enumerate(frutas):", ["enumerate"]],
    ["zip", "juntar listas", "Função itens de várias listas em pares junta.", "for n, i in zip(nomes, idades):", ["zip"]],
    ["max", "maior valor", "Função maior valor da coleção encontra.", "max([3, 9, 2])", ["max", "valor máximo"]],
    ["min", "menor valor", "Função menor valor da coleção encontra.", "min([3, 9, 2])", ["min", "valor mínimo"]],
    ["sum", "soma total", "Função todos os números da coleção soma.", "sum([1, 2, 3])", ["sum", "função sum"]],
    ["any", "algum verdadeiro", "Função pelo menos um item verdadeiro confere.", "any([False, True])", ["any"]],
    ["all", "todos verdadeiros", "Função todos os itens verdadeiros confere.", "all([True, True])", ["função all"]],
    ["copy", "copiar coleção", "Comando cópia independente da coleção cria.", "nova = lista.copy()", ["copy"]],
  ], [
    ["índice", "Número posição do item mostra; contagem do zero começa.", "frutas[0]", ["índice", "índices", "posição zero"]],
    ["fatiamento", "Código pedaço da lista ou do texto recorta.", "lista[1:3]", ["fatiamento", "fatiar", "slice"]],
    ["list comprehension", "Código lista nova em uma linha cria.", "quadrados = [x ** 2 for x in range(5)]", ["list comprehension", "compreensão de lista"]],
    ["matriz", "Lista dentro de lista tabela forma.", "m = [[1, 2], [3, 4]]", ["matriz", "matrizes", "lista de listas"]],
  ]),

  // --- 6. TEXTOS (STRINGS) ---
  ...montar("Textos (strings)", [
    ["split", "dividir texto", "Comando texto em pedaços separa.", '"a,b".split(",")', ["split"]],
    ["join", "juntar textos", "Comando lista de textos em um texto une.", '"-".join(["a", "b"])', ["join"]],
    ["upper", "maiúsculas", "Comando texto em letras maiúsculas transforma.", "nome.upper()", ["upper"]],
    ["lower", "minúsculas", "Comando texto em letras minúsculas transforma.", "nome.lower()", ["lower"]],
    ["strip", "remover espaços", "Comando espaços do começo e do fim apaga.", "texto.strip()", ["strip"]],
    ["replace", "substituir", "Comando parte do texto por outra troca.", 'frase.replace("a", "o")', ["replace"]],
    ["find", "procurar no texto", "Comando posição da palavra no texto encontra.", 'frase.find("sol")', ["find"]],
    ["startswith", "começa com", "Comando início do texto confere.", 'nome.startswith("A")', ["startswith"]],
    ["endswith", "termina com", "Comando final do texto confere.", 'arquivo.endswith(".py")', ["endswith"]],
    ["format", "formatar texto", "Comando valores dentro do texto encaixa.", '"{} anos".format(15)', ["format"]],
    ["isdigit", "é número?", "Comando texto só com dígitos confere.", '"123".isdigit()', ["isdigit"]],
  ], [
    ["concatenação", "Operador mais textos junta.", '"Olá, " + nome', ["concatenação", "concatenar"]],
  ]),

  // --- 7. FUNÇÕES ---
  ...montar("Funções", [
    ["def", "definir função", "Programador nova função cria.", 'def saudar(nome):\n    print("Olá", nome)', ["def", "definir função"]],
    ["return", "retornar", "Função resultado calculado devolve.", "return a + b", ["return", "retorno", "retornar"]],
    ["lambda", "função anônima", "Programador função pequena sem nome cria.", "dobro = lambda x: x * 2", ["lambda", "função anônima"]],
    ["global", "variável global", "Função variável de fora altera.", "global contador", ["variável global"]],
    ["nonlocal", "variável da função externa", "Função interna variável da função de fora altera.", "nonlocal total", ["nonlocal"]],
    ["yield", "produzir valor", "Gerador valor por vez entrega e pausa.", "yield numero", ["yield"]],
    ["map", "aplicar a todos", "Função mesma operação em cada item aplica.", 'list(map(int, ["1", "2"]))', ["map", "função map"]],
    ["filter", "filtrar", "Função itens que passam no teste separa.", "list(filter(lambda x: x > 0, nums))", ["filter"]],
  ], [
    ["função", "Programador bloco de código com nome reutiliza.", "def area(b, h):\n    return b * h", ["função", "funções", "function"]],
    ["chamada de função", "Programa nome da função com parênteses executa.", 'saudar("Ana")', ["chamada de função", "chamar a função"]],
    ["argumento", "Usuário valor para a função envia.", 'saudar("Ana")  # "Ana" é o argumento', ["argumento", "argumentos"]],
    ["parâmetro", "Função valor enviado recebe.", "def saudar(nome):  # nome é o parâmetro", ["parâmetro", "parâmetros"]],
    ["parâmetro padrão", "Parâmetro valor automático sem envio usa.", 'def ola(nome="aluno"):', ["parâmetro padrão", "valor padrão"]],
    ["*args", "Função quantidade livre de valores recebe.", "def somar(*args):", ["args"]],
    ["**kwargs", "Função valores com nome livres recebe.", "def configurar(**kwargs):", ["kwargs"]],
    ["escopo", "Variável lugar onde existe limita.", "def f():\n    x = 1  # x só existe dentro de f", ["escopo"]],
    ["gerador", "Função valores aos poucos produz.", "def contar():\n    yield 1", ["gerador", "geradores", "generator"]],
    ["recursividade", "Função ela mesma chama até condição de parada.", "def fat(n):\n    return 1 if n == 0 else n * fat(n - 1)", ["recursividade", "recursão", "recursiva", "recursivo"]],
    ["docstring", "Programador explicação da função entre aspas triplas escreve.", 'def f():\n    """Explica a função."""', ["docstring"]],
    ["decorador", "Função comportamento de outra função muda.", "@staticmethod", ["decorador", "decorator"]],
    ["função embutida", "Python funções prontas oferece.", "print, len, input", ["função embutida", "funções embutidas", "built in"]],
  ]),

  // --- 8. ORIENTAÇÃO A OBJETOS ---
  ...montar("Orientação a objetos", [
    ["class", "classe", "Código molde para criar objetos define.", "class Aluno:\n    pass", ["class", "classe", "classes"]],
    ["__init__", "construtor", "Método características iniciais do objeto prepara.", "def __init__(self, nome):\n    self.nome = nome", ["init", "construtor"]],
    ["self", "o próprio objeto", "Objeto suas próprias características acessa.", "self.nome = nome", ["self"]],
    ["super", "classe mãe", "Classe filha método da classe mãe chama.", "super().__init__(nome)", ["função super"]],
    ["__str__", "texto do objeto", "Método objeto em texto apresenta.", "def __str__(self):\n    return self.nome", ["método str"]],
    ["property", "propriedade", "Decorador método como atributo usa.", "@property\ndef idade(self):", ["property"]],
    ["staticmethod", "método estático", "Classe método sem objeto oferece.", "@staticmethod", ["staticmethod", "método estático"]],
    ["classmethod", "método de classe", "Método a própria classe recebe.", "@classmethod", ["classmethod", "método de classe"]],
  ], [
    ["objeto", "Memória elemento gerado pela classe cria.", 'aluno = Aluno("Ana")', ["objeto", "objetos"]],
    ["instância", "Classe objeto concreto produz.", 'a1 = Aluno("Ana")', ["instância", "instâncias", "instanciar"]],
    ["atributo", "Variável da classe característica do objeto guarda.", "self.idade", ["atributo", "atributos"]],
    ["método", "Função da classe ação do objeto executa.", "aluno.estudar()", ["método", "métodos"]],
    ["herança", "Classe filha código da classe mãe herda.", "class Gato(Animal):", ["herança", "herdar", "herda"]],
    ["encapsulamento", "Classe dados internos protege.", "self._senha", ["encapsulamento"]],
    ["polimorfismo", "Objetos diferentes mesmo método de formas diferentes executam.", "animal.falar()", ["polimorfismo"]],
    ["abstração", "Programador detalhes importantes escolhe; resto esconde.", "class Forma:\n    def area(self): ...", ["abstração"]],
  ]),

  // --- 9. ERROS E EXCEÇÕES ---
  ...montar("Erros e exceções", [
    ["try", "tentar", "Programa código perigoso testa.", "try:\n    x = int(texto)", ["try", "bloco try"]],
    ["except", "tratar erro", "Sistema erro do try captura.", 'except ValueError:\n    print("Número inválido")', ["except"]],
    ["finally", "sempre executar", "Sistema código final sempre executa.", 'finally:\n    print("Fim")', ["finally"]],
    ["raise", "lançar erro", "Programador erro customizado força.", 'raise ValueError("Idade inválida")', ["raise", "lançar erro"]],
    ["assert", "afirmar", "Programa condição obrigatória confere; falsa erro gera.", "assert idade >= 0", ["assert"]],
    ["Exception", "exceção", "Sistema erro geral representa.", "except Exception as erro:", ["exception", "exceção", "exceções"]],
    ["SyntaxError", "erro de sintaxe", "Interpretador erro de escrita no código encontra.", 'print("oi"  # falta fechar o parêntese', ["syntax error", "erro de sintaxe"]],
    ["IndentationError", "erro de indentação", "Interpretador espaçamento errado no bloco encontra.", "if x:\nprint(x)  # faltou o espaço", ["erro de indentação"]],
    ["NameError", "erro de nome", "Interpretador nome não criado procura.", "print(idade)  # idade não existe", ["name error", "erro de nome"]],
    ["TypeError", "erro de tipo", "Operação tipo de dado errado recebe.", '"5" + 3', ["type error", "erro de tipo"]],
    ["ValueError", "erro de valor", "Função tipo certo mas valor inválido recebe.", 'int("abc")', ["value error", "erro de valor"]],
    ["IndexError", "erro de índice", "Código posição inexistente na lista busca.", "[1, 2][5]", ["index error", "erro de índice"]],
    ["KeyError", "erro de chave", "Dicionário chave inexistente procura.", 'aluno["cpf"]', ["key error", "erro de chave"]],
    ["ZeroDivisionError", "divisão por zero", "Matemática número por zero dividir proíbe.", "10 / 0", ["divisão por zero"]],
    ["AttributeError", "erro de atributo", "Objeto atributo ou método inexistente usa.", '"oi".push(1)', ["attribute error", "erro de atributo"]],
    ["ImportError", "erro de importação", "Programa parte do módulo não encontra.", "from math import raiz", ["import error", "erro de importação"]],
    ["ModuleNotFoundError", "módulo não encontrado", "Programa módulo não instalado procura.", "import pandinhas", ["módulo não encontrado"]],
    ["FileNotFoundError", "arquivo não encontrado", "Programa arquivo inexistente abrir tenta.", 'open("x.txt")', ["arquivo não encontrado"]],
    ["RecursionError", "erro de recursão", "Função ela mesma vezes demais chama.", "def f():\n    f()", ["erro de recursão"]],
    ["StopIteration", "fim da iteração", "Iterador itens acabaram avisa.", "next(iter([]))", ["stop iteration"]],
    ["EOFError", "fim da entrada", "Programa resposta do input esperava; nada recebeu.", "input()  # sem resposta", ["eof error"]],
  ], [
    ["traceback", "Python caminho do erro linha por linha mostra.", 'File "<exec>", line 3', ["traceback", "rastreamento"]],
    ["depuração", "Programador erros do código procura e corrige.", "print(x)  # conferir o valor", ["depuração", "depurar", "debug", "debugar"]],
    ["bug", "Código defeito escondido possui.", "if x = 2:  # bug", ["bug", "bugs"]],
  ]),

  // --- 10. MÓDULOS E BIBLIOTECAS ---
  ...montar("Módulos e bibliotecas", [
    ["import", "importar", "Programa código de outro arquivo puxa.", "import math", ["import", "importar", "importação"]],
    ["from", "de (importar parte)", "Programa parte específica do módulo puxa.", "from math import sqrt", ["from"]],
    ["as", "apelido", "Programador nome curto para o módulo dá.", "import random as rd", ["apelido"]],
    ["pip", "instalador de pacotes", "Gerenciador novas bibliotecas da internet instala.", "pip install requests", ["pip"]],
    ["math", "matemática", "Biblioteca cálculos matemáticos complexos resolve.", "math.sqrt(16)", ["math", "biblioteca math"]],
    ["random", "aleatório", "Sistema números aleatórios gera.", "random.randint(1, 6)", ["random", "aleatório"]],
    ["datetime", "data e hora", "Biblioteca datas e horários manipula.", "datetime.now()", ["datetime"]],
    ["time", "tempo", "Biblioteca tempo e pausas controla.", "time.sleep(1)", ["biblioteca time"]],
    ["os", "sistema operacional", "Biblioteca pastas e arquivos do computador acessa.", "os.listdir()", ["módulo os"]],
    ["sys", "sistema do Python", "Biblioteca informações do interpretador acessa.", "sys.version", ["sys"]],
    ["json", "JSON", "Formato dados em texto estruturado organiza.", "json.dumps(aluno)", ["json"]],
    ["__name__", "nome do módulo", "Python nome do arquivo em execução informa.", 'if __name__ == "__main__":', ["name main"]],
  ], [
    ["módulo", "Arquivo .py funções prontas contém.", "math.py", ["módulo", "módulos"]],
    ["pacote", "Pasta vários módulos agrupa.", "meu_pacote/__init__.py", ["pacote", "pacotes"]],
    ["biblioteca", "Programadores código pronto compartilham.", "import random", ["biblioteca", "bibliotecas"]],
    ["ambiente virtual", "Projeto bibliotecas próprias isola.", "python -m venv venv", ["ambiente virtual", "venv"]],
  ]),

  // --- 11. ARQUIVOS ---
  ...montar("Arquivos", [
    ["open", "abrir arquivo", "Código arquivo externo abre.", 'arq = open("notas.txt", "r")', ["open", "abrir arquivo"]],
    ["close", "fechar arquivo", "Código arquivo aberto fecha.", "arq.close()", ["close", "fechar arquivo"]],
    ["with", "com (contexto)", "Programa arquivo abre e depois sozinho fecha.", 'with open("a.txt") as f:\n    print(f.read())', ["with"]],
    ["read", "ler arquivo", "Código conteúdo do arquivo lê.", "texto = arq.read()", ["read", "ler arquivo"]],
    ["write", "escrever arquivo", "Código texto dentro do arquivo grava.", 'arq.write("Olá")', ["write", "escrever no arquivo"]],
    ["readline", "ler linha", "Código uma linha do arquivo lê.", "linha = arq.readline()", ["readline"]],
  ], [
    ["arquivo", "Computador dados guardados no disco mantém.", "notas.txt", ["arquivo", "arquivos"]],
    ["modo de abertura", "Letra r, w ou a uso do arquivo define.", 'open("a.txt", "w")', ["modo de abertura", "modo leitura", "modo escrita"]],
  ]),

  // --- 12. CONCEITOS GERAIS ---
  ...montar("Conceitos gerais", [
    ["async", "função assíncrona", "Função tarefa sem bloquear o programa executa.", "async def baixar():", ["async", "assíncrono", "assíncrona"]],
    ["await", "aguardar", "Programa resultado da tarefa assíncrona espera.", "await baixar()", ["await"]],
  ], [
    ["algoritmo", "Programador passos em ordem para resolver problema escreve.", "1. Ler nota\n2. Comparar\n3. Mostrar resultado", ["algoritmo", "algoritmos"]],
    ["lógica de programação", "Raciocínio passos do programa organiza.", undefined, ["lógica de programação"]],
    ["programa", "Computador instruções escritas executa.", undefined, ["programas"]],
    ["código-fonte", "Programador texto do programa escreve.", undefined, ["código fonte"]],
    ["interpretador", "Python código linha por linha lê e executa.", undefined, ["interpretador"]],
    ["sintaxe", "Linguagem regras de escrita define.", undefined, ["sintaxe"]],
    ["terminal", "Tela resultado do programa em texto mostra.", undefined, ["terminal", "console"]],
    ["IDE", "Programador código escreve, executa e corrige.", undefined, ["ide", "ambiente de desenvolvimento"]],
    ["iteração", "Laço uma volta completa faz.", undefined, ["iteração", "iterações"]],
    ["iterável", "Coleção item por item percorrida pode ser.", "for letra in \"Ana\":", ["iterável", "iteráveis"]],
    ["laço de repetição", "Código bloco várias vezes repete.", "for i in range(3):", ["laço", "laços", "loop", "loops", "repetição", "laço de repetição"]],
    ["contador", "Variável quantas vezes algo aconteceu conta.", "contador += 1", ["contador"]],
    ["acumulador", "Variável valores somados guarda.", "total += preco", ["acumulador"]],
    ["pseudocódigo", "Programador algoritmo em português escreve.", "SE nota >= 7 ENTÃO aprovado", ["pseudocódigo", "portugol"]],
    ["fluxograma", "Desenho passos do algoritmo mostra.", undefined, ["fluxograma"]],
    ["estrutura de dados", "Programa dados de forma organizada guarda.", "lista, tupla, dicionário", ["estrutura de dados", "estruturas de dados"]],
  ]),
];

export let glossario = glossarioEmbutido;
let porTermo = new Map(glossario.map((t) => [t.termo, t]));
let versao = 0;
const ouvintes = new Set<() => void>();

// Troca a lista pela versão do banco e avisa as telas que usam o glossário
export function substituirGlossario(lista: TermoGlossario[]) {
  glossario = lista;
  porTermo = new Map(lista.map((t) => [t.termo, t]));
  versao++;
  ouvintes.forEach((avisar) => avisar());
}

export function assinarGlossario(avisar: () => void) {
  ouvintes.add(avisar);
  return () => {
    ouvintes.delete(avisar);
  };
}

export function versaoGlossario() {
  return versao;
}

export function listarCategorias() {
  return [...new Set(glossario.map((t) => t.categoria))];
}

export function buscarTermo(termo: string) {
  return porTermo.get(termo);
}

// Texto enviado ao avatar do VLibras para sinalizar um termo
export function textoParaSinalizar(termo: TermoGlossario) {
  return `${termo.traducao}. ${termo.explicacaoSOV}`;
}
