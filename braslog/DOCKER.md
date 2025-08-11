# 🐳 Docker - Sistema de Análise Logística

Este documento descreve como usar Docker para executar o Sistema de Análise Logística em diferentes ambientes.

## 📋 Pré-requisitos

- [Docker](https://docs.docker.com/get-docker/) instalado
- [Docker Compose](https://docs.docker.com/compose/install/) instalado
- Arquivo `.env` configurado (copie de `.env.example` ou `.env.docker`)

## 🚀 Início Rápido

### 1. Configurar Variáveis de Ambiente

```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar com suas configurações
# Certifique-se de configurar:
# - DATABASE_URL (Supabase)
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
# - SUPABASE_SERVICE_ROLE_KEY
```

### 2. Executar em Desenvolvimento

```bash
# Usando npm scripts
npm run docker:dev

# Ou diretamente com docker-compose
docker-compose -f docker-compose.dev.yml up -d

# Acessar aplicação
# http://localhost:3000
```

### 3. Executar em Produção

```bash
# Build da imagem
npm run docker:build

# Iniciar ambiente de produção
npm run docker:prod

# Acessar aplicação
# http://localhost:3000 (aplicação)
# http://localhost:80 (nginx)
```

## 🏗️ Arquitetura Docker

### Imagens

- **Produção**: Multi-stage build otimizada com Node.js Alpine
- **Desenvolvimento**: Imagem com hot reload e volume mounting

### Serviços

- **app**: Aplicação Next.js principal
- **nginx**: Reverse proxy para produção (opcional)
- **postgres-dev**: Banco PostgreSQL local para desenvolvimento (opcional)

## 📁 Estrutura de Arquivos

```
braslog/
├── Dockerfile              # Build de produção
├── Dockerfile.dev          # Build de desenvolvimento
├── docker-compose.yml      # Orquestração produção
├── docker-compose.dev.yml  # Orquestração desenvolvimento
├── .dockerignore           # Arquivos ignorados no build
├── .env.docker             # Template de variáveis
├── nginx/
│   └── nginx.conf          # Configuração Nginx
└── scripts/
    ├── docker-build.sh     # Script de build
    ├── docker-dev.sh       # Script desenvolvimento
    └── docker-prod.sh      # Script produção
```

## 🛠️ Comandos Úteis

### Desenvolvimento

```bash
# Iniciar ambiente
docker-compose -f docker-compose.dev.yml up -d

# Ver logs
docker-compose -f docker-compose.dev.yml logs -f

# Parar ambiente
docker-compose -f docker-compose.dev.yml down

# Reconstruir
docker-compose -f docker-compose.dev.yml build --no-cache
```

### Produção

```bash
# Build da imagem
docker build -t braslog:latest .

# Iniciar com nginx
docker-compose --profile production up -d

# Iniciar apenas aplicação
docker-compose up -d app

# Ver logs
docker-compose logs -f

# Parar ambiente
docker-compose down
```

### Manutenção

```bash
# Limpar containers parados
docker container prune

# Limpar imagens não utilizadas
docker image prune

# Limpar tudo (cuidado!)
docker system prune -a

# Ver uso de espaço
docker system df
```

## 🔧 Configuração Avançada

### Variáveis de Ambiente

| Variável | Descrição | Padrão |
|----------|-----------|---------|
| `NODE_ENV` | Ambiente de execução | `production` |
| `PORT` | Porta da aplicação | `3000` |
| `DATABASE_URL` | URL do banco Supabase | - |
| `NEXT_PUBLIC_SUPABASE_URL` | URL pública Supabase | - |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave anônima Supabase | - |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave service role | - |

### Nginx (Produção)

O Nginx está configurado com:
- Compressão gzip
- Rate limiting
- Headers de segurança
- Cache para assets estáticos
- Proxy para aplicação Next.js

Para habilitar HTTPS, descomente as seções SSL no `nginx/nginx.conf` e adicione seus certificados.

### Health Check

A aplicação inclui um endpoint de health check:

```bash
# Verificar saúde da aplicação
curl http://localhost:3000/api/health

# Resposta esperada:
{
  "status": "healthy",
  "timestamp": "2025-01-08T...",
  "uptime": 123.45,
  "environment": "production"
}
```

## 🚀 Deploy em Produção

### VPS Manual

```bash
# 1. Clonar repositório
git clone <repo-url>
cd braslog

# 2. Configurar ambiente
cp .env.example .env
# Editar .env com valores de produção

# 3. Build e deploy
docker build -t braslog:latest .
docker-compose --profile production up -d

# 4. Verificar saúde
curl http://localhost/api/health
```

### CI/CD (GitHub Actions)

O projeto está preparado para CI/CD. Veja `.github/workflows/deploy.yml` para configuração automática.

## 🐛 Troubleshooting

### Problema: Porta já em uso

```bash
# Verificar o que usa a porta
netstat -tulpn | grep :3000

# Parar containers
docker-compose down
```

### Problema: Erro de build

```bash
# Limpar cache
docker builder prune

# Build sem cache
docker build --no-cache -t braslog:latest .
```

### Problema: Banco não conecta

1. Verificar `DATABASE_URL` no `.env`
2. Testar conexão: `npx prisma db push`
3. Verificar logs: `docker-compose logs app`

### Problema: Aplicação não responde

```bash
# Verificar logs
docker-compose logs -f app

# Verificar health check
curl http://localhost:3000/api/health

# Reiniciar container
docker-compose restart app
```

## 📊 Monitoramento

### Logs

```bash
# Logs da aplicação
docker-compose logs -f app

# Logs do nginx
docker-compose logs -f nginx

# Logs com timestamp
docker-compose logs -f -t
```

### Métricas

```bash
# Uso de recursos
docker stats

# Informações do container
docker inspect braslog-app

# Processos no container
docker exec braslog-app ps aux
```

## 🔒 Segurança

### Boas Práticas Implementadas

- ✅ Container roda como usuário não-root
- ✅ Multi-stage build reduz superfície de ataque
- ✅ Secrets via variáveis de ambiente
- ✅ Headers de segurança no Nginx
- ✅ Rate limiting configurado
- ✅ Health checks implementados

### Recomendações Adicionais

- Use HTTPS em produção
- Configure firewall na VPS
- Monitore logs regularmente
- Mantenha imagens atualizadas
- Use secrets management em produção

## 📚 Recursos Adicionais

- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Next.js Docker](https://nextjs.org/docs/deployment#docker-image)
- [Nginx Configuration](https://nginx.org/en/docs/)
- [Supabase Self-hosting](https://supabase.com/docs/guides/self-hosting)