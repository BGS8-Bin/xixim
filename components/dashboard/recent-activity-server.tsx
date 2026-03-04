import type React from "react"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { FileText, Building2, Calendar, Megaphone, CheckCircle2 } from "lucide-react"

interface ActivityItem {
  id: string
  type: "admission" | "company" | "event" | "announcement" | "approved"
  title: string
  description: string
  time: Date
  initials: string
}

function getRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return "Ahora mismo"
  if (diffMins < 60) return `Hace ${diffMins} min`
  if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? "s" : ""}`
  if (diffDays < 7) return `Hace ${diffDays} día${diffDays > 1 ? "s" : ""}`
  return date.toLocaleDateString("es-MX", { day: "numeric", month: "short" })
}

const typeColors: Record<string, string> = {
  admission: "bg-blue-100 text-blue-700",
  approved: "bg-green-100 text-green-700",
  company: "bg-purple-100 text-purple-700",
  event: "bg-orange-100 text-orange-700",
  announcement: "bg-amber-100 text-amber-700",
}

const typeIcons: Record<string, React.ElementType> = {
  admission: FileText,
  approved: CheckCircle2,
  company: Building2,
  event: Calendar,
  announcement: Megaphone,
}

export async function RecentActivityServer() {
  const supabase = await createClient()

  const [{ data: recentAdmissions }, { data: recentCompanies }, { data: recentEvents }, { data: recentAnnouncements }] =
    await Promise.all([
      supabase
        .from("admission_requests")
        .select("id, company_name, status, created_at")
        .order("created_at", { ascending: false })
        .limit(3),
      supabase.from("companies").select("id, name, created_at").order("created_at", { ascending: false }).limit(3),
      supabase.from("events").select("id, title, created_at").order("created_at", { ascending: false }).limit(2),
      supabase.from("announcements").select("id, title, created_at").order("created_at", { ascending: false }).limit(2),
    ])

  // Combine and sort all activities
  const activities: ActivityItem[] = []

  // Add admissions
  recentAdmissions?.forEach((admission) => {
    const initials = admission.company_name
      .split(" ")
      .map((w: string) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase()
    activities.push({
      id: `admission-${admission.id}`,
      type: admission.status === "approved" ? "approved" : "admission",
      title: admission.status === "approved" ? "Socio aprobado" : "Nueva solicitud de admisión",
      description: `${admission.company_name} ${admission.status === "approved" ? "fue aprobado" : "ha enviado su solicitud"}`,
      time: new Date(admission.created_at),
      initials,
    })
  })

  // Add companies
  recentCompanies?.forEach((company) => {
    const initials = company.name
      .split(" ")
      .map((w: string) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase()
    activities.push({
      id: `company-${company.id}`,
      type: "company",
      title: "Empresa registrada",
      description: `${company.name} fue agregada al clúster`,
      time: new Date(company.created_at),
      initials,
    })
  })

  // Add events
  recentEvents?.forEach((event) => {
    activities.push({
      id: `event-${event.id}`,
      type: "event",
      title: "Evento creado",
      description: event.title,
      time: new Date(event.created_at),
      initials: "EV",
    })
  })

  // Add announcements
  recentAnnouncements?.forEach((announcement) => {
    activities.push({
      id: `announcement-${announcement.id}`,
      type: "announcement",
      title: "Anuncio publicado",
      description: announcement.title,
      time: new Date(announcement.created_at),
      initials: "AN",
    })
  })

  // Sort by time descending and take top 5
  const sortedActivities = activities.sort((a, b) => b.time.getTime() - a.time.getTime()).slice(0, 5)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Actividad Reciente</CardTitle>
      </CardHeader>
      <CardContent>
        {sortedActivities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No hay actividad reciente</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedActivities.map((activity) => {
              const Icon = typeIcons[activity.type]
              return (
                <div key={activity.id} className="flex items-start gap-4">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className={typeColors[activity.type]}>
                      {Icon ? <Icon className="h-4 w-4" /> : activity.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">{activity.title}</p>
                    <p className="text-sm text-muted-foreground">{activity.description}</p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {getRelativeTime(activity.time)}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
