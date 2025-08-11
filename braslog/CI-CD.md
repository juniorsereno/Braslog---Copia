# 🧪 CI/CD - Sistema de Análise Logística

Este documento explica como funciona o sistema de **Integração Contínua (CI)** do projeto.

## 🎯 O que é testado automaticamente?

Toda vez que você fizer `git push` para as branches `main` ou `develop`, o GitHub Actions executará automaticamente:

### 1. 📝 Qualidade de Código
- **Formatação**: Verifica se o código está bem formatado (Prettier)
- **Linting**: Verifica regras de código (ESLint)
- **TypeScript**: Verifica se não há erros de tipagem

### 2. 🏗️ Build da Aplicação
- **Prisma**: Gera o cliente do banco de dados
- **Next.js**: Tenta construir a aplicação completa
- **Verificação**: Confirma se os arquivos foram gerados corretamente

### 3. 🧪 Testes Básicos
- **Estrutura**: Verifica se arquivos essenciais existem
- **Configuração**: Testa se as configurações estão corretas
- **Dependências**: Confirma se todas as dependências estão instaladas

### 4. 🔒 Auditoria de Segurança
- **Vulnerabilidades**: Verifica se há dependências com problemas de segurança
- **Relatório**: Gera relatório de segurança

## 🚀 Como usar no dia a dia

### Fluxo Normal de Desenvolvimento

1. **Desenvolva localmente**:
   ```bash
   npm run dev
   ```

2. **Teste localmente** (opcional):
   ```bash
   npm run ci:check  # Roda todos os testes localmente
   ```

3. **Commit e push**:
   ```bash
   git add .
   git commit -m "Sua mensagem"
   git push
   ```

4. **Aguarde os resultados**:
   - Vá para o GitHub → Actions
   - Veja o status dos testes
   - ✅ Verde = Tudo OK
   - ❌ Vermelho = Algo deu errado

### Se os testes falharem

1. **Veja os logs no GitHub Actions**
2. **Corrija os problemas localmente**
3. **Teste localmente**:
   ```bash
   npm run lint        # Verificar linting
   npm run typecheck   # Verificar TypeScript
   npm run test        # Executar testes
   ```
4. **Faça novo commit e push**

## 📊 Status dos Testes

Você pode ver o status dos testes:

### No GitHub
- Vá para seu repositório
- Clique na aba **"Actions"**
- Veja o histórico de execuções

### No README (Badge)
Adicione este badge ao seu README.md:
```markdown
![CI Status](https://github.com/SEU-USUARIO/SEU-REPO/workflows/🧪%20Continuous%20Integration/badge.svg)
```

## 🛠️ Comandos Locais

### Executar todos os testes localmente
```bash
npm run ci:check
```

### Executar testes individuais
```bash
npm run lint           # ESLint
npm run typecheck      # TypeScript
npm run format:check   # Prettier
npm run test           # Jest
npm run build          # Next.js build
```

### Corrigir problemas automaticamente
```bash
npm run lint:fix       # Corrigir problemas de linting
npm run format:write   # Corrigir formatação
```

## 📁 Estrutura de Arquivos

```
braslog/
├── .github/
│   └── workflows/
│       └── ci.yml          # ← Configuração do GitHub Actions
├── tests/
│   ├── setup.js            # ← Configuração dos testes
│   └── basic.test.js       # ← Testes básicos
├── jest.config.js          # ← Configuração do Jest
└── CI-CD.md               # ← Este arquivo
```

## 🔧 Configuração Avançada

### Modificar os testes

Para adicionar novos testes, edite:
- `tests/basic.test.js` - Testes básicos
- Crie novos arquivos `*.test.js` na pasta `tests/`

### Modificar o pipeline

Para alterar o que é testado, edite:
- `.github/workflows/ci.yml`

### Desabilitar temporariamente

Para pular os testes em um commit específico:
```bash
git commit -m "Sua mensagem [skip ci]"
```

## 📈 Métricas e Relatórios

### Cobertura de Código
```bash
npm run test:ci  # Gera relatório de cobertura
```

### Auditoria de Segurança
```bash
npm audit        # Verifica vulnerabilidades
npm audit fix    # Corrige automaticamente (quando possível)
```

## 🚨 Troubleshooting

### Problema: "Tests failed"
**Solução**: Veja os logs no GitHub Actions e corrija os erros indicados.

### Problema: "Build failed"
**Solução**: 
1. Teste localmente: `npm run build`
2. Verifique se todas as variáveis de ambiente estão configuradas
3. Corrija os erros e faça novo push

### Problema: "Linting errors"
**Solução**:
```bash
npm run lint:fix    # Corrige automaticamente
npm run format:write # Corrige formatação
```

### Problema: "TypeScript errors"
**Solução**:
```bash
npm run typecheck   # Vê os erros
# Corrija os erros de tipagem manualmente
```

## 💡 Dicas

1. **Execute testes localmente** antes de fazer push
2. **Use commits pequenos** para facilitar a identificação de problemas
3. **Leia os logs** quando algo der errado
4. **Mantenha dependências atualizadas** para evitar problemas de segurança

## 🎯 Benefícios

- ✅ **Qualidade garantida**: Código sempre testado
- ✅ **Menos bugs**: Problemas detectados cedo
- ✅ **Padronização**: Código sempre formatado igual
- ✅ **Segurança**: Vulnerabilidades detectadas automaticamente
- ✅ **Confiança**: Você sabe que o código funciona antes de usar

## 📞 Suporte

Se tiver problemas com o CI/CD:
1. Verifique os logs no GitHub Actions
2. Teste localmente com `npm run ci:check`
3. Consulte este documento
4. Procure ajuda se necessário

---

**Lembre-se**: O CI/CD está aqui para **ajudar**, não atrapalhar. Ele garante que seu código esteja sempre funcionando! 🎉