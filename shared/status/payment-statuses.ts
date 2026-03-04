export const PAYMENT_STATUS = {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    REJECTED: 'rejected'
} as const

export type PaymentStatusValue = typeof PAYMENT_STATUS[keyof typeof PAYMENT_STATUS]
