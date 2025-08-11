# Sistema de Análise Logística Fullstack Architecture Document

## Introdução

Este documento descreve a arquitetura full-stack completa para o **Sistema de Análise Logística**, incluindo os sistemas de backend, a implementação de frontend e sua integração. Ele serve como a única fonte da verdade para o desenvolvimento orientado por IA, garantindo consistência em toda a pilha de tecnologia.

#### Template Inicial ou Projeto Existente

O projeto **será construído com base no T3 Stack**. Esta decisão estabelece uma fundação tecnológica moderna que inclui Next.js, TypeScript, **tRPC** (para a camada de API), **Prisma** (para acesso ao banco de dados) e **Supabase Auth** (para autenticação). Toda a arquitetura a seguir será definida em alinhamento com os padrões e as melhores práticas recomendadas pelo T3 Stack.

#### Histórico de Alterações

| Data | Versão | Descrição | Autor |
| :--- | :--- | :--- | :--- |
| 06/08/2025 | 1.1 | Alterada a base do projeto para o T3 Stack. | Winston (Architect) |
| 06/08/2025 | 1.0 | Versão inicial do documento de arquitetura. | Winston (Architect) |

## Arquitetura de Alto Nível

#### Resumo Técnico

A arquitetura do sistema será um "full-stack monolítico" fortemente tipado, construído sobre o **T3 Stack**. O frontend (Next.js/React) e o backend (servidor Next.js) residirão no mesmo projeto, comunicando-se via **tRPC** para garantir segurança de tipos de ponta a ponta. O **Prisma** gerenciará o acesso ao banco de dados Supabase (PostgreSQL), enquanto o **Supabase Auth** cuidará da autenticação. Toda a aplicação será containerizada com Docker e implantada em uma VPS.

#### Plataforma e Infraestrutura

* **Plataforma de Banco de Dados:** O banco de dados e a autenticação serão providos pelo **Supabase**.
* **Infraestrutura de Hospedagem:** A aplicação será implantada em uma **VPS (Servidor Virtual Privado)** gerenciada pela equipe, utilizando **Docker**.
* **Regiões de Deploy:** A ser definida (sugestão: `sa-east-1` em São Paulo).

#### Estrutura do Repositório

* **Estrutura:** O T3 Stack gera um **repositório monolítico**. O frontend e o backend coexistem dentro da mesma aplicação Next.js.
* **Organização do Código:** A lógica do backend (procedures tRPC) ficará em `src/server/api/routers`, os esquemas de banco de dados em `prisma/schema.prisma`, e os componentes de frontend em `src/components/`.

#### Diagrama da Arquitetura de Alto Nível

```mermaid
graph TD
    A[Usuário (Operador)] --> B{VPS (Docker)};
    B --> C[Aplicação Next.js / T3 Stack];
    
    subgraph "Aplicação Full-stack"
        C
        C -- Chamada de Procedure --> D[API tRPC];
        C -- Renderização --> E[Interface React (Shadcn/ui)];
    end

    D -- Query --> F[Prisma ORM];
    F -- Conexão Segura --> G[(Supabase PostgreSQL DB)];

    subgraph "Infraestrutura Externa"
        G
    end
Padrões Arquiteturais
Full-stack Monolítico com Next.js: O frontend e o backend são servidos pela mesma aplicação.

API Contratada por Tipos com tRPC: Garante que o frontend e o backend nunca estejam fora de sincronia.

Schema Centralizado com Prisma: O arquivo schema.prisma serve como a única fonte da verdade para a estrutura do banco de dados.

Componentização com React e Shadcn/ui: A interface é construída a partir de componentes reutilizáveis e acessíveis.

Stack de Tecnologia
Categoria	Tecnologia	Versão (Sugestão)	Propósito	Racional
Linguagem	TypeScript	~5.8.0	Linguagem principal	Garante segurança de tipos de ponta a ponta.
Runtime	Node.js	~22.4.0 (LTS)	Ambiente de execução do backend	Versão estável e segura para o servidor.
Framework Full-Stack	Next.js	~15.1.0	Framework principal	Base do T3 Stack, ótima performance.
Biblioteca de UI	React	~19.0.0	Construção da interface	Padrão do ecossistema Next.js.
Comunicação API	tRPC	~11.5.0	Conexão segura front-back	API com tipagem 100% segura.
ORM (DB Access)	Prisma	~6.0.0	Acesso ao banco de dados	Simplifica as queries e a gestão do schema.
Autenticação	Supabase Auth	v2 (Serviço)	Gerenciamento de login e sessões	Solução nativa e integrada ao DB.
Banco de Dados	PostgreSQL	~16.3	Armazenamento de dados	Provido pelo Supabase.
Estilização	Tailwind CSS	~4.1.0	Estilização CSS	Base para os componentes Shadcn/ui.
Componentes de UI	Shadcn/ui	latest	Componentes pré-construídos	Acelera o desenvolvimento da UI.
Validação de Schema	Zod	~3.25.0	Validação de dados	Garante que os dados estejam no formato correto.
Containerização	Docker	~27.0.0	Criação de containers	Garante a portabilidade do ambiente.
Orquestração Local	Docker Compose	~2.27.0	Gerenciamento do ambiente de dev	Facilita a execução local.
CI/CD	GitHub Actions	latest	Automação de build e deploy	Integração nativa com o repositório.

Exportar para as Planilhas
Modelos de Dados
Modelo: User (Usuário)
Propósito: Representa um membro da equipe de operações. Gerenciado pelo Supabase Auth.

Interface TypeScript:

TypeScript

interface User {
  id: string; // UUID
  email: string;
  createdAt: Date;
}
Modelo: Client (Cliente)
Propósito: Representa um cliente da empresa de logística.

Interface TypeScript:

TypeScript

interface Client {
  id: string; // UUID
  name: string;
  status: 'ATIVO' | 'INATIVO';
  createdAt: Date;
}
Modelo: KpiEntry (Lançamento de KPI)
Propósito: Representa um único valor de KPI registrado.

Interface TypeScript:

TypeScript

type KpiType = 'RECEITA' | 'ON_TIME' | 'OCUPACAO' | 'TERCEIRO' | 'DISPONIBILIDADE';

interface KpiEntry {
  id: string; // UUID
  date: Date;
  clientId: string;
  kpiType: KpiType;
  kpiValue: number;
  createdAt: Date;
}
Especificação da API (tRPC)
A API será organizada em roteadores, um para cada modelo de dados.

authRouter: Conterá o procedimento login.

clientRouter: Conterá os procedimentos getAll, create, update, e delete.

kpiEntryRouter: Conterá os procedimentos getByDate, upsertMany, delete e getByMonth (consulta mensal para histórico pivotado).

appRouter: Unificará todos os roteadores.

Componentes Lógicos
O sistema é dividido em 6 componentes lógicos principais: Interface do Usuário (UI), Camada de API (tRPC), Lógica de Negócio, Camada de Acesso a Dados (Prisma), Serviço de Autenticação (Supabase Auth) e o Banco de Dados (Supabase PostgreSQL).

Snippet de código

graph TD
    UI["Interface do Usuário"] --> API["Camada de API (tRPC)"];
    API --> Auth["Serviço de Autenticação"];
    API --> Logic["Lógica de Negócio"];
    Logic --> DAL["Acesso a Dados (Prisma)"];
    DAL --> DB[("Banco de Dados")];
APIs Externas
Não aplicável para o MVP.

Fluxos Principais
(Os diagramas de sequência para Login e Lançamento de KPIs foram definidos e aprovados.)

Esquema do Banco de Dados (schema.prisma)
Snippet de código

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Client {
  id        String     @id @default(uuid())
  name      String
  status    String     @default("ATIVO")
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
  entries   KpiEntry[]
}

model KpiEntry {
  id        String   @id @default(uuid())
  date      DateTime @db.Date
  kpiType   KpiType
  kpiValue  Decimal
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  clientId  String
  client    Client   @relation(fields: [clientId], references: [id])
  @@unique([date, clientId, kpiType])
}

enum KpiType {
  RECEITA
  ON_TIME
  OCUPACAO
  TERCEIRO
  DISPONIBILIDADE
}
Estrutura do Projeto e Padrões de Implementação
(A estrutura de pastas e os padrões de codificação seguirão as convenções do T3 Stack.)

Fluxo de Desenvolvimento e Deploy
(O fluxo de trabalho local via Docker Compose e o deploy automatizado via GitHub Actions para a VPS foram definidos e aprovados.)

Estratégia de Testes
(O foco do MVP será em Testes de Unidade utilizando Jest e React Testing Library.)

Padrões de Qualidade e Operação
(Os padrões de código, segurança, tratamento de erros e monitoramento foram definidos e aprovados.)