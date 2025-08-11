# Sistema de Análise Logística Product Requirements Document (PRD)

## Objetivos e Contexto

#### Objetivos

* Permitir a inserção rápida e centralizada dos 5 KPIs logísticos, eliminando a necessidade de múltiplas planilhas.
* Garantir a precisão dos dados inseridos através de um sistema com validações, servindo como uma "fonte única da verdade".
* Reduzir o tempo gasto pela equipe de operações na entrada de dados em pelo menos 50%.
* Estabelecer a base para a Fase 2, que fornecerá à gestão uma visão consolidada e em tempo real do desempenho operacional através de um dashboard.

#### Contexto

A equipe de operações da empresa atualmente gerencia seus indicadores de desempenho (KPIs) logísticos através de um processo manual e fragmentado, utilizando diversas planilhas. Este método, além de consumir tempo, é suscetível a erros, dificultando a análise de dados e a tomada de decisões ágeis.

O "Sistema de Análise Logística" foi proposto para resolver este problema, criando uma plataforma web centralizada. O MVP (escopo da Fase 1) focará na criação de uma interface robusta para a entrada de dados, substituindo as planilhas. A fase subsequente se concentrará no desenvolvimento de um dashboard analítico para a visualização estratégica desses dados.

#### Histórico de Alterações

| Data | Versão | Descrição | Autor |
| :--- | :--- | :--- | :--- |
| 06/08/2025 | 1.0 | Versão inicial do documento | John (PM) |

## Requisitos

#### Funcionais (FR)

1.  **FR1 - Autenticação:** O sistema deve permitir que usuários autorizados façam login com usuário/senha e saiam do sistema (logout).
2.  **FR2 - Gerenciamento de Clientes:** O sistema deve permitir que um usuário autorizado Crie, Leia, Atualize e Delete (CRUD) clientes.
3.  **FR3 - Seleção de Data:** O usuário deve poder selecionar uma data para a qual deseja inserir ou visualizar os dados.
4.  **FR4 - Interface de Entrada de Dados:** Para uma data selecionada, o sistema deve exibir uma lista de clientes e campos para a inserção dos 5 KPIs (Receita, On Time, Ocupação, Terceiro, Disponibilidade).
5.  **FR5 - Validação de Dados:** O sistema deve validar os dados inseridos: Receita deve ser um valor monetário (BRL), e os outros 4 KPIs devem ser valores percentuais (ex: 0 a 100).
6.  **FR6 - Persistência de Dados:** O usuário deve poder salvar os dados inseridos para um dia. O sistema deve armazenar esses valores, associando-os corretamente ao cliente e à data.
7.  **FR7 - Visualização e Edição de Dados (Edição Avançada):** O usuário deve poder visualizar e editar, em formato de tabela, todos os dados inseridos para uma data selecionada, com:
    - Detecção de alterações por célula (indicadores visuais de mudanças)
    - Desfazer por célula e desfazer global (restaurar valores ao estado inicial do dia)
    - Exclusão individual de lançamentos com confirmação
    - Ações de desfazer e excluir acessíveis como ícones sobrepostos aos campos
    - Inputs numéricos sem spinners de incremento/decremento

#### Não-Funcionais (NFR)

1.  **NFR1 - Performance:** A página de entrada de dados deve carregar em menos de 2 segundos. A operação de salvar os dados deve confirmar o sucesso em menos de 1 segundo.
2.  **NFR2 - Usabilidade:** O sistema deve ser intuitivo o suficiente para que a equipe de operações o utilize com mínimo treinamento, visando a meta de reduzir o tempo de entrada de dados em 50%.
3.  **NFR3 - Segurança:** O acesso a todas as funcionalidades do sistema deve ser restrito a usuários autenticados.
4.  **NFR4 - Tecnologia:** O sistema deve ser construído utilizando a stack aprovada: Frontend com React/Next.js, Backend com Node.js/TypeScript e Banco de Dados Supabase (PostgreSQL).
5.  **NFR5 - Infraestrutura:** A aplicação deve ser containerizada com Docker e ser implantável via Docker Compose na infraestrutura VPS existente.
6.  **NFR6 - Disponibilidade:** O sistema deve ter uma disponibilidade (uptime) de 99.8% durante o horário comercial.

## Objetivos de Design da Interface do Usuário (UI/UX)

#### Visão Geral de UX

A visão de UX é criar uma interface limpa, objetiva e extremamente eficiente, focada em minimizar o tempo de entrada de dados e reduzir a carga cognitiva do operador. Para atingir esse objetivo, utilizaremos os componentes da biblioteca **Shadcn/ui**, que são projetados com foco em acessibilidade e usabilidade.

#### Paradigmas Chave de Interação

A interação será baseada em formulários e tabelas de dados. O fluxo principal será: 1. Selecionar uma data. 2. Preencher a tabela de KPIs para os clientes do dia. 3. Salvar tudo com um único clique. A navegação será simples, com um menu lateral.

#### Telas e Visões Principais

Para o MVP, as telas essenciais são:
* **Tela de Login:** Para acesso seguro ao sistema.
* **Tela de Lançamento Diário:** A tela principal para a entrada dos 5 KPIs.
* **Tela de Consulta de Lançamentos:** Onde os dados inseridos podem ser visualizados e editados, incluindo um histórico pivotado por mês (5 tabelas por KPI com cabeçalhos de dias e linhas de clientes).
* **Tela de Gestão de Clientes:** A interface para o CRUD de clientes.

#### Acessibilidade

O uso do **Shadcn/ui** como base já nos garante um alto nível de acessibilidade (compatibilidade com leitores de tela, navegação por teclado, etc.), que é um dos pontos fortes da biblioteca. Manteremos esse padrão em todas as customizações.

#### Identidade Visual (Branding)

A identidade visual será construída utilizando os componentes da biblioteca **Shadcn/ui**. Isso garante um visual moderno, limpo e profissional desde o início. A customização dos componentes (cores, fontes, bordas) será feita para se alinhar com a identidade visual da sua empresa.

#### Dispositivos e Plataformas Alvo

A aplicação será **Web Responsiva**, com foco principal de uso em **Desktops**.

## Suposições Técnicas

#### Estrutura do Repositório

A aplicação será desenvolvida em um **Monorepo**. Este repositório conterá os pacotes para o frontend (Next.js), o backend (Node.js) e possivelmente pacotes compartilhados (ex: tipos TypeScript).

#### Arquitetura de Serviço

A arquitetura do backend será um **Monolito**. Uma única aplicação Node.js será responsável por todas as APIs e lógica de negócio.

#### Requisitos de Teste

Para o MVP, o foco será em **Testes de Unidade** para a lógica de negócio crítica no backend e para os componentes React mais complexos no frontend.

#### Suposições Técnicas e Requisições Adicionais

* **Frontend:** A aplicação **deve** ser construída com **React** e o framework **Next.js**.
* **Backend:** A aplicação **deve** ser construída com **Node.js** e **TypeScript**.
* **Banco de Dados:** O banco de dados **deve** ser o **Supabase** (utilizando PostgreSQL).
* **Biblioteca de UI:** A interface **deve** utilizar os componentes da biblioteca **Shadcn/ui**.
* **Infraestrutura e Deploy:** A implantação **deve** ser feita via **Docker Compose** em uma **VPS**, com automação a partir do **GitHub Actions**.

## Lista de Épicos

* **Épico 1: Fundação, Autenticação e Deploy Inicial.**
    * **Objetivo:** Estabelecer toda a estrutura do projeto (monorepo, Docker, CI/CD), implementar a autenticação de usuários e realizar o primeiro deploy do sistema com uma tela de login funcional.

* **Épico 2: Gerenciamento de Entidades (CRUD de Clientes).**
    * **Objetivo:** Implementar a funcionalidade completa de criação, leitura, atualização e exclusão (CRUD) de clientes.

* **Épico 3: Funcionalidade Principal (Lançamento e Consulta de KPIs).**
    * **Objetivo:** Desenvolver o formulário principal para a entrada diária dos 5 KPIs e a tela de consulta para visualização e edição dos dados.

## Detalhes do Épico 1: Fundação, Autenticação e Deploy Inicial

#### **História 1.1: Configuração Inicial do Projeto e Monorepo**
* **Como um** Desenvolvedor, **eu quero** a estrutura inicial do monorepo configurada, **para que** eu tenha uma base organizada para começar.
* **Critérios de Aceitação:**
    1. Repositório Git inicializado.
    2. Estrutura de monorepo (npm workspaces) criada com pastas `apps/web` e `apps/api`.
    3. Configurações de Linter (ESLint) e Formatter (Prettier) instaladas.

#### **História 1.2: Estruturação da Aplicação Backend (Node.js)**
* **Como um** Desenvolvedor, **eu quero** a aplicação backend inicializada com Node.js e TypeScript, **para que** eu tenha o servidor base para as APIs.
* **Critérios de Aceitação:**
    1. Projeto Node.js/TypeScript inicializado em `apps/api`.
    2. Servidor web (Express) rodando.
    3. Endpoint de "health check" (`/health`) retornando 200 OK.

#### **História 1.3: Estruturação da Aplicação Frontend (Next.js)**
* **Como um** Desenvolvedor, **eu quero** a aplicação frontend inicializada com Next.js, **para que** eu tenha a base para as telas.
* **Critérios de Aceitação:**
    1. Projeto Next.js/TypeScript inicializado em `apps/web`.
    2. Shadcn/ui inicializado no projeto.
    3. Aplicação rodando localmente.

#### **História 1.4: Containerização das Aplicações com Docker**
* **Como um** Desenvolvedor, **eu quero** `Dockerfile`s e um `docker-compose.yml`, **para que** eu possa rodar o ambiente localmente com um comando.
* **Critérios de Aceitação:**
    1. `Dockerfile` funcional para o backend.
    2. `Dockerfile` funcional para o frontend.
    3. `docker-compose.yml` orquestrando os dois serviços.
    4. `docker-compose up` inicia a aplicação com sucesso.

#### **História 1.5: Conexão do Backend com o Supabase**
* **Como um** Desenvolvedor, **eu quero** que o backend se conecte ao Supabase, **para que** possamos persistir dados.
* **Critérios de Aceitação:**
    1. Client do Supabase/PostgreSQL instalado no backend.
    2. Credenciais de conexão lidas de variáveis de ambiente (`.env`).
    3. Teste de conexão bem-sucedido na inicialização do servidor.

#### **História 1.6: Implementação da API de Autenticação**
* **Como um** Desenvolvedor, **eu quero** os endpoints de API para login, **para que** o frontend possa autenticar usuários.
* **Critérios de Aceitação:**
    1. Tabela `users` criada no Supabase.
    2. Endpoint `POST /api/auth/login` criado.
    3. Endpoint valida credenciais e retorna um token JWT em caso de sucesso.

#### **História 1.7: Criação da Interface de Login**
* **Como um** Operador, **eu quero** uma tela de login, **para que** eu possa acessar o sistema.
* **Critérios de Aceitação:**
    1. Página `/login` criada no Next.js com formulário (componentes Shadcn/ui).
    2. Formulário chama a API de login.
    3. Em caso de sucesso, redireciona para a página principal.
    4. Em caso de falha, exibe mensagem de erro.

#### **História 1.8: Configuração do Pipeline de CI/CD (Deploy)**
* **Como um** Desenvolvedor, **eu quero** um workflow de GitHub Actions, **para que** a aplicação seja implantada na VPS automaticamente.
* **Critérios de Aceitação:**
    1. Arquivo de workflow criado em `.github/workflows/deploy.yml`.
    2. Workflow é acionado em push para a branch `main`.
    3. Workflow builda as imagens Docker.
    4. Workflow se conecta à VPS via SSH e executa `docker-compose up`.

## Detalhes do Épico 2: Gerenciamento de Entidades (CRUD de Clientes)

#### **História 2.1: Criação da Tabela de Clientes no Banco de Dados**
* **Como um** Desenvolvedor, **eu quero** a tabela `clients` criada no DB, **para que** possamos armazenar os dados dos clientes.
* **Critérios de Aceitação:**
    1. Script de migração para a tabela `clients` criado.
    2. Tabela contém campos como `id`, `name`, `status`.
    3. Permissões de acesso (RLS) configuradas para usuários autenticados.

#### **História 2.2: Implementação da API para o CRUD de Clientes**
* **Como um** Desenvolvedor, **eu quero** os endpoints da API para CRUD de clientes, **para que** a UI possa gerenciar os dados.
* **Critérios de Aceitação:**
    1. Endpoints `POST`, `GET`, `PUT`, `DELETE` para `/api/clients` criados e funcionais.
    2. Todos os endpoints protegidos por autenticação.

#### **História 2.3: Criação da Interface para Listagem de Clientes**
* **Como um** Operador, **eu quero** uma tela para visualizar os clientes, **para que** eu possa ter uma visão geral.
* **Critérios de Aceitação:**
    1. Página `/dashboard/clients` criada e protegida.
    2. Exibe os clientes em uma tabela do Shadcn/ui.
    3. Contém um botão "Adicionar Novo Cliente".

#### **História 2.4: Criação da Interface para Adicionar/Editar Clientes**
* **Como um** Operador, **eu quero** um formulário para adicionar/editar um cliente, **para que** eu possa manter os dados atualizados.
* **Critérios de Aceitação:**
    1. Um formulário (modal ou página) é aberto para criação/edição.
    2. O formulário chama as APIs corretas (`POST` ou `PUT`).
    3. Após salvar, a lista de clientes é atualizada.

#### **História 2.5: Implementação da Funcionalidade de Excluir Cliente**
* **Como um** Operador, **eu quero** poder excluir um cliente, **para que** a lista se mantenha limpa.
* **Critérios de Aceitação:**
    1. Opção de "Excluir" na lista de clientes.
    2. Um modal de confirmação é exibido antes da exclusão.
    3. A API `DELETE` é chamada e a lista na UI é atualizada.

## Detalhes do Épico 3: Funcionalidade Principal (Lançamento e Consulta de KPIs)

#### **História 3.1: Criação da Tabela de Lançamentos de KPIs**
* **Como um** Desenvolvedor, **eu quero** a tabela `kpi_entries` criada no DB, **para que** possamos armazenar os valores dos KPIs.
* **Critérios de Aceitação:**
    1. Script de migração para a tabela `kpi_entries` criado.
    2. Tabela contém campos para `id`, `date`, `client_id`, `kpi_type`, `kpi_value`.
    3. Restrição de unicidade para evitar entradas duplicadas (mesmo cliente, data, kpi).

#### **História 3.2: Implementação da API para Lançamento de KPIs**
* **Como um** Desenvolvedor, **eu quero** os endpoints da API para salvar e buscar os lançamentos, **para que** a UI funcione.
* **Critérios de Aceitação:**
    1. `POST /api/kpi-entries` para salvar múltiplos lançamentos de um dia.
    2. `GET /api/kpi-entries?date=YYYY-MM-DD` para buscar os lançamentos de um dia.
    3. `PUT /api/kpi-entries/:id` para atualizar um lançamento individual.
    4. Endpoints protegidos por autenticação.

#### **História 3.3: Criação da Interface de Lançamento Diário de KPIs**
* **Como um** Operador, **eu quero** uma tela para inserir os 5 KPIs para cada cliente, **para que** eu possa fazer meu trabalho diário.
* **Critérios de Aceitação:**
    1. Página principal do dashboard (`/dashboard`) criada e protegida.
    2. Contém um seletor de data.
    3. Exibe uma tabela com clientes nas linhas e KPIs nas colunas para entrada de dados.
    4. Um botão "Salvar" envia todos os dados para a API.

#### **História 3.4: Implementação da Edição de Lançamentos na Interface (Edição Avançada)**
* **Como um** Operador, **eu quero** poder editar valores já lançados, **para que** eu possa corrigir erros.
* **Critérios de Aceitação:**
    1. A tela de lançamento também funciona como tela de consulta/edição.
    2. O sistema detecta alterações por célula e destaca visualmente os campos modificados.
    3. O usuário pode desfazer alterações por célula e desfazer todas as alterações do dia.
    4. O usuário pode excluir um lançamento individual com confirmação, diretamente na célula.
    5. Ações de desfazer e excluir são acessíveis como ícones sobrepostos aos campos; inputs numéricos não exibem spinners.
    6. O botão "Salvar" atualiza, insere ou remove registros conforme as mudanças realizadas.

## Relatório de Resultados do Checklist

* **Completude do PRD:** 100%
* **Adequação do Escopo do MVP:** Ideal ("Just Right")
* **Prontidão para a Fase de Arquitetura:** Pronto
* **Análise de Gaps Críticos:** Nenhum gap crítico foi identificado.
