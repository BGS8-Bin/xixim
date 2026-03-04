import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Eye, FileText } from "lucide-react"
import Link from "next/link"
import type { AdmissionStatus } from "@/lib/types/database"

const statusLabels: Record<AdmissionStatus, { label: string; variant: "default" | "secondary" | "outline" }> = {
  pending: { label: "Pendiente", variant: "outline" },
  under_review: { label: "En Revisión", variant: "default" },
  approved: { label: "Aprobada", variant: "secondary" },
  rejected: { label: "Rechazada", variant: "secondary" },
  more_info_needed: { label: "Info. Requerida", variant: "outline" },
}

export async function PendingAdmissionsServer() {
  const supabase = await createClient()

  const { data: admissions } = await supabase
    .from("admission_requests")
    .select("*")
    .in("status", ["pending", "under_review", "more_info_needed"])
    .order("created_at", { ascending: false })
    .limit(5)

  const pendingAdmissions = admissions || []

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Solicitudes Pendientes</CardTitle>
        <Link href="/dashboard/admision">
          <Button variant="ghost" size="sm">
            Ver todas
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {pendingAdmissions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-sm text-muted-foreground">No hay solicitudes pendientes</p>
            <Link href="/solicitud-admision" target="_blank" className="mt-2">
              <Button variant="link" size="sm">
                Ver formulario público
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingAdmissions.map((admission) => {
              const initials = admission.company_name
                .split(" ")
                .map((w: string) => w[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()

              const status = statusLabels[admission.status as AdmissionStatus]

              return (
                <div key={admission.id} className="flex items-center gap-4 p-3 rounded-lg border">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm truncate">{admission.company_name}</p>
                      <Badge variant={status.variant} className="text-xs">
                        {status.label}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground capitalize">{admission.sector.replace("_", " ")}</p>
                    <p className="text-xs text-muted-foreground">
                      Enviado:{" "}
                      {new Date(admission.created_at).toLocaleDateString("es-MX", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <Link href={`/dashboard/admision/${admission.id}`}>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
