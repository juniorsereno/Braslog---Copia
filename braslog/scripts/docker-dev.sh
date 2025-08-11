#!/bin/bash

# Script para ambiente de desenvolvimento com Docker
# Uso: ./scripts/docker-dev.sh [up|down|logs|rebuild]

set -e

COMMAND=${1:-up}

case $COMMAND in
  up)
    echo "🚀 Iniciando ambiente de desenvolvimento..."
    docker-compose -f docker-compose.dev.yml up -d
    echo "✅ Ambiente iniciado! Acesse http://localhost:3000"
    ;;
  down)
    echo "🛑 Parando ambiente de desenvolvimento..."
    docker-compose -f docker-compose.dev.yml down
    echo "✅ Ambiente parado!"
    ;;
  logs)
    echo "📋 Mostrando logs do ambiente de desenvolvimento..."
    docker-compose -f docker-compose.dev.yml logs -f
    ;;
  rebuild)
    echo "🔄 Reconstruindo ambiente de desenvolvimento..."
    docker-compose -f docker-compose.dev.yml down
    docker-compose -f docker-compose.dev.yml build --no-cache
    docker-compose -f docker-compose.dev.yml up -d
    echo "✅ Ambiente reconstruído e iniciado!"
    ;;
  *)
    echo "❌ Comando inválido. Use: up, down, logs, ou rebuild"
    exit 1
    ;;
esac