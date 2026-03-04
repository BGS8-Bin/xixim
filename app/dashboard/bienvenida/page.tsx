import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Gift, CheckCircle2, Clock, Eye } from "lucide-react"
import Link from "next/link"
import type { AdmissionRequest, WelcomeKit } from "@/lib/types/database"

type AdmissionWithKit = AdmissionRequest & {
  welcome_kits: WelcomeKit[]
}

export default async function BienvenidaPage() {
  const supabase = await createClient()

  // Get admissions that completed documentation
  const { data: admissions } = await supabase
    .from("admission_requests")
    .select(
      `
      *,
      welcome_kits(*)
    `,
    )
    .eq("status", "completed")
    .order("updated_at", { ascending: false })

  const admissionsData = (admissions || []) as AdmissionWithKit[]

  // Separate pending and completed kits
  const pendingKits = admissionsData.filter((a) => !a.welcome_kits?.[0]?.kit_sent)
  const completedKits = admissionsData.filter((a) => a.welcome_kits?.[0]?.kit_sent)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Kit Digital de Bienvenida</h1>
        <p className="text-muted-foreground">Gestión del proceso final de incorporación de nuevos socios</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes de Kit</CardTitle>
            <Clock className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingKits.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kits Enviados</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedKits.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Kits */}
      <Card>
        <CardHeader>
          <CardTitle>Pendientes de Kit Digital</CardTitle>
          <CardDescription>Nuevos socios listos para recibir su kit de bienvenida</CardDescription>
        </CardHeader>
        <CardContent>
          {pendingKits.length === 0 ? (
            <div className="text-center py-12">
              <Gift className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No hay kits pendientes</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Contacto</TableHead>
                    <TableHead>Correo</TableHead>
                    <TableHead>Docs Enviados</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingKits.map((admission) => (
                    <TableRow key={admission.id}>
                      <TableCell className="font-medium">{admission.company_name}</TableCell>
                      <TableCell>{admission.contact_name}</TableCell>
                      <TableCell className="text-sm">{admission.contact_email}</TableCell>
                      <TableCell className="text-sm">
                        {new Date(admission.updated_at).toLocaleDateString("es-MX")}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/dashboard/bienvenida/${admission.id}`}>
                            <Gift className="h-4 w-4 mr-2" />
                            Enviar Kit
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Completed Kits */}
      {completedKits.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Kits Enviados</CardTitle>
            <CardDescription>Socios que ya recibieron su kit de bienvenida</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Contacto</TableHead>
                    <TableHead>Kit Enviado</TableHead>
                    <TableHead>Directorio</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {completedKits.map((admission) => {
                    const kit = admission.welcome_kits?.[0]
                    return (
                      <TableRow key={admission.id}>
                        <TableCell className="font-medium">{admission.company_name}</TableCell>
                        <TableCell>{admission.contact_name}</TableCell>
                        <TableCell className="text-sm">
                          {kit?.kit_sent_at
                            ? new Date(kit.kit_sent_at).toLocaleDateString("es-MX")
                            : "Pendiente"}
                        </TableCell>
                        <TableCell>
                          {kit?.directory_access_granted ? (
                            <Badge variant="secondary" className="gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Activo
                            </Badge>
                          ) : (
                            <Badge variant="outline">Pendiente</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/dashboard/bienvenida/${admission.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
