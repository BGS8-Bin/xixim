
import React from "react"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DollarSign, CheckCircle2, XCircle, Clock, Eye } from "lucide-react"
import Link from "next/link"
import type { Payment, AdmissionRequest, PaymentStatus } from "@/lib/types/database"
import { PAYMENT_STATUS } from "@/shared/status/payment-statuses"
import { formatCurrency, formatCurrencyWithCode } from "@/shared/money"
import { StatusBadge } from "@/shared/ui/status-badge"

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

export default async function PagosPage() {
  const supabase = await createClient()

  const { data: payments } = await supabase
    .from("payments")
    .select(
      `
  *,
  admission_requests(*)
    `,
    )
    .eq("status", PAYMENT_STATUS.PENDING)
    .order("created_at", { ascending: false })

  const paymentsData = (payments || []) as PaymentWithAdmission[]

  const stats = {
    pending: paymentsData.filter((p) => p.status === PAYMENT_STATUS.PENDING).length,
    confirmed: paymentsData.filter((p) => p.status === PAYMENT_STATUS.CONFIRMED).length,
    total: paymentsData.reduce((sum, p) => (p.status === PAYMENT_STATUS.CONFIRMED ? sum + Number(p.amount) : sum), 0),
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gestión de Pagos</h1>
        <p className="text-muted-foreground">Administra los pagos de las solicitudes aprobadas</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pagos Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pagos Confirmados</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.confirmed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.total)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Pagos Registrados</CardTitle>
          <CardDescription>Lista de todos los pagos del clúster</CardDescription>
        </CardHeader>
        <CardContent>
          {paymentsData.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No hay pagos registrados</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Referencia</TableHead>
                    <TableHead>Fecha de Pago</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paymentsData.map((payment) => {
                    const status = statusConfig[payment.status]
                    const StatusIcon = status.icon
                    return (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium">
                          {payment.admission_requests?.company_name || "N/A"}
                        </TableCell>
                        <TableCell>
                          {formatCurrencyWithCode(Number(payment.amount), payment.currency)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {payment.payment_reference || "Sin referencia"}
                        </TableCell>
                        <TableCell className="text-sm">
                          {payment.payment_date
                            ? new Date(payment.payment_date).toLocaleDateString("es-MX")
                            : "Pendiente"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={status.variant} className="gap-1">
                            <StatusIcon className="h-3 w-3" />
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/dashboard/pagos/${payment.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
