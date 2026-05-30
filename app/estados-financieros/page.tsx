"use client"

import { useState, useEffect } from "react"
import { RouteGuard } from "@/components/route-guard"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Field, FieldLabel } from "@/components/ui/field"
import { Download, FileText, TrendingUp, BarChart3, Loader2 } from "lucide-react"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { generarReportePDF } from "@/lib/generar-reporte-pdf"

type BalanceGeneral = {
  id_balance: number
  id_empresa: number
  fecha: string
  total_activos: string
  total_pasivos: string
  total_capital: string
  inversiones_valores: string | null
  pagos_pendientes: string | null
  observaciones: string | null
  created_at: string
}

type EstadoResultado = {
  id_estado: number
  id_empresa: number
  anio: number
  periodo: string
  ingreso_total: string
  gasto_total: string
  utilidad_neta: string
  observaciones: string | null
  created_at: string
}

type Indicador = {
  id_indicador: number
  id_empresa: number
  fecha: string
  rentabilidad_activos: string | null
  rentabilidad_patrimonio: string | null
  razon_solvencia: string | null
  razon_liquidez: string | null
  indice_endeudamiento: string | null
  margen_utilidad: string | null
  created_at: string
}

type Empresa = {
  id_empresa: number
  nombre: string
}

const fmtMXN = (n: string | number) =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(typeof n === "string" ? parseFloat(n) : n)

const fmtPct = (n: string | number | null) =>
  n ? `${(typeof n === "string" ? parseFloat(n) : n).toFixed(2)}%` : "—"

export default function EstadosFinancierosPage() {
  return (
    <RouteGuard allowedRoles={["analyst", "gerente_cartera", "admin"]}>
      <EstadosFinancierosContent />
    </RouteGuard>
  )
}


function EstadosFinancierosContent() {
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState<string>("")
  const [tab, setTab] = useState<"balance" | "resultado" | "indicadores">("balance")
  const [loading, setLoading] = useState(false)
  const [descargandoPDF, setDescargandoPDF] = useState(false)

  const [balances, setBalances] = useState<BalanceGeneral[]>([])
  const [resultados, setResultados] = useState<EstadoResultado[]>([])
  const [indicadores, setIndicadores] = useState<Indicador[]>([])

  // Cargar empresas
  useEffect(() => {
    const cargarEmpresas = async () => {
      try {
        const res = await fetch("/api/empresas")
        const data = await res.json()
        if (data.success) {
          setEmpresas(data.data)
          if (data.data.length > 0) {
            setEmpresaSeleccionada(data.data[0].id_empresa.toString())
          }
        }
      } catch (err) {
        console.error("Error cargando empresas:", err)
      }
    }
    cargarEmpresas()
  }, [])

  // Cargar datos cuando cambia empresa
  useEffect(() => {
    if (!empresaSeleccionada) return

    const cargarDatos = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/estados-financieros?empresa_id=${empresaSeleccionada}`)
        const data = await res.json()
        if (data.success) {
          // balance_general y estado_resultado ahora son objetos, convertir a array para compatibilidad
          setBalances(data.data.balance_general ? [data.data.balance_general] : [])
          setResultados(data.data.estado_resultado ? [data.data.estado_resultado] : [])
          setIndicadores(data.data.indicadores || [])
        }
      } catch (err) {
        console.error("Error cargando estados financieros:", err)
      } finally {
        setLoading(false)
      }
    }

    cargarDatos()
  }, [empresaSeleccionada])

  const handleExportarPDF = async () => {
    if (!empresas.length || !empresaSeleccionada) {
      alert("Por favor selecciona una empresa primero")
      return
    }

    setDescargandoPDF(true)
    try {
      const empresa = empresas.find((e) => e.id_empresa.toString() === empresaSeleccionada)
      if (empresa) {
        const resultado = await generarReportePDF(
          empresa,
          balances,
          resultados,
          new Date().toISOString().split("T")[0]
        )
        if (!resultado.success) {
          alert("Error al generar PDF: " + resultado.message)
        }
      }
    } catch (err) {
      console.error("Error exportando PDF:", err)
      alert("Error al descargar el reporte")
    } finally {
      setDescargandoPDF(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8">
      <PageHeader
        title="Estados Financieros"
        description="Balance general, estado de resultados e indicadores financieros por empresa."
        crumbs={[
          { label: "Inicio", href: "/dashboard" },
          { label: "Estados Financieros" },
        ]}
        tag="Análisis contable"
        actions={
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleExportarPDF}
            disabled={descargandoPDF || !balances.length}
          >
            {descargandoPDF ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generando...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Exportar reporte
              </>
            )}
          </Button>
        }
      />

      {/* Empresa selector */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Empresa</CardTitle>
          <CardDescription>Selecciona una empresa para consultar sus estados financieros.</CardDescription>
        </CardHeader>
        <CardContent>
          <Field>
            <FieldLabel>Empresa cliente</FieldLabel>
            <Select value={empresaSeleccionada} onValueChange={setEmpresaSeleccionada}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una empresa" />
              </SelectTrigger>
              <SelectContent>
                {empresas.map((e) => (
                  <SelectItem key={e.id_empresa} value={e.id_empresa.toString()}>
                    {e.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </CardContent>
      </Card>

      {/* Tabs */}
      {empresaSeleccionada && (
        <Card>
          <CardContent className="pt-6">
            <Tabs value={tab} onValueChange={(v: any) => setTab(v)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="balance">Balance General</TabsTrigger>
                <TabsTrigger value="resultado">Estado de Resultados</TabsTrigger>
                <TabsTrigger value="indicadores">Indicadores Financieros</TabsTrigger>
              </TabsList>

              {/* Balance General */}
              <TabsContent value="balance" className="mt-6">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                    <p>Cargando...</p>
                  </div>
                ) : balances.length === 0 ? (
                  <div className="py-12">
                    <Empty>
                      <EmptyMedia>
                        <FileText className="h-12 w-12" />
                      </EmptyMedia>
                      <EmptyHeader>
                        <EmptyTitle>No hay balances registrados</EmptyTitle>
                        <EmptyDescription>
                          No hay registros de balance general para esta empresa.
                        </EmptyDescription>
                      </EmptyHeader>
                    </Empty>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {balances.map((b) => (
                      <div key={b.id_balance} className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-sm">
                            {new Date(b.fecha).toLocaleDateString("es-MX")}
                          </h3>
                          {b.observaciones && (
                            <p className="text-xs text-gray-600">{b.observaciones}</p>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                          <div className="rounded-lg border p-4">
                            <p className="text-xs font-medium text-gray-600">Total Activos</p>
                            <p className="mt-1 text-lg font-bold">{fmtMXN(b.total_activos)}</p>
                          </div>
                          <div className="rounded-lg border p-4">
                            <p className="text-xs font-medium text-gray-600">Total Pasivos</p>
                            <p className="mt-1 text-lg font-bold">{fmtMXN(b.total_pasivos)}</p>
                          </div>
                          <div className="rounded-lg border p-4">
                            <p className="text-xs font-medium text-gray-600">Total Capital</p>
                            <p className="mt-1 text-lg font-bold">{fmtMXN(b.total_capital)}</p>
                          </div>
                          {b.inversiones_valores && (
                            <div className="rounded-lg border p-4">
                              <p className="text-xs font-medium text-gray-600">Inversiones en Valores</p>
                              <p className="mt-1 text-lg font-bold">{fmtMXN(b.inversiones_valores)}</p>
                            </div>
                          )}
                          {b.pagos_pendientes && (
                            <div className="rounded-lg border p-4">
                              <p className="text-xs font-medium text-gray-600">Pagos Pendientes</p>
                              <p className="mt-1 text-lg font-bold">{fmtMXN(b.pagos_pendientes)}</p>
                            </div>
                          )}
                        </div>

                        <div className="border-t pt-4">
                          <p className="text-xs font-medium text-gray-600">Ecuación contable:</p>
                          <p className="mt-2 text-sm">
                            {fmtMXN(b.total_activos)} (Activos) = {fmtMXN(b.total_pasivos)} (Pasivos) + {fmtMXN(b.total_capital)} (Capital)
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Estado de Resultados */}
              <TabsContent value="resultado" className="mt-6">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                    <p>Cargando...</p>
                  </div>
                ) : resultados.length === 0 ? (
                  <div className="py-12">
                    <Empty>
                      <EmptyMedia>
                        <BarChart3 className="h-12 w-12" />
                      </EmptyMedia>
                      <EmptyHeader>
                        <EmptyTitle>No hay resultados registrados</EmptyTitle>
                        <EmptyDescription>
                          No hay registros de estado de resultados para esta empresa.
                        </EmptyDescription>
                      </EmptyHeader>
                    </Empty>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Año</TableHead>
                          <TableHead>Período</TableHead>
                          <TableHead className="text-right">Ingreso Total</TableHead>
                          <TableHead className="text-right">Gasto Total</TableHead>
                          <TableHead className="text-right">Utilidad Neta</TableHead>
                          <TableHead className="text-right">Margen (%)</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {resultados.map((r) => {
                          const margen =
                            parseFloat(r.ingreso_total) > 0
                              ? (parseFloat(r.utilidad_neta) / parseFloat(r.ingreso_total)) * 100
                              : 0
                          return (
                            <TableRow key={r.id_estado}>
                              <TableCell className="font-medium">{r.anio}</TableCell>
                              <TableCell>{r.periodo}</TableCell>
                              <TableCell className="text-right">{fmtMXN(r.ingreso_total)}</TableCell>
                              <TableCell className="text-right">{fmtMXN(r.gasto_total)}</TableCell>
                              <TableCell className="text-right font-semibold">{fmtMXN(r.utilidad_neta)}</TableCell>
                              <TableCell className="text-right text-sm">{margen.toFixed(2)}%</TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>

              {/* Indicadores Financieros */}
              <TabsContent value="indicadores" className="mt-6">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                    <p>Cargando...</p>
                  </div>
                ) : indicadores.length === 0 ? (
                  <div className="py-12">
                    <Empty>
                      <EmptyMedia>
                        <TrendingUp className="h-12 w-12" />
                      </EmptyMedia>
                      <EmptyHeader>
                        <EmptyTitle>No hay indicadores registrados</EmptyTitle>
                        <EmptyDescription>
                          No hay registros de indicadores financieros para esta empresa.
                        </EmptyDescription>
                      </EmptyHeader>
                    </Empty>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Fecha</TableHead>
                          <TableHead className="text-right">ROA (%)</TableHead>
                          <TableHead className="text-right">ROE (%)</TableHead>
                          <TableHead className="text-right">Solvencia</TableHead>
                          <TableHead className="text-right">Liquidez</TableHead>
                          <TableHead className="text-right">Endeudamiento</TableHead>
                          <TableHead className="text-right">Margen Utilidad (%)</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {indicadores.map((i) => (
                          <TableRow key={i.id_indicador}>
                            <TableCell className="font-medium">
                              {new Date(i.fecha).toLocaleDateString("es-MX")}
                            </TableCell>
                            <TableCell className="text-right">{fmtPct(i.rentabilidad_activos)}</TableCell>
                            <TableCell className="text-right">{fmtPct(i.rentabilidad_patrimonio)}</TableCell>
                            <TableCell className="text-right">
                              {i.razon_solvencia ? parseFloat(i.razon_solvencia).toFixed(2) : "—"}
                            </TableCell>
                            <TableCell className="text-right">
                              {i.razon_liquidez ? parseFloat(i.razon_liquidez).toFixed(2) : "—"}
                            </TableCell>
                            <TableCell className="text-right">
                              {i.indice_endeudamiento ? parseFloat(i.indice_endeudamiento).toFixed(2) : "—"}
                            </TableCell>
                            <TableCell className="text-right">{fmtPct(i.margen_utilidad)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
