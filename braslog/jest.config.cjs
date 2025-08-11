/** @type {import('jest').Config} */
module.exports = {
  // Ambiente de teste
  testEnvironment: 'node',
  
  // Arquivos de setup
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  
  // Padrões de arquivos de teste
  testMatch: [
    '<rootDir>/tests/**/*.test.{js,ts}',
    '<rootDir>/src/**/__tests__/**/*.{js,ts}',
    '<rootDir>/src/**/*.{test,spec}.{js,ts}'
  ],
  
  // Arquivos a serem ignorados
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/dist/',
    '<rootDir>/build/',
    '<rootDir>/coverage/'
  ],
  
  // Mapeamento de módulos (para resolver imports com ~/)
  moduleNameMapper: {
    '^~/env$': '<rootDir>/tests/mocks/env.js',
    '^superjson$': '<rootDir>/tests/mocks/superjson.ts',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^~/(.*)$': '<rootDir>/src/$1'
  },

  // Mock de env para Jest (evitar ESM do @t3-oss/env-nextjs)
  setupFiles: ['<rootDir>/tests/setup-env.js'],
  
  // Cobertura de código (desabilitada por enquanto)
  collectCoverage: false,
  
  // Limite de cobertura (para o futuro)
  // coverageThreshold: {
  //   global: {
  //     branches: 50,
  //     functions: 50,
  //     lines: 50,
  //     statements: 50
  //   }
  // },
  
  // Extensões de arquivo
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],

  // Transform para TypeScript
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.json' }],
  },

  // Ignorar transformação de node_modules
  transformIgnorePatterns: ['/node_modules/'],
  
  // Variáveis de ambiente para testes
  testEnvironmentOptions: {
    NODE_ENV: 'test'
  },
  
  // Timeout para testes
  testTimeout: 10000,
  
  // Verbose output
  verbose: true
};