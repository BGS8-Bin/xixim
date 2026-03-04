"use client"

import { Button } from "@/components/ui/button"
import { CheckCircle2, Loader2, DollarSign } from "lucide-react"
import type { AdmissionStatus } from "@/lib/types/database"
import { useAdmissionStatus, useApproveAdmission } from "@/features/admissions/hooks"

interface AdmissionActionsProps {
  admissionId: string
  currentStatus: AdmissionStatus
}

export function AdmissionActions({ admissionId, currentStatus }: AdmissionActionsProps) {
  const { isPending, isPaymentPending } = useAdmissionStatus(currentStatus)
  const { approve, isApproving } = useApproveAdmission(admissionId, {
    redirectToPayments: true
  })

  return (
    <div className="space-y-4">
      {isPending && (
        <Button
          className="w-full bg-green-600 hover:bg-green-700 text-white"
          onClick={approve}
          disabled={isApproving}
        >
          {isApproving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
          Aceptar y Enviar a Pagos
        </Button>
      )}

      {isPaymentPending && (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle2 className="h-5 w-5" />
              <p className="font-semibold">Solicitud aceptada</p>
            </div>
            <p className="text-sm text-green-600 mt-1">Pendiente de pago para continuar el proceso</p>
          </div>
          <Button className="w-full bg-transparent" variant="outline" asChild>
            <a href={`/dashboard/pagos`}>
              <DollarSign className="mr-2 h-4 w-4" />
              Ver Módulo de Pagos
            </a>
          </Button>
        </div>
      )}

      {currentStatus === "completed" && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-green-700">
            <CheckCircle2 className="h-5 w-5" />
            <p className="font-semibold">Proceso completado</p>
          </div>
          <p className="text-sm text-green-600 mt-1">Esta solicitud ha sido completada exitosamente</p>
        </div>
      )}
    </div>
  )
}
