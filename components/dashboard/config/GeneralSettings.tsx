'use client'

import { useState } from 'react'
import { useClusterConfig } from '@/hooks/useClusterConfig'
import { configService } from '@/lib/config-service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export function GeneralSettings() {
    const { config, loading: configLoading } = useClusterConfig()
    const { toast } = useToast()
    const [saving, setSaving] = useState(false)

    const [formData, setFormData] = useState({
        cluster_name: config?.cluster_name || '',
        cluster_full_name: config?.cluster_full_name || '',
        description: config?.description || '',
        tagline: config?.tagline || '',
        contact_email: config?.contact_email || '',
        contact_phone: config?.contact_phone || '',
        address: config?.address || '',
        city: config?.city || '',
        state: config?.state || '',
        country: config?.country || 'México',
        postal_code: config?.postal_code || '',
        website_url: config?.website_url || '',
    })

    // Update form data when config loads
    useState(() => {
        if (config) {
            setFormData({
                cluster_name: config.cluster_name || '',
                cluster_full_name: config.cluster_full_name || '',
                description: config.description || '',
                tagline: config.tagline || '',
                contact_email: config.contact_email || '',
                contact_phone: config.contact_phone || '',
                address: config.address || '',
                city: config.city || '',
                state: config.state || '',
                country: config.country || 'México',
                postal_code: config.postal_code || '',
                website_url: config.website_url || '',
            })
        }
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        const { error } = await configService.updateClusterConfig(formData)

        if (error) {
            toast({
                title: 'Error',
                description: error,
                variant: 'destructive'
            })
        } else {
            toast({
                title: 'Configuración guardada',
                description: 'Los cambios se han aplicado correctamente'
            })
        }

        setSaving(false)
    }

    if (configLoading) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="cluster_name">Nombre del Clúster *</Label>
                    <Input
                        id="cluster_name"
                        name="cluster_name"
                        value={formData.cluster_name}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="cluster_full_name">Nombre Completo</Label>
                    <Input
                        id="cluster_full_name"
                        name="cluster_full_name"
                        value={formData.cluster_full_name}
                        onChange={handleChange}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="tagline">Eslogan</Label>
                <Input
                    id="tagline"
                    name="tagline"
                    value={formData.tagline}
                    onChange={handleChange}
                    placeholder="Ej: Innovación que transforma"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Describe brevemente al clúster..."
                />
            </div>

            <div className="border-t pt-6">
                <h4 className="font-medium mb-4">Información de Contacto</h4>
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="contact_email">Email</Label>
                        <Input
                            id="contact_email"
                            name="contact_email"
                            type="email"
                            value={formData.contact_email}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="contact_phone">Teléfono</Label>
                        <Input
                            id="contact_phone"
                            name="contact_phone"
                            value={formData.contact_phone}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="website_url">Sitio Web</Label>
                        <Input
                            id="website_url"
                            name="website_url"
                            type="url"
                            value={formData.website_url}
                            onChange={handleChange}
                            placeholder="https://ejemplo.com"
                        />
                    </div>
                </div>
            </div>

            <div className="border-t pt-6">
                <h4 className="font-medium mb-4">Dirección</h4>
                <div className="grid gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="address">Calle y Número</Label>
                        <Input
                            id="address"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                            <Label htmlFor="city">Ciudad</Label>
                            <Input
                                id="city"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="state">Estado</Label>
                            <Input
                                id="state"
                                name="state"
                                value={formData.state}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="postal_code">Código Postal</Label>
                            <Input
                                id="postal_code"
                                name="postal_code"
                                value={formData.postal_code}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="country">País</Label>
                        <Input
                            id="country"
                            name="country"
                            value={formData.country}
                            onChange={handleChange}
                        />
                    </div>
                </div>
            </div>

            <div className="flex justify-end">
                <Button type="submit" disabled={saving}>
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Guardar Cambios
                </Button>
            </div>
        </form>
    )
}
