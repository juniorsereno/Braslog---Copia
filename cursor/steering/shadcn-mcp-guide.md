# Guia MCP shadcn/ui

Este documento ensina como usar eficientemente o MCP do shadcn/ui para encontrar e implementar componentes.

## Fluxo de Trabalho Recomendado

### 1. Escolher Componente
- **Consulte a lista completa abaixo** para encontrar o componente adequado
- **Use o mapeamento por caso de uso** para orientação rápida

### 2. Obter Detalhes
```
Use: mcp_shadcn_ui_server_get_component_details
Parâmetro: componentName (nome exato da lista)
```

### 3. Ver Exemplos Práticos
```
Use: mcp_shadcn_ui_server_get_component_examples
Parâmetro: componentName (mesmo nome usado acima)
```

**Os exemplos incluem:**
- Comandos de instalação (pnpm/npm)
- Importações corretas
- Variações (variants, sizes, states)
- Casos específicos (loading, disabled, with icons)
- Integração com react-hook-form, zod

## Estratégias de Busca

### Componentes Não Existem Diretamente
- shadcn/ui não tem componentes como "login", "dashboard", "navbar"
- Estes são composições de componentes básicos

### Mapeamento de Necessidades → Componentes

**Para Login/Autenticação:**
- `form` - Wrapper do formulário
- `input` - Campos de email/senha
- `button` - Botão de submit
- `card` - Container
- `label` - Rótulos dos campos
- `alert` - Mensagens de erro

**Para Navegação:**
- `navigation-menu` - Menu principal
- `breadcrumb` - Navegação hierárquica
- `sidebar` - Menu lateral
- `menubar` - Barra de menu

**Para Dados:**
- `table` - Tabelas simples
- `data-table` - Tabelas com funcionalidades
- `chart` - Gráficos
- `card` - Containers de conteúdo

**Para Feedback:**
- `toast` - Notificações temporárias
- `alert` - Alertas persistentes
- `dialog` - Modais
- `sheet` - Painéis laterais

## Dicas Importantes

1. **Use a lista abaixo**: Todos os componentes disponíveis estão listados - não precisa usar MCP para descobrir
2. **Nomes exatos**: Use os nomes exatos da lista no `get_component_details`
3. **Combine componentes**: shadcn/ui é sobre composição, não componentes monolíticos
4. **Sempre veja exemplos**: Use `get_component_examples` para implementações práticas
5. **Exemplos são completos**: Incluem instalação, importação e todas as variações
6. **Foque nas variações**: Cada componente tem múltiplas variantes (outline, ghost, destructive, etc.)
7. **Use `search_components` apenas**: Para confirmar se um componente específico existe quando em dúvida

## Interpretando os Exemplos

### Tipos de Exemplos Retornados:
- **Instalação**: Comandos para adicionar o componente
- **Importação**: Como importar corretamente
- **Uso básico**: Implementação simples
- **Variantes**: Diferentes estilos (variant, size, etc.)
- **Estados**: Loading, disabled, active
- **Composição**: Combinação com outros componentes
- **Integração**: Com bibliotecas como react-hook-form, zod

### Exemplo de Interpretação:
```typescript
// Exemplo básico
<Button>Button</Button>

// Variantes disponíveis
<Button variant="outline">Outline</Button>
<Button variant="destructive">Destructive</Button>
<Button variant="ghost">Ghost</Button>

// Com ícones
<Button variant="outline" size="sm">
  <IconGitBranch /> New Branch
</Button>

// Estado loading
<Button size="sm" disabled>
  <Loader2Icon className="animate-spin" />
  Please wait
</Button>
```



## Lista Completa de Componentes Disponíveis

### Formulários e Inputs
- `button` - Botões com múltiplas variantes
- `input` - Campos de texto básicos
- `textarea` - Campos de texto multilinha
- `label` - Rótulos para campos
- `form` - Wrapper de formulário com validação
- `checkbox` - Caixas de seleção
- `radio-group` - Grupos de botões radio
- `select` - Dropdowns de seleção
- `combobox` - Select com busca
- `switch` - Interruptores toggle
- `slider` - Controles deslizantes
- `input-otp` - Campos para códigos OTP

### Layout e Containers
- `card` - Containers de conteúdo
- `sheet` - Painéis laterais deslizantes
- `dialog` - Modais e diálogos
- `drawer` - Gavetas deslizantes
- `popover` - Pop-ups posicionados
- `hover-card` - Cards que aparecem no hover
- `tabs` - Abas de navegação
- `accordion` - Painéis expansíveis
- `collapsible` - Conteúdo recolhível
- `separator` - Divisores visuais
- `aspect-ratio` - Controle de proporção
- `scroll-area` - Áreas com scroll customizado
- `resizable` - Painéis redimensionáveis

### Navegação
- `navigation-menu` - Menus de navegação
- `breadcrumb` - Navegação hierárquica
- `sidebar` - Barras laterais
- `menubar` - Barras de menu
- `dropdown-menu` - Menus dropdown
- `context-menu` - Menus de contexto
- `command` - Paleta de comandos
- `pagination` - Controles de paginação

### Exibição de Dados
- `table` - Tabelas básicas
- `data-table` - Tabelas com funcionalidades avançadas
- `chart` - Componentes de gráficos
- `badge` - Etiquetas e badges
- `avatar` - Avatares de usuário
- `typography` - Estilos tipográficos

### Feedback e Status
- `alert` - Alertas informativos
- `alert-dialog` - Diálogos de confirmação
- `toast` - Notificações temporárias
- `sonner` - Sistema de toast avançado
- `progress` - Barras de progresso
- `skeleton` - Placeholders de carregamento
- `tooltip` - Dicas contextuais

### Interação
- `toggle` - Botões de alternância
- `toggle-group` - Grupos de toggles
- `calendar` - Seletores de data
- `date-picker` - Campos de data
- `carousel` - Carrosséis de conteúdo

**Total: 50 componentes únicos disponíveis**

### Componentes por Caso de Uso

**Dashboard/Admin:**
`sidebar`, `navigation-menu`, `data-table`, `chart`, `card`, `badge`, `avatar`

**Formulários:**
`form`, `input`, `textarea`, `select`, `checkbox`, `radio-group`, `button`, `label`

**E-commerce:**
`card`, `badge`, `button`, `carousel`, `dialog`, `toast`, `pagination`

**Aplicações de Conteúdo:**
`typography`, `separator`, `tabs`, `accordion`, `breadcrumb`, `scroll-area`