import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Building2, Mail, Phone, FileText, CheckCircle2, Send, Info } from "lucide-react"
import Link from "next/link"
import type { AdmissionRequest } from "@/lib/types/database"
import { DocumentActions } from "./document-actions"

export default async function DocumentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: admission, error } = await supabase.from("admission_requests").select("*").eq("id", id).single()

  if (error || !admission) {
    notFound()
  }

  const admissionData = admission as AdmissionRequest
  const isDocumentsPending = admissionData.status === "documents_pending"
  const isCompleted = admissionData.status === "completed"

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/documentos">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Documentación: {admissionData.company_name}</h1>
          <p className="text-muted-foreground">Envío de documentos post-pago</p>
        </div>
        {isCompleted && (
          <Badge variant="secondary" className="gap-1">
            <CheckCircle2 className="h-4 w-4" />
            Completado
          </Badge>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Information Alert */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Después de confirmar el pago, se debe enviar la siguiente documentación al solicitante para completar su
              expediente y continuar con el proceso de bienvenida.
            </AlertDescription>
          </Alert>

          {/* Documents to Send */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Documentos a Enviar
              </CardTitle>
              <CardDescription>Lista de documentos requeridos para el expediente del clúster</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <FileText className="h-5 w-5 text-primary mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold">Carta Compromiso</h4>
                    <p className="text-sm text-muted-foreground">
                      Documento de aceptación de estatutos y compromiso de participación activa en comisiones, eventos
                      y proyectos del clúster.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <FileText className="h-5 w-5 text-primary mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold">Información Comercial</h4>
                    <p className="text-sm text-muted-foreground">
                      Catálogo de productos/servicios y autorización para compartir datos de contacto en el directorio
                      del clúster.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <FileText className="h-5 w-5 text-primary mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold">Estatutos del Clúster</h4>
                    <p className="text-sm text-muted-foreground">
                      Documento con derechos y obligaciones de los socios del clúster XIXIM.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <FileText className="h-5 w-5 text-primary mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold">Aviso de Privacidad</h4>
                    <p className="text-sm text-muted-foreground">
                      Documento de protección de datos personales conforme a la normativa mexicana.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Company Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Información de Contacto
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label className="text-muted-foreground text-xs">Razón Social</Label>
                <p className="font-medium">{admissionData.company_name}</p>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Contacto</Label>
                <p className="font-medium">{admissionData.contact_name}</p>
                <p className="text-xs text-muted-foreground">{admissionData.contact_position}</p>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs flex items-center gap-1">
                  <Mail className="h-3 w-3" /> Correo Electrónico
                </Label>
                <a href={`mailto:${admissionData.contact_email}`} className="text-sm text-primary hover:underline">
                  {admissionData.contact_email}
                </a>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs flex items-center gap-1">
                  <Phone className="h-3 w-3" /> Teléfono
                </Label>
                <a href={`tel:${admissionData.contact_phone}`} className="text-sm text-primary hover:underline">
                  {admissionData.contact_phone}
                </a>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Acciones</CardTitle>
              <CardDescription>Enviar documentación al solicitante</CardDescription>
            </CardHeader>
            <CardContent>
              <DocumentActions admissionId={admissionData.id} currentStatus={admissionData.status} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Métodos de Envío</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="font-semibold">Correo Electrónico</p>
                <p className="text-muted-foreground">Envío automático a {admissionData.contact_email}</p>
              </div>
              <div>
                <p className="font-semibold">WhatsApp (Opcional)</p>
                <p className="text-muted-foreground">Notificación manual al {admissionData.contact_phone}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
