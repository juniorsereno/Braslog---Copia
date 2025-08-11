# Componentes de Gerenciamento de Clientes

Este módulo implementa o sistema completo de CRUD (Create, Read, Update, Delete) para clientes do Sistema de Análise Logística.

## Componentes

### ClientList
Componente principal que exibe a lista de clientes com funcionalidades de:
- ✅ Listagem paginada de clientes
- ✅ Busca com debouncing (300ms)
- ✅ Filtro por status (Ativo/Inativo)
- ✅ Estatísticas em tempo real
- ✅ Skeleton loaders durante carregamento
- ✅ Estados vazios informativos
- ✅ Ações de editar e excluir

### ClientModal
Modal para criação e edição de clientes com:
- ✅ Formulário com validação em tempo real
- ✅ Validação de nome único
- ✅ Estados de loading
- ✅ Tratamento de erros

### DeleteClientDialog
Dialog de confirmação para exclusão com:
- ✅ Verificação de dependências (KPIs associados)
- ✅ Mensagens informativas
- ✅ Confirmação explícita

## Otimizações de Performance

### 1. Debouncing de Busca
- **Hook**: `useDebounce` (300ms)
- **Benefício**: Reduz chamadas à API durante digitação
- **Implementação**: Busca só é executada após 300ms de inatividade

### 2. React.memo
- **Componentes**: Todos os componentes principais
- **Benefício**: Evita re-renders desnecessários
- **Critério**: Props não mudaram

### 3. Paginação
- **Tamanho da página**: 20 itens
- **Benefício**: Carregamento mais rápido com muitos clientes
- **Funcionalidades**: Navegação anterior/próxima, contador de páginas

### 4. Skeleton Loaders
- **Implementação**: Durante carregamento inicial
- **Benefício**: Melhor percepção de performance
- **Quantidade**: 5 linhas de skeleton

### 5. Índices de Banco de Dados
- **Campos indexados**: `name`, `status`, `created_at`
- **Benefício**: Queries mais rápidas
- **Localização**: `prisma/schema.prisma`

## Integração com tRPC

### Queries Utilizadas
- `client.getAll` - Lista clientes com filtros
- `client.getStats` - Estatísticas dos clientes
- `client.validateUniqueName` - Validação de nome único

### Mutations Utilizadas
- `client.create` - Criar novo cliente
- `client.update` - Atualizar cliente existente
- `client.delete` - Excluir cliente

### Tratamento de Erros
- **Hook**: `useErrorHandler` e `useMutationHandlers`
- **Feedback**: Toast notifications
- **Tipos**: Validação, conflitos, erros de servidor

## Validação de Dados

### Schema Zod
```typescript
const ClientFormSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(100, "Nome muito longo"),
  status: z.enum(["ATIVO", "INATIVO"]),
});
```

### Regras de Negócio
1. **Nome único**: Não pode haver dois clientes com o mesmo nome
2. **Nome obrigatório**: Campo não pode estar vazio
3. **Limite de caracteres**: Máximo 100 caracteres
4. **Status válido**: Apenas ATIVO ou INATIVO
5. **Exclusão protegida**: Clientes com KPIs não podem ser excluídos

## Estados da Interface

### Loading States
- Skeleton loaders na tabela
- Spinners nos botões durante ações
- Indicador de validação de nome

### Empty States
- Lista vazia com call-to-action
- Filtros sem resultados com mensagem explicativa

### Error States
- Toast notifications para erros
- Mensagens específicas por tipo de erro
- Fallback para erros não mapeados

## Acessibilidade

### Recursos Implementados
- **Navegação por teclado**: Todos os controles acessíveis
- **Screen readers**: Labels e descrições apropriadas
- **Contraste**: Cores seguem padrões de acessibilidade
- **Focus management**: Foco gerenciado em modals

### Componentes Base
- Utiliza Shadcn/ui que já implementa acessibilidade
- ARIA labels e roles apropriados
- Suporte a navegação por teclado

## Testes

### Cobertura Atual
- ✅ Validação de schemas Zod
- ✅ Lógica de negócio básica
- ✅ Tratamento de erros

### Testes Futuros
- [ ] Testes de integração com API
- [ ] Testes E2E com Playwright
- [ ] Testes de acessibilidade

## Métricas de Performance

### Targets Definidos
- **Carregamento inicial**: < 2 segundos
- **Busca com debounce**: 300ms delay
- **Paginação**: 20 itens por página
- **Validação de nome**: < 500ms

### Monitoramento
- Build size: ~25KB para página de clientes
- First Load JS: ~229KB total
- Lighthouse score: A ser medido

## Próximas Melhorias

### Performance
- [ ] Virtual scrolling para listas muito grandes
- [ ] Cache de queries com React Query
- [ ] Prefetch de dados relacionados

### UX/UI
- [ ] Bulk actions (seleção múltipla)
- [ ] Exportação de dados
- [ ] Filtros avançados
- [ ] Ordenação por colunas

### Funcionalidades
- [ ] Histórico de alterações
- [ ] Soft delete com recuperação
- [ ] Importação em lote
- [ ] Tags/categorias de clientes