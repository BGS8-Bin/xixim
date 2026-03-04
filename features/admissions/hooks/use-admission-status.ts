import { useMemo } from "react"
import { ADMISSION_STATUS } from "@/shared/status/admission-statuses"
import type { AdmissionStatus } from "@/lib/types/database"

/**
 * Hook para obtener estados derivados de una admisión
 * 
 * @param status - Estado actual de la admisión
 * @returns Objeto con flags booleanos para cada estado
 * 
 * @example
 * const { isPending, canApprove, isPaymentPending } = useAdmissionStatus(admission.status)
 * 
 * return (
 *   <>
 *     {canApprove && <ApproveButton />}
 *     {isPaymentPending && <PaymentMessage />}
 *   </>
 * )
 */
export function useAdmissionStatus(status: AdmissionStatus) {
    return useMemo(() => {
        const isPending = status === ADMISSION_STATUS.PENDING
        const isUnderReview = status === ADMISSION_STATUS.UNDER_REVIEW
        const isApproved = status === ADMISSION_STATUS.APPROVED
        const isRejected = status === ADMISSION_STATUS.REJECTED
        const isPaymentPending = status === ADMISSION_STATUS.PAYMENT_PENDING
        const isDocumentsPending = status === ADMISSION_STATUS.DOCUMENTS_PENDING
        const isMoreInfoNeeded = status === ADMISSION_STATUS.MORE_INFO_NEEDED
        const isCompleted = status === ADMISSION_STATUS.COMPLETED

        // Estados derivados combinados
        const canApprove = isPending || isUnderReview
        const canReject = isPending || isUnderReview
        const requiresAction = isPending || isMoreInfoNeeded

        return {
            // Estados base
            isPending,
            isUnderReview,
            isApproved,
            isRejected,
            isPaymentPending,
            isDocumentsPending,
            isMoreInfoNeeded,
            isCompleted,

            // Estados derivados
            canApprove,
            canReject,
            requiresAction,
        }
    }, [status])
}
