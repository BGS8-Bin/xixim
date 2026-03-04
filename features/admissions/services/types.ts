/**
 * Tipos para los servicios de admisiones
 */

export interface ServiceResult<T = void> {
    success: boolean
    data?: T
    error?: string
}

export interface AdmissionApprovalData {
    admissionId: string
    paymentId: string
}
