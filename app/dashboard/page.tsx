import { createClient } from "@/lib/supabase/server"
import { StatsCard } from "@/components/dashboard/stats-card"
import { PendingAdmissionsServer } from "@/components/dashboard/pending-admissions-server"
import { UpcomingEventsServer } from "@/components/dashboard/upcoming-events-server"
import { RecentActivityServer } from "@/components/dashboard/recent-activity-server"
import { UpcomingBirthdaysServer } from "@/components/dashboard/upcoming-birthdays"
import { Building2, Users, UserPlus, CalendarDays } from "lucide-react"
import { ADMISSION_STATUS } from "@/shared/status/admission-statuses"
import { MEMBERSHIP_STATUS } from "@/shared/status/membership-statuses"

export default async function DashboardPage() {
  const supabase = await createClient()

  const [{ data: organizations }, { data: companies }, { data: admissionRequests }, { data: events }] =
    await Promise.all([
      supabase.from("organizations").select("id, is_active"),
      supabase.from("companies").select("id, membership_status, sector, created_at"),
      supabase.from("admission_requests").select("id, status"),
      supabase.from("events").select("id, start_date, status").gte("start_date", new Date().toISOString()),
    ])

  const allOrgs = organizations || []
  const allCompanies = companies || []
  const allAdmissions = admissionRequests || []
  const upcomingEvents = events || []

  // Calculate stats
  const activeOrgs = allOrgs.filter((o) => o.is_active).length
  const activeCompanies = allCompanies.filter((c) => c.membership_status === MEMBERSHIP_STATUS.ACTIVE).length
  const pendingAdmissions = allAdmissions.filter((a) => a.status === ADMISSION_STATUS.PENDING || a.status === ADMISSION_STATUS.UNDER_REVIEW).length
  const eventsThisMonth = upcomingEvents.filter((e) => {
    const eventDate = new Date(e.start_date)
    const now = new Date()
    return eventDate.getMonth() === now.getMonth() && eventDate.getFullYear() === now.getFullYear()
  }).length

  // Calculate trends (new this month)
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const newCompaniesThisMonth = allCompanies.filter((c) => new Date(c.created_at) >= startOfMonth).length

  // Sector distribution for summary
  const sectorDistribution = allCompanies.reduce(
    (acc, c) => {
      acc[c.sector] = (acc[c.sector] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const sectorLabels: Record<string, string> = {
    software: "Desarrollo de Software",
    consultoria: "Consultoría TI",
    hardware: "Hardware & Redes",
    telecomunicaciones: "Telecomunicaciones",
    servicios: "Servicios",
    manufactura: "Manufactura",
    educacion: "Educación",
    investigacion: "Investigación",
    otro: "Otros",
  }

  // Get top sectors
  const topSectors = Object.entries(sectorDistribution)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Bienvenido al panel de control de XIXIM</p>
      </div>

      {/* Stats Grid - Real Data */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* <StatsCard
          title="Organismos"
          value={activeOrgs.toString()}
          description="Organismos activos"
          icon={Building2}
          trend={allOrgs.length > 0 ? { value: allOrgs.length, isPositive: true } : undefined}
        /> */}
        <StatsCard
          title="Empresas Afiliadas"
          value={activeCompanies.toString()}
          description={newCompaniesThisMonth > 0 ? `+ ${newCompaniesThisMonth} este mes` : "Total activas"}
          icon={Users}
          trend={newCompaniesThisMonth > 0 ? { value: newCompaniesThisMonth, isPositive: true } : undefined}
        />
        <StatsCard
          title="Solicitudes Pendientes"
          value={pendingAdmissions.toString()}
          description="Requieren revisión"
          icon={UserPlus}
          variant="primary"
        />
        <StatsCard
          title="Eventos este mes"
          value={eventsThisMonth.toString()}
          description="Próximos 30 días"
          icon={CalendarDays}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <PendingAdmissionsServer />
        <UpcomingEventsServer />
      </div>

      {/* Birthday Widget */}
      <UpcomingBirthdaysServer />

      {/* Activity Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentActivityServer />
        </div>
        <div className="space-y-6">
          {/* Quick Stats - Real Data */}
          <div className="rounded-lg border bg-card p-6">
            <h3 className="font-semibold mb-4">Resumen del Clúster</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Membresías activas</span>
                <span className="font-medium">{activeCompanies}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Pendientes de aprobación</span>
                <span className="font-medium text-amber-600">
                  {allCompanies.filter((c) => c.membership_status === "pending").length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Inactivas/Suspendidas</span>
                <span className="font-medium text-red-600">
                  {
                    allCompanies.filter(
                      (c) => c.membership_status === "inactive" || c.membership_status === "suspended",
                    ).length
                  }
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Nuevos socios (mes)</span>
                <span className="font-medium text-green-600">+{newCompaniesThisMonth}</span>
              </div>
            </div>
          </div>

          {/* Sectors Distribution - Real Data */}
          <div className="rounded-lg border bg-card p-6">
            <h3 className="font-semibold mb-4">Distribución por Sector</h3>
            <div className="space-y-3">
              {topSectors.length > 0 ? (
                topSectors.map(([sector, count]) => {
                  const percentage = allCompanies.length > 0 ? Math.round((count / allCompanies.length) * 100) : 0
                  return (
                    <div key={sector}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{sectorLabels[sector] || sector}</span>
                        <span className="text-muted-foreground">{percentage}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${percentage}% ` }} />
                      </div>
                    </div>
                  )
                })
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No hay empresas registradas</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
