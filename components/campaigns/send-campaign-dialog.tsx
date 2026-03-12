'use client'

import { useState, useEffect, useCallback } from 'react'
import { Send, Mail, MessageCircle, Loader2, TestTube, Calendar, Eye, Users, Edit3, Monitor } from 'lucide-react'
import { toast } from 'sonner'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { AudienceSelector } from './audience-selector'
import type { CampaignFilters } from '@/lib/types/database'
import { createClient } from '@/lib/supabase/client'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import { wrapInEmailTemplate } from '@/lib/email-template'
interface SendCampaignDialogProps {
    announcementId: string
    announcementTitle: string
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
}

interface RecipientPreview {
    id: string
    companyId: string
    contactId: string | null
    type: string
    companyName: string
    name: string
    email: string
    phone: string | null
}

export function SendCampaignDialog({
    announcementId,
    announcementTitle,
    open,
    onOpenChange,
    onSuccess,
}: SendCampaignDialogProps) {
    const [loading, setLoading] = useState(false)
    const [sendingTest, setSendingTest] = useState(false)
    const [loadingPreview, setLoadingPreview] = useState(false)
    const [currentStep, setCurrentStep] = useState<'audience' | 'preview_content' | 'options' | 'confirm'>('audience')
    const [contentView, setContentView] = useState<'edit' | 'preview'>('edit')

    // Configuración de audiencia
    const [filters, setFilters] = useState<CampaignFilters>({})
    const [sendToAllCompanies, setSendToAllCompanies] = useState(true)
    const [sendToContacts, setSendToContacts] = useState(false)

    // Preview de audiencia
    const [previewRecipients, setPreviewRecipients] = useState<RecipientPreview[]>([])
    const [selectedRecipients, setSelectedRecipients] = useState<string[]>([])

    // Opciones de envío
    const [sendViaEmail, setSendViaEmail] = useState(true)
    const [sendViaWhatsapp, setSendViaWhatsapp] = useState(false)
    const [scheduledAt, setScheduledAt] = useState<string>('')

    // Configuración y Contenido
    const [campaignName, setCampaignName] = useState(`Campaña: ${announcementTitle}`)
    const [emailSubject, setEmailSubject] = useState(`${announcementTitle} - XIXIM Cluster`)
    const [emailHtmlBody, setEmailHtmlBody] = useState('<p>Cargando contenido...</p>')

    // Cargar contenido inicial del anuncio cuando se abre el modal
    useEffect(() => {
        if (open) {
            setCurrentStep('audience')
            setContentView('edit')
            const fetchAnnouncement = async () => {
                const supabase = createClient()
                const { data } = await supabase.from('announcements').select('content, excerpt, title').eq('id', announcementId).single()
                if (data) {
                    let defaultHtml = `<h2>${data.title}</h2>`
                    if (data.excerpt) defaultHtml += `<p><em>${data.excerpt}</em></p>`
                    defaultHtml += data.content
                    setEmailHtmlBody(defaultHtml)
                }
            }
            fetchAnnouncement()
        }
    }, [open, announcementId])

    const fetchPreview = useCallback(async () => {
        try {
            setLoadingPreview(true)
            const response = await fetch('/api/announcements/preview-audience', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    filters,
                    sendToAllCompanies,
                    sendToContacts
                })
            })
            const data = await response.json()
            if (data.success) {
                setPreviewRecipients(data.recipients)
                setSelectedRecipients(data.recipients.map((r: any) => r.id))
            } else {
                toast.error('Error cargando vista previa de audiencia')
            }
        } catch (error) {
            toast.error('Error cargando vista previa')
        } finally {
            setLoadingPreview(false)
        }
    }, [filters, sendToAllCompanies, sendToContacts])

    useEffect(() => {
        if (open) {
            fetchPreview()
        }
    }, [fetchPreview, open])

    const handleSendTest = async () => {
        try {
            setSendingTest(true)
            const response = await fetch(`/api/announcements/${announcementId}/test`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({}),
            })

            const data = await response.json()

            if (data.success) {
                toast.success('Email de prueba enviado', {
                    description: data.message,
                })
            } else {
                toast.error('Error enviando email de prueba', {
                    description: data.error || 'Ocurrió un error',
                })
            }
        } catch (error) {
            console.error('Error enviando prueba:', error)
            toast.error('Error enviando email de prueba')
        } finally {
            setSendingTest(false)
        }
    }

    const handleSend = async () => {
        try {
            setLoading(true)

            if (!sendViaEmail && !sendViaWhatsapp) {
                toast.error('Debes seleccionar al menos un canal de envío')
                setLoading(false)
                return
            }

            const selectedRecipientsData = previewRecipients
                .filter(r => selectedRecipients.includes(r.id))
                .map(r => ({
                    companyId: r.companyId,
                    contactId: r.contactId,
                    email: r.email,
                    name: r.name,
                    phone: r.phone
                }))

            if (selectedRecipientsData.length === 0) {
                toast.error('Debes seleccionar al menos un destinatario')
                setLoading(false)
                return
            }

            const response = await fetch(`/api/announcements/${announcementId}/send`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: campaignName,
                    filters,
                    sendToAllCompanies,
                    sendToContacts,
                    sendViaEmail,
                    sendViaWhatsapp,
                    scheduledAt: scheduledAt || undefined,
                    executeImmediately: !scheduledAt,
                    customEmailSubject: emailSubject,
                    customEmailHtml: emailHtmlBody,
                    selectedRecipients: selectedRecipientsData
                }),
            })

            const data = await response.json()

            if (data.success) {
                toast.success(data.message, {
                    description: `${data.campaign.totalRecipients} destinatarios`,
                })
                onOpenChange(false)
                onSuccess?.()
            } else {
                toast.error('Error enviando campaña', {
                    description: data.error || 'Ocurrió un error',
                })
            }
        } catch (error) {
            console.error('Error enviando campaña:', error)
            toast.error('Error enviando campaña')
        } finally {
            setLoading(false)
        }
    }

    const handleNext = () => {
        if (currentStep === 'audience') {
            setCurrentStep('preview_content')
        } else if (currentStep === 'preview_content') {
            setCurrentStep('options')
        } else if (currentStep === 'options') {
            setCurrentStep('confirm')
        }
    }

    const handleBack = () => {
        if (currentStep === 'confirm') {
            setCurrentStep('options')
        } else if (currentStep === 'options') {
            setCurrentStep('preview_content')
        } else if (currentStep === 'preview_content') {
            setCurrentStep('audience')
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Enviar Aviso a Empresas</DialogTitle>
                    <DialogDescription>
                        Configura el envío masivo de "{announcementTitle}"
                    </DialogDescription>
                </DialogHeader>

                <Tabs value={currentStep} className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="audience" disabled={currentStep !== 'audience'}>
                            1. Audiencia
                        </TabsTrigger>
                        <TabsTrigger value="preview_content" disabled={currentStep !== 'preview_content'}>
                            2. Contenido
                        </TabsTrigger>
                        <TabsTrigger value="options" disabled={currentStep !== 'options'}>
                            3. Opciones
                        </TabsTrigger>
                        <TabsTrigger value="confirm" disabled={currentStep !== 'confirm'}>
                            4. Confirmar
                        </TabsTrigger>
                    </TabsList>

                    {/* Paso 1: Selección de Audiencia */}
                    <TabsContent value="audience" className="space-y-4">
                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                            {/* Columna izquierda: Filtros */}
                            <div className="lg:col-span-2 space-y-4">
                                <AudienceSelector
                                    filters={filters}
                                    sendToAllCompanies={sendToAllCompanies}
                                    onFiltersChange={setFilters}
                                    onSendToAllChange={setSendToAllCompanies}
                                />

                                <div className="flex items-start space-x-3 rounded-lg border p-4">
                                    <Checkbox
                                        id="send-to-contacts"
                                        checked={sendToContacts}
                                        onCheckedChange={(checked) => setSendToContacts(checked as boolean)}
                                    />
                                    <div className="flex-1">
                                        <Label htmlFor="send-to-contacts" className="text-sm font-medium">
                                            Incluir contactos adicionales
                                        </Label>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Enviar también a todos los contactos registrados de cada empresa
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Columna derecha: Destinatarios */}
                            <div className="lg:col-span-3 space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label className="flex items-center gap-2 font-semibold text-sm">
                                        <Users className="h-4 w-4" />
                                        Destinatarios ({selectedRecipients.length}/{previewRecipients.length})
                                    </Label>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 text-xs"
                                        onClick={() => {
                                            if (selectedRecipients.length === previewRecipients.length) {
                                                setSelectedRecipients([])
                                            } else {
                                                setSelectedRecipients(previewRecipients.map(r => r.id))
                                            }
                                        }}
                                    >
                                        {selectedRecipients.length === previewRecipients.length ? 'Ninguno' : 'Todos'}
                                    </Button>
                                </div>
                                <ScrollArea className="h-[420px] border rounded-md p-2">
                                    {loadingPreview ? (
                                        <div className="flex flex-col justify-center items-center h-full gap-2 text-muted-foreground">
                                            <Loader2 className="h-6 w-6 animate-spin" />
                                            <span className="text-xs">Cargando destinatarios...</span>
                                        </div>
                                    ) : previewRecipients.length === 0 ? (
                                        <p className="text-sm text-muted-foreground text-center p-4">
                                            No se encontraron destinatarios con los filtros seleccionados.
                                        </p>
                                    ) : (
                                        <div className="space-y-1">
                                            {previewRecipients.map((rec) => (
                                                <div
                                                    key={rec.id}
                                                    className="flex items-start gap-2 p-2 rounded hover:bg-muted/50 cursor-pointer"
                                                    onClick={() => {
                                                        setSelectedRecipients(prev =>
                                                            prev.includes(rec.id)
                                                                ? prev.filter(id => id !== rec.id)
                                                                : [...prev, rec.id]
                                                        )
                                                    }}
                                                >
                                                    <Checkbox
                                                        checked={selectedRecipients.includes(rec.id)}
                                                        className="mt-0.5 shrink-0"
                                                        onCheckedChange={(checked) => {
                                                            setSelectedRecipients(prev =>
                                                                checked
                                                                    ? [...prev, rec.id]
                                                                    : prev.filter(id => id !== rec.id)
                                                            )
                                                        }}
                                                    />
                                                    <div className="min-w-0">
                                                        <div className="text-xs font-medium text-primary truncate">{rec.companyName}</div>
                                                        <div className="text-sm font-medium truncate">{rec.name}</div>
                                                        <div className="text-xs text-muted-foreground truncate">{rec.email}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </ScrollArea>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Paso 2: Contenido del Email */}
                    <TabsContent value="preview_content" className="space-y-4">
                        <div className="space-y-3">
                                {/* Asunto */}
                                <div className="space-y-1.5">
                                    <Label htmlFor="email-subject" className="text-sm font-semibold flex items-center gap-2">
                                        <Mail className="h-4 w-4" /> Asunto del correo
                                    </Label>
                                    <Input
                                        id="email-subject"
                                        value={emailSubject}
                                        onChange={(e) => setEmailSubject(e.target.value)}
                                        placeholder="Ej: Evento especial - XIXIM Cluster"
                                    />
                                </div>

                                {/* Toggle Editar / Vista Previa */}
                                <div className="flex items-center justify-between">
                                    <Label className="text-sm font-semibold flex items-center gap-2">
                                        <Edit3 className="h-4 w-4" /> Cuerpo del correo
                                    </Label>
                                    <div className="flex rounded-md border overflow-hidden text-xs">
                                        <button
                                            type="button"
                                            className={`px-3 py-1.5 flex items-center gap-1.5 transition-colors ${contentView === 'edit' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                                            onClick={() => setContentView('edit')}
                                        >
                                            <Edit3 className="h-3 w-3" /> Editar
                                        </button>
                                        <button
                                            type="button"
                                            className={`px-3 py-1.5 flex items-center gap-1.5 transition-colors border-l ${contentView === 'preview' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                                            onClick={() => setContentView('preview')}
                                        >
                                            <Monitor className="h-3 w-3" /> Vista previa
                                        </button>
                                    </div>
                                </div>

                                {contentView === 'edit' ? (
                                    <RichTextEditor
                                        value={emailHtmlBody}
                                        onChange={(html) => setEmailHtmlBody(html)}
                                        minHeight="300px"
                                        placeholder="Escribe el contenido del correo..."
                                        onImageUpload={async (file: File) => {
                                            try {
                                                const supabase = createClient()
                                                const fileExt = file.name.split('.').pop()
                                                const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`
                                                const { error } = await supabase.storage
                                                    .from('announcements')
                                                    .upload(fileName, file, { cacheControl: '3600', upsert: false })
                                                if (error) throw error
                                                const { data: { publicUrl } } = supabase.storage
                                                    .from('announcements')
                                                    .getPublicUrl(fileName)
                                                return publicUrl
                                            } catch (error) {
                                                toast.error('Error subiendo imagen')
                                                return null
                                            }
                                        }}
                                    />
                                ) : (
                                    <div className="border rounded-md overflow-hidden bg-muted/20">
                                        <div className="bg-muted/50 border-b px-3 py-1.5 flex items-center gap-2">
                                            <div className="flex gap-1">
                                                <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                                                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                                                <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                                            </div>
                                            <span className="text-xs text-muted-foreground flex-1 text-center">
                                                Vista previa — Asunto: {emailSubject}
                                            </span>
                                        </div>
                                        <iframe
                                            srcDoc={wrapInEmailTemplate(emailHtmlBody)}
                                            className="w-full border-0"
                                            style={{ height: '360px' }}
                                            title="Vista previa del correo"
                                            sandbox="allow-same-origin"
                                        />
                                    </div>
                                )}

                                <p className="text-xs text-muted-foreground">
                                    El encabezado y pie XIXIM se agregan automáticamente al enviar.
                                </p>
                        </div>
                    </TabsContent>

                    {/* Paso 3: Opciones de Envío */}
                    <TabsContent value="options" className="space-y-4">
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="campaign-name">Nombre de la campaña</Label>
                                <Input
                                    id="campaign-name"
                                    value={campaignName}
                                    onChange={(e) => setCampaignName(e.target.value)}
                                    placeholder="Ej: Campaña de anuncio importante"
                                    className="mt-1.5"
                                />
                            </div>

                            <Separator />

                            <div className="space-y-3">
                                <Label className="text-sm font-medium">Canales de Envío</Label>

                                <div className="flex items-start space-x-3 rounded-lg border p-4">
                                    <Checkbox
                                        id="send-via-email"
                                        checked={sendViaEmail}
                                        onCheckedChange={(checked) =>
                                            setSendViaEmail(checked as boolean)
                                        }
                                    />
                                    <div className="flex-1">
                                        <Label
                                            htmlFor="send-via-email"
                                            className="text-sm font-medium flex items-center gap-2"
                                        >
                                            <Mail className="h-4 w-4" />
                                            Email
                                        </Label>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Enviar por correo electrónico (recomendado)
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-3 rounded-lg border p-4">
                                    <Checkbox
                                        id="send-via-whatsapp"
                                        checked={sendViaWhatsapp}
                                        onCheckedChange={(checked) =>
                                            setSendViaWhatsapp(checked as boolean)
                                        }
                                    />
                                    <div className="flex-1">
                                        <Label
                                            htmlFor="send-via-whatsapp"
                                            className="text-sm font-medium flex items-center gap-2"
                                        >
                                            <MessageCircle className="h-4 w-4" />
                                            WhatsApp
                                        </Label>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Enviar también por WhatsApp (solo para avisos urgentes)
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-3">
                                <Label className="text-sm font-medium">Programación</Label>

                                <div className="flex items-start space-x-3 rounded-lg border p-4">
                                    <Calendar className="h-5 w-5 mt-0.5 text-muted-foreground" />
                                    <div className="flex-1 space-y-2">
                                        <Label htmlFor="scheduled-at">
                                            Programar envío (opcional)
                                        </Label>
                                        <Input
                                            id="scheduled-at"
                                            type="datetime-local"
                                            value={scheduledAt}
                                            onChange={(e) => setScheduledAt(e.target.value)}
                                        />
                                        <p className="text-sm text-muted-foreground">
                                            Dejar vacío para enviar inmediatamente
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Paso 3: Confirmación */}
                    <TabsContent value="confirm" className="space-y-4">
                        <div className="rounded-lg border p-4 space-y-3">
                            <h4 className="font-medium">Resumen de la campaña</h4>

                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <p className="text-muted-foreground">Nombre:</p>
                                    <p className="font-medium">{campaignName}</p>
                                </div>

                                <div>
                                    <p className="text-muted-foreground">Audiencia:</p>
                                    <p className="font-medium">
                                        {sendToAllCompanies ? 'Todas las empresas' : 'Filtrada'}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-muted-foreground">Canales:</p>
                                    <p className="font-medium">
                                        {[
                                            sendViaEmail && 'Email',
                                            sendViaWhatsapp && 'WhatsApp',
                                        ]
                                            .filter(Boolean)
                                            .join(', ')}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-muted-foreground">Programación:</p>
                                    <p className="font-medium">
                                        {scheduledAt
                                            ? new Date(scheduledAt).toLocaleString('es-MX')
                                            : 'Envío inmediato'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
                            <p className="text-sm text-amber-900">
                                <strong>Importante:</strong> Esta acción enviará el aviso a todas las
                                empresas seleccionadas. Asegúrate de revisar la configuración antes de
                                continuar.
                            </p>
                        </div>
                    </TabsContent>
                </Tabs>

                <DialogFooter className="flex justify-between sm:justify-between">
                    <div className="flex gap-2">
                        {currentStep === 'audience' && (
                            <Button
                                variant="outline"
                                onClick={handleSendTest}
                                disabled={sendingTest}
                            >
                                {sendingTest ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Enviando...
                                    </>
                                ) : (
                                    <>
                                        <TestTube className="mr-2 h-4 w-4" />
                                        Enviar Prueba
                                    </>
                                )}
                            </Button>
                        )}
                    </div>

                    <div className="flex gap-2">
                        {currentStep !== 'audience' && (
                            <Button variant="outline" onClick={handleBack} disabled={loading}>
                                Atrás
                            </Button>
                        )}

                        {currentStep !== 'confirm' ? (
                            <Button onClick={handleNext}>Siguiente</Button>
                        ) : (
                            <Button onClick={handleSend} disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Enviando...
                                    </>
                                ) : (
                                    <>
                                        <Send className="mr-2 h-4 w-4" />
                                        {scheduledAt ? 'Programar Envío' : 'Enviar Ahora'}
                                    </>
                                )}
                            </Button>
                        )}
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
