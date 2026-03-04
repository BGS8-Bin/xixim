import { createClient } from '@/lib/supabase/client'
import type { UserPermissions, ModuleName, ActionType } from '@/hooks/usePermissions'

const ALL_MODULES: ModuleName[] = [
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

export interface PermissionRow {
    module: ModuleName
    can_create: boolean
    can_read: boolean
    can_update: boolean
    can_delete: boolean
    can_export: boolean
    scope?: 'own_org' | 'all_orgs' | 'specific'
    specific_org_ids?: string[]
    notes?: string
}

/**
 * Servicio para gestionar permisos de usuarios y roles.
 * Todas las operaciones se hacen con el cliente de Supabase del navegador.
 */
export class PermissionService {
    private static supabase = createClient()

    /**
     * Obtener todos los permisos personalizados de un usuario (si tiene).
     */
    static async getUserPermissions(userId: string): Promise<PermissionRow[]> {
        const { data, error } = await PermissionService.supabase
            .from('user_permissions')
            .select('*')
            .eq('user_id', userId)

        if (error) throw error
        return data ?? []
    }

    /**
     * Obtener permisos por defecto de un rol.
     */
    static async getRolePermissions(role: string): Promise<PermissionRow[]> {
        const { data, error } = await PermissionService.supabase
            .from('role_permissions')
            .select('*')
            .eq('role', role)

        if (error) throw error
        return data ?? []
    }

    /**
     * Verificar si un usuario tiene un permiso específico.
     * Primero revisa permisos personalizados, luego los del rol.
     */
    static async checkPermission(
        userId: string,
        module: ModuleName,
        action: ActionType
    ): Promise<boolean> {
        const { data, error } = await PermissionService.supabase.rpc(
            'check_user_permission',
            {
                p_user_id: userId,
                p_module: module,
                p_action: action,
            }
        )

        if (error) {
            console.error('[PermissionService] checkPermission error:', error)
            return false
        }

        return data === true
    }

    /**
     * Actualizar o crear permisos personalizados de un usuario para un módulo.
     */
    static async updateUserModulePermission(
        userId: string,
        permission: PermissionRow,
        createdBy: string
    ): Promise<void> {
        const { error } = await PermissionService.supabase
            .from('user_permissions')
            .upsert(
                {
                    user_id: userId,
                    module: permission.module,
                    can_create: permission.can_create,
                    can_read: permission.can_read,
                    can_update: permission.can_update,
                    can_delete: permission.can_delete,
                    can_export: permission.can_export,
                    scope: permission.scope ?? 'own_org',
                    notes: permission.notes,
                    created_by: createdBy,
                },
                { onConflict: 'user_id,module' }
            )

        if (error) throw error
    }

    /**
     * Guardar todos los permisos personalizados de un usuario (batch).
     */
    static async saveAllUserPermissions(
        userId: string,
        permissions: PermissionRow[],
        createdBy: string
    ): Promise<void> {
        const rows = permissions.map((p) => ({
            user_id: userId,
            module: p.module,
            can_create: p.can_create,
            can_read: p.can_read,
            can_update: p.can_update,
            can_delete: p.can_delete,
            can_export: p.can_export,
            scope: p.scope ?? 'own_org',
            notes: p.notes,
            created_by: createdBy,
        }))

        const { error } = await PermissionService.supabase
            .from('user_permissions')
            .upsert(rows, { onConflict: 'user_id,module' })

        if (error) throw error
    }

    /**
     * Copiar los permisos de un rol a un usuario específico (útil para personalización).
     */
    static async copyRolePermissionsToUser(
        userId: string,
        role: string,
        createdBy: string
    ): Promise<void> {
        const rolePerms = await PermissionService.getRolePermissions(role)

        const rows = rolePerms.map((p) => ({
            user_id: userId,
            module: p.module,
            can_create: p.can_create,
            can_read: p.can_read,
            can_update: p.can_update,
            can_delete: p.can_delete,
            can_export: p.can_export,
            scope: 'own_org' as const,
            created_by: createdBy,
        }))

        const { error } = await PermissionService.supabase
            .from('user_permissions')
            .upsert(rows, { onConflict: 'user_id,module' })

        if (error) throw error
    }

    /**
     * Eliminar todos los permisos personalizados de un usuario
     * (para que vuelva a usar los permisos del rol).
     */
    static async resetToRolePermissions(userId: string): Promise<void> {
        const { error } = await PermissionService.supabase
            .from('user_permissions')
            .delete()
            .eq('user_id', userId)

        if (error) throw error
    }

    /**
     * Transformar permisos planos en el formato UserPermissions usado por el hook.
     */
    static toUserPermissions(rows: PermissionRow[]): UserPermissions {
        const result: UserPermissions = {}
        rows.forEach((row) => {
            result[row.module] = row
        })
        return result
    }

    /**
     * Construir permisos de super_admin en memoria (sin query a BD).
     */
    static buildSuperAdminPermissions(): UserPermissions {
        const result: UserPermissions = {}
        ALL_MODULES.forEach((module) => {
            result[module] = {
                module,
                can_create: true,
                can_read: true,
                can_update: true,
                can_delete: true,
                can_export: true,
                scope: 'all_orgs',
            }
        })
        return result
    }
}
