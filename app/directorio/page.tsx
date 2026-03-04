import { createClient } from "@/lib/supabase/server"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Building2, Globe, Mail, MapPin, Users, ArrowRight, ExternalLink } from "lucide-react"
import { DirectorioFilters } from "@/components/directorio/directorio-filters"
import type { Company } from "@/lib/types/database"

const sectorLabels: Record<string, string> = {
  software: "Software",
  hardware: "Hardware",
  telecomunicaciones: "Telecomunicaciones",
  consultoria: "Consultoría",
  manufactura: "Manufactura",
  servicios: "Servicios",
  educacion: "Educación",
  investigacion: "I+D",
  otro: "Otro",
}

export default async function DirectorioPage() {
  const supabase = await createClient()

  const { data: companies } = await supabase
    .from("companies")
    .select("*")
    .eq("membership_status", "active")
    .order("name")

  const activeCompanies = (companies || []) as Company[]

  // Group by sector for stats
  const sectorCounts = activeCompanies.reduce(
    (acc, company) => {
      acc[company.sector] = (acc[company.sector] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-background border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/images/xixim-1.webp" alt="XIXIM" width={120} height={40} className="h-10 w-auto" />
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/directorio" className="text-sm font-medium text-primary">
              Directorio
            </Link>
            <Link href="/eventos" className="text-sm text-muted-foreground hover:text-foreground">
              Eventos
            </Link>
            <Link href="/solicitud-admision" className="text-sm text-muted-foreground hover:text-foreground">
              Únete
            </Link>
          </nav>
          <Button asChild variant="outline" size="sm">
            <Link href="/auth/login">Iniciar Sesión</Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Directorio de Empresas</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Conoce a las empresas que forman parte del Clúster de Innovación y Tecnología de Durango
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeCompanies.length}</p>
                <p className="text-sm text-muted-foreground">Empresas Afiliadas</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-secondary/10">
                <Users className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{Object.keys(sectorCounts).length}</p>
                <p className="text-sm text-muted-foreground">Sectores</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters - Client Component */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <DirectorioFilters />
          </CardContent>
        </Card>

        {/* Companies Grid */}
        {activeCompanies.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Aún no hay empresas en el directorio</h3>
              <p className="text-muted-foreground mb-4">Sé el primero en unirte al clúster</p>
              <Button asChild>
                <Link href="/solicitud-admision">
                  Solicitar Admisión
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {activeCompanies.map((company) => (
              <Card key={company.id} className="group hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {company.logo_url ? (
                        <Image
                          src={company.logo_url || "/placeholder.svg"}
                          alt={company.name}
                          width={48}
                          height={48}
                          className="rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Building2 className="h-6 w-6 text-primary" />
                        </div>
                      )}
                      <div>
                        <CardTitle className="text-lg">{company.name}</CardTitle>
                        <Badge variant="outline" className="mt-1">
                          {sectorLabels[company.sector] || company.sector}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {company.description && (
                    <CardDescription className="line-clamp-2">{company.description}</CardDescription>
                  )}

                  {/* Commercial Info */}
                  {(company.top_products || company.purchase_requirements) && (
                    <div className="pt-2 space-y-2 border-t mt-2">
                      {company.top_products && (
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground">Productos/Servicios:</p>
                          <p className="text-sm line-clamp-2">{company.top_products}</p>
                        </div>
                      )}
                      {company.purchase_requirements && (
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground">Busca:</p>
                          <p className="text-sm line-clamp-2">{company.purchase_requirements}</p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="space-y-2 text-sm pt-2">
                    {company.city && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>
                          {company.city}, {company.state}
                        </span>
                      </div>
                    )}
                    {company.email && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        <a href={`mailto:${company.email}`} className="hover:text-primary">
                          {company.email}
                        </a>
                      </div>
                    )}
                    {company.website && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Globe className="h-4 w-4" />
                        <a
                          href={company.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-primary flex items-center gap-1"
                        >
                          Sitio web
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* CTA */}
        <Card className="mt-12 bg-primary text-primary-foreground">
          <CardContent className="py-8 text-center">
            <h2 className="text-2xl font-bold mb-2">¿Tu empresa no está en el directorio?</h2>
            <p className="mb-6 opacity-90">Únete al clúster y forma parte del ecosistema de innovación de Durango</p>
            <Button asChild variant="secondary">
              <Link href="/solicitud-admision">
                Solicitar Admisión
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t bg-background mt-12">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Image src="/images/xixim-1.webp" alt="XIXIM" width={100} height={32} className="h-8 w-auto" />
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} XIXIM - Clúster de Innovación y Tecnología Durango
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
