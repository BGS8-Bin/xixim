import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Check, X, Eye } from "lucide-react"

const pendingAdmissions = [
  {
    id: 1,
    company: "TechSolutions MX",
    sector: "Desarrollo de Software",
    submittedAt: "15 Ene 2026",
    status: "revision",
    initials: "TS",
  },
  {
    id: 2,
    company: "InnovateDgo",
    sector: "Consultoría TI",
    submittedAt: "14 Ene 2026",
    status: "documentacion",
    initials: "ID",
  },
  {
    id: 3,
    company: "CloudServices Norte",
    sector: "Servicios en la Nube",
    submittedAt: "12 Ene 2026",
    status: "validacion",
    initials: "CS",
  },
]

const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  revision: { label: "En Revisión", variant: "default" },
  documentacion: { label: "Documentación", variant: "secondary" },
  validacion: { label: "Validación", variant: "outline" },
}

export function PendingAdmissions() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Solicitudes Pendientes</CardTitle>
        <Button variant="ghost" size="sm">
          Ver todas
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {pendingAdmissions.map((admission) => (
            <div key={admission.id} className="flex items-center gap-4 p-3 rounded-lg border">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary/10 text-primary">{admission.initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm truncate">{admission.company}</p>
                  <Badge variant={statusLabels[admission.status].variant} className="text-xs">
                    {statusLabels[admission.status].label}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{admission.sector}</p>
                <p className="text-xs text-muted-foreground">Enviado: {admission.submittedAt}</p>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
