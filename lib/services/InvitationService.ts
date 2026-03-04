import { createClient } from '@/lib/supabase/client'

export interface InvitationData {
    email: string
    role: 'admin' | 'editor' | 'viewer' | 'coordinador_cce'
    organizationId: string | null
    customMessage?: string
    invitedBy: string
}

export interface Invitation {
    id: string
    email: string
    role: string
    organization_id: string | null
    invited_by: string | null
    token: string
    expires_at: string
    accepted_at: string | null
    cancelled_at: string | null
    status: 'pending' | 'accepted' | 'expired' | 'cancelled'
    custom_message: string | null
    created_at: string
}

export interface AcceptInvitationData {
    firstName: string
    lastName: string
    password: string
}

/**
 * Servicio para gestionar el sistema de invitaciones de usuarios.
 */
export class InvitationService {
    private static supabase = createClient()

    /**
     * Crear y registrar una nueva invitación.
     * El token se genera automáticamente por la BD (DEFAULT en SQL).
     */
    static async sendInvitation(data: InvitationData): Promise<Invitation> {
        const { data: invitation, error } = await InvitationService.supabase
            .from('user_invitations')
            .insert({
                email: data.email.toLowerCase().trim(),
                role: data.role,
                organization_id: data.organizationId,
                invited_by: data.invitedBy,
                custom_message: data.customMessage ?? null,
                status: 'pending',
            })
            .select()
            .single()

        if (error) throw error
        return invitation as Invitation
    }

    /**
     * Obtener una invitación por token (para la página de aceptación).
     */
    static async getInvitationByToken(token: string): Promise<Invitation | null> {
        // Expirar invitaciones antiguas primero
        await InvitationService.supabase.rpc('expire_old_invitations')

        const { data, error } = await InvitationService.supabase
            .from('user_invitations')
            .select('*')
            .eq('token', token)
            .single()

        if (error) {
            if (error.code === 'PGRST116') return null // Not found
            throw error
        }

        return data as Invitation
    }

    /**
     * Aceptar una invitación: crea la cuenta en Supabase Auth y el perfil.
     */
    static async acceptInvitation(
        token: string,
        userData: AcceptInvitationData
    ): Promise<void> {
        // 1. Obtener la invitación
        const invitation = await InvitationService.getInvitationByToken(token)

        if (!invitation) throw new Error('Invitación no encontrada')
        if (invitation.status !== 'pending') {
            throw new Error(
                invitation.status === 'accepted'
                    ? 'Esta invitación ya fue aceptada'
                    : invitation.status === 'expired'
                        ? 'Esta invitación ha expirado'
                        : 'Esta invitación fue cancelada'
            )
        }

        // 2. Crear usuario en Supabase Auth
        const { data: authData, error: authError } =
            await InvitationService.supabase.auth.signUp({
                email: invitation.email,
                password: userData.password,
                options: {
                    data: {
                        first_name: userData.firstName,
                        last_name: userData.lastName,
                        role: invitation.role,
                        organization_id: invitation.organization_id,
                    },
                },
            })

        if (authError) throw authError
        if (!authData.user) throw new Error('No se pudo crear el usuario')

        // 3. Marcar invitación como aceptada
        const { error: updateError } = await InvitationService.supabase
            .from('user_invitations')
            .update({
                status: 'accepted',
                accepted_at: new Date().toISOString(),
            })
            .eq('token', token)

        if (updateError) {
            console.error('[InvitationService] Error updating invitation status:', updateError)
            // No lanzar error acá, el usuario ya fue creado
        }
    }

    /**
     * Cancelar una invitación pendiente.
     */
    static async cancelInvitation(invitationId: string): Promise<void> {
        const { error } = await InvitationService.supabase
            .from('user_invitations')
            .update({
                status: 'cancelled',
                cancelled_at: new Date().toISOString(),
            })
            .eq('id', invitationId)
            .eq('status', 'pending')

        if (error) throw error
    }

    /**
     * Reenviar invitación (la regenera con nuevo tiempo de expiración).
     */
    static async resendInvitation(invitationId: string): Promise<void> {
        const { error } = await InvitationService.supabase
            .from('user_invitations')
            .update({
                status: 'pending',
                expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                cancelled_at: null,
            })
            .eq('id', invitationId)

        if (error) throw error
    }

    /**
     * Listar todas las invitaciones (con filtros opcionales).
     */
    static async listInvitations(
        organizationId?: string,
        status?: string
    ): Promise<Invitation[]> {
        let query = InvitationService.supabase
            .from('user_invitations')
            .select('*')
            .order('created_at', { ascending: false })

        if (organizationId) {
            query = query.eq('organization_id', organizationId)
        }

        if (status) {
            query = query.eq('status', status)
        }

        const { data, error } = await query

        if (error) throw error
        return (data ?? []) as Invitation[]
    }

    /**
     * Construir la URL de invitación para enviar por email.
     */
    static buildInvitationUrl(token: string): string {
        const baseUrl =
            typeof window !== 'undefined'
                ? window.location.origin
                : process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

        return `${baseUrl}/invitacion/${token}`
    }
}
