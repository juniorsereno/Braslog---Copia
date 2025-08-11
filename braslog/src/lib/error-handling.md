# Sistema de Tratamento de Erros

Este documento explica como usar o sistema de tratamento de erros implementado na aplicação.

## Componentes Implementados

### 1. Toaster (Sonner)
- **Localização**: Configurado no `layout.tsx`
- **Função**: Exibe notificações toast para feedback ao usuário
- **Uso**: Automático através dos hooks

### 2. Hook useErrorHandler
- **Localização**: `~/hooks/use-error-handler.ts`
- **Função**: Fornece funções padronizadas para tratamento de erros
- **Métodos disponíveis**:
  - `handleError(error, customMessage?)`: Trata erros e exibe toast
  - `handleSuccess(message)`: Exibe toast de sucesso
  - `handleInfo(message)`: Exibe toast informativo
  - `handleWarning(message)`: Exibe toast de aviso

### 3. Hook useMutationHandlers
- **Localização**: `~/hooks/use-error-handler.ts`
- **Função**: Fornece callbacks padronizados para mutações tRPC
- **Uso**: Simplifica o tratamento de sucesso/erro em mutações

### 4. ErrorBoundary
- **Localização**: `~/components/error-boundary.tsx`
- **Função**: Captura erros React e exibe interface de fallback
- **Configuração**: Já integrado no layout principal

## Exemplos de Uso

### Tratamento de Erros em Queries
```typescript
import { useErrorHandler } from "~/hooks/use-error-handler";
import { useEffect } from "react";

export function MyComponent() {
  const { handleError } = useErrorHandler();
  const { data, error, isLoading } = api.myRouter.myQuery.useQuery();

  useEffect(() => {
    if (error) {
      handleError(error, "Erro ao carregar dados");
    }
  }, [error, handleError]);

  // resto do componente...
}
```

### Tratamento de Erros em Mutações
```typescript
import { useMutationHandlers } from "~/hooks/use-error-handler";

export function MyComponent() {
  const { createMutationHandlers } = useMutationHandlers();
  
  const createMutation = api.myRouter.create.useMutation({
    ...createMutationHandlers(
      "Item criado com sucesso!",
      "Erro ao criar item"
    ),
    onSuccess: (data) => {
      // Lógica adicional após sucesso
      // O toast já será exibido automaticamente
    }
  });

  const handleSubmit = (formData) => {
    createMutation.mutate(formData);
  };

  // resto do componente...
}
```

### Tratamento Manual de Erros
```typescript
import { useErrorHandler } from "~/hooks/use-error-handler";

export function MyComponent() {
  const { handleError, handleSuccess } = useErrorHandler();

  const handleCustomAction = async () => {
    try {
      // alguma operação
      const result = await someAsyncOperation();
      handleSuccess("Operação realizada com sucesso!");
    } catch (error) {
      handleError(error, "Erro na operação personalizada");
    }
  };

  // resto do componente...
}
```

### Usando Error Boundary Personalizado
```typescript
import { ErrorBoundary } from "~/components/error-boundary";

export function MyPage() {
  return (
    <ErrorBoundary>
      <ComponenteThatMightThrow />
    </ErrorBoundary>
  );
}
```

## Tipos de Erro Mapeados

O sistema mapeia automaticamente os seguintes códigos de erro:

- **UNAUTHORIZED**: "Você não tem permissão para realizar esta ação"
- **NOT_FOUND**: "Registro não encontrado"
- **CONFLICT**: "Este registro já existe ou há um conflito de dados"
- **BAD_REQUEST**: "Dados inválidos. Verifique as informações e tente novamente"

## Configuração de Desenvolvimento vs Produção

- **Desenvolvimento**: Erros detalhados são exibidos no console e na UI
- **Produção**: Mensagens amigáveis são exibidas, erros são logados para monitoramento

## Próximos Passos

Para melhorar ainda mais o sistema de tratamento de erros:

1. **Integração com Sentry**: Para monitoramento de erros em produção
2. **Retry Logic**: Para operações que podem ser repetidas automaticamente
3. **Offline Handling**: Para tratar cenários de perda de conexão
4. **Error Analytics**: Para coletar métricas sobre tipos de erro mais comuns