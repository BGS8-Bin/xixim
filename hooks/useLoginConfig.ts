'use client'

import { useState, useEffect, useCallback } from 'react'
import { SecurityService, LoginConfig } from '@/lib/services/SecurityService'

/**
 * Hook para acceder y actualizar la configuración visual y de seguridad del login.
 *
 * @example
 * ```tsx
 * const { config, isLoading } = useLoginConfig()
 * // config.welcome_message, config.primary_color, etc.
 * ```
 */
export function useLoginConfig(organizationId?: string | null) {
    const [config, setConfig] = useState<LoginConfig | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    const fetchConfig = useCallback(async () => {
        try {
            setIsLoading(true)
            setError(null)
            const data = await SecurityService.getLoginConfig(organizationId)
            setConfig(data)
        } catch (err) {
            setError(err as Error)
        } finally {
            setIsLoading(false)
        }
    }, [organizationId])

    useEffect(() => {
        fetchConfig()
    }, [fetchConfig])

    const updateConfig = useCallback(
        async (updates: Partial<LoginConfig>, updatedBy: string) => {
            if (!config?.id) throw new Error('No config loaded')
            await SecurityService.updateLoginConfig(config.id, updates, updatedBy)
            // Actualizar estado local inmediatamente
            setConfig((prev) => (prev ? { ...prev, ...updates } : prev))
        },
        [config]
    )

    return {
        config,
        isLoading,
        error,
        updateConfig,
        refreshConfig: fetchConfig,
    }
}
