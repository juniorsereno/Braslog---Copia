-- =====================================================
-- OBTER DATABASE_URL PARA CONFIGURAÇÃO
-- =====================================================
-- Execute este comando no SQL Editor do Supabase para
-- obter a URL de conexão correta para o Prisma
-- =====================================================

-- Este comando mostra informações sobre a conexão atual
SELECT 
    current_database() as database_name,
    current_user as current_user,
    inet_server_addr() as server_ip,
    inet_server_port() as server_port;

-- =====================================================
-- INSTRUÇÕES PARA OBTER A DATABASE_URL
-- =====================================================

/*
Para obter a DATABASE_URL correta:

1. Vá para Settings > Database no seu projeto Supabase
2. Na seção "Connection string", copie a URI
3. Ela terá o formato:
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres

4. Substitua [YOUR-PASSWORD] pela senha do seu projeto
5. Use esta URL no arquivo .env como DATABASE_URL

Exemplo:
DATABASE_URL="postgresql://postgres:suasenha123@db.abcdefgh.supabase.co:5432/postgres"

IMPORTANTE:
- A senha é a que você definiu quando criou o projeto Supabase
- NÃO é a senha do seu usuário de login do Supabase
- É a senha específica do banco de dados PostgreSQL
*/

-- =====================================================
-- TESTAR CONEXÃO
-- =====================================================

-- Se este comando funcionar, sua conexão está OK
SELECT 'Conexão com banco de dados funcionando!' as status;

-- Verificar versão do PostgreSQL
SELECT version();

-- Verificar extensões instaladas
SELECT extname as extension_name 
FROM pg_extension 
ORDER BY extname;