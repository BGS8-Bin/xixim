import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Building2, Plus, Search, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import type { Organization, OrganizationType } from "@/lib/types/database"

const typeLabels: Record<OrganizationType, string> = {
  gobierno: "Gobierno",
  academia: "Academia",
  industria: "Industria",
  organizacion_civil: "Org. Civil",
}

const typeColors: Record<OrganizationType, string> = {
  gobierno: "bg-blue-100 text-blue-800",
  academia: "bg-purple-100 text-purple-800",
  industria: "bg-emerald-100 text-emerald-800",
  organizacion_civil: "bg-amber-100 text-amber-800",
}

export default async function OrganismosPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: organizations } = await supabase.from("organizations").select("*").order("name")

  const orgList = (organizations as Organization[]) || []

  // Agrupar por tipo
  const byType = orgList.reduce(
    (acc, org) => {
      acc[org.type] = (acc[org.type] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Organismos</h1>
          <p className="text-muted-foreground">Gestiona los organismos que conforman el clúster XIXIM</p>
        </div>
        <Link href="/dashboard/organismos/nuevo">
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Organismo
          </Button>
        </Link>
      </div>

      {/* Estadísticas por tipo */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {(Object.keys(typeLabels) as OrganizationType[]).map((type) => (
          <div key={type} className="rounded-lg border bg-card p-4 shadow-sm">
            <p className="text-sm text-muted-foreground">{typeLabels[type]}</p>
            <p className="text-2xl font-bold">{byType[type] || 0}</p>
          </div>
        ))}
      </div>

      {/* Filtros y búsqueda */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar organismos..." className="pl-10" />
        </div>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Filtros
        </Button>
      </div>

      {/* Lista de organismos */}
      {orgList.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-card p-12 text-center">
          <Building2 className="h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No hay organismos registrados</h3>
          <p className="mt-2 text-sm text-muted-foreground">Comienza agregando el primer organismo al clúster</p>
          <Link href="/dashboard/organismos/nuevo" className="mt-4">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Agregar Organismo
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {orgList.map((org) => (
            <Link key={org.id} href={`/dashboard/organismos/${org.id}`} className="group">
              <div className="rounded-lg border bg-card p-6 shadow-sm transition-all hover:border-primary hover:shadow-md">
                <div className="flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                    {org.logo_url ? (
                      <img
                        src={org.logo_url || "/placeholder.svg"}
                        alt={org.name}
                        className="h-10 w-10 rounded object-contain"
                      />
                    ) : (
                      <Building2 className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  <Badge className={typeColors[org.type]}>{typeLabels[org.type]}</Badge>
                </div>
                <h3 className="mt-4 font-semibold text-foreground group-hover:text-primary">{org.name}</h3>
                {org.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{org.description}</p>
                )}
                <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                  {org.website && <span className="truncate">{org.website}</span>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
