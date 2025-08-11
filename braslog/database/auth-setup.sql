-- =====================================================
-- CONFIGURAÇÃO DE AUTENTICAÇÃO - SUPABASE
-- =====================================================
-- Este arquivo contém comandos específicos para configurar
-- a autenticação no Supabase
-- =====================================================

-- 1. CONFIGURAR POLÍTICAS DE AUTENTICAÇÃO
-- =====================================================

-- Verificar se a autenticação está funcionando
-- (Este comando deve retornar o UUID do usuário logado)
SELECT auth.uid();

-- 2. CRIAR TABELA DE PERFIS DE USUÁRIO (OPCIONAL)
-- =====================================================
-- Esta tabela pode ser usada para armazenar informações
-- adicionais dos usuários além do que o Supabase Auth já fornece

CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    role TEXT DEFAULT 'operator',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS na tabela de perfis
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Política para que usuários só vejam seu próprio perfil
CREATE POLICY "Usuários podem ver apenas seu próprio perfil" 
    ON user_profiles FOR SELECT 
    TO authenticated 
    USING (auth.uid() = id);

-- Política para que usuários possam atualizar apenas seu próprio perfil
CREATE POLICY "Usuários podem atualizar apenas seu próprio perfil" 
    ON user_profiles FOR UPDATE 
    TO authenticated 
    USING (auth.uid() = id) 
    WITH CHECK (auth.uid() = id);

-- 3. TRIGGER PARA CRIAR PERFIL AUTOMATICAMENTE
-- =====================================================

-- Função para criar perfil quando um novo usuário se registra
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para executar a função quando um usuário é criado
CREATE TRIGGER create_user_profile_trigger
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_user_profile();

-- 4. FUNÇÕES ÚTEIS PARA AUTENTICAÇÃO
-- =====================================================

-- Função para verificar se o usuário atual é um operador
CREATE OR REPLACE FUNCTION is_operator()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = auth.uid() 
        AND role IN ('operator', 'admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para obter informações do usuário atual
CREATE OR REPLACE FUNCTION get_current_user_info()
RETURNS TABLE (
    user_id UUID,
    email TEXT,
    full_name TEXT,
    role TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        up.id,
        up.email,
        up.full_name,
        up.role
    FROM user_profiles up
    WHERE up.id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. ATUALIZAR POLÍTICAS DAS TABELAS PRINCIPAIS
-- =====================================================

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Usuários autenticados podem acessar clientes" ON clients;
DROP POLICY IF EXISTS "Usuários autenticados podem acessar KPIs" ON kpi_entries;

-- Criar políticas mais específicas baseadas no papel do usuário
CREATE POLICY "Operadores podem acessar clientes" 
    ON clients FOR ALL 
    TO authenticated 
    USING (is_operator()) 
    WITH CHECK (is_operator());

CREATE POLICY "Operadores podem acessar KPIs" 
    ON kpi_entries FOR ALL 
    TO authenticated 
    USING (is_operator()) 
    WITH CHECK (is_operator());

-- 6. INSERIR USUÁRIO ADMINISTRADOR INICIAL (MANUAL)
-- =====================================================
-- ATENÇÃO: Este comando deve ser executado APÓS criar o primeiro usuário
-- através da interface do Supabase ou da aplicação

-- Exemplo de como atualizar um usuário para admin:
-- UPDATE user_profiles 
-- SET role = 'admin', full_name = 'Administrador do Sistema'
-- WHERE email = 'admin@empresa.com';

-- 7. VERIFICAÇÕES DE SEGURANÇA
-- =====================================================

-- Verificar se RLS está habilitado em todas as tabelas
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('clients', 'kpi_entries', 'user_profiles');

-- Verificar políticas criadas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public';

-- =====================================================
-- COMANDOS PARA TESTES DE AUTENTICAÇÃO
-- =====================================================

-- Testar se o usuário atual tem acesso
-- SELECT * FROM clients LIMIT 1;
-- SELECT * FROM kpi_entries LIMIT 1;

-- Verificar informações do usuário atual
-- SELECT * FROM get_current_user_info();

-- Verificar se é operador
-- SELECT is_operator();

-- =====================================================
-- NOTAS IMPORTANTES
-- =====================================================

/*
1. Execute primeiro o setup.sql para criar as tabelas básicas
2. Execute este arquivo auth-setup.sql para configurar autenticação
3. Crie o primeiro usuário através da interface do Supabase
4. Atualize o papel do primeiro usuário para 'admin' se necessário
5. Teste o login na aplicação

Para criar usuários de teste via SQL (apenas em desenvolvimento):
- Não é recomendado criar usuários diretamente no banco
- Use sempre a API do Supabase Auth ou a interface web
- Os usuários criados via API terão seus perfis criados automaticamente
*/