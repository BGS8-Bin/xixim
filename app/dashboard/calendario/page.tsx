import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Plus, MapPin, Clock, Users, Video, MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react"
import Link from "next/link"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Event, EventType, EventStatus } from "@/lib/types/database"

const eventTypeLabels: Record<EventType, { label: string; color: string }> = {
  networking: { label: "Networking", color: "bg-blue-100 text-blue-700" },
  capacitacion: { label: "Capacitación", color: "bg-green-100 text-green-700" },
  conferencia: { label: "Conferencia", color: "bg-purple-100 text-purple-700" },
  taller: { label: "Taller", color: "bg-orange-100 text-orange-700" },
  feria: { label: "Feria", color: "bg-pink-100 text-pink-700" },
  reunion: { label: "Reunión", color: "bg-gray-100 text-gray-700" },
  otro: { label: "Otro", color: "bg-gray-100 text-gray-700" },
}

const statusConfig: Record<
  EventStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  draft: { label: "Borrador", variant: "outline" },
  published: { label: "Publicado", variant: "secondary" },
  cancelled: { label: "Cancelado", variant: "destructive" },
  completed: { label: "Completado", variant: "default" },
}

export default async function CalendarioPage() {
  const supabase = await createClient()

  const { data: events } = await supabase.from("events").select("*").order("start_date", { ascending: true })

  const allEvents = (events || []) as Event[]

  const now = new Date()
  const upcomingEvents = allEvents.filter((e) => new Date(e.end_date) >= now)
  const pastEvents = allEvents.filter((e) => new Date(e.end_date) < now)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Calendario de Eventos</h1>
          <p className="text-muted-foreground">Gestiona los eventos del clúster</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/calendario/nuevo">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Evento
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{allEvents.length}</div>
            <p className="text-xs text-muted-foreground">Total Eventos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{upcomingEvents.length}</div>
            <p className="text-xs text-muted-foreground">Próximos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{allEvents.filter((e) => e.status === "published").length}</div>
            <p className="text-xs text-muted-foreground">Publicados</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{allEvents.filter((e) => e.status === "draft").length}</div>
            <p className="text-xs text-muted-foreground">Borradores</p>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Próximos Eventos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingEvents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay eventos programados</p>
              <Button asChild className="mt-4 bg-transparent" variant="outline">
                <Link href="/dashboard/calendario/nuevo">Crear primer evento</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingEvents.slice(0, 5).map((event) => {
                const eventType = eventTypeLabels[event.event_type]
                const status = statusConfig[event.status]

                return (
                  <div
                    key={event.id}
                    className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="bg-primary/10 rounded-lg p-3 text-center min-w-[60px]">
                      <p className="text-lg font-bold text-primary">{new Date(event.start_date).getDate()}</p>
                      <p className="text-xs text-muted-foreground uppercase">
                        {new Date(event.start_date).toLocaleDateString("es-MX", { month: "short" })}
                      </p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <Badge className={eventType.color}>{eventType.label}</Badge>
                        <Badge variant={status.variant}>{status.label}</Badge>
                        {event.is_virtual && (
                          <Badge variant="outline">
                            <Video className="h-3 w-3 mr-1" />
                            Virtual
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-medium truncate">{event.title}</h3>
                      <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(event.start_date).toLocaleTimeString("es-MX", {
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
                        {event.max_attendees && (
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {event.max_attendees} máx.
                          </span>
                        )}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/calendario/${event.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            Ver detalles
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/calendario/${event.id}/editar`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Past Events */}
      {pastEvents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-muted-foreground">Eventos Pasados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {pastEvents.slice(0, 3).map((event) => (
                <div key={event.id} className="flex items-center justify-between p-3 rounded-lg border opacity-60">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">
                      {new Date(event.start_date).toLocaleDateString("es-MX", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                    <span className="font-medium">{event.title}</span>
                  </div>
                  <Badge variant="outline">Completado</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
