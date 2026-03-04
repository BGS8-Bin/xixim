"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { Send, Loader2, CheckCircle2, Gift } from "lucide-react"
import type { WelcomeKit } from "@/lib/types/database"

interface WelcomeKitActionsProps {
  admissionId: string
  welcomeKit?: WelcomeKit
}

export function WelcomeKitActions({ admissionId, welcomeKit }: WelcomeKitActionsProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [acceptedStatutes, setAcceptedStatutes] = useState(welcomeKit?.estatutos_accepted || false)
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(welcomeKit?.privacy_accepted || false)
  const [grantedAccess, setGrantedAccess] = useState(welcomeKit?.directory_access_granted || false)

  const allAccepted = acceptedStatutes && acceptedPrivacy && grantedAccess
  const kitSent = welcomeKit?.kit_sent || false

  const sendWelcomeKit = async () => {
    if (!allAccepted) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Debes confirmar todos los elementos antes de enviar el kit.",
      })
      return
    }

    setIsLoading(true)
    const supabase = createClient()

    try {
      if (welcomeKit) {
        // Update existing kit
        const { error } = await supabase
          .from("welcome_kits")
          .update({
            estatutos_accepted: true,
            privacy_accepted: true,
            directory_access_granted: true,
            accepted_at: new Date().toISOString(),
            kit_sent: true,
            kit_sent_at: new Date().toISOString(),
          })
          .eq("id", welcomeKit.id)

        if (error) throw error
      } else {
        // Create new kit
        const { error } = await supabase.from("welcome_kits").insert({
          admission_request_id: admissionId,
          estatutos_accepted: true,
          privacy_accepted: true,
          directory_access_granted: true,
          accepted_at: new Date().toISOString(),
          kit_sent: true,
          kit_sent_at: new Date().toISOString(),
        })

        if (error) throw error
      }

      toast({
        title: "Kit enviado exitosamente",
        description: "El Kit Digital de Bienvenida ha sido enviado al nuevo socio.",
      })

      router.refresh()
      router.push("/dashboard/bienvenida")
    } catch (error) {
      console.error("Error sending welcome kit:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Hubo un error al enviar el kit de bienvenida.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (kitSent) {
    return (
      <div className="space-y-4">
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">
            El Kit Digital de Bienvenida ha sido enviado. El proceso de admisión está completo.
          </AlertDescription>
        </Alert>

        <div className="text-sm space-y-2 p-3 bg-muted rounded-lg">
          <p className="font-semibold">Kit enviado:</p>
          <p className="text-muted-foreground">
            {welcomeKit?.kit_sent_at
              ? new Date(welcomeKit.kit_sent_at).toLocaleString("es-MX", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "Fecha no disponible"}
          </p>
        </div>

        <Button className="w-full bg-transparent" variant="outline" asChild>
          <a href="/dashboard/empresas">Ver Socios del Clúster</a>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <Label className="text-sm font-semibold">Confirmar elementos del kit:</Label>

        <div className="space-y-3">
          <div className="flex items-start space-x-2 p-3 border rounded-lg">
            <Checkbox
              id="estatutos"
              checked={acceptedStatutes}
              onCheckedChange={(checked) => setAcceptedStatutes(checked as boolean)}
            />
            <div className="flex-1">
              <Label htmlFor="estatutos" className="text-sm font-medium cursor-pointer">
                Derechos y Obligaciones (Estatutos)
              </Label>
              <p className="text-xs text-muted-foreground mt-1">
                El socio debe aceptar los estatutos del clúster mediante checkbox
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-2 p-3 border rounded-lg">
            <Checkbox
              id="privacy"
              checked={acceptedPrivacy}
              onCheckedChange={(checked) => setAcceptedPrivacy(checked as boolean)}
            />
            <div className="flex-1">
              <Label htmlFor="privacy" className="text-sm font-medium cursor-pointer">
                Aviso de Privacidad
              </Label>
              <p className="text-xs text-muted-foreground mt-1">
                Confirmación explícita de aceptación del aviso de privacidad
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-2 p-3 border rounded-lg">
            <Checkbox
              id="access"
              checked={grantedAccess}
              onCheckedChange={(checked) => setGrantedAccess(checked as boolean)}
            />
            <div className="flex-1">
              <Label htmlFor="access" className="text-sm font-medium cursor-pointer">
                Acceso al Directorio de Socios
              </Label>
              <p className="text-xs text-muted-foreground mt-1">
                Otorgar acceso al directorio empresarial del clúster
              </p>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      <Alert>
        <Gift className="h-4 w-4" />
        <AlertDescription>
          Al enviar el kit, el proceso de admisión se completa y el nuevo socio tendrá acceso completo al clúster.
        </AlertDescription>
      </Alert>

      <Button
        className="w-full bg-primary hover:bg-primary/90"
        onClick={sendWelcomeKit}
        disabled={!allAccepted || isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Enviando Kit...
          </>
        ) : (
          <>
            <Send className="mr-2 h-4 w-4" />
            Enviar Kit Digital de Bienvenida
          </>
        )}
      </Button>
    </div>
  )
}
