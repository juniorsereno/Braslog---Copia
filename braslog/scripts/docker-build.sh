#!/bin/bash

# Script para build da imagem Docker
# Uso: ./scripts/docker-build.sh [tag]

set -e

# Definir tag padrão
TAG=${1:-latest}
IMAGE_NAME="braslog"

echo "🐳 Construindo imagem Docker: $IMAGE_NAME:$TAG"

# Build da imagem
docker build -t $IMAGE_NAME:$TAG .

echo "✅ Imagem construída com sucesso: $IMAGE_NAME:$TAG"

# Mostrar informações da imagem
echo "📊 Informações da imagem:"
docker images $IMAGE_NAME:$TAG

echo "🚀 Para executar a imagem:"
echo "docker run -p 3000:3000 --env-file .env $IMAGE_NAME:$TAG"