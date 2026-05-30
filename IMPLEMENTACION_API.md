# 📋 Implementación Docker + API + BD - Resumen Completo

## ✅ Lo que se implementó

### 1. **Docker + PostgreSQL** (BD lista para usar)
- ✅ `docker-compose.yml` con PostgreSQL 16 + pgAdmin
- ✅ `BD/init.sql` - Esquema completo con 13 tablas especializadas
- ✅ `BD/seed.sql` - 30+ registros de datos de prueba
- ✅ Configuración automática al iniciar con `docker-compose up -d`

### 2. **Librería de Cálculos Financieros** 
- ✅ `lib/financial-calculations.ts` con todas las fórmulas:
  - **CETES**: Precio, rendimiento anualizado, descuento implícito
  - **Bonos M**: Valor presente, duration, precio sucio
  - **Anualidades**: VP/VF para ordinaria/anticipada/diferida
  - **Precio Sucio**: Interés corrido + precio limpio

### 3. **4 Rutas API Funcionales**
- ✅ `POST /api/calculos/cete` - Calcular CETE
- ✅ `POST /api/calculos/bono-m` - Calcular Bono M
- ✅ `POST /api/calculos/anualidad` - Calcular Anualidad
- ✅ `POST /api/calculos/precio-sucio` - Calcular Precio Sucio

### 4. **Conexión a BD PostgreSQL**
- ✅ `lib/db.ts` - Pool de conexiones con transacciones
- ✅ Variables de entorno en `.env.local`
- ✅ Validaciones de entrada en todas las APIs

### 5. **Documentación Completa**
- ✅ `DOCKER_SETUP.md` - Guía detallada (30+ líneas)
- ✅ `quick-start.sh` - Script automático para Linux/Mac
- ✅ `quick-start.ps1` - Script automático para Windows
- ✅ `.env.example` y `.env.local` - Variables de entorno

---

## 🚀 Para Empezar (3 pasos simples)

### Paso 1: Iniciar Docker + PostgreSQL

**Windows:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\quick-start.ps1
```

**Linux/Mac:**
```bash
chmod +x quick-start.sh
./quick-start.sh
```

**O manualmente:**
```bash
docker-compose up -d
sleep 15
npm install
```

### Paso 2: Verificar que está corriendo

```bash
# Verificar contenedores
docker-compose ps

# Verificar BD con pgAdmin
# URL: http://localhost:5050
# Email: admin@softcom.local
# Password: admin
```

### Paso 3: Iniciar el servidor

```bash
npm run dev
```

Abre: http://localhost:3000

---

## 📡 Probar las APIs

### Opción 1: Con cURL

```bash
# CETE
curl -X POST http://localhost:3000/api/calculos/cete \
  -H "Content-Type: application/json" \
  -d '{"F":10,"r":5.5,"N":28,"cantidad":50000}'

# Bono M
curl -X POST http://localhost:3000/api/calculos/bono-m \
  -H "Content-Type: application/json" \
  -d '{"F":100,"tasaCupon":6.75,"r":5.5,"N":182,"cantidad":10000}'

# Anualidad
curl -X POST http://localhost:3000/api/calculos/anualidad \
  -H "Content-Type: application/json" \
  -d '{"tipo":"ordinaria","A":10000,"i":6,"n":12}'

# Precio Sucio
curl -X POST http://localhost:3000/api/calculos/precio-sucio \
  -H "Content-Type: application/json" \
  -d '{"precioLimpio":99.5,"diasDesdeUltimoCupon":45,"diasPeriodoCupon":182,"montoCupon":3.375}'
```

### Opción 2: Con Postman/Thunder Client

1. Importa colección de ejemplos (próximamente)
2. O crea requests manualmente a `http://localhost:3000/api/calculos/*`

---

## 🗄️ Datos de Prueba en BD

### Usuarios (con roles)
- `carlos@softcom.mx` → Admin
- `sofia@softcom.mx` → Gerente Cartera
- `diego@softcom.mx` → Analyst

### Empresas
- Inversiones Globales SA (Portafolio: $5M)
- Fondos del Pacífico (Portafolio: $3.5M)
- Patrimonial Latinoamericano (Portafolio: $2M)

### Instrumentos
- 3 CETES (28, 91, 182 días)
- 2 Bonos M (182, 364 días)
- 2 UDIBONOs (ajustados por inflación)

### Posiciones & Transacciones
- 6 posiciones activas en portafolios
- 4 transacciones de compra registradas
- 7 valuaciones al día de hoy

---

## 📁 Estructura de Carpetas

```
softcom-app/
│
├── 📂 app/
│   ├── api/calculos/          ← APIs de cálculos
│   │   ├── cete/route.ts
│   │   ├── bono-m/route.ts
│   │   ├── anualidad/route.ts
│   │   └── precio-sucio/route.ts
│   ├── dashboard/
│   ├── valuacion/
│   ├── operaciones/
│   └── ...
│
├── 📂 lib/
│   ├── db.ts                  ← Conexión PostgreSQL
│   ├── financial-calculations.ts  ← Todas las fórmulas
│   ├── auth-context.tsx
│   └── utils.ts
│
├── 📂 BD/
│   ├── init.sql               ← Esquema de tablas
│   ├── seed.sql               ← Datos iniciales
│   └── MODELO_SOFTCOM_DOCUMENTACION.md
│
├── docker-compose.yml         ← PostgreSQL + pgAdmin
├── .env.local                 ← Variables de entorno
├── .env.example               ← Template
├── package.json               ← Con "pg": "^8.12.0"
├── DOCKER_SETUP.md            ← Guía completa
├── quick-start.sh             ← Script Linux/Mac
├── quick-start.ps1            ← Script Windows
└── IMPLEMENTACION_API.md      ← Este archivo
```

---

## 🔐 Credenciales de Acceso

### PostgreSQL
- Host: `localhost`
- Port: `5432`
- User: `softcom`
- Password: `softcom_dev_2026`
- Database: `softcom_db`

### pgAdmin (Gestión Visual)
- URL: http://localhost:5050
- Email: `admin@softcom.local`
- Password: `admin`

### Frontend (Autenticación Local)
- Email: `carlos@softcom.mx` / `sofia@softcom.mx` / `diego@softcom.mx`
- Password: (cualquiera, es mock)

---

## 📊 Tablas de BD y su Propósito

| Tabla | Propósito |
|-------|-----------|
| `usuario` | Usuarios del sistema con roles |
| `empresa` | Empresas cliente |
| `portafolio` | Carteras de inversión |
| `instrumento` | CETES, Bonos, Derivados, Acciones |
| `bono` | Detalles específicos de bonos |
| `posicion` | Tenencias actuales |
| `transaccion` | Historial de compra/venta |
| `valuacion` | Precios y métricas diarias |
| `anualidad` | Cálculos de anualidades |
| `cupon` | Pagos de cupones |
| `balance_general` | Estados financieros |
| `estado_resultado` | P&L anual |
| `alerta` | Alertas de riesgo |
| `reporte` | Reportes PDF generados |

---

## 🛠️ Próximos Pasos (Implementar después)

### Nivel 1: APIs básicas (2-3 horas)
- [ ] `POST /api/empresas` - Crear empresa
- [ ] `GET /api/empresas/:id` - Obtener empresa
- [ ] `GET /api/portafolios/:id` - Obtener portafolio

### Nivel 2: Transacciones (3-4 horas)
- [ ] `POST /api/transacciones` - Registrar compra/venta
- [ ] `GET /api/transacciones/:portafolioId` - Historial

### Nivel 3: Autenticación real (4-6 horas)
- [ ] Reemplazar localStorage con JWT + PostgreSQL
- [ ] Hash de contraseñas con bcrypt
- [ ] Middleware de autenticación

### Nivel 4: Reportes (3-4 horas)
- [ ] `POST /api/reportes/generar` - Generar PDF
- [ ] `GET /api/reportes/lista` - Listar reportes

### Nivel 5: Dashboard con datos reales (4-5 horas)
- [ ] Conectar `/dashboard` a BD
- [ ] Conectar `/portafolio` a posiciones reales
- [ ] Conectar `/valuacion` a precios en BD

---

## 🔧 Troubleshooting

### ❌ "Cannot find module 'pg'"
```bash
npm install pg@8.12.0
```

### ❌ "ECONNREFUSED 127.0.0.1:5432"
```bash
docker-compose down -v
docker-compose up -d
sleep 20
```

### ❌ "column doesn't exist"
Los datos de prueba necesitan ser reinsertados:
```bash
docker-compose down -v
docker-compose up -d
```

### ❌ Puerto 5432 en uso
Cambiar en `docker-compose.yml`:
```yaml
ports:
  - "5433:5432"
```
Y en `.env.local`: `DB_PORT=5433`

---

## 📞 Soporte Técnico

- **BD**: Ver tablas con pgAdmin (http://localhost:5050)
- **APIs**: Probar con Postman o cURL (ver ejemplos arriba)
- **Logs**: `docker-compose logs postgres` o `docker-compose logs -f`

---

## ✨ Resumen Visual

```
┌─────────────────────────────────────────────────────────┐
│                    SoftCom v1.0                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Next.js Frontend (React 19)                           │
│  ├─ Dashboard con roles (admin/gerente/analyst)       │
│  ├─ Páginas: Valuación, Portafolio, Operaciones      │
│  └─ Formularios con validaciones                      │
│                                                         │
│  ↕️  (Conexión HTTP)                                    │
│                                                         │
│  Next.js API Routes                                    │
│  ├─ POST /api/calculos/cete          [✅ Activa]       │
│  ├─ POST /api/calculos/bono-m        [✅ Activa]       │
│  ├─ POST /api/calculos/anualidad     [✅ Activa]       │
│  ├─ POST /api/calculos/precio-sucio  [✅ Activa]       │
│  └─ (Próximas: CRUD, autenticación, reportes)        │
│                                                         │
│  ↕️  (Pool de conexiones)                               │
│                                                         │
│  PostgreSQL 16                                         │
│  ├─ 13 tablas especializadas                          │
│  ├─ 3 empresas + 3 usuarios + 7 instrumentos         │
│  └─ Datos de prueba para desarrollo                   │
│                                                         │
│  pgAdmin 4                                             │
│  └─ Gestor visual (http://localhost:5050)             │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 📖 Referencias Útiles

- [PostgreSQL + Node.js](https://node-postgres.com/)
- [Next.js API Routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes)
- [Fórmulas Financieras](./BD/MODELO_SOFTCOM_DOCUMENTACION.md)
- [Docker Docs](https://docs.docker.com/)

---

**Última actualización:** 29 de mayo de 2026  
**Versión:** 1.0 - Infraestructura Base  
**Estado:** ✅ Listo para desarrollo
