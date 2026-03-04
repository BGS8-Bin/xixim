import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileText, CheckCircle2, Clock, Eye, Send } from "lucide-react"
import Link from "next/link"
import type { AdmissionRequest } from "@/lib/types/database"

export default async function DocumentosPage() {
  const supabase = await createClient()

  // Get admissions that need documents
  const { data: admissions } = await supabase
    .from("admission_requests")
    .select("*")
    .eq("status", "documents_pending")
    .order("updated_at", { ascending: false })

  const admissionsData = (admissions || []) as AdmissionRequest[]

  // Get admissions that already have documents sent
  const { data: completed } = await supabase
    .from("admission_requests")
    .select("*")
    .eq("status", "completed")
    .order("updated_at", { ascending: false })
    .limit(10)

  const completedData = (completed || []) as AdmissionRequest[]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gestión de Documentación</h1>
        <p className="text-muted-foreground">Envío de documentos post-pago a nuevos socios</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes de Documentación</CardTitle>
            <Clock className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{admissionsData.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documentación Completada</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedData.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Documents */}
      <Card>
        <CardHeader>
          <CardTitle>Pendientes de Documentación</CardTitle>
          <CardDescription>Solicitudes que requieren envío de documentos</CardDescription>
        </CardHeader>
        <CardContent>
          {admissionsData.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No hay documentación pendiente</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Contacto</TableHead>
                    <TableHead>Correo</TableHead>
                    <TableHead>Fecha de Pago</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {admissionsData.map((admission) => (
                    <TableRow key={admission.id}>
                      <TableCell className="font-medium">{admission.company_name}</TableCell>
                      <TableCell>{admission.contact_name}</TableCell>
                      <TableCell className="text-sm">{admission.contact_email}</TableCell>
                      <TableCell className="text-sm">
                        {new Date(admission.updated_at).toLocaleDateString("es-MX")}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/dashboard/documentos/${admission.id}`}>
                            <Send className="h-4 w-4 mr-2" />
                            Enviar Docs
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

      {/* Completed */}
      {completedData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Documentación Completada</CardTitle>
            <CardDescription>Últimas 10 solicitudes con documentación enviada</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Contacto</TableHead>
                    <TableHead>Completado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {completedData.map((admission) => (
                    <TableRow key={admission.id}>
                      <TableCell className="font-medium">{admission.company_name}</TableCell>
                      <TableCell>{admission.contact_name}</TableCell>
                      <TableCell className="text-sm">
                        {new Date(admission.updated_at).toLocaleDateString("es-MX")}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/dashboard/documentos/${admission.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
