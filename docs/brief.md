# Project Brief: Sistema de Análise Logística

## Resumo Executivo

**Conceito do Produto:** Desenvolver um sistema de análise logística para a gestão de operações de carga fracionada (LTL). A plataforma permitirá à equipe de operações registrar diariamente cinco indicadores-chave de desempenho (KPIs): Receita por cliente, On Time (pontualidade), Ocupação da frota, percentual de Fretes com Terceiros e Disponibilidade da frota.

**Problema Principal:** O sistema visa eliminar a dependência de múltiplas planilhas para o controle operacional, um processo manual que atualmente dificulta a consolidação de dados, consome tempo e aumenta o risco de erros no preenchimento das informações diárias.

**Público-Alvo:** A equipe de operações internas da empresa de logística, responsável pela inserção e análise dos dados.

**Proposta de Valor e Estratégia:** Fornecer uma plataforma centralizada que simplifica a entrada de dados e automatiza a visualização do desempenho operacional. O desenvolvimento será faseado: a **primeira fase** focará na criação da funcionalidade de inserção dos dados diários, e a **segunda fase** implementará um dashboard analítico para compilar e apresentar as informações de forma estratégica, agilizando a tomada de decisões.

## Declaração do Problema

**Estado Atual e Pontos de Dor:**
Atualmente, o controle dos indicadores de desempenho logístico é realizado em diversas planilhas, com uma aba ou arquivo separado para cada métrica (Receita, On Time, Ocupação, etc.). Diariamente, a equipe de operações precisa **inserir manualmente os dados de cada cliente** em suas respectivas linhas. Embora os somatórios sejam automatizados por fórmulas, o processo de **entrada de dados descentralizado** é trabalhoso, consome um tempo significativo da equipe e é altamente suscetível a erros humanos, como digitação incorreta ou preenchimento na célula errada.

**Impacto do Problema:**
A dependência das planilhas resulta em uma tomada de decisão mais lenta e reativa, pois a visão consolidada do desempenho não é imediata. Existe um risco constante de basear análises estratégicas em dados imprecisos. Além disso, a dificuldade em cruzar informações entre os diferentes indicadores impede uma análise mais profunda e a identificação rápida de tendências, como a correlação entre a ocupação dos caminhões e a receita de um cliente específico.

**Por que a Solução Atual é Insuficiente:**
O sistema de planilhas é inerentemente limitado. Ele não oferece validação de dados na entrada, não permite a visualização de dados em tempo real e não é escalável para acompanhar o crescimento do volume de clientes ou a adição de novos indicadores no futuro. Falta uma "fonte única da verdade" para os dados operacionais da empresa.

**Urgência e Importância:**
A implementação de um sistema centralizado é fundamental para aumentar a eficiência operacional, garantir a confiabilidade dos dados e capacitar a equipe com ferramentas para uma gestão mais proativa e baseada em dados. Ter acesso rápido a análises precisas é um passo crucial para otimizar rotas, melhorar a rentabilidade por cliente e aumentar a qualidade geral do serviço prestado.

## Solução Proposta

**Conceito e Abordagem Principal:**
A solução proposta é o desenvolvimento de um sistema web interno. Este sistema terá uma interface dedicada para a inserção diária e sistemática dos cinco KPIs logísticos definidos. Todos os dados serão armazenados em um banco de dados centralizado, criando uma fonte única e confiável de informações. O desenvolvimento seguirá uma abordagem faseada:
1.  **Fase 1 (Módulo de Entrada de Dados):** Foco total na criação de formulários e da lógica de sistema para que a equipe de operações possa registrar os dados diários de forma segura, rápida e estruturada.
2.  **Fase 2 (Módulo de Visualização):** Implementação de um dashboard analítico que consumirá os dados do sistema para apresentar os KPIs de forma visual, com gráficos e tabelas consolidadas.

**Diferenciais Chave (vs. Planilhas):**
* **Fonte Única da Verdade:** Todos os dados operacionais residirão em um único local, eliminando a fragmentação e a inconsistência.
* **Entrada de Dados Guiada:** Formulários inteligentes que podem incluir validações para reduzir drasticamente os erros de digitação e garantir a qualidade dos dados.
* **Visualização Automatizada e em Tempo Real:** Um dashboard que se atualiza automaticamente, eliminando a necessidade de compilar relatórios manualmente e fornecendo insights instantâneos.
* **Escalabilidade:** A arquitetura do sistema permitirá o crescimento futuro, seja no volume de dados, no número de clientes ou na adição de novos indicadores, sem as limitações de performance e organização das planilhas.

**Visão de Alto Nível para o Produto:**
A visão é que este sistema se torne a principal ferramenta de gestão de desempenho da operação logística. O objetivo é transformar o processo de acompanhamento de reativo (olhando para o passado) para proativo (identificando tendências em tempo real), permitindo que a liderança tome decisões estratégicas com base em dados precisos e sempre atualizados.

## Público-Alvo

#### Segmento de Usuário Primário: Equipe de Operações

* **Perfil:** Colaboradores do departamento de operações logísticas, responsáveis pelo acompanhamento e registro diário das métricas de performance da frota e dos clientes.
* **Comportamentos e Fluxo de Trabalho Atual:** A rotina de trabalho envolve a abertura de múltiplas planilhas para inserir manualmente os dados de receita, pontualidade, ocupação, etc., para cada cliente. Utilizam as planilhas para registrar o histórico e visualizar totais diários.
* **Necessidades e Dores:** A principal necessidade é ter um método de entrada de dados mais eficiente, centralizado e menos propenso a erros. A dor central é o tempo gasto em tarefas repetitivas e a falta de uma visão consolidada e instantânea dos resultados.
* **Objetivos:** Registrar os dados do dia de forma rápida e precisa; ter acesso fácil aos KPIs consolidados para monitorar a saúde da operação.

#### Segmento de Usuário Secundário: Gestão / Liderança

* **Perfil:** Gestores, diretores ou líderes da área de logística e da empresa, que são responsáveis pela estratégia e pelos resultados do negócio.
* **Comportamentos e Fluxo de Trabalho Atual:** Atualmente, dependem dos relatórios compilados pela equipe de operações a partir das planilhas, o que pode gerar um atraso (delay) entre a coleta do dado e a análise estratégica.
* **Necessidades e Dores:** Precisam de acesso rápido e confiável a indicadores de performance para tomar decisões estratégicas. A dor é a dependência de relatórios manuais e a falta de visibilidade em tempo real sobre a operação.
* **Objetivos:** Acompanhar o desempenho da operação de forma consolidada e visual (principalmente na Fase 2, com o dashboard), identificar tendências, avaliar a rentabilidade e fundamentar decisões de negócio.

## Objetivos e Métricas de Sucesso

#### Objetivos de Negócio

* **Aumentar a Eficiência Operacional:** Reduzir o tempo gasto pela equipe com a inserção de dados operacionais em pelo menos 50% nos primeiros 3 meses após a implementação da Fase 1.
* **Melhorar a Confiabilidade dos Dados:** Eliminar erros de digitação e inconsistências, buscando 100% de precisão nos dados inseridos através das validações do sistema.
* **Agilizar a Tomada de Decisão:** Após a Fase 2, reduzir o tempo de compilação de relatórios de desempenho de horas para segundos, fornecendo dados consolidados em tempo real para a gestão.
* **Criar uma Base de Dados Estratégica:** Estabelecer uma fonte de dados centralizada e confiável que servirá de base para futuras análises de otimização logística e inteligência de negócio.

#### Métricas de Sucesso do Usuário

* **Adoção Completa:** 100% da equipe de operações utilizando exclusivamente o novo sistema para a inserção de dados diários dentro do primeiro mês de lançamento.
* **Redução de Esforço:** Diminuição significativa no tempo e nos passos necessários para a equipe de operações registrar todos os dados do dia.
* **Satisfação Elevada:** Obter feedback qualitativo positivo da equipe sobre a facilidade, clareza e agilidade do novo processo em comparação com as planilhas.
* **Confiança da Gestão:** Acesso frequente e confiança total nos dados apresentados no dashboard (pós-Fase 2) para discussões e decisões estratégicas.

#### Key Performance Indicators (KPIs) do Projeto

* **Taxa de Adoção:** Percentual da equipe de operações que utiliza a ferramenta diariamente. (Meta: 100% em 30 dias).
* **Taxa de Erros de Entrada:** Quantidade de erros prevenidos pelas validações do sistema. (Meta: Reduzir em mais de 95% os erros comuns de digitação).
* **Disponibilidade do Sistema (Uptime):** Percentual de tempo que o sistema está online e funcional durante o horário de trabalho. (Meta: 99.8%).

## Escopo do MVP (Minimum Viable Product)

#### Funcionalidades Essenciais (O que VAMOS fazer)

* **1. Autenticação de Usuários:**
    * Um sistema de login com usuário e senha para os membros da equipe de operações.
    * Uma funcionalidade de logout seguro.
* **2. Interface de Entrada de Dados:**
    * O usuário deverá poder selecionar uma data específica para fazer os lançamentos.
    * A tela principal exibirá uma lista de clientes, e para cada um haverá campos para inserir os 5 KPIs.
    * O sistema deverá ter validações básicas nos campos para garantir que valores numéricos (receita, porcentagens) sejam inseridos nos formatos corretos.
    * Haverá um botão para "Salvar" os dados do dia, registrando todas as informações de uma vez.
* **3. Persistência de Dados:**
    * Um banco de dados relacional para armazenar os lançamentos diários, associando cada registro a um cliente, uma data e o KPI correspondente.
* **4. Visualização e Edição Simples:**
    * Uma tela de consulta onde, ao selecionar uma data, o sistema exibirá uma tabela com os dados já lançados para cada cliente naquele dia.
    * A funcionalidade de clicar em um valor na tabela e poder editá-lo ou excluí-lo, para corrigir erros de inserção.
* **5. Gerenciamento Básico de Clientes (CRUD):**
    * Uma interface administrativa simples para **C**riar, **L**er, **A**tualizar e **D**eletar (CRUD) clientes no sistema, garantindo que a lista de clientes para lançamento esteja sempre atualizada.

#### Fora do Escopo do MVP (O que NÃO vamos fazer agora)

* **O Dashboard Analítico:** A criação da tela principal com gráficos, KPIs visuais e análises de tendência. **(Isto é o foco principal da Fase 2).**
* **Importação / Exportação de Dados:** Nenhuma funcionalidade para importar dados de planilhas existentes ou exportar os registros para formatos como Excel ou PDF. A entrada de dados no MVP será 100% manual através dos formulários do sistema.
* **Níveis de Permissão de Acesso:** Diferentes perfis de usuário (ex: administrador, operador, apenas visualização). O MVP terá um único perfil de acesso para a equipe de operações.
* **Alertas e Notificações Automáticas:** Qualquer sistema que envie alertas quando um KPI estiver fora da meta.
* **Portal do Cliente:** Qualquer interface para que os clientes da sua empresa de logística possam visualizar seus próprios dados.

#### Critério de Sucesso do MVP

O MVP será considerado um sucesso quando a equipe de operações conseguir, de forma independente e consistente, registrar 100% dos dados diários dos 5 KPIs no novo sistema, abandonando completamente o uso das planilhas para esta finalidade. Adicionalmente, o tempo médio para a equipe registrar os dados de um dia completo deve ser **reduzido em no mínimo 50%** em comparação ao processo anterior com planilhas.

## Visão Pós-MVP

#### Funcionalidades da Fase 2

A prioridade imediata após a conclusão do MVP é o desenvolvimento do **Dashboard Analítico**, que estava fora do escopo inicial. Ele incluirá:
* Visualização gráfica (barras, linhas, pizza) para cada um dos 5 KPIs.
* Filtros por período (dia, semana, mês, personalizado) e, possivelmente, por cliente.
* Cálculo de totais, médias e comparação entre diferentes períodos.
* Uma tela principal com a visão consolidada da performance geral da operação.

#### Visão de Longo Prazo (1-2 anos)

O objetivo é evoluir o sistema de uma ferramenta de análise para uma **plataforma de gestão logística integrada**. A visão de longo prazo inclui:
* **Integração com outros sistemas** (financeiro, TMS, rastreamento de frota) para automatizar a coleta de alguns KPIs, reduzindo ainda mais a necessidade de entrada manual de dados.
* **Módulo de Análise Preditiva** para, por exemplo, prever tendências de receita com base em dados históricos ou identificar riscos operacionais com antecedência (como a probabilidade de uma rota atrasar).
* **Análise de Rentabilidade** mais aprofundada por cliente, rota ou tipo de carga.

#### Oportunidades de Expansão

* **Portal do Cliente:** Criar uma versão simplificada do dashboard para que os clientes da sua empresa possam acessar e acompanhar a performance de suas próprias entregas (ex: On Time).
* **Aplicativo Móvel:** Desenvolver um aplicativo complementar para motoristas ou operadores em campo, permitindo o registro de ocorrências ou a atualização de status em tempo real.
* **Modelo SaaS (Software as a Service):** No futuro, a plataforma poderia ser adaptada e oferecida como um serviço por assinatura para outras pequenas e médias empresas de logística do mercado.

## Considerações Técnicas

#### Requisitos de Plataforma

* **Plataformas-Alvo:** Aplicação Web Responsiva, acessível através de navegadores em computadores desktop.
* **Suporte de Navegador:** Versões mais recentes do Google Chrome, Firefox e Microsoft Edge.
* **Requisitos de Performance:** A interface de entrada de dados deve ser extremamente rápida e leve, com carregamento abaixo de 2 segundos.

#### Preferências de Tecnologia

* **Frontend (Interface do Usuário):** **React com o framework Next.js**.
* **Backend (Lógica do Sistema):** **Node.js** (utilizando TypeScript).
* **Banco de Dados:** **Supabase** (utilizando PostgreSQL).
* **Hospedagem e Deployment:** Hospedagem em uma **VPS (Servidor Virtual Privado)**, com a aplicação sendo gerenciada e implantada via **Docker Compose**. A automação da CI/CD será feita a partir do **GitHub**.

#### Considerações de Arquitetura

* **Estrutura do Repositório:** **Monorepo**, onde o código do frontend e do backend ficam juntos.
* **Arquitetura de Serviço:** **Monolítica** (uma única aplicação de backend, containerizada com Docker).
* **Segurança:** O acesso ao sistema será protegido por autenticação (login/senha).

## Restrições e Premissas

#### Restrições (Fatores que DEVEMOS seguir)

* **Orçamento (Budget):** A ser definido.
* **Prazo (Timeline):** A ser definido.
* **Recursos (Resources):** O desenvolvimento será realizado primariamente por um **LLM de codificação**, com a **supervisão e revisão de um desenvolvedor humano**.
* **Técnicas (Technical):** O projeto deve ser desenvolvido utilizando a stack tecnológica definida na seção anterior.
* **Infraestrutura (Infrastructure):** A aplicação **deve ser implantada na infraestrutura de VPS com Docker que já está pronta**.

#### Premissas Chave (O que estamos assumindo como verdade)

* **Disponibilidade do Usuário:** Assume-se que a equipe de operações estará disponível para validar as funcionalidades e participar do treinamento.
* **Estabilidade dos Requisitos do MVP:** Assume-se que os 5 KPIs definidos são os corretos para a primeira fase e não mudarão durante o desenvolvimento do MVP.
* **Aceitação da Entrada Manual:** Assume-se que a entrada de dados manual no novo sistema é aceitável para o MVP.

## Riscos e Decisões

#### Riscos Principais (Key Risks)

* **Aumento do Escopo do MVP ("Scope Creep"):** Risco de surgirem solicitações para adicionar funcionalidades do dashboard (Fase 2) antes da conclusão da entrada de dados (Fase 1).
* **Usabilidade em Escala:** A tela de entrada de dados pode se tornar lenta ou difícil de usar se a lista de clientes crescer muito.

#### Decisões Chave

* **Dados Históricos:** Foi definido que **não haverá migração** de dados antigos das planilhas.
* **Backup do Banco de Dados:** Foi definido que, para o MVP, uma rotina de backup do banco de dados **não é um requisito**.
* **Treinamento:** O treinamento da equipe **será conduzido pelo desenvolvedor** supervisor.
* **Regras de Validação de KPIs:** O KPI de **Receita** aceitará um valor monetário (BRL), e os demais aceitarão **valores percentuais (0-100)**.

#### Áreas que Precisam de Mais Pesquisa

* Para a Fase 2, pesquisar as melhores práticas e tipos de gráficos para a visualização de cada um dos KPIs logísticos definidos.

## Próximos Passos

#### Ações Imediatas

1.  Revisar e aprovar a versão final deste Project Brief com todos os envolvidos.
2.  Compartilhar este documento com o desenvolvedor supervisor.
3.  Iniciar a criação do **PRD (Product Requirements Document)**.