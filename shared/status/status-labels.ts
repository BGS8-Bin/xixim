import { ADMISSION_STATUS } from './admission-statuses'
import { PAYMENT_STATUS } from './payment-statuses'
import { MEMBERSHIP_STATUS } from './membership-statuses'

/**
 * Mapeos de estados a etiquetas en español
 */

export const admissionStatusLabels: Record<string, string> = {
    [ADMISSION_STATUS.PENDING]: 'Pendiente',
    [ADMISSION_STATUS.UNDER_REVIEW]: 'En Revisión',
    [ADMISSION_STATUS.APPROVED]: 'Aprobada',
    [ADMISSION_STATUS.REJECTED]: 'Rechazada',
    [ADMISSION_STATUS.PAYMENT_PENDING]: 'Pago Pendiente',
    [ADMISSION_STATUS.DOCUMENTS_PENDING]: 'Documentos Pendientes',
    [ADMISSION_STATUS.MORE_INFO_NEEDED]: 'Más Info Necesaria',
    [ADMISSION_STATUS.COMPLETED]: 'Completada'
}

export const paymentStatusLabels: Record<string, string> = {
    [PAYMENT_STATUS.PENDING]: 'Pendiente',
    [PAYMENT_STATUS.CONFIRMED]: 'Confirmado',
    [PAYMENT_STATUS.REJECTED]: 'Rechazado'
}

export const membershipStatusLabels: Record<string, string> = {
    [MEMBERSHIP_STATUS.PENDING]: 'Pendiente',
    [MEMBERSHIP_STATUS.ACTIVE]: 'Activo',
    [MEMBERSHIP_STATUS.INACTIVE]: 'Inactivo',
    [MEMBERSHIP_STATUS.SUSPENDED]: 'Suspendido'
}

// Re-export colors for convenience
export { admissionStatusColors, paymentStatusColors, membershipStatusColors } from './status-colors'
