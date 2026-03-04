import { createClient } from '@/lib/supabase/server'
import type {
    AnnouncementCampaign,
    AnnouncementRecipient,
    CampaignFilters,
    Company,
    CompanyContact,
    Announcement,
} from '@/lib/types/database'
import { NotificationService } from '@/features/notifications/services/notification.service'

/**
 * Servicio para gestionar campañas de envío masivo de avisos
 */
export class CampaignService {
    /**
     * Obtiene empresas filtradas según los criterios especificados
     */
    static async getFilteredCompanies(
        filters: CampaignFilters,
        sendToAllCompanies: boolean = false
    ): Promise<Company[]> {
        const supabase = await createClient()

        let query = supabase
            .from('companies')
            .select('*')
            .order('name', { ascending: true })

        // Si no es "enviar a todas", aplicar filtros
        if (!sendToAllCompanies) {
            if (filters.membership_status && filters.membership_status.length > 0) {
                query = query.in('membership_status', filters.membership_status)
            }

            if (filters.membership_type && filters.membership_type.length > 0) {
                query = query.in('membership_type', filters.membership_type)
            }

            if (filters.sector && filters.sector.length > 0) {
                query = query.in('sector', filters.sector)
            }

            if (filters.size && filters.size.length > 0) {
                query = query.in('size', filters.size)
            }

            if (filters.city && filters.city.length > 0) {
                query = query.in('city', filters.city)
            }

            if (filters.state && filters.state.length > 0) {
                query = query.in('state', filters.state)
            }
        }

        const { data, error } = await query

        if (error) {
            console.error('Error obteniendo empresas filtradas:', error)
            throw new Error('Error obteniendo empresas filtradas')
        }

        return (data || []) as Company[]
    }

    /**
     * Obtiene todos los contactos de una empresa
     */
    static async getCompanyContacts(companyId: string): Promise<CompanyContact[]> {
        const supabase = await createClient()

        const { data, error } = await supabase
            .from('company_contacts')
            .select('*')
            .eq('company_id', companyId)

        if (error) {
            console.error('Error obteniendo contactos:', error)
            return []
        }

        return (data || []) as CompanyContact[]
    }

    /**
     * Crea una nueva campaña de envío
     */
    static async createCampaign(params: {
        announcementId: string
        name: string
        description?: string
        filters: CampaignFilters
        sendToAllCompanies: boolean
        sendToContacts: boolean
        sendViaEmail: boolean
        sendViaWhatsapp: boolean
        sendgridTemplateId?: string
        scheduledAt?: Date
        createdBy: string
    }): Promise<AnnouncementCampaign> {
        const supabase = await createClient()

        // Obtener destinatarios para calcular el total
        const companies = await this.getFilteredCompanies(params.filters, params.sendToAllCompanies)
        let totalRecipients = companies.length

        // Si se envía a contactos también, sumar todos los contactos
        if (params.sendToContacts) {
            for (const company of companies) {
                const contacts = await this.getCompanyContacts(company.id)
                totalRecipients += contacts.length
            }
        }

        const { data, error } = await supabase
            .from('announcement_campaigns')
            .insert({
                announcement_id: params.announcementId,
                name: params.name,
                description: params.description || null,
                filters: params.filters as any,
                send_to_all_companies: params.sendToAllCompanies,
                send_to_contacts: params.sendToContacts,
                total_recipients: totalRecipients,
                send_via_email: params.sendViaEmail,
                send_via_whatsapp: params.sendViaWhatsapp,
                sendgrid_template_id: params.sendgridTemplateId || null,
                scheduled_at: params.scheduledAt?.toISOString() || null,
                status: params.scheduledAt ? 'scheduled' : 'draft',
                created_by: params.createdBy,
            })
            .select()
            .single()

        if (error) {
            console.error('Error creando campaña:', error)
            throw new Error('Error creando campaña')
        }

        return data as AnnouncementCampaign
    }

    /**
     * Crea los registros de destinatarios para una campaña
     */
    static async createRecipients(
        campaignId: string,
        companies: Company[],
        sendToContacts: boolean
    ): Promise<void> {
        const supabase = await createClient()
        const recipients: any[] = []

        for (const company of companies) {
            // Agregar email principal de la empresa
            recipients.push({
                campaign_id: campaignId,
                company_id: company.id,
                contact_id: null,
                recipient_email: company.email,
                recipient_name: company.name,
                recipient_phone: company.phone || null,
                email_status: 'pending',
                whatsapp_status: 'pending',
            })

            // Si se envía a contactos, agregar todos los contactos
            if (sendToContacts) {
                const contacts = await this.getCompanyContacts(company.id)
                for (const contact of contacts) {
                    recipients.push({
                        campaign_id: campaignId,
                        company_id: company.id,
                        contact_id: contact.id,
                        recipient_email: contact.email,
                        recipient_name: `${contact.first_name} ${contact.last_name}`,
                        recipient_phone: contact.phone || null,
                        email_status: 'pending',
                        whatsapp_status: 'pending',
                    })
                }
            }
        }

        // Insertar en lotes para evitar límites de Supabase
        const batchSize = 500
        for (let i = 0; i < recipients.length; i += batchSize) {
            const batch = recipients.slice(i, i + batchSize)
            const { error } = await supabase.from('announcement_recipients').insert(batch)

            if (error) {
                console.error('Error creando destinatarios:', error)
                throw new Error('Error creando destinatarios')
            }
        }

        console.log(`✅ Creados ${recipients.length} destinatarios para la campaña`)
    }

    /**
     * Ejecuta una campaña de envío masivo
     */
    static async executeCampaign(campaignId: string): Promise<void> {
        const supabase = await createClient()

        // Obtener la campaña
        const { data: campaign, error: campaignError } = await supabase
            .from('announcement_campaigns')
            .select('*, announcement:announcements(*)')
            .eq('id', campaignId)
            .single()

        if (campaignError || !campaign) {
            throw new Error('Campaña no encontrada')
        }

        // Verificar que esté en estado válido
        if (!['draft', 'scheduled'].includes(campaign.status)) {
            throw new Error('La campaña no está en un estado válido para envío')
        }

        // Actualizar estado a "sending"
        await supabase
            .from('announcement_campaigns')
            .update({
                status: 'sending',
                started_at: new Date().toISOString(),
            })
            .eq('id', campaignId)

        console.log(`🚀 Iniciando ejecución de campaña: ${campaign.name}`)

        try {
            // Obtener destinatarios
            const { data: recipients, error: recipientsError } = await supabase
                .from('announcement_recipients')
                .select('*')
                .eq('campaign_id', campaignId)
                .eq('email_status', 'pending')

            if (recipientsError) {
                throw new Error('Error obteniendo destinatarios')
            }

            const announcement = campaign.announcement as Announcement

            // Enviar emails si está habilitado
            if (campaign.send_via_email && recipients && recipients.length > 0) {
                const emailRecipients = recipients.map((r: any) => ({
                    email: r.recipient_email,
                    name: r.recipient_name || 'Empresa',
                    data: {
                        announcement_title: announcement.title,
                        announcement_content: announcement.content,
                        announcement_excerpt: announcement.excerpt,
                    },
                }))

                // Preparar configuración del email
                const emailSubject = `${announcement.title} - XIXIM Cluster`
                const emailHtml = this.generateEmailHTML(announcement)

                const emailResults = await NotificationService.sendBulkEmails(
                    emailRecipients,
                    {
                        subject: emailSubject,
                        templateId: campaign.sendgrid_template_id || undefined,
                        html: campaign.sendgrid_template_id ? undefined : emailHtml,
                    },
                    {
                        batchSize: 50,
                        delayMs: 1000,
                        onProgress: (sent, total, failed) => {
                            console.log(`📊 Progreso: ${sent}/${total} enviados, ${failed} fallidos`)
                        },
                    }
                )

                // Actualizar estado de destinatarios basado en resultados
                for (const result of emailResults.results) {
                    const recipient = recipients.find((r: any) => r.recipient_email === result.email)
                    if (recipient) {
                        await supabase
                            .from('announcement_recipients')
                            .update({
                                email_status: result.success ? 'sent' : 'failed',
                                sendgrid_message_id: result.messageId || null,
                                email_sent_at: result.success ? new Date().toISOString() : null,
                                error_message: result.error || null,
                            })
                            .eq('id', recipient.id)
                    }
                }
            }

            // Enviar WhatsApp si está habilitado
            if (campaign.send_via_whatsapp && recipients && recipients.length > 0) {
                const whatsappRecipients = recipients
                    .filter((r: any) => r.recipient_phone)
                    .map((r: any) => ({
                        phone: r.recipient_phone,
                        name: r.recipient_name || 'Empresa',
                        message: this.generateWhatsAppMessage(announcement),
                    }))

                if (whatsappRecipients.length > 0) {
                    const whatsappResults = await NotificationService.sendBulkWhatsApp(
                        whatsappRecipients,
                        {
                            batchSize: 20,
                            delayMs: 2000,
                            onProgress: (sent, total, failed) => {
                                console.log(`📊 WhatsApp Progreso: ${sent}/${total} enviados, ${failed} fallidos`)
                            },
                        }
                    )

                    // Actualizar estado de WhatsApp
                    for (const result of whatsappResults.results) {
                        const recipient = recipients.find((r: any) => r.recipient_phone === result.phone)
                        if (recipient) {
                            await supabase
                                .from('announcement_recipients')
                                .update({
                                    whatsapp_status: result.success ? 'sent' : 'failed',
                                    twilio_message_sid: result.messageId || null,
                                    whatsapp_sent_at: result.success ? new Date().toISOString() : null,
                                    error_message: result.error || null,
                                })
                                .eq('id', recipient.id)
                        }
                    }
                }
            }

            // Actualizar campaña a "sent"
            await supabase
                .from('announcement_campaigns')
                .update({
                    status: 'sent',
                    completed_at: new Date().toISOString(),
                })
                .eq('id', campaignId)

            console.log(`✅ Campaña completada exitosamente: ${campaign.name}`)
        } catch (error) {
            console.error('Error ejecutando campaña:', error)

            // Marcar campaña como fallida
            await supabase
                .from('announcement_campaigns')
                .update({
                    status: 'failed',
                    completed_at: new Date().toISOString(),
                })
                .eq('id', campaignId)

            throw error
        }
    }

    /**
     * Genera el HTML del email para un anuncio
     */
    private static generateEmailHTML(announcement: Announcement): string {
        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background-color: #4F46E5;
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 8px 8px 0 0;
        }
        .content {
            background-color: #ffffff;
            padding: 30px;
            border: 1px solid #e5e7eb;
            border-top: none;
        }
        .footer {
            background-color: #f9fafb;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #6b7280;
            border-radius: 0 0 8px 8px;
        }
        .badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
            margin-bottom: 10px;
        }
        .badge-urgent { background-color: #fee2e2; color: #991b1b; }
        .badge-high { background-color: #fed7aa; color: #9a3412; }
        .badge-normal { background-color: #dbeafe; color: #1e40af; }
        .badge-low { background-color: #f3f4f6; color: #374151; }
    </style>
</head>
<body>
    <div class="header">
        <h1>XIXIM Cluster</h1>
        <p>Cluster de Empresas de Base Tecnológica</p>
    </div>
    <div class="content">
        ${announcement.priority === 'urgent' ? '<span class="badge badge-urgent">URGENTE</span>' : ''}
        ${announcement.priority === 'high' ? '<span class="badge badge-high">ALTA PRIORIDAD</span>' : ''}
        <h2>${announcement.title}</h2>
        ${announcement.excerpt ? `<p><strong>${announcement.excerpt}</strong></p>` : ''}
        <div>
            ${announcement.content}
        </div>
        ${announcement.image_url ? `<p><img src="${announcement.image_url}" alt="Imagen" style="max-width: 100%; height: auto; margin-top: 20px;" /></p>` : ''}
    </div>
    <div class="footer">
        <p>Este mensaje fue enviado por XIXIM Cluster</p>
        <p>Si tienes dudas, contacta a nuestro equipo</p>
    </div>
</body>
</html>
        `.trim()
    }

    /**
     * Genera el mensaje de WhatsApp para un anuncio
     */
    private static generateWhatsAppMessage(announcement: Announcement): string {
        let message = `🔔 *${announcement.title}*\n\n`

        if (announcement.excerpt) {
            message += `${announcement.excerpt}\n\n`
        }

        // Extraer texto plano del contenido HTML (simplificado)
        const plainContent = announcement.content
            .replace(/<[^>]*>/g, '')
            .replace(/&nbsp;/g, ' ')
            .trim()

        // Limitar a 300 caracteres para WhatsApp
        if (plainContent.length > 300) {
            message += plainContent.substring(0, 297) + '...\n\n'
        } else {
            message += plainContent + '\n\n'
        }

        message += `_XIXIM Cluster - Empresas de Base Tecnológica_`

        return message
    }

    /**
     * Obtiene estadísticas de una campaña
     */
    static async getCampaignStats(campaignId: string) {
        const supabase = await createClient()

        const { data: campaign, error } = await supabase
            .from('announcement_campaigns')
            .select('*')
            .eq('id', campaignId)
            .single()

        if (error || !campaign) {
            throw new Error('Campaña no encontrada')
        }

        return {
            total: campaign.total_recipients,
            emailsSent: campaign.emails_sent,
            emailsFailed: campaign.emails_failed,
            emailsOpened: campaign.emails_opened,
            emailsClicked: campaign.emails_clicked,
            whatsappSent: campaign.whatsapp_sent,
            whatsappFailed: campaign.whatsapp_failed,
            status: campaign.status,
            startedAt: campaign.started_at,
            completedAt: campaign.completed_at,
        }
    }
}
