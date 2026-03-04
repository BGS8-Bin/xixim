import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/announcements/[id]/campaign-status
 * Obtiene el estado de las campañas asociadas a un anuncio
 */
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = await createClient()

        // Verificar autenticación
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        // Verificar permisos
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (!profile || !['admin', 'editor'].includes(profile.role)) {
            return NextResponse.json(
                { error: 'No tienes permisos para realizar esta acción' },
                { status: 403 }
            )
        }

        const announcementId = params.id

        // Obtener todas las campañas del anuncio
        const { data: campaigns, error: campaignsError } = await supabase
            .from('announcement_campaigns')
            .select('*, creator:profiles(first_name, last_name, email)')
            .eq('announcement_id', announcementId)
            .order('created_at', { ascending: false })

        if (campaignsError) {
            console.error('Error obteniendo campañas:', campaignsError)
            return NextResponse.json(
                { error: 'Error obteniendo campañas' },
                { status: 500 }
            )
        }

        // Para cada campaña, obtener detalles de destinatarios
        const campaignsWithDetails = await Promise.all(
            (campaigns || []).map(async (campaign) => {
                const { data: recipients } = await supabase
                    .from('announcement_recipients')
                    .select('email_status, whatsapp_status')
                    .eq('campaign_id', campaign.id)

                return {
                    ...campaign,
                    recipientsCount: recipients?.length || 0,
                }
            })
        )

        return NextResponse.json({
            success: true,
            campaigns: campaignsWithDetails,
        })
    } catch (error) {
        console.error('Error en /api/announcements/[id]/campaign-status:', error)
        return NextResponse.json(
            {
                error: 'Error obteniendo estado de campañas',
                details: error instanceof Error ? error.message : 'Error desconocido',
            },
            { status: 500 }
        )
    }
}
