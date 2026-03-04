import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin } from "lucide-react"

const events = [
  {
    id: 1,
    title: "Asamblea General Ordinaria",
    date: "20 Ene 2026",
    time: "10:00 AM",
    location: "Sala de Juntas XIXIM",
    type: "asamblea",
  },
  {
    id: 2,
    title: "Taller de Innovación Tecnológica",
    date: "25 Ene 2026",
    time: "3:00 PM",
    location: "Centro de Convenciones",
    type: "capacitacion",
  },
  {
    id: 3,
    title: "Networking Empresarial",
    date: "30 Ene 2026",
    time: "7:00 PM",
    location: "Hotel Durango",
    type: "networking",
  },
]

const typeLabels: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  asamblea: { label: "Asamblea", variant: "default" },
  capacitacion: { label: "Capacitación", variant: "secondary" },
  networking: { label: "Networking", variant: "outline" },
}

export function UpcomingEvents() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Próximos Eventos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {events.map((event) => (
            <div key={event.id} className="flex flex-col gap-2 p-3 rounded-lg bg-muted/50">
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-medium text-sm">{event.title}</h4>
                <Badge variant={typeLabels[event.type].variant}>{typeLabels[event.type].label}</Badge>
              </div>
              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {event.date}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {event.time}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {event.location}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
