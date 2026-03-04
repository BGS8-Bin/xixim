import { z } from 'zod'
import { ADMISSION_STATUS } from '@/shared/status/admission-statuses'

/**
 * Esquema para crear una nueva solicitud de admisión
 * Valida todos los campos requeridos y opcionales
 */
export const admissionCreateSchema = z.object({
    company_name: z.string().min(2, 'Nombre de empresa muy corto').max(200, 'Nombre muy largo'),
    rfc: z.string()
        .regex(/^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/, 'RFC inválido')
        .optional()
        .or(z.literal('')),
    contact_name: z.string().min(2, 'Nombre muy corto').max(100, 'Nombre muy largo'),
    contact_email: z.string().email('Email inválido'),
    contact_phone: z.string().min(10, 'Teléfono inválido'),
    contact_position: z.string().max(100).optional(),
    sector: z.enum(['tecnologia', 'manufactura', 'servicios', 'otro']),
    founding_year: z.number().int().min(1800).max(new Date().getFullYear()).optional().nullable(),
    years_in_operation: z.number().int().min(0).max(200).optional().nullable(),
    is_startup: z.boolean().optional().default(false),
    is_sat_registered: z.boolean().optional().default(false),
    services_interest: z.array(z.string()).optional().default([]),
    fiscal_document_url: z.string().url('URL inválida').optional().nullable(),
    brochure_url: z.string().url('URL inválida').optional().nullable(),
})

/**
 * Esquema para actualizar status de admisión
 */
export const admissionUpdateStatusSchema = z.object({
    status: z.enum([
        ADMISSION_STATUS.PENDING,
        ADMISSION_STATUS.UNDER_REVIEW,
        ADMISSION_STATUS.APPROVED,
        ADMISSION_STATUS.REJECTED,
        ADMISSION_STATUS.PAYMENT_PENDING,
        ADMISSION_STATUS.DOCUMENTS_PENDING,
        ADMISSION_STATUS.MORE_INFO_NEEDED,
        ADMISSION_STATUS.COMPLETED
    ] as const),
    reviewed_by: z.string().uuid('UUID inválido').optional(),
    reviewed_at: z.string().datetime('Fecha inválida').optional(),
    review_notes: z.string().max(1000, 'Notas muy largas').optional(),
})

/**
 * Esquema para rechazar una admisión
 */
export const admissionRejectSchema = z.object({
    status: z.literal(ADMISSION_STATUS.REJECTED),
    reviewed_by: z.string().uuid('UUID inválido'),
    reviewed_at: z.string().datetime('Fecha inválida'),
    review_notes: z.string().min(10, 'Debe proporcionar una razón').max(1000),
})

// Tipos inferidos automáticamente desde los esquemas
export type AdmissionCreateInput = z.infer<typeof admissionCreateSchema>
export type AdmissionUpdateStatusInput = z.infer<typeof admissionUpdateStatusSchema>
export type AdmissionRejectInput = z.infer<typeof admissionRejectSchema>
