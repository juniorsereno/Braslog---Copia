# To-Do — Sistema de Análise Logística

## Performance
- [ ] Mapear queries críticas e criar índices
  - [x] Preparar índice GIN (pg_trgm) para acelerar ILIKE em `clients.name` (script: `db/migrations/2025-08-10_enable_pg_trgm.sql`)
  - [ ] Aplicar a migração no projeto Supabase
- [x] Habilitar batching no tRPC (httpBatchStreamLink ativo)
- [x] Implementar cache estável no React Query (staleTime, gcTime, placeholderData)
- [x] Virtualizar tabela de KPIs e manter paginação na lista de clientes
- [ ] Avaliar suspense/streaming para melhorar TTI
- [ ] Medir e ajustar performance com base no crescimento de clientes

## Validações & Tratamento de Erros
- [ ] Validação reativa por campo (BRL e percentuais 0–100) com mensagens específicas
- [ ] Tratar erros de rede/timeout e exibir ações de retry
- [ ] Recovery automático para falhas temporárias (queue/offline sync simples)
- [ ] Cobrir cenários extremos de desfazer/undo (por célula/global)

## UX & Polimento
- [ ] Animações/microinterações em login/CRUD/KPI
- [ ] Skeletons consistentes em listas/tabelas
- [ ] Estados de empty com CTA
- [ ] Padronizar toasts entre CRUD e KPIs
- [ ] Inputs numéricos sem spinners (pt-BR) e máscara de moeda BRL
- [ ] Revisar textos/mensagens de UI (pt-BR)
- [ ] Migrar/revisar tokens de tema (Tailwind 4/Shadcn)

## Banco de Dados & Prisma
- [ ] Conferir `prisma/schema.prisma` e alinhar com docs (Client, KpiEntry, enums)
- [ ] Criar/aplicar migrações dos índices
  - [x] Criado script de índice `pg_trgm` para `clients.name` (arquivo em `db/migrations/...`)
  - [ ] Aplicar a migração no Supabase
- [ ] Sincronizar Prisma após mudanças (db:pull / db:generate)

## API & tRPC
- [ ] Implementar `kpiEntry.getByMonth` (histórico pivotado)
- [ ] Padronizar mapeamento de erros (ex.: P2002 → conflito) no middleware
- [ ] Definir limites de payload e saneamento de entrada

## Autenticação & Segurança
- [ ] Verificar Supabase Auth no contexto do tRPC e middlewares de rotas protegidas
- [ ] Avaliar RLS no Supabase (produção) e planejar RBAC básico
- [ ] Avaliar rate-limiting simples para API
- [ ] Planejar audit trail básico (modelo já esboçado) para versão futura

## Infra, Deploy & CI/CD
- [ ] Revisar `docker-compose.yml` e workflow de deploy (variáveis/serviços)
- [ ] Garantir `.env` e secrets do pipeline atualizados
- [ ] Healthchecks simples (Next/NGINX) para uptime 99.8%
- [ ] Conferir versões Node/Next/Tailwind na VPS e alinhar
- [ ] Smoke-test de deploy end‑to‑end na VPS

## Testes & Observabilidade
- [ ] Rodar e integrar testes unitários no CI (cobertura mínima)
- [ ] Instrumentar logs de API/DB (latência, taxas de erro)
- [ ] Definir métricas de performance (LCP/TTI, API < 500ms, DB < 100ms)
- [ ] Incluir testes de acessibilidade (axe) nos componentes críticos
- [ ] Ensaios manuais por épico antes de fechar MVP

## Documentação & Onboarding
- [ ] README de dev com uso do MCP (Supabase/Shadcn)
- [ ] Guia rápido de onboarding para operadores
- [ ] Dev Docs curtos dos endpoints/fluxos

## Planejamento Fase 2 (Dashboard)
- [ ] Definir gráficos, filtros e endpoints de agregação
- [ ] Iniciar POC de agregações para KPIs
- [ ] Guideline de estilos de gráfico
- [ ] Planejar backlog do dashboard com base no PRD
- [ ] Avaliar necessidade futura de exportações (CSV/Excel)

## Qualidade & Compatibilidade
- [ ] Confirmar tratamento de timezone (UI/DB) nas datas
- [ ] Garantir compatibilidade cross‑browser (Chrome/Firefox/Edge)

## Go‑live & Pós‑lançamento
- [ ] Revisão final dos critérios de aceitação por requisito
- [ ] Agendar sessão de feedback com a equipe de operações
- [ ] Definir métricas de adoção/uso e monitoramento
- [ ] Publicar release notes v1.0 do MVP
- [ ] Reavaliar riscos e ajustar plano conforme feedback
