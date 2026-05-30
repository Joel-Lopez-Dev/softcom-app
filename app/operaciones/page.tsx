"use client"

import { useState, useMemo, useEffect } from "react"
import {
  ShoppingCart, Banknote, CheckCircle, AlertTriangle,
  ChevronDown, ArrowRight, RotateCcw, Clock,
} from "lucide-react"
import { RouteGuard } from "@/components/route-guard"
import { PageHeader } from "@/components/page-header"

type Operacion = "compra" | "venta"
type Transaccion = {
  id_transaccion: number
  serie: string
  tipo_operacion: string
  cantidad: number
  precio_sucio: number | null
  monto_total: number
  created_at: string
}

// ── Mock instruments available ─────────────────────────────
const INSTRUMENTOS = [
  { id: 1,  label: "CETES 28d",        tipo: "CETES",  precioRef: 9.9123, vto: "2026-06-24" },
  { id: 2,  label: "CETES 91d",         tipo: "CETES",  precioRef: 9.8534, vto: "2026-08-26" },
  { id: 4,   label: "Bono M 7% 2031",    tipo: "BONO_M", precioRef: 97.20,  vto: "2031-06-05" },
  { id: 5,   label: "Bono M 8.5% 2029",  tipo: "BONO_M", precioRef: 99.80,  vto: "2029-12-05" },
]

const CLIENTES = [
  { id: "1", nombre: "Inversora del Norte SA",  saldo: 3_028_847.32 },
  { id: "2", nombre: "Fondo Bajío Capital",     saldo: 8_540_211.00 },
  { id: "3", nombre: "Corporativo Noreste SA",  saldo: 1_201_450.75 },
]

// ── Mock portfolio (venta only) ────────────────────────────
const POSICIONES_VENTA: Record<string, { instrId: number; cantidad: number }[]> = {
  "1": [
    { instrId: 1, cantidad: 1_000_000 },
    { instrId: 4,  cantidad: 20_000 },
    { instrId: 5,  cantidad: 5_000 },
  ],
  "2": [
    { instrId: 2, cantidad: 500_000 },
    { instrId: 4,  cantidad: 10_000 },
  ],
  "3": [
    { instrId: 1, cantidad: 200_000 },
  ],
}

// ── Helpers ────────────────────────────────────────────────
const fmtMXN = (n: number) =>
  new Intl.NumberFormat("es-MX", {
    style: "currency", currency: "MXN",
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  }).format(n)

const fmtInt = (n: number) => new Intl.NumberFormat("es-MX").format(n)

// ── Field component ────────────────────────────────────────
function Label({ children }: { children: React.ReactNode }) {
  return (
    <label style={{
      fontSize: 11, fontWeight: 700, letterSpacing: "0.07em",
      textTransform: "uppercase", color: "#64748b", display: "block", marginBottom: 6,
    }}>
      {children}
    </label>
  )
}

function SelectField({
  value, onChange, children, disabled = false,
}: { value: string; onChange: (v: string) => void; children: React.ReactNode; disabled?: boolean }) {
  return (
    <div style={{ position: "relative" }}>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
        style={{
          width: "100%", appearance: "none",
          padding: "10px 36px 10px 14px", borderRadius: 8,
          border: "1.5px solid #e2e8f0", background: disabled ? "#f8fafc" : "#fff",
          fontSize: 14, fontFamily: "'DM Sans', sans-serif",
          color: disabled ? "#94a3b8" : "#0b1629",
          cursor: disabled ? "not-allowed" : "pointer", outline: "none",
        }}
        onFocus={e => { if (!disabled) e.currentTarget.style.borderColor = "#00c2e0" }}
        onBlur={e => { e.currentTarget.style.borderColor = "#e2e8f0" }}
      >
        {children}
      </select>
      <ChevronDown size={14} color="#94a3b8" style={{
        position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none",
      }} />
    </div>
  )
}

function NumInput({
  id, value, onChange, suffix, min = "1", step = "1",
}: { id: string; value: string; onChange: (v: string) => void; suffix?: string; min?: string; step?: string }) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ position: "relative" }}>
      <input
        id={id} type="number" value={value} min={min} step={step}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: "100%", boxSizing: "border-box",
          padding: suffix ? "10px 52px 10px 14px" : "10px 14px",
          borderRadius: 8, outline: "none",
          border: `1.5px solid ${focused ? "#00c2e0" : "#e2e8f0"}`,
          fontSize: 15, fontFamily: "'IBM Plex Mono', monospace",
          color: "#0b1629", background: "#fff",
          transition: "border-color 0.15s",
          boxShadow: focused ? "0 0 0 3px rgba(0,194,224,0.1)" : "none",
        }}
      />
      {suffix && (
        <span style={{
          position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
          fontSize: 12, fontWeight: 600, color: "#94a3b8", pointerEvents: "none",
        }}>
          {suffix}
        </span>
      )}
    </div>
  )
}

// ── Operaciones content ────────────────────────────────────
function OperacionesContent() {
  const [op, setOp] = useState<Operacion>("compra")
  const [clienteId, setClienteId] = useState("1")
  const [instrId, setInstrId] = useState("")
  const [precio, setPrecio] = useState("")
  const [cantidad, setCantidad] = useState("")
  const [confirmed, setConfirmed] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [transacciones, setTransacciones] = useState<Transaccion[]>([])
  const [loadingTransacciones, setLoadingTransacciones] = useState(false)

  // Cargar transacciones al montar
  useEffect(() => {
    cargarTransacciones()
  }, [])

  const cargarTransacciones = async () => {
    try {
      setLoadingTransacciones(true)
      const res = await fetch("/api/transacciones?limit=50")
      const data = await res.json()
      if (data.success) {
        setTransacciones(data.data)
      }
    } catch (err) {
      console.error("Error cargando transacciones:", err)
    } finally {
      setLoadingTransacciones(false)
    }
  }

  const cliente = CLIENTES.find(c => c.id === clienteId)
  const instrumento = INSTRUMENTOS.find(i => i.id === instrId)
  const posicion = POSICIONES_VENTA[clienteId]?.find(p => p.instrId === instrId)

  // Auto-fill price when instrument is selected
  const handleInstrChange = (id: string) => {
    setInstrId(id)
    const instr = INSTRUMENTOS.find(i => i.id === id)
    if (instr) setPrecio(instr.precioRef.toFixed(4))
  }

  const total = useMemo(() => {
    const p = parseFloat(precio)
    const q = parseFloat(cantidad)
    if (!p || !q || isNaN(p) || isNaN(q)) return 0
    return p * q
  }, [precio, cantidad])

  const saldoPost = cliente ? cliente.saldo - (op === "compra" ? total : -total) : 0
  const isInsuficiente = op === "compra" && cliente && total > cliente.saldo
  const cantidadDisp = posicion?.cantidad ?? 0
  const excedeCantidad = op === "venta" && parseFloat(cantidad) > cantidadDisp

  const canSubmit = instrId && precio && cantidad &&
    parseFloat(cantidad) >= 1 && parseFloat(precio) > 0 && !excedeCantidad

  const handleConfirm = async () => {
    try {
      // Guardar transacción en BD
      // Nota: usando portafolio ID=1 por defecto para demostración
      const res = await fetch("/api/transacciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_portafolio: 1,
          id_instrumento: parseInt(instrId),
          tipo_operacion: op,
          cantidad: parseInt(cantidad),
          precio_sucio: parseFloat(precio),
          monto_total: parseFloat(precio) * parseInt(cantidad),
        }),
      })

      const data = await res.json()

      if (data.success) {
        setShowConfirm(false)
        setConfirmed(true)
        // Reset form
        setInstrId("")
        setPrecio("")
        setCantidad("")
        // Recargar transacciones
        await cargarTransacciones()
        setTimeout(() => setConfirmed(false), 4000)
      }
    } catch (err) {
      console.error("Error guardando transacción:", err)
      setShowConfirm(false)
    }
  }

  // Available instruments for venta (only those in portfolio)
  const instrVenta = op === "venta"
    ? INSTRUMENTOS.filter(i => POSICIONES_VENTA[clienteId]?.some(p => p.instrId === i.id))
    : INSTRUMENTOS

  const opColor = op === "compra" ? "#22c55e" : "#ef4444"
  const opLabel = op === "compra" ? "Compra" : "Venta"

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg,#f0f4f8 0%,#e8eef5 100%)" }}>
      <PageHeader
        title="Compra / Venta de instrumentos"
        tag="Registro de operaciones"
        description="Ejecuta operaciones con trazabilidad completa. El log es inmutable una vez confirmado."
        crumbs={[
          { label: "Inicio", href: "/dashboard" },
          { label: "Operaciones" },
        ]}
      />

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px 48px" }}>

        {/* Success toast */}
        {confirmed && (
          <div className="anim-scale-in" style={{
            display: "flex", alignItems: "center", gap: 12,
            background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)",
            borderRadius: 12, padding: "16px 20px", marginBottom: 20,
          }}>
            <CheckCircle size={20} color="#22c55e" />
            <div>
              <p style={{ margin: 0, fontWeight: 700, color: "#0b1629", fontSize: 14 }}>
                Operación registrada exitosamente
              </p>
              <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>
                El log de trazabilidad ha sido actualizado. El portafolio refleja los cambios.
              </p>
            </div>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20, alignItems: "start" }}>

          {/* ── Form ── */}
          <div style={{
            background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0",
            overflow: "hidden",
          }}>
            {/* Tab switcher */}
            <div style={{
              display: "flex", borderBottom: "1px solid #f1f5f9", background: "#f8fafc",
            }}>
              {(["compra", "venta"] as const).map(t => (
                <button
                  key={t}
                  onClick={() => { setOp(t); setInstrId(""); setPrecio(""); setCantidad("") }}
                  style={{
                    flex: 1, padding: "14px 0", border: "none",
                    cursor: "pointer", fontWeight: 700, fontSize: 14,
                    transition: "all 0.15s",
                    background: op === t
                      ? (t === "compra" ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)")
                      : "transparent",
                    color: op === t
                      ? (t === "compra" ? "#22c55e" : "#ef4444")
                      : "#94a3b8",
                    borderBottom: op === t
                      ? `2px solid ${t === "compra" ? "#22c55e" : "#ef4444"}`
                      : "2px solid transparent",
                  }}
                >
                  {t === "compra" ? "Compra" : "Venta"}
                </button>
              ))}
            </div>

            <div style={{ padding: "24px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

                {/* Cliente */}
                <div>
                  <Label>Empresa cliente</Label>
                  <SelectField value={clienteId} onChange={v => { setClienteId(v); setInstrId(""); setPrecio(""); setCantidad("") }}>
                    {CLIENTES.map(c => (
                      <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                  </SelectField>
                  {cliente && (
                    <p style={{ margin: "5px 0 0", fontSize: 12, color: "#64748b" }}>
                      Saldo disponible:{" "}
                      <span className="sc-number" style={{ fontWeight: 600, color: "#0b1629" }}>
                        {fmtMXN(cliente.saldo)}
                      </span>
                    </p>
                  )}
                </div>

                {/* Instrumento */}
                <div>
                  <Label>Instrumento</Label>
                  <SelectField value={instrId} onChange={handleInstrChange}>
                    <option value="" disabled>— Selecciona un instrumento —</option>
                    {instrVenta.map(i => (
                      <option key={i.id} value={i.id}>{i.label}</option>
                    ))}
                  </SelectField>
                  {instrumento && (
                    <div style={{ display: "flex", gap: 12, marginTop: 6, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 12, color: "#94a3b8" }}>
                        Tipo: <strong style={{ color: "#00c2e0" }}>{instrumento.tipo}</strong>
                      </span>
                      <span style={{ fontSize: 12, color: "#94a3b8" }}>
                        Vto: <strong style={{ color: "#0b1629" }}>{instrumento.vto}</strong>
                      </span>
                      {op === "venta" && posicion && (
                        <span style={{ fontSize: 12, color: "#94a3b8" }}>
                          En portafolio:{" "}
                          <strong className="sc-number" style={{ color: "#0b1629" }}>
                            {fmtInt(posicion.cantidad)} títulos
                          </strong>
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Precio + Cantidad */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div>
                    <Label>Precio unitario</Label>
                    <NumInput
                      id="precio" value={precio} onChange={setPrecio}
                      suffix="MXN" step="0.0001" min="0.0001"
                    />
                    {instrumento && (
                      <p style={{ margin: "5px 0 0", fontSize: 12, color: "#94a3b8" }}>
                        Ref. valuación:{" "}
                        <span className="sc-number" style={{ color: "#00c2e0" }}>
                          ${instrumento.precioRef.toFixed(4)}
                        </span>
                      </p>
                    )}
                  </div>
                  <div>
                    <Label>{op === "venta" ? "Cantidad a vender" : "Cantidad a comprar"}</Label>
                    <NumInput id="cantidad" value={cantidad} onChange={setCantidad} />
                    {excedeCantidad && (
                      <p style={{ margin: "5px 0 0", fontSize: 12, color: "#ef4444", fontWeight: 600 }}>
                        ⚠ Máximo: {fmtInt(cantidadDisp)} títulos
                      </p>
                    )}
                  </div>
                </div>

                {/* Warnings */}
                {isInsuficiente && (
                  <div style={{
                    display: "flex", gap: 8, padding: "12px 14px",
                    background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)",
                    borderRadius: 8,
                  }}>
                    <AlertTriangle size={14} color="#ef4444" style={{ flexShrink: 0, marginTop: 1 }} />
                    <p style={{ margin: 0, fontSize: 13, color: "#ef4444" }}>
                      El importe supera el saldo disponible. La operación se registrará con flag{" "}
                      <strong>saldo_insuficiente: true</strong>.
                    </p>
                  </div>
                )}

                {/* Submit */}
                <button
                  disabled={!canSubmit}
                  onClick={() => setShowConfirm(true)}
                  style={{
                    padding: "13px 0", borderRadius: 10, border: "none",
                    fontSize: 14, fontWeight: 700, cursor: canSubmit ? "pointer" : "not-allowed",
                    background: canSubmit
                      ? op === "compra"
                        ? "linear-gradient(135deg,#22c55e,#16a34a)"
                        : "linear-gradient(135deg,#ef4444,#dc2626)"
                      : "#e2e8f0",
                    color: canSubmit ? "#fff" : "#94a3b8",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    transition: "all 0.15s",
                    boxShadow: canSubmit
                      ? `0 4px 16px ${op === "compra" ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`
                      : "none",
                  }}
                >
                  {op === "compra" ? <ShoppingCart size={16} /> : <Banknote size={16} />}
                  {canSubmit ? `Confirmar ${opLabel}` : `Completa los campos para ${opLabel}`}
                </button>
              </div>
            </div>
          </div>

          {/* ── Trade Ticket (right panel) ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Live summary */}
            <div className="sc-result-panel" style={{ padding: "22px 20px" }}>
              <div style={{ position: "relative", zIndex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
                  <span style={{
                    fontSize: 10, fontWeight: 700, letterSpacing: "0.1em",
                    textTransform: "uppercase", color: "#00c2e0",
                  }}>
                    Ticket de operación
                  </span>
                </div>

                {/* Op type badge */}
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  background: op === "compra" ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
                  border: `1px solid ${op === "compra" ? "rgba(34,197,94,0.35)" : "rgba(239,68,68,0.35)"}`,
                  borderRadius: 20, padding: "3px 12px", marginBottom: 16,
                }}>
                  {op === "compra" ? <ShoppingCart size={11} color="#22c55e" /> : <Banknote size={11} color="#ef4444" />}
                  <span style={{
                    fontSize: 11, fontWeight: 700,
                    color: op === "compra" ? "#22c55e" : "#ef4444",
                    letterSpacing: "0.06em", textTransform: "uppercase",
                  }}>
                    {opLabel}
                  </span>
                </div>

                {/* Rows */}
                {[
                  { label: "Cliente", value: cliente?.nombre ?? "—", mono: false },
                  { label: "Instrumento", value: instrumento?.label ?? "—", mono: false },
                  { label: "Tipo", value: instrumento?.tipo ?? "—", mono: false },
                  { label: "Precio unitario", value: precio ? `$${parseFloat(precio).toFixed(4)}` : "—", mono: true },
                  { label: "Cantidad", value: cantidad ? fmtInt(parseInt(cantidad)) : "—", mono: true },
                ].map(({ label, value, mono }) => (
                  <div key={label} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "baseline",
                    padding: "7px 0", borderBottom: "1px solid rgba(255,255,255,0.06)",
                  }}>
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>{label}</span>
                    <span style={{
                      fontSize: 13, color: "rgba(255,255,255,0.85)",
                      fontFamily: mono ? "'IBM Plex Mono', monospace" : "'DM Sans', sans-serif",
                      fontWeight: 600, textAlign: "right", maxWidth: 160,
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                      {value}
                    </span>
                  </div>
                ))}

                {/* Total */}
                <div style={{
                  marginTop: 14, padding: "14px 16px",
                  background: "rgba(0,194,224,0.08)", border: "1px solid rgba(0,194,224,0.2)",
                  borderRadius: 10,
                }}>
                  <p style={{ margin: "0 0 3px", fontSize: 11, color: "rgba(255,255,255,0.5)", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                    Importe total
                  </p>
                  <p className="sc-price-lg" style={{ color: total > 0 ? "#00c2e0" : "rgba(255,255,255,0.3)", margin: 0 }}>
                    {total > 0 ? fmtMXN(total) : "—"}
                  </p>
                </div>

                {/* Saldo post */}
                {cliente && total > 0 && (
                  <div style={{ marginTop: 10, padding: "10px 14px", borderRadius: 8, background: "rgba(255,255,255,0.04)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Saldo post-op</span>
                      <span className="sc-number" style={{
                        fontSize: 13, fontWeight: 600,
                        color: saldoPost < 0 ? "#ef4444" : "#22c55e",
                      }}>
                        {fmtMXN(Math.abs(saldoPost))}{saldoPost < 0 ? " (déficit)" : ""}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Log note */}
            <div style={{
              background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0",
              padding: "14px 16px",
              display: "flex", gap: 10, alignItems: "flex-start",
            }}>
              <Clock size={13} color="#94a3b8" style={{ marginTop: 2, flexShrink: 0 }} />
              <p style={{ margin: 0, fontSize: 12, color: "#64748b", lineHeight: 1.5 }}>
                Las operaciones se registran con <strong>timestamp UTC</strong> e ID único. El log es
                inmutable — no puede editarse ni eliminarse desde la plataforma.
              </p>
            </div>
          </div>
        </div>

        {/* ── Recent ops placeholder ── */}
        <div style={{
          marginTop: 24, background: "#fff", borderRadius: 14,
          border: "1px solid #e2e8f0", overflow: "hidden",
        }}>
          <div style={{ padding: "18px 22px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p className="sc-display-font" style={{ fontSize: 14, fontWeight: 700, color: "#0b1629", margin: 0 }}>
                Últimas operaciones
              </p>
              <p style={{ fontSize: 12, color: "#94a3b8", margin: "2px 0 0" }}>Log trazable e inmutable</p>
            </div>
          </div>
          <div style={{ padding: "20px 22px" }}>
            {loadingTransacciones ? (
              <p style={{ color: "#94a3b8", fontSize: 14, textAlign: "center" }}>Cargando...</p>
            ) : transacciones.length === 0 ? (
              <p style={{ color: "#94a3b8", fontSize: 14, textAlign: "center" }}>
                Las operaciones confirmadas aparecerán aquí con su timestamp y ID de trazabilidad.
              </p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <th style={{ textAlign: "left", padding: "10px 0", fontWeight: 700, color: "#64748b" }}>Fecha</th>
                      <th style={{ textAlign: "left", padding: "10px 0", fontWeight: 700, color: "#64748b" }}>Instrumento</th>
                      <th style={{ textAlign: "center", padding: "10px 0", fontWeight: 700, color: "#64748b" }}>Tipo</th>
                      <th style={{ textAlign: "right", padding: "10px 0", fontWeight: 700, color: "#64748b" }}>Cantidad</th>
                      <th style={{ textAlign: "right", padding: "10px 0", fontWeight: 700, color: "#64748b" }}>Precio Unit.</th>
                      <th style={{ textAlign: "right", padding: "10px 0", fontWeight: 700, color: "#64748b" }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transacciones.map((t) => (
                      <tr key={t.id_transaccion} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "12px 0", color: "#0b1629", fontSize: 12 }}>
                          {new Date(t.created_at).toLocaleDateString("es-MX", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td style={{ padding: "12px 0", color: "#0b1629", fontWeight: 600 }}>
                          {t.serie || "—"}
                        </td>
                        <td style={{
                          padding: "12px 0", textAlign: "center",
                          color: t.tipo_operacion === "compra" ? "#22c55e" : "#ef4444",
                          fontWeight: 700,
                        }}>
                          {t.tipo_operacion === "compra" ? "Compra" : "Venta"}
                        </td>
                        <td style={{ padding: "12px 0", color: "#0b1629", textAlign: "right" }}>
                          {fmtInt(t.cantidad)}
                        </td>
                        <td style={{ padding: "12px 0", color: "#0b1629", textAlign: "right" }}>
                          ${t.precio_sucio ? parseFloat(String(t.precio_sucio)).toFixed(4) : "—"}
                        </td>
                        <td style={{ padding: "12px 0", color: "#0b1629", textAlign: "right", fontWeight: 600 }}>
                          {fmtMXN(t.monto_total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Confirmation modal ── */}
      {showConfirm && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 1000,
          background: "rgba(11,22,41,0.7)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
        }}>
          <div className="anim-scale-in" style={{
            background: "#fff", borderRadius: 20, padding: "32px",
            maxWidth: 440, width: "100%",
            boxShadow: "0 32px 80px rgba(0,0,0,0.25)",
          }}>
            <div style={{
              width: 52, height: 52, borderRadius: 14, marginBottom: 20,
              background: op === "compra" ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {op === "compra"
                ? <ShoppingCart size={22} color="#22c55e" />
                : <Banknote size={22} color="#ef4444" />
              }
            </div>

            <h2 className="sc-display-font" style={{ fontSize: 20, fontWeight: 800, color: "#0b1629", marginBottom: 6 }}>
              Confirmar {opLabel}
            </h2>
            <p style={{ fontSize: 14, color: "#64748b", marginBottom: 24 }}>
              Esta acción registrará la operación de forma inmutable en el log del sistema.
            </p>

            <div style={{ background: "#f8fafc", borderRadius: 12, padding: "16px", marginBottom: 20 }}>
              {[
                ["Cliente", cliente?.nombre ?? "—"],
                ["Instrumento", instrumento?.label ?? "—"],
                ["Precio unitario", precio ? `$${parseFloat(precio).toFixed(4)} MXN` : "—"],
                ["Cantidad", cantidad ? fmtInt(parseInt(cantidad)) : "—"],
                ["Importe total", fmtMXN(total)],
              ].map(([label, value]) => (
                <div key={label} style={{
                  display: "flex", justifyContent: "space-between", padding: "6px 0",
                  borderBottom: "1px solid #e2e8f0",
                }}>
                  <span style={{ fontSize: 13, color: "#64748b" }}>{label}</span>
                  <span className="sc-number" style={{ fontSize: 13, fontWeight: 600, color: "#0b1629" }}>{value}</span>
                </div>
              ))}
            </div>

            {isInsuficiente && (
              <div style={{
                display: "flex", gap: 8, padding: "10px 14px", marginBottom: 16,
                background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)",
                borderRadius: 8,
              }}>
                <AlertTriangle size={14} color="#ef4444" style={{ flexShrink: 0, marginTop: 1 }} />
                <p style={{ margin: 0, fontSize: 12, color: "#ef4444" }}>
                  Saldo insuficiente. Se registrará con flag <strong>saldo_insuficiente: true</strong>.
                </p>
              </div>
            )}

            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setShowConfirm(false)}
                style={{
                  flex: 1, padding: "12px 0", borderRadius: 9,
                  border: "1.5px solid #e2e8f0", background: "#fff",
                  fontSize: 14, fontWeight: 600, color: "#64748b", cursor: "pointer",
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirm}
                style={{
                  flex: 1, padding: "12px 0", borderRadius: 9, border: "none",
                  background: op === "compra"
                    ? "linear-gradient(135deg,#22c55e,#16a34a)"
                    : "linear-gradient(135deg,#ef4444,#dc2626)",
                  color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                  boxShadow: `0 4px 16px ${op === "compra" ? "rgba(34,197,94,0.35)" : "rgba(239,68,68,0.35)"}`,
                }}
              >
                <CheckCircle size={15} />
                Confirmar {opLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function OperacionesPage() {
  return (
    <RouteGuard allowedRoles={["gerente_cartera"]}>
      <OperacionesContent />
    </RouteGuard>
  )
}
