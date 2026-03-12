import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { CampaignService } from '@/features/campaigns/services/campaign.service'
import type { CampaignFilters } from '@/lib/types/database'

/**
 * POST /api/announcements/preview-audience
 * Devuelve la lista de destinatarios (empresas y contactos) basados en filtros
 */
export async function POST(request: NextRequest) {
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

        const body = await request.json()
        const {
            filters = {},
            sendToAllCompanies = false,
            sendToContacts = false,
        } = body

        // Obtener empresas filtradas
        const companies = await CampaignService.getFilteredCompanies(
            filters as CampaignFilters,
            sendToAllCompanies
        )

        let recipientsPreview = []

        for (const company of companies) {
            // Empresa principal
            recipientsPreview.push({
                id: `company_${company.id}`,
                companyId: company.id,
                contactId: null,
                type: 'Empresa',
                companyName: company.name,
                name: company.name,
                email: company.email,
                phone: company.phone
            })

            // Si incluye contactos
            if (sendToContacts) {
                const contacts = await CampaignService.getCompanyContacts(company.id)
                for (const contact of contacts) {
                    recipientsPreview.push({
                        id: `contact_${contact.id}`,
                        companyId: company.id,
                        contactId: contact.id,
                        type: 'Contacto',
                        companyName: company.name,
                        name: `${contact.first_name} ${contact.last_name}`,
                        email: contact.email,
                        phone: contact.phone
                    })
                }
            }
        }

        return NextResponse.json({
            success: true,
            total: recipientsPreview.length,
            recipients: recipientsPreview
        })
    } catch (error) {
        console.error('Error en /api/announcements/preview-audience:', error)
        return NextResponse.json(
            { error: 'Error obteniendo vista previa', details: error instanceof Error ? error.message : 'Error desconocido' },
            { status: 500 }
        )
    }
}
