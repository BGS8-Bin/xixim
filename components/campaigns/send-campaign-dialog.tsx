'use client'

import { useState } from 'react'
import { Send, Mail, MessageCircle, Loader2, TestTube, Calendar } from 'lucide-react'
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
import { AudienceSelector } from './audience-selector'
import type { CampaignFilters } from '@/lib/types/database'

interface SendCampaignDialogProps {
    announcementId: string
    announcementTitle: string
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
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
    const [currentStep, setCurrentStep] = useState<'audience' | 'options' | 'confirm'>('audience')

    // Configuración de audiencia
    const [filters, setFilters] = useState<CampaignFilters>({})
    const [sendToAllCompanies, setSendToAllCompanies] = useState(true)
    const [sendToContacts, setSendToContacts] = useState(false)

    // Opciones de envío
    const [sendViaEmail, setSendViaEmail] = useState(true)
    const [sendViaWhatsapp, setSendViaWhatsapp] = useState(false)
    const [scheduledAt, setScheduledAt] = useState<string>('')

    // Configuración
    const [campaignName, setCampaignName] = useState(`Campaña: ${announcementTitle}`)

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
            setCurrentStep('options')
        } else if (currentStep === 'options') {
            setCurrentStep('confirm')
        }
    }

    const handleBack = () => {
        if (currentStep === 'confirm') {
            setCurrentStep('options')
        } else if (currentStep === 'options') {
            setCurrentStep('audience')
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Enviar Aviso a Empresas</DialogTitle>
                    <DialogDescription>
                        Configura el envío masivo de "{announcementTitle}"
                    </DialogDescription>
                </DialogHeader>

                <Tabs value={currentStep} className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="audience" disabled={currentStep !== 'audience'}>
                            1. Audiencia
                        </TabsTrigger>
                        <TabsTrigger value="options" disabled={currentStep !== 'options'}>
                            2. Opciones
                        </TabsTrigger>
                        <TabsTrigger value="confirm" disabled={currentStep !== 'confirm'}>
                            3. Confirmar
                        </TabsTrigger>
                    </TabsList>

                    {/* Paso 1: Selección de Audiencia */}
                    <TabsContent value="audience" className="space-y-4">
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
                                    Incluir contactos adicionales de las empresas
                                </Label>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Enviar también a todos los contactos registrados de cada empresa
                                </p>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Paso 2: Opciones de Envío */}
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
