import { ADMISSION_STATUS } from './admission-statuses'
import { PAYMENT_STATUS } from './payment-statuses'
import { MEMBERSHIP_STATUS } from './membership-statuses'

/**
 * Mapeos de estados a clases de Tailwind CSS
 */

export const admissionStatusColors: Record<string, string> = {
    [ADMISSION_STATUS.PENDING]: 'bg-yellow-100 text-yellow-800',
    [ADMISSION_STATUS.UNDER_REVIEW]: 'bg-blue-100 text-blue-800',
    [ADMISSION_STATUS.APPROVED]: 'bg-green-100 text-green-800',
    [ADMISSION_STATUS.REJECTED]: 'bg-red-100 text-red-800',
    [ADMISSION_STATUS.PAYMENT_PENDING]: 'bg-purple-100 text-purple-800',
    [ADMISSION_STATUS.DOCUMENTS_PENDING]: 'bg-cyan-100 text-cyan-800',
    [ADMISSION_STATUS.MORE_INFO_NEEDED]: 'bg-orange-100 text-orange-800',
    [ADMISSION_STATUS.COMPLETED]: 'bg-gray-100 text-gray-800'
}

export const paymentStatusColors: Record<string, string> = {
    [PAYMENT_STATUS.PENDING]: 'bg-yellow-100 text-yellow-800',
    [PAYMENT_STATUS.CONFIRMED]: 'bg-green-100 text-green-800',
    [PAYMENT_STATUS.REJECTED]: 'bg-red-100 text-red-800'
}

export const membershipStatusColors: Record<string, string> = {
    [MEMBERSHIP_STATUS.PENDING]: 'bg-yellow-100 text-yellow-800',
    [MEMBERSHIP_STATUS.ACTIVE]: 'bg-green-100 text-green-800',
    [MEMBERSHIP_STATUS.INACTIVE]: 'bg-gray-100 text-gray-800',
    [MEMBERSHIP_STATUS.SUSPENDED]: 'bg-red-100 text-red-800'
}
