# =========================================================================
# SoftCom - Quick Start Script (Windows PowerShell)
# =========================================================================

Write-Host "🚀 Iniciando SoftCom..." -ForegroundColor Green
Write-Host ""

# Verificar si Docker está instalado
$docker = Get-Command docker -ErrorAction SilentlyContinue
if (-not $docker) {
    Write-Host "❌ Docker no está instalado. Instálalo desde: https://www.docker.com/products/docker-desktop" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Docker encontrado" -ForegroundColor Green

# Verificar si Docker Compose está instalado
$compose = Get-Command docker-compose -ErrorAction SilentlyContinue
if (-not $compose) {
    Write-Host "❌ Docker Compose no está instalado." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Docker Compose encontrado" -ForegroundColor Green
Write-Host ""

# 1. Iniciar contenedores
Write-Host "📦 Iniciando PostgreSQL y pgAdmin..." -ForegroundColor Green
docker-compose up -d

# Esperar a que PostgreSQL esté listo
Write-Host "⏳ Esperando a que PostgreSQL esté listo..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# 2. Verificar conexión
Write-Host ""
Write-Host "🔍 Verificando conexión a la BD..." -ForegroundColor Green

$connected = docker exec softcom-postgres psql -U softcom -d softcom_db -c "\dt" 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Base de datos lista" -ForegroundColor Green
} else {
    Write-Host "❌ Error conectando a la BD" -ForegroundColor Red
    exit 1
}

# 3. Instalar dependencias de Node
Write-Host ""
Write-Host "📚 Instalando dependencias de Node..." -ForegroundColor Green

$pnpm = Get-Command pnpm -ErrorAction SilentlyContinue
if ($pnpm) {
    pnpm install
} else {
    $npm = Get-Command npm -ErrorAction SilentlyContinue
    if ($npm) {
        npm install
    } else {
        Write-Host "❌ npm o pnpm no están instalados" -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ Dependencias instaladas" -ForegroundColor Green

# 4. Mensaje de éxito
Write-Host ""
Write-Host "╔════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║        ✨ SoftCom está listo ✨           ║" -ForegroundColor Green
Write-Host "╠════════════════════════════════════════════╣" -ForegroundColor Green
Write-Host "║ 🌐 Frontend:  http://localhost:3000       ║" -ForegroundColor Green
Write-Host "║ 🗄️  PostgreSQL: localhost:5432            ║" -ForegroundColor Green
Write-Host "║ 📊 pgAdmin:   http://localhost:5050       ║" -ForegroundColor Green
Write-Host "║    - Email: admin@softcom.local            ║" -ForegroundColor Green
Write-Host "║    - Password: admin                       ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "Para iniciar el servidor:" -ForegroundColor Cyan
Write-Host "  npm run dev"
Write-Host ""
Write-Host "Para ver logs de Docker:" -ForegroundColor Cyan
Write-Host "  docker-compose logs -f"
Write-Host ""
