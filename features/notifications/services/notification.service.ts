import type {
    EmailNotification,
    WhatsAppNotification,
    NotificationResult,
    AdmissionReceivedData,
    AdmissionApprovedData,
    PaymentConfirmedData,
} from './types'

/**
 * Servicio centralizado para envío de notificaciones
 * Soporta Email (SendGrid) y WhatsApp (Twilio)
 */
export class NotificationService {
    private static readonly SENDGRID_API_URL = 'https://api.sendgrid.com/v3/mail/send'
    private static readonly TWILIO_API_URL = 'https://api.twilio.com/2010-04-01/Accounts'

    /**
     * Envía notificación por email usando SendGrid
     */
    private static async sendEmail(notification: EmailNotification): Promise<NonNullable<NotificationResult['email']>> {
        const apiKey = process.env.SENDGRID_API_KEY

        if (!apiKey || apiKey === 'your_sendgrid_api_key_here') {
            console.log('📧 [MOCK] Email a:', notification.to)
            console.log('   Subject:', notification.subject)
            console.log('   ⚠️  SendGrid API Key no configurada - usa mock')
            return { success: true, messageId: 'mock-email-' + Date.now() }
        }

        try {
            const body: any = {
                personalizations: [
                    {
                        to: [{ email: notification.to }],
                    },
                ],
                from: {
                    email: process.env.SENDGRID_FROM_EMAIL || 'noreply@xixim.com',
                    name: process.env.SENDGRID_FROM_NAME || 'XIXIM Cluster',
                },
            }

            // Usar template o contenido directo
            if (notification.templateId && notification.templateId.trim() !== '' && notification.templateId !== 'd-your_template_id_here') {
                body.template_id = notification.templateId
                body.personalizations[0].dynamic_template_data = notification.templateData || {}
            } else {
                body.personalizations[0].subject = notification.subject
                body.content = [
                    {
                        type: 'text/html',
                        value: notification.html || notification.text || '',
                    },
                ]
            }

            console.log('Sending body to SendGrid:', JSON.stringify(body, null, 2));

            const response = await fetch(this.SENDGRID_API_URL, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            })

            if (!response.ok) {
                const error = await response.text()
                console.error('Error enviando email:', error)
                return { success: false, error: `SendGrid error: ${response.status}` }
            }

            const messageId = response.headers.get('x-message-id') || 'unknown'
            console.log('✅ Email enviado exitosamente:', messageId)
            return { success: true, messageId }
        } catch (error) {
            console.error('Error enviando email:', error)
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Error desconocido',
            }
        }
    }

    /**
     * Envía notificación por WhatsApp usando Twilio
     */
    private static async sendWhatsApp(notification: WhatsAppNotification): Promise<NonNullable<NotificationResult['whatsapp']>> {
        const accountSid = process.env.TWILIO_ACCOUNT_SID
        const authToken = process.env.TWILIO_AUTH_TOKEN
        const fromNumber = process.env.TWILIO_WHATSAPP_FROM

        if (
            !accountSid ||
            !authToken ||
            !fromNumber ||
            accountSid === 'your_twilio_account_sid_here'
        ) {
            console.log('📱 [MOCK] WhatsApp a:', notification.to)
            console.log('   Mensaje:', notification.message.substring(0, 50) + '...')
            console.log('   ⚠️  Twilio credenciales no configuradas - usa mock')
            return { success: true, messageId: 'mock-whatsapp-' + Date.now() }
        }

        try {
            const url = `${this.TWILIO_API_URL}/${accountSid}/Messages.json`

            const formData = new URLSearchParams({
                From: fromNumber,
                To: `whatsapp:${notification.to}`,
                Body: notification.message,
            })

            const credentials = btoa(`${accountSid}:${authToken}`)

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    Authorization: `Basic ${credentials}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formData.toString(),
            })

            if (!response.ok) {
                const error = await response.text()
                console.error('Error enviando WhatsApp:', error)
                return { success: false, error: `Twilio error: ${response.status}` }
            }

            const data = await response.json()
            console.log('✅ WhatsApp enviado exitosamente:', data.sid)
            return { success: true, messageId: data.sid }
        } catch (error) {
            console.error('Error enviando WhatsApp:', error)
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Error desconocido',
            }
        }
    }

    /**
     * Notificación: Nueva solicitud de admisión recibida
     */
    static async notifyAdmissionReceived(data: AdmissionReceivedData): Promise<NotificationResult> {
        console.log('📬 Enviando notificación: Nueva solicitud de admisión')

        const [emailResult, whatsappResult] = await Promise.all([
            // Email
            this.sendEmail({
                to: data.contactEmail,
                subject: '¡Gracias por tu solicitud a XIXIM!',
                templateId: process.env.SENDGRID_TEMPLATE_ADMISSION_RECEIVED,
                templateData: {
                    contact_name: data.contactName,
                    company_name: data.companyName,
                },
                html: `
          <h1>¡Hola ${data.contactName}!</h1>
          <p>Hemos recibido tu solicitud de admisión para <strong>${data.companyName}</strong> al Cluster XIXIM.</p>
          <p>Nuestro equipo estará revisando tu solicitud y te contactaremos pronto.</p>
          <p>Gracias por tu interés en formar parte de nuestra comunidad.</p>
          <p>Saludos,<br>Equipo XIXIM</p>
        `,
            }),

            // WhatsApp
            this.sendWhatsApp({
                to: data.contactPhone,
                message: `¡Hola ${data.contactName}! Recibimos tu solicitud de admisión de ${data.companyName} a XIXIM. Estaremos revisándola pronto. ¡Gracias por tu interés! 🚀`,
            }),
        ])

        return { email: emailResult, whatsapp: whatsappResult }
    }

    /**
     * Notificación: Solicitud de admisión aprobada
     */
    static async notifyAdmissionApproved(data: AdmissionApprovedData): Promise<NotificationResult> {
        console.log('🎉 Enviando notificación: Solicitud aprobada')

        const [emailResult, whatsappResult] = await Promise.all([
            // Email
            this.sendEmail({
                to: data.contactEmail,
                subject: '¡Felicidades! Tu solicitud fue aprobada',
                templateId: process.env.SENDGRID_TEMPLATE_ADMISSION_APPROVED,
                templateData: {
                    contact_name: data.contactName,
                    company_name: data.companyName,
                    admission_fee: data.admissionFee,
                    payment_link: data.paymentLink || '#',
                },
                html: `
          <h1>¡Felicidades, ${data.contactName}!</h1>
          <p>Tu solicitud para unirte al Cluster XIXIM con <strong>${data.companyName}</strong> ha sido <strong>aprobada</strong>.</p>
          
          <h2>Siguiente paso: Pago de membresía</h2>
          <p>Para completar tu registro, por favor procede con el pago de membresía:</p>
          <ul>
            <li><strong>Monto:</strong> $${data.admissionFee.toLocaleString('es-MX')} MXN</li>
            <li><strong>Concepto:</strong> Membresía XIXIM - ${data.companyName}</li>
          </ul>
          
          ${data.paymentLink ? `<p><a href="${data.paymentLink}" style="background-color: #4CAF50; color: white; padding: 15px 32px; text-decoration: none; display: inline-block; font-size: 16px; margin: 4px 2px; cursor: pointer; border-radius: 4px;">Proceder al Pago</a></p>` : ''}
          
          <p>Si tienes dudas, contáctanos.</p>
          <p>Saludos,<br>Equipo XIXIM</p>
        `,
            }),

            // WhatsApp
            this.sendWhatsApp({
                to: data.contactPhone,
                message: `¡Felicidades ${data.contactName}! 🎉 Tu solicitud de ${data.companyName} fue APROBADA. Siguiente paso: pago de membresía de $${data.admissionFee.toLocaleString('es-MX')} MXN. ¡Te esperamos en XIXIM!`,
            }),
        ])

        return { email: emailResult, whatsapp: whatsappResult }
    }

    /**
     * Notificación: Pago confirmado y bienvenida
     */
    static async notifyPaymentConfirmed(data: PaymentConfirmedData): Promise<NotificationResult> {
        console.log('✨ Enviando notificación: Pago confirmado - Bienvenida')

        const [emailResult, whatsappResult] = await Promise.all([
            // Email
            this.sendEmail({
                to: data.contactEmail,
                subject: '¡Bienvenido al Cluster XIXIM!',
                templateId: process.env.SENDGRID_TEMPLATE_PAYMENT_CONFIRMED,
                templateData: {
                    contact_name: data.contactName,
                    company_name: data.companyName,
                    portal_link: data.portalLink || '#',
                },
                html: `
          <h1>¡Bienvenido a XIXIM, ${data.contactName}!</h1>
          <p>Tu pago ha sido confirmado y <strong>${data.companyName}</strong> ahora es oficialmente parte del Cluster XIXIM.</p>
          
          <h2>Próximos pasos:</h2>
          <ul>
            <li>Accede a tu portal: ${data.portalLink ? `<a href="${data.portalLink}">Portal XIXIM</a>` : 'Portal XIXIM'}</li>
            <li>Completa tu perfil de empresa</li>
            <li>Explora el directorio de socios</li>
            <li>Participa en nuestros eventos</li>
          </ul>
          
          <p>¡Disfruta de todos los beneficios de ser parte de nuestra comunidad empresarial!</p>
          <p>Saludos,<br>Equipo XIXIM</p>
        `,
            }),

            // WhatsApp
            this.sendWhatsApp({
                to: data.contactPhone,
                message: `¡Bienvenido a XIXIM, ${data.contactName}! 🎊 Tu pago fue confirmado. ${data.companyName} ya es parte de nuestro cluster. ¡Disfruta de todos los beneficios!`,
            }),
        ])

        return { email: emailResult, whatsapp: whatsappResult }
    }

    /**
     * Envía notificación personalizada (para campañas)
     */
    static async sendCustomNotification(
        email: EmailNotification,
        whatsapp?: WhatsAppNotification
    ): Promise<NotificationResult> {
        const results: NotificationResult = {}

        if (email) {
            results.email = await this.sendEmail(email)
        }

        if (whatsapp) {
            results.whatsapp = await this.sendWhatsApp(whatsapp)
        }

        return results
    }

    /**
     * Envía emails en lote con rate limiting
     * @param recipients Lista de destinatarios con sus datos
     * @param batchSize Tamaño del lote (default: 50)
     * @param delayMs Delay entre lotes en milisegundos (default: 1000)
     */
    static async sendBulkEmails(
        recipients: Array<{
            email: string
            name: string
            data?: Record<string, any>
        }>,
        emailConfig: {
            subject: string
            templateId?: string
            html?: string
            text?: string
        },
        options: {
            batchSize?: number
            delayMs?: number
            onProgress?: (sent: number, total: number, failed: number) => void
        } = {}
    ): Promise<{
        total: number
        sent: number
        failed: number
        results: Array<{ email: string; success: boolean; messageId?: string; error?: string }>
    }> {
        const batchSize = options.batchSize || 50
        const delayMs = options.delayMs || 1000
        const results: Array<{ email: string; success: boolean; messageId?: string; error?: string }> = []

        console.log(`📧 Iniciando envío masivo de ${recipients.length} emails en lotes de ${batchSize}`)

        for (let i = 0; i < recipients.length; i += batchSize) {
            const batch = recipients.slice(i, i + batchSize)
            const batchNumber = Math.floor(i / batchSize) + 1
            const totalBatches = Math.ceil(recipients.length / batchSize)

            console.log(`📦 Procesando lote ${batchNumber}/${totalBatches} (${batch.length} emails)`)

            // Procesar el lote en paralelo
            const batchResults = await Promise.all(
                batch.map(async (recipient) => {
                    const result = await this.sendEmail({
                        to: recipient.email,
                        subject: emailConfig.subject,
                        templateId: emailConfig.templateId,
                        templateData: {
                            recipient_name: recipient.name,
                            ...recipient.data,
                        },
                        html: emailConfig.html,
                        text: emailConfig.text,
                    })

                    return {
                        email: recipient.email,
                        success: result.success,
                        messageId: result.messageId,
                        error: result.error,
                    }
                })
            )

            results.push(...batchResults)

            // Reportar progreso
            const sent = results.filter((r) => r.success).length
            const failed = results.filter((r) => !r.success).length
            if (options.onProgress) {
                options.onProgress(sent, recipients.length, failed)
            }

            console.log(`   ✅ Enviados: ${sent}, ❌ Fallidos: ${failed}`)

            // Delay antes del siguiente lote (excepto en el último)
            if (i + batchSize < recipients.length) {
                console.log(`   ⏳ Esperando ${delayMs}ms antes del siguiente lote...`)
                await new Promise((resolve) => setTimeout(resolve, delayMs))
            }
        }

        const sent = results.filter((r) => r.success).length
        const failed = results.filter((r) => !r.success).length

        console.log(`✅ Envío masivo completado: ${sent}/${recipients.length} enviados, ${failed} fallidos`)

        return {
            total: recipients.length,
            sent,
            failed,
            results,
        }
    }

    /**
     * Envía mensajes de WhatsApp en lote con rate limiting
     */
    static async sendBulkWhatsApp(
        recipients: Array<{
            phone: string
            name: string
            message: string
        }>,
        options: {
            batchSize?: number
            delayMs?: number
            onProgress?: (sent: number, total: number, failed: number) => void
        } = {}
    ): Promise<{
        total: number
        sent: number
        failed: number
        results: Array<{ phone: string; success: boolean; messageId?: string; error?: string }>
    }> {
        const batchSize = options.batchSize || 20 // WhatsApp tiene rate limits más estrictos
        const delayMs = options.delayMs || 2000 // Más delay para WhatsApp
        const results: Array<{ phone: string; success: boolean; messageId?: string; error?: string }> = []

        console.log(`📱 Iniciando envío masivo de ${recipients.length} WhatsApp en lotes de ${batchSize}`)

        for (let i = 0; i < recipients.length; i += batchSize) {
            const batch = recipients.slice(i, i + batchSize)
            const batchNumber = Math.floor(i / batchSize) + 1
            const totalBatches = Math.ceil(recipients.length / batchSize)

            console.log(`📦 Procesando lote ${batchNumber}/${totalBatches} (${batch.length} mensajes)`)

            // Procesar el lote en paralelo
            const batchResults = await Promise.all(
                batch.map(async (recipient) => {
                    const result = await this.sendWhatsApp({
                        to: recipient.phone,
                        message: recipient.message,
                    })

                    return {
                        phone: recipient.phone,
                        success: result.success,
                        messageId: result.messageId,
                        error: result.error,
                    }
                })
            )

            results.push(...batchResults)

            // Reportar progreso
            const sent = results.filter((r) => r.success).length
            const failed = results.filter((r) => !r.success).length
            if (options.onProgress) {
                options.onProgress(sent, recipients.length, failed)
            }

            console.log(`   ✅ Enviados: ${sent}, ❌ Fallidos: ${failed}`)

            // Delay antes del siguiente lote (excepto en el último)
            if (i + batchSize < recipients.length) {
                console.log(`   ⏳ Esperando ${delayMs}ms antes del siguiente lote...`)
                await new Promise((resolve) => setTimeout(resolve, delayMs))
            }
        }

        const sent = results.filter((r) => r.success).length
        const failed = results.filter((r) => !r.success).length

        console.log(`✅ Envío masivo completado: ${sent}/${recipients.length} enviados, ${failed} fallidos`)

        return {
            total: recipients.length,
            sent,
            failed,
            results,
        }
    }
}
