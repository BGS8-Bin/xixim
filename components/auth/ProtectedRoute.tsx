'use client'

import { ReactNode, useEffect, useRef } from 'react'
import { usePermissions } from '@/hooks/usePermissions'
import { useRouter } from 'next/navigation'
import type { ModuleName, ActionType } from '@/hooks/usePermissions'

interface ProtectedRouteProps {
    /** Módulo requerido para acceder */
    requiredModule: ModuleName
    /** Acción requerida (por defecto 'read') */
    requiredAction?: ActionType
    /** Contenido protegido */
    children: ReactNode
    /** Componente a mostrar si no tiene permiso (por defecto redirige) */
    fallback?: ReactNode
    /** Ruta a redirigir si no tiene permiso (por defecto '/dashboard') */
    redirectTo?: string
}

/**
 * Componente para proteger rutas completas basándose en permisos.
 *
 * - Mientras los permisos cargan → muestra skeleton (nunca redirige)
 * - Si tiene permiso → muestra children
 * - Si NO tiene permiso y hay fallback → muestra fallback
 * - Si NO tiene permiso y no hay fallback → redirige a redirectTo
 *
 * @example
 * ```tsx
 * <ProtectedRoute requiredModule="configuracion" requiredAction="update">
 *   <ConfigPage />
 * </ProtectedRoute>
 * ```
 */
export function ProtectedRoute({
    requiredModule,
    requiredAction = 'read',
    children,
    fallback,
    redirectTo = '/dashboard',
}: ProtectedRouteProps) {
    const { checkPermission, isLoading } = usePermissions()
    const router = useRouter()
    // Usamos ref para evitar redirect doble o premature redirect al montar
    const hasRedirected = useRef(false)

    const hasPermission = checkPermission(requiredModule, requiredAction)

    useEffect(() => {
        // Solo redirigir cuando los permisos ya cargaron Y no tiene acceso Y no hay fallback
        if (!isLoading && !hasPermission && !fallback && !hasRedirected.current) {
            hasRedirected.current = true
            router.push(redirectTo)
        }
    }, [isLoading, hasPermission, fallback, redirectTo, router])

    // Skeleton mientras carga
    if (isLoading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="flex items-center justify-between">
                    <div className="h-8 bg-muted rounded-md w-64" />
                    <div className="h-9 bg-muted rounded-md w-36" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-20 bg-muted rounded-xl" />
                    ))}
                </div>
                <div className="h-10 bg-muted rounded-lg w-full" />
                <div className="border rounded-xl overflow-hidden">
                    <div className="h-12 bg-muted/50 w-full" />
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="h-14 bg-muted/30 w-full border-t" />
                    ))}
                </div>
            </div>
        )
    }

    // Sin permiso → fallback o esperar redirect del useEffect
    if (!hasPermission) {
        if (fallback) return <>{fallback}</>
        return null
    }

    return <>{children}</>
}

/**
 * Pantalla de "Sin Acceso" estándar para usar como fallback.
 */
export function NoAccessPage() {
    const router = useRouter()

    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                <svg
                    className="w-8 h-8 text-destructive"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                </svg>
            </div>
            <div>
                <h2 className="text-xl font-semibold text-foreground mb-1">
                    Acceso Restringido
                </h2>
                <p className="text-muted-foreground text-sm max-w-sm">
                    No tienes los permisos necesarios para acceder a esta sección.
                    Contacta al administrador si crees que esto es un error.
                </p>
            </div>
            <button
                onClick={() => router.push('/dashboard')}
                className="text-sm text-primary underline underline-offset-4 hover:text-primary/80"
            >
                Volver al inicio
            </button>
        </div>
    )
}
