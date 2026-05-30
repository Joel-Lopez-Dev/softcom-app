-- =========================================================================
-- MIGRATION: Agregar tablas detalladas para Balance y Estado de Resultados
-- =========================================================================

-- Tabla para detalles de bienes en el balance (lado INVERSIÓN)
CREATE TABLE IF NOT EXISTS detalle_activo (
    id_detalle_activo SERIAL PRIMARY KEY,
    id_balance INT NOT NULL REFERENCES balance_general(id_balance) ON DELETE CASCADE,
    tipo_activo VARCHAR(50) NOT NULL, -- 'disponible', 'bien', 'inversiones'
    descripcion VARCHAR(200) NOT NULL,
    monto NUMERIC(18,2) NOT NULL CHECK (monto > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_detalle_activo_balance ON detalle_activo(id_balance);

-- Tabla para detalles de financiamiento en el balance (lado FINANCIACIÓN)
CREATE TABLE IF NOT EXISTS detalle_pasivo_capital (
    id_detalle_financiamiento SERIAL PRIMARY KEY,
    id_balance INT NOT NULL REFERENCES balance_general(id_balance) ON DELETE CASCADE,
    tipo_financiamiento VARCHAR(50) NOT NULL, -- 'capital_propio', 'prestamo_banco', 'deuda_corto_plazo', 'deuda_largo_plazo'
    descripcion VARCHAR(200) NOT NULL,
    monto NUMERIC(18,2) NOT NULL CHECK (monto >= 0),
    tasa_interes NUMERIC(10,6), -- Para préstamos
    plazo_meses INT, -- Para deudas
    porcentaje_financiamiento NUMERIC(10,6), -- Para mostrar "70% financiado" etc
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_detalle_financiamiento_balance ON detalle_pasivo_capital(id_balance);

-- Tabla para desglose del estado de resultados
CREATE TABLE IF NOT EXISTS detalle_estado_resultado (
    id_detalle_estado SERIAL PRIMARY KEY,
    id_estado INT NOT NULL REFERENCES estado_resultado(id_estado) ON DELETE CASCADE,
    concepto VARCHAR(100) NOT NULL, -- 'ingreso_ventas', 'gastos_variables', 'margen_bruto', 'gastos_fijos', 'amortizaciones', 'baii', 'intereses', 'bai', 'impuestos', 'beneficio_neto'
    descripcion VARCHAR(200),
    monto NUMERIC(18,2) NOT NULL,
    es_porcentaje BOOLEAN DEFAULT FALSE, -- Para margen %
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_detalle_estado ON detalle_estado_resultado(id_estado);

-- Tabla para línea de bienes específicos del balance
CREATE TABLE IF NOT EXISTS bien_balance (
    id_bien_balance SERIAL PRIMARY KEY,
    id_balance INT NOT NULL REFERENCES balance_general(id_balance) ON DELETE CASCADE,
    nombre_bien VARCHAR(200) NOT NULL,
    costo_total NUMERIC(18,2) NOT NULL CHECK (costo_total > 0),
    porcentaje_capital_propio NUMERIC(10,6), -- Ej: 25% del bien
    porcentaje_prestamo NUMERIC(10,6), -- Ej: 70% del bien
    monto_capital_propio NUMERIC(18,2),
    monto_prestamo NUMERIC(18,2),
    plazo_pago_meses INT, -- Ej: 48 meses (4 años)
    descripcion VARCHAR(300),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bien_balance ON bien_balance(id_balance);
