/**
 * Tipos para el servicio de notificaciones
 */

export type NotificationChannel = 'email' | 'whatsapp' | 'both'

export interface EmailNotification {
    to: string
    subject: string
    templateId?: string
    templateData?: Record<string, any>
    html?: string
    text?: string
}

export interface WhatsAppNotification {
    to: string // Formato: +52XXXXXXXXXX
    message: string
}

export interface NotificationResult {
    email?: {
        success: boolean
        messageId?: string
        error?: string
    }
    whatsapp?: {
        success: boolean
        messageId?: string
        error?: string
    }
}

export interface AdmissionReceivedData {
    contactName: string
    contactEmail: string
    contactPhone: string
    companyName: string
}

export interface AdmissionApprovedData {
    contactName: string
    contactEmail: string
    contactPhone: string
    companyName: string
    admissionFee: number
    paymentLink?: string
}

export interface PaymentConfirmedData {
    contactName: string
    contactEmail: string
    contactPhone: string
    companyName: string
    portalLink?: string
}
