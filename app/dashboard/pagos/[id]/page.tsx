import React from "react"
import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  ArrowLeft,
  Building2,
  DollarSign,
  Calendar,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  Mail,
  Phone,
} from "lucide-react"
import Link from "next/link"
import type { Payment, AdmissionRequest, PaymentStatus } from "@/lib/types/database"
import { PaymentActions } from "./payment-actions"
import { formatCurrencyWithCode } from "@/shared/money"

const statusConfig: Record<
  PaymentStatus,
  {
    label: string
    variant: "default" | "secondary" | "destructive" | "outline"
    icon: React.ElementType
  }
> = {
  pending: { label: "Pendiente", variant: "outline", icon: Clock },
  confirmed: { label: "Confirmado", variant: "secondary", icon: CheckCircle2 },
  rejected: { label: "Rechazado", variant: "destructive", icon: XCircle },
}

type PaymentWithAdmission = Payment & {
  admission_requests: AdmissionRequest
}

export default async function PaymentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: payment, error } = await supabase
    .from("payments")
    .select(
      `
      *,
      admission_requests(*)
    `,
    )
    .eq("id", id)
    .single()

  if (error || !payment) {
    notFound()
  }

  const paymentData = payment as PaymentWithAdmission
  const admission = paymentData.admission_requests
  const status = statusConfig[paymentData.status]
  const StatusIcon = status.icon

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/pagos">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Pago: {admission.company_name}</h1>
          <p className="text-muted-foreground">Detalles del pago y confirmación</p>
        </div>
        <Badge variant={status.variant} className="gap-1 text-sm py-1 px-3">
          <StatusIcon className="h-4 w-4" />
          {status.label}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Payment Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Información del Pago
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label className="text-muted-foreground text-xs">Monto</Label>
                <p className="text-2xl font-bold">
                  {formatCurrencyWithCode(Number(paymentData.amount), paymentData.currency)}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Método de Pago</Label>
                <p className="font-medium">{paymentData.payment_method || "No especificado"}</p>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Referencia de Pago</Label>
                <p className="font-medium font-mono">{paymentData.payment_reference || "Sin referencia"}</p>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Fecha de Pago
                </Label>
                <p className="font-medium">
                  {paymentData.payment_date
                    ? new Date(paymentData.payment_date).toLocaleDateString("es-MX", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                    : "Pendiente"}
                </p>
              </div>
              {paymentData.proof_url && (
                <div className="sm:col-span-2">
                  <Label className="text-muted-foreground text-xs flex items-center gap-1">
                    <FileText className="h-3 w-3" /> Comprobante de Pago
                  </Label>
                  <Button variant="outline" size="sm" className="mt-2 bg-transparent" asChild>
                    <a href={paymentData.proof_url} target="_blank" rel="noopener noreferrer">
                      Ver Comprobante
                    </a>
                  </Button>
                </div>
              )}
              {paymentData.notes && (
                <div className="sm:col-span-2">
                  <Label className="text-muted-foreground text-xs">Notas</Label>
                  <p className="mt-1 text-sm">{paymentData.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Company Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Información de la Empresa
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label className="text-muted-foreground text-xs">Razón Social</Label>
                <p className="font-medium">{admission.company_name}</p>
              </div>
              {admission.rfc && (
                <div>
                  <Label className="text-muted-foreground text-xs">RFC</Label>
                  <p className="font-medium">{admission.rfc}</p>
                </div>
              )}
              <div>
                <Label className="text-muted-foreground text-xs">Contacto</Label>
                <p className="font-medium">{admission.contact_name}</p>
                <p className="text-xs text-muted-foreground">{admission.contact_position}</p>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs flex items-center gap-1">
                  <Mail className="h-3 w-3" /> Correo
                </Label>
                <a href={`mailto:${admission.contact_email}`} className="text-sm text-primary hover:underline">
                  {admission.contact_email}
                </a>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs flex items-center gap-1">
                  <Phone className="h-3 w-3" /> Teléfono
                </Label>
                <a href={`tel:${admission.contact_phone}`} className="text-sm text-primary hover:underline">
                  {admission.contact_phone}
                </a>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Sector</Label>
                <p className="font-medium capitalize">{admission.sector.replace("_", " ")}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Acciones</CardTitle>
              <CardDescription>Confirmar o rechazar el pago</CardDescription>
            </CardHeader>
            <CardContent>
              <PaymentActions
                paymentId={paymentData.id}
                admissionId={admission.id}
                currentStatus={paymentData.status}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Historial</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-muted-foreground mt-2" />
                <div>
                  <p className="text-sm">Pago registrado</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(paymentData.created_at).toLocaleDateString("es-MX", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
              {paymentData.confirmed_at && (
                <div className="flex items-start gap-3">
                  <div
                    className={`w-2 h-2 rounded-full mt-2 ${paymentData.status === "confirmed" ? "bg-green-500" : "bg-red-500"}`}
                  />
                  <div>
                    <p className="text-sm">{paymentData.status === "confirmed" ? "Pago confirmado" : "Pago rechazado"}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(paymentData.confirmed_at).toLocaleDateString("es-MX", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
