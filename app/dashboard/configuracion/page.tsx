'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Settings, Palette, Image as ImageIcon } from 'lucide-react'
import { GeneralSettings } from '@/components/dashboard/config/GeneralSettings'
import { BrandingSettings } from '@/components/dashboard/config/BrandingSettings'
import { ThemeSettings } from '@/components/dashboard/config/ThemeSettings'

export default function ConfigurationPage() {
    return (
        <div className="container mx-auto p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Configuración del Sistema</h1>
                <p className="text-muted-foreground mt-2">
                    Personaliza la información, branding y colores del clúster
                </p>
            </div>

            <Tabs defaultValue="general" className="space-y-4">
                <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
                    <TabsTrigger value="general" className="gap-2">
                        <Settings className="h-4 w-4" />
                        <span className="hidden sm:inline">General</span>
                    </TabsTrigger>
                    <TabsTrigger value="branding" className="gap-2">
                        <ImageIcon className="h-4 w-4" />
                        <span className="hidden sm:inline">Branding</span>
                    </TabsTrigger>
                    <TabsTrigger value="theme" className="gap-2">
                        <Palette className="h-4 w-4" />
                        <span className="hidden sm:inline">Tema</span>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Información General</CardTitle>
                            <CardDescription>
                                Configura el nombre, descripción y datos de contacto del clúster
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <GeneralSettings />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="branding" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Logos e Identidad</CardTitle>
                            <CardDescription>
                                Gestiona los logos y elementos visuales del clúster
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <BrandingSettings />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="theme" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Colores del Tema</CardTitle>
                            <CardDescription>
                                Personaliza la paleta de colores de la plataforma
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ThemeSettings />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
