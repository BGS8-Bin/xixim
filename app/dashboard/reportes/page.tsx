import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Building2,
  Users,
  TrendingUp,
  Calendar,
  Download,
  BarChart3,
  PieChart,
  FileText,
  ArrowUpRight,
} from "lucide-react"

export default async function ReportesPage() {
  const supabase = await createClient()

  // Fetch all data for reports
  const [{ data: companies }, { data: organizations }, { data: admissions }, { data: events }] = await Promise.all([
    supabase.from("companies").select("*"),
    supabase.from("organizations").select("*"),
    supabase.from("admission_requests").select("*"),
    supabase.from("events").select("*"),
  ])

  const allCompanies = companies || []
  const allOrganizations = organizations || []
  const allAdmissions = admissions || []
  const allEvents = events || []

  // Calculate metrics
  const activeCompanies = allCompanies.filter((c) => c.membership_status === "active")
  const pendingAdmissions = allAdmissions.filter((a) => a.status === "pending" || a.status === "under_review")
  const approvedThisMonth = allAdmissions.filter((a) => {
    const date = new Date(a.created_at)
    const now = new Date()
    return a.status === "approved" && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
  })

  // Sector distribution
  const sectorDistribution = allCompanies.reduce(
    (acc, company) => {
      acc[company.sector] = (acc[company.sector] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const sectorLabels: Record<string, string> = {
    software: "Software",
    hardware: "Hardware",
    telecomunicaciones: "Telecomunicaciones",
    consultoria: "Consultoría",
    manufactura: "Manufactura",
    servicios: "Servicios",
    educacion: "Educación",
    investigacion: "I+D",
    otro: "Otro",
  }

  // Organization type distribution
  const orgTypeDistribution = allOrganizations.reduce(
    (acc, org) => {
      acc[org.type] = (acc[org.type] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Reportes y Estadísticas</h1>
          <p className="text-muted-foreground">Análisis del ecosistema XIXIM</p>
        </div>
        <div className="flex items-center gap-2">
          <Select defaultValue="month">
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Esta semana</SelectItem>
              <SelectItem value="month">Este mes</SelectItem>
              <SelectItem value="quarter">Este trimestre</SelectItem>
              <SelectItem value="year">Este año</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Empresas Afiliadas</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCompanies.length}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3 text-green-500" />
              <span className="text-green-500">+{approvedThisMonth.length}</span> este mes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Organismos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allOrganizations.length}</div>
            <p className="text-xs text-muted-foreground">
              {allOrganizations.filter((o) => o.is_active).length} activos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Solicitudes Pendientes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingAdmissions.length}</div>
            <p className="text-xs text-muted-foreground">{allAdmissions.length} total recibidas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Eventos del Mes</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                allEvents.filter((e) => {
                  const date = new Date(e.start_date)
                  const now = new Date()
                  return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
                }).length
              }
            </div>
            <p className="text-xs text-muted-foreground">
              {allEvents.filter((e) => e.status === "published").length} publicados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Sector Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Distribución por Sector
            </CardTitle>
            <CardDescription>Empresas afiliadas por sector económico</CardDescription>
          </CardHeader>
          <CardContent>
            {Object.keys(sectorDistribution).length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <PieChart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No hay datos suficientes</p>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(sectorDistribution)
                  .sort(([, a], [, b]) => b - a)
                  .map(([sector, count]) => {
                    const percentage = ((count / allCompanies.length) * 100).toFixed(1)
                    return (
                      <div key={sector} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>{sectorLabels[sector] || sector}</span>
                          <span className="font-medium">
                            {count} ({percentage}%)
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Organization Types */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Organismos por Tipo
            </CardTitle>
            <CardDescription>Distribución de organismos en el clúster</CardDescription>
          </CardHeader>
          <CardContent>
            {Object.keys(orgTypeDistribution).length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No hay organismos registrados</p>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(orgTypeDistribution).map(([type, count]) => {
                  const typeLabels: Record<string, string> = {
                    gobierno: "Gobierno",
                    academia: "Academia",
                    industria: "Industria",
                    organizacion_civil: "Org. Civil",
                  }
                  const colors: Record<string, string> = {
                    gobierno: "bg-blue-500",
                    academia: "bg-green-500",
                    industria: "bg-orange-500",
                    organizacion_civil: "bg-purple-500",
                  }
                  return (
                    <div key={type} className="flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full ${colors[type] || "bg-gray-500"}`} />
                      <div className="flex-1">
                        <span className="text-sm">{typeLabels[type] || type}</span>
                      </div>
                      <span className="font-medium">{count}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Admission Funnel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Embudo de Admisión
          </CardTitle>
          <CardDescription>Estado de las solicitudes de admisión</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-5">
            {[
              {
                status: "pending",
                label: "Pendientes",
                count: allAdmissions.filter((a) => a.status === "pending").length,
                color: "bg-amber-100 text-amber-700 border-amber-200",
              },
              {
                status: "under_review",
                label: "En Revisión",
                count: allAdmissions.filter((a) => a.status === "under_review").length,
                color: "bg-blue-100 text-blue-700 border-blue-200",
              },
              {
                status: "more_info",
                label: "Info. Requerida",
                count: allAdmissions.filter((a) => a.status === "more_info_needed").length,
                color: "bg-orange-100 text-orange-700 border-orange-200",
              },
              {
                status: "approved",
                label: "Aprobadas",
                count: allAdmissions.filter((a) => a.status === "approved").length,
                color: "bg-green-100 text-green-700 border-green-200",
              },
              {
                status: "rejected",
                label: "Rechazadas",
                count: allAdmissions.filter((a) => a.status === "rejected").length,
                color: "bg-red-100 text-red-700 border-red-200",
              },
            ].map((item) => (
              <Card key={item.status} className={`border ${item.color}`}>
                <CardContent className="pt-6 text-center">
                  <div className="text-3xl font-bold">{item.count}</div>
                  <p className="text-sm mt-1">{item.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats Table */}
      <Card>
        <CardHeader>
          <CardTitle>Resumen del Clúster</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">Tasa de Aprobación</p>
              <p className="text-2xl font-bold">
                {allAdmissions.length > 0
                  ? (
                      (allAdmissions.filter((a) => a.status === "approved").length / allAdmissions.length) *
                      100
                    ).toFixed(0)
                  : 0}
                %
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">Eventos Publicados</p>
              <p className="text-2xl font-bold">{allEvents.filter((e) => e.status === "published").length}</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">Sectores Representados</p>
              <p className="text-2xl font-bold">{Object.keys(sectorDistribution).length}</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">Total Registros</p>
              <p className="text-2xl font-bold">{allCompanies.length + allOrganizations.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
