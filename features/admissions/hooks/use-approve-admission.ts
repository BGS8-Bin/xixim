import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { AdmissionService } from "@/features/admissions/services"

interface UseApproveAdmissionOptions {
    /**
     * Callback ejecutado después de aprobar exitosamente
     */
    onSuccess?: () => void

    /**
     * Si es true, redirige a /dashboard/pagos después de aprobar
     * @default true
     */
    redirectToPayments?: boolean
}

/**
 * Hook para manejar la aprobación de admisiones
 * 
 * Encapsula toda la lógica: loading state, auth, servicio, toast, navegación
 * 
 * @param admissionId - ID de la admisión a aprobar
 * @param options - Opciones de configuración
 * @returns Objeto con función approve, estado isApproving y error
 * 
 * @example
 * const { approve, isApproving } = useApproveAdmission(admissionId, {
 *   redirectToPayments: true,
 *   onSuccess: () => console.log('Aprobado!')
 * })
 * 
 * return (
 *   <Button onClick={approve} disabled={isApproving}>
 *     {isApproving ? <Loader /> : 'Aprobar'}
 *   </Button>
 * )
 */
export function useApproveAdmission(
    admissionId: string,
    options: UseApproveAdmissionOptions = {}
) {
    const { onSuccess, redirectToPayments = true } = options

    const router = useRouter()
    const { toast } = useToast()
    const [isApproving, setIsApproving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const approve = useCallback(async () => {
        setIsApproving(true)
        setError(null)
        const supabase = createClient()

        try {
            // 1. Obtener usuario autenticado
            const {
                data: { user },
            } = await supabase.auth.getUser()

            if (!user) {
                throw new Error("Usuario no autenticado")
            }

            // 2. Llamar al servicio para aprobar y crear pago
            const result = await AdmissionService.approveAndCreatePayment(admissionId, user.id)

            if (!result.success) {
                throw new Error(result.error || "Error al procesar la solicitud")
            }

            // 3. Mostrar toast de éxito
            toast({
                title: "Solicitud aceptada",
                description: "La solicitud ha sido aceptada y enviada al módulo de pagos.",
            })

            // 4. Ejecutar callback de éxito (si existe)
            onSuccess?.()

            // 5. Navegar a pagos (si está habilitado)
            if (redirectToPayments) {
                router.push("/dashboard/pagos")
            }

            // 6. Refrescar datos
            router.refresh()
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Hubo un error al aceptar la solicitud."

            setError(errorMessage)
            console.error("Error approving admission:", err)

            // Mostrar toast de error
            toast({
                variant: "destructive",
                title: "Error",
                description: errorMessage,
            })
        } finally {
            setIsApproving(false)
        }
    }, [admissionId, onSuccess, redirectToPayments, router, toast])

    return {
        approve,
        isApproving,
        error,
    }
}
