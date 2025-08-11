# Scripts Docker - Sistema de Análise Logística

Este diretório contém scripts para facilitar o gerenciamento do ambiente Docker.

## Scripts Disponíveis

### 🔧 docker-build.sh
Constrói a imagem Docker de produção.

**Uso:**
```bash
# Linux/Mac
./scripts/docker-build.sh [tag]

# Windows (Git Bash ou WSL)
bash scripts/docker-build.sh [tag]

# PowerShell (alternativa)
docker build -t braslog:latest .
```

### 🚀 docker-dev.sh
Gerencia o ambiente de desenvolvimento.

**Comandos:**
```bash
# Iniciar ambiente de desenvolvimento
bash scripts/docker-dev.sh up

# Parar ambiente
bash scripts/docker-dev.sh down

# Ver logs
bash scripts/docker-dev.sh logs

# Reconstruir ambiente
bash scripts/docker-dev.sh rebuild
```

### 🏭 docker-prod.sh
Gerencia o ambiente de produção.

**Comandos:**
```bash
# Iniciar ambiente de produção
bash scripts/docker-prod.sh up

# Parar ambiente
bash scripts/docker-prod.sh down

# Ver logs
bash scripts/docker-prod.sh logs

# Reconstruir ambiente
bash scripts/docker-prod.sh rebuild

# Deploy completo
bash scripts/docker-prod.sh deploy
```

## Comandos Diretos (Windows PowerShell)

### Desenvolvimento
```powershell
# Iniciar desenvolvimento
docker-compose -f docker-compose.dev.yml up -d

# Parar desenvolvimento
docker-compose -f docker-compose.dev.yml down

# Ver logs
docker-compose -f docker-compose.dev.yml logs -f
```

### Produção
```powershell
# Build da imagem
docker build -t braslog:latest .

# Iniciar produção (sem nginx)
docker-compose up -d app

# Iniciar produção completa (com nginx)
docker-compose --profile production up -d

# Parar produção
docker-compose down
```

## Pré-requisitos

1. **Docker** instalado
2. **Docker Compose** instalado
3. **Arquivo .env** configurado (copie de .env.example)

## Variáveis de Ambiente Necessárias

Certifique-se de que o arquivo `.env` contém:

```env
DATABASE_URL="sua-url-do-banco"
NEXT_PUBLIC_SUPABASE_URL="sua-url-supabase"
NEXT_PUBLIC_SUPABASE_ANON_KEY="sua-chave-anonima"
SUPABASE_SERVICE_ROLE_KEY="sua-chave-service-role"
```

## Troubleshooting

### Problema: Porta 3000 já em uso
```bash
# Verificar o que está usando a porta
netstat -ano | findstr :3000

# Parar todos os containers
docker-compose down
```

### Problema: Erro de build
```bash
# Limpar cache do Docker
docker system prune -a

# Rebuild sem cache
docker-compose build --no-cache
```

### Problema: Banco de dados não conecta
1. Verifique se a `DATABASE_URL` está correta no `.env`
2. Certifique-se de que o banco Supabase está acessível
3. Execute `npx prisma db push` para sincronizar o schema