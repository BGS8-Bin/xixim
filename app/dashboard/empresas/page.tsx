import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Building, Plus, Search, Filter, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import type { Company, CompanySector, MembershipStatus } from "@/lib/types/database"
import { MEMBERSHIP_STATUS } from "@/shared/status/membership-statuses"
import { StatusBadge } from "@/shared/ui/status-badge"

const sectorLabels: Record<CompanySector, string> = {
  software: "Software",
  hardware: "Hardware",
  telecomunicaciones: "Telecomunicaciones",
  consultoria: "Consultoría",
  manufactura: "Manufactura",
  servicios: "Servicios",
  educacion: "Educación",
  investigacion: "Investigación",
  otro: "Otro",
}



export default async function EmpresasPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  let companies = []
  let error: any = null

  try {
    const result = await supabase
      .from("companies")
      .select("*, organization:organizations(name)")
      .order("name")

    if (result.error) {
      throw result.error
    }
    companies = result.data || []
  } catch (e) {
    console.error("Error fetching companies:", e)
    error = e
  }

  const companyList = (companies as (Company & { organization: { name: string } | null })[]) || []

  // Estadísticas
  const totalCompanies = companyList.length
  const activeCompanies = companyList.filter((c) => c.membership_status === MEMBERSHIP_STATUS.ACTIVE).length
  const pendingCompanies = companyList.filter((c) => c.membership_status === MEMBERSHIP_STATUS.PENDING).length

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Empresas Afiliadas</h1>
          <p className="text-muted-foreground">Gestiona las empresas miembro del clúster XIXIM</p>
        </div>
        <Link href="/dashboard/empresas/nueva">
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" />
            Nueva Empresa
          </Button>
        </Link>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
          <p className="font-semibold">Error al cargar empresas</p>
          <p className="text-sm">{(error as any).message || "Ocurrió un error inesperado. Por favor intenta de nuevo."}</p>
        </div>
      )}

      {/* Estadísticas */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">Total de Empresas</p>
          <p className="text-3xl font-bold">{totalCompanies}</p>
        </div>
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">Membresías Activas</p>
          <p className="text-3xl font-bold text-green-600">{activeCompanies}</p>
        </div>
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">Pendientes de Aprobación</p>
          <p className="text-3xl font-bold text-yellow-600">{pendingCompanies}</p>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar empresas..." className="pl-10" />
        </div>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Filtros
        </Button>
      </div>

      {/* Lista de empresas */}
      {companyList.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-card p-12 text-center">
          <Building className="h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No hay empresas registradas</h3>
          <p className="mt-2 text-sm text-muted-foreground">Comienza agregando la primera empresa afiliada</p>
          <Link href="/dashboard/empresas/nueva" className="mt-4">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Agregar Empresa
            </Button>
          </Link>
        </div>
      ) : (
        <div className="rounded-lg border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Empresa</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Sector</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Membresía</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Contacto</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {companyList.map((company) => (
                  <tr key={company.id} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                          {company.logo_url ? (
                            <img
                              src={company.logo_url || "/placeholder.svg"}
                              alt={company.name}
                              className="h-8 w-8 rounded object-contain"
                            />
                          ) : (
                            <Building className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{company.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {company.city}, {company.state}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant="secondary">{sectorLabels[company.sector]}</Badge>
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge type="membership" status={company.membership_status} />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        {company.email}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Link href={`/dashboard/empresas/${company.id}`}>
                        <Button variant="ghost" size="sm">
                          Ver Detalles
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
