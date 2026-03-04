'use client'

import { useState, useEffect } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

interface AuthState {
    user: User | null
    session: Session | null
    isLoading: boolean
}

/**
 * Hook para acceder al usuario y sesión actual de Supabase.
 * Escucha cambios de sesión en tiempo real.
 *
 * @example
 * ```tsx
 * const { user, session, isLoading } = useAuth()
 * if (!user) return <Login />
 * ```
 */
export function useAuth(): AuthState {
    const supabase = createClient()
    const [state, setState] = useState<AuthState>({
        user: null,
        session: null,
        isLoading: true,
    })

    useEffect(() => {
        // Obtener sesión inicial
        supabase.auth.getSession().then(({ data: { session } }) => {
            setState({
                user: session?.user ?? null,
                session,
                isLoading: false,
            })
        })

        // Suscribirse a cambios de autenticación
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setState({
                user: session?.user ?? null,
                session,
                isLoading: false,
            })
        })

        return () => subscription.unsubscribe()
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    return state
}
