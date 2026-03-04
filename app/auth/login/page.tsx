"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { XiximLogo } from "@/components/xixim-logo"
import { SecurityService, type LoginConfig } from "@/lib/services/SecurityService"
import { Eye, EyeOff, AlertTriangle, Lock, Mail, Loader2 } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [loginConfig, setLoginConfig] = useState<LoginConfig | null>(null)
  const [failedAttempts, setFailedAttempts] = useState(0)
  const [isLocked, setIsLocked] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  // Cargar configuración del login al montar
  useEffect(() => {
    SecurityService.getGlobalLoginConfig().then((config) => {
      if (config) setLoginConfig(config)
    })
  }, [])

  const maxAttempts = loginConfig?.max_login_attempts ?? 5
  const lockoutMinutes = loginConfig?.lockout_duration_minutes ?? 30
  const primaryColor = loginConfig?.primary_color ?? "#3b82f6"
  const welcomeMessage = loginConfig?.welcome_message ?? "Bienvenido al CRM"
  const subtitle = loginConfig?.subtitle ?? "Inicia sesión para continuar"
  const buttonText = loginConfig?.login_button_text ?? "Iniciar Sesión"
  const footerText = loginConfig?.footer_text

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // 1. Verificar si la cuenta está bloqueada
      const locked = await SecurityService.isAccountLocked(
        email,
        maxAttempts,
        lockoutMinutes
      )

      if (locked) {
        setIsLocked(true)
        setError(
          `Cuenta bloqueada por ${lockoutMinutes} minutos debido a múltiples intentos fallidos. Intenta más tarde o recupera tu contraseña.`
        )
        setIsLoading(false)
        return
      }

      // 2. Intentar login
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        // Registrar intento fallido
        await SecurityService.recordLoginAttempt({
          email,
          success: false,
          failureReason: authError.message,
          userAgent: navigator.userAgent,
        })

        const newAttempts = failedAttempts + 1
        setFailedAttempts(newAttempts)

        const remaining = maxAttempts - newAttempts
        if (remaining > 0 && remaining <= 2) {
          setError(
            `Credenciales incorrectas. Te quedan ${remaining} intento${remaining === 1 ? "" : "s"} antes de que la cuenta sea bloqueada.`
          )
        } else if (remaining <= 0) {
          setIsLocked(true)
          setError(
            `Cuenta bloqueada por ${lockoutMinutes} minutos. Intenta más tarde o recupera tu contraseña.`
          )
        } else {
          setError("Correo o contraseña incorrectos")
        }
        return
      }

      // 3. Registrar login exitoso
      await SecurityService.recordLoginAttempt({
        email,
        success: true,
        userId: data.user?.id,
        userAgent: navigator.userAgent,
      })

      router.push("/dashboard")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4"
      style={{ backgroundColor: loginConfig?.background_color ?? "#f1f5f9" }}
    >
      {/* Background pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(${primaryColor} 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }}
      />

      <div className="w-full max-w-[420px] relative">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Top accent bar */}
          <div className="h-1 w-full" style={{ backgroundColor: primaryColor }} />

          <div className="p-8 space-y-6">
            {/* Logo y título */}
            <div className="text-center space-y-3">
              <div className="flex justify-center">
                {loginConfig?.logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={loginConfig.logo_url}
                    alt="Logo"
                    className="h-14 w-auto object-contain"
                  />
                ) : (
                  <XiximLogo className="h-12 w-auto" variant="dark" />
                )}
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 leading-tight">
                  {welcomeMessage}
                </h1>
                {subtitle && (
                  <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
                )}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4" noValidate>
              {/* Error banner */}
              {error && (
                <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
                  <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Correo Electrónico
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 h-10"
                    disabled={isLocked}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Contraseña
                  </Label>
                  <Link
                    href="/auth/recuperar-contrasena"
                    className="text-xs font-medium hover:underline"
                    style={{ color: primaryColor }}
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 pr-10 h-10"
                    disabled={isLocked}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Intentos restantes indicator */}
              {failedAttempts > 0 && !isLocked && (
                <div className="flex items-center gap-1.5 text-xs text-amber-600">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>
                    {Math.max(0, maxAttempts - failedAttempts)} intento
                    {maxAttempts - failedAttempts === 1 ? "" : "s"} restante
                    {maxAttempts - failedAttempts === 1 ? "" : "s"}
                  </span>
                  <div className="flex gap-0.5 ml-1">
                    {Array.from({ length: maxAttempts }).map((_, i) => (
                      <div
                        key={i}
                        className={`h-1.5 w-3 rounded-full transition-colors ${i < failedAttempts ? "bg-red-400" : "bg-gray-200"
                          }`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Submit */}
              <Button
                type="submit"
                className="w-full h-10 font-semibold text-sm gap-2"
                disabled={isLoading || isLocked}
                style={{ backgroundColor: primaryColor, borderColor: primaryColor }}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : null}
                {isLoading ? "Iniciando sesión..." : buttonText}
              </Button>
            </form>


          </div>

          {/* Footer */}
          {footerText && (
            <div className="px-8 py-4 bg-gray-50 border-t border-gray-100">
              <p className="text-xs text-center text-gray-400">{footerText}</p>
            </div>
          )}
        </div>

        {/* Bottom text */}
        <p className="text-center text-xs text-gray-400 mt-4">
          Sistema CRM para Clústeres Empresariales
        </p>
      </div>
    </div>
  )
}
