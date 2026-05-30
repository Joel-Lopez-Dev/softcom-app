# 🚀 Rama: `feature/backend-supabase`

## 📌 Resumen de Cambios

Esta rama contiene la **implementación completa del backend** de SoftCom con infraestructura lista para producción en **Supabase + Vercel**.

### ✅ Lo que incluye

- **17 tablas PostgreSQL** (13 principales + 4 de detalle)
- **13 endpoints REST** completamente funcionales
- **Módulo Estados Financieros** con balance, P&L e indicadores
- **Módulo Operaciones** con formulario y historial inmutable
- **PDF Export** de reportes con logo profesional
- **Autenticación** con bcrypt (3 usuarios demo)
- **Docker Compose** para desarrollo local
- **Documentación completa** para migración a Supabase

---

## 📁 Archivos Nuevos

### Documentación
| Archivo | Propósito |
|---------|----------|
| `SUPABASE_MIGRATION.md` | Guía paso a paso para implementar en Supabase + Vercel |
| `BD_STRUCTURE.md` | Referencia técnica completa de BD (17 tablas, ENUMs, constraints) |
| `.env.example` | Variables de entorno para Supabase y desarrollo local |
| `DOCKER_SETUP.md` | Setup de PostgreSQL con Docker |
| `IMPLEMENTACION_API.md` | Documentación de los 13 endpoints REST |
| `REPORTE_ESTADOS_FINANCIEROS.md` | Specs del PDF export |

### Base de Datos (`BD/`)
| Archivo | Propósito |
|---------|----------|
| `init.sql` | Schema inicial (13 tablas + 6 ENUMs) |
| `migration_detalle_financiero.sql` | 4 tablas de detalle para balance y P&L |
| `seed.sql` | Datos de prueba (30+ registros) |
| `seed_detalle_financiero.sql` | Datos de detalle (20 registros) |

### Librerías (`lib/`)
| Archivo | Propósito |
|---------|----------|
| `db.ts` | Cliente PostgreSQL con pool singleton |
| `financial-calculations.ts` | Funciones: anualidades, CETES, BONOS M |
| `generar-reporte-pdf.ts` | Generador PDF con jsPDF |

### APIs (`app/api/`)
```
app/api/
├── calculos/               # 4 endpoints de cálculo
│   ├── anualidad/
│   ├── bono-m/
│   ├── cete/
│   └── precio-sucio/
├── empresas/              # CRUD empresas
│   ├── route.ts           # GET/POST /api/empresas
│   └── [id]/route.ts      # GET/PUT/DELETE /api/empresas/:id
├── usuarios/              # CRUD usuarios
│   ├── route.ts           # GET/POST /api/usuarios
│   └── [id]/route.ts      # GET/PUT/DELETE /api/usuarios/:id
├── instrumentos/          # CRUD instrumentos
│   ├── route.ts           # GET/POST /api/instrumentos
│   └── [id]/route.ts      # GET/PUT/DELETE /api/instrumentos/:id
├── transacciones/         # Transacciones inmutables
│   └── route.ts           # GET/POST /api/transacciones
└── estados-financieros/   # Estados financieros
    └── route.ts           # GET/POST /api/estados-financieros
```

### UI Pages
| Página | Cambios |
|--------|---------|
| `app/admin/empresas/page.tsx` | ✨ Nueva - CRUD de empresas |
| `app/admin/instrumentos/page.tsx` | ✨ Nueva - CRUD de instrumentos |
| `app/admin/usuarios/page.tsx` | 🔧 Modificada - CRUD con BD |
| `app/estados-financieros/page.tsx` | 🔧 Modificada - Integración de APIs |
| `app/operaciones/page.tsx` | 🔧 Modificada - Compra/venta funcional |
| `app/dashboard/page.tsx` | 🔧 Modificada - Navegación mejorada |
| `app/login/page.tsx` | 🔧 Modificada - Demo users |

### Infraestructura
| Archivo | Propósito |
|---------|----------|
| `docker-compose.yml` | PostgreSQL 16-Alpine en puerto 5433 |
| `.env.example` | Variables de entorno |
| `quick-start.sh` | Script setup Linux/Mac |
| `quick-start.ps1` | Script setup Windows |

---

## 🚀 Quick Start (Desarrollo Local)

### 1. Clonar la rama
```bash
git clone https://github.com/Joel-Lopez-Dev/softcom-app.git
cd softcom-app
git checkout feature/backend-supabase
```

### 2. Instalar dependencias
```bash
npm install
# o pnpm install (más rápido)
```

### 3. Iniciar PostgreSQL con Docker
```bash
docker-compose up -d
```

### 4. Inicializar base de datos
```bash
# Ejecutar schema
docker exec softcom-postgres psql -U softcom_user -d softcom_dev -f /BD/init.sql

# Ejecutar migraciones de detalle
docker exec softcom-postgres psql -U softcom_user -d softcom_dev -f /BD/migration_detalle_financiero.sql

# Seed de datos (opcional)
docker exec softcom-postgres psql -U softcom_user -d softcom_dev -f /BD/seed.sql
docker exec softcom-postgres psql -U softcom_user -d softcom_dev -f /BD/seed_detalle_financiero.sql
```

### 5. Configurar variables de entorno
```bash
cp .env.example .env.local
# Editar .env.local con credenciales (las del docker-compose funcionan)
```

### 6. Iniciar dev server
```bash
npm run dev
# Abre http://localhost:3000
```

### 7. Acceder a la app
```
🔐 Usuarios demo:
  admin@softcom.com / admin
  sofía@softcom.mx / sofía
  diego@softcom.mx / diego
```

---

## 📊 Estructura de BD

### Tablas Principales (13)
```
empresa, usuario, instrumento, cliente_instrumento,
posicion, transaccion, balance_general, estado_resultado,
indicador, alerta, anualidad, operacion, posicion_venta
```

### Tablas de Detalle (4) ⭐
```
detalle_activo, detalle_pasivo_capital,
detalle_estado_resultado, bien_balance
```

### ENUMs (6)
```
tipo_instrumento: CETES | BONOS_M
tipo_operacion: compra | venta
tipo_alerta: RIESGO_MERCADO | RIESGO_CREDITO | ...
estado_adquisicion: activa | vencida | liquidada
tipo_anualidad: ordinaria | anticipada | diferida
estado_transaccion: pendiente | confirmada | cancelada
```

**Ver `BD_STRUCTURE.md` para detalles completos.**

---

## 🔌 13 Endpoints REST

### Empresas
```
GET    /api/empresas                    # Listar todas
POST   /api/empresas                    # Crear
GET    /api/empresas/:id                # Obtener
PUT    /api/empresas/:id                # Actualizar
DELETE /api/empresas/:id                # Eliminar
```

### Usuarios
```
GET    /api/usuarios                    # Listar todas
POST   /api/usuarios                    # Crear (bcrypt)
GET    /api/usuarios/:id                # Obtener
PUT    /api/usuarios/:id                # Actualizar (bcrypt)
DELETE /api/usuarios/:id                # Eliminar
```

### Instrumentos
```
GET    /api/instrumentos                # Listar
POST   /api/instrumentos                # Crear
GET    /api/instrumentos/:id            # Obtener
PUT    /api/instrumentos/:id            # Actualizar
DELETE /api/instrumentos/:id            # Eliminar
```

### Transacciones (Inmutables)
```
GET    /api/transacciones               # Listar log
POST   /api/transacciones               # Crear (nueva operación)
```

### Cálculos
```
POST   /api/calculos/anualidad          # Calcular VP/VF de anualidades
POST   /api/calculos/cete               # Pricing CETES
POST   /api/calculos/bono-m             # Pricing BONOS M
POST   /api/calculos/precio-sucio       # Precio sucio
```

### Estados Financieros
```
GET    /api/estados-financieros?empresa_id=1&tipo=balance|resultado
POST   /api/estados-financieros         # Crear statement
```

---

## 📊 Módulos Funcionales

### ✅ Estados Financieros
- Balance General con detalles de activos, pasivos, capital
- Estado de Resultados con 10 líneas (ingreso → beneficio neto)
- Indicadores financieros (ROE, ROA, deuda/capital, margen neto)
- **PDF Export** profesional con logo SOFTCOM

### ✅ Operaciones
- Formulario compra/venta
- Selector de cliente y instrumento
- Ingreso de precio y cantidad
- Historial inmutable de transacciones
- Transacciones persisten en BD

### ✅ Calculadoras
- **Anualidades:** Ordinaria, Anticipada, Diferida
- **CETES:** Precio, descuento, rendimiento (fórmula de 28/91 días)
- **BONOS M:** Precio con cupones semestrales

### ✅ Admin
- CRUD de empresas
- CRUD de instrumentos
- CRUD de usuarios con bcrypt

---

## 🌐 Migración a Supabase + Vercel

**Ver `SUPABASE_MIGRATION.md` para guía completa.**

### Resumen de pasos:
1. Crear proyecto en Supabase
2. Ejecutar `BD/init.sql` + `BD/migration_detalle_financiero.sql`
3. Reemplazar `lib/db.ts` con cliente Supabase
4. Actualizar endpoints REST (de pg a supabase-js)
5. Configurar RLS policies (especialmente en `transaccion`)
6. Conectar repo a Vercel
7. Agregar secrets en Vercel
8. Deploy automático

**Tiempo estimado:** 30 minutos

---

## 🔐 Seguridad

- ✅ Contraseñas con bcrypt (12 rounds)
- ✅ Transacciones inmutables (RLS policy: no UPDATE/DELETE)
- ✅ Foreign keys con cascading deletes
- ✅ CHECK constraints en balance y P&L
- ✅ Parameterized queries (SQL injection prevention)

---

## 📈 Estado del Proyecto

| Componente | Estado |
|-----------|--------|
| Backend APIs | ✅ Completo |
| Base de Datos | ✅ 17 tablas + constraints |
| Módulo Estados Financieros | ✅ Funcional |
| Módulo Operaciones | ✅ Funcional |
| PDF Export | ✅ Funcional |
| Admin CRUD | ✅ Funcional |
| Docker Setup | ✅ Funcional |
| Documentación Supabase | ✅ Completa |
| Listo para producción | ✅ Sí |

---

## 📖 Documentación Adicional

- `SUPABASE_MIGRATION.md` → Cómo implementar en Supabase + Vercel
- `BD_STRUCTURE.md` → Referencia técnica de todas las tablas
- `IMPLEMENTACION_API.md` → Specs de los 13 endpoints
- `REPORTE_ESTADOS_FINANCIEROS.md` → Specs del PDF export
- `DOCKER_SETUP.md` → Setup de Docker local
- `.env.example` → Variables de entorno

---

## 🔗 Links útiles

- **GitHub:** https://github.com/Joel-Lopez-Dev/softcom-app/tree/feature/backend-supabase
- **Supabase Docs:** https://supabase.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Vercel Docs:** https://vercel.com/docs
- **PostgreSQL Docs:** https://www.postgresql.org/docs/

---

## 🤝 Merge a Main

Cuando estés listo para llevar a producción:

```bash
git checkout main
git pull origin main
git merge feature/backend-supabase
git push origin main
# Vercel auto-deploya
```

---

## ✨ Próximas Features (Opcional)

- [ ] Supabase Auth (OAuth + 2FA)
- [ ] Real-time subscriptions (Supabase Realtime)
- [ ] File storage (Supabase Storage)
- [ ] Scheduled jobs (pg_cron)
- [ ] Analytics (PostHog)
- [ ] Notifications (email/SMS)

---

**Rama activa:** `feature/backend-supabase`  
**Estado:** 🟢 Listo para Supabase + Vercel  
**Última actualización:** Mayo 2026

Para preguntas o contribuciones, abre un PR en GitHub.
