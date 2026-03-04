"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { ArrowLeft, Building, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import type { Company, CompanySector, CompanySize, Organization } from "@/lib/types/database"

export default function EditarEmpresaPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter()
    const supabase = createClient()
    const [loading, setLoading] = useState(false)
    const [loadingData, setLoadingData] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [organizations, setOrganizations] = useState<Organization[]>([])
    const [company, setCompany] = useState<Company | null>(null)
    const [companyId, setCompanyId] = useState<string>("")

    useEffect(() => {
        async function loadData() {
            const resolvedParams = await params
            setCompanyId(resolvedParams.id)

            // Fetch company data
            const { data: companyData, error: companyError } = await supabase
                .from("companies")
                .select("*")
                .eq("id", resolvedParams.id)
                .single()

            if (companyError || !companyData) {
                setError("No se pudo cargar la empresa")
                setLoadingData(false)
                return
            }

            setCompany(companyData as Company)

            // Fetch organizations
            const { data: orgsData } = await supabase
                .from("organizations")
                .select("*")
                .eq("is_active", true)
                .order("name")

            if (orgsData) {
                setOrganizations(orgsData)
            }

            setLoadingData(false)
        }

        loadData()
    }, [params, supabase])

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
        }

        const { error: updateError } = await supabase
            .from("companies")
            .update(data)
            .eq("id", companyId)

        if (updateError) {
            setError(updateError.message)
            setLoading(false)
            return
        }

        router.push(`/dashboard/empresas/${companyId}`)
        router.refresh()
    }

    if (loadingData) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (!company) {
        return (
            <div className="text-center p-8">
                <p className="text-destructive">No se pudo cargar la empresa</p>
            </div>
        )
    }

    return (
        <div className="mx-auto max-w-2xl space-y-6">
            <div className="flex items-center gap-4">
                <Link href={`/dashboard/empresas/${companyId}`}>
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Editar Empresa</h1>
                    <p className="text-muted-foreground">Actualiza la información de {company.name}</p>
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
                                <Input id="name" name="name" defaultValue={company.name} required />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="legal_name">Razón Social</Label>
                                <Input id="legal_name" name="legal_name" defaultValue={company.legal_name || ""} />
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="rfc">RFC</Label>
                                <Input id="rfc" name="rfc" defaultValue={company.rfc || ""} maxLength={13} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="sector">Sector *</Label>
                                <Select name="sector" defaultValue={company.sector} required>
                                    <SelectTrigger>
                                        <SelectValue />
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

                        <div className="grid gap-2">
                            <Label htmlFor="description">Descripción</Label>
                            <Textarea
                                id="description"
                                name="description"
                                defaultValue={company.description || ""}
                                placeholder="Describe la empresa..."
                                rows={3}
                            />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="size">Tamaño</Label>
                                <Select name="size" defaultValue={company.size || undefined}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona el tamaño" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="micro">Micro (1-10)</SelectItem>
                                        <SelectItem value="pequena">Pequeña (11-50)</SelectItem>
                                        <SelectItem value="mediana">Mediana (51-250)</SelectItem>
                                        <SelectItem value="grande">Grande (250+)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="employee_count">Número de Empleados</Label>
                                <Input
                                    id="employee_count"
                                    name="employee_count"
                                    type="number"
                                    defaultValue={company.employee_count || ""}
                                />
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="website">Sitio Web</Label>
                                <Input id="website" name="website" type="url" defaultValue={company.website || ""} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="founded_year">Año de Fundación</Label>
                                <Input
                                    id="founded_year"
                                    name="founded_year"
                                    type="number"
                                    min="1900"
                                    max={new Date().getFullYear()}
                                    defaultValue={company.founded_year || ""}
                                />
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Correo Electrónico</Label>
                                <Input id="email" name="email" type="email" defaultValue={company.email || ""} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="phone">Teléfono</Label>
                                <Input id="phone" name="phone" defaultValue={company.phone || ""} />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="address">Dirección</Label>
                            <Input id="address" name="address" defaultValue={company.address || ""} />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="city">Ciudad</Label>
                                <Input id="city" name="city" defaultValue={company.city || "Durango"} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="state">Estado</Label>
                                <Input id="state" name="state" defaultValue={company.state || "Durango"} />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="organization_id">Organismo Afiliado</Label>
                            <Select name="organization_id" defaultValue={company.organization_id || undefined}>
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

                {error && (
                    <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
                        {error}
                    </div>
                )}

                <div className="flex gap-4">
                    <Link href={`/dashboard/empresas/${companyId}`} className="flex-1">
                        <Button variant="outline" className="w-full bg-transparent">
                            Cancelar
                        </Button>
                    </Link>
                    <Button type="submit" className="flex-1" disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Guardar Cambios
                    </Button>
                </div>
            </form>
        </div>
    )
}
