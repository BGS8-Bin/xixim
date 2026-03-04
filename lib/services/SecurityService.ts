import { createClient } from '@/lib/supabase/client'

export interface LoginAttemptData {
    email: string
    success: boolean
    userId?: string
    failureReason?: string
    ipAddress?: string
    userAgent?: string
}

export interface LoginConfig {
    id: string
    organization_id: string | null
    logo_url: string | null
    background_image_url: string | null
    background_color: string
    primary_color: string
    secondary_color: string
    welcome_message: string
    subtitle: string | null
    login_button_text: string
    footer_text: string | null
    enable_2fa: boolean
    require_2fa: boolean
    password_min_length: number
    password_require_uppercase: boolean
    password_require_lowercase: boolean
    password_require_numbers: boolean
    password_require_symbols: boolean
    max_login_attempts: number
    lockout_duration_minutes: number
    session_timeout_minutes: number
    enable_google_login: boolean
    enable_microsoft_login: boolean
}

export interface PasswordValidationResult {
    isValid: boolean
    errors: string[]
}

/**
 * Servicio para gestionar la seguridad del login:
 * - Registro de intentos de login
 * - Verificación de bloqueo de cuenta
 * - Validación de contraseña
 * - Recuperación de configuración del login
 */
export class SecurityService {
    private static supabase = createClient()

    // ─────────────────────────────────────────────
    // Login Attempts
    // ─────────────────────────────────────────────

    /**
     * Registrar un intento de login (exitoso o fallido).
     */
    static async recordLoginAttempt(data: LoginAttemptData): Promise<void> {
        try {
            await SecurityService.supabase.from('login_attempts').insert({
                email: data.email.toLowerCase().trim(),
                success: data.success,
                user_id: data.userId ?? null,
                failure_reason: data.failureReason ?? null,
                ip_address: data.ipAddress ?? null,
                user_agent: data.userAgent ?? null,
            })
        } catch (err) {
            // No lanzar error — el registro de intentos es secundario al flujo de auth
            console.warn('[SecurityService] Could not record login attempt:', err)
        }
    }

    /**
     * Verificar si una cuenta está bloqueada por intentos fallidos.
     * Llama a la función SQL `check_login_lockout`.
     */
    static async isAccountLocked(
        email: string,
        maxAttempts: number = 5,
        lockoutMinutes: number = 30
    ): Promise<boolean> {
        try {
            const { data, error } = await SecurityService.supabase.rpc(
                'check_login_lockout',
                {
                    p_email: email.toLowerCase().trim(),
                    p_max_attempts: maxAttempts,
                    p_lockout_minutes: lockoutMinutes,
                }
            )

            if (error) {
                console.warn('[SecurityService] isAccountLocked error:', error)
                return false // En caso de error, permitir el intento
            }

            return data === true
        } catch {
            return false
        }
    }

    /**
     * Obtener el número de intentos fallidos en la ventana de tiempo.
     */
    static async getFailedAttemptCount(
        email: string,
        windowMinutes: number = 30
    ): Promise<number> {
        const windowStart = new Date(
            Date.now() - windowMinutes * 60 * 1000
        ).toISOString()

        const { count, error } = await SecurityService.supabase
            .from('login_attempts')
            .select('*', { count: 'exact', head: true })
            .eq('email', email.toLowerCase().trim())
            .eq('success', false)
            .gte('created_at', windowStart)

        if (error) return 0
        return count ?? 0
    }

    // ─────────────────────────────────────────────
    // Password Validation
    // ─────────────────────────────────────────────

    /**
     * Validar una contraseña contra los requisitos de configuración.
     */
    static validatePassword(
        password: string,
        config?: Partial<LoginConfig>
    ): PasswordValidationResult {
        const errors: string[] = []
        const minLength = config?.password_min_length ?? 8
        const requireUppercase = config?.password_require_uppercase ?? true
        const requireLowercase = config?.password_require_lowercase ?? true
        const requireNumbers = config?.password_require_numbers ?? true
        const requireSymbols = config?.password_require_symbols ?? false

        if (password.length < minLength) {
            errors.push(`La contraseña debe tener al menos ${minLength} caracteres`)
        }

        if (requireUppercase && !/[A-Z]/.test(password)) {
            errors.push('Debe contener al menos una letra mayúscula')
        }

        if (requireLowercase && !/[a-z]/.test(password)) {
            errors.push('Debe contener al menos una letra minúscula')
        }

        if (requireNumbers && !/[0-9]/.test(password)) {
            errors.push('Debe contener al menos un número')
        }

        if (requireSymbols && !/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
            errors.push('Debe contener al menos un símbolo especial')
        }

        return {
            isValid: errors.length === 0,
            errors,
        }
    }

    /**
     * Calcular la fortaleza de una contraseña (0-100).
     */
    static getPasswordStrength(password: string): {
        score: number
        label: 'Muy débil' | 'Débil' | 'Regular' | 'Fuerte' | 'Muy fuerte'
        color: string
    } {
        let score = 0

        if (password.length >= 8) score += 20
        if (password.length >= 12) score += 10
        if (password.length >= 16) score += 10
        if (/[A-Z]/.test(password)) score += 15
        if (/[a-z]/.test(password)) score += 10
        if (/[0-9]/.test(password)) score += 15
        if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) score += 20

        if (score < 25)
            return { score, label: 'Muy débil', color: 'bg-red-500' }
        if (score < 45)
            return { score, label: 'Débil', color: 'bg-orange-500' }
        if (score < 65)
            return { score, label: 'Regular', color: 'bg-yellow-500' }
        if (score < 85)
            return { score, label: 'Fuerte', color: 'bg-blue-500' }
        return { score, label: 'Muy fuerte', color: 'bg-green-500' }
    }

    // ─────────────────────────────────────────────
    // Login Config
    // ─────────────────────────────────────────────

    /**
     * Obtener la configuración de login global (sin organization_id).
     */
    static async getGlobalLoginConfig(): Promise<LoginConfig | null> {
        const { data, error } = await SecurityService.supabase
            .from('login_config')
            .select('*')
            .is('organization_id', null)
            .single()

        if (error) {
            if (error.code === 'PGRST116') return null
            console.warn('[SecurityService] getGlobalLoginConfig error:', error)
            return null
        }

        return data as LoginConfig
    }

    /**
     * Obtener configuración de login para un organismo específico,
     * con fallback a la global.
     */
    static async getLoginConfig(
        organizationId?: string | null
    ): Promise<LoginConfig | null> {
        if (organizationId) {
            const { data } = await SecurityService.supabase
                .from('login_config')
                .select('*')
                .eq('organization_id', organizationId)
                .single()

            if (data) return data as LoginConfig
        }

        return SecurityService.getGlobalLoginConfig()
    }

    /**
     * Actualizar la configuración del login.
     */
    static async updateLoginConfig(
        configId: string,
        updates: Partial<LoginConfig>,
        updatedBy: string
    ): Promise<void> {
        const { error } = await SecurityService.supabase
            .from('login_config')
            .update({ ...updates, updated_by: updatedBy })
            .eq('id', configId)

        if (error) throw error
    }
}
