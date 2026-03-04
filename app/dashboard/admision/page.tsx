import type React from "react"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Clock, CheckCircle2, XCircle, AlertCircle, Search, Filter, Eye, FileText } from "lucide-react"
import Link from "next/link"
import type { AdmissionRequest, AdmissionStatus } from "@/lib/types/database"
import { ADMISSION_STATUS } from "@/shared/status/admission-statuses"
import { admissionStatusLabels } from "@/shared/status/status-labels"

const statusConfig: Record<
  AdmissionStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ElementType }
> = {
  pending: { label: "Pendiente", variant: "outline", icon: Clock },
  under_review: { label: "En Revisión", variant: "default", icon: AlertCircle },
  approved: { label: "Aprobada", variant: "secondary", icon: CheckCircle2 },
  rejected: { label: "Rechazada", variant: "destructive", icon: XCircle },
  more_info_needed: { label: "Info. Requerida", variant: "outline", icon: AlertCircle },
  payment_pending: { label: "Pago Pendiente", variant: "outline", icon: Clock },
  documents_pending: { label: "Docs. Pendientes", variant: "outline", icon: Clock },
  completed: { label: "Completada", variant: "secondary", icon: CheckCircle2 },
}

export default async function AdmisionPage() {
  const supabase = await createClient()

  const { data: requests, error } = await supabase
    .from("admission_requests")
    .select("*")
    .neq("status", "completed")
    .order("created_at", { ascending: false })

  const admissionRequests = (requests || []) as AdmissionRequest[]

  const stats = {
    total: admissionRequests.length,
    pending: admissionRequests.filter((r) => r.status === ADMISSION_STATUS.PENDING).length,
    under_review: admissionRequests.filter((r) => r.status === ADMISSION_STATUS.UNDER_REVIEW).length,
    approved: admissionRequests.filter((r) => r.status === ADMISSION_STATUS.APPROVED).length,
    rejected: admissionRequests.filter((r) => r.status === ADMISSION_STATUS.REJECTED).length,
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Solicitudes de Admisión</h1>
          <p className="text-muted-foreground">Gestiona las solicitudes de nuevos socios</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/solicitud-admision" target="_blank">
            <FileText className="mr-2 h-4 w-4" />
            Ver Formulario Público
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Total Solicitudes</p>
          </CardContent>
        </Card>
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-amber-700 dark:text-amber-400">{stats.pending}</div>
            <p className="text-xs text-amber-600 dark:text-amber-500">Pendientes</p>
          </CardContent>
        </Card>
        <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">{stats.under_review}</div>
            <p className="text-xs text-blue-600 dark:text-blue-500">En Revisión</p>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-700 dark:text-green-400">{stats.approved}</div>
            <p className="text-xs text-green-600 dark:text-green-500">Aprobadas</p>
          </CardContent>
        </Card>
        <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-700 dark:text-red-400">{stats.rejected}</div>
            <p className="text-xs text-red-600 dark:text-red-500">Rechazadas</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar por empresa o contacto..." className="pl-9" />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="pending">Pendientes</SelectItem>
                <SelectItem value="under_review">En Revisión</SelectItem>
                <SelectItem value="approved">Aprobadas</SelectItem>
                <SelectItem value="rejected">Rechazadas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empresa</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Sector</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {admissionRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No hay solicitudes de admisión
                  </TableCell>
                </TableRow>
              ) : (
                admissionRequests.map((request) => {
                  const status = statusConfig[request.status]
                  const StatusIcon = status.icon
                  return (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{request.company_name}</p>
                          {request.trade_name && <p className="text-sm text-muted-foreground">{request.trade_name}</p>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">{request.contact_name}</p>
                          <p className="text-xs text-muted-foreground">{request.contact_email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="capitalize text-sm">{request.sector.replace("_", " ")}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {new Date(request.created_at).toLocaleDateString("es-MX", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={status.variant} className="gap-1">
                          <StatusIcon className="h-3 w-3" />
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/dashboard/admision/${request.id}`}>
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">Ver detalles</span>
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
