'use client'

import { useState, useEffect } from 'react'
import { useClusterConfig } from '@/hooks/useClusterConfig'
import { configService } from '@/lib/config-service'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export function ThemeSettings() {
    const { config, loading: configLoading } = useClusterConfig()
    const { toast } = useToast()
    const [saving, setSaving] = useState(false)

    const [colors, setColors] = useState({
        primary_color: config?.primary_color || '#3b82f6',
        secondary_color: config?.secondary_color || '#64748b',
        accent_color: config?.accent_color || '#10b981',
        success_color: config?.success_color || '#22c55e',
        warning_color: config?.warning_color || '#f59e0b',
        error_color: config?.error_color || '#ef4444',
    })

    useEffect(() => {
        if (config) {
            setColors({
                primary_color: config.primary_color,
                secondary_color: config.secondary_color,
                accent_color: config.accent_color,
                success_color: config.success_color,
                warning_color: config.warning_color,
                error_color: config.error_color,
            })
        }
    }, [config])

    const handleColorChange = (key: string, value: string) => {
        setColors(prev => ({
            ...prev,
            [key]: value
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        const { error } = await configService.updateClusterConfig(colors)

        if (error) {
            toast({
                title: 'Error',
                description: error,
                variant: 'destructive'
            })
        } else {
            toast({
                title: 'Colores actualizados',
                description: 'Los cambios se aplicarán inmediatamente'
            })
        }

        setSaving(false)
    }

    const resetToDefaults = async () => {
        const defaults = {
            primary_color: '#3b82f6',
            secondary_color: '#64748b',
            accent_color: '#10b981',
            success_color: '#22c55e',
            warning_color: '#f59e0b',
            error_color: '#ef4444',
        }

        setColors(defaults)

        const { error } = await configService.updateClusterConfig(defaults)

        if (error) {
            toast({
                title: 'Error',
                description: error,
                variant: 'destructive'
            })
        } else {
            toast({
                title: 'Colores restablecidos',
                description: 'Se han restaurado los colores predeterminados'
            })
        }
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
            <div className="grid gap-6 md:grid-cols-2">
                {/* Primary Color */}
                <div className="space-y-3">
                    <Label htmlFor="primary_color">Color Primario</Label>
                    <div className="flex gap-3 items-center">
                        <div className="relative">
                            <Input
                                type="color"
                                id="primary_color"
                                value={colors.primary_color}
                                onChange={(e) => handleColorChange('primary_color', e.target.value)}
                                className="h-12 w-20 cursor-pointer"
                            />
                        </div>
                        <Input
                            type="text"
                            value={colors.primary_color}
                            onChange={(e) => handleColorChange('primary_color', e.target.value)}
                            className="flex-1 font-mono"
                            placeholder="#3b82f6"
                        />
                    </div>
                    <div className="flex gap-2 items-center">
                        <div
                            className="h-8 flex-1 rounded border"
                            style={{ backgroundColor: colors.primary_color }}
                        />
                        <span className="text-xs text-muted-foreground">Preview</span>
                    </div>
                </div>

                {/* Secondary Color */}
                <div className="space-y-3">
                    <Label htmlFor="secondary_color">Color Secundario</Label>
                    <div className="flex gap-3 items-center">
                        <div className="relative">
                            <Input
                                type="color"
                                id="secondary_color"
                                value={colors.secondary_color}
                                onChange={(e) => handleColorChange('secondary_color', e.target.value)}
                                className="h-12 w-20 cursor-pointer"
                            />
                        </div>
                        <Input
                            type="text"
                            value={colors.secondary_color}
                            onChange={(e) => handleColorChange('secondary_color', e.target.value)}
                            className="flex-1 font-mono"
                            placeholder="#64748b"
                        />
                    </div>
                    <div className="flex gap-2 items-center">
                        <div
                            className="h-8 flex-1 rounded border"
                            style={{ backgroundColor: colors.secondary_color }}
                        />
                        <span className="text-xs text-muted-foreground">Preview</span>
                    </div>
                </div>

                {/* Accent Color */}
                <div className="space-y-3">
                    <Label htmlFor="accent_color">Color de Acento</Label>
                    <div className="flex gap-3 items-center">
                        <div className="relative">
                            <Input
                                type="color"
                                id="accent_color"
                                value={colors.accent_color}
                                onChange={(e) => handleColorChange('accent_color', e.target.value)}
                                className="h-12 w-20 cursor-pointer"
                            />
                        </div>
                        <Input
                            type="text"
                            value={colors.accent_color}
                            onChange={(e) => handleColorChange('accent_color', e.target.value)}
                            className="flex-1 font-mono"
                            placeholder="#10b981"
                        />
                    </div>
                    <div className="flex gap-2 items-center">
                        <div
                            className="h-8 flex-1 rounded border"
                            style={{ backgroundColor: colors.accent_color }}
                        />
                        <span className="text-xs text-muted-foreground">Preview</span>
                    </div>
                </div>

                {/* Success Color */}
                <div className="space-y-3">
                    <Label htmlFor="success_color">Color de Éxito</Label>
                    <div className="flex gap-3 items-center">
                        <div className="relative">
                            <Input
                                type="color"
                                id="success_color"
                                value={colors.success_color}
                                onChange={(e) => handleColorChange('success_color', e.target.value)}
                                className="h-12 w-20 cursor-pointer"
                            />
                        </div>
                        <Input
                            type="text"
                            value={colors.success_color}
                            onChange={(e) => handleColorChange('success_color', e.target.value)}
                            className="flex-1 font-mono"
                            placeholder="#22c55e"
                        />
                    </div>
                    <div className="flex gap-2 items-center">
                        <div
                            className="h-8 flex-1 rounded border"
                            style={{ backgroundColor: colors.success_color }}
                        />
                        <span className="text-xs text-muted-foreground">Preview</span>
                    </div>
                </div>

                {/* Warning Color */}
                <div className="space-y-3">
                    <Label htmlFor="warning_color">Color de Advertencia</Label>
                    <div className="flex gap-3 items-center">
                        <div className="relative">
                            <Input
                                type="color"
                                id="warning_color"
                                value={colors.warning_color}
                                onChange={(e) => handleColorChange('warning_color', e.target.value)}
                                className="h-12 w-20 cursor-pointer"
                            />
                        </div>
                        <Input
                            type="text"
                            value={colors.warning_color}
                            onChange={(e) => handleColorChange('warning_color', e.target.value)}
                            className="flex-1 font-mono"
                            placeholder="#f59e0b"
                        />
                    </div>
                    <div className="flex gap-2 items-center">
                        <div
                            className="h-8 flex-1 rounded border"
                            style={{ backgroundColor: colors.warning_color }}
                        />
                        <span className="text-xs text-muted-foreground">Preview</span>
                    </div>
                </div>

                {/* Error Color */}
                <div className="space-y-3">
                    <Label htmlFor="error_color">Color de Error</Label>
                    <div className="flex gap-3 items-center">
                        <div className="relative">
                            <Input
                                type="color"
                                id="error_color"
                                value={colors.error_color}
                                onChange={(e) => handleColorChange('error_color', e.target.value)}
                                className="h-12 w-20 cursor-pointer"
                            />
                        </div>
                        <Input
                            type="text"
                            value={colors.error_color}
                            onChange={(e) => handleColorChange('error_color', e.target.value)}
                            className="flex-1 font-mono"
                            placeholder="#ef4444"
                        />
                    </div>
                    <div className="flex gap-2 items-center">
                        <div
                            className="h-8 flex-1 rounded border"
                            style={{ backgroundColor: colors.error_color }}
                        />
                        <span className="text-xs text-muted-foreground">Preview</span>
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-center border-t pt-6">
                <Button
                    type="button"
                    variant="outline"
                    onClick={resetToDefaults}
                >
                    Restablecer Predeterminados
                </Button>

                <Button type="submit" disabled={saving}>
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Guardar Colores
                </Button>
            </div>
        </form>
    )
}
