import { createClient } from "@/lib/supabase/client"
import { ADMISSION_STATUS } from "@/shared/status/admission-statuses"
import { PAYMENT_STATUS } from "@/shared/status/payment-statuses"
import { ADMISSION_FEE, CURRENCY_DEFAULT } from "@/shared/money/constants"
import { paymentCreateSchema } from "@/shared/validation"
import type { ServiceResult, AdmissionApprovalData } from "./types"

/**
 * Servicio para gestionar la lógica de negocio de admisiones
 */
export class AdmissionService {
    /**
     * Aprueba una solicitud de admisión y crea un pago pendiente
     * 
     * @param admissionId - ID de la solicitud a aprobar
     * @param userId - ID del usuario que aprueba la solicitud
     * @returns Resultado de la operación con los IDs generados
     * 
     * @example
     * const result = await AdmissionService.approveAndCreatePayment(admissionId, userId)
     * if (result.success) {
     *   console.log('Payment created:', result.data.paymentId)
     * }
     */
    static async approveAndCreatePayment(
        admissionId: string,
        userId: string
    ): Promise<ServiceResult<AdmissionApprovalData>> {
        const supabase = createClient()

        try {
            // 1. Actualizar estado de la admisión a PAYMENT_PENDING
            const { error: admissionError } = await supabase
                .from("admission_requests")
                .update({
                    status: ADMISSION_STATUS.PAYMENT_PENDING,
                    reviewed_by: userId,
                    reviewed_at: new Date().toISOString(),
                })
                .eq("id", admissionId)

            if (admissionError) {
                return {
                    success: false,
                    error: `Error al actualizar solicitud: ${admissionError.message}`,
                }
            }

            // 2. Crear entrada de pago con validación
            // Validamos los datos antes de insertar
            const paymentData = paymentCreateSchema.parse({
                admission_request_id: admissionId,
                amount: ADMISSION_FEE,
                currency: CURRENCY_DEFAULT,
                status: PAYMENT_STATUS.PENDING,
            })

            const { data: payment, error: paymentError } = await supabase
                .from("payments")
                .insert(paymentData)
                .select("id")
                .single()

            if (paymentError) {
                // Rollback: revertir el estado de la admisión
                await supabase
                    .from("admission_requests")
                    .update({ status: ADMISSION_STATUS.PENDING })
                    .eq("id", admissionId)

                return {
                    success: false,
                    error: `Error al crear pago: ${paymentError.message}`,
                }
            }

            // 3. Enviar notificaciones de aprobación
            try {
                const { data: admission } = await supabase
                    .from("admission_requests")
                    .select("contact_name, contact_email, contact_phone, company_name")
                    .eq("id", admissionId)
                    .single()

                if (admission) {
                    const { NotificationService } = await import("@/features/notifications/services")
                    await NotificationService.notifyAdmissionApproved({
                        contactName: admission.contact_name,
                        contactEmail: admission.contact_email,
                        contactPhone: admission.contact_phone,
                        companyName: admission.company_name,
                        admissionFee: ADMISSION_FEE,
                    })
                }
            } catch (notifError) {
                // No bloqueamos el flujo si falla la notificación
                console.error("Error enviando notificaciones de aprobación:", notifError)
            }

            return {
                success: true,
                data: {
                    admissionId,
                    paymentId: payment.id,
                },
            }
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : "Error desconocido",
            }
        }
    }

    /**
     * Rechaza una solicitud de admisión
     * 
     * @param admissionId - ID de la solicitud a rechazar
     * @param userId - ID del usuario que rechaza
     * @param reason - Razón del rechazo (opcional)
     */
    static async reject(
        admissionId: string,
        userId: string,
        reason?: string
    ): Promise<ServiceResult> {
        const supabase = createClient()

        try {
            const { error } = await supabase
                .from("admission_requests")
                .update({
                    status: ADMISSION_STATUS.REJECTED,
                    reviewed_by: userId,
                    reviewed_at: new Date().toISOString(),
                    // rejection_reason: reason, // Si existe esta columna
                })
                .eq("id", admissionId)

            if (error) {
                return {
                    success: false,
                    error: `Error al rechazar solicitud: ${error.message}`,
                }
            }

            return { success: true }
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : "Error desconocido",
            }
        }
    }

    /**
     * Solicita más información sobre una admisión
     * 
     * @param admissionId - ID de la solicitud
     * @param userId - ID del usuario que solicita info
     */
    static async requestMoreInfo(
        admissionId: string,
        userId: string
    ): Promise<ServiceResult> {
        const supabase = createClient()

        try {
            const { error } = await supabase
                .from("admission_requests")
                .update({
                    status: ADMISSION_STATUS.MORE_INFO_NEEDED,
                    reviewed_by: userId,
                    reviewed_at: new Date().toISOString(),
                })
                .eq("id", admissionId)

            if (error) {
                return {
                    success: false,
                    error: `Error al solicitar información: ${error.message}`,
                }
            }

            return { success: true }
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : "Error desconocido",
            }
        }
    }
}
