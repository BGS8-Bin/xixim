'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface ClusterConfig {
    id: string
    cluster_name: string
    cluster_full_name: string | null
    description: string | null
    tagline: string | null
    logo_url: string | null
    logo_icon_url: string | null
    favicon_url: string | null
    primary_color: string
    secondary_color: string
    accent_color: string
    success_color: string
    warning_color: string
    error_color: string
    contact_email: string | null
    contact_phone: string | null
    address: string | null
    city: string | null
    state: string | null
    country: string
    postal_code: string | null
    website_url: string | null
    social_media: {
        facebook?: string
        twitter?: string
        linkedin?: string
        instagram?: string
    }
    created_at: string
    updated_at: string
}

export function useClusterConfig() {
    const [config, setConfig] = useState<ClusterConfig | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const supabase = createClient()

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const { data, error } = await supabase
                    .from('cluster_config')
                    .select('*')
                    .limit(1)
                    .single()

                if (error) throw error
                setConfig(data)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Error loading configuration')
            } finally {
                setLoading(false)
            }
        }

        fetchConfig()

        // Subscribe to realtime changes
        const channel = supabase
            .channel('cluster_config_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'cluster_config'
                },
                (payload: { eventType: string; new: ClusterConfig }) => {
                    if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
                        setConfig(payload.new as ClusterConfig)
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    return { config, loading, error }
}

