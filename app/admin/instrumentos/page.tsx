"use client"

import { useState, useEffect } from "react"
import { MoreHorizontal, Plus, Pencil, Trash2, Coins, Loader2 } from "lucide-react"
import { RouteGuard } from "@/components/route-guard"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"

type Instrumento = {
  id_instrumento: number
  tipo: string
  ticker: string
  valor_nominal: number
  rendimiento_esperado?: number
  vencimiento: string
  created_at: string
}

const TIPO_LABELS: Record<string, string> = {
  cete: "CETE",
  bono_m: "Bono M",
  udibono: "UDIBONO",
  accion: "Acción",
  derivado: "Derivado",
}

export default function AdminInstrumentosPage() {
  return (
    <RouteGuard allowedRoles={["admin"]}>
      <AdminInstrumentosContent />
    </RouteGuard>
  )
}

function AdminInstrumentosContent() {
  const [instrumentos, setInstrumentos] = useState<Instrumento[]>([])
  const [loading, setLoading] = useState(true)
  const [openForm, setOpenForm] = useState(false)
  const [editing, setEditing] = useState<Instrumento | null>(null)
  const [toDelete, setToDelete] = useState<Instrumento | null>(null)
  const [error, setError] = useState("")

  // Cargar instrumentos al montar
  useEffect(() => {
    cargarInstrumentos()
  }, [])

  const cargarInstrumentos = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/instrumentos")
      const data = await res.json()
      if (data.success) {
        setInstrumentos(data.data)
      } else {
        setError(data.error || "Error cargando instrumentos")
      }
    } catch (err) {
      setError("Error conectando con el servidor")
    } finally {
      setLoading(false)
    }
  }

  const handleNew = () => {
    setEditing(null)
    setError("")
    setOpenForm(true)
  }

  const handleEdit = (i: Instrumento) => {
    setEditing(i)
    setError("")
    setOpenForm(true)
  }

  const handleDelete = async () => {
    if (!toDelete) return
    try {
      const res = await fetch(`/api/instrumentos/${toDelete.id_instrumento}`, {
        method: "DELETE",
      })
      const data = await res.json()
      if (data.success) {
        await cargarInstrumentos()
        setToDelete(null)
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError("Error eliminando instrumento")
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <PageHeader
        title="Catálogo de Instrumentos"
        description="Administración de CETES, Bonos M, UDIBONOS, Derivados y Acciones."
        crumbs={[
          { label: "Inicio", href: "/dashboard" },
          { label: "Instrumentos" },
        ]}
        actions={
          <Button size="sm" onClick={handleNew} disabled={loading}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo instrumento
          </Button>
        }
      />

      {error && (
        <Card className="mb-4 border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-sm text-red-700">{error}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticker</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Valor Nominal</TableHead>
                  <TableHead>Rendimiento</TableHead>
                  <TableHead>Vencimiento</TableHead>
                  <TableHead className="w-12 text-right">
                    <span className="sr-only">Acciones</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="p-4 text-center">
                      <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
                      Cargando...
                    </TableCell>
                  </TableRow>
                ) : instrumentos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="p-0">
                      <Empty className="border-0">
                        <EmptyHeader>
                          <EmptyMedia variant="icon">
                            <Coins className="h-6 w-6" />
                          </EmptyMedia>
                          <EmptyTitle>Sin instrumentos registrados</EmptyTitle>
                          <EmptyDescription>Crea el primer instrumento para comenzar.</EmptyDescription>
                        </EmptyHeader>
                      </Empty>
                    </TableCell>
                  </TableRow>
                ) : (
                  instrumentos.map((i) => (
                    <TableRow key={i.id_instrumento}>
                      <TableCell className="font-medium">{i.ticker}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{TIPO_LABELS[i.tipo] || i.tipo}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        ${i.valor_nominal.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {i.rendimiento_esperado ? i.rendimiento_esperado.toFixed(2) : "—"}%
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(i.vencimiento).toLocaleDateString("es-MX")}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" aria-label={`Acciones para ${i.ticker}`}>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(i)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => setToDelete(i)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <InstrumentoFormDialog
        open={openForm}
        onOpenChange={setOpenForm}
        instrumento={editing}
        onSave={cargarInstrumentos}
        onError={setError}
      />

      <AlertDialog open={Boolean(toDelete)} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar instrumento?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará{" "}
              <span className="font-medium">{toDelete?.ticker}</span> del catálogo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function InstrumentoFormDialog({
  open,
  onOpenChange,
  instrumento,
  onSave,
  onError,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  instrumento: Instrumento | null
  onSave: () => void
  onError: (error: string) => void
}) {
  const esEdicion = Boolean(instrumento)
  const [ticker, setTicker] = useState(instrumento?.ticker ?? "")
  const [tipo, setTipo] = useState(instrumento?.tipo ?? "cete")
  const [valorNominal, setValorNominal] = useState((instrumento?.valor_nominal ?? "").toString())
  const [rendimiento, setRendimiento] = useState((instrumento?.rendimiento_esperado ?? "").toString())
  const [vencimiento, setVencimiento] = useState(
    instrumento?.vencimiento ? new Date(instrumento.vencimiento).toISOString().split("T")[0] : ""
  )
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    onError("")
    setLoading(true)

    try {
      const url = esEdicion ? `/api/instrumentos/${instrumento!.id_instrumento}` : "/api/instrumentos"
      const method = esEdicion ? "PUT" : "POST"

      const payload = {
        ticker,
        tipo,
        valor_nominal: parseFloat(valorNominal),
        rendimiento_esperado: parseFloat(rendimiento),
        vencimiento: new Date(vencimiento).toISOString(),
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (data.success) {
        onOpenChange(false)
        setTicker("")
        setTipo("cete")
        setValorNominal("")
        setRendimiento("")
        setVencimiento("")
        onSave()
      } else {
        onError(data.error || "Error guardando instrumento")
      }
    } catch (err) {
      onError("Error conectando con el servidor")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{esEdicion ? "Editar instrumento" : "Nuevo instrumento"}</DialogTitle>
          <DialogDescription>
            {esEdicion
              ? "Actualiza la información del instrumento."
              : "Registra un nuevo instrumento en el catálogo."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="i-ticker">Ticker</FieldLabel>
              <Input
                id="i-ticker"
                type="text"
                value={ticker}
                onChange={(e) => setTicker(e.target.value)}
                required
                disabled={loading}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="i-tipo">Tipo</FieldLabel>
              <Select value={tipo} onValueChange={setTipo} disabled={loading}>
                <SelectTrigger id="i-tipo">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cete">CETE</SelectItem>
                  <SelectItem value="bono_m">Bono M</SelectItem>
                  <SelectItem value="udibono">UDIBONO</SelectItem>
                  <SelectItem value="accion">Acción</SelectItem>
                  <SelectItem value="derivado">Derivado</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel htmlFor="i-vn">Valor Nominal</FieldLabel>
              <Input
                id="i-vn"
                type="number"
                step="0.01"
                value={valorNominal}
                onChange={(e) => setValorNominal(e.target.value)}
                required
                disabled={loading}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="i-rendimiento">Rendimiento Esperado (%)</FieldLabel>
              <Input
                id="i-rendimiento"
                type="number"
                step="0.01"
                value={rendimiento}
                onChange={(e) => setRendimiento(e.target.value)}
                required
                disabled={loading}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="i-vencimiento">Vencimiento</FieldLabel>
              <Input
                id="i-vencimiento"
                type="date"
                value={vencimiento}
                onChange={(e) => setVencimiento(e.target.value)}
                required
                disabled={loading}
              />
            </Field>
          </FieldGroup>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {esEdicion ? "Guardar cambios" : "Crear instrumento"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
