import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { Building, Building2, Calendar, Globe, Mail, MapPin, Phone, Plus, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import type { Company, Organization, OrganizationType } from "@/lib/types/database"

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

export default async function OrganizationDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient()
    const { id } = await params

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect("/auth/login")
    }

    // Fetch organization details
    const { data: organization, error } = await supabase
        .from("organizations")
        .select("*")
        .eq("id", id)
        .single()

    if (error || !organization) {
        notFound()
    }

    const org = organization as Organization

    // Fetch dependencies (companies linked to this organization)
    const { data: companies } = await supabase
        .from("companies")
        .select("*")
        .eq("organization_id", id)
        .order("name")

    const dependencies = (companies as Company[]) || []

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/organismos">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-foreground">{org.name}</h1>
                        <Badge className={typeColors[org.type]}>{typeLabels[org.type]}</Badge>
                    </div>
                    <p className="text-muted-foreground">Detalle del organismo y sus dependencias</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Main Info */}
                <div className="md:col-span-2 space-y-6">
                    <div className="rounded-lg border bg-card p-6 shadow-sm">
                        <div className="flex items-start gap-6">
                            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-lg bg-muted border">
                                {org.logo_url ? (
                                    <img
                                        src={org.logo_url || "/placeholder.svg"}
                                        alt={org.name}
                                        className="h-20 w-20 rounded object-contain"
                                    />
                                ) : (
                                    <Building2 className="h-10 w-10 text-muted-foreground" />
                                )}
                            </div>
                            <div className="space-y-4 flex-1">
                                <div>
                                    <h3 className="font-semibold text-lg">Descripción</h3>
                                    <p className="text-muted-foreground mt-1">
                                        {org.description || "Sin descripción disponible."}
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                    {org.website && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <Globe className="h-4 w-4 text-muted-foreground" />
                                            <a href={org.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                                Sitio Web
                                            </a>
                                        </div>
                                    )}
                                    {org.email && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="text-xs text-muted-foreground">Email General</p>
                                                <span>{org.email}</span>
                                            </div>
                                        </div>
                                    )}
                                    {org.phone && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <Phone className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="text-xs text-muted-foreground">Teléfono General</p>
                                                <span>{org.phone}</span>
                                            </div>
                                        </div>
                                    )}
                                    {org.contact_email && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="text-xs text-muted-foreground">Email de Contacto</p>
                                                <span>{org.contact_email}</span>
                                            </div>
                                        </div>
                                    )}
                                    {org.contact_phone && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <Phone className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="text-xs text-muted-foreground">Teléfono de Contacto</p>
                                                <span>{org.contact_phone}</span>
                                            </div>
                                        </div>
                                    )}
                                    {(org.address || org.city || org.state) && (
                                        <div className="flex items-start gap-2 text-sm col-span-2">
                                            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                                            <div>
                                                <p className="text-xs text-muted-foreground">Ubicación</p>
                                                <span>
                                                    {org.address && <>{org.address}<br /></>}
                                                    {org.city}, {org.state}
                                                    {org.country && `, ${org.country}`}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                    {org.founded_year && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <span>Fundado en {org.founded_year}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2 text-sm">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <span>Registrado: {new Date(org.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Dependencies Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold">Empresas Dependientes</h2>
                            <Link href={`/dashboard/empresas/nueva?organization_id=${org.id}`}>
                                <Button size="sm">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Agregar Dependencia
                                </Button>
                            </Link>
                        </div>

                        {dependencies.length === 0 ? (
                            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-card p-8 text-center">
                                <Building className="h-8 w-8 text-muted-foreground" />
                                <h3 className="mt-2 font-medium">No hay empresas afiliadas</h3>
                                <p className="text-sm text-muted-foreground mb-4">Este organismo no tiene empresas registradas aún.</p>
                                <Link href={`/dashboard/empresas/nueva?organization_id=${org.id}`}>
                                    <Button variant="outline" size="sm">
                                        Registrar Primera Empresa
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-muted/50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Empresa</th>
                                                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Sector</th>
                                                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Ciudad</th>
                                                <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {dependencies.map((company) => (
                                                <tr key={company.id} className="border-b last:border-0 hover:bg-muted/50">
                                                    <td className="px-4 py-3 font-medium">
                                                        <div className="flex items-center gap-2">
                                                            {company.logo_url ? (
                                                                <img src={company.logo_url} alt="" className="h-6 w-6 rounded object-contain" />
                                                            ) : (
                                                                <Building className="h-4 w-4 text-muted-foreground" />
                                                            )}
                                                            {company.name}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm capitalize">{company.sector}</td>
                                                    <td className="px-4 py-3 text-sm">{company.city}</td>
                                                    <td className="px-4 py-3 text-right">
                                                        <Link href={`/dashboard/empresas/${company.id}`}>
                                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                                <ArrowLeft className="h-4 w-4 rotate-180" />
                                                                <span className="sr-only">Ver</span>
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
                </div>

                {/* Sidebar / Stats */}
                <div className="space-y-6">
                    <div className="rounded-lg border bg-card p-6 shadow-sm">
                        <h3 className="font-semibold mb-4">Resumen</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-2 border-b">
                                <span className="text-sm text-muted-foreground">Total Dependencias</span>
                                <span className="font-bold">{dependencies.length}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b">
                                <span className="text-sm text-muted-foreground">Estado</span>
                                <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">Activo</Badge>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
