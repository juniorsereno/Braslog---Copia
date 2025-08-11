/**
 * Configuração básica para testes
 * Este arquivo será usado quando implementarmos testes mais avançados
 */

// Configurações globais para testes
global.console = {
  ...console,
  // Silenciar logs durante testes se necessário
  log: process.env.NODE_ENV === 'test' ? jest.fn() : console.log,
  debug: process.env.NODE_ENV === 'test' ? jest.fn() : console.debug,
  info: process.env.NODE_ENV === 'test' ? jest.fn() : console.info,
  warn: console.warn,
  error: console.error,
};

// Mock de variáveis de ambiente para testes
Object.assign(process.env, {
  NODE_ENV: 'test',
  SKIP_ENV_VALIDATION: 'true',
  DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
  NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-key',
  SUPABASE_SERVICE_ROLE_KEY: 'test-service-key'
});