# Painel do professor — plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Trocar o "Progresso da Turma" fictício por um painel com dados reais (login ligado) ou de demonstração (login desligado).

**Architecture:** O aluno grava eventos de aprendizagem no Supabase; uma função pura (`montarPainel`) transforma alunos + eventos no painel, alimentada por dados reais ou por dados de demonstração gerados no navegador.

**Tech Stack:** Supabase (Postgres + RLS), React 18 + TypeScript + Tailwind, lucide-react.

**Spec:** `docs/superpowers/specs/2026-11-19-painel-professor-design.md`

## Global Constraints
- Registro de eventos só acontece com `LOGIN_ATIVO` e Supabase configurado; o banco preenche `aluno_id` com `auth.uid()`.
- Login desligado: painel com o selo "Demonstração — dados fictícios".
- "Precisa de atenção": sem atividade há 7 dias ou 5+ tentativas num exercício sem acertar.
- Sem novas dependências; lógica pura testada com script Node fora do repositório; SQL testado no PGlite.

## Review Focus
- Turma sem alunos (login ligado) → aviso com o código da turma, sem gráficos quebrados.
- Aluno sem nenhum evento → aparece na tabela com 0 de 5, "sem atividade" e alerta de atenção.
- Evento de aluno de outra turma → nunca aparece no painel (RLS) nem nos cálculos.
- Exercício concluído e tentado de novo → média de tentativas usa só as tentativas até o primeiro acerto.
- Falha ao gravar evento (sem internet) → a Trilha/IDE continuam funcionando normalmente.

---

### Task 1: Tabela de eventos
**Files:** Create `LibrasCode-backend/supabase/migrations/20261119000000_eventos_aprendizagem.sql`; Test: `scratchpad/pg/testar.mjs`.
**Produces:** tabela `public.eventos_aprendizagem(id, aluno_id default auth.uid(), tipo in ('tentativa','item_concluido','erro_ide','consulta_termo'), modulo, item, termo, erro_tipo, aprovado, criado_em)`.
- [ ] Testes: aluno insere evento próprio; professor não insere; `aluno_id` de outro é ignorado (coluna sem permissão de insert); professor lê eventos dos alunos da turma e não de alunos de fora; aluno não lê eventos de outro aluno; excluir conta apaga os eventos.
- [ ] Migração com RLS reaproveitando `public.compartilha_turma(uuid)`; grants por coluna.

### Task 2: Registro e sincronização no aluno
**Files:** Create `src/aprendizagem/eventos.ts`; Modify `src/trilha/progresso.ts`, `src/paginas/alunos/IDE.tsx`, chamadas de sinalização de termos.
**Produces:** `type TipoEvento`; `interface EventoAprendizagem { aluno_id: string; tipo: TipoEvento; modulo: string | null; item: string | null; termo: string | null; erro_tipo: string | null; aprovado: boolean | null; criado_em: string }`; `registrarEvento(evento: Partial<EventoAprendizagem> & { tipo: TipoEvento }): void`; `sinalizarTermo(termo: TermoGlossario, origem: string): void`; `progressoDeEventos(eventos: EventoAprendizagem[]): Record<string, ProgressoModulo>`; `mesclarProgresso(remoto)` em progresso.ts; `sincronizarTrilha(): Promise<void>`.
- [ ] Testes (Node): `progressoDeEventos` conclui exercício e conta só as tentativas até o primeiro acerto; tutorial concluído vira `passosVistos = passos.length`; `mesclarProgresso` mantém o maior avanço.
- [ ] `registrarTentativa(modulo, exercicio, aprovado, erroTipo?)` e marcações registram eventos uma vez (só na primeira conclusão).

### Task 3: Cálculos do painel e demonstração
**Files:** Create `src/painel/montarPainel.ts`, `src/painel/dadosDemonstracao.ts`.
**Consumes:** `progressoDeEventos`, `modulos`, `itensFeitos`.
**Produces:** `montarPainel(alunos: { id: string; nome: string }[], eventos: EventoAprendizagem[], agora: Date): Painel` com `resumo`, `alunos[]` (modulosConcluidos, ondeEsta, mediaTentativas, ultimoAcesso, precisaAtencao, motivoAtencao), `errosComuns[]`, `termosConsultados[]`, `autonomiaPorModulo[]`; `dadosDemonstracao(agora: Date): { alunos; eventos; aulas }`.
- [ ] Testes (Node): aluno sem eventos → 0 de 5 e atenção "sem atividade"; 5 tentativas sem acerto → atenção; evento de aluno fora da lista ignorado; erros e termos ordenados por quantidade.

### Task 4: Tela
**Files:** Modify `src/paginas/professor/ProgressoTurma.tsx`; Create `src/painel/HistoricoAulas.tsx`.
- [ ] Login ligado: seletor de turma, alunos matriculados, eventos e aulas do banco; turma sem alunos → aviso com o código.
- [ ] Login desligado: `dadosDemonstracao` com o selo.
- [ ] Verificar no navegador (modo demonstração) e `npx tsc -b`, `npx eslint .`, `npx vite build`.

### Task 5: Privacidade
**Files:** Modify `src/paginas/Privacidade.tsx`, `src/supabase/tipos.ts` (`VERSAO_TERMOS = "2026-11-19"`), `src/paginas/MinhaConta.tsx` (exportar eventos).
