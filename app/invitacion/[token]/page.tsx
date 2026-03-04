"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { XiximLogo } from "@/components/xixim-logo"
import { InvitationService, type Invitation } from "@/lib/services/InvitationService"
import { SecurityService } from "@/lib/services/SecurityService"
import {
    CheckCircle,
    AlertTriangle,
    Eye,
    EyeOff,
    Loader2,
    UserCheck,
    Lock,
    User,
} from "lucide-react"

const ROLE_LABELS: Record<string, string> = {
    super_admin: "Super Admin",
    admin: "Administrador",
    editor: "Editor",
    viewer: "Visualizador",
    coordinador_cce: "Coordinador CCE",
}

export default function AcceptInvitationPage() {
    const params = useParams()
    const router = useRouter()
    const token = params.token as string

    const [invitation, setInvitation] = useState<Invitation | null>(null)
    const [isLoadingInvitation, setIsLoadingInvitation] = useState(true)
    const [invitationError, setInvitationError] = useState<string | null>(null)
    const [isSuccess, setIsSuccess] = useState(false)

    // Form state
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState<string | null>(null)

    // Password strength
    const passwordStrength = SecurityService.getPasswordStrength(password)
    const passwordValidation = SecurityService.validatePassword(password)

    useEffect(() => {
        const loadInvitation = async () => {
            try {
                const inv = await InvitationService.getInvitationByToken(token)
                if (!inv) {
                    setInvitationError("Esta invitación no es válida o no existe.")
                } else if (inv.status !== "pending") {
                    const messages: Record<string, string> = {
                        accepted: "Esta invitación ya fue aceptada.",
                        expired: "Esta invitación ha expirado. Pide al administrador que envíe una nueva.",
                        cancelled: "Esta invitación fue cancelada.",
                    }
                    setInvitationError(messages[inv.status] ?? "Invitación no disponible.")
                } else {
                    setInvitation(inv)
                }
            } catch {
                setInvitationError("Error al cargar la invitación. Intenta de nuevo.")
            } finally {
                setIsLoadingInvitation(false)
            }
        }

        if (token) loadInvitation()
    }, [token])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitError(null)

        // Validaciones
        if (!firstName.trim() || !lastName.trim()) {
            setSubmitError("Ingresa tu nombre completo")
            return
        }

        if (!passwordValidation.isValid) {
            setSubmitError(passwordValidation.errors[0])
            return
        }

        if (password !== confirmPassword) {
            setSubmitError("Las contraseñas no coinciden")
            return
        }

        setIsSubmitting(true)
        try {
            await InvitationService.acceptInvitation(token, {
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                password,
            })

            setIsSuccess(true)
            setTimeout(() => router.push("/auth/login"), 3000)
        } catch (err) {
            setSubmitError(
                err instanceof Error ? err.message : "Error al crear la cuenta. Intenta de nuevo."
            )
        } finally {
            setIsSubmitting(false)
        }
    }

    // Loading state
    if (isLoadingInvitation) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center space-y-3">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                    <p className="text-sm text-muted-foreground">Verificando invitación...</p>
                </div>
            </div>
        )
    }

    // Error state
    if (invitationError) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-lg border p-8 max-w-md w-full text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto">
                        <AlertTriangle className="h-8 w-8 text-red-600" />
                    </div>
                    <h1 className="text-xl font-bold">Invitación no disponible</h1>
                    <p className="text-muted-foreground text-sm">{invitationError}</p>
                    <Button variant="outline" onClick={() => router.push("/auth/login")} className="w-full">
                        Ir al Login
                    </Button>
                </div>
            </div>
        )
    }

    // Success state
    if (isSuccess) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-lg border p-8 max-w-md w-full text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                        <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <h1 className="text-xl font-bold text-green-800">¡Cuenta creada!</h1>
                    <p className="text-muted-foreground text-sm">
                        Tu cuenta ha sido creada exitosamente. Serás redirigido al login en unos segundos...
                    </p>
                    <div className="animate-pulse">
                        <Loader2 className="h-4 w-4 animate-spin text-primary mx-auto" />
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    {/* Accent bar */}
                    <div className="h-1 w-full bg-primary" />

                    <div className="p-8 space-y-6">
                        {/* Header */}
                        <div className="text-center space-y-3">
                            <div className="flex justify-center">
                                <XiximLogo className="h-10 w-auto" variant="dark" />
                            </div>
                            <div>
                                <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-medium mb-2">
                                    <UserCheck className="h-3.5 w-3.5" />
                                    Invitación recibida
                                </div>
                                <h1 className="text-xl font-bold text-gray-900">Crea tu cuenta</h1>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Fuiste invitado como{" "}
                                    <span className="font-semibold text-primary">
                                        {ROLE_LABELS[invitation?.role ?? ""] ?? invitation?.role}
                                    </span>
                                </p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Cuenta: <strong>{invitation?.email}</strong>
                                </p>
                            </div>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {submitError && (
                                <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
                                    <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                                    <span>{submitError}</span>
                                </div>
                            )}

                            {/* Nombre */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label htmlFor="first-name" className="text-sm font-medium">
                                        Nombre *
                                    </Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="first-name"
                                            placeholder="Juan"
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            className="pl-9 h-10"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="last-name" className="text-sm font-medium">
                                        Apellido *
                                    </Label>
                                    <Input
                                        id="last-name"
                                        placeholder="García"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        className="h-10"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Contraseña */}
                            <div className="space-y-1.5">
                                <Label htmlFor="password" className="text-sm font-medium">
                                    Contraseña *
                                </Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="pl-9 pr-10 h-10"
                                        required
                                        minLength={8}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        tabIndex={-1}
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>

                                {/* Strength bar */}
                                {password && (
                                    <div className="space-y-1">
                                        <div className="flex gap-1">
                                            {[25, 45, 65, 85, 100].map((threshold, i) => (
                                                <div
                                                    key={i}
                                                    className={`h-1 flex-1 rounded-full transition-colors ${passwordStrength.score >= threshold
                                                            ? passwordStrength.color
                                                            : "bg-gray-200"
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Fortaleza:{" "}
                                            <span className="font-medium">{passwordStrength.label}</span>
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Confirmar contraseña */}
                            <div className="space-y-1.5">
                                <Label htmlFor="confirm-password" className="text-sm font-medium">
                                    Confirmar Contraseña *
                                </Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="confirm-password"
                                        type={showPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className={`pl-9 h-10 ${confirmPassword && password !== confirmPassword
                                                ? "border-red-400 focus-visible:ring-red-400"
                                                : ""
                                            }`}
                                        required
                                    />
                                </div>
                                {confirmPassword && password !== confirmPassword && (
                                    <p className="text-xs text-red-600">Las contraseñas no coinciden</p>
                                )}
                            </div>

                            {/* Requisitos */}
                            <div className="bg-slate-50 rounded-lg p-3 space-y-1">
                                <p className="text-xs font-medium text-slate-600 mb-1.5">
                                    Requisitos de contraseña:
                                </p>
                                {[
                                    { text: "Mínimo 8 caracteres", valid: password.length >= 8 },
                                    { text: "Una letra mayúscula", valid: /[A-Z]/.test(password) },
                                    { text: "Una letra minúscula", valid: /[a-z]/.test(password) },
                                    { text: "Un número", valid: /[0-9]/.test(password) },
                                ].map((req) => (
                                    <div key={req.text} className="flex items-center gap-1.5 text-xs">
                                        <div
                                            className={`w-2 h-2 rounded-full ${req.valid ? "bg-green-500" : "bg-gray-300"
                                                }`}
                                        />
                                        <span className={req.valid ? "text-green-700" : "text-slate-500"}>
                                            {req.text}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-10 font-semibold gap-2"
                                disabled={
                                    isSubmitting ||
                                    !passwordValidation.isValid ||
                                    password !== confirmPassword
                                }
                            >
                                {isSubmitting ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <CheckCircle className="h-4 w-4" />
                                )}
                                {isSubmitting ? "Creando cuenta..." : "Crear Mi Cuenta"}
                            </Button>
                        </form>
                    </div>
                </div>

                {invitation?.custom_message && (
                    <div className="mt-4 bg-white border rounded-xl p-4 text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">Mensaje del administrador: </span>
                        {invitation.custom_message}
                    </div>
                )}
            </div>
        </div>
    )
}
