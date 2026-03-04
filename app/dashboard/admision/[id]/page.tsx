import type React from "react"
import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  ArrowLeft,
  Building2,
  User,
  Mail,
  Phone,
  Globe,
  MapPin,
  Calendar,
  Users,
  DollarSign,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  MessageSquare,
  FileText,
  Download,
  Shield,
  Award,
  Briefcase,
} from "lucide-react"
import Link from "next/link"
import type { AdmissionRequest, AdmissionStatus } from "@/lib/types/database"
import { AdmissionActions } from "./admission-actions"
import { DeleteAdmissionButton } from "./delete-admission-button"

const statusConfig: Record<
  AdmissionStatus,
  {
    label: string
    variant: "default" | "secondary" | "destructive" | "outline"
    icon: React.ElementType
    color: string
  }
> = {
  pending: { label: "Pendiente", variant: "outline", icon: Clock, color: "text-amber-600" },
  under_review: { label: "En Revisión", variant: "default", icon: AlertCircle, color: "text-blue-600" },
  approved: { label: "Aprobada", variant: "secondary", icon: CheckCircle2, color: "text-green-600" },
  rejected: { label: "Rechazada", variant: "destructive", icon: XCircle, color: "text-red-600" },
  more_info_needed: { label: "Info. Requerida", variant: "outline", icon: AlertCircle, color: "text-orange-600" },
  payment_pending: { label: "Pago Pendiente", variant: "outline", icon: DollarSign, color: "text-purple-600" },
  documents_pending: { label: "Documentos Pendientes", variant: "outline", icon: FileText, color: "text-cyan-600" },
  completed: { label: "Completada", variant: "secondary", icon: CheckCircle2, color: "text-green-600" },
}

const servicesMap: Record<string, string> = {
  networking: "Networking y eventos",
  capacitacion: "Capacitación y talleres",
  vinculacion: "Vinculación empresarial",
  financiamiento: "Acceso a financiamiento",
  internacionalizacion: "Internacionalización",
  innovacion: "Programas de innovación",
}

export default async function AdmisionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: request, error } = await supabase.from("admission_requests").select("*").eq("id", id).single()

  if (error || !request) {
    notFound()
  }

  const admission = request as AdmissionRequest
  const status = statusConfig[admission.status]
  const StatusIcon = status.icon

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/admision">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{admission.company_name}</h1>
          <p className="text-muted-foreground">Solicitud de admisión</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={status.variant} className="gap-1 text-sm py-1 px-3">
            <StatusIcon className="h-4 w-4" />
            {status.label}
          </Badge>
          <DeleteAdmissionButton admissionId={admission.id} companyName={admission.company_name} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Company Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Información de la Empresa
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label className="text-muted-foreground text-xs">Razón Social</Label>
                <p className="font-medium">{admission.company_name}</p>
              </div>
              {admission.trade_name && (
                <div>
                  <Label className="text-muted-foreground text-xs">Nombre Comercial</Label>
                  <p className="font-medium">{admission.trade_name}</p>
                </div>
              )}
              {admission.rfc && (
                <div>
                  <Label className="text-muted-foreground text-xs">RFC</Label>
                  <p className="font-medium">{admission.rfc}</p>
                </div>
              )}
              <div>
                <Label className="text-muted-foreground text-xs">Sector</Label>
                <p className="font-medium capitalize">{admission.sector.replace("_", " ")}</p>
              </div>
              {admission.industry && (
                <div>
                  <Label className="text-muted-foreground text-xs">Giro/Industria</Label>
                  <p className="font-medium">{admission.industry}</p>
                </div>
              )}
              {admission.website && (
                <div>
                  <Label className="text-muted-foreground text-xs flex items-center gap-1">
                    <Globe className="h-3 w-3" /> Sitio Web
                  </Label>
                  <a
                    href={admission.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {admission.website}
                  </a>
                </div>
              )}
              {admission.employee_count && (
                <div>
                  <Label className="text-muted-foreground text-xs flex items-center gap-1">
                    <Users className="h-3 w-3" /> Empleados
                  </Label>
                  <p className="font-medium">{admission.employee_count}</p>
                </div>
              )}
              {admission.annual_revenue && (
                <div>
                  <Label className="text-muted-foreground text-xs flex items-center gap-1">
                    <DollarSign className="h-3 w-3" /> Facturación Anual
                  </Label>
                  <p className="font-medium">{admission.annual_revenue.replace("_", " - ")}</p>
                </div>
              )}
              {admission.founding_year && (
                <div>
                  <Label className="text-muted-foreground text-xs flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Año de Fundación
                  </Label>
                  <p className="font-medium">{admission.founding_year}</p>
                </div>
              )}
              {admission.entity_type && (
                <div>
                  <Label className="text-muted-foreground text-xs">Tipo de Entidad</Label>
                  <p className="font-medium capitalize">
                    {admission.entity_type === "persona_fisica" ? "Persona Física" : "Persona Moral"}
                  </p>
                </div>
              )}
              {admission.is_sat_registered !== null && (
                <div>
                  <Label className="text-muted-foreground text-xs flex items-center gap-1">
                    <Shield className="h-3 w-3" /> Registro SAT
                  </Label>
                  <p className="font-medium">{admission.is_sat_registered ? "Sí" : "No"}</p>
                </div>
              )}
              {admission.years_in_operation !== null && (
                <div>
                  <Label className="text-muted-foreground text-xs">Años de Operación</Label>
                  <p className="font-medium">{admission.years_in_operation} años</p>
                </div>
              )}
              {admission.is_startup !== null && (
                <div>
                  <Label className="text-muted-foreground text-xs">¿Es Startup?</Label>
                  <p className="font-medium">{admission.is_startup ? "Sí" : "No"}</p>
                </div>
              )}
              {admission.address && (
                <div className="sm:col-span-2">
                  <Label className="text-muted-foreground text-xs flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> Dirección
                  </Label>
                  <p className="font-medium">
                    {admission.address}, {admission.city}, {admission.state}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>



          {/* Commercial Info */}
          {(admission.top_products || admission.purchase_requirements) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Información Comercial
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {admission.top_products && (
                  <div>
                    <Label className="text-muted-foreground text-xs">Productos o Servicios más vendidos</Label>
                    <p className="mt-1 whitespace-pre-wrap">{admission.top_products}</p>
                  </div>
                )}
                {admission.purchase_requirements && (
                  <div>
                    <Label className="text-muted-foreground text-xs">Requerimientos de Compra</Label>
                    <p className="mt-1 whitespace-pre-wrap">{admission.purchase_requirements}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Documents */}
          {(admission.fiscal_document_url || admission.brochure_url) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Documentos Adjuntos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {admission.fiscal_document_url && (
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">Constancia de Situación Fiscal</p>
                        <p className="text-xs text-muted-foreground">PDF</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" asChild>
                      <a
                        href={admission.fiscal_document_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Descargar
                      </a>
                    </Button>
                  </div>
                )}
                {admission.brochure_url && (
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">Brochure Empresarial</p>
                        <p className="text-xs text-muted-foreground">PDF</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" asChild>
                      <a
                        href={admission.brochure_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Descargar
                      </a>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Guarantors */}
          {(admission.guarantor_1_name || admission.guarantor_2_name) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Avales de Socios Activos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {admission.guarantor_1_name && (
                  <div>
                    <Label className="text-muted-foreground text-xs">Aval 1</Label>
                    <p className="font-medium">{admission.guarantor_1_name}</p>
                    {admission.guarantor_1_company && (
                      <p className="text-sm text-muted-foreground">{admission.guarantor_1_company}</p>
                    )}
                  </div>
                )}
                {admission.guarantor_2_name && (
                  <div>
                    <Label className="text-muted-foreground text-xs">Aval 2</Label>
                    <p className="font-medium">{admission.guarantor_2_name}</p>
                    {admission.guarantor_2_company && (
                      <p className="text-sm text-muted-foreground">{admission.guarantor_2_company}</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Contacto Principal
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label className="text-muted-foreground text-xs">Nombre</Label>
                <p className="font-medium">{admission.contact_name}</p>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Cargo</Label>
                <p className="font-medium">{admission.contact_position}</p>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs flex items-center gap-1">
                  <Mail className="h-3 w-3" /> Correo Electrónico
                </Label>
                <a href={`mailto:${admission.contact_email}`} className="text-primary hover:underline">
                  {admission.contact_email}
                </a>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs flex items-center gap-1">
                  <Phone className="h-3 w-3" /> Teléfono
                </Label>
                <a href={`tel:${admission.contact_phone}`} className="text-primary hover:underline">
                  {admission.contact_phone}
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Motivation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Motivación
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-muted-foreground text-xs">¿Por qué desea unirse al clúster?</Label>
                <p className="mt-1 whitespace-pre-wrap">{admission.motivation}</p>
              </div>
              {admission.services_interest && admission.services_interest.length > 0 && (
                <div>
                  <Label className="text-muted-foreground text-xs">Servicios de interés</Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {admission.services_interest.map((service) => (
                      <Badge key={service} variant="outline">
                        {servicesMap[service] || service}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {admission.how_did_you_hear && (
                <div>
                  <Label className="text-muted-foreground text-xs">¿Cómo se enteró de nosotros?</Label>
                  <p className="mt-1 capitalize">{admission.how_did_you_hear.replace("_", " ")}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Innovation Project (if startup) */}
          {admission.is_startup && admission.innovation_project_description && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Proyecto de Innovación
                </CardTitle>
                <CardDescription>Descripción del proyecto de innovación o desarrollo tecnológico</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{admission.innovation_project_description}</p>
              </CardContent>
            </Card>
          )}

          {/* Chambers Participation */}
          {admission.previous_chambers_participation && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Participación en Cámaras
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{admission.previous_chambers_participation}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar - Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Acciones</CardTitle>
              <CardDescription>Gestionar esta solicitud</CardDescription>
            </CardHeader>
            <CardContent>
              <AdmissionActions admissionId={admission.id} currentStatus={admission.status} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Historial</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-muted-foreground mt-2" />
                <div>
                  <p className="text-sm">Solicitud recibida</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(admission.created_at).toLocaleString("es-MX", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                      timeZone: "America/Mexico_City",
                    })}
                  </p>
                </div>
              </div>
              {admission.reviewed_at && (
                <div className="flex items-start gap-3">
                  <div
                    className={`w-2 h-2 rounded-full mt-2 ${admission.status === "approved" || admission.status === "payment_pending" ? "bg-green-500" : admission.status === "rejected" ? "bg-red-500" : "bg-blue-500"}`}
                  />
                  <div>
                    <p className="text-sm">
                      {admission.status === "approved" || admission.status === "payment_pending"
                        ? "Aprobada"
                        : admission.status === "rejected"
                          ? "Rechazada"
                          : "En revisión"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(admission.reviewed_at).toLocaleString("es-MX", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                        timeZone: "America/Mexico_City",
                      })}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div >
    </div >
  )
}
