#!/bin/bash

# =========================================================================
# SoftCom - Quick Start Script (Linux/macOS)
# =========================================================================

echo "🚀 Iniciando SoftCom..."
echo ""

# Verificar si Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado. Instálalo desde: https://www.docker.com/products/docker-desktop"
    exit 1
fi

echo "✅ Docker encontrado"

# Verificar si Docker Compose está instalado
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose no está instalado."
    exit 1
fi

echo "✅ Docker Compose encontrado"
echo ""

# 1. Iniciar contenedores
echo "📦 Iniciando PostgreSQL y pgAdmin..."
docker-compose up -d

# Esperar a que PostgreSQL esté listo
echo "⏳ Esperando a que PostgreSQL esté listo..."
sleep 15

# 2. Verificar conexión
echo ""
echo "🔍 Verificando conexión a la BD..."
if docker exec softcom-postgres psql -U softcom -d softcom_db -c "\dt" > /dev/null 2>&1; then
    echo "✅ Base de datos lista"
else
    echo "❌ Error conectando a la BD"
    exit 1
fi

# 3. Instalar dependencias de Node
echo ""
echo "📚 Instalando dependencias de Node..."

if command -v pnpm &> /dev/null; then
    pnpm install
elif command -v npm &> /dev/null; then
    npm install
else
    echo "❌ npm o pnpm no están instalados"
    exit 1
fi

echo "✅ Dependencias instaladas"

# 4. Mensaje de éxito
echo ""
echo "╔════════════════════════════════════════════╗"
echo "║        ✨ SoftCom está listo ✨           ║"
echo "╠════════════════════════════════════════════╣"
echo "║ 🌐 Frontend:  http://localhost:3000       ║"
echo "║ 🗄️  PostgreSQL: localhost:5432            ║"
echo "║ 📊 pgAdmin:   http://localhost:5050       ║"
echo "║    - Email: admin@softcom.local            ║"
echo "║    - Password: admin                       ║"
echo "╚════════════════════════════════════════════╝"
echo ""
echo "Para iniciar el servidor:"
echo "  npm run dev"
echo ""
echo "Para ver logs de Docker:"
echo "  docker-compose logs -f"
echo ""
