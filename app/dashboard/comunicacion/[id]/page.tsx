import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Calendar, Eye, Send } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Announcement } from '@/lib/types/database'
import { SendCampaignButton } from './send-campaign-button'
import { CampaignsDashboard } from '@/components/campaigns/campaigns-dashboard'

interface PageProps {
    params: { id: string }
}

const typeLabels: Record<string, { label: string; color: string }> = {
    general: { label: 'General', color: 'bg-gray-100 text-gray-700' },
    evento: { label: 'Evento', color: 'bg-blue-100 text-blue-700' },
    oportunidad: { label: 'Oportunidad', color: 'bg-green-100 text-green-700' },
    convocatoria: { label: 'Convocatoria', color: 'bg-purple-100 text-purple-700' },
    noticia: { label: 'Noticia', color: 'bg-orange-100 text-orange-700' },
}

const priorityConfig: Record<string, { label: string; color: string }> = {
    low: { label: 'Baja', color: 'text-gray-500' },
    normal: { label: 'Normal', color: 'text-blue-500' },
    high: { label: 'Alta', color: 'text-orange-500' },
    urgent: { label: 'Urgente', color: 'text-red-500' },
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
    draft: { label: 'Borrador', variant: 'outline' },
    published: { label: 'Publicado', variant: 'secondary' },
    archived: { label: 'Archivado', variant: 'default' },
}

export default async function AnnouncementDetailPage({ params }: PageProps) {
    const supabase = await createClient()

    // Obtener el anuncio
    const { data: announcement, error } = await supabase
        .from('announcements')
        .select('*, creator:profiles(first_name, last_name, email)')
        .eq('id', params.id)
        .single()

    if (error || !announcement) {
        notFound()
    }

    const typedAnnouncement = announcement as Announcement & {
        creator?: { first_name: string; last_name: string; email: string }
    }

    const type = typeLabels[typedAnnouncement.announcement_type] || typeLabels.general
    const status = statusConfig[typedAnnouncement.status]
    const priority = priorityConfig[typedAnnouncement.priority]

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/dashboard/comunicacion">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Detalle del Anuncio</h1>
                        <p className="text-muted-foreground">
                            Ver y gestionar envíos masivos
                        </p>
                    </div>
                </div>

                {typedAnnouncement.status === 'published' && (
                    <SendCampaignButton
                        announcementId={typedAnnouncement.id}
                        announcementTitle={typedAnnouncement.title}
                    />
                )}
            </div>

            {/* Información del Anuncio */}
            <Card>
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                                <Badge className={type.color}>{type.label}</Badge>
                                <Badge variant={status.variant}>{status.label}</Badge>
                                <span className={`text-sm font-medium ${priority.color}`}>
                                    {priority.label}
                                </span>
                            </div>
                            <CardTitle className="text-3xl">{typedAnnouncement.title}</CardTitle>
                            {typedAnnouncement.excerpt && (
                                <p className="text-lg text-muted-foreground">
                                    {typedAnnouncement.excerpt}
                                </p>
                            )}
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Contenido */}
                    <div>
                        <h3 className="text-sm font-medium mb-2">Contenido</h3>
                        <div
                            className="prose max-w-none"
                            dangerouslySetInnerHTML={{ __html: typedAnnouncement.content }}
                        />
                    </div>

                    <Separator />

                    {/* Metadatos */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                            <p className="text-muted-foreground mb-1">Creado por</p>
                            <p className="font-medium">
                                {typedAnnouncement.creator
                                    ? `${typedAnnouncement.creator.first_name} ${typedAnnouncement.creator.last_name}`
                                    : 'Sistema'}
                            </p>
                        </div>

                        <div>
                            <p className="text-muted-foreground mb-1">Fecha de creación</p>
                            <p className="font-medium flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {new Date(typedAnnouncement.created_at).toLocaleDateString('es-MX', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                })}
                            </p>
                        </div>

                        {typedAnnouncement.published_at && (
                            <div>
                                <p className="text-muted-foreground mb-1">Fecha de publicación</p>
                                <p className="font-medium">
                                    {new Date(typedAnnouncement.published_at).toLocaleDateString(
                                        'es-MX',
                                        {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric',
                                        }
                                    )}
                                </p>
                            </div>
                        )}

                        <div>
                            <p className="text-muted-foreground mb-1">Visibilidad</p>
                            <p className="font-medium flex items-center gap-1">
                                <Eye className="h-4 w-4" />
                                {typedAnnouncement.is_public ? 'Público' : 'Privado'}
                            </p>
                        </div>
                    </div>

                    {typedAnnouncement.image_url && (
                        <>
                            <Separator />
                            <div>
                                <h3 className="text-sm font-medium mb-2">Imagen</h3>
                                <img
                                    src={typedAnnouncement.image_url}
                                    alt="Imagen del anuncio"
                                    className="rounded-lg max-w-full h-auto"
                                />
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Dashboard de Campañas */}
            {typedAnnouncement.status === 'published' && (
                <div>
                    <h2 className="text-xl font-semibold mb-4">Campañas de Envío</h2>
                    <CampaignsDashboard announcementId={typedAnnouncement.id} />
                </div>
            )}
        </div>
    )
}
