"use client"

import type React from "react"
import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createClient } from "@/lib/supabase/client"
import {
  Building2,
  User,
  FileText,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Loader2,
  Upload,
  AlertTriangle,
  Users,
} from "lucide-react"

const sectors = [
  { value: "software", label: "Desarrollo de Software" },
  { value: "hardware", label: "Hardware y Electrónica" },
  { value: "telecomunicaciones", label: "Telecomunicaciones" },
  { value: "consultoria", label: "Consultoría TI" },
  { value: "manufactura", label: "Manufactura Tecnológica" },
  { value: "servicios", label: "Servicios Digitales" },
  { value: "educacion", label: "Educación y Capacitación" },
  { value: "investigacion", label: "Investigación y Desarrollo" },
  { value: "otro", label: "Otro" },
]

const services = [
  { id: "networking", label: "Networking y eventos" },
  { id: "capacitacion", label: "Capacitación y talleres" },
  { id: "vinculacion", label: "Vinculación empresarial" },
  { id: "financiamiento", label: "Acceso a financiamiento" },
  { id: "internacionalizacion", label: "Internacionalización" },
  { id: "innovacion", label: "Programas de innovación" },
]

const howDidYouHear = [
  { value: "redes_sociales", label: "Redes sociales" },
  { value: "recomendacion", label: "Recomendación de socio" },
  { value: "evento", label: "Evento o conferencia" },
  { value: "busqueda", label: "Búsqueda en internet" },
  { value: "medios", label: "Medios de comunicación" },
  { value: "otro", label: "Otro" },
]

export default function SolicitudAdmisionPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [fiscalDoc, setFiscalDoc] = useState<File | null>(null)
  const [brochure, setBrochure] = useState<File | null>(null)
  const [uploadingDocs, setUploadingDocs] = useState(false)

  const [formData, setFormData] = useState({
    company_name: "",
    trade_name: "",
    rfc: "",
    sector: "",
    industry: "",
    website: "",
    contact_name: "",
    contact_position: "",
    contact_email: "",
    contact_phone: "",
    contact_birthday: "",
    employee_count: "",
    annual_revenue: "",
    founding_year: "",
    address: "",
    city: "Durango",
    state: "Durango",
    motivation: "",
    how_did_you_hear: "",
    entity_type: "",
    is_sat_registered: "",
    years_in_operation: "",
    is_startup: false,
    innovation_project_description: "",
    guarantor_1_name: "",
    guarantor_1_company: "",
    guarantor_2_name: "",
    guarantor_2_company: "",
    previous_chambers_participation: "",
    top_products: "",
    purchase_requirements: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value
    setFormData({ ...formData, [e.target.name]: value })
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value })
  }

  const toggleService = (serviceId: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId) ? prev.filter((id) => id !== serviceId) : [...prev, serviceId],
    )
  }

  const uploadFile = async (file: File, path: string) => {
    const supabase = createClient()
    const fileExt = file.name.split(".").pop()
    const fileName = `${Date.now()}.${fileExt}`
    const filePath = `${path}/${fileName}`

    const { error: uploadError } = await supabase.storage.from("admission-documents").upload(filePath, file)

    if (uploadError) throw uploadError

    const {
      data: { publicUrl },
    } = supabase.storage.from("admission-documents").getPublicUrl(filePath)

    return publicUrl
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    const supabase = createClient()

    try {
      // Validar documentos obligatorios
      if (!fiscalDoc || !brochure) {
        alert("Debes cargar la Constancia de Situación Fiscal y el Brochure empresarial")
        setIsSubmitting(false)
        return
      }

      // Subir documentos
      setUploadingDocs(true)
      const fiscalUrl = await uploadFile(fiscalDoc, "fiscal")
      const brochureUrl = await uploadFile(brochure, "brochures")
      setUploadingDocs(false)

      const yearsInOperation = formData.years_in_operation ? Number.parseInt(formData.years_in_operation) : null
      const isSatRegistered = formData.is_sat_registered === "yes"

      // Validar años de operación (mínimo 2 años, o startup con proyecto innovador)
      if (yearsInOperation !== null && yearsInOperation < 2 && !formData.is_startup) {
        alert("Se requieren al menos 2 años de operación, o marcar como startup con proyecto innovador")
        setIsSubmitting(false)
        return
      }

      const { data: newAdmission, error } = await supabase.from("admission_requests").insert({
        ...formData,
        founding_year: formData.founding_year ? Number.parseInt(formData.founding_year) : null,
        years_in_operation: yearsInOperation,
        is_sat_registered: isSatRegistered,
        services_interest: selectedServices,
        fiscal_document_url: fiscalUrl,
        brochure_url: brochureUrl,
      }).select().single()

      if (error) throw error

      // Enviar notificación de bienvenida
      if (newAdmission) {
        try {
          const { NotificationService } = await import("@/features/notifications/services")
          await NotificationService.notifyAdmissionReceived({
            contactName: newAdmission.contact_name,
            contactEmail: newAdmission.contact_email,
            contactPhone: newAdmission.contact_phone,
            companyName: newAdmission.company_name,
          })
        } catch (notifError) {
          console.error("Error enviando notificación de admisión recibida:", notifError)
          // No bloqueamos el flujo si falla la notificación
        }
      }

      router.push("/solicitud-admision/enviada")
    } catch (error) {
      console.error("Error submitting admission request:", error)
      alert("Hubo un error al enviar tu solicitud. Por favor intenta de nuevo.")
    } finally {
      setIsSubmitting(false)
      setUploadingDocs(false)
    }
  }

  const yearsInOperation = formData.years_in_operation ? Number.parseInt(formData.years_in_operation) : null
  const isStartup = yearsInOperation !== null && yearsInOperation < 2

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-background border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/images/xixim-1.webp" alt="XIXIM" width={120} height={40} className="h-10 w-auto" />
          </Link>
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Solicitud de Admisión</h1>
          <p className="text-muted-foreground">Únete al Clúster de Innovación y Tecnología de Durango</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[
            { num: 1, label: "Empresa", icon: Building2 },
            { num: 2, label: "Validación", icon: FileText },
            { num: 3, label: "Contacto", icon: User },
            { num: 4, label: "Avales", icon: Users },
          ].map((s, i) => (
            <div key={s.num} className="flex items-center">
              <div
                className={`flex items-center gap-2 px-3 py-2 rounded-full ${step === s.num
                  ? "bg-primary text-primary-foreground"
                  : step > s.num
                    ? "bg-secondary text-secondary-foreground"
                    : "bg-muted text-muted-foreground"
                  }`}
              >
                <s.icon className="h-4 w-4" />
                <span className="text-xs font-medium hidden sm:inline">{s.label}</span>
                <span className="text-xs font-medium sm:hidden">{s.num}</span>
              </div>
              {i < 3 && <div className="w-6 h-0.5 bg-muted mx-1" />}
            </div>
          ))}
        </div>

        {/* Step 1: Company Info */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Información de la Empresa</CardTitle>
              <CardDescription>Cuéntanos sobre tu empresa o negocio</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Tipo de Persona *</Label>
                <RadioGroup value={formData.entity_type} onValueChange={(v) => handleSelectChange("entity_type", v)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="persona_fisica" id="persona_fisica" />
                    <Label htmlFor="persona_fisica" className="font-normal cursor-pointer">
                      Persona física con actividad empresarial
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="persona_moral" id="persona_moral" />
                    <Label htmlFor="persona_moral" className="font-normal cursor-pointer">
                      Persona moral legalmente constituida
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="company_name">Razón Social *</Label>
                  <Input
                    id="company_name"
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleChange}
                    placeholder="Nombre legal de la empresa"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="trade_name">Nombre Comercial</Label>
                  <Input
                    id="trade_name"
                    name="trade_name"
                    value={formData.trade_name}
                    onChange={handleChange}
                    placeholder="Nombre comercial (si aplica)"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="rfc">RFC *</Label>
                  <Input
                    id="rfc"
                    name="rfc"
                    value={formData.rfc}
                    onChange={handleChange}
                    placeholder="RFC de la empresa"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sector">Sector *</Label>
                  <Select value={formData.sector} onValueChange={(v) => handleSelectChange("sector", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un sector" />
                    </SelectTrigger>
                    <SelectContent>
                      {sectors.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="industry">Actividad Específica</Label>
                  <Input
                    id="industry"
                    name="industry"
                    value={formData.industry}
                    onChange={handleChange}
                    placeholder="Ej: Desarrollo de software a medida, Ciberseguridad, IoT..."
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Describe brevemente a qué se dedica tu empresa dentro del sector seleccionado.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Sitio Web</Label>
                  <Input
                    id="website"
                    name="website"
                    type="url"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="https://www.ejemplo.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="top_products">Productos o Servicios más vendidos</Label>
                <Textarea
                  id="top_products"
                  name="top_products"
                  value={formData.top_products}
                  onChange={handleChange}
                  placeholder="Enumera tus productos o servicios principales..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="purchase_requirements">Requerimientos de Compra (Insumos)</Label>
                <Textarea
                  id="purchase_requirements"
                  name="purchase_requirements"
                  value={formData.purchase_requirements}
                  onChange={handleChange}
                  placeholder="¿Qué insumos o servicios buscas adquirir regularmente?"
                  rows={3}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="employee_count">No. de Empleados</Label>
                  <Select
                    value={formData.employee_count}
                    onValueChange={(v) => handleSelectChange("employee_count", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-10">1-10</SelectItem>
                      <SelectItem value="11-50">11-50</SelectItem>
                      <SelectItem value="51-100">51-100</SelectItem>
                      <SelectItem value="101-250">101-250</SelectItem>
                      <SelectItem value="250+">250+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="annual_revenue">Facturación Anual</Label>
                  <Select
                    value={formData.annual_revenue}
                    onValueChange={(v) => handleSelectChange("annual_revenue", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="menos_1m">Menos de $1M</SelectItem>
                      <SelectItem value="1m_5m">$1M - $5M</SelectItem>
                      <SelectItem value="5m_10m">$5M - $10M</SelectItem>
                      <SelectItem value="10m_50m">$10M - $50M</SelectItem>
                      <SelectItem value="mas_50m">Más de $50M</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="founding_year">Año de Fundación</Label>
                  <Input
                    id="founding_year"
                    name="founding_year"
                    type="number"
                    min="1900"
                    max={new Date().getFullYear()}
                    value={formData.founding_year}
                    onChange={handleChange}
                    placeholder="2020"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Dirección</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Calle, número, colonia"
                />
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  onClick={() => setStep(2)}
                  disabled={
                    !formData.company_name || !formData.rfc || !formData.sector || !formData.entity_type
                  }
                >
                  Siguiente
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Validation & Documents */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Validación y Documentos</CardTitle>
              <CardDescription>Requisitos de admisión y documentación requerida</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>¿Está inscrito y activo ante el SAT? *</Label>
                <RadioGroup
                  value={formData.is_sat_registered}
                  onValueChange={(v) => handleSelectChange("is_sat_registered", v)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="sat_yes" />
                    <Label htmlFor="sat_yes" className="font-normal cursor-pointer">
                      Sí
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="sat_no" />
                    <Label htmlFor="sat_no" className="font-normal cursor-pointer">
                      No
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="years_in_operation">¿Cuántos años de operación tiene la empresa? *</Label>
                <Input
                  id="years_in_operation"
                  name="years_in_operation"
                  type="number"
                  min="0"
                  value={formData.years_in_operation}
                  onChange={handleChange}
                  placeholder="Ej: 3"
                />
              </div>

              {isStartup && (
                <>
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Tu empresa tiene menos de 2 años de operación. Para continuar, debes demostrar que cuentas con un
                      proyecto de alto nivel de innovación, impacto o escalabilidad.
                    </AlertDescription>
                  </Alert>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is_startup"
                      name="is_startup"
                      checked={formData.is_startup}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_startup: checked as boolean })}
                    />
                    <Label htmlFor="is_startup" className="font-normal cursor-pointer">
                      Confirmo que cuento con un proyecto de alto nivel de innovación, impacto o escalabilidad
                    </Label>
                  </div>

                  {formData.is_startup && (
                    <div className="space-y-2">
                      <Label htmlFor="innovation_project_description">
                        Describe tu proyecto innovador *
                      </Label>
                      <Textarea
                        id="innovation_project_description"
                        name="innovation_project_description"
                        value={formData.innovation_project_description}
                        onChange={handleChange}
                        placeholder="Explica el nivel de innovación, impacto potencial y escalabilidad de tu proyecto..."
                        rows={4}
                      />
                    </div>
                  )}
                </>
              )}

              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-semibold">Documentos Requeridos *</h3>

                <div className="space-y-2">
                  <Label htmlFor="fiscal_doc">Constancia de Situación Fiscal (PDF) *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="fiscal_doc"
                      type="file"
                      accept=".pdf"
                      onChange={(e) => setFiscalDoc(e.target.files?.[0] || null)}
                    />
                    {fiscalDoc && <CheckCircle2 className="h-5 w-5 text-green-600 mt-2" />}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="brochure">Brochure Empresarial (PDF) *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="brochure"
                      type="file"
                      accept=".pdf"
                      onChange={(e) => setBrochure(e.target.files?.[0] || null)}
                    />
                    {brochure && <CheckCircle2 className="h-5 w-5 text-green-600 mt-2" />}
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setStep(1)}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Anterior
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  disabled={
                    !formData.is_sat_registered ||
                    !formData.years_in_operation ||
                    (isStartup && (!formData.is_startup || !formData.innovation_project_description)) ||
                    !fiscalDoc ||
                    !brochure
                  }
                >
                  Siguiente
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Contact Info */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Información de Contacto</CardTitle>
              <CardDescription>Datos del representante principal</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="contact_name">Nombre Completo *</Label>
                  <Input
                    id="contact_name"
                    name="contact_name"
                    value={formData.contact_name}
                    onChange={handleChange}
                    placeholder="Nombre del representante"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact_position">Cargo *</Label>
                  <Input
                    id="contact_position"
                    name="contact_position"
                    value={formData.contact_position}
                    onChange={handleChange}
                    placeholder="Ej: Director General, CEO"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="contact_email">Correo Electrónico *</Label>
                  <Input
                    id="contact_email"
                    name="contact_email"
                    type="email"
                    value={formData.contact_email}
                    onChange={handleChange}
                    placeholder="correo@empresa.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact_phone">Teléfono *</Label>
                  <Input
                    id="contact_phone"
                    name="contact_phone"
                    type="tel"
                    value={formData.contact_phone}
                    onChange={handleChange}
                    placeholder="618 123 4567"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_birthday">Fecha de Cumpleaños del Dueño/Representante *</Label>
                <Input
                  id="contact_birthday"
                  name="contact_birthday"
                  type="date"
                  value={formData.contact_birthday}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="motivation">¿Por qué deseas unirte al clúster? *</Label>
                <Textarea
                  id="motivation"
                  name="motivation"
                  value={formData.motivation}
                  onChange={handleChange}
                  placeholder="Cuéntanos tus motivaciones, expectativas y cómo crees que puedes contribuir al ecosistema..."
                  rows={5}
                  required
                />
              </div>

              <div className="space-y-3">
                <Label>¿Qué servicios te interesan?</Label>
                <div className="grid gap-3 sm:grid-cols-2">
                  {services.map((service) => (
                    <div key={service.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={service.id}
                        checked={selectedServices.includes(service.id)}
                        onCheckedChange={() => toggleService(service.id)}
                      />
                      <Label htmlFor={service.id} className="text-sm font-normal cursor-pointer">
                        {service.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="how_did_you_hear">¿Cómo te enteraste de nosotros?</Label>
                <Select
                  value={formData.how_did_you_hear}
                  onValueChange={(v) => handleSelectChange("how_did_you_hear", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una opción" />
                  </SelectTrigger>
                  <SelectContent>
                    {howDidYouHear.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="previous_chambers_participation">
                  Participación previa en cámaras empresariales, redes o proyectos (opcional)
                </Label>
                <Textarea
                  id="previous_chambers_participation"
                  name="previous_chambers_participation"
                  value={formData.previous_chambers_participation}
                  onChange={handleChange}
                  placeholder="Ej: Miembro activo de CANIETI desde 2020..."
                  rows={2}
                />
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setStep(2)}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Anterior
                </Button>
                <Button
                  onClick={() => setStep(4)}
                  disabled={
                    !formData.contact_name ||
                    !formData.contact_position ||
                    !formData.contact_email ||
                    !formData.contact_phone ||
                    !formData.contact_birthday ||
                    !formData.motivation
                  }
                >
                  Siguiente
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Guarantors */}
        {step === 4 && (
          <Card>
            <CardHeader>
              <CardTitle>Avales de Socios Activos</CardTitle>
              <CardDescription>Se requiere el respaldo de al menos dos socios activos del clúster</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <Users className="h-4 w-4" />
                <AlertDescription>
                  Los avales son socios activos que respaldan tu solicitud. Deben proporcionarte su nombre completo y
                  empresa para completar este paso.
                </AlertDescription>
              </Alert>

              <div className="space-y-4 p-4 border rounded-lg">
                <h3 className="font-semibold">Aval 1 *</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="guarantor_1_name">Nombre Completo *</Label>
                    <Input
                      id="guarantor_1_name"
                      name="guarantor_1_name"
                      value={formData.guarantor_1_name}
                      onChange={handleChange}
                      placeholder="Nombre del aval"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="guarantor_1_company">Empresa *</Label>
                    <Input
                      id="guarantor_1_company"
                      name="guarantor_1_company"
                      value={formData.guarantor_1_company}
                      onChange={handleChange}
                      placeholder="Empresa del aval"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4 p-4 border rounded-lg">
                <h3 className="font-semibold">Aval 2 *</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="guarantor_2_name">Nombre Completo *</Label>
                    <Input
                      id="guarantor_2_name"
                      name="guarantor_2_name"
                      value={formData.guarantor_2_name}
                      onChange={handleChange}
                      placeholder="Nombre del aval"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="guarantor_2_company">Empresa *</Label>
                    <Input
                      id="guarantor_2_company"
                      name="guarantor_2_company"
                      value={formData.guarantor_2_company}
                      onChange={handleChange}
                      placeholder="Empresa del aval"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setStep(3)}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Anterior
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={
                    !formData.guarantor_1_name ||
                    !formData.guarantor_1_company ||
                    !formData.guarantor_2_name ||
                    !formData.guarantor_2_company ||
                    isSubmitting ||
                    uploadingDocs
                  }
                >
                  {isSubmitting || uploadingDocs ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {uploadingDocs ? "Subiendo documentos..." : "Enviando..."}
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Enviar Solicitud
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
