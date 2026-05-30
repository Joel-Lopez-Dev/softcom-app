-- =========================================================================
-- Datos de ejemplo para tablas detalladas de Balance y Estado de Resultados
-- =========================================================================

-- Obtener el primer balance_general para la empresa Inversiones Globales SA
WITH balance_data AS (
  SELECT id_balance FROM balance_general 
  WHERE id_empresa = 1 
  ORDER BY fecha DESC LIMIT 1
)

-- Insertar detalles de ACTIVOS (INVERSIÓN)
INSERT INTO detalle_activo (id_balance, tipo_activo, descripcion, monto)
SELECT 
  bd.id_balance,
  CASE WHEN d.seq = 1 THEN 'disponible'
       WHEN d.seq = 2 THEN 'bien'
       WHEN d.seq = 3 THEN 'bien'
       ELSE 'inversiones' END,
  CASE WHEN d.seq = 1 THEN 'Efectivo en Caja'
       WHEN d.seq = 2 THEN 'Propiedad Inmueble (Oficinas)'
       WHEN d.seq = 3 THEN 'Equipos y Servidores'
       ELSE 'Inversiones en Valores' END,
  CASE WHEN d.seq = 1 THEN 500000.00
       WHEN d.seq = 2 THEN 3000000.00
       WHEN d.seq = 3 THEN 1500000.00
       ELSE 5000000.00 END
FROM balance_data bd, 
     (SELECT 1 AS seq UNION SELECT 2 UNION SELECT 3 UNION SELECT 4) d;

-- Insertar detalles de PASIVOS Y CAPITAL (FINANCIACIÓN)
WITH balance_data AS (
  SELECT id_balance FROM balance_general 
  WHERE id_empresa = 1 
  ORDER BY fecha DESC LIMIT 1
)
INSERT INTO detalle_pasivo_capital (id_balance, tipo_financiamiento, descripcion, monto, tasa_interes, plazo_meses, porcentaje_financiamiento)
SELECT 
  bd.id_balance,
  CASE WHEN d.seq = 1 THEN 'capital_propio'
       WHEN d.seq = 2 THEN 'prestamo_banco'
       WHEN d.seq = 3 THEN 'deuda_largo_plazo'
       ELSE 'deuda_corto_plazo' END,
  CASE WHEN d.seq = 1 THEN 'Capital Propio Aportado (25%)'
       WHEN d.seq = 2 THEN 'Préstamo Banco - Financiamiento 70%'
       WHEN d.seq = 3 THEN 'Deuda Largo Plazo a 4 años'
       ELSE 'Obligaciones Corto Plazo' END,
  CASE WHEN d.seq = 1 THEN 2125000.00
       WHEN d.seq = 2 THEN 4250000.00
       WHEN d.seq = 3 THEN 2000000.00
       ELSE 125000.00 END,
  CASE WHEN d.seq = 2 THEN 0.065
       WHEN d.seq = 3 THEN 0.075
       ELSE NULL END,
  CASE WHEN d.seq = 3 THEN 48
       ELSE NULL END,
  CASE WHEN d.seq = 1 THEN 25.00
       WHEN d.seq = 2 THEN 70.00
       ELSE 5.00 END
FROM balance_data bd,
     (SELECT 1 AS seq UNION SELECT 2 UNION SELECT 3 UNION SELECT 4) d;

-- Insertar detalles de BIENES específicos con su financiamiento
WITH balance_data AS (
  SELECT id_balance FROM balance_general 
  WHERE id_empresa = 1 
  ORDER BY fecha DESC LIMIT 1
)
INSERT INTO bien_balance (id_balance, nombre_bien, costo_total, porcentaje_capital_propio, porcentaje_prestamo, 
                           monto_capital_propio, monto_prestamo, plazo_pago_meses, descripcion)
SELECT 
  bd.id_balance,
  CASE WHEN d.seq = 1 THEN 'Propiedad Inmueble - Oficinas'
       ELSE 'Equipos y Servidores de Cómputo' END,
  CASE WHEN d.seq = 1 THEN 3000000.00
       ELSE 1500000.00 END,
  25.00,
  70.00,
  CASE WHEN d.seq = 1 THEN 750000.00
       ELSE 375000.00 END,
  CASE WHEN d.seq = 1 THEN 2100000.00
       ELSE 1050000.00 END,
  48,
  CASE WHEN d.seq = 1 THEN 'Inmueble ubicado en Paseo de la Reforma con financiamiento al 70% con el banco'
       ELSE 'Servidores cloud y equipos de infraestructura TI con plazo de pago de 4 años' END
FROM balance_data bd,
     (SELECT 1 AS seq UNION SELECT 2) d;

-- =========================================================================
-- Detalles del ESTADO DE RESULTADOS desglosado
-- =========================================================================

-- Obtener el primer estado_resultado para la empresa Inversiones Globales SA
WITH estado_data AS (
  SELECT id_estado FROM estado_resultado 
  WHERE id_empresa = 1 
  ORDER BY anio DESC, periodo DESC LIMIT 1
)

-- Insertar desglose del Estado de Resultados con estructura:
-- Ingresos - Gastos Variables = Margen Bruto
-- Margen Bruto - Gastos Fijos - Amortizaciones = BAII
-- BAII - Intereses = BAI
-- BAI - Impuestos = Beneficio Neto

INSERT INTO detalle_estado_resultado (id_estado, concepto, descripcion, monto)
SELECT 
  ed.id_estado,
  CASE WHEN d.seq = 1 THEN 'ingreso_ventas'
       WHEN d.seq = 2 THEN 'gastos_variables'
       WHEN d.seq = 3 THEN 'margen_bruto'
       WHEN d.seq = 4 THEN 'gastos_fijos'
       WHEN d.seq = 5 THEN 'amortizaciones'
       WHEN d.seq = 6 THEN 'baii'
       WHEN d.seq = 7 THEN 'intereses'
       WHEN d.seq = 8 THEN 'bai'
       WHEN d.seq = 9 THEN 'impuestos'
       ELSE 'beneficio_neto' END,
  CASE WHEN d.seq = 1 THEN 'Ingresos por Ventas y Servicios'
       WHEN d.seq = 2 THEN 'Gastos Variables (Comisiones, Materiales)'
       WHEN d.seq = 3 THEN 'Margen Bruto'
       WHEN d.seq = 4 THEN 'Gastos Fijos (Sueldos, Renta, Servicios)'
       WHEN d.seq = 5 THEN 'Amortizaciones y Provisiones'
       WHEN d.seq = 6 THEN 'BAII (Beneficio Antes de Intereses e Impuestos)'
       WHEN d.seq = 7 THEN 'Intereses sobre Deudas'
       WHEN d.seq = 8 THEN 'BAI (Beneficio Antes de Impuestos)'
       WHEN d.seq = 9 THEN 'Impuestos (ISR 25%)'
       ELSE 'Beneficio Neto (Utilidad Disponible)' END,
  CASE WHEN d.seq = 1 THEN 3200000.00
       WHEN d.seq = 2 THEN -800000.00
       WHEN d.seq = 3 THEN 2400000.00
       WHEN d.seq = 4 THEN -950000.00
       WHEN d.seq = 5 THEN -150000.00
       WHEN d.seq = 6 THEN 1300000.00
       WHEN d.seq = 7 THEN -325000.00
       WHEN d.seq = 8 THEN 975000.00
       WHEN d.seq = 9 THEN -243750.00
       ELSE 731250.00 END
FROM estado_data ed,
     (SELECT 1 AS seq UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 
      UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10) d;
