import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, MapPin, Video } from "lucide-react"
import Link from "next/link"
import type { EventType } from "@/lib/types/database"

const typeLabels: Record<EventType, { label: string; variant: "default" | "secondary" | "outline" }> = {
  networking: { label: "Networking", variant: "outline" },
  capacitacion: { label: "Capacitación", variant: "secondary" },
  conferencia: { label: "Conferencia", variant: "default" },
  taller: { label: "Taller", variant: "secondary" },
  feria: { label: "Feria", variant: "outline" },
  reunion: { label: "Reunión", variant: "outline" },
  otro: { label: "Otro", variant: "outline" },
}

export async function UpcomingEventsServer() {
  const supabase = await createClient()

  const { data: events } = await supabase
    .from("events")
    .select("*")
    .eq("status", "published")
    .gte("start_date", new Date().toISOString())
    .order("start_date", { ascending: true })
    .limit(5)

  const upcomingEvents = events || []

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Próximos Eventos</CardTitle>
        <Link href="/dashboard/calendario">
          <Button variant="ghost" size="sm">
            Ver todos
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {upcomingEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-sm text-muted-foreground">No hay eventos programados</p>
            <Link href="/dashboard/calendario/nuevo" className="mt-2">
              <Button variant="link" size="sm">
                Crear evento
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {upcomingEvents.map((event) => {
              const eventType = typeLabels[event.event_type as EventType] || typeLabels.otro
              const eventDate = new Date(event.start_date)

              return (
                <div key={event.id} className="flex flex-col gap-2 p-3 rounded-lg bg-muted/50">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-medium text-sm">{event.title}</h4>
                    <div className="flex gap-1">
                      <Badge variant={eventType.variant}>{eventType.label}</Badge>
                      {event.is_virtual && (
                        <Badge variant="outline" className="gap-1">
                          <Video className="h-3 w-3" />
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {eventDate.toLocaleDateString("es-MX", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {eventDate.toLocaleTimeString("es-MX", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {event.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {event.location}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
