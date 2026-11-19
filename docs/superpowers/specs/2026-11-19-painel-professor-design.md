# Painel do professor (Progresso da Turma) — desenho

## Intenção
O PDF prevê um painel analítico que "consolida padrões de dúvidas, erros recorrentes e evolução da autonomia dos
estudantes". Hoje o "Progresso da Turma" mostra 4 alunos inventados e números fixos.

## Decisões do usuário
- Caminho A: dados reais por aluno, gravados no Supabase, só com o login ligado (`VITE_LOGIN_ATIVO=true`).
- Login ligado: o painel mostra os alunos cadastrados na turma escolhida; se não houver, mostra aviso com o código da turma.
- Login desligado: o painel mostra alunos fictícios (marcado como "Demonstração — dados fictícios").

## O que é registrado (login ligado, só do aluno logado)
Tabela `eventos_aprendizagem` (aluno_id preenchido pelo banco com `auth.uid()`):
- `tentativa` — exercício da Trilha (módulo, exercício, aprovado, tipo de erro);
- `item_concluido` — item da Trilha (tutorial, exercício, pergunta);
- `erro_ide` — erro de Python na IDE (tipo);
- `consulta_termo` — termo sinalizado em Libras (termo, origem no campo item).
RLS: o aluno insere e lê só os próprios eventos; o professor lê os dos alunos das turmas dele. Apagados ao excluir a conta.
O progresso da Trilha é reconstruído a partir dos eventos ao entrar, para acompanhar o aluno em qualquer computador.

## Painel
- Resumo: total de alunos, progresso médio na Trilha, mais avançado, quantos precisam de atenção
  (sem atividade há 7 dias ou 5+ tentativas num exercício sem acertar).
- Tabela por aluno: módulos concluídos (x de 5), onde está, média de tentativas até acertar, último acesso, alerta.
- Erros mais comuns (com explicação em Libras), termos mais consultados, média de tentativas por módulo.
- Histórico das aulas: data e falas transcritas.

## Fora do escopo
- Escala SUS e experimento com grupo controle (H1).
- Exportar relatórios.

## Decisões do construtor (minhas)
- Mesma função pura (`montarPainel`) para dados reais e de demonstração.
- Política de privacidade atualizada com os eventos de aprendizagem (versão 2026-11-19); "Baixar meus dados" inclui os eventos.
