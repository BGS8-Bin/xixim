export const ADMISSION_STATUS = {
    PENDING: 'pending',
    UNDER_REVIEW: 'under_review',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    PAYMENT_PENDING: 'payment_pending',
    DOCUMENTS_PENDING: 'documents_pending',
    MORE_INFO_NEEDED: 'more_info_needed',
    COMPLETED: 'completed'
} as const

export type AdmissionStatusValue = typeof ADMISSION_STATUS[keyof typeof ADMISSION_STATUS]
