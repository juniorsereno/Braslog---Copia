-- =====================================================
-- SISTEMA DE ANÁLISE LOGÍSTICA - SETUP DO BANCO DE DADOS
-- =====================================================
-- Este arquivo contém todos os comandos SQL necessários para
-- configurar o banco de dados no Supabase
-- =====================================================

-- 1. CRIAR EXTENSÕES NECESSÁRIAS
-- =====================================================

-- Extensão para UUIDs (geralmente já está habilitada no Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. CRIAR ENUMS
-- =====================================================

-- Enum para status do cliente
CREATE TYPE client_status AS ENUM ('ATIVO', 'INATIVO');

-- Enum para tipos de KPI
CREATE TYPE kpi_type AS ENUM (
    'RECEITA',
    'ON_TIME', 
    'OCUPACAO',
    'TERCEIRO',
    'DISPONIBILIDADE'
);

-- 3. CRIAR TABELAS
-- =====================================================

-- Tabela de Clientes
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    status client_status NOT NULL DEFAULT 'ATIVO',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Entradas de KPI
CREATE TABLE kpi_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    kpi_type kpi_type NOT NULL,
    kpi_value DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    
    -- Constraint para evitar duplicatas (mesmo cliente, data e tipo de KPI)
    UNIQUE(date, client_id, kpi_type)
);

-- 4. CRIAR ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índice para busca por nome de cliente
CREATE INDEX idx_clients_name ON clients(name);

-- Índice para busca por status de cliente
CREATE INDEX idx_clients_status ON clients(status);

-- Índice para busca por data nas entradas de KPI
CREATE INDEX idx_kpi_entries_date ON kpi_entries(date);

-- Índice para busca por cliente nas entradas de KPI
CREATE INDEX idx_kpi_entries_client_id ON kpi_entries(client_id);

-- Índice para busca por tipo de KPI
CREATE INDEX idx_kpi_entries_kpi_type ON kpi_entries(kpi_type);

-- Índice composto para busca por data e cliente (consulta mais comum)
CREATE INDEX idx_kpi_entries_date_client ON kpi_entries(date, client_id);

-- 5. CRIAR TRIGGERS PARA UPDATED_AT
-- =====================================================

-- Função para atualizar o campo updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para tabela clients
CREATE TRIGGER update_clients_updated_at 
    BEFORE UPDATE ON clients 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para tabela kpi_entries
CREATE TRIGGER update_kpi_entries_updated_at 
    BEFORE UPDATE ON kpi_entries 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 6. CONFIGURAR ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS nas tabelas
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpi_entries ENABLE ROW LEVEL SECURITY;

-- Política para permitir todas as operações para usuários autenticados
-- (Para o MVP, todos os usuários autenticados têm acesso total)
CREATE POLICY "Usuários autenticados podem acessar clientes" 
    ON clients FOR ALL 
    TO authenticated 
    USING (true) 
    WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem acessar KPIs" 
    ON kpi_entries FOR ALL 
    TO authenticated 
    USING (true) 
    WITH CHECK (true);

-- 7. INSERIR DADOS DE EXEMPLO (OPCIONAL)
-- =====================================================

-- Inserir alguns clientes de exemplo para testes
INSERT INTO clients (name, status) VALUES 
    ('Cliente A', 'ATIVO'),
    ('Cliente B', 'ATIVO'),
    ('Cliente C', 'INATIVO'),
    ('Transportadora XYZ', 'ATIVO'),
    ('Logística ABC', 'ATIVO');

-- Inserir alguns dados de KPI de exemplo
INSERT INTO kpi_entries (date, client_id, kpi_type, kpi_value) VALUES 
    (CURRENT_DATE, (SELECT id FROM clients WHERE name = 'Cliente A'), 'RECEITA', 15000.50),
    (CURRENT_DATE, (SELECT id FROM clients WHERE name = 'Cliente A'), 'ON_TIME', 95.5),
    (CURRENT_DATE, (SELECT id FROM clients WHERE name = 'Cliente A'), 'OCUPACAO', 87.2),
    (CURRENT_DATE, (SELECT id FROM clients WHERE name = 'Cliente B'), 'RECEITA', 8500.00),
    (CURRENT_DATE, (SELECT id FROM clients WHERE name = 'Cliente B'), 'ON_TIME', 92.1),
    (CURRENT_DATE - INTERVAL '1 day', (SELECT id FROM clients WHERE name = 'Cliente A'), 'RECEITA', 14200.75);

-- 8. VERIFICAÇÕES FINAIS
-- =====================================================

-- Verificar se as tabelas foram criadas corretamente
SELECT 
    table_name, 
    table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name IN ('clients', 'kpi_entries');

-- Verificar se os enums foram criados
SELECT 
    typname as enum_name,
    array_agg(enumlabel ORDER BY enumsortorder) as enum_values
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE typname IN ('client_status', 'kpi_type')
GROUP BY typname;

-- Verificar se os índices foram criados
SELECT 
    indexname, 
    tablename, 
    indexdef 
FROM pg_indexes 
WHERE tablename IN ('clients', 'kpi_entries') 
    AND schemaname = 'public';

-- =====================================================
-- FIM DO SETUP
-- =====================================================

-- COMANDOS ÚTEIS PARA DESENVOLVIMENTO:

-- Limpar dados de teste (cuidado em produção!)
-- DELETE FROM kpi_entries;
-- DELETE FROM clients;

-- Resetar sequências (se necessário)
-- ALTER SEQUENCE clients_id_seq RESTART WITH 1;
-- ALTER SEQUENCE kpi_entries_id_seq RESTART WITH 1;

-- Verificar dados inseridos
-- SELECT * FROM clients;
-- SELECT * FROM kpi_entries;

-- Consulta para ver KPIs por data e cliente
-- SELECT 
--     c.name as cliente,
--     ke.date as data,
--     ke.kpi_type as tipo_kpi,
--     ke.kpi_value as valor
-- FROM kpi_entries ke
-- JOIN clients c ON ke.client_id = c.id
-- ORDER BY ke.date DESC, c.name, ke.kpi_type;