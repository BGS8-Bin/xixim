'use client'

import { useState, useRef } from 'react'
import { useClusterConfig } from '@/hooks/useClusterConfig'
import { configService } from '@/lib/config-service'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Loader2, Upload, X } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import Image from 'next/image'

export function BrandingSettings() {
    const { config, loading: configLoading } = useClusterConfig()
    const { toast } = useToast()
    const [uploading, setUploading] = useState<string | null>(null)

    const logoInputRef = useRef<HTMLInputElement>(null)
    const iconInputRef = useRef<HTMLInputElement>(null)
    const faviconInputRef = useRef<HTMLInputElement>(null)

    const handleFileUpload = async (
        file: File,
        type: 'logo' | 'icon' | 'favicon'
    ) => {
        setUploading(type)

        // Upload to storage
        const { url, error: uploadError } = await configService.uploadLogo(file, type)

        if (uploadError) {
            toast({
                title: 'Error al subir archivo',
                description: uploadError,
                variant: 'destructive'
            })
            setUploading(null)
            return
        }

        // Update config with new URL
        const field = type === 'logo' ? 'logo_url' : type === 'icon' ? 'logo_icon_url' : 'favicon_url'
        const { error } = await configService.updateClusterConfig({
            [field]: url
        })

        if (error) {
            toast({
                title: 'Error',
                description: error,
                variant: 'destructive'
            })
        } else {
            toast({
                title: 'Logo actualizado',
                description: `El ${type === 'logo' ? 'logo principal' : type === 'icon' ? 'icono' : 'favicon'} se ha actualizado correctamente`
            })
        }

        setUploading(null)
    }

    const handleFileChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        type: 'logo' | 'icon' | 'favicon'
    ) => {
        const file = e.target.files?.[0]
        if (file) {
            handleFileUpload(file, type)
        }
    }

    const handleRemove = async (type: 'logo' | 'icon' | 'favicon') => {
        const field = type === 'logo' ? 'logo_url' : type === 'icon' ? 'logo_icon_url' : 'favicon_url'
        const { error } = await configService.updateClusterConfig({
            [field]: null
        })

        if (error) {
            toast({
                title: 'Error',
                description: error,
                variant: 'destructive'
            })
        } else {
            toast({
                title: 'Logo eliminado',
                description: 'El logo se ha eliminado correctamente'
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
        <div className="space-y-8">
            {/* Logo Principal */}
            <div className="space-y-4">
                <div>
                    <Label>Logo Principal</Label>
                    <p className="text-sm text-muted-foreground">
                        Recomendado: 400x100px, formato PNG con fondo transparente
                    </p>
                </div>

                {config?.logo_url ? (
                    <div className="flex items-center gap-4">
                        <div className="relative h-24 w-48 border rounded-lg overflow-hidden bg-white">
                            <Image
                                src={config.logo_url}
                                alt="Logo del clúster"
                                fill
                                className="object-contain p-2"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => logoInputRef.current?.click()}
                                disabled={uploading === 'logo'}
                            >
                                {uploading === 'logo' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Cambiar
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemove('logo')}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ) : (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => logoInputRef.current?.click()}
                        disabled={uploading === 'logo'}
                    >
                        {uploading === 'logo' ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Upload className="mr-2 h-4 w-4" />
                        )}
                        Subir Logo
                    </Button>
                )}

                <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileChange(e, 'logo')}
                />
            </div>

            {/* Logo Icono */}
            <div className="space-y-4 border-t pt-6">
                <div>
                    <Label>Icono / Logo Compacto</Label>
                    <p className="text-sm text-muted-foreground">
                        Recomendado: 64x64px, formato PNG. Se usa en espacios pequeños
                    </p>
                </div>

                {config?.logo_icon_url ? (
                    <div className="flex items-center gap-4">
                        <div className="relative h-16 w-16 border rounded-lg overflow-hidden bg-white">
                            <Image
                                src={config.logo_icon_url}
                                alt="Icono del clúster"
                                fill
                                className="object-contain p-2"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => iconInputRef.current?.click()}
                                disabled={uploading === 'icon'}
                            >
                                {uploading === 'icon' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Cambiar
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemove('icon')}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ) : (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => iconInputRef.current?.click()}
                        disabled={uploading === 'icon'}
                    >
                        {uploading === 'icon' ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Upload className="mr-2 h-4 w-4" />
                        )}
                        Subir Icono
                    </Button>
                )}

                <input
                    ref={iconInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileChange(e, 'icon')}
                />
            </div>

            {/* Favicon */}
            <div className="space-y-4 border-t pt-6">
                <div>
                    <Label>Favicon</Label>
                    <p className="text-sm text-muted-foreground">
                        Recomendado: 32x32px, formato .ico o .png
                    </p>
                </div>

                {config?.favicon_url ? (
                    <div className="flex items-center gap-4">
                        <div className="relative h-12 w-12 border rounded-lg overflow-hidden bg-white">
                            <Image
                                src={config.favicon_url}
                                alt="Favicon"
                                fill
                                className="object-contain p-1"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => faviconInputRef.current?.click()}
                                disabled={uploading === 'favicon'}
                            >
                                {uploading === 'favicon' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Cambiar
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemove('favicon')}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ) : (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => faviconInputRef.current?.click()}
                        disabled={uploading === 'favicon'}
                    >
                        {uploading === 'favicon' ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Upload className="mr-2 h-4 w-4" />
                        )}
                        Subir Favicon
                    </Button>
                )}

                <input
                    ref={faviconInputRef}
                    type="file"
                    accept="image/*,.ico"
                    className="hidden"
                    onChange={(e) => handleFileChange(e, 'favicon')}
                />
            </div>
        </div>
    )
}
