import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { CampaignService } from '@/features/campaigns/services/campaign.service'
import type { CampaignFilters } from '@/lib/types/database'

/**
 * POST /api/announcements/[id]/send
 * Crea y ejecuta una campaña de envío masivo para un anuncio
 */
export async function POST(
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

        // Verificar permisos (solo admin o editor)
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
        const body = await request.json()

        const {
            name,
            description,
            filters = {},
            sendToAllCompanies = false,
            sendToContacts = false,
            sendViaEmail = true,
            sendViaWhatsapp = false,
            sendgridTemplateId,
            scheduledAt,
            executeImmediately = true,
        } = body

        // Verificar que el anuncio existe y está publicado
        const { data: announcement, error: announcementError } = await supabase
            .from('announcements')
            .select('*')
            .eq('id', announcementId)
            .single()

        if (announcementError || !announcement) {
            return NextResponse.json({ error: 'Anuncio no encontrado' }, { status: 404 })
        }

        if (announcement.status !== 'published') {
            return NextResponse.json(
                { error: 'El anuncio debe estar publicado para enviar' },
                { status: 400 }
            )
        }

        // Crear la campaña
        const campaign = await CampaignService.createCampaign({
            announcementId,
            name: name || `Campaña: ${announcement.title}`,
            description,
            filters: filters as CampaignFilters,
            sendToAllCompanies,
            sendToContacts,
            sendViaEmail,
            sendViaWhatsapp,
            sendgridTemplateId,
            scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
            createdBy: user.id,
        })

        // Obtener empresas filtradas
        const companies = await CampaignService.getFilteredCompanies(
            filters as CampaignFilters,
            sendToAllCompanies
        )

        if (companies.length === 0) {
            return NextResponse.json(
                { error: 'No se encontraron empresas con los filtros especificados' },
                { status: 400 }
            )
        }

        // Crear destinatarios
        await CampaignService.createRecipients(campaign.id, companies, sendToContacts)

        // Si se debe ejecutar inmediatamente, ejecutar la campaña
        if (executeImmediately && !scheduledAt) {
            // Ejecutar en background (no esperar respuesta)
            CampaignService.executeCampaign(campaign.id).catch((error) => {
                console.error('Error ejecutando campaña:', error)
            })

            return NextResponse.json({
                success: true,
                message: 'Campaña iniciada exitosamente',
                campaign: {
                    id: campaign.id,
                    name: campaign.name,
                    totalRecipients: campaign.total_recipients,
                    status: 'sending',
                },
            })
        }

        return NextResponse.json({
            success: true,
            message: scheduledAt
                ? 'Campaña programada exitosamente'
                : 'Campaña creada exitosamente',
            campaign: {
                id: campaign.id,
                name: campaign.name,
                totalRecipients: campaign.total_recipients,
                status: campaign.status,
                scheduledAt: campaign.scheduled_at,
            },
        })
    } catch (error) {
        console.error('Error en /api/announcements/[id]/send:', error)
        return NextResponse.json(
            { error: 'Error creando la campaña', details: error instanceof Error ? error.message : 'Error desconocido' },
            { status: 500 }
        )
    }
}
