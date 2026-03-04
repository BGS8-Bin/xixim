import { z } from 'zod'
import { PAYMENT_STATUS } from '@/shared/status/payment-statuses'

/**
 * Esquema para crear un pago
 */
export const paymentCreateSchema = z.object({
    admission_request_id: z.string().uuid('ID de admisión inválido'),
    amount: z.number().positive('El monto debe ser mayor a 0'),
    currency: z.string().length(3, 'Código de moneda debe tener 3 caracteres').default('MXN'),
    status: z.enum([
        PAYMENT_STATUS.PENDING,
        PAYMENT_STATUS.CONFIRMED,
        PAYMENT_STATUS.REJECTED
    ] as const).default(PAYMENT_STATUS.PENDING),
    payment_method: z.string().max(50, 'Método de pago muy largo').optional().nullable(),
    payment_reference: z.string().max(100, 'Referencia muy larga').optional().nullable(),
    payment_date: z.string().optional().nullable(),
    proof_url: z.string().url('URL de comprobante inválida').optional().nullable(),
    notes: z.string().max(500, 'Notas muy largas').optional().nullable(),
})

/**
 * Esquema para confirmar un pago
 */
export const paymentConfirmSchema = z.object({
    status: z.literal(PAYMENT_STATUS.CONFIRMED),
    confirmed_by: z.string().uuid('UUID inválido'),
    confirmed_at: z.string().datetime('Fecha inválida'),
    proof_url: z.string().url('URL de comprobante inválida').optional().nullable(),
    notes: z.string().max(500, 'Notas muy largas').optional().nullable(),
})

/**
 * Esquema para rechazar un pago
 */
export const paymentRejectSchema = z.object({
    status: z.literal(PAYMENT_STATUS.REJECTED),
    confirmed_by: z.string().uuid('UUID inválido'),
    confirmed_at: z.string().datetime('Fecha inválida'),
    notes: z.string().min(10, 'Debe proporcionar una razón').max(500, 'Notas muy largas'),
})

/**
 * Esquema para actualizar datos básicos de pago
 */
export const paymentUpdateSchema = z.object({
    payment_method: z.string().max(50).optional(),
    payment_reference: z.string().max(100).optional(),
    payment_date: z.string().optional(),
    proof_url: z.string().url().optional(),
    notes: z.string().max(500).optional(),
})

// Tipos inferidos
export type PaymentCreateInput = z.infer<typeof paymentCreateSchema>
export type PaymentConfirmInput = z.infer<typeof paymentConfirmSchema>
export type PaymentRejectInput = z.infer<typeof paymentRejectSchema>
export type PaymentUpdateInput = z.infer<typeof paymentUpdateSchema>
