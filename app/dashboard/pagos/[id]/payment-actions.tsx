"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { CheckCircle2, XCircle, Loader2, FileCheck } from "lucide-react"
import type { PaymentStatus } from "@/lib/types/database"

interface PaymentActionsProps {
  paymentId: string
  admissionId: string
  currentStatus: PaymentStatus
}

export function PaymentActions({ paymentId, admissionId, currentStatus }: PaymentActionsProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [notes, setNotes] = useState("")

  const confirmPayment = async () => {
    setIsLoading(true)
    const supabase = createClient()

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("Usuario no autenticado")
      }

      // Usar el servicio para confirmar pago y crear empresa
      const { PaymentService } = await import("@/features/payments/services")
      const result = await PaymentService.confirmPaymentAndCreateCompany(
        paymentId,
        admissionId,
        user.id,
        notes
      )

      if (!result.success) {
        throw new Error(result.error || "Error al procesar el pago")
      }

      toast({
        title: "Pago confirmado y empresa creada",
        description: "El pago ha sido confirmado y la empresa ha sido agregada al directorio de socios.",
      })

      // Redirect to companies page
      router.push("/dashboard/empresas")
      router.refresh()
    } catch (error) {
      console.error("Error confirming payment:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Hubo un error al confirmar el pago.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const rejectPayment = async () => {
    setIsLoading(true)
    const supabase = createClient()

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("Usuario no autenticado")
      }

      // Usar el servicio para rechazar pago
      const { PaymentService } = await import("@/features/payments/services")
      const result = await PaymentService.reject(paymentId, user.id, notes)

      if (!result.success) {
        throw new Error(result.error || "Error al rechazar el pago")
      }

      toast({
        title: "Pago rechazado",
        description: "El pago ha sido rechazado.",
      })

      router.refresh()
    } catch (error) {
      console.error("Error rejecting payment:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Hubo un error al rechazar el pago.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const isPending = currentStatus === "pending"

  return (
    <div className="space-y-4">
      {isPending ? (
        <>
          <div className="space-y-2">
            <Label htmlFor="notes">Notas de confirmación</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Agregar notas sobre la confirmación o rechazo..."
              rows={3}
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <Button
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              onClick={confirmPayment}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="mr-2 h-4 w-4" />
              )}
              Confirmar Pago
            </Button>

            <Button className="w-full" variant="destructive" onClick={rejectPayment} disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <XCircle className="mr-2 h-4 w-4" />}
              Rechazar Pago
            </Button>
          </div>
        </>
      ) : (
        <div className="space-y-4">
          {currentStatus === "confirmed" ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle2 className="h-5 w-5" />
                <p className="font-semibold">Pago confirmado</p>
              </div>
              <p className="text-sm text-green-600 mt-1">El proceso continúa con la entrega de documentación</p>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-red-700">
                <XCircle className="h-5 w-5" />
                <p className="font-semibold">Pago rechazado</p>
              </div>
              <p className="text-sm text-red-600 mt-1">Este pago ha sido rechazado</p>
            </div>
          )}

          {currentStatus === "confirmed" && (
            <Button className="w-full bg-transparent" variant="outline" asChild>
              <a href={`/dashboard/documentos?admission=${admissionId}`}>
                <FileCheck className="mr-2 h-4 w-4" />
                Ver Documentación
              </a>
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
