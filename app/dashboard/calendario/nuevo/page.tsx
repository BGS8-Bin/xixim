"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { createClient } from "@/lib/supabase/client"
import { ArrowLeft, Calendar, Loader2, Save } from "lucide-react"

const eventTypes = [
  { value: "networking", label: "Networking" },
  { value: "capacitacion", label: "Capacitación" },
  { value: "conferencia", label: "Conferencia" },
  { value: "taller", label: "Taller" },
  { value: "feria", label: "Feria" },
  { value: "reunion", label: "Reunión" },
  { value: "otro", label: "Otro" },
]

export default function NuevoEventoPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    event_type: "",
    start_date: "",
    start_time: "",
    end_date: "",
    end_time: "",
    is_all_day: false,
    location: "",
    location_url: "",
    is_virtual: false,
    virtual_link: "",
    max_attendees: "",
    registration_required: false,
    is_public: true,
    status: "draft",
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
    const supabase = createClient()

    try {
      const startDateTime = formData.is_all_day
        ? `${formData.start_date}T00:00:00`
        : `${formData.start_date}T${formData.start_time}:00`

      const endDateTime = formData.is_all_day
        ? `${formData.end_date || formData.start_date}T23:59:59`
        : `${formData.end_date || formData.start_date}T${formData.end_time || formData.start_time}:00`

      const { error } = await supabase.from("events").insert({
        title: formData.title,
        description: formData.description || null,
        event_type: formData.event_type,
        start_date: startDateTime,
        end_date: endDateTime,
        is_all_day: formData.is_all_day,
        location: formData.location || null,
        location_url: formData.location_url || null,
        is_virtual: formData.is_virtual,
        virtual_link: formData.virtual_link || null,
        max_attendees: formData.max_attendees ? Number.parseInt(formData.max_attendees) : null,
        registration_required: formData.registration_required,
        is_public: formData.is_public,
        status: publish ? "published" : "draft",
      })

      if (error) throw error

      router.push("/dashboard/calendario")
    } catch (error) {
      console.error("Error creating event:", error)
      alert("Error al crear el evento")
    } finally {
      setIsSubmitting(false)
    }
  }

  const isValid = formData.title && formData.event_type && formData.start_date

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/calendario">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Nuevo Evento</h1>
          <p className="text-muted-foreground">Crea un nuevo evento para el clúster</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Información Básica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título del Evento *</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Ej: Meetup de Desarrolladores"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe el evento..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="event_type">Tipo de Evento *</Label>
                <Select value={formData.event_type} onValueChange={(v) => handleSelectChange("event_type", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {eventTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Date & Time */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Fecha y Hora
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="is_all_day">Todo el día</Label>
                <Switch
                  id="is_all_day"
                  checked={formData.is_all_day}
                  onCheckedChange={(checked) => handleSwitchChange("is_all_day", checked)}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Fecha de Inicio *</Label>
                  <Input
                    id="start_date"
                    name="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={handleChange}
                  />
                </div>
                {!formData.is_all_day && (
                  <div className="space-y-2">
                    <Label htmlFor="start_time">Hora de Inicio *</Label>
                    <Input
                      id="start_time"
                      name="start_time"
                      type="time"
                      value={formData.start_time}
                      onChange={handleChange}
                    />
                  </div>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="end_date">Fecha de Fin</Label>
                  <Input id="end_date" name="end_date" type="date" value={formData.end_date} onChange={handleChange} />
                </div>
                {!formData.is_all_day && (
                  <div className="space-y-2">
                    <Label htmlFor="end_time">Hora de Fin</Label>
                    <Input
                      id="end_time"
                      name="end_time"
                      type="time"
                      value={formData.end_time}
                      onChange={handleChange}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle>Ubicación</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="is_virtual">Evento Virtual</Label>
                <Switch
                  id="is_virtual"
                  checked={formData.is_virtual}
                  onCheckedChange={(checked) => handleSwitchChange("is_virtual", checked)}
                />
              </div>

              {formData.is_virtual ? (
                <div className="space-y-2">
                  <Label htmlFor="virtual_link">Link de la Reunión</Label>
                  <Input
                    id="virtual_link"
                    name="virtual_link"
                    type="url"
                    value={formData.virtual_link}
                    onChange={handleChange}
                    placeholder="https://zoom.us/j/..."
                  />
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="location">Dirección</Label>
                    <Input
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="Ej: Centro de Convenciones Durango"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location_url">Link de Google Maps</Label>
                    <Input
                      id="location_url"
                      name="location_url"
                      type="url"
                      value={formData.location_url}
                      onChange={handleChange}
                      placeholder="https://maps.google.com/..."
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuración</CardTitle>
              <CardDescription>Opciones de publicación</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="is_public">Evento Público</Label>
                <Switch
                  id="is_public"
                  checked={formData.is_public}
                  onCheckedChange={(checked) => handleSwitchChange("is_public", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="registration_required">Requiere Registro</Label>
                <Switch
                  id="registration_required"
                  checked={formData.registration_required}
                  onCheckedChange={(checked) => handleSwitchChange("registration_required", checked)}
                />
              </div>

              {formData.registration_required && (
                <div className="space-y-2">
                  <Label htmlFor="max_attendees">Capacidad Máxima</Label>
                  <Input
                    id="max_attendees"
                    name="max_attendees"
                    type="number"
                    min="1"
                    value={formData.max_attendees}
                    onChange={handleChange}
                    placeholder="Sin límite"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Acciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" onClick={() => handleSubmit(true)} disabled={!isValid || isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Publicar Evento
              </Button>
              <Button
                className="w-full bg-transparent"
                variant="outline"
                onClick={() => handleSubmit(false)}
                disabled={!isValid || isSubmitting}
              >
                Guardar como Borrador
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
