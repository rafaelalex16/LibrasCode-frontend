# Trilha de aprendizagem — desenho

## Intenção
A Trilha do Portal do Aluno hoje é uma tela fixa (3 módulos de enfeite, "40%" com a barra em 60%, "2 de 5 módulos").
O PDF do LibrasCode trata a trilha como apoio permanente ao estudante surdo e usa "tutoriais guiados progressivos"
como pivô da hipótese H2: alunos realizam exercícios do nível introdutório sem suporte ativo de intérprete.

## Objetivos
- 5 módulos introdutórios de Python, cada um com tutorial guiado, 2 exercícios de código e 1 pergunta de conceito.
- Exercícios corrigidos automaticamente rodando o código do aluno no navegador (Pyodide) e comparando a saída.
- Erros explicados em Libras (mesma explicação da IDE) e explicações sinalizáveis pelo avatar VLibras.
- Progresso real (itens feitos ÷ total) e número de tentativas por exercício (base para medir autonomia).

## Fora do escopo agora
- Salvar o progresso no Supabase e mostrar no "Progresso da Turma" do professor (fica para quando o login for ligado).
- Vídeos de sinais (o glossário ainda não tem sinais validados).

## Anti-objetivos
- Exercício que reprova código correto por detalhe de formatação (espaços no fim, linhas vazias no fim).
- Deixar o aluno sem saber o que fazer: o próximo passo fica sempre destacado.

## Abordagens consideradas
- **A — código conferido pela saída (escolhida pelo usuário):** treina programação de verdade e reaproveita a execução e os erros em Libras da IDE.
- B — múltipla escolha sobre conceitos: mais simples, mas o aluno não programa. Usada só como pergunta final de cada módulo.

## Decisões
- Módulos: 1. Mostrar na tela · 2. Variáveis e entrada · 3. Condições · 4. Repetição · 5. Listas.
- Desbloqueio em ordem (decisão do usuário, 2026-11-18): o módulo 1 vem aberto; cada módulo abre quando o anterior é concluído (tutorial + 2 exercícios + pergunta).
- Aprendizagem gamificada: a Trilha é um mapa com um ícone por módulo (concluído, atual, bloqueado com cadeado) e aviso de "módulo desbloqueado".
- Tutorial: 3–4 passos com explicação SOV, exemplo de código, botão "Ver em Libras" e termos do glossário.
- Exercício: enunciado, código inicial, entradas fixas para `input()`, saída esperada, comando obrigatório opcional
  (ex.: precisa usar `for`), dica. Comparação ignora espaços no fim das linhas e linhas vazias no fim.
- Progresso no navegador (`localStorage`), com tentativas por exercício.

## Decisões do construtor (minhas)
- Conteúdo em `src/trilha/conteudo.ts`; correção em `src/trilha/corrigir.ts`; progresso em `src/trilha/progresso.ts`.
- Tela de lista em `/aluno/trilha` e tela do módulo em `/aluno/trilha/:modulo`.
- Editor Monaco compacto dentro do exercício, reaproveitando `executarPython` e `explicarErro`.
