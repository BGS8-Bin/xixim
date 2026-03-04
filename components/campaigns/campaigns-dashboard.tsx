'use client'

import { useEffect, useState } from 'react'
import { Loader2, Mail, MessageCircle, Eye, Calendar, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Progress } from '@/components/ui/progress'
import type { AnnouncementCampaign } from '@/lib/types/database'

interface CampaignsDashboardProps {
    announcementId: string
}

interface CampaignWithDetails extends AnnouncementCampaign {
    recipientsCount: number
    creator?: {
        first_name: string
        last_name: string
        email: string
    }
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
    draft: { label: 'Borrador', variant: 'outline' },
    scheduled: { label: 'Programada', variant: 'secondary' },
    sending: { label: 'Enviando', variant: 'default' },
    sent: { label: 'Enviada', variant: 'secondary' },
    failed: { label: 'Fallida', variant: 'destructive' },
    cancelled: { label: 'Cancelada', variant: 'outline' },
}

export function CampaignsDashboard({ announcementId }: CampaignsDashboardProps) {
    const [campaigns, setCampaigns] = useState<CampaignWithDetails[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchCampaigns()
        // Actualizar cada 5 segundos si hay campañas en estado "sending"
        const interval = setInterval(() => {
            if (campaigns.some((c) => c.status === 'sending')) {
                fetchCampaigns()
            }
        }, 5000)

        return () => clearInterval(interval)
    }, [announcementId, campaigns])

    const fetchCampaigns = async () => {
        try {
            const response = await fetch(`/api/announcements/${announcementId}/campaign-status`)
            const data = await response.json()

            if (data.success) {
                setCampaigns(data.campaigns || [])
            }
        } catch (error) {
            console.error('Error cargando campañas:', error)
        } finally {
            setLoading(false)
        }
    }

    const calculateProgress = (campaign: CampaignWithDetails) => {
        if (campaign.total_recipients === 0) return 0
        return Math.round((campaign.emails_sent / campaign.total_recipients) * 100)
    }

    const calculateOpenRate = (campaign: CampaignWithDetails) => {
        if (campaign.emails_sent === 0) return 0
        return Math.round((campaign.emails_opened / campaign.emails_sent) * 100)
    }

    if (loading) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </CardContent>
            </Card>
        )
    }

    if (campaigns.length === 0) {
        return (
            <Card>
                <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                    <TrendingUp className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                    <p className="text-muted-foreground">
                        Aún no se han enviado campañas para este anuncio
                    </p>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-4">
            {/* Estadísticas generales */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Campañas</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{campaigns.length}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Emails Enviados</CardTitle>
                        <Mail className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {campaigns.reduce((sum, c) => sum + c.emails_sent, 0)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {campaigns.reduce((sum, c) => sum + c.emails_failed, 0)} fallidos
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tasa de Apertura</CardTitle>
                        <Eye className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {campaigns.reduce((sum, c) => sum + c.emails_sent, 0) > 0
                                ? Math.round(
                                      (campaigns.reduce((sum, c) => sum + c.emails_opened, 0) /
                                          campaigns.reduce((sum, c) => sum + c.emails_sent, 0)) *
                                          100
                                  )
                                : 0}
                            %
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {campaigns.reduce((sum, c) => sum + c.emails_opened, 0)} aperturas
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">WhatsApp Enviados</CardTitle>
                        <MessageCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {campaigns.reduce((sum, c) => sum + c.whatsapp_sent, 0)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {campaigns.reduce((sum, c) => sum + c.whatsapp_failed, 0)} fallidos
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Tabla de campañas */}
            <Card>
                <CardHeader>
                    <CardTitle>Historial de Campañas</CardTitle>
                    <CardDescription>Todas las campañas de envío para este anuncio</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nombre</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead>Destinatarios</TableHead>
                                <TableHead>Progreso</TableHead>
                                <TableHead>Tasa Apertura</TableHead>
                                <TableHead>Fecha</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {campaigns.map((campaign) => {
                                const status = statusConfig[campaign.status] || statusConfig.draft
                                const progress = calculateProgress(campaign)
                                const openRate = calculateOpenRate(campaign)

                                return (
                                    <TableRow key={campaign.id}>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">{campaign.name}</p>
                                                {campaign.creator && (
                                                    <p className="text-sm text-muted-foreground">
                                                        Por {campaign.creator.first_name}{' '}
                                                        {campaign.creator.last_name}
                                                    </p>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={status.variant}>{status.label}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm">
                                                <p className="font-medium">
                                                    {campaign.emails_sent} / {campaign.total_recipients}
                                                </p>
                                                <div className="flex gap-2 mt-1">
                                                    {campaign.send_via_email && (
                                                        <Badge variant="outline" className="text-xs">
                                                            <Mail className="h-3 w-3 mr-1" />
                                                            Email
                                                        </Badge>
                                                    )}
                                                    {campaign.send_via_whatsapp && (
                                                        <Badge variant="outline" className="text-xs">
                                                            <MessageCircle className="h-3 w-3 mr-1" />
                                                            WhatsApp
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="w-full max-w-[120px]">
                                                <Progress value={progress} className="h-2" />
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {progress}%
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm">
                                                <p className="font-medium">{openRate}%</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {campaign.emails_opened} aperturas
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm">
                                                {campaign.scheduled_at && (
                                                    <div className="flex items-center gap-1 mb-1">
                                                        <Calendar className="h-3 w-3 text-muted-foreground" />
                                                        <span className="text-xs text-muted-foreground">
                                                            Programada
                                                        </span>
                                                    </div>
                                                )}
                                                <p>
                                                    {new Date(
                                                        campaign.started_at || campaign.created_at
                                                    ).toLocaleDateString('es-MX', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
