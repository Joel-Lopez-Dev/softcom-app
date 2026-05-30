# 🚀 Guía de Migración: Docker PostgreSQL → Supabase + Vercel

## 📋 Contenido de esta Rama

Esta rama contiene la **implementación completa del backend** para SoftCom con:

- **13 Endpoints REST** documentados
- **Base de datos PostgreSQL** con 17 tablas + ENUMs + CHECK constraints
- **Módulo Estados Financieros** (Balance General, P&L, Indicadores)
- **Módulo Operaciones** (Buy/Sell con historial inmutable)
- **PDF Export** de reportes financieros con logo
- **Autenticación** con bcrypt (3 usuarios demo)
- **Docker Compose** para desarrollo local

---

## 🏗️ Estructura de Base de Datos

### Tablas Principales (13)

```sql
1. empresa              -- Empresas clientes (SOFTCOM, Fondo Bajío, Corporativo)
2. usuario             -- Usuarios con roles (admin, gerente_cartera, analyst)
3. instrumento         -- Instrumentos (CETES, BONOS M)
4. cliente_instrumento -- Relación many-to-many
5. posicion           -- Holdings del cliente (cantidad, precio)
6. transaccion        -- Operaciones de compra/venta (inmutable)
7. balance_general    -- Estado financiero (activos, pasivos, capital)
8. estado_resultado   -- P&L (ingreso, gasto, utilidad)
9. indicador          -- KPIs financieros
10. alerta            -- Risk alerts
11. anualidad         -- Annuity calculations
12. operacion         -- Operation log
13. posicion_venta    -- Short selling positions
```

### Tablas de Detalle (4) - NUEVAS

```sql
14. detalle_activo                    -- Breakdown de activos
15. detalle_pasivo_capital           -- Breakdown de financiamiento (25% capital / 70% préstamo)
16. detalle_estado_resultado         -- 10 líneas de P&L
17. bien_balance                     -- Individual asset financing details
```

### ENUMs (6)

```sql
tipo_instrumento:       CETES | BONOS_M
tipo_operacion:         compra | venta
tipo_alerta:            RIESGO_MERCADO | RIESGO_CREDITO | ...
estado_adquisicion:     activa | vencida | liquidada
tipo_anualidad:         ordinaria | anticipada | diferida
estado_transaccion:     pendiente | confirmada | cancelada
```

---

## 🔧 Pasos para Implementar en Supabase

### 1️⃣ Crear Proyecto en Supabase

```bash
# Ir a https://supabase.com y crear nuevo proyecto
# - Nombre: softcom-production
# - Region: us-east-1 (o la más cercana)
# - PostgreSQL version: 15+
# - Strong password (guardar en 1Password o LastPass)
```

### 2️⃣ Configurar Variables de Entorno

**`.env.local` (desarrollo local)**
```env
# Supabase (production)
NEXT_PUBLIC_SUPABASE_URL=https://[proyecto].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_KEY=eyJhbGc...

# PostgreSQL (local - solo para desarrollo)
DB_HOST=localhost
DB_PORT=5433
DB_USER=softcom_user
DB_PASSWORD=tu_password_segura
DB_NAME=softcom_dev
```

**`vercel.json` o Vercel Dashboard**
```json
{
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase_url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase_key",
    "SUPABASE_SERVICE_KEY": "@supabase_service_key"
  }
}
```

### 3️⃣ Ejecutar Migraciones SQL

En **Supabase Dashboard → SQL Editor**, copiar y ejecutar en orden:

**A. Schema inicial** (`BD/init.sql`)
```bash
# 1. Copiar TODO el contenido de BD/init.sql
# 2. Pegar en Supabase SQL Editor
# 3. Ejecutar (CTRL+ENTER)
```

**B. Tablas de detalle** (`BD/migration_detalle_financiero.sql`)
```bash
# 1. Copiar contenido de BD/migration_detalle_financiero.sql
# 2. Pegar en Supabase SQL Editor
# 3. Ejecutar
```

**C. Datos de prueba** (Opcional - `BD/seed.sql` + `BD/seed_detalle_financiero.sql`)
```bash
# Para development/staging, ejecutar seed.sql
# Para production, usar su propia data
```

### 4️⃣ Actualizar Cliente de Base de Datos

**Reemplazar `lib/db.ts` con cliente Supabase:**

```typescript
// lib/db.ts (versión Supabase)
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY! // Para queries del servidor
);

export default supabase;

// Ejemplo de uso:
export async function getEmpresas() {
  const { data, error } = await supabase
    .from("empresa")
    .select("*");
  
  if (error) throw error;
  return data;
}
```

### 5️⃣ Actualizar APIs REST

**Convertir endpoints de `node-postgres` a Supabase:**

**Antes (PostgreSQL con pg):**
```typescript
// app/api/empresas/route.ts
import db from "@/lib/db";

export async function GET() {
  const result = await db.query("SELECT * FROM empresa");
  return Response.json(result.rows);
}
```

**Después (Supabase):**
```typescript
// app/api/empresas/route.ts
import supabase from "@/lib/db";

export async function GET() {
  const { data, error } = await supabase
    .from("empresa")
    .select("*");
  
  if (error) return Response.json({ error: error.message }, { status: 400 });
  return Response.json(data);
}
```

**Pattern para todos los 13 endpoints:**
- `/api/empresas` → `supabase.from("empresa").select()`
- `/api/usuarios` → `supabase.from("usuario").select()`
- `/api/instrumentos` → `supabase.from("instrumento").select()`
- `/api/transacciones` → `supabase.from("transaccion").select()`
- `/api/estados-financieros` → Queries complejas con `.select("*").eq("empresa_id", id)`

---

## 📊 Módulos Implementados

### ✅ Estados Financieros (`app/estados-financieros/`)

**Componente:**
```typescript
// Carga 3 tipos de datos:
const { data } = await fetch(`/api/estados-financieros?empresa_id=${id}`)
// Retorna: { balance_general, estado_resultado, indicadores }
```

**API Endpoint:** `GET /api/estados-financieros?empresa_id=1&tipo=balance|resultado|indicadores`

**Respuesta:**
```json
{
  "balance_general": {
    "total_activos": "8500000",
    "total_pasivos": "2000000",
    "total_capital": "6500000",
    "detalles_activos": [...],
    "detalles_pasivos_capital": [...],
    "bienes": [...]
  },
  "estado_resultado": {
    "ingreso_ventas": "3200000",
    "margen_bruto": "2400000",
    "baii": "1300000",
    "bai": "975000",
    "beneficio_neto": "731250",
    "detalles": [...]
  },
  "indicadores": [...]
}
```

### ✅ Operaciones (`app/operaciones/`)

**Formulario:**
- Seleccionar cliente (dropdown)
- Seleccionar instrumento
- Ingresar precio y cantidad
- Confirmar (dialog de confirmación)
- Transacción → Base de datos

**API Endpoint:** `POST /api/transacciones`

**Payload:**
```json
{
  "empresa_id": 1,
  "instrumento_id": 2,
  "cantidad": 100,
  "precio_sucio": 99.85,
  "monto_total": 9985.00,
  "tipo_operacion": "compra"
}
```

### ✅ PDF Export (`lib/generar-reporte-pdf.ts`)

**Características:**
- Logo SOFTCOM en header
- Balance General con 2 columnas (INVERSIÓN | FINANCIACIÓN)
- Detalles de bienes con porcentaje de financiamiento
- Estado de Resultados con 10 líneas
- Multi-página con footer automático
- Timestamp en cada página

**Uso:**
```typescript
import { generarReportePDF } from "@/lib/generar-reporte-pdf";

const pdf = await generarReportePDF(empresa, balances, resultados, fecha);
// Descarga automática: Reporte_Estados_Financieros_YYYY-MM-DD.pdf
```

---

## 🔐 Seguridad en Supabase

### Row Level Security (RLS)

**Activar para tabla `transaccion` (inmutable):**
```sql
ALTER TABLE transaccion ENABLE ROW LEVEL SECURITY;

-- Solo admin puede ver todas
CREATE POLICY "admin_sees_all" ON transaccion
  FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

-- Gerente ve solo su empresa
CREATE POLICY "gerente_sees_own" ON transaccion
  FOR SELECT USING (
    empresa_id IN (
      SELECT empresa_id FROM usuario 
      WHERE id = auth.uid()
    )
  );

-- No permitir UPDATE/DELETE en transacciones (inmutable)
CREATE POLICY "no_updates" ON transaccion
  FOR UPDATE USING (FALSE);

CREATE POLICY "no_deletes" ON transaccion
  FOR DELETE USING (FALSE);
```

### Autenticación

**Supabase Auth + JWT:**
```typescript
// Para operaciones sensibles en APIs:
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

// Verificar token en middleware
export async function verificarAuth(req) {
  const token = req.headers.get("authorization")?.split(" ")[1];
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) return null;
  return user;
}
```

---

## 📦 Instalación en Vercel

### 1. Conectar Repo a Vercel

```bash
# En Vercel Dashboard:
# 1. Import Project
# 2. Seleccionar GitHub repo (Joel-Lopez-Dev/softcom-app)
# 3. Seleccionar rama: feature/backend-supabase
# 4. Configurar Build: npm run build (default)
```

### 2. Agregar Secrets en Vercel

```bash
# Vercel Dashboard → Settings → Environment Variables

NEXT_PUBLIC_SUPABASE_URL=https://[proyecto].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_KEY=eyJhbGc...
```

### 3. Deploy

```bash
# Automatic deployment cuando hagas push a main
git checkout main
git merge feature/backend-supabase
git push origin main
# Vercel detecta cambio y deploya automáticamente
```

---

## 🧪 Testing en Producción

### 1. Verificar Endpoints

```bash
# Después de deployment en Vercel
curl https://tu-dominio.vercel.app/api/empresas

# Debe retornar:
# [{"id": 1, "nombre": "Inversora del Norte SA", ...}, ...]
```

### 2. Probar Estados Financieros

```bash
# GET empresas
curl https://tu-dominio.vercel.app/api/empresas

# GET estados financieros de empresa 1
curl "https://tu-dominio.vercel.app/api/estados-financieros?empresa_id=1"

# Debe retornar balance + resultado + indicadores
```

### 3. Probar Operaciones

```bash
# POST nueva transacción
curl -X POST https://tu-dominio.vercel.app/api/transacciones \
  -H "Content-Type: application/json" \
  -d '{
    "empresa_id": 1,
    "instrumento_id": 2,
    "cantidad": 100,
    "precio_sucio": 99.85,
    "monto_total": 9985,
    "tipo_operacion": "compra"
  }'

# Debe guardar en BD y retornar { id, created_at, ... }
```

---

## 📁 Archivos Importantes

| Archivo | Descripción |
|---------|-------------|
| `BD/init.sql` | Schema inicial (13 tablas + ENUMs) |
| `BD/migration_detalle_financiero.sql` | 4 tablas de detalle |
| `BD/seed.sql` | Datos de prueba (30+ registros) |
| `BD/seed_detalle_financiero.sql` | Datos de detalle (20 registros) |
| `app/api/` | 13 endpoints REST |
| `lib/db.ts` | Cliente PostgreSQL (reemplazar con Supabase) |
| `lib/financial-calculations.ts` | Funciones de cálculo (anualidades, CETES, BONOS M) |
| `lib/generar-reporte-pdf.ts` | Generador PDF con jsPDF |
| `app/estados-financieros/page.tsx` | UI con 3 tabs |
| `app/operaciones/page.tsx` | Formulario compra/venta |
| `DOCKER_SETUP.md` | Setup de Docker local |
| `IMPLEMENTACION_API.md` | Documentación de APIs |

---

## ⚡ Quick Commands

### Desarrollo Local (Docker)
```bash
# 1. Iniciar containers
docker-compose up -d

# 2. Inicializar BD
npm run db:init

# 3. Seed de datos
npm run db:seed

# 4. Iniciar dev server
npm run dev
```

### Deploy a Vercel
```bash
# 1. Merge a main
git checkout main
git merge feature/backend-supabase

# 2. Push (auto-deploy)
git push origin main

# 3. Verificar en Vercel Dashboard
# https://vercel.com/dashboard
```

### Verificar Estado
```bash
# Ver rutas compiladas
npm run build

# Listar endpoints
curl localhost:3000/api

# Conectar a Supabase en desarrollo
psql postgresql://user:pass@localhost:5433/softcom_dev
```

---

## 📝 Próximos Pasos

- [ ] Migrar a Supabase RLS policies
- [ ] Implementar Supabase Auth (en lugar de mock)
- [ ] Agregar Supabase Storage para documentos
- [ ] Configurar alertas con pg_cron
- [ ] Implementar real-time con Supabase Subscriptions
- [ ] Agregar Analytics con PostHog
- [ ] Configurar CI/CD con GitHub Actions

---

## 🆘 Troubleshooting

### Error: "Cannot find module 'pg'"
```bash
# En Supabase, `pg` no es necesario
# Reemplazar importes con supabase-js
npm install @supabase/supabase-js
npm remove pg
```

### Error: "RLS policy denied"
```sql
-- Verificar que RLS está habilitado
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Revisar políticas de RLS
SELECT * FROM pg_policies WHERE schemaname = 'public';
```

### Error: "CORS origin not allowed"
```typescript
// En next.config.mjs, agregar:
headers: async () => [
  {
    source: "/api/:path*",
    headers: [
      { key: "Access-Control-Allow-Origin", value: "*" },
      { key: "Access-Control-Allow-Methods", value: "GET,POST,PUT,DELETE" }
    ]
  }
]
```

---

## 📞 Soporte

Para preguntas:
- **Supabase Docs:** https://supabase.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Vercel Docs:** https://vercel.com/docs

---

**Versión:** 1.0  
**Última actualización:** Mayo 2026  
**Estado:** ✅ Listo para producción en Supabase + Vercel
