'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface SystemSetting {
    id: string
    key: string
    value: any
    category: 'general' | 'theme' | 'email' | 'notifications' | 'features'
    description: string | null
    created_at: string
    updated_at: string
}

export function useSystemSettings(category?: string) {
    const [settings, setSettings] = useState<SystemSetting[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const supabase = createClient()

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                let query = supabase.from('system_settings').select('*')

                if (category) {
                    query = query.eq('category', category)
                }

                const { data, error } = await query

                if (error) throw error
                setSettings(data || [])
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Error loading settings')
            } finally {
                setLoading(false)
            }
        }

        fetchSettings()

        // Subscribe to realtime changes
        const channel = supabase
            .channel('system_settings_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'system_settings'
                },
                () => {
                    // Refetch when settings change
                    fetchSettings()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [category])

    const getSetting = (key: string) => {
        const setting = settings.find((s: SystemSetting) => s.key === key)
        return setting?.value
    }

    return { settings, getSetting, loading, error }
}
