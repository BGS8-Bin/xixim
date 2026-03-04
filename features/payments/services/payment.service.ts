import { createClient } from "@/lib/supabase/client"
import { PAYMENT_STATUS } from "@/shared/status/payment-statuses"
import { ADMISSION_STATUS } from "@/shared/status/admission-statuses"
import { paymentConfirmSchema } from "@/shared/validation"
import type { ServiceResult } from "@/features/admissions/services/types"
import type { PaymentConfirmationData } from "./types"

/**
 * Servicio para gestionar la lógica de negocio de pagos
 */
export class PaymentService {
    /**
     * Confirma un pago y crea la empresa en el directorio
     * 
     * @param paymentId - ID del pago a confirmar
     * @param admissionId - ID de la solicitud de admisión asociada
     * @param userId - ID del usuario que confirma
     * @param notes - Notas opcionales sobre la confirmación
     * @returns Resultado con ID de la empresa creada
     */
    static async confirmPaymentAndCreateCompany(
        paymentId: string,
        admissionId: string,
        userId: string,
        notes?: string
    ): Promise<ServiceResult<PaymentConfirmationData>> {
        const supabase = createClient()

        try {
            // 1. Obtener datos de la solicitud
            const { data: admission, error: fetchError } = await supabase
                .from("admission_requests")
                .select("*")
                .eq("id", admissionId)
                .single()

            if (fetchError || !admission) {
                return {
                    success: false,
                    error: `Error al obtener datos de admisión: ${fetchError?.message || "No encontrada"}`,
                }
            }

            // 2. Actualizar estado del pago con validación
            const updateData = paymentConfirmSchema.parse({
                status: PAYMENT_STATUS.CONFIRMED,
                confirmed_by: userId,
                confirmed_at: new Date().toISOString(),
                notes: notes || undefined,
            })

            const { error: paymentError } = await supabase
                .from("payments")
                .update(updateData)
                .eq("id", paymentId)

            if (paymentError) {
                return {
                    success: false,
                    error: `Error al actualizar pago: ${paymentError.message}`,
                }
            }

            // 3. Crear empresa
            const { data: newCompany, error: companyError } = await supabase
                .from("companies")
                .insert({
                    name: admission.company_name,
                    legal_name: admission.trade_name,
                    rfc: admission.rfc,
                    sector: admission.sector,
                    description: admission.motivation,
                    website: admission.website,
                    email: admission.contact_email,
                    phone: admission.contact_phone,
                    employee_count: admission.employee_count ? parseInt(admission.employee_count) : null,
                    founded_year: admission.founding_year,
                    address: admission.address,
                    city: admission.city,
                    state: admission.state,
                    top_products: admission.top_products,
                    purchase_requirements: admission.purchase_requirements,
                    membership_status: "active",
                    membership_start_date: new Date().toISOString().split("T")[0],
                })
                .select()
                .single()

            if (companyError || !newCompany) {
                // Rollback: revertir estado del pago
                await supabase
                    .from("payments")
                    .update({ status: PAYMENT_STATUS.PENDING })
                    .eq("id", paymentId)

                return {
                    success: false,
                    error: `Error al crear empresa: ${companyError?.message || "Desconocido"}`,
                }
            }

            // 4. Crear contacto principal
            const nameParts = admission.contact_name.trim().split(" ")
            const firstName = nameParts[0] || ""
            const lastName = nameParts.slice(1).join(" ") || nameParts[0]

            const { error: contactError } = await supabase.from("company_contacts").insert({
                company_id: newCompany.id,
                first_name: firstName,
                last_name: lastName,
                email: admission.contact_email,
                phone: admission.contact_phone,
                position: admission.contact_position,
                birthday: admission.contact_birthday,
                is_primary: true,
            })

            if (contactError) {
                console.warn("Error creating contact (non-critical):", contactError)
            }

            // 5. Enviar notificación de bienvenida
            try {
                const { NotificationService } = await import("@/features/notifications/services")
                await NotificationService.notifyPaymentConfirmed({
                    contactName: admission.contact_name,
                    contactEmail: admission.contact_email,
                    contactPhone: admission.contact_phone,
                    companyName: admission.company_name,
                })
            } catch (notifError) {
                console.error("Error enviando notificación de bienvenida:", notifError)
            }

            // 6. Eliminar solicitud de admisión (ya procesada)
            const { error: admissionError } = await supabase
                .from("admission_requests")
                .delete()
                .eq("id", admissionId)

            if (admissionError) {
                console.warn("Error deleting admission request:", admissionError)
            }

            return {
                success: true,
                data: {
                    paymentId,
                    companyId: newCompany.id,
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
     * Rechaza un pago
     * 
     * @param paymentId - ID del pago a rechazar
     * @param userId - ID del usuario que rechaza
     * @param notes - Notas sobre el rechazo
     */
    static async reject(
        paymentId: string,
        userId: string,
        notes?: string
    ): Promise<ServiceResult> {
        const supabase = createClient()

        try {
            const { error } = await supabase
                .from("payments")
                .update({
                    status: PAYMENT_STATUS.REJECTED,
                    confirmed_by: userId,
                    confirmed_at: new Date().toISOString(),
                    notes: notes || null,
                })
                .eq("id", paymentId)

            if (error) {
                return {
                    success: false,
                    error: `Error al rechazar pago: ${error.message}`,
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
