import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { Building, Calendar, Globe, Mail, MapPin, Phone, User, Users, Briefcase, ArrowLeft, ShoppingBag, Cake } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import type { Company, Organization, MembershipStatus, CompanySector } from "@/lib/types/database"
import { DeleteCompanyButton } from "./delete-company-button"
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


export default async function CompanyDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient()
    const { id } = await params

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect("/auth/login")
    }

    // Fetch company details with organization
    const { data: company, error } = await supabase
        .from("companies")
        .select("*, organization:organizations(id, name)")
        .eq("id", id)
        .single()

    if (error || !company) {
        notFound()
    }

    const comp = company as Company & { organization: { id: string, name: string } | null }

    // Fetch company contacts
    const { data: contacts } = await supabase
        .from("company_contacts")
        .select("*")
        .eq("company_id", id)
        .order("is_primary", { ascending: false })
        .order("first_name")

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/empresas">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-foreground">{comp.name}</h1>
                        <StatusBadge type="membership" status={comp.membership_status} />
                    </div>
                    <p className="text-muted-foreground">Detalle de la empresa y contactos</p>
                </div>
                <div className="flex items-center gap-2">
                    <Link href={`/dashboard/empresas/${id}/editar`}>
                        <Button variant="outline">Editar</Button>
                    </Link>
                    <DeleteCompanyButton companyId={comp.id} companyName={comp.name} />
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Main Info */}
                <div className="md:col-span-2 space-y-6">
                    <div className="rounded-lg border bg-card p-6 shadow-sm">
                        <div className="flex items-start gap-6">
                            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-lg bg-muted border">
                                {comp.logo_url ? (
                                    <img
                                        src={comp.logo_url || "/placeholder.svg"}
                                        alt={comp.name}
                                        className="h-20 w-20 rounded object-contain"
                                    />
                                ) : (
                                    <Building className="h-10 w-10 text-muted-foreground" />
                                )}
                            </div>
                            <div className="space-y-4 flex-1">
                                <div>
                                    <h3 className="font-semibold text-lg">{comp.legal_name || comp.name}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Badge variant="secondary">{sectorLabels[comp.sector]}</Badge>
                                        {comp.rfc && <span className="text-sm text-muted-foreground">RFC: {comp.rfc}</span>}
                                    </div>
                                </div>

                                <p className="text-muted-foreground">
                                    {comp.description || "Sin descripción disponible."}
                                </p>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                    {comp.organization && (
                                        <div className="col-span-2 bg-blue-50 p-2 rounded border border-blue-100 flex items-center gap-2 text-sm text-blue-800">
                                            <Briefcase className="h-4 w-4" />
                                            <span>Afiliada a: <strong>{comp.organization.name}</strong></span>
                                            <Link href={`/dashboard/organismos/${comp.organization.id}`} className="ml-auto text-xs underline">
                                                Ver Organismo
                                            </Link>
                                        </div>
                                    )}

                                    {comp.website && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <Globe className="h-4 w-4 text-muted-foreground" />
                                            <a href={comp.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                                Sitio Web
                                            </a>
                                        </div>
                                    )}
                                    {comp.email && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                            <span>{comp.email}</span>
                                        </div>
                                    )}
                                    {comp.phone && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <Phone className="h-4 w-4 text-muted-foreground" />
                                            <span>{comp.phone}</span>
                                        </div>
                                    )}
                                    {comp.employee_count && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <Users className="h-4 w-4 text-muted-foreground" />
                                            <span>{comp.employee_count} empleados</span>
                                        </div>
                                    )}
                                    {comp.city && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <MapPin className="h-4 w-4 text-muted-foreground" />
                                            <span>{comp.city}, {comp.state}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2 text-sm">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <span>Miembro desde: {new Date(comp.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Commercial Info Section */}
                    {(comp.top_products || comp.purchase_requirements) && (
                        <div className="rounded-lg border bg-card p-6 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                    <ShoppingBag className="h-5 w-5" />
                                </div>
                                <h3 className="font-semibold text-lg">Información Comercial</h3>
                            </div>
                            <div className="space-y-6">
                                {comp.top_products && (
                                    <div>
                                        <h4 className="font-medium text-sm text-muted-foreground mb-1">Productos o Servicios Principales</h4>
                                        <p className="whitespace-pre-wrap">{comp.top_products}</p>
                                    </div>
                                )}
                                {comp.purchase_requirements && (
                                    <div>
                                        <h4 className="font-medium text-sm text-muted-foreground mb-1">Requerimientos de Compra</h4>
                                        <p className="whitespace-pre-wrap">{comp.purchase_requirements}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Contacts Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold">Contactos</h2>
                            {/* Add contact button could go here */}
                        </div>

                        {(!contacts || contacts.length === 0) ? (
                            <div className="text-center p-8 border border-dashed rounded-lg text-muted-foreground">
                                No hay contactos registrados.
                            </div>
                        ) : (
                            <div className="grid gap-4 sm:grid-cols-2">
                                {contacts.map(contact => (
                                    <div key={contact.id} className="rounded-lg border bg-card p-4 shadow-sm relative">
                                        {contact.is_primary && (
                                            <Badge className="absolute top-2 right-2 bg-blue-100 text-blue-800 hover:bg-blue-100">Principal</Badge>
                                        )}
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                                <User className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="font-medium">{contact.first_name} {contact.last_name}</p>
                                                <p className="text-sm text-muted-foreground">{contact.position}</p>
                                            </div>
                                        </div>
                                        <div className="space-y-1 text-sm">
                                            {contact.email && (
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <Mail className="h-3 w-3" />
                                                    <span>{contact.email}</span>
                                                </div>
                                            )}
                                            {contact.phone && (
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <Phone className="h-3 w-3" />
                                                    <span>{contact.phone}</span>
                                                </div>
                                            )}
                                            {contact.birthday && (
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <Cake className="h-3 w-3" />
                                                    <span>{new Date(contact.birthday).toLocaleDateString('es-MX', { day: 'numeric', month: 'long' })}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Add specific company stats or actions here if needed */}
                </div>
            </div>
        </div>
    )
}
