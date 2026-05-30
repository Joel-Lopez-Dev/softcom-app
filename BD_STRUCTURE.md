# 📊 Referencia Técnica: Estructura Base de Datos SoftCom

## Diagrama de Relaciones

```
empresa (1) ──────────────────── (N) usuario
    │                                 │
    │                                 │ gerente/analyst
    │                                 ▼
    │                            posicion (holdings)
    │                                 │
    │                                 ▼
    │                            transaccion (immutable)
    │
    ├─────────────────────────────────────────┐
    │                                         │
    ▼                                         ▼
balance_general                    estado_resultado
    │                                         │
    ├──▶ detalle_activo                       ├──▶ detalle_estado_resultado
    ├──▶ detalle_pasivo_capital               │
    └──▶ bien_balance                         │

instrumento ──── (M:M) ──── cliente_instrumento
    │                              │
    └──────────────────────────────┘
```

---

## 📋 Esquema Completo

### 1. `empresa`
**Empresas clientes de SoftCom**

```sql
CREATE TABLE empresa (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255) UNIQUE NOT NULL,
  rfc VARCHAR(13) UNIQUE NOT NULL,
  giro_empresa VARCHAR(255),
  direccion TEXT,
  ciudad VARCHAR(100),
  estado VARCHAR(100),
  cp VARCHAR(5),
  telefono VARCHAR(15),
  email VARCHAR(100),
  website VARCHAR(255),
  representante_legal VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Datos de ejemplo:
-- id=1: Inversora del Norte SA, RFC=IND230615ABC, saldo=$3.03M
-- id=2: Fondo Bajío Capital, RFC=FBC220308DEF, saldo=$1.45M
-- id=3: Corporativo Noreste SA, RFC=COR190725GHI, saldo=$2.1M
```

### 2. `usuario`
**Usuarios con roles y autenticación bcrypt**

```sql
CREATE TABLE usuario (
  id SERIAL PRIMARY KEY,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL, -- bcrypt(12 rounds)
  nombre_completo VARCHAR(255),
  rol ENUM('admin', 'gerente_cartera', 'analyst') NOT NULL,
  empresa_id INTEGER REFERENCES empresa(id),
  telefono VARCHAR(15),
  activo BOOLEAN DEFAULT TRUE,
  ultimo_acceso TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Datos de ejemplo:
-- id=1: admin@softcom.com, rol=admin
-- id=2: sofía@softcom.mx, rol=gerente_cartera, empresa_id=1
-- id=3: diego@softcom.mx, rol=analyst, empresa_id=1
```

### 3. `instrumento`
**Instrumentos financieros disponibles**

```sql
CREATE TABLE instrumento (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255) UNIQUE NOT NULL,
  tipo ENUM('CETES', 'BONOS_M') NOT NULL,
  valor_nominal NUMERIC(18,2) NOT NULL,
  tasa_cupon NUMERIC(5,4),              -- NULL para CETES
  tasa_anual NUMERIC(5,4),              -- Para CETES
  dias_vencimiento INTEGER,             -- Para CETES
  plazo_semestres INTEGER,              -- Para BONOS M
  fecha_vencimiento DATE,
  rendimiento_esperado NUMERIC(5,4),    -- Puede ser NULL
  liquidez VARCHAR(50),                 -- Alta, Media, Baja
  riesgo VARCHAR(50),                   -- Bajo, Medio, Alto
  emisor VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Datos de ejemplo:
-- id=1: CETES 28d, tipo=CETES, valor_nominal=10000, tasa_anual=11.5%, dias_vencimiento=28
-- id=2: CETES 91d, tipo=CETES, valor_nominal=10000, tasa_anual=11.3%, dias_vencimiento=91
-- id=3: Bono M 7% 2031, tipo=BONOS_M, tasa_cupon=7%, plazo_semestres=10
-- id=4: Bono M 8.5% 2029, tipo=BONOS_M, tasa_cupon=8.5%, plazo_semestres=6
```

### 4. `cliente_instrumento`
**Relación many-to-many: empresa → instrumento**

```sql
CREATE TABLE cliente_instrumento (
  id SERIAL PRIMARY KEY,
  empresa_id INTEGER NOT NULL REFERENCES empresa(id) ON DELETE CASCADE,
  instrumento_id INTEGER NOT NULL REFERENCES instrumento(id) ON DELETE CASCADE,
  cantidad_disponible NUMERIC(18,2) DEFAULT 0,
  saldo_disponible NUMERIC(18,2) DEFAULT 0,
  costo_promedio NUMERIC(18,4) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(empresa_id, instrumento_id)
);
```

### 5. `posicion`
**Holdings actuales del cliente**

```sql
CREATE TABLE posicion (
  id SERIAL PRIMARY KEY,
  empresa_id INTEGER NOT NULL REFERENCES empresa(id) ON DELETE CASCADE,
  instrumento_id INTEGER NOT NULL REFERENCES instrumento(id) ON DELETE CASCADE,
  cantidad NUMERIC(18,2) NOT NULL,
  precio_adquisicion NUMERIC(18,4) NOT NULL,
  fecha_adquisicion DATE NOT NULL,
  estado ENUM('activa', 'vencida', 'liquidada') DEFAULT 'activa',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 6. `transaccion` (⭐ INMUTABLE)
**Compra/venta de instrumentos - LOG INMUTABLE**

```sql
CREATE TABLE transaccion (
  id SERIAL PRIMARY KEY,
  empresa_id INTEGER NOT NULL REFERENCES empresa(id) ON DELETE RESTRICT,
  usuario_id INTEGER NOT NULL REFERENCES usuario(id) ON DELETE RESTRICT,
  instrumento_id INTEGER NOT NULL REFERENCES instrumento(id) ON DELETE RESTRICT,
  tipo_operacion ENUM('compra', 'venta') NOT NULL,
  cantidad NUMERIC(18,2) NOT NULL,
  precio_sucio NUMERIC(18,4),           -- Precio limpio sin comisión
  precio_neto NUMERIC(18,4),            -- Precio neto con comisión
  comision NUMERIC(18,4) DEFAULT 0,
  monto_total NUMERIC(18,2) NOT NULL,
  referencia VARCHAR(50),               -- CETE170526, BONM240328, etc
  estado ENUM('pendiente', 'confirmada', 'cancelada') DEFAULT 'confirmada',
  observaciones TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_transaccion_empresa ON transaccion(empresa_id);
CREATE INDEX idx_transaccion_usuario ON transaccion(usuario_id);
CREATE INDEX idx_transaccion_fecha ON transaccion(created_at DESC);

-- CHECK: Solo lectura (RLS política en Supabase)
-- No permitir UPDATE ni DELETE
```

### 7. `balance_general`
**Estado patrimonial de la empresa**

```sql
CREATE TABLE balance_general (
  id SERIAL PRIMARY KEY,
  empresa_id INTEGER NOT NULL REFERENCES empresa(id) ON DELETE CASCADE,
  periodo DATE NOT NULL,
  total_activos NUMERIC(18,2) NOT NULL,
  total_pasivos NUMERIC(18,2) NOT NULL,
  total_capital NUMERIC(18,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  -- CHECK constraint: activos = pasivos + capital
  CHECK (ABS(total_activos - (total_pasivos + total_capital)) < 0.01),
  UNIQUE(empresa_id, periodo)
);

-- Datos de ejemplo:
-- empresa_id=1, total_activos=$8.5M, total_pasivos=$2M, total_capital=$6.5M
```

### 8. `estado_resultado`
**Profit & Loss statement**

```sql
CREATE TABLE estado_resultado (
  id SERIAL PRIMARY KEY,
  empresa_id INTEGER NOT NULL REFERENCES empresa(id) ON DELETE CASCADE,
  periodo DATE NOT NULL,
  ingreso_ventas NUMERIC(18,2) NOT NULL,
  gastos_variables NUMERIC(18,2) NOT NULL,
  margen_bruto NUMERIC(18,2) NOT NULL,
  gastos_fijos NUMERIC(18,2) NOT NULL,
  amortizaciones NUMERIC(18,2) NOT NULL,
  baii NUMERIC(18,2) NOT NULL,
  intereses NUMERIC(18,2) NOT NULL,
  bai NUMERIC(18,2) NOT NULL,
  impuestos NUMERIC(18,2) NOT NULL,
  beneficio_neto NUMERIC(18,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  -- CHECK: utilidad = ingreso - gasto
  CHECK (ABS(beneficio_neto - (ingreso_ventas - (gastos_variables + gastos_fijos + amortizaciones + intereses + impuestos))) < 0.01),
  UNIQUE(empresa_id, periodo)
);

-- Datos de ejemplo:
-- ingreso_ventas=$3.2M → margen_bruto=$2.4M → BAII=$1.3M → Beneficio Neto=$731.25K
```

### 9. `indicador`
**KPIs financieros**

```sql
CREATE TABLE indicador (
  id SERIAL PRIMARY KEY,
  empresa_id INTEGER NOT NULL REFERENCES empresa(id) ON DELETE CASCADE,
  periodo DATE NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  valor NUMERIC(10,4) NOT NULL,
  descripcion TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Ejemplos de indicadores:
-- ROE (Return on Equity) = Beneficio Neto / Capital = 11.2%
-- ROA (Return on Assets) = Beneficio Neto / Activos = 8.6%
-- Deuda / Capital = Pasivos / Capital = 30.8%
-- Margen Neto = Beneficio Neto / Ingresos = 22.9%
```

### 10. `alerta`
**Risk monitoring**

```sql
CREATE TABLE alerta (
  id SERIAL PRIMARY KEY,
  empresa_id INTEGER NOT NULL REFERENCES empresa(id) ON DELETE CASCADE,
  tipo ENUM('RIESGO_MERCADO', 'RIESGO_CREDITO', 'RIESGO_LIQUIDEZ', 'VENCIMIENTO_PROXIMO', 'ALERTA_PRESUPUESTO') NOT NULL,
  descripcion TEXT NOT NULL,
  nivel ENUM('bajo', 'medio', 'alto', 'critico') DEFAULT 'medio',
  activa BOOLEAN DEFAULT TRUE,
  fecha_resolucion TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 11. `anualidad`
**Annuity calculations**

```sql
CREATE TABLE anualidad (
  id SERIAL PRIMARY KEY,
  empresa_id INTEGER NOT NULL REFERENCES empresa(id) ON DELETE CASCADE,
  tipo ENUM('ordinaria', 'anticipada', 'diferida') NOT NULL,
  importe NUMERIC(18,2) NOT NULL,
  tasa_interes NUMERIC(5,4) NOT NULL,
  periodos INTEGER NOT NULL,
  periodos_diferimiento INTEGER DEFAULT 0,
  valor_presente NUMERIC(18,2),
  valor_futuro NUMERIC(18,2),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 12. `operacion`
**Operation log for audit trail**

```sql
CREATE TABLE operacion (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES usuario(id),
  tipo_operacion VARCHAR(50) NOT NULL,
  tabla_afectada VARCHAR(50),
  registro_id INTEGER,
  datos_anteriores JSONB,
  datos_nuevos JSONB,
  ip_cliente VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 13. `posicion_venta`
**Short selling positions**

```sql
CREATE TABLE posicion_venta (
  id SERIAL PRIMARY KEY,
  empresa_id INTEGER NOT NULL REFERENCES empresa(id) ON DELETE CASCADE,
  instrumento_id INTEGER NOT NULL REFERENCES instrumento(id) ON DELETE CASCADE,
  cantidad NUMERIC(18,2) NOT NULL,
  precio_venta NUMERIC(18,4) NOT NULL,
  fecha_venta DATE NOT NULL,
  estado ENUM('abierta', 'cerrada') DEFAULT 'abierta',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🆕 Tablas de Detalle (4)

### 14. `detalle_activo`
**Desglose de activos en Balance General**

```sql
CREATE TABLE detalle_activo (
  id SERIAL PRIMARY KEY,
  balance_general_id INTEGER NOT NULL REFERENCES balance_general(id) ON DELETE CASCADE,
  tipo_activo VARCHAR(100) NOT NULL,
  descripcion VARCHAR(255),
  monto NUMERIC(18,2) NOT NULL,
  porcentaje_del_total NUMERIC(5,2),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Ejemplos:
-- tipo_activo='Efectivo', monto=$500,000, porcentaje=5.9%
-- tipo_activo='Propiedad', monto=$3,000,000, porcentaje=35.3%
-- tipo_activo='Equipos', monto=$1,500,000, porcentaje=17.6%
-- tipo_activo='Inversiones', monto=$5,000,000, porcentaje=58.8% (ESPERA: suma > 100%?)
```

### 15. `detalle_pasivo_capital`
**Desglose de financiamiento (Pasivos + Capital)**

```sql
CREATE TABLE detalle_pasivo_capital (
  id SERIAL PRIMARY KEY,
  balance_general_id INTEGER NOT NULL REFERENCES balance_general(id) ON DELETE CASCADE,
  tipo_financiamiento VARCHAR(100) NOT NULL,
  descripcion VARCHAR(255),
  monto NUMERIC(18,2) NOT NULL,
  porcentaje_financiamiento NUMERIC(5,2),   -- 25% capital, 70% préstamo, 5% deudas
  tasa_interes NUMERIC(5,4),
  plazo_meses INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Ejemplos:
-- tipo='Capital Propio', porcentaje=25%, monto=$2,125,000
-- tipo='Préstamo Bancario', porcentaje=70%, monto=$5,950,000, tasa=8.5%, plazo=60
-- tipo='Deudas Comerciales', porcentaje=5%, monto=$425,000, plazo=30
```

### 16. `detalle_estado_resultado`
**10 líneas de desglose P&L**

```sql
CREATE TABLE detalle_estado_resultado (
  id SERIAL PRIMARY KEY,
  estado_resultado_id INTEGER NOT NULL REFERENCES estado_resultado(id) ON DELETE CASCADE,
  concepto VARCHAR(100) NOT NULL,
  descripcion VARCHAR(255),
  monto NUMERIC(18,2) NOT NULL,
  porcentaje_ingreso NUMERIC(5,2),
  orden INTEGER,                          -- Para ordenar filas
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Ejemplos (10 conceptos):
-- 1. Ingresos por Ventas: $3,200,000 (100%)
-- 2. Gastos Variables: -$800,000 (-25%)
-- 3. Margen Bruto: $2,400,000 (75%)
-- 4. Gastos Fijos: -$800,000 (-25%)
-- 5. Amortizaciones: -$300,000 (-9.4%)
-- 6. BAII: $1,300,000 (40.6%)
-- 7. Intereses: -$325,000 (-10.2%)
-- 8. BAI: $975,000 (30.5%)
-- 9. Impuestos (ISR 25%): -$243,750 (-7.6%)
-- 10. Beneficio Neto: $731,250 (22.9%)
```

### 17. `bien_balance`
**Detalles de bienes individuales con financiamiento**

```sql
CREATE TABLE bien_balance (
  id SERIAL PRIMARY KEY,
  balance_general_id INTEGER NOT NULL REFERENCES balance_general(id) ON DELETE CASCADE,
  nombre_bien VARCHAR(255) NOT NULL,
  costo_total NUMERIC(18,2) NOT NULL,
  porcentaje_capital_propio NUMERIC(5,2) DEFAULT 25,  -- 25%
  porcentaje_prestamo NUMERIC(5,2) DEFAULT 70,         -- 70%
  porcentaje_otros NUMERIC(5,2) DEFAULT 5,             -- 5% (otros pasivos)
  monto_capital_propio NUMERIC(18,2),
  monto_prestamo NUMERIC(18,2),
  monto_otros NUMERIC(18,2),
  plazo_pago_meses INTEGER,
  tasa_interes NUMERIC(5,4),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Ejemplos:
-- 1. Propiedad Inmueble
--    costo_total=$3,000,000
--    25% capital propio = $750,000
--    70% préstamo = $2,100,000
--    5% deudas = $150,000
--    plazo=48 meses, tasa=8.5%
--
-- 2. Equipos Industriales
--    costo_total=$1,500,000
--    25% capital propio = $375,000
--    70% préstamo = $1,050,000
--    5% deudas = $75,000
--    plazo=36 meses, tasa=9.2%
```

---

## 🔑 ENUMs (6)

### `tipo_instrumento`
```sql
CREATE TYPE tipo_instrumento AS ENUM('CETES', 'BONOS_M');
```

### `tipo_operacion`
```sql
CREATE TYPE tipo_operacion AS ENUM('compra', 'venta');
```

### `tipo_alerta`
```sql
CREATE TYPE tipo_alerta AS ENUM(
  'RIESGO_MERCADO',
  'RIESGO_CREDITO',
  'RIESGO_LIQUIDEZ',
  'VENCIMIENTO_PROXIMO',
  'ALERTA_PRESUPUESTO'
);
```

### `estado_adquisicion`
```sql
CREATE TYPE estado_adquisicion AS ENUM('activa', 'vencida', 'liquidada');
```

### `tipo_anualidad`
```sql
CREATE TYPE tipo_anualidad AS ENUM('ordinaria', 'anticipada', 'diferida');
```

### `estado_transaccion`
```sql
CREATE TYPE estado_transaccion AS ENUM('pendiente', 'confirmada', 'cancelada');
```

---

## 📊 Relacionamiento de Tablas

### Balance General → Detalles
```
balance_general (1) ──────────────── (N) detalle_activo
balance_general (1) ──────────────── (N) detalle_pasivo_capital
balance_general (1) ──────────────── (N) bien_balance
```

### Estado Resultado → Detalles
```
estado_resultado (1) ──────────────── (N) detalle_estado_resultado
```

### Transacciones → Auditoría
```
transaccion (N) ──────────────── (1) usuario
transaccion (N) ──────────────── (1) empresa
transaccion (N) ──────────────── (1) instrumento
```

---

## 💡 Consideraciones de Implementación

### Para Supabase

1. **Enable RLS** en tablas sensibles:
   - `transaccion` (read-only después de crear)
   - `usuario` (solo admin ve todas)

2. **Foreign Keys** con cascading deletes:
   - `detalle_activo` deletes cuando `balance_general` se borra
   - `bien_balance` deletes cuando `balance_general` se borra

3. **Triggers** útiles:
   - Auto-calcular `margen_bruto` = `ingreso_ventas - gastos_variables`
   - Auto-calcular `beneficio_neto` en `estado_resultado`
   - Auto-actualizar `updated_at` en cambios

4. **Índices** para performance:
   ```sql
   CREATE INDEX idx_transaccion_empresa_fecha ON transaccion(empresa_id, created_at DESC);
   CREATE INDEX idx_balance_empresa_periodo ON balance_general(empresa_id, periodo);
   ```

### Volumen de Datos

- **Empresas:** 3-10
- **Usuarios:** 5-30
- **Instrumentos:** 10-50
- **Transacciones:** 100-10K (por mes)
- **Balances históricos:** 12-24 (por año)

**Total estimado:** < 1 GB para 2 años de datos

---

## ✅ Validaciones y Constraints

### CHECK Constraints

```sql
-- Balance General debe cuadrar
CHECK (ABS(total_activos - (total_pasivos + total_capital)) < 0.01)

-- Estado Resultado debe cuadrar
CHECK (ABS(beneficio_neto - (ingreso_ventas - (gastos_variables + gastos_fijos + amortizaciones + intereses + impuestos))) < 0.01)

-- Bien Balance: porcentajes deben sumar ~100%
CHECK (porcentaje_capital_propio + porcentaje_prestamo + porcentaje_otros BETWEEN 99 AND 101)
```

### NOT NULL Constraints

```
transaccion.cantidad NOT NULL
transaccion.monto_total NOT NULL
balance_general.total_activos NOT NULL
estado_resultado.beneficio_neto NOT NULL
```

### UNIQUE Constraints

```
usuario.email UNIQUE
empresa.rfc UNIQUE
instrumento.nombre UNIQUE
balance_general(empresa_id, periodo) UNIQUE
estado_resultado(empresa_id, periodo) UNIQUE
```

---

**Última actualización:** Mayo 2026  
**Versión DB:** 1.0  
**Status:** ✅ Listo para Supabase
