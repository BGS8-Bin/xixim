import { z } from 'zod'
import { MEMBERSHIP_STATUS } from '@/shared/status/membership-statuses'

/**
 * Esquema para crear una empresa
 */
export const companyCreateSchema = z.object({
    company_name: z.string().min(2, 'Nombre muy corto').max(200, 'Nombre muy largo'),
    rfc: z.string()
        .regex(/^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/, 'RFC inválido')
        .optional()
        .nullable(),
    sector: z.enum([
        'software',
        'hardware',
        'telecomunicaciones',
        'consultoria',
        'manufactura',
        'servicios',
        'educacion',
        'investigacion',
        'otro'
    ]),
    contact_name: z.string().min(2).max(100),
    contact_email: z.string().email('Email inválido'),
    contact_phone: z.string().min(10, 'Teléfono inválido'),
    membership_status: z.enum([
        MEMBERSHIP_STATUS.PENDING,
        MEMBERSHIP_STATUS.ACTIVE,
        MEMBERSHIP_STATUS.INACTIVE,
        MEMBERSHIP_STATUS.SUSPENDED
    ] as const).default(MEMBERSHIP_STATUS.ACTIVE),
    website: z.string().url('URL inválida').optional().nullable(),
    description: z.string().max(1000).optional().nullable(),
})

/**
 * Esquema para actualizar información de empresa
 */
export const companyUpdateSchema = z.object({
    company_name: z.string().min(2).max(200).optional(),
    rfc: z.string().regex(/^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/).optional(),
    sector: z.enum([
        'software',
        'hardware',
        'telecomunicaciones',
        'consultoria',
        'manufactura',
        'servicios',
        'educacion',
        'investigacion',
        'otro'
    ]).optional(),
    contact_name: z.string().min(2).max(100).optional(),
    contact_email: z.string().email().optional(),
    contact_phone: z.string().min(10).optional(),
    membership_status: z.enum([
        MEMBERSHIP_STATUS.PENDING,
        MEMBERSHIP_STATUS.ACTIVE,
        MEMBERSHIP_STATUS.INACTIVE,
        MEMBERSHIP_STATUS.SUSPENDED
    ] as const).optional(),
    website: z.string().url().optional().nullable(),
    description: z.string().max(1000).optional().nullable(),
})

// Tipos inferidos
export type CompanyCreateInput = z.infer<typeof companyCreateSchema>
export type CompanyUpdateInput = z.infer<typeof companyUpdateSchema>
