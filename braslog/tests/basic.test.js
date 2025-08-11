/**
 * Testes básicos para verificar integridade da aplicação
 * Estes testes verificam se os arquivos essenciais existem e estão corretos
 */

const fs = require('fs');
const path = require('path');

describe('🏗️ Application Structure', () => {
  test('should have essential Next.js files', () => {
    // Verificar se arquivos essenciais do Next.js existem
    const essentialFiles = [
      'next.config.js',
      'package.json',
      'tsconfig.json',
    ];

    essentialFiles.forEach(file => {
      expect(fs.existsSync(path.join(process.cwd(), file))).toBe(true);
    });
  });

  test('should have correct app directory structure', () => {
    // Verificar estrutura do diretório src/app
    const appStructure = [
      'src/app/layout.tsx',
      'src/app/page.tsx',
    ];

    appStructure.forEach(file => {
      expect(fs.existsSync(path.join(process.cwd(), file))).toBe(true);
    });
  });

  test('should have Prisma configuration', () => {
    // Verificar se Prisma está configurado
    expect(fs.existsSync(path.join(process.cwd(), 'prisma/schema.prisma'))).toBe(true);
  });

  test('should have tRPC configuration', () => {
    // Verificar se tRPC está configurado
    const trpcFiles = [
      'src/server/api/root.ts',
      'src/trpc/server.ts',
      'src/trpc/react.tsx',
    ];

    trpcFiles.forEach(file => {
      expect(fs.existsSync(path.join(process.cwd(), file))).toBe(true);
    });
  });
});

describe('📦 Package Configuration', () => {
  test('should have correct package.json structure', () => {
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8')
    );

    // Verificar se tem scripts essenciais
    expect(packageJson.scripts).toHaveProperty('dev');
    expect(packageJson.scripts).toHaveProperty('build');
    expect(packageJson.scripts).toHaveProperty('start');
    expect(packageJson.scripts).toHaveProperty('lint');

    // Verificar dependências essenciais
    expect(packageJson.dependencies).toHaveProperty('next');
    expect(packageJson.dependencies).toHaveProperty('react');
    expect(packageJson.dependencies).toHaveProperty('@trpc/server');
    expect(packageJson.dependencies).toHaveProperty('@prisma/client');
  });

  test('should have TypeScript configuration', () => {
    // Verificar se o arquivo tsconfig.json existe
    expect(fs.existsSync(path.join(process.cwd(), 'tsconfig.json'))).toBe(true);
    
    // Ler o conteúdo do arquivo
    const tsConfigContent = fs.readFileSync(path.join(process.cwd(), 'tsconfig.json'), 'utf8');
    
    // Verificar se contém configurações essenciais (sem fazer parse do JSON com comentários)
    expect(tsConfigContent).toContain('compilerOptions');
    expect(tsConfigContent).toContain('strict');
  });
});

describe('🔧 Environment Configuration', () => {
  test('should have environment example file', () => {
    expect(fs.existsSync(path.join(process.cwd(), '.env.example'))).toBe(true);
  });

  test('should have environment validation', () => {
    expect(fs.existsSync(path.join(process.cwd(), 'src/env.js'))).toBe(true);
  });
});

describe('🎨 Styling Configuration', () => {
  test('should have global styles', () => {
    expect(fs.existsSync(path.join(process.cwd(), 'src/styles/globals.css'))).toBe(true);
  });

  test('should have PostCSS configuration', () => {
    expect(fs.existsSync(path.join(process.cwd(), 'postcss.config.js'))).toBe(true);
  });
});