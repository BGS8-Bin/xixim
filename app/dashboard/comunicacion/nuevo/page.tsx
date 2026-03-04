"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { createClient } from "@/lib/supabase/client"
import { ArrowLeft, Loader2, Save, Send, AlertTriangle } from "lucide-react"

const announcementTypes = [
  { value: "general", label: "General" },
  { value: "evento", label: "Evento" },
  { value: "oportunidad", label: "Oportunidad" },
  { value: "convocatoria", label: "Convocatoria" },
  { value: "noticia", label: "Noticia" },
]

const priorities = [
  { value: "low", label: "Baja" },
  { value: "normal", label: "Normal" },
  { value: "high", label: "Alta" },
  { value: "urgent", label: "Urgente" },
]

export default function NuevoAnuncioPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    announcement_type: "general",
    priority: "normal",
    is_public: false,
    expires_at: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value })
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData({ ...formData, [name]: checked })
  }

  const handleSubmit = async (publish: boolean) => {
    setIsSubmitting(true)
    setSubmitError(null)
    const supabase = createClient()

    try {
      // Obtener usuario actual
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) throw new Error("No se pudo verificar tu sesión. Vuelve a iniciar sesión.")

      const { error } = await supabase.from("announcements").insert({
        title: formData.title,
        content: formData.content,
        excerpt: formData.excerpt || null,
        announcement_type: formData.announcement_type,
        priority: formData.priority,
        is_public: formData.is_public,
        expires_at: formData.expires_at || null,
        status: publish ? "published" : "draft",
        published_at: publish ? new Date().toISOString() : null,
        created_by: user.id,
      })

      if (error) throw new Error(error.message)

      router.push("/dashboard/comunicacion")
      router.refresh()
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al crear el anuncio"
      setSubmitError(msg)
      console.error("Error creating announcement:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const isValid = formData.title.trim() && formData.content.trim()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/comunicacion">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Nuevo Anuncio</h1>
          <p className="text-muted-foreground">Crea un comunicado para el clúster</p>
        </div>
      </div>

      {/* Error banner */}
      {submitError && (
        <div className="flex items-start gap-2.5 bg-destructive/10 border border-destructive/30 text-destructive rounded-lg p-4 text-sm">
          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium">Error al guardar el anuncio</p>
            <p className="opacity-80 mt-0.5">{submitError}</p>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contenido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Título del anuncio"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="excerpt">Resumen</Label>
                <Textarea
                  id="excerpt"
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleChange}
                  placeholder="Breve descripción del anuncio (opcional)"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Contenido *</Label>
                <Textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  placeholder="Escribe el contenido completo del anuncio..."
                  rows={10}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuración</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="announcement_type">Tipo</Label>
                <Select
                  value={formData.announcement_type}
                  onValueChange={(v) => handleSelectChange("announcement_type", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {announcementTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Prioridad</Label>
                <Select value={formData.priority} onValueChange={(v) => handleSelectChange("priority", v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorities.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="is_public">Visible públicamente</Label>
                <Switch
                  id="is_public"
                  checked={formData.is_public}
                  onCheckedChange={(checked) => handleSwitchChange("is_public", checked)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expires_at">Fecha de expiración</Label>
                <Input
                  id="expires_at"
                  name="expires_at"
                  type="date"
                  value={formData.expires_at}
                  onChange={handleChange}
                />
                <p className="text-xs text-muted-foreground">Dejar vacío para que no expire</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Acciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                className="w-full"
                onClick={() => handleSubmit(true)}
                disabled={!isValid || isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                Publicar Ahora
              </Button>
              <Button
                className="w-full bg-transparent"
                variant="outline"
                onClick={() => handleSubmit(false)}
                disabled={!isValid || isSubmitting}
              >
                <Save className="mr-2 h-4 w-4" />
                Guardar Borrador
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
