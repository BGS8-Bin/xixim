import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { XiximLogo } from "@/components/xixim-logo"
import { AlertCircle } from "lucide-react"
import Link from "next/link"

export default function AuthErrorPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-sidebar p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <div className="flex justify-center mb-4">
            <XiximLogo className="h-16 w-auto" variant="light" />
          </div>
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-destructive/20 p-3">
                  <AlertCircle className="h-8 w-8 text-destructive" />
                </div>
              </div>
              <CardTitle className="text-2xl">Error de Autenticación</CardTitle>
              <CardDescription>No pudimos completar el proceso</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground mb-6">
                Hubo un problema al procesar tu solicitud. Por favor, intenta nuevamente.
              </p>
              <Link href="/auth/login" className="text-primary underline underline-offset-4 text-sm">
                Volver al inicio de sesión
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
