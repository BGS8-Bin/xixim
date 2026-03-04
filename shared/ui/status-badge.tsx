"use client"

import { Badge } from "@/components/ui/badge"
import { admissionStatusLabels, admissionStatusColors } from "@/shared/status/status-labels"
import { paymentStatusLabels, paymentStatusColors } from "@/shared/status/status-labels"
import { membershipStatusLabels, membershipStatusColors } from "@/shared/status/status-labels"

interface StatusBadgeProps {
    /** Tipo de estado: admission, payment, o membership */
    type: "admission" | "payment" | "membership"
    /** Valor del estado actual */
    status: string
    /** Clases CSS adicionales (opcional) */
    className?: string
}

/**
 * Componente reutilizable para mostrar badges de estado
 * Usa los mapeos centralizados de status-labels.ts y status-colors.ts
 * 
 * @example
 * <StatusBadge type="admission" status={request.status} />
 * <StatusBadge type="membership" status={company.membership_status} />
 * <StatusBadge type="payment" status={payment.status} />
 */
export function StatusBadge({ type, status, className }: StatusBadgeProps) {
    // Seleccionar mapeos según el tipo
    const labelMaps = {
        admission: admissionStatusLabels,
        payment: paymentStatusLabels,
        membership: membershipStatusLabels
    }

    const colorMaps = {
        admission: admissionStatusColors,
        payment: paymentStatusColors,
        membership: membershipStatusColors
    }

    const label = labelMaps[type][status] || status
    const colorClass = colorMaps[type][status] || "bg-gray-100 text-gray-800"

    return (
        <Badge className={`${colorClass} ${className || ""}`}>
            {label}
        </Badge>
    )
}
