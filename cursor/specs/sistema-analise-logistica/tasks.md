# Plano de Implementação - Sistema de Análise Logística

## Visão Geral

Este plano de implementação converte o design do Sistema de Análise Logística em uma série de tarefas de codificação incrementais e testáveis. O desenvolvimento será baseado no template T3 Stack já configurado na pasta `braslog`, seguindo uma abordagem test-driven e priorizando funcionalidades core primeiro.

Cada tarefa é projetada para ser executada por um agente de codificação, construindo incrementalmente sobre as tarefas anteriores até formar um sistema completo e funcional.

## Tarefas de Implementação (Organizadas por Épicos)

### 🏗️ ÉPICO 1: Fundação, Autenticação e Deploy Inicial
*Objetivo: Ter um "esqueleto" da aplicação no ar com login funcionando*

- [x] 1. Configurar dependências e ferramentas base



  - Instalar Supabase Auth, Shadcn/ui e outras dependências necessárias
  - Configurar variáveis de ambiente para autenticação
  - Atualizar configuração do TypeScript e ESLint conforme necessário
  - _Requisitos: 1.1, 8.1_

- [x] 2. Preparar schema inicial do Prisma



  - Remover modelo Post de exemplo
  - Configurar estrutura base do banco (sem modelos de negócio ainda)
  - Testar conexão com banco de dados
  - _Requisitos: Base técnica_

- [x] 3. Configurar sistema de autenticação completo


  - [x] 3.1 Integrar Supabase Auth no contexto tRPC


    - Configurar cliente Supabase no servidor
    - Atualizar contexto tRPC para incluir sessão de usuário
    - Criar middleware de autenticação para procedures protegidas
    - _Requisitos: 1.1, 1.2_


  - [x] 3.2 Implementar roteador de autenticação tRPC

    - Criar `src/server/api/routers/auth.ts` com procedures de sessão
    - Implementar procedure para obter dados da sessão atual
    - Adicionar procedure para logout
    - _Requisitos: 1.1, 1.4_

- [x] 4. Criar sistema de layout e navegação



  - [x] 4.1 Implementar layout principal da aplicação


    - Criar DashboardLayout com sidebar e header usando Shadcn/ui
    - Implementar Navigation com menu lateral
    - Adicionar Header com informações do usuário e logout
    - Configurar roteamento protegido para páginas autenticadas
    - _Requisitos: 1.1, 1.4, 1.5_

  - [x] 4.2 Desenvolver página de login


    - Criar LoginForm com validação de campos usando Shadcn/ui
    - Implementar integração com Supabase Auth
    - Adicionar tratamento de erros de autenticação
    - Implementar redirecionamento após login bem-sucedido
    - _Requisitos: 1.1, 1.2, 1.3, 1.5_

  - [x] 4.3 Criar páginas básicas da aplicação

    - Implementar página principal do dashboard (vazia por enquanto)
    - Criar página de gerenciamento de clientes (vazia por enquanto)
    - Configurar roteamento entre páginas
    - Adicionar breadcrumbs e navegação contextual
    - _Requisitos: Base de navegação_

- [x] 5. Configurar ambiente de produção
  - [x] 5.1 Criar configuração Docker




    - Implementar Dockerfile otimizado para produção
    - Criar docker-compose.yml para orquestração local
    - Configurar variáveis de ambiente para diferentes ambientes
    - _Requisitos: 9.1, 9.2, 9.3_

  - [x] 5.2 Configurar pipeline de CI/CD



    - Criar workflow GitHub Actions para build e deploy
    - Implementar testes básicos no pipeline
    - Configurar deploy automático para VPS
    - _Requisitos: 9.1, 9.2, 9.4_

- [x] 6. Implementar tratamento de erros básico



  - Configurar Shadcn/ui Toast para feedback de ações
  - Criar hook personalizado para tratamento de erros tRPC
  - Implementar Error Boundary para captura de erros React
  - _Requisitos: 5.3, 5.4, 6.2, 6.3_

**🎯 Resultado do Épico 1:** Aplicação implantada na VPS com login funcionando, estrutura de navegação pronta e pipeline de deploy operacional.

---

### 👥 ÉPICO 2: Gerenciamento de Entidades (CRUD de Clientes)
*Objetivo: Primeira funcionalidade de negócio completa*

- [x] 7. Implementar modelo de dados para Clientes


  - [x] 7.1 Atualizar schema do Prisma com modelo Client


    - Definir modelo Client e enum ClientStatus
    - Criar e executar migração para tabela de clientes\
    - Testar operações básicas no banco
    - _Requisitos: 2.1, 6.1_

  - [x] 7.2 Criar schemas de validação Zod para Cliente


    - Implementar schemas para validação de dados de cliente
    - Criar tipos TypeScript derivados dos schemas Zod
    - Adicionar validação de unicidade de nome
    - _Requisitos: 5.1, 5.2_

- [x] 8. Desenvolver API tRPC para CRUD de clientes


  - Criar `src/server/api/routers/client.ts` com todas as operações CRUD
  - Implementar procedures: getAll, create, update, delete
  - Adicionar validação de dados e tratamento de erros específicos
  - Implementar testes unitários para as procedures
  - _Requisitos: 2.1, 2.2, 2.5_





- [x] 9. Criar interface completa para gerenciamento de clientes


  - [x] 9.1 Implementar componentes UI para clientes

    - Implementar componente ClientList com tabela Shadcn/ui
    - Criar componente ClientForm para adicionar/editar clientes
    - Desenvolver ClientModal para interface de criação/edição


    - Implementar confirmação de exclusão com modal
    - _Requisitos: 2.1, 2.3, 2.4, 2.5_

  - [x] 9.2 Integrar componentes com API tRPC


    - Conectar ClientList com procedure getAll usando React Query
    - Implementar mutations para create, update e delete
    - Adicionar tratamento de erros e feedback visual com Toast
    - Implementar atualização automática da lista após operações
    - _Requisitos: 2.2, 2.4, 2.5, 2.6_

- [x] 10. Adicionar otimizações para gerenciamento de clientes


  - Implementar skeleton loaders para carregamento da lista
  - Adicionar debouncing para busca de clientes
  - Otimizar queries com índices apropriados
  - _Requisitos: 8.1, 8.2, 8.3_

**🎯 Resultado do Épico 2:** Sistema completo de gerenciamento de clientes funcionando em produção. Usuários podem criar, editar, visualizar e excluir clientes.

---

### 📊 ÉPICO 3: Funcionalidade Principal (Lançamento e Consulta de KPIs)
*Objetivo: MVP completo com funcionalidade principal*

- [x] 11. Implementar modelo de dados para KPIs



  - [x] 11.1 Atualizar schema do Prisma com modelo KpiEntry

    - Definir modelo KpiEntry e enum KpiType
    - Criar relacionamento com modelo Client
    - Criar e executar migração para tabela de KPIs
    - _Requisitos: 3.1, 4.1, 6.1_

  - [x] 11.2 Criar schemas de validação Zod para KPIs


    - Implementar schemas para validação de dados de KPI
    - Adicionar regras específicas (receita monetária, percentuais 0-100)
    - Criar tipos TypeScript para formulários de KPI
    - _Requisitos: 5.1, 5.2, 5.3_

 - [x] 12. Desenvolver API tRPC para operações de KPI



  - [x] Criar `src/server/api/routers/kpiEntry.ts` com procedures necessárias
  - [x] Implementar getByDate para buscar dados de uma data específica
  - [x] Criar upsertMany para salvar múltiplas entradas de KPI
  - [x] Adicionar delete para remoção de entradas individuais
  - [x] Implementar testes unitários para as procedures
  - _Requisitos: 3.1, 4.1, 6.1, 7.5_

- [x] 13. Implementar sistema de entrada de dados de KPI
  - [x] 13.1 Criar componente de seleção de data
    - Implementar DateSelector usando Shadcn/ui DatePicker
    - Adicionar validação de formato de data
    - Implementar navegação entre datas com preservação de dados
    - _Requisitos: 3.1, 3.2, 3.4_

  - [x] 13.2 Desenvolver tabela principal de entrada de KPIs
    - Criar KpiEntryTable como componente principal
    - Implementar KpiEntryCell para entrada de dados editável
    - Adicionar validação em tempo real para cada tipo de KPI
    - Implementar feedback visual para campos modificados
    - _Requisitos: 4.1, 4.2, 4.3, 4.4, 5.1, 5.2, 5.3_

  - [x] 13.3 Implementar funcionalidade de salvamento
    - Criar SaveButton com estados de loading e sucesso
    - Implementar lógica de salvamento em lote usando upsertMany
    - Adicionar tratamento de erros específicos para conflitos de dados
    - Implementar confirmação visual de salvamento bem-sucedido
    - _Requisitos: 4.5, 6.1, 6.2, 6.3, 6.5_

- [x] 14. Desenvolver interface de visualização e edição
  - [x] 14.1 Implementar carregamento de dados existentes
    - Conectar DateSelector com API para carregar dados da data selecionada
    - Implementar preenchimento automático da tabela com dados existentes
    - Adicionar indicadores visuais para campos com dados salvos
    - _Requisitos: 7.1, 3.2, 3.3_

  - [x] 14.2 Adicionar funcionalidades de edição avançada
    - Implementar detecção de mudanças em campos existentes
    - Criar indicadores visuais para campos modificados
    - Adicionar funcionalidade de desfazer alterações
    - Implementar exclusão de registros individuais com confirmação
    - Remover spinners dos inputs e posicionar ícones de ação sobrepostos nos campos
    - _Requisitos: 7.2, 7.3, 7.4, 7.5_

- [ ] 15. Implementar otimizações de performance para KPIs
  - Adicionar cache do React Query para dados frequentemente acessados
  - Implementar lazy loading para listas grandes de clientes
  - Otimizar queries do banco com índices em campos de busca
  - Adicionar compressão de dados para requests grandes
  - _Requisitos: 8.1, 8.2, 8.3_

- [ ] 16. Finalizar validação e tratamento de erros
  - Implementar validação client-side com feedback em tempo real
  - Criar mensagens de erro específicas para cada tipo de validação
  - Adicionar tratamento de erros de rede e timeout
  - Implementar recovery automático para falhas temporárias
  - _Requisitos: 5.1, 5.2, 5.3, 5.4_

**🎯 Resultado do Épico 3:** MVP completo funcionando em produção. Equipe de operações pode substituir completamente as planilhas pelo sistema.

---

### 🔧 TAREFAS CONTÍNUAS (Executar durante todos os épicos)

- [x] 17. Implementar testes essenciais (por épico)
  - [x] 17.1 Testes para Épico 1: Autenticação e navegação
  - [x] 17.2 Testes para Épico 2: CRUD de clientes
  - [x] 17.3 Testes para Épico 3: Sistema de KPIs
  - _Requisitos: Todos os requisitos funcionais_

- [ ] 18. Melhorias de UX e polimento (por épico)
  - [ ] 18.1 UX para Épico 1: Animações de login e navegação
  - [ ] 18.2 UX para Épico 2: Interações suaves no CRUD de clientes
  - [ ] 18.3 UX para Épico 3: Experiência otimizada de entrada de dados
  - _Requisitos: 8.1, 8.5_

## Estratégia de Execução

### 🎯 Abordagem por Fatias Verticais
Este plano segue a metodologia de "fatias verticais" onde cada épico entrega valor completo e funcional:

- **Épico 1**: Sistema base implantado com autenticação
- **Épico 2**: Funcionalidade completa de gerenciamento de clientes  
- **Épico 3**: MVP completo com sistema de KPIs

### 📋 Ordem de Execução
1. **Execute todos os itens de um épico** antes de passar para o próximo
2. **Tarefas com sub-itens** devem ter todos os sub-itens completados
3. **Tarefas contínuas (17-18)** devem ser executadas durante cada épico
4. **Deploy e teste** após cada épico para validar a entrega

### 🧪 Estratégia de Testes
- **Testes unitários**: Durante o desenvolvimento de cada componente
- **Testes de integração**: Ao final de cada épico
- **Testes manuais**: Validação completa após cada épico
- **Testes de aceitação**: Com usuários finais após Épico 2 e 3

### 🚀 Entregas Incrementais
- **Após Épico 1**: Sistema no ar com login funcionando
- **Após Épico 2**: Gerenciamento completo de clientes
- **Após Épico 3**: MVP completo substituindo planilhas

### 🔧 Dependências Externas
- **Supabase**: Projeto configurado com credenciais de produção
- **VPS**: Servidor configurado com Docker e acesso SSH
- **GitHub**: Repositório com secrets configurados para CI/CD
- **Domínio**: DNS apontando para VPS (opcional)

### ✅ Critérios de Sucesso por Épico

#### Épico 1 - Fundação
- [ ] Aplicação acessível via VPS
- [ ] Login/logout funcionando
- [ ] Pipeline de deploy automático
- [ ] Estrutura de navegação operacional

#### Épico 2 - Clientes  
- [ ] CRUD completo de clientes funcionando
- [ ] Interface intuitiva e responsiva
- [ ] Validação e tratamento de erros
- [ ] Performance adequada (< 2s carregamento)

#### Épico 3 - KPIs (MVP Completo)
- [ ] Entrada de dados de KPIs funcionando
- [ ] Validação específica por tipo de KPI
- [ ] Visualização e edição de dados existentes
- [ ] Equipe consegue substituir planilhas 100%
- [ ] Redução de 50% no tempo de entrada de dados

### 🔄 Processo de Validação
1. **Desenvolvimento**: Implementar tarefa com testes
2. **Review**: Validar código e funcionalidade
3. **Deploy**: Atualizar ambiente de produção
4. **Teste**: Validar funcionamento em produção
5. **Feedback**: Coletar feedback e ajustar se necessário

### 📌 Backlog de Ações Pendentes (To‑Do)

#### Performance
- [ ] Mapear queries críticas e criar índices: `kpi_entries(date, client_id, kpi_type)`, `clients(name)`
- [ ] Habilitar batching no tRPC
- [ ] Implementar cache estável no React Query para KPIs por data
- [ ] Virtualizar tabelas/listas (clientes/KPIs) e definir paginação
- [ ] Adicionar compressão (Brotli/Gzip) no servidor/NGINX
- [ ] Avaliar suspense/streaming para melhorar TTI
- [ ] Medir e ajustar performance com base no crescimento de clientes

#### Validações & Tratamento de Erros
- [ ] Validação reativa por campo (BRL e percentuais 0–100) com mensagens específicas
- [ ] Tratar erros de rede/timeout e exibir ações de retry
- [ ] Recovery automático para falhas temporárias (queue/offline sync simples)
- [ ] Cobrir cenários extremos de desfazer/undo (por célula/global)

#### UX & Polimento
- [ ] Animações/microinterações em login/CRUD/KPI
- [ ] Skeletons consistentes em listas/tabelas
- [ ] Estados de empty com CTA
- [ ] Padronizar toasts entre CRUD e KPIs
- [ ] Inputs numéricos sem spinners (pt-BR) e máscara de moeda BRL
- [ ] Revisar textos/mensagens de UI (pt-BR)
- [ ] Migrar/revisar tokens de tema (Tailwind 4/Shadcn)

#### Banco de Dados & Prisma
- [ ] Conferir `prisma/schema.prisma` e alinhar com docs (Client, KpiEntry, enums)
- [ ] Criar/aplicar migrações dos índices
- [ ] Sincronizar Prisma após mudanças (db:pull / db:generate)

#### API & tRPC
- [ ] Implementar `kpiEntry.getByMonth` (histórico pivotado)
- [ ] Padronizar mapeamento de erros (ex.: P2002 → conflito) no middleware
- [ ] Definir limites de payload e saneamento de entrada

#### Autenticação & Segurança
- [ ] Verificar Supabase Auth no contexto do tRPC e middlewares de rotas protegidas
- [ ] Avaliar RLS no Supabase (produção) e planejar RBAC básico
- [ ] Avaliar rate-limiting simples para API
- [ ] Planejar audit trail básico (modelo já esboçado) para versão futura

#### Infra, Deploy & CI/CD
- [ ] Revisar `docker-compose.yml` e workflow de deploy (variáveis/serviços)
- [ ] Garantir `.env` e secrets do pipeline atualizados
- [ ] Healthchecks simples (Next/NGINX) para uptime 99.8%
- [ ] Conferir versões Node/Next/Tailwind na VPS e alinhar
- [ ] Smoke-test de deploy end‑to‑end na VPS

#### Testes & Observabilidade
- [ ] Rodar e integrar testes unitários no CI (cobertura mínima)
- [ ] Instrumentar logs de API/DB (latência, taxas de erro)
- [ ] Definir métricas de performance (LCP/TTI, API < 500ms, DB < 100ms)
- [ ] Incluir testes de acessibilidade (axe) nos componentes críticos
- [ ] Ensaios manuais por épico antes de fechar MVP

#### Documentação & Onboarding
- [ ] README de dev com uso do MCP (Supabase/Shadcn)
- [ ] Guia rápido de onboarding para operadores
- [ ] Dev Docs curtos dos endpoints/fluxos

#### Planejamento Fase 2 (Dashboard)
- [ ] Definir gráficos, filtros e endpoints de agregação
- [ ] Iniciar POC de agregações para KPIs
- [ ] Guideline de estilos de gráfico
- [ ] Planejar backlog do dashboard com base no PRD
- [ ] Avaliar necessidade futura de exportações (CSV/Excel)

#### Qualidade & Compatibilidade
- [ ] Confirmar tratamento de timezone (UI/DB) nas datas
- [ ] Garantir compatibilidade cross‑browser (Chrome/Firefox/Edge)

#### Go‑live & Pós‑lançamento
- [ ] Revisão final dos critérios de aceitação por requisito
- [ ] Agendar sessão de feedback com a equipe de operações
- [ ] Definir métricas de adoção/uso e monitoramento
- [ ] Publicar release notes v1.0 do MVP
- [ ] Reavaliar riscos e ajustar plano conforme feedback