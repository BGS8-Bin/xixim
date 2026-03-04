import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Mail, Clock, ArrowRight } from "lucide-react"

export default function SolicitudEnviadaPage() {
  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      {/* Header */}
      <header className="bg-background border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/images/xixim-1.webp" alt="XIXIM" width={120} height={40} className="h-10 w-auto" />
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="max-w-lg w-full text-center">
          <CardHeader className="pb-4">
            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-secondary" />
            </div>
            <CardTitle className="text-2xl">¡Solicitud Enviada!</CardTitle>
            <CardDescription>Tu solicitud de admisión ha sido recibida exitosamente</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4 text-left">
              <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                <Mail className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Revisa tu correo</p>
                  <p className="text-sm text-muted-foreground">
                    Te enviamos un correo de confirmación con los detalles de tu solicitud.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                <Clock className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Tiempo de respuesta</p>
                  <p className="text-sm text-muted-foreground">
                    Nuestro equipo revisará tu solicitud en un plazo de 3 a 5 días hábiles.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 flex flex-col gap-3">
              <Button asChild>
                <Link href="/">
                  Volver al inicio
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="https://xixim.digital/" target="_blank">
                  Conocer más sobre XIXIM
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
