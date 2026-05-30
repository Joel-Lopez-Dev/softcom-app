"use client"

import { useState, useEffect } from "react"
import { MoreHorizontal, Plus, Pencil, Trash2, Building2, Loader2 } from "lucide-react"
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
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"

type Empresa = {
  id_empresa: number
  nombre: string
  rfc: string | null
  direccion: string | null
  telefono: string | null
  correo: string | null
  created_at: string
}

export default function AdminEmpresasPage() {
  return (
    <RouteGuard allowedRoles={["admin"]}>
      <AdminEmpresasContent />
    </RouteGuard>
  )
}

function AdminEmpresasContent() {
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [loading, setLoading] = useState(true)
  const [openForm, setOpenForm] = useState(false)
  const [editing, setEditing] = useState<Empresa | null>(null)
  const [toDelete, setToDelete] = useState<Empresa | null>(null)
  const [error, setError] = useState("")

  // Cargar empresas al montar
  useEffect(() => {
    cargarEmpresas()
  }, [])

  const cargarEmpresas = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/empresas")
      const data = await res.json()
      if (data.success) {
        setEmpresas(data.data)
      } else {
        setError(data.error || "Error cargando empresas")
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

  const handleEdit = (e: Empresa) => {
    setEditing(e)
    setError("")
    setOpenForm(true)
  }

  const handleDelete = async () => {
    if (!toDelete) return
    try {
      const res = await fetch(`/api/empresas/${toDelete.id_empresa}`, {
        method: "DELETE",
      })
      const data = await res.json()
      if (data.success) {
        await cargarEmpresas()
        setToDelete(null)
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError("Error eliminando empresa")
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <PageHeader
        title="Gestión de empresas"
        description="Registro y administración de empresas cliente."
        crumbs={[
          { label: "Inicio", href: "/dashboard" },
          { label: "Empresas" },
        ]}
        actions={
          <Button size="sm" onClick={handleNew} disabled={loading}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva empresa
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
                  <TableHead>Nombre</TableHead>
                  <TableHead>RFC</TableHead>
                  <TableHead>Correo</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead className="w-12 text-right">
                    <span className="sr-only">Acciones</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="p-4 text-center">
                      <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
                      Cargando...
                    </TableCell>
                  </TableRow>
                ) : empresas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="p-0">
                      <Empty className="border-0">
                        <EmptyHeader>
                          <EmptyMedia variant="icon">
                            <Building2 className="h-6 w-6" />
                          </EmptyMedia>
                          <EmptyTitle>Sin empresas registradas</EmptyTitle>
                          <EmptyDescription>Crea la primera empresa para comenzar.</EmptyDescription>
                        </EmptyHeader>
                      </Empty>
                    </TableCell>
                  </TableRow>
                ) : (
                  empresas.map((e) => (
                    <TableRow key={e.id_empresa}>
                      <TableCell className="font-medium">{e.nombre}</TableCell>
                      <TableCell className="text-muted-foreground">{e.rfc || "—"}</TableCell>
                      <TableCell className="text-muted-foreground">{e.correo || "—"}</TableCell>
                      <TableCell className="text-muted-foreground">{e.telefono || "—"}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" aria-label={`Acciones para ${e.nombre}`}>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(e)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => setToDelete(e)}
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

      <EmpresaFormDialog
        open={openForm}
        onOpenChange={setOpenForm}
        empresa={editing}
        onSave={cargarEmpresas}
        onError={setError}
      />

      <AlertDialog open={Boolean(toDelete)} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar empresa?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará{" "}
              <span className="font-medium">{toDelete?.nombre}</span> y todos sus datos asociados.
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

function EmpresaFormDialog({
  open,
  onOpenChange,
  empresa,
  onSave,
  onError,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  empresa: Empresa | null
  onSave: () => void
  onError: (error: string) => void
}) {
  const esEdicion = Boolean(empresa)
  const [nombre, setNombre] = useState(empresa?.nombre ?? "")
  const [rfc, setRfc] = useState(empresa?.rfc ?? "")
  const [correo, setCorreo] = useState(empresa?.correo ?? "")
  const [telefono, setTelefono] = useState(empresa?.telefono ?? "")
  const [direccion, setDireccion] = useState(empresa?.direccion ?? "")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    onError("")
    setLoading(true)

    try {
      const url = esEdicion ? `/api/empresas/${empresa!.id_empresa}` : "/api/empresas"
      const method = esEdicion ? "PUT" : "POST"

      const payload = {
        nombre,
        rfc: rfc || null,
        correo: correo || null,
        telefono: telefono || null,
        direccion: direccion || null,
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (data.success) {
        onOpenChange(false)
        setNombre("")
        setRfc("")
        setCorreo("")
        setTelefono("")
        setDireccion("")
        onSave()
      } else {
        onError(data.error || "Error guardando empresa")
      }
    } catch (err) {
      onError("Error conectando con el servidor")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{esEdicion ? "Editar empresa" : "Nueva empresa"}</DialogTitle>
          <DialogDescription>
            {esEdicion
              ? "Actualiza la información de la empresa."
              : "Registra una nueva empresa cliente."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="e-nombre">Nombre de la empresa</FieldLabel>
              <Input
                id="e-nombre"
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                disabled={loading}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="e-rfc">RFC</FieldLabel>
              <Input
                id="e-rfc"
                type="text"
                value={rfc}
                onChange={(e) => setRfc(e.target.value)}
                placeholder="Ej: ABC123456XYZ"
                disabled={loading}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="e-email">Correo electrónico</FieldLabel>
              <Input
                id="e-email"
                type="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                disabled={loading}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="e-telefono">Teléfono</FieldLabel>
              <Input
                id="e-telefono"
                type="tel"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                disabled={loading}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="e-direccion">Dirección</FieldLabel>
              <Input
                id="e-direccion"
                type="text"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
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
              {esEdicion ? "Guardar cambios" : "Crear empresa"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
