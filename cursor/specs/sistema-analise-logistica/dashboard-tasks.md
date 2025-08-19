# Dashboard — Plano de Tarefas Detalhado

## Overview

Este documento descreve as tarefas para implementar o Dashboard Analítico (Fase 2). A primeira entrega será a fileira superior de 5 cards (Receita, On Time, Ocupação, Terceiro, Disponibilidade), exibindo métricas do mês corrente até o dia atual (MTD), a meta (BGT) e o comparativo com o mês anterior até o mesmo dia (PM). Outras seções do dashboard serão adicionadas em entregas subsequentes.

## Definições de Cálculo (Assumidas)

- **Dia de referência (D):** dia do mês corrente (ex.: 19/08 → D = 19).
- **Período MTD (mês atual):** de 1º dia do mês atual até D inclusive.
- **Período PM (mês anterior):** de 1º dia do mês anterior até o dia D do mês anterior. Se o mês anterior tiver menos dias que D, usar o último dia disponível.
- **REAL**:
  - Receita: soma de `kpi_entries.kpi_value` onde `kpi_type = 'RECEITA'` no período MTD.
  - Demais KPIs (percentuais): média simples dos valores no período MTD.
- **BGT (Meta)**:
  - Receita: meta MTD pró‑rata linear baseada na soma de `clients.budget_receita` (mensal) escalonada por `D / daysInMonth`.
  - Demais KPIs (percentuais): alvo médio = média simples dos respectivos `clients.budget_*` (meta mensal de percentual não pró‑rata).
- **PM (Prior Month):**
  - Receita: soma no período PM.
  - Demais KPIs: média simples no período PM.

Observações:
- As metas por cliente existem nas colunas `clients.budget_receita`, `budget_on_time`, `budget_ocupacao`, `budget_terceiro`, `budget_disponibilidade` (migração 2025-08-13).
- Para filtros por cliente/centro de custo, cálculos consideram apenas o subconjunto filtrado (ver parâmetros).
- Timezone: todos os cálculos devem considerar timezone de produção (America/Sao_Paulo) para delimitar o dia corretamente.

## Escopo da Entrega 1 — Fileira de 5 Cards (Top Row)

### Requisitos Funcionais

- [ ] Exibir 5 cards lado a lado (responsivo) — um para cada KPI: Receita, On Time, Ocupação, Terceiro, Disponibilidade.
- [ ] Em cada card, exibir destaque com o dia do mês: por ex. "19°".
- [ ] Em cada card, exibir uma linha com 3 métricas: **REAL**, **BGT**, **PM** conforme definições acima.
- [ ] Formatação: Receita em BRL, percentuais em % (pt‑BR). 
- [ ] Estados: loading (skeleton), erro (toast/alert), vazio (valores "—" ou 0 conforme KPI).
- [ ] Filtros (parâmetros): data de referência (default hoje), `clientIds?`, `costCenterIds?`.

### Requisitos Não‑Funcionais

- [ ] Tempo de resposta do endpoint < 500ms para dataset típico.
- [ ] Caching no cliente (React Query) com `staleTime` adequado (ex.: 60s) e chave dependente dos filtros.
- [ ] Sem N+1: usar agregações SQL com CTEs.
- [ ] Testes unitários e de integração para cálculos e formatação.

## Backend — tRPC/API

### Endpoint

- [ ] `kpiEntry.getDashboardSummary`
  - Método: query (protegido)
  - Input (Zod):
    ```ts
    {
      date: string; // YYYY-MM-DD (timezone America/Sao_Paulo)
      clientIds?: string[]; // opcional
      costCenterIds?: string[]; // opcional
    }
    ```
  - Output (TypeScript):
    ```ts
    type DashboardSummary = {
      dayOfMonth: number;         // D
      daysInMonth: number;        // para UI
      receita: { real: number; bgt: number; pm: number };
      onTime: { real: number; bgt: number; pm: number };
      ocupacao: { real: number; bgt: number; pm: number };
      terceiro: { real: number; bgt: number; pm: number };
      disponibilidade: { real: number; bgt: number; pm: number };
    }
    ```

### Lógica de Cálculo (SQL/Prisma)

- [ ] Calcular datas `mtd_start`, `mtd_end`, `pm_start`, `pm_end` no servidor respeitando timezone.
- [ ] Aplicar filtros (`clientIds`, `costCenterIds`) nos joins `kpi_entries` ↔ `clients`.
- [ ] Agregações:
  - Receita REAL/PM: `SUM(kpi_value)` por período.
  - Percentuais REAL/PM: `AVG(kpi_value)` por período.
  - BGT Receita: `SUM(clients.budget_receita) * (D / daysInMonth)`.
  - BGT Percentuais: `AVG(clients.budget_on_time|ocupacao|terceiro|disponibilidade)`.
- [ ] Retornar zeros para ausências de dados.
- [ ] Validar tipos/precisão: receita decimal(10,2), percentuais decimal(5,2).

### Índices/Performance

- [ ] Confirmar índice em `kpi_entries(date, client_id, kpi_type)`.
- [ ] Confirmar `pg_trgm` aplicado em `clients(name)` (migração 2025-08-10) — aplicar no Supabase se pendente.
- [ ] Índice em `clients(cost_center_id)` já existe (migração 2025-08-11).

### Tratamento de Erros

- [ ] Mapear `PrismaClientKnownRequestError` para TRPCError adequado.
- [ ] Validar input e retornar mensagens em pt‑BR.

## Frontend — UI/UX

### Componentização

- [ ] `DashboardTopCards` (container) — recebe `DashboardSummary` e renderiza 5 cards.
- [ ] `MetricCard` (atômico) — props: `title`, `dayLabel`, `real`, `bgt`, `pm`, `type` (currency|percent), `colorVariant`.

### Layout e Estilo (Shadcn/ui)

- [ ] Usar `card`, `separator`, `badge`.
- [ ] Grid responsivo (5 colunas em xl, 2‑3 em md, 1 em sm).
- [ ] Destaque do dia `D°` com `badge`.
- [ ] Cores consistentes por KPI (ex.: receita = primária, percentuais = neutras/brand).

### Integração de Dados

- [ ] Hook `useDashboardSummary({ date, clientIds?, costCenterIds? })` usando React Query.
- [ ] Chave de cache: `['dashboardSummary', date, clientIds?.sort(), costCenterIds?.sort()]`.
- [ ] Prefetch ao entrar na rota `/dashboard`.
- [ ] Skeletons e estados de erro (toast) padronizados.

### Formatação (pt‑BR)

- [ ] Receita: `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`.
- [ ] Percentuais: `Intl.NumberFormat('pt-BR', { style: 'percent', maximumFractionDigits: 2 })` com divisão por 100 se necessário.

## Filtros e Parâmetros (MVP dos cards)

- [ ] Data de referência (date picker) — default hoje.
- [ ] Filtro por clientes (multiselect).
- [ ] Filtro por centro de custo (multiselect).

## Testes

- [ ] Unit (server): funções de cálculo de janelas MTD/PM e agregações por KPI.
- [ ] Unit (client): formatação BRL/% e renderização de `MetricCard` com estados.
- [ ] Integração: chamada do endpoint e hidratação do componente.
- [ ] Snapshot/Accessibility: `MetricCard` com `axe` básico.

## Entregáveis

- [ ] Endpoint `kpiEntry.getDashboardSummary` implementado, testado e documentado.
- [ ] Componentes `DashboardTopCards` e `MetricCard` prontos e integrados na rota `/dashboard`.
- [ ] Filtros funcionais (data, clientes, centros) impactando os cálculos.
- [ ] Testes passando no CI e cobertura mínima conforme projeto.

## Riscos e Mitigações

- Percentuais podem exigir média ponderada (sem dado de peso, usamos média simples) — revisar após feedback.
- Metas mensais pró‑rata para Receita — confirmar se pró‑rata é o desejado; ajustar se meta for distribuída de outra forma.
- Diferenças de timezone podem causar off‑by‑one em datas — fixar TZ no servidor e normalizar `date` (00:00 local).

## Próximas Entregas (fora desta task)

- [ ] Séries temporais por KPI (linha/coluna) com comparativo vs meta.
- [ ] Tabelas pivotadas M/M‑1 com variação e contribuição por cliente/centro.
- [ ] Heatmap diário por KPI.
- [ ] Drill‑down por cliente e por centro de custo.
- [ ] Exportações (CSV/Excel) e agendamento de snapshots.


