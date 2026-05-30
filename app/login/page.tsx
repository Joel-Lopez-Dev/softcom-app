"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { TrendingUp, Shield, PieChart, ArrowRight, Lock } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { getMockUser, useAuth } from "@/lib/auth-context"

const MOCK_ACCOUNTS = [
  { email: "admin@softcom.mx", nombre: "Carlos Admin", role: "admin", desc: "Administrador del Sistema" },
  { email: "gerente@softcom.mx", nombre: "Sofía Gerente", role: "gerente_cartera", desc: "Gerente de Cartera" },
  { email: "analyst@softcom.mx", nombre: "Diego Analyst", role: "analyst", desc: "Analista de Inversiones" },
]

export default function LoginPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [selectedEmail, setSelectedEmail] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) router.push("/dashboard")
  }, [user, router])

  const handleLogin = async (email: string) => {
    setLoading(true)
    setSelectedEmail(email)
    const mockUser = getMockUser(email)
    if (mockUser) {
      localStorage.setItem("softcom_user", JSON.stringify(mockUser))
      // Disparar evento storage manualmente
      window.dispatchEvent(new StorageEvent("storage", {
        key: "softcom_user",
        newValue: JSON.stringify(mockUser),
        storageArea: localStorage,
      }))
      // Pequeño delay para simular autenticación
      await new Promise(resolve => setTimeout(resolve, 600))
      router.push("/dashboard")
    } else {
      setLoading(false)
    }
  }

  const features = [
    { icon: TrendingUp, label: "Valuación de bonos en tiempo real" },
    { icon: PieChart, label: "Análisis de portafolio personalizado" },
    { icon: Shield, label: "Acceso seguro con roles diferenciados" },
  ]

  return (
    <div style={{ minHeight: "100vh", display: "flex", fontFamily: "'Inter','Geist',sans-serif" }}>

      {/* ── LEFT PANEL (navy) ── */}
      <div className="hidden lg:flex anim-slide-l" style={{
        flex: "0 0 48%", background: "linear-gradient(160deg, #0b1629 0%, #0d2347 55%, #0a1f3d 100%)",
        position: "relative", overflow: "hidden",
        flexDirection: "column", justifyContent: "center", padding: "60px 56px",
      }}>
        <div style={{
          position: "absolute", inset: 0, opacity: 0.05,
          backgroundImage: "linear-gradient(rgba(0,194,224,1) 1px, transparent 1px), linear-gradient(90deg,rgba(0,194,224,1) 1px,transparent 1px)",
          backgroundSize: "50px 50px",
        }} />
        <div style={{ position: "absolute", top: "30%", right: "-10%", width: 360, height: 360, borderRadius: "50%", background: "radial-gradient(circle,rgba(0,194,224,0.1) 0%,transparent 70%)", pointerEvents: "none" }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          <div className="anim-fade-up" style={{ marginBottom: 56 }}>
            <Image
              src="/SOFTCOM_LOGO.png"
              alt="SOFTCOM Solutions"
              width={220}
              height={66}
              style={{ objectFit: "contain", height: 60, width: "auto" }}
              priority
            />
          </div>

          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(0,194,224,0.1)", border: "1px solid rgba(0,194,224,0.25)",
            borderRadius: 20, padding: "5px 14px", marginBottom: 24,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#00c2e0" }} />
            <span style={{ color: "#00c2e0", fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" }}>Plataforma Institucional</span>
          </div>

          <h1 className="anim-fade-up delay-2" style={{ color: "#fff", fontSize: 38, fontWeight: 800, lineHeight: 1.2, marginBottom: 16, letterSpacing: -0.5 }}>
            Gestión financiera<br />de alto nivel
          </h1>
          <p className="anim-fade-up delay-3" style={{ color: "rgba(255,255,255,0.6)", fontSize: 16, lineHeight: 1.7, marginBottom: 48, maxWidth: 380 }}>
            Accede a herramientas profesionales para valuación de bonos, análisis de portafolios y registro de operaciones.
          </p>

          <div className="anim-fade-up delay-4" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {features.map((f, i) => {
              const Icon = f.icon
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 9,
                    background: "rgba(0,194,224,0.12)", border: "1px solid rgba(0,194,224,0.2)",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>
                    <Icon size={17} color="#00c2e0" />
                  </div>
                  <span style={{ color: "rgba(255,255,255,0.8)", fontSize: 14 }}>{f.label}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div style={{
        flex: 1, background: "#f0f4f8",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        padding: "40px 24px",
      }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 40 }} className="lg:hidden">
          <Image
            src="/SOFTCOM_LOGO.png"
            alt="SOFTCOM Solutions"
            width={180}
            height={54}
            style={{ objectFit: "contain", height: 48, width: "auto" }}
          />
        </div>

        <div className="anim-scale-in" style={{ width: "100%", maxWidth: 480 }}>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: "#0b1629", marginBottom: 6 }}>Iniciar sesión</h2>
          <p style={{ color: "#64748b", fontSize: 14, marginBottom: 28 }}>Selecciona una cuenta de demostración para acceder a SoftCom.</p>

          <div style={{
            background: "#fff",
            borderRadius: 12,
            border: "1.5px solid #e2e8f0",
            padding: "24px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
            display: "flex", flexDirection: "column", gap: 12,
          }}>
            {MOCK_ACCOUNTS.map((account) => (
              <button
                key={account.email}
                onClick={() => handleLogin(account.email)}
                disabled={loading}
                style={{
                  display: "flex", alignItems: "center", gap: 14,
                  width: "100%", padding: "14px 16px",
                  background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: 8,
                  cursor: loading ? "not-allowed" : "pointer",
                  transition: "all 0.15s",
                  opacity: loading && selectedEmail !== account.email ? 0.5 : 1,
                }}
                onMouseEnter={e => {
                  if (!loading) {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "#00c2e0"
                    ;(e.currentTarget as HTMLButtonElement).style.background = "rgba(0,194,224,0.04)"
                  }
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "#e2e8f0"
                  ;(e.currentTarget as HTMLButtonElement).style.background = "#f8fafc"
                }}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: 9,
                  background: "linear-gradient(135deg, #00c2e0, #1a3a6b)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, color: "#fff", fontWeight: 700, fontSize: 14,
                }}>
                  {account.nombre.split(" ").map(n => n[0]).join("")}
                </div>

                <div style={{ flex: 1, textAlign: "left" }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#0b1629" }}>
                    {account.nombre}
                  </div>
                  <div style={{ fontSize: 12, color: "#94a3b8" }}>
                    {account.desc}
                  </div>
                  <div style={{ fontSize: 11, color: "#cbd5e1", marginTop: 2 }}>
                    {account.email}
                  </div>
                </div>

                {loading && selectedEmail === account.email ? (
                  <div style={{
                    width: 24, height: 24, borderRadius: "50%",
                    border: "2px solid #e2e8f0", borderTopColor: "#00c2e0",
                    animation: "spin 0.8s linear infinite",
                  }} />
                ) : (
                  <ArrowRight size={18} color="#94a3b8" />
                )}
              </button>
            ))}
          </div>

          <div style={{
            background: "rgba(0,194,224,0.05)", border: "1px solid rgba(0,194,224,0.15)",
            borderRadius: 8, padding: "12px 14px", marginTop: 16,
            display: "flex", gap: 8, alignItems: "flex-start",
          }}>
            <Lock size={13} color="#00c2e0" style={{ marginTop: 2, flexShrink: 0 }} />
            <p style={{ fontSize: 12, color: "#64748b", margin: 0, lineHeight: 1.5 }}>
              Ambiente de desarrollo local. Los datos son simulados para testing.
            </p>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 28 }}>
          <Link href="/landing" style={{ color: "#94a3b8", fontSize: 13, textDecoration: "none" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#00c2e0")}
            onMouseLeave={e => (e.currentTarget.style.color = "#94a3b8")}
          >
            ← Volver al inicio
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
