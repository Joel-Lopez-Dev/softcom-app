/**
 * Biblioteca de cálculos financieros para SoftCom
 * Incluye: CETES, Bonos M, Anualidades, Duration, Valuaciones
 */

// ============================================================================
// CETES (Certificados de la Tesorería de la Federación)
// ============================================================================

interface CalcCETERequest {
  /** Valor nominal ($10 para CETES) */
  F: number;
  /** Tasa de rendimiento anual (% ej: 5.5) */
  r: number;
  /** Plazo en días (28, 91, 182, 364) */
  N: number;
  /** Cantidad de títulos a comprar */
  cantidad: number;
}

interface CalcCETEResult {
  precioLimpio: number;
  precioSucio: number;
  rendimientoTotal: number;
  montoTotal: number;
  ganancia: number;
  rendimientoAnualizado: number;
  descuentoImplicito: number;
}

/**
 * Calcula el precio y rendimiento de un CETE
 * Fórmula: P = F / (1 + r × N/360)
 */
export function calcularCETE(req: CalcCETERequest): CalcCETEResult {
  const { F, r, N, cantidad } = req;

  // Convertir porcentaje a decimal
  const rDecimal = r / 100;

  // Precio limpio (cupón cero, sin interés corrido)
  const precioLimpio = F / (1 + rDecimal * (N / 360));

  // Precio sucio = precio limpio (en CETES no hay interés corrido)
  const precioSucio = precioLimpio;

  // Descuento implícito
  const descuentoImplicito = F - precioLimpio;

  // Rendimiento total por título
  const rendimientoTotal = descuentoImplicito;

  // Monto total de inversión
  const montoTotal = precioLimpio * cantidad;

  // Ganancia total
  const ganancia = descuentoImplicito * cantidad;

  // Rendimiento anualizado (% por año)
  const rendimientoAnualizado = (descuentoImplicito / precioLimpio) * (360 / N) * 100;

  return {
    precioLimpio: Math.round(precioLimpio * 10000) / 10000,
    precioSucio: Math.round(precioSucio * 10000) / 10000,
    rendimientoTotal: Math.round(rendimientoTotal * 10000) / 10000,
    montoTotal: Math.round(montoTotal * 100) / 100,
    ganancia: Math.round(ganancia * 100) / 100,
    rendimientoAnualizado: Math.round(rendimientoAnualizado * 100) / 100,
    descuentoImplicito: Math.round(descuentoImplicito * 10000) / 10000,
  };
}

// ============================================================================
// BONOS M (Bonos Ordinarios de la Federación a Plazo Determinado)
// ============================================================================

interface CalcBonoMRequest {
  /** Valor nominal ($100 para Bonos M) */
  F: number;
  /** Tasa cupón anual fija (% ej: 6.75) */
  tasaCupon: number;
  /** Tasa de rendimiento requerida (% ej: 5.50) */
  r: number;
  /** Plazo en días hasta vencimiento (182, 364) */
  N: number;
  /** Cantidad de bonos a comprar */
  cantidad: number;
}

interface CalcBonoMResult {
  precioLimpio: number;
  precioSucio: number;
  valorPresente: number;
  montoTotal: number;
  flujosCaja: number[];
  duration: number;
  durationModificada: number;
  rendimientoEfectivo: number;
  spreadConTasa: number;
}

/**
 * Calcula el precio y análisis de un Bono M
 * Fórmula: P = Σ(C / (1 + r/2)^t) + VN / (1 + r/2)^n
 * Donde: C = cupón semestral = F × tasaCupon / 2
 */
export function calcularBonoM(req: CalcBonoMRequest): CalcBonoMResult {
  const { F, tasaCupon, r, N, cantidad } = req;

  // Convertir porcentajes a decimales
  const tasaCuponDecimal = tasaCupon / 100;
  const rDecimal = r / 100;

  // Cupón semestral
  const cupornSemestral = F * (tasaCuponDecimal / 2);

  // Número de períodos semestrales
  const nPeriodos = Math.ceil(N / 182);

  // Construir flujos de caja
  const flujosCaja: number[] = [];
  let valorPresente = 0;
  let sumaWt = 0; // Para duration

  for (let t = 1; t <= nPeriodos; t++) {
    const tasaDesctoPeriodo = rDecimal / 2;
    const factor = Math.pow(1 + tasaDesctoPeriodo, t);

    // Flujo de cupón (o cupón final + valor nominal en el último período)
    let flujo = cupornSemestral;
    if (t === nPeriodos) {
      flujo += F; // Cupón final + devolución de principal
    }

    flujosCaja.push(flujo);

    // Valor presente del flujo
    const vpFlujo = flujo / factor;
    valorPresente += vpFlujo;

    // Acumular para duration (t × peso del flujo)
    sumaWt += t * vpFlujo;
  }

  const precioLimpio = valorPresente;

  // Interés corrido (desde el último cupón)
  // Asumimos que el cupón se acaba de pagar (simplificación)
  const interesCorrido = 0;

  const precioSucio = precioLimpio + interesCorrido;

  // Duration (vencimiento promedio ponderado)
  const duration = sumaWt / precioLimpio;

  // Duration modificada = Duration / (1 + y/2)
  const durationModificada = duration / (1 + rDecimal / 2);

  // Rendimiento efectivo anualizado
  const rendimientoEfectivo = rDecimal * 100;

  // Spread con la tasa (diferencia entre tasa requerida y tasa cupón)
  const spreadConTasa = (r - tasaCupon);

  // Monto total de inversión
  const montoTotal = precioSucio * cantidad;

  return {
    precioLimpio: Math.round(precioLimpio * 10000) / 10000,
    precioSucio: Math.round(precioSucio * 10000) / 10000,
    valorPresente: Math.round(valorPresente * 10000) / 10000,
    montoTotal: Math.round(montoTotal * 100) / 100,
    flujosCaja: flujosCaja.map(f => Math.round(f * 100) / 100),
    duration: Math.round(duration * 10000) / 10000,
    durationModificada: Math.round(durationModificada * 10000) / 10000,
    rendimientoEfectivo: Math.round(rendimientoEfectivo * 100) / 100,
    spreadConTasa: Math.round(spreadConTasa * 100) / 100,
  };
}

// ============================================================================
// ANUALIDADES (Ordinaria, Anticipada, Diferida)
// ============================================================================

interface CalcAnualidadRequest {
  /** Tipo: 'ordinaria' | 'anticipada' | 'diferida' */
  tipo: "ordinaria" | "anticipada" | "diferida";
  /** Importe de cada pago */
  A: number;
  /** Tasa de interés periódica (% ej: 6) */
  i: number;
  /** Número de períodos */
  n: number;
  /** Períodos de diferimiento (solo para 'diferida') */
  d?: number;
}

interface CalcAnualidadResult {
  valorPresente: number;
  valorFuturo: number;
  pagoTotal: number;
  factorVP: number;
  factorVF: number;
  tipo: string;
}

/**
 * Calcula Valor Presente y Valor Futuro de anualidades
 * Ordinaria: VP = A × [(1 - (1+i)^-n) / i]
 * Anticipada: VP = A × [(1 - (1+i)^-n) / i] × (1 + i)
 * Diferida: VP = A × [(1 - (1+i)^-n) / i] × (1 + i)^-d
 */
export function calcularAnualidad(req: CalcAnualidadRequest): CalcAnualidadResult {
  const { tipo, A, i, n, d = 0 } = req;

  // Convertir porcentaje a decimal
  const iDecimal = i / 100;

  // Factor para VP (anualidad ordinaria)
  const factorVP = (1 - Math.pow(1 + iDecimal, -n)) / iDecimal;

  // Factor para VF (anualidad ordinaria)
  const factorVF = (Math.pow(1 + iDecimal, n) - 1) / iDecimal;

  let valorPresente = A * factorVP;
  let valorFuturo = A * factorVF;

  // Ajustar según tipo
  if (tipo === "anticipada") {
    // La anualidad comienza hoy, no en el próximo período
    valorPresente *= 1 + iDecimal;
    valorFuturo *= 1 + iDecimal;
  } else if (tipo === "diferida") {
    // La anualidad comienza en d períodos
    valorPresente /= Math.pow(1 + iDecimal, d);
    // El VF no se afecta por el diferimiento
  }

  const pagoTotal = A * n;

  return {
    valorPresente: Math.round(valorPresente * 100) / 100,
    valorFuturo: Math.round(valorFuturo * 100) / 100,
    pagoTotal: Math.round(pagoTotal * 100) / 100,
    factorVP: Math.round(factorVP * 10000) / 10000,
    factorVF: Math.round(factorVF * 10000) / 10000,
    tipo,
  };
}

// ============================================================================
// PRECIO SUCIO (Dirty Price) - Incluye interés corrido
// ============================================================================

interface CalcPrecioSucioRequest {
  /** Precio limpio (clean price) */
  precioLimpio: number;
  /** Días transcurridos desde el último cupón */
  diasDesdeUltimoCupon: number;
  /** Días totales del período de cupón */
  diasPeriodoCupon: number;
  /** Monto del cupón periódico */
  montoCupon: number;
}

interface CalcPrecioSucioResult {
  interesCorrido: number;
  precioSucio: number;
  accrualRatio: number;
}

/**
 * Calcula Precio Sucio = Precio Limpio + Interés Corrido
 * Interés Corrido = Cupón × (Días Transcurridos / Días del Período)
 */
export function calcularPrecioSucio(
  req: CalcPrecioSucioRequest
): CalcPrecioSucioResult {
  const {
    precioLimpio,
    diasDesdeUltimoCupon,
    diasPeriodoCupon,
    montoCupon,
  } = req;

  // Accrual ratio (fracción del período)
  const accrualRatio = diasDesdeUltimoCupon / diasPeriodoCupon;

  // Interés corrido
  const interesCorrido = montoCupon * accrualRatio;

  // Precio sucio
  const precioSucio = precioLimpio + interesCorrido;

  return {
    interesCorrido: Math.round(interesCorrido * 10000) / 10000,
    precioSucio: Math.round(precioSucio * 10000) / 10000,
    accrualRatio: Math.round(accrualRatio * 10000) / 10000,
  };
}

// ============================================================================
// UTILIDADES DE CONVERSIÓN Y FORMATO
// ============================================================================

/**
 * Formatea número con separador de miles
 */
export function formatMoney(value: number, decimals = 2): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Formatea porcentaje
 */
export function formatPercent(value: number, decimals = 2): string {
  return `${(Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals)).toFixed(decimals)}%`;
}

/**
 * Valida que días sea un valor permitido para CETES
 */
export function validarDiasCETE(dias: number): boolean {
  return [28, 91, 182, 364].includes(dias);
}

/**
 * Valida que la tasa esté en rango razonable (0 - 50%)
 */
export function validarTasa(tasa: number): boolean {
  return tasa >= 0 && tasa <= 50;
}

/**
 * Valida que cantidad sea positiva
 */
export function validarCantidad(cantidad: number): boolean {
  return cantidad > 0 && Number.isInteger(cantidad);
}
