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
import { Send, Loader2, CheckCircle2, Mail, MessageSquare } from "lucide-react"
import type { AdmissionStatus } from "@/lib/types/database"

interface DocumentActionsProps {
  admissionId: string
  currentStatus: AdmissionStatus
}

export function DocumentActions({ admissionId, currentStatus }: DocumentActionsProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [sendEmail, setSendEmail] = useState(true)
  const [sendWhatsApp, setSendWhatsApp] = useState(false)
  const [documentsChecked, setDocumentsChecked] = useState({
    carta_compromiso: false,
    info_comercial: false,
    estatutos: false,
    aviso_privacidad: false,
  })

  const allDocumentsChecked = Object.values(documentsChecked).every((checked) => checked)
  const isPending = currentStatus === "documents_pending"
  const isCompleted = currentStatus === "completed"

  const sendDocuments = async () => {
    if (!allDocumentsChecked) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Debes confirmar que todos los documentos fueron preparados.",
      })
      return
    }

    setIsLoading(true)
    const supabase = createClient()

    try {
      // Create document records
      const documentTypes: Array<"carta_compromiso" | "info_comercial" | "estatutos" | "aviso_privacidad"> = [
        "carta_compromiso",
        "info_comercial",
        "estatutos",
        "aviso_privacidad",
      ]

      for (const docType of documentTypes) {
        await supabase.from("member_documents").insert({
          admission_request_id: admissionId,
          document_type: docType,
          signed: false,
        })
      }

      // Update admission status to completed (documents sent)
      const { error: admissionError } = await supabase
        .from("admission_requests")
        .update({
          status: "completed",
        })
        .eq("id", admissionId)

      if (admissionError) throw admissionError

      // Here you would integrate with email/WhatsApp services
      // For now, we'll just show a success message

      toast({
        title: "Documentos enviados",
        description: `La documentación ha sido enviada ${sendEmail ? "por correo" : ""}${sendEmail && sendWhatsApp ? " y " : ""}${sendWhatsApp ? "por WhatsApp" : ""}.`,
      })

      router.refresh()
      router.push("/dashboard/documentos")
    } catch (error) {
      console.error("Error sending documents:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Hubo un error al enviar la documentación.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isCompleted) {
    return (
      <div className="space-y-4">
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">
            La documentación ha sido enviada. El proceso continúa con el Kit Digital de Bienvenida.
          </AlertDescription>
        </Alert>
        <Button className="w-full bg-transparent" variant="outline" asChild>
          <a href={`/dashboard/bienvenida?admission=${admissionId}`}>Ver Kit de Bienvenida</a>
        </Button>
      </div>
    )
  }

  if (!isPending) {
    return (
      <Alert>
        <AlertDescription>Esta solicitud no está lista para envío de documentación.</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <Label className="text-sm font-semibold">Confirmar documentos preparados:</Label>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="carta_compromiso"
              checked={documentsChecked.carta_compromiso}
              onCheckedChange={(checked) =>
                setDocumentsChecked({ ...documentsChecked, carta_compromiso: checked as boolean })
              }
            />
            <Label htmlFor="carta_compromiso" className="text-sm font-normal cursor-pointer">
              Carta Compromiso
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="info_comercial"
              checked={documentsChecked.info_comercial}
              onCheckedChange={(checked) =>
                setDocumentsChecked({ ...documentsChecked, info_comercial: checked as boolean })
              }
            />
            <Label htmlFor="info_comercial" className="text-sm font-normal cursor-pointer">
              Información Comercial
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="estatutos"
              checked={documentsChecked.estatutos}
              onCheckedChange={(checked) => setDocumentsChecked({ ...documentsChecked, estatutos: checked as boolean })}
            />
            <Label htmlFor="estatutos" className="text-sm font-normal cursor-pointer">
              Estatutos del Clúster
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="aviso_privacidad"
              checked={documentsChecked.aviso_privacidad}
              onCheckedChange={(checked) =>
                setDocumentsChecked({ ...documentsChecked, aviso_privacidad: checked as boolean })
              }
            />
            <Label htmlFor="aviso_privacidad" className="text-sm font-normal cursor-pointer">
              Aviso de Privacidad
            </Label>
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-3">
        <Label className="text-sm font-semibold">Métodos de envío:</Label>

        <div className="flex items-center space-x-2">
          <Checkbox id="email" checked={sendEmail} onCheckedChange={(checked) => setSendEmail(checked as boolean)} />
          <Label htmlFor="email" className="text-sm font-normal cursor-pointer flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Enviar por correo electrónico
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="whatsapp"
            checked={sendWhatsApp}
            onCheckedChange={(checked) => setSendWhatsApp(checked as boolean)}
          />
          <Label htmlFor="whatsapp" className="text-sm font-normal cursor-pointer flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Notificar por WhatsApp
          </Label>
        </div>
      </div>

      <Separator />

      <Button
        className="w-full bg-primary hover:bg-primary/90"
        onClick={sendDocuments}
        disabled={!allDocumentsChecked || (!sendEmail && !sendWhatsApp) || isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Enviando...
          </>
        ) : (
          <>
            <Send className="mr-2 h-4 w-4" />
            Enviar Documentación
          </>
        )}
      </Button>
    </div>
  )
}
