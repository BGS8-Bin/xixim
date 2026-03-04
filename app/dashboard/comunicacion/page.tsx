import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Megaphone, Plus, Eye, Edit, Trash2, MoreHorizontal, Send, FileText } from "lucide-react"
import Link from "next/link"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ComunicacionFilters } from "@/components/comunicacion/comunicacion-filters"

interface Announcement {
  id: string
  title: string
  excerpt: string | null
  announcement_type: string
  priority: string
  status: string
  is_public: boolean
  published_at: string | null
  created_at: string
}

const typeLabels: Record<string, { label: string; color: string }> = {
  general: { label: "General", color: "bg-gray-100 text-gray-700" },
  evento: { label: "Evento", color: "bg-blue-100 text-blue-700" },
  oportunidad: { label: "Oportunidad", color: "bg-green-100 text-green-700" },
  convocatoria: { label: "Convocatoria", color: "bg-purple-100 text-purple-700" },
  noticia: { label: "Noticia", color: "bg-orange-100 text-orange-700" },
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  draft: { label: "Borrador", variant: "outline" },
  published: { label: "Publicado", variant: "secondary" },
  archived: { label: "Archivado", variant: "default" },
}

const priorityConfig: Record<string, { label: string; color: string }> = {
  low: { label: "Baja", color: "text-gray-500" },
  normal: { label: "Normal", color: "text-blue-500" },
  high: { label: "Alta", color: "text-orange-500" },
  urgent: { label: "Urgente", color: "text-red-500" },
}

export default async function ComunicacionPage() {
  const supabase = await createClient()

  const { data: announcements } = await supabase
    .from("announcements")
    .select("*")
    .order("created_at", { ascending: false })

  const allAnnouncements = (announcements || []) as Announcement[]

  const stats = {
    total: allAnnouncements.length,
    published: allAnnouncements.filter((a) => a.status === "published").length,
    draft: allAnnouncements.filter((a) => a.status === "draft").length,
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Comunicación</h1>
          <p className="text-muted-foreground">Gestiona anuncios y comunicados del clúster</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/comunicacion/nuevo">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Anuncio
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <Megaphone className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total Anuncios</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-secondary/10">
              <Send className="h-6 w-6 text-secondary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.published}</p>
              <p className="text-xs text-muted-foreground">Publicados</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-muted">
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.draft}</p>
              <p className="text-xs text-muted-foreground">Borradores</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters - Client Component */}
      <Card>
        <CardContent className="pt-6">
          <ComunicacionFilters />
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Prioridad</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allAnnouncements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    <Megaphone className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No hay anuncios creados</p>
                    <Button asChild className="mt-4 bg-transparent" variant="outline">
                      <Link href="/dashboard/comunicacion/nuevo">Crear primer anuncio</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                allAnnouncements.map((announcement) => {
                  const type = typeLabels[announcement.announcement_type] || typeLabels.general
                  const status = statusConfig[announcement.status]
                  const priority = priorityConfig[announcement.priority]

                  return (
                    <TableRow key={announcement.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{announcement.title}</p>
                          {announcement.excerpt && (
                            <p className="text-sm text-muted-foreground line-clamp-1">{announcement.excerpt}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={type.color}>{type.label}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className={`text-sm font-medium ${priority.color}`}>{priority.label}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {new Date(announcement.created_at).toLocaleDateString("es-MX", {
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/comunicacion/${announcement.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                Ver Detalle
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            {announcement.status === "published" && (
                              <DropdownMenuItem asChild>
                                <Link href={`/dashboard/comunicacion/${announcement.id}`}>
                                  <Send className="mr-2 h-4 w-4" />
                                  Enviar a Empresas
                                </Link>
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
