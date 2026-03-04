"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { Trash2, Loader2 } from "lucide-react"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface DeleteCompanyButtonProps {
    companyId: string
    companyName: string
}

export function DeleteCompanyButton({ companyId, companyName }: DeleteCompanyButtonProps) {
    const router = useRouter()
    const { toast } = useToast()
    const [isLoading, setIsLoading] = useState(false)

    const handleDelete = async () => {
        setIsLoading(true)
        const supabase = createClient()

        try {
            const { data, error } = await supabase
                .from("companies")
                .delete()
                .eq("id", companyId)
                .select("id")

            if (error) throw error

            // Si no se devuelve ningún registro, la RLS bloqueó la operación
            if (!data || data.length === 0) {
                toast({
                    variant: "destructive",
                    title: "Sin permisos",
                    description: "No tienes permisos para eliminar esta empresa. Contacta a un administrador.",
                })
                return
            }

            toast({
                title: "Empresa eliminada",
                description: "La empresa ha sido eliminada correctamente del directorio.",
            })

            router.push("/dashboard/empresas")
            router.refresh()
        } catch (error) {
            console.error("Error deleting company:", error)
            toast({
                variant: "destructive",
                title: "Error",
                description: "Hubo un error al eliminar la empresa.",
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" disabled={isLoading}>
                    {isLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Trash2 className="mr-2 h-4 w-4" />
                    )}
                    Eliminar
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta acción no se puede deshacer. Se eliminará permanentemente la empresa{" "}
                        <strong>{companyName}</strong> y todos sus datos asociados (contactos, documentos, etc.).
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Eliminar
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
