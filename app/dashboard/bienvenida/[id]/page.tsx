import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Building2, Mail, Phone, Gift, CheckCircle2, FileText, Info, Users, Clock } from "lucide-react"
import Link from "next/link"
import type { AdmissionRequest, WelcomeKit } from "@/lib/types/database"
import { WelcomeKitActions } from "./welcome-kit-actions"

type AdmissionWithKit = AdmissionRequest & {
  welcome_kits: WelcomeKit[]
}

export default async function WelcomeKitDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: admission, error } = await supabase
    .from("admission_requests")
    .select(
      `
      *,
      welcome_kits(*)
    `,
    )
    .eq("id", id)
    .single()

  if (error || !admission) {
    notFound()
  }

  const admissionData = admission as AdmissionWithKit
  const welcomeKit = admissionData.welcome_kits?.[0]
  const hasKit = !!welcomeKit
  const kitSent = welcomeKit?.kit_sent || false

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/bienvenida">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Kit de Bienvenida: {admissionData.company_name}</h1>
          <p className="text-muted-foreground">Proceso final de incorporación al clúster</p>
        </div>
        {kitSent && (
          <Badge variant="secondary" className="gap-1">
            <CheckCircle2 className="h-4 w-4" />
            Kit Enviado
          </Badge>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Process Information */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              El Kit Digital de Bienvenida es el último paso del proceso de admisión. Incluye la aceptación formal de
              estatutos, aviso de privacidad y acceso al directorio de socios.
            </AlertDescription>
          </Alert>

          {/* Welcome Kit Content */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5" />
                Contenido del Kit Digital
              </CardTitle>
              <CardDescription>Elementos incluidos en el kit de bienvenida</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-4 border rounded-lg bg-muted/30">
                  <FileText className="h-5 w-5 text-primary mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold">Derechos y Obligaciones</h4>
                    <p className="text-sm text-muted-foreground">
                      Documento con los estatutos completos del clúster, derechos como socio y compromisos adquiridos.
                    </p>
                    {welcomeKit?.estatutos_accepted && (
                      <div className="flex items-center gap-2 mt-2 text-green-600">
                        <CheckCircle2 className="h-4 w-4" />
                        <span className="text-sm font-medium">Aceptado</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 border rounded-lg bg-muted/30">
                  <FileText className="h-5 w-5 text-primary mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold">Aviso de Privacidad</h4>
                    <p className="text-sm text-muted-foreground">
                      Confirmación explícita de aceptación del tratamiento de datos personales conforme a la normativa
                      vigente.
                    </p>
                    {welcomeKit?.privacy_accepted && (
                      <div className="flex items-center gap-2 mt-2 text-green-600">
                        <CheckCircle2 className="h-4 w-4" />
                        <span className="text-sm font-medium">Aceptado</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 border rounded-lg bg-muted/30">
                  <Users className="h-5 w-5 text-primary mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold">Acceso al Directorio de Socios</h4>
                    <p className="text-sm text-muted-foreground">
                      Credenciales y acceso al directorio empresarial del clúster para networking y colaboración.
                    </p>
                    {welcomeKit?.directory_access_granted && (
                      <div className="flex items-center gap-2 mt-2 text-green-600">
                        <CheckCircle2 className="h-4 w-4" />
                        <span className="text-sm font-medium">Acceso otorgado</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 border rounded-lg bg-muted/30">
                  <Gift className="h-5 w-5 text-primary mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold">Material de Bienvenida</h4>
                    <p className="text-sm text-muted-foreground">
                      Guías, recursos, calendario de eventos, contactos clave y lineamientos para aprovechar al máximo
                      la membresía.
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
                Información del Nuevo Socio
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label className="text-muted-foreground text-xs">Razón Social</Label>
                <p className="font-medium">{admissionData.company_name}</p>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Sector</Label>
                <p className="font-medium capitalize">{admissionData.sector.replace("_", " ")}</p>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Contacto Principal</Label>
                <p className="font-medium">{admissionData.contact_name}</p>
                <p className="text-xs text-muted-foreground">{admissionData.contact_position}</p>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs flex items-center gap-1">
                  <Mail className="h-3 w-3" /> Correo
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
              {admissionData.website && (
                <div>
                  <Label className="text-muted-foreground text-xs">Sitio Web</Label>
                  <a
                    href={admissionData.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    {admissionData.website}
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Acciones</CardTitle>
              <CardDescription>Enviar kit digital de bienvenida</CardDescription>
            </CardHeader>
            <CardContent>
              <WelcomeKitActions admissionId={admissionData.id} welcomeKit={welcomeKit} />
            </CardContent>
          </Card>

          {hasKit && (
            <Card>
              <CardHeader>
                <CardTitle>Estado del Proceso</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span>Estatutos</span>
                  {welcomeKit.estatutos_accepted ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <Clock className="h-4 w-4 text-amber-600" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span>Aviso de Privacidad</span>
                  {welcomeKit.privacy_accepted ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <Clock className="h-4 w-4 text-amber-600" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span>Acceso a Directorio</span>
                  {welcomeKit.directory_access_granted ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <Clock className="h-4 w-4 text-amber-600" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span>Kit Enviado</span>
                  {welcomeKit.kit_sent ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <Clock className="h-4 w-4 text-amber-600" />
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
