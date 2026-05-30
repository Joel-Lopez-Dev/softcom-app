# 🚀 SoftCom - Guía de Inicio Rápido (Docker + API)

## 📋 Requisitos

- Docker & Docker Compose
- Node.js 18+ y npm/pnpm
- PostgreSQL CLI (opcional, para gestión manual)

## 🏗️ Estructura del Proyecto

```
softcom-app/
├── app/
│   ├── api/
│   │   └── calculos/          # Rutas de cálculos financieros
│   │       ├── cete/
│   │       ├── bono-m/
│   │       ├── anualidad/
│   │       └── precio-sucio/
│   ├── dashboard/
│   ├── valuacion/
│   ├── operaciones/
│   ├── portafolio/
│   └── ...
├── lib/
│   ├── db.ts                  # Conexión a PostgreSQL
│   ├── financial-calculations.ts  # Cálculos financieros
│   └── ...
├── BD/
│   ├── init.sql               # Esquema de BD
│   ├── seed.sql               # Datos de prueba
│   └── modelo_relacional_softcom.sql
├── docker-compose.yml         # Configuración Docker
└── .env.local                 # Variables de entorno
```

---

## 🐳 Configuración de Docker

### 1. Iniciar la Base de Datos

```bash
# Desde la carpeta softcom-app/
docker-compose up -d

# Verificar que los contenedores están corriendo
docker-compose ps
```

**Salida esperada:**
```
NAME                 IMAGE                    STATUS
softcom-postgres     postgres:16-alpine       Up (healthy)
softcom-pgadmin      dpage/pgadmin4:latest    Up
```

### 2. Verificar Conexión a PostgreSQL

```bash
# Conectarse a la BD (requiere psql instalado)
psql -h localhost -U softcom -d softcom_db

# Dentro de psql, listar tablas
\dt

# Salir
\q
```

**Si no tienes psql, usa pgAdmin:**
- URL: http://localhost:5050
- Email: `admin@softcom.local`
- Password: `admin`
- Conectar servidor con: Host: `postgres`, User: `softcom`, Password: `softcom_dev_2026`

### 3. Detener los Contenedores

```bash
docker-compose down

# Borrar volúmenes (CUIDADO: borra la BD)
docker-compose down -v
```

---

## 💻 Configuración del Proyecto

### 1. Instalar Dependencias

```bash
pnpm install
# o
npm install
```

Esto instalará `pg` (cliente PostgreSQL) que es nueva dependencia.

### 2. Verificar Variables de Entorno

Confirma que `.env.local` tiene las credenciales correctas:

```bash
DB_HOST=localhost        # Debe ser 'localhost' para desarrollo local
DB_PORT=5432             # Puerto PostgreSQL por defecto
DB_USER=softcom
DB_PASSWORD=softcom_dev_2026
DB_NAME=softcom_db
```

---

## 🎯 Ejecutar el Proyecto

### Desarrollo (con recompilación automática)

```bash
npm run dev
# o
pnpm dev
```

Abre: http://localhost:3000

### Producción (compilar primero)

```bash
npm run build
npm start
```

---

## 📡 Probar las APIs de Cálculos

Las rutas están disponibles en:

### 1. CETES (Certificados de Tesorería)

**URL:** `POST /api/calculos/cete`

**Payload:**
```json
{
  "F": 10,
  "r": 5.5,
  "N": 28,
  "cantidad": 50000
}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "precioLimpio": 9.9850,
    "precioSucio": 9.9850,
    "rendimientoTotal": 0.0150,
    "montoTotal": 499250.00,
    "ganancia": 750.00,
    "rendimientoAnualizado": 5.50,
    "descuentoImplicito": 0.0150
  },
  "input": { "F": 10, "r": 5.5, "N": 28, "cantidad": 50000 }
}
```

### 2. Bonos M

**URL:** `POST /api/calculos/bono-m`

**Payload:**
```json
{
  "F": 100,
  "tasaCupon": 6.75,
  "r": 5.5,
  "N": 182,
  "cantidad": 10000
}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "precioLimpio": 100.1234,
    "precioSucio": 100.1234,
    "valorPresente": 100.1234,
    "montoTotal": 1001234.00,
    "flujosCaja": [3375.00, 103375.00],
    "duration": 0.4932,
    "durationModificada": 0.4890,
    "rendimientoEfectivo": 5.50,
    "spreadConTasa": 1.25
  }
}
```

### 3. Anualidades

**URL:** `POST /api/calculos/anualidad`

**Payload:**
```json
{
  "tipo": "ordinaria",
  "A": 10000,
  "i": 6,
  "n": 12
}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "valorPresente": 105582.05,
    "valorFuturo": 143039.00,
    "pagoTotal": 120000.00,
    "factorVP": 10.5582,
    "factorVF": 14.3039,
    "tipo": "ordinaria"
  }
}
```

### 4. Precio Sucio

**URL:** `POST /api/calculos/precio-sucio`

**Payload:**
```json
{
  "precioLimpio": 99.5,
  "diasDesdeUltimoCupon": 45,
  "diasPeriodoCupon": 182,
  "montoCupon": 3.375
}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "interesCorrido": 0.8347,
    "precioSucio": 100.3347,
    "accrualRatio": 0.2473
  }
}
```

---

## 🔐 Autenticación y Roles

### Usuarios de Prueba (localStorage)

| Email | Contraseña | Rol |
|-------|-----------|-----|
| carlos@softcom.mx | password123 | admin |
| sofia@softcom.mx | password123 | gerente_cartera |
| diego@softcom.mx | password123 | analyst |

**Nota:** El sistema actual usa localStorage. Próximamente se integrará con las credenciales de PostgreSQL.

---

## 📊 Base de Datos - Información Importante

### Tablas Principales

1. **usuario, rol, rol_empresa**: Autenticación y permisos
2. **empresa, portafolio**: Datos de clientes e inversiones
3. **instrumento, bono**: Catálogo de bonos y CETES
4. **posicion, transaccion**: Cartera y movimientos
5. **valuacion**: Precios y análisis de instrumentos
6. **anualidad, cupon**: Cálculos financieros
7. **balance_general, estado_resultado**: Estados financieros
8. **alerta, reporte**: Análisis y documentos

### Datos de Prueba

Se incluyen:
- 3 empresas cliente
- 3 usuarios con diferentes roles
- 7 instrumentos financieros (CETES, Bonos M, UDIBONOs)
- Portafolios con posiciones y transacciones
- Datos históricos de presupuestos y estados financieros

---

## 🛠️ Troubleshooting

### Error: "ECONNREFUSED 127.0.0.1:5432"

**Solución:** PostgreSQL no está corriendo. Ejecuta:
```bash
docker-compose up -d
```

### Error: "password authentication failed"

**Solución:** Verifica credenciales en `.env.local`:
```bash
cat .env.local  # Confirma credenciales
```

### Las tablas no aparecen en PostgreSQL

**Solución:** Los scripts de inicialización no se ejecutaron. Reinicia Docker:
```bash
docker-compose down -v
docker-compose up -d
# Espera 10 segundos para que terminen las migraciones
```

### Puerto 5432 ya está en uso

**Solución:** Cambia el puerto en `docker-compose.yml`:
```yaml
ports:
  - "5433:5432"  # Usa 5433 en local, pero mantén 5432 en el contenedor
```

Y actualiza `.env.local`:
```bash
DB_PORT=5433
```

---

## 📝 Próximas Tareas

- [ ] Implementar rutas API para CRUD de usuarios y empresas
- [ ] Crear rutas para gestión de portafolios
- [ ] Integrar autenticación PostgreSQL (reemplazar localStorage)
- [ ] Crear rutas para generar reportes PDF
- [ ] Implementar dashboard con datos reales de BD
- [ ] Agregar validaciones de RLS (Row-Level Security)

---

## 📚 Referencias

- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Next.js API Routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes)
- [node-postgres (pg)](https://node-postgres.com/)
- [SoftCom BD Modelo](./BD/MODELO_SOFTCOM_DOCUMENTACION.md)
