'use client'

import { ReactNode } from 'react'
import { usePermissions } from '@/hooks/usePermissions'
import type { ModuleName, ActionType } from '@/hooks/usePermissions'

interface CanProps {
    /** Módulo sobre el que se verifica el permiso */
    module: ModuleName
    /** Acción a verificar */
    action: ActionType
    /** Contenido a mostrar si TIENE el permiso */
    children: ReactNode
    /** Contenido a mostrar si NO tiene el permiso (opcional) */
    fallback?: ReactNode
}

/**
 * Componente de control de acceso condicional.
 * Renderiza `children` si el usuario tiene el permiso indicado,
 * o muestra un `fallback` (por defecto nada).
 *
 * @example
 * ```tsx
 * <Can module="empresas" action="delete">
 *   <DeleteButton />
 * </Can>
 *
 * <Can module="reportes" action="export" fallback={<p>Sin acceso</p>}>
 *   <ExportButton />
 * </Can>
 * ```
 */
export function Can({ module, action, children, fallback = null }: CanProps) {
    const { checkPermission, isLoading } = usePermissions()

    // Mientras carga los permisos no mostrar nada (evitar flash de contenido)
    if (isLoading) return null

    if (checkPermission(module, action)) {
        return <>{children}</>
    }

    return <>{fallback}</>
}
