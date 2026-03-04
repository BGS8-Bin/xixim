import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const activities = [
  {
    id: 1,
    type: "admission",
    title: "Nueva solicitud de admisión",
    description: "TechSolutions MX ha enviado su solicitud",
    time: "Hace 5 min",
    avatar: "TS",
  },
  {
    id: 2,
    type: "approved",
    title: "Socio aprobado",
    description: "InnovateDgo fue aprobado por el Consejo",
    time: "Hace 1 hora",
    avatar: "ID",
  },
  {
    id: 3,
    type: "event",
    title: "Evento creado",
    description: "Taller de Innovación - 25 de Enero",
    time: "Hace 2 horas",
    avatar: "EV",
  },
  {
    id: 4,
    type: "payment",
    title: "Pago registrado",
    description: "DataMex registró pago de membresía anual",
    time: "Hace 3 horas",
    avatar: "DM",
  },
  {
    id: 5,
    type: "update",
    title: "Información actualizada",
    description: "SoftwareDgo actualizó su perfil empresarial",
    time: "Hace 5 horas",
    avatar: "SD",
  },
]

const typeColors: Record<string, string> = {
  admission: "bg-blue-100 text-blue-700",
  approved: "bg-green-100 text-green-700",
  event: "bg-purple-100 text-purple-700",
  payment: "bg-amber-100 text-amber-700",
  update: "bg-gray-100 text-gray-700",
}

export function RecentActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Actividad Reciente</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-4">
              <Avatar className="h-9 w-9">
                <AvatarFallback className={typeColors[activity.type]}>{activity.avatar}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">{activity.title}</p>
                <p className="text-sm text-muted-foreground">{activity.description}</p>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
