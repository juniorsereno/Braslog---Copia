# Sistema de Análise Logística

Sistema web para gestão de KPIs logísticos, desenvolvido com T3 Stack.

## Stack Tecnológica

- **Framework**: Next.js 15 (App Router)
- **Linguagem**: TypeScript
- **API**: tRPC
- **ORM**: Prisma
- **Banco de Dados**: PostgreSQL (via Supabase)
- **Autenticação**: Supabase Auth
- **UI**: React + Shadcn/ui
- **Estilização**: Tailwind CSS
- **Validação**: Zod

## Configuração do Ambiente

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env` e configure as variáveis:

```bash
cp .env.example .env
```

Configure as seguintes variáveis no arquivo `.env`:

```env
# Banco de Dados
DATABASE_URL="postgresql://postgres:password@localhost:5432/braslog"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="sua-url-do-supabase"
NEXT_PUBLIC_SUPABASE_ANON_KEY="sua-chave-anonima-do-supabase"
SUPABASE_SERVICE_ROLE_KEY="sua-chave-de-servico-do-supabase"
```

### 3. Configurar Banco de Dados

```bash
# Gerar cliente Prisma
npm run db:generate

# Aplicar migrações
npm run db:migrate
```

## Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Inicia servidor de desenvolvimento
npm run build        # Build para produção
npm run start        # Inicia servidor de produção
npm run preview      # Build + start

# Banco de Dados
npm run db:generate  # Gera cliente Prisma
npm run db:migrate   # Aplica migrações
npm run db:push      # Push schema para DB
npm run db:studio    # Abre Prisma Studio

# Qualidade de Código
npm run lint         # Executa ESLint
npm run lint:fix     # Corrige problemas do ESLint
npm run typecheck    # Verifica tipos TypeScript
npm run format:check # Verifica formatação
npm run format:write # Formata código
npm run check        # Lint + typecheck
```

## Estrutura do Projeto

```
src/
├── app/                 # App Router (Next.js 13+)
├── components/          # Componentes React
│   └── ui/             # Componentes Shadcn/ui
├── lib/                # Utilitários e configurações
├── server/             # Código do servidor
│   └── api/            # Roteadores tRPC
├── styles/             # Estilos globais
└── trpc/               # Configuração tRPC
```

## Funcionalidades

### MVP (Fase 1)
- [x] Configuração base do projeto
- [x] Sistema de autenticação (Supabase Auth + tRPC context)
- [x] Gerenciamento de clientes (CRUD completo)
- [x] Interface de entrada de KPIs (formulário diário com salvamento em lote)
- [x] Validação de dados (receita BRL, percentuais 0-100)
- [x] Persistência no banco de dados (Prisma/Supabase)

### Fase 2 (Futuro)
- [x] Histórico pivotado de KPIs por mês (5 tabelas por KPI, clientes x dias) – implementado no MVP por necessidade
- [ ] Dashboard analítico
- [ ] Gráficos e relatórios
- [ ] Exportação de dados
- [ ] Análise de tendências

## Desenvolvimento

O projeto segue as melhores práticas do T3 Stack:

- **Type Safety**: TypeScript end-to-end
- **API Type Safe**: tRPC para comunicação cliente-servidor
- **Schema First**: Prisma como fonte única da verdade
- **Component Based**: React com componentes reutilizáveis
- **Modern CSS**: Tailwind CSS com design system

## Deploy

O projeto está configurado para deploy em VPS usando Docker. Consulte a documentação de arquitetura para mais detalhes.
