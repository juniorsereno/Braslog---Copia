# Configuração do Banco de Dados - Supabase

Este diretório contém todos os scripts SQL necessários para configurar o banco de dados do Sistema de Análise Logística no Supabase.

## 📋 Pré-requisitos

1. Conta no Supabase criada
2. Projeto Supabase criado
3. Acesso ao SQL Editor do Supabase

## 🚀 Passo a Passo para Configuração

### 1. Acessar o Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Faça login na sua conta
3. Selecione seu projeto
4. Vá para **SQL Editor** no menu lateral

### 2. Executar Script Principal

1. Abra o arquivo `setup.sql`
2. Copie todo o conteúdo
3. Cole no SQL Editor do Supabase
4. Clique em **Run** para executar

**O que este script faz:**
- ✅ Cria extensões necessárias (UUID)
- ✅ Cria enums para status de cliente e tipos de KPI
- ✅ Cria tabelas `clients` e `kpi_entries`
- ✅ Cria índices para performance
- ✅ Configura triggers para `updated_at`
- ✅ Configura Row Level Security (RLS)
- ✅ Insere dados de exemplo para testes

### 3. Executar Script de Autenticação

1. Abra o arquivo `auth-setup.sql`
2. Copie todo o conteúdo
3. Cole no SQL Editor do Supabase
4. Clique em **Run** para executar

**O que este script faz:**
- ✅ Cria tabela de perfis de usuário
- ✅ Configura políticas de segurança
- ✅ Cria triggers para criação automática de perfis
- ✅ Cria funções utilitárias para autenticação

### 4. Obter Credenciais do Projeto

1. Vá para **Settings** > **API** no Supabase
2. Copie as seguintes informações:
   - **Project URL** (NEXT_PUBLIC_SUPABASE_URL)
   - **anon/public key** (NEXT_PUBLIC_SUPABASE_ANON_KEY)
   - **service_role key** (SUPABASE_SERVICE_ROLE_KEY)

### 5. Configurar Variáveis de Ambiente

Atualize o arquivo `.env` no projeto com as credenciais:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://seu-projeto.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="sua-chave-anonima"
SUPABASE_SERVICE_ROLE_KEY="sua-chave-de-servico"

# Database URL (mesmo que o Supabase URL mas com formato PostgreSQL)
DATABASE_URL="postgresql://postgres:[SUA-SENHA]@db.seu-projeto.supabase.co:5432/postgres"
```

### 6. Criar Primeiro Usuário

1. Vá para **Authentication** > **Users** no Supabase
2. Clique em **Add user**
3. Preencha email e senha
4. Clique em **Create user**

### 7. Configurar Usuário como Admin (Opcional)

Execute no SQL Editor:

```sql
UPDATE user_profiles 
SET role = 'admin', full_name = 'Administrador do Sistema'
WHERE email = 'seu-email@exemplo.com';
```

## 🔍 Verificações

### Verificar se as tabelas foram criadas:

```sql
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name IN ('clients', 'kpi_entries', 'user_profiles');
```

### Verificar dados de exemplo:

```sql
SELECT * FROM clients;
SELECT * FROM kpi_entries;
```

### Testar autenticação:

```sql
-- Deve retornar o UUID do usuário logado
SELECT auth.uid();

-- Verificar perfil do usuário
SELECT * FROM get_current_user_info();
```

## 📊 Estrutura das Tabelas

### Tabela `clients`
- `id` (UUID, PK)
- `name` (VARCHAR, UNIQUE)
- `status` (ENUM: 'ATIVO', 'INATIVO')
- `created_at`, `updated_at` (TIMESTAMP)

### Tabela `kpi_entries`
- `id` (UUID, PK)
- `date` (DATE)
- `kpi_type` (ENUM: 'RECEITA', 'ON_TIME', 'OCUPACAO', 'TERCEIRO', 'DISPONIBILIDADE')
- `kpi_value` (DECIMAL)
- `client_id` (UUID, FK)
- `created_at`, `updated_at` (TIMESTAMP)
- **UNIQUE**: (date, client_id, kpi_type)

### Tabela `user_profiles`
- `id` (UUID, PK, FK para auth.users)
- `email` (TEXT)
- `full_name` (TEXT)
- `role` (TEXT, default: 'operator')
- `created_at`, `updated_at` (TIMESTAMP)

## 🔒 Segurança

- **Row Level Security (RLS)** habilitado em todas as tabelas
- **Políticas de acesso** baseadas em autenticação
- **Triggers automáticos** para atualização de timestamps
- **Validação de dados** através de constraints

## 🛠️ Comandos Úteis

### Limpar dados de teste:
```sql
DELETE FROM kpi_entries;
DELETE FROM clients WHERE name LIKE 'Cliente %';
```

### Ver dados com relacionamentos:
```sql
SELECT 
    c.name as cliente,
    ke.date as data,
    ke.kpi_type as tipo_kpi,
    ke.kpi_value as valor
FROM kpi_entries ke
JOIN clients c ON ke.client_id = c.id
ORDER BY ke.date DESC, c.name;
```

## ❗ Troubleshooting

### Erro: "relation does not exist"
- Verifique se executou o `setup.sql` primeiro
- Confirme que está no schema `public`

### Erro: "permission denied"
- Verifique se RLS está configurado corretamente
- Confirme que o usuário está autenticado

### Erro: "function uuid_generate_v4() does not exist"
- Execute: `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs no Supabase Dashboard
2. Confirme que todos os scripts foram executados na ordem correta
3. Verifique se as variáveis de ambiente estão corretas