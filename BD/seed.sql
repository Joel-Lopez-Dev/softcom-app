-- =========================================================================
-- SOFTCOM SOLUTIONS - Datos de Prueba
-- =========================================================================

-- Insertar roles
insert into rol (nombre_rol) values ('admin');           -- id_rol = 1
insert into rol (nombre_rol) values ('gerente_cartera'); -- id_rol = 2
insert into rol (nombre_rol) values ('analyst');         -- id_rol = 3

-- Insertar usuarios (con hashes de prueba - bcrypt: "password123")
insert into usuario (nombre, correo, password_hash, id_rol) values
('Carlos Montes', 'carlos@softcom.mx', '$2b$12$K1h.P5se9VrSevENkXvyLuEKHA8qlCvlQqMpEvh0iCm8CJD7/wvXq', 1),
('Sofía Ramírez', 'sofia@softcom.mx', '$2b$12$K1h.P5se9VrSevENkXvyLuEKHA8qlCvlQqMpEvh0iCm8CJD7/wvXq', 2),
('Diego López', 'diego@softcom.mx', '$2b$12$K1h.P5se9VrSevENkXvyLuEKHA8qlCvlQqMpEvh0iCm8CJD7/wvXq', 3);

-- Insertar empresas cliente
insert into empresa (nombre, rfc, direccion, telefono, correo) values
('Inversiones Globales SA', 'IGS130415AB9', 'Paseo de la Reforma 505, CDMX', '+52 55 1234 5678', 'contacto@inversiones.mx'),
('Fondos del Pacífico', 'FDP200820XYZ', 'Blvd. Abedúl 400, Monterrey', '+52 81 9876 5432', 'info@fondosdelpacif.mx'),
('Patrimonial Latinoamericano', 'PLT250615ABC', 'Carrera 7 1234, Bogotá', '+57 1 555 1234', 'contact@patrimonial.co');

-- Asignar usuarios a empresas con roles
insert into rol_empresa (id_empresa, id_usuario, rol_admin, rol_capturista, rol_financiero) values
(1, 1, true, true, true),     -- Carlos es admin en Inversiones Globales
(1, 2, true, true, true),     -- Sofía es gerente en Inversiones Globales
(2, 2, true, true, true),     -- Sofía es gerente en Fondos del Pacífico
(3, 3, false, false, true);   -- Diego es analyst en Patrimonial

-- Crear portafolios para cada empresa
insert into portafolio (id_empresa, saldo_efectivo, var_value, var_horizon_days, var_confidence) values
(1, 5000000.00, 125450.75, 1, 0.95),    -- Inversiones Globales
(2, 3500000.00, 87500.50, 1, 0.95),     -- Fondos del Pacífico
(3, 2000000.00, 50000.00, 1, 0.95);     -- Patrimonial

-- Insertar instrumentos: CETES
insert into instrumento (tipo, serie, valor_nominal, tasa, fecha_vencimiento, emisor, riesgo_credito) values
('cete', 'CETE170526', 10.00, 5.50, current_date + interval '28 days', 'Banco de México', 'AAA'),
('cete', 'CETE240626', 10.00, 5.25, current_date + interval '91 days', 'Banco de México', 'AAA'),
('cete', 'CETE351226', 10.00, 5.00, current_date + interval '182 days', 'Banco de México', 'AAA');

-- Insertar tabla bono para CETES (cupón cero)
insert into bono (id_instrumento, es_cupon_cero, dias_cupon, tasa_cupon_anual, es_tasa_variable) values
(1, true, null, null, false),
(2, true, null, null, false),
(3, true, null, null, false);

-- Insertar instrumentos: BONOS M
insert into instrumento (tipo, serie, valor_nominal, tasa, fecha_vencimiento, emisor, riesgo_credito) values
('bono_m', 'BONM240328', 100.00, 6.75, current_date + interval '182 days', 'Secretaría de Hacienda', 'AAA'),
('bono_m', 'BONM241215', 100.00, 6.50, current_date + interval '364 days', 'Secretaría de Hacienda', 'AAA');

-- Insertar tabla bono para BONOS M (182 días, tasa fija)
insert into bono (id_instrumento, es_cupon_cero, dias_cupon, tasa_cupon_anual, es_tasa_variable) values
(4, false, 182, 6.75, false),
(5, false, 182, 6.50, false);

-- Insertar instrumentos: UDIBONOS
insert into instrumento (tipo, serie, valor_nominal, tasa, fecha_vencimiento, emisor, riesgo_credito, protegido_inflacion) values
('udibono', 'UDEV250815', 100.00, 2.50, current_date + interval '450 days', 'Secretaría de Hacienda', 'AAA', true),
('udibono', 'UDEV260630', 100.00, 2.75, current_date + interval '730 days', 'Secretaría de Hacienda', 'AAA', true);

-- Insertar tabla bono para UDIBONOS (cupones cada 182 días, tasa fija)
insert into bono (id_instrumento, es_cupon_cero, dias_cupon, tasa_cupon_anual, es_tasa_variable) values
(6, false, 182, 2.50, false),
(7, false, 182, 2.75, false);

-- Insertar posiciones en portafolio
insert into posicion (id_portafolio, id_instrumento, cantidad, precio_promedio) values
(1, 1, 50000, 9.9850),      -- 50K CETES 28d @ $9.9850
(1, 4, 10000, 99.8500),     -- 10K Bonos M @ $99.85
(2, 2, 30000, 9.9700),      -- 30K CETES 91d @ $9.97
(2, 5, 7500, 99.5000),      -- 7.5K Bonos M @ $99.50
(3, 3, 20000, 9.9300),      -- 20K CETES 182d @ $9.93
(3, 6, 5000, 98.0000);      -- 5K UDIBONOS @ $98.00

-- Insertar transacciones
insert into transaccion (id_portafolio, id_instrumento, tipo_operacion, cantidad, monto_total, precio_sucio, fecha) values
(1, 1, 'compra', 50000, 499250.00, 9.985000, now() - interval '5 days'),
(1, 4, 'compra', 10000, 998500.00, 99.850000, now() - interval '3 days'),
(2, 2, 'compra', 30000, 299100.00, 9.970000, now() - interval '4 days'),
(3, 3, 'compra', 20000, 198600.00, 9.930000, now() - interval '6 days');

-- Insertar valuaciones (precios al día de hoy)
insert into valuacion (id_instrumento, precio_limpio, precio_sucio, interes_corrido, duration, duration_modificada, volatilidad, fecha) values
(1, 99.5000, 99.7250, 0.2250, 0.0769, 0.0765, 0.0025, now()),
(2, 99.4000, 99.6500, 0.2500, 0.2500, 0.2490, 0.0030, now()),
(3, 99.2000, 99.5000, 0.3000, 0.5000, 0.4980, 0.0035, now()),
(4, 99.8500, 100.0850, 0.2350, 0.2500, 0.2490, 0.0020, now()),
(5, 99.5000, 99.8100, 0.3100, 0.5000, 0.4980, 0.0025, now()),
(6, 98.0000, 98.2500, 0.2500, 0.6000, 0.5970, 0.0018, now()),
(7, 98.5000, 98.7800, 0.2800, 1.0000, 0.9950, 0.0022, now());

-- Insertar presupuestos
insert into presupuesto (id_empresa, categoria, monto_planeado, monto_ejecutado, periodo) values
(1, 'comisiones_bursatiles', 500000.00, 175000.50, '2026-05'),
(1, 'administracion', 250000.00, 85000.00, '2026-05'),
(2, 'comisiones_bursatiles', 300000.00, 95000.00, '2026-05'),
(3, 'investigacion_mercado', 150000.00, 45000.00, '2026-05');

-- Insertar bienes
insert into bien (nombre, tipo, descripcion) values
('Licencia Bloomberg Terminal', 'software', 'Suscripción anual para análisis de mercado'),
('Servidor dedicado', 'infraestructura', 'Servidor cloud para hosting de aplicaciones'),
('Capacitación especializada', 'servicio', 'Programa de entrenamiento en análisis financiero');

-- Insertar adquisiciones
insert into adquisicion (id_bien, id_presupuesto, monto_total, fecha, estado) values
(1, 1, 175000.00, current_date - interval '5 days', 'completada'),
(2, 2, 85000.00, current_date - interval '10 days', 'completada'),
(3, 3, 95000.00, current_date - interval '3 days', 'completada');

-- Insertar balance general (situación financiera reciente)
insert into balance_general (id_empresa, fecha, total_activos, total_pasivos, total_capital, inversiones_valores, pagos_pendientes) values
(1, current_date, 8500000.00, 2000000.00, 6500000.00, 5000000.00, 500000.00),
(2, current_date, 5200000.00, 1200000.00, 4000000.00, 3500000.00, 300000.00),
(3, current_date, 3500000.00, 800000.00, 2700000.00, 2000000.00, 200000.00);

-- Insertar estado de resultados
insert into estado_resultado (id_empresa, anio, periodo, ingreso_total, gasto_total, utilidad_neta) values
(1, 2026, 'Q1', 1500000.00, 850000.00, 650000.00),
(1, 2026, 'Q2-YTD', 3200000.00, 1800000.00, 1400000.00),
(2, 2026, 'Q1', 900000.00, 520000.00, 380000.00),
(3, 2026, 'Q1', 650000.00, 380000.00, 270000.00);

-- Insertar anualidades (ejemplos para cálculos)
insert into anualidad (id_empresa, tipo, importe, tasa, n_periodos, fecha_inicio, fecha_fin, valor_presente, valor_futuro) values
(1, 'ordinaria', 10000.00, 0.06, 12, current_date, current_date + interval '12 months', 105582.05, 143039.00),
(2, 'anticipada', 5000.00, 0.05, 24, current_date, current_date + interval '24 months', 108078.95, 160356.77);

-- Insertar cupones para BONOS M
insert into cupon (id_bono, fecha_pago, monto, pagado) values
(4, current_date + interval '182 days', 3375.00, false),  -- $100 × 6.75% ÷ 2
(4, current_date + interval '364 days', 3375.00, false),
(5, current_date + interval '182 days', 3250.00, false),  -- $100 × 6.50% ÷ 2
(5, current_date + interval '364 days', 3250.00, false);

-- Insertar inflación (datos históricos)
insert into inflacion (fecha, inpc, tasa_inflacion) values
(current_date - interval '90 days', 126.5000, 0.035),
(current_date - interval '60 days', 127.2000, 0.038),
(current_date - interval '30 days', 128.0000, 0.042),
(current_date, 128.8500, 0.045);

-- Insertar indicadores financieros
insert into indicador (id_empresa, fecha, rentabilidad_activos, rentabilidad_patrimonio, razon_solvencia, razon_liquidez, indice_endeudamiento, margen_utilidad) values
(1, current_date, 0.1765, 0.2154, 4.25, 2.50, 0.2353, 0.4375),
(2, current_date, 0.0731, 0.0950, 4.33, 2.80, 0.2308, 0.4222),
(3, current_date, 0.0771, 0.1000, 4.38, 3.00, 0.2286, 0.4154);

-- Insertar alertas
insert into alerta (id_empresa, id_usuario, tipo_alerta, estado_alerta, titulo, descripcion, metricas_afectadas) values
(1, 2, 'informativo', 'visto', 'Rebalanceo de portafolio recomendado', 'Se recomienda rebalancear posiciones debido a cambios en las tasas', 'duracion, volatilidad'),
(1, 2, 'advertencia', 'pendiente', 'VaR cerca del límite', 'El VaR ha aumentado 12% en los últimos 5 días', 'var_value'),
(2, 3, 'crítico', 'resuelto', 'Vencimiento próximo', 'CETES vencen en 3 días, requiere reinversión', 'posiciones'),
(3, 3, 'informativo', 'pendiente', 'Nuevo reporte disponible', 'Se ha generado el reporte trimestral de riesgos', 'reportes');
