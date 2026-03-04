"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { ArrowLeft, Building2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import type { OrganizationType } from "@/lib/types/database"

export default function NuevoOrganismoPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      type: formData.get("type") as OrganizationType,
      website: formData.get("website") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      address: formData.get("address") as string,
      city: formData.get("city") as string,
      state: formData.get("state") as string,
      founded_year: formData.get("founded_year") ? Number.parseInt(formData.get("founded_year") as string) : null,
    }

    const { error: insertError } = await supabase.from("organizations").insert([data])

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    router.push("/dashboard/organismos")
    router.refresh()
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/organismos">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Nuevo Organismo</h1>
          <p className="text-muted-foreground">Registra un nuevo organismo en el clúster</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3 border-b pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <h2 className="font-semibold">Información General</h2>
          </div>

          <div className="mt-6 grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nombre del Organismo *</Label>
              <Input id="name" name="name" placeholder="Ej: Universidad Tecnológica de Durango" required />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="type">Tipo de Organismo *</Label>
              <Select name="type" required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gobierno">Gobierno</SelectItem>
                  <SelectItem value="academia">Academia</SelectItem>
                  <SelectItem value="industria">Industria</SelectItem>
                  <SelectItem value="organizacion_civil">Organización Civil</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe brevemente al organismo..."
                rows={3}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="website">Sitio Web</Label>
                <Input id="website" name="website" type="url" placeholder="https://ejemplo.com" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input id="email" name="email" type="email" placeholder="contacto@ejemplo.com" />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input id="phone" name="phone" placeholder="(618) 123-4567" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="founded_year">Año de Fundación</Label>
                <Input
                  id="founded_year"
                  name="founded_year"
                  type="number"
                  min="1900"
                  max={new Date().getFullYear()}
                  placeholder="2010"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="address">Dirección</Label>
              <Input id="address" name="address" placeholder="Calle, número, colonia" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="city">Ciudad</Label>
                <Input id="city" name="city" defaultValue="Durango" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="state">Estado</Label>
                <Input id="state" name="state" defaultValue="Durango" />
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="flex gap-4">
          <Link href="/dashboard/organismos" className="flex-1">
            <Button variant="outline" className="w-full bg-transparent">
              Cancelar
            </Button>
          </Link>
          <Button type="submit" className="flex-1" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Guardar Organismo
          </Button>
        </div>
      </form>
    </div>
  )
}
