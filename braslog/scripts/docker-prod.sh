#!/bin/bash

# Script para ambiente de produção com Docker
# Uso: ./scripts/docker-prod.sh [up|down|logs|rebuild|deploy]

set -e

COMMAND=${1:-up}

case $COMMAND in
  up)
    echo "🚀 Iniciando ambiente de produção..."
    docker-compose --profile production up -d
    echo "✅ Ambiente iniciado!"
    echo "🌐 Aplicação: http://localhost:3000"
    echo "🌐 Nginx: http://localhost:80"
    ;;
  down)
    echo "🛑 Parando ambiente de produção..."
    docker-compose --profile production down
    echo "✅ Ambiente parado!"
    ;;
  logs)
    echo "📋 Mostrando logs do ambiente de produção..."
    docker-compose --profile production logs -f
    ;;
  rebuild)
    echo "🔄 Reconstruindo ambiente de produção..."
    docker-compose --profile production down
    docker-compose --profile production build --no-cache
    docker-compose --profile production up -d
    echo "✅ Ambiente reconstruído e iniciado!"
    ;;
  deploy)
    echo "🚀 Fazendo deploy para produção..."
    
    # Build da imagem
    docker build -t braslog:latest .
    
    # Parar containers antigos
    docker-compose down
    
    # Iniciar novos containers
    docker-compose --profile production up -d
    
    # Aguardar aplicação ficar pronta
    echo "⏳ Aguardando aplicação ficar pronta..."
    sleep 10
    
    # Verificar saúde da aplicação
    if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
      echo "✅ Deploy realizado com sucesso!"
    else
      echo "❌ Falha no deploy - aplicação não está respondendo"
      exit 1
    fi
    ;;
  *)
    echo "❌ Comando inválido. Use: up, down, logs, rebuild, ou deploy"
    exit 1
    ;;
esac