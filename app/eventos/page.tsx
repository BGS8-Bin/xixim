import { createClient } from "@/lib/supabase/server"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Clock, Users, Video, ExternalLink, ArrowRight, CalendarDays } from "lucide-react"
import type { Event, EventType } from "@/lib/types/database"

const eventTypeLabels: Record<EventType, { label: string; color: string }> = {
  networking: { label: "Networking", color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" },
  capacitacion: {
    label: "Capacitación",
    color: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  },
  conferencia: {
    label: "Conferencia",
    color: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
  },
  taller: { label: "Taller", color: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300" },
  feria: { label: "Feria", color: "bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300" },
  reunion: { label: "Reunión", color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300" },
  otro: { label: "Otro", color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300" },
}

function formatEventDate(startDate: string, endDate: string, isAllDay: boolean) {
  const start = new Date(startDate)
  const end = new Date(endDate)

  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }

  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
  }

  const formattedDate = start.toLocaleDateString("es-MX", dateOptions)

  if (isAllDay) {
    return { date: formattedDate, time: "Todo el día" }
  }

  const formattedStartTime = start.toLocaleTimeString("es-MX", timeOptions)
  const formattedEndTime = end.toLocaleTimeString("es-MX", timeOptions)

  return { date: formattedDate, time: `${formattedStartTime} - ${formattedEndTime}` }
}

export default async function EventosPage() {
  const supabase = await createClient()

  const { data: events } = await supabase
    .from("events")
    .select("*")
    .eq("status", "published")
    .eq("is_public", true)
    .gte("end_date", new Date().toISOString())
    .order("start_date", { ascending: true })

  const upcomingEvents = (events || []) as Event[]

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-background border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/images/xixim-1.webp" alt="XIXIM" width={120} height={40} className="h-10 w-auto" />
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/directorio" className="text-sm text-muted-foreground hover:text-foreground">
              Directorio
            </Link>
            <Link href="/eventos" className="text-sm font-medium text-primary">
              Eventos
            </Link>
            <Link href="/solicitud-admision" className="text-sm text-muted-foreground hover:text-foreground">
              Únete
            </Link>
          </nav>
          <Button asChild variant="outline" size="sm">
            <Link href="/auth/login">Iniciar Sesión</Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Eventos XIXIM</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Participa en nuestros eventos de networking, capacitación y conferencias para impulsar tu empresa
          </p>
        </div>

        {/* Events List */}
        {upcomingEvents.length === 0 ? (
          <Card className="max-w-lg mx-auto">
            <CardContent className="py-12 text-center">
              <CalendarDays className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No hay eventos próximos</h3>
              <p className="text-muted-foreground mb-4">
                Pronto anunciaremos nuevos eventos. Mientras tanto, únete al clúster para recibir notificaciones.
              </p>
              <Button asChild>
                <Link href="/solicitud-admision">
                  Unirme al Clúster
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {upcomingEvents.map((event) => {
              const { date, time } = formatEventDate(event.start_date, event.end_date, event.is_all_day)
              const eventType = eventTypeLabels[event.event_type]

              return (
                <Card key={event.id} className="overflow-hidden">
                  <div className="flex flex-col md:flex-row">
                    {/* Date Column */}
                    <div className="bg-primary/5 p-6 md:w-48 flex flex-col items-center justify-center text-center shrink-0">
                      <Calendar className="h-8 w-8 text-primary mb-2" />
                      <p className="text-sm font-medium">
                        {new Date(event.start_date).toLocaleDateString("es-MX", {
                          day: "numeric",
                          month: "short",
                        })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(event.start_date).toLocaleDateString("es-MX", { weekday: "long" })}
                      </p>
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-6">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <Badge className={eventType.color}>{eventType.label}</Badge>
                          <CardTitle className="mt-2">{event.title}</CardTitle>
                        </div>
                        {event.is_virtual && (
                          <Badge variant="outline" className="shrink-0">
                            <Video className="h-3 w-3 mr-1" />
                            Virtual
                          </Badge>
                        )}
                      </div>

                      {event.description && (
                        <CardDescription className="mb-4 line-clamp-2">{event.description}</CardDescription>
                      )}

                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{time}</span>
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>{event.location}</span>
                          </div>
                        )}
                        {event.max_attendees && (
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>Máx. {event.max_attendees} asistentes</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        {event.registration_required ? (
                          <Button asChild>
                            <Link href={`/eventos/${event.id}/registro`}>Registrarme</Link>
                          </Button>
                        ) : (
                          <Button asChild variant="outline">
                            <Link href={`/eventos/${event.id}`}>Ver detalles</Link>
                          </Button>
                        )}
                        {event.virtual_link && (
                          <Button asChild variant="ghost" size="sm">
                            <a href={event.virtual_link} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4 mr-1" />
                              Unirse
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}

        {/* CTA */}
        <Card className="mt-12 bg-secondary text-secondary-foreground">
          <CardContent className="py-8 text-center">
            <h2 className="text-2xl font-bold mb-2">¿Quieres proponer un evento?</h2>
            <p className="mb-6 opacity-90">
              Los socios del clúster pueden proponer y organizar eventos para la comunidad
            </p>
            <Button asChild variant="outline" className="bg-background text-foreground hover:bg-background/90">
              <Link href="/solicitud-admision">
                Convertirme en Socio
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t bg-background mt-12">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Image src="/images/xixim-1.webp" alt="XIXIM" width={100} height={32} className="h-8 w-auto" />
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} XIXIM - Clúster de Innovación y Tecnología Durango
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
