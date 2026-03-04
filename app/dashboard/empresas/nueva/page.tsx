"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { ArrowLeft, Building, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import type { CompanySector, CompanySize, Organization } from "@/lib/types/database"

export default function NuevaEmpresaPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedOrgId = searchParams.get("organization_id")
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [organizations, setOrganizations] = useState<Organization[]>([])

  useEffect(() => {
    async function fetchOrganizations() {
      const { data } = await supabase.from("organizations").select("*").eq("is_active", true).order("name")

      if (data) {
        setOrganizations(data)
      }
    }
    fetchOrganizations()
  }, [supabase])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const organizationId = formData.get("organization_id") as string

    const data = {
      name: formData.get("name") as string,
      legal_name: formData.get("legal_name") as string,
      rfc: formData.get("rfc") as string,
      description: formData.get("description") as string,
      sector: formData.get("sector") as CompanySector,
      size: formData.get("size") as CompanySize,
      website: formData.get("website") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      address: formData.get("address") as string,
      city: formData.get("city") as string,
      state: formData.get("state") as string,
      employee_count: formData.get("employee_count") ? Number.parseInt(formData.get("employee_count") as string) : null,
      founded_year: formData.get("founded_year") ? Number.parseInt(formData.get("founded_year") as string) : null,
      organization_id: organizationId || null,
      membership_status: "pending" as const,
    }

    const { error: insertError } = await supabase.from("companies").insert([data])

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    router.push("/dashboard/empresas")
    router.refresh()
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/empresas">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Nueva Empresa</h1>
          <p className="text-muted-foreground">Registra una nueva empresa afiliada</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3 border-b pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Building className="h-5 w-5 text-primary" />
            </div>
            <h2 className="font-semibold">Información de la Empresa</h2>
          </div>

          <div className="mt-6 grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="name">Nombre Comercial *</Label>
                <Input id="name" name="name" placeholder="Ej: Tech Solutions" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="legal_name">Razón Social</Label>
                <Input id="legal_name" name="legal_name" placeholder="Ej: Tech Solutions SA de CV" />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="rfc">RFC</Label>
                <Input id="rfc" name="rfc" placeholder="XXX000000XX0" maxLength={13} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="sector">Sector *</Label>
                <Select name="sector" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el sector" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="software">Software</SelectItem>
                    <SelectItem value="hardware">Hardware</SelectItem>
                    <SelectItem value="telecomunicaciones">Telecomunicaciones</SelectItem>
                    <SelectItem value="consultoria">Consultoría</SelectItem>
                    <SelectItem value="manufactura">Manufactura</SelectItem>
                    <SelectItem value="servicios">Servicios</SelectItem>
                    <SelectItem value="educacion">Educación</SelectItem>
                    <SelectItem value="investigacion">Investigación</SelectItem>
                    <SelectItem value="otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="size">Tamaño de Empresa</Label>
                <Select name="size">
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el tamaño" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="micro">Micro (1-10 empleados)</SelectItem>
                    <SelectItem value="pequena">Pequeña (11-50 empleados)</SelectItem>
                    <SelectItem value="mediana">Mediana (51-250 empleados)</SelectItem>
                    <SelectItem value="grande">Grande (250+ empleados)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="employee_count">Número de Empleados</Label>
                <Input id="employee_count" name="employee_count" type="number" min="1" placeholder="25" />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe la actividad principal de la empresa..."
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="organization_id">Organismo Asociado</Label>
              <Select name="organization_id" defaultValue={preselectedOrgId || undefined}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un organismo (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  {organizations.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="font-semibold">Información de Contacto</h2>

          <div className="mt-4 grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="email">Correo Electrónico *</Label>
                <Input id="email" name="email" type="email" placeholder="contacto@empresa.com" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input id="phone" name="phone" placeholder="(618) 123-4567" />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="website">Sitio Web</Label>
                <Input id="website" name="website" type="url" placeholder="https://empresa.com" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="founded_year">Año de Fundación</Label>
                <Input
                  id="founded_year"
                  name="founded_year"
                  type="number"
                  min="1900"
                  max={new Date().getFullYear()}
                  placeholder="2015"
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
          <Link href="/dashboard/empresas" className="flex-1">
            <Button variant="outline" className="w-full bg-transparent">
              Cancelar
            </Button>
          </Link>
          <Button type="submit" className="flex-1" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Registrar Empresa
          </Button>
        </div>
      </form>
    </div>
  )
}
