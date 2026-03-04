'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'

export type ModuleName =
  | 'organizaciones'
  | 'empresas'
  | 'admisiones'
  | 'eventos'
  | 'comunicacion'
  | 'reportes'
  | 'usuarios'
  | 'configuracion'
  | 'documentos'
  | 'pagos'

export type ActionType = 'create' | 'read' | 'update' | 'delete' | 'export'

export interface Permission {
  module: ModuleName
  can_create: boolean
  can_read: boolean
  can_update: boolean
  can_delete: boolean
  can_export: boolean
  scope?: 'own_org' | 'all_orgs' | 'specific'
  specific_org_ids?: string[]
}

export interface UserPermissions {
  [module: string]: Permission
}

/**
 * Hook para gestionar permisos de usuario
 *
 * @example
 * ```tsx
 * const { checkPermission, canAccess, isLoading } = usePermissions()
 *
 * if (checkPermission('empresas', 'create')) {
 *   // Mostrar botón de crear empresa
 * }
 * ```
 */
export function usePermissions() {
  const supabase = createClient()
  // isLoading de useAuth nos dice si aún está resolviendo la sesión
  const { user, isLoading: authLoading } = useAuth()
  const [permissions, setPermissions] = useState<UserPermissions>({})
  // Empezamos en true hasta que auth + permisos terminen de cargar
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  /**
   * Cargar permisos del usuario actual
   */
  const loadPermissions = useCallback(async () => {
    // Si auth aún está cargando, esperar — no tomar decisiones todavía
    if (authLoading) return

    if (!user?.id) {
      setPermissions({})
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      // Obtener rol del usuario
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, organization_id')
        .eq('id', user.id)
        .single()

      if (profileError) throw profileError

      // Super admin tiene todos los permisos
      if (profile.role === 'super_admin') {
        const allPermissions: UserPermissions = {}
        const modules: ModuleName[] = [
          'organizaciones',
          'empresas',
          'admisiones',
          'eventos',
          'comunicacion',
          'reportes',
          'usuarios',
          'configuracion',
          'documentos',
          'pagos',
        ]

        modules.forEach((module) => {
          allPermissions[module] = {
            module,
            can_create: true,
            can_read: true,
            can_update: true,
            can_delete: true,
            can_export: true,
            scope: 'all_orgs',
          }
        })

        setPermissions(allPermissions)
        setIsLoading(false)
        return
      }

      // Intentar obtener permisos personalizados del usuario
      const { data: customPermissions, error: customError } = await supabase
        .from('user_permissions')
        .select('*')
        .eq('user_id', user.id)

      if (customError) throw customError

      // Si tiene permisos personalizados, usarlos
      if (customPermissions && customPermissions.length > 0) {
        const userPerms: UserPermissions = {}
        customPermissions.forEach((perm) => {
          userPerms[perm.module] = {
            module: perm.module as ModuleName,
            can_create: perm.can_create,
            can_read: perm.can_read,
            can_update: perm.can_update,
            can_delete: perm.can_delete,
            can_export: perm.can_export,
            scope: perm.scope,
            specific_org_ids: perm.specific_org_ids,
          }
        })
        setPermissions(userPerms)
      } else {
        // Si no tiene permisos personalizados, usar permisos del rol
        const { data: rolePermissions, error: roleError } = await supabase
          .from('role_permissions')
          .select('*')
          .eq('role', profile.role)

        if (roleError) throw roleError

        const rolePerms: UserPermissions = {}
        rolePermissions?.forEach((perm) => {
          rolePerms[perm.module] = {
            module: perm.module as ModuleName,
            can_create: perm.can_create,
            can_read: perm.can_read,
            can_update: perm.can_update,
            can_delete: perm.can_delete,
            can_export: perm.can_export,
            scope: 'own_org', // Por defecto, scope es su propio organismo
          }
        })
        setPermissions(rolePerms)
      }

      setIsLoading(false)
    } catch (err) {
      console.error('Error loading permissions:', err)
      setError(err as Error)
      setIsLoading(false)
    }
  }, [user?.id, supabase, authLoading])

  useEffect(() => {
    loadPermissions()
  }, [loadPermissions, authLoading]) // Re-ejecutar cuando cambie el estado de auth

  /**
   * Verificar si el usuario tiene un permiso específico
   *
   * @param module - Nombre del módulo
   * @param action - Tipo de acción (create, read, update, delete, export)
   * @returns true si tiene el permiso, false si no
   */
  const checkPermission = useCallback(
    (module: ModuleName, action: ActionType): boolean => {
      const modulePermission = permissions[module]
      if (!modulePermission) return false

      switch (action) {
        case 'create':
          return modulePermission.can_create
        case 'read':
          return modulePermission.can_read
        case 'update':
          return modulePermission.can_update
        case 'delete':
          return modulePermission.can_delete
        case 'export':
          return modulePermission.can_export
        default:
          return false
      }
    },
    [permissions]
  )

  /**
   * Verificar si el usuario tiene acceso de lectura a un módulo
   *
   * @param module - Nombre del módulo
   * @returns true si puede leer, false si no
   */
  const canAccess = useCallback(
    (module: ModuleName): boolean => {
      return checkPermission(module, 'read')
    },
    [checkPermission]
  )

  /**
   * Verificar si el usuario puede crear en un módulo
   */
  const canCreate = useCallback(
    (module: ModuleName): boolean => {
      return checkPermission(module, 'create')
    },
    [checkPermission]
  )

  /**
   * Verificar si el usuario puede editar en un módulo
   */
  const canUpdate = useCallback(
    (module: ModuleName): boolean => {
      return checkPermission(module, 'update')
    },
    [checkPermission]
  )

  /**
   * Verificar si el usuario puede eliminar en un módulo
   */
  const canDelete = useCallback(
    (module: ModuleName): boolean => {
      return checkPermission(module, 'delete')
    },
    [checkPermission]
  )

  /**
   * Verificar si el usuario puede exportar datos de un módulo
   */
  const canExport = useCallback(
    (module: ModuleName): boolean => {
      return checkPermission(module, 'export')
    },
    [checkPermission]
  )

  /**
   * Obtener todos los permisos del usuario
   */
  const getUserPermissions = useCallback((): UserPermissions => {
    return permissions
  }, [permissions])

  /**
   * Obtener permiso de un módulo específico
   */
  const getModulePermission = useCallback(
    (module: ModuleName): Permission | null => {
      return permissions[module] || null
    },
    [permissions]
  )

  /**
   * Verificar si el usuario es super admin
   */
  const isSuperAdmin = useCallback(async (): Promise<boolean> => {
    if (!user?.id) return false

    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    return data?.role === 'super_admin'
  }, [user?.id, supabase])

  /**
   * Recargar permisos manualmente
   */
  const refreshPermissions = useCallback(() => {
    return loadPermissions()
  }, [loadPermissions])

  return {
    permissions,
    isLoading,
    error,
    checkPermission,
    canAccess,
    canCreate,
    canUpdate,
    canDelete,
    canExport,
    getUserPermissions,
    getModulePermission,
    isSuperAdmin,
    refreshPermissions,
  }
}
