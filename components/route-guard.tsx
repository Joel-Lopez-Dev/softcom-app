"use client"

import { useEffect, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { useAuth, type Role } from "@/lib/auth-context"
import { Spinner } from "@/components/ui/spinner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ShieldAlert } from "lucide-react"

type Props = {
  children: ReactNode
  allowedRoles?: Role[]
}

export function RouteGuard({ children, allowedRoles }: Props) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || isLoading) return
    if (!user) {
      router.push("/login")
    }
  }, [mounted, user, router, isLoading])

  if (!mounted || isLoading || !user) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Spinner />
          <span>Cargando...</span>
        </div>
      </div>
    )
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="mx-auto w-full max-w-md px-4 py-10">
        <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Sin permisos</AlertTitle>
          <AlertDescription>
            Tu rol ({user.role}) no tiene acceso a esta sección. Vuelve al inicio o contacta a un administrador.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return <>{children}</>
}
