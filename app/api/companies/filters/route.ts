import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/companies/filters
 * Obtiene valores únicos para filtros de empresas
 */
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()

        // Verificar autenticación
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        // Obtener todas las empresas
        const { data: companies, error: companiesError } = await supabase
            .from('companies')
            .select('membership_status, membership_type, sector, size, city, state')

        if (companiesError) {
            console.error('Error obteniendo empresas:', companiesError)
            return NextResponse.json(
                { error: 'Error obteniendo datos' },
                { status: 500 }
            )
        }

        // Extraer valores únicos para cada filtro
        const membershipStatuses = [
            ...new Set(companies?.map((c) => c.membership_status).filter(Boolean)),
        ]
        const membershipTypes = [
            ...new Set(companies?.map((c) => c.membership_type).filter(Boolean)),
        ]
        const sectors = [...new Set(companies?.map((c) => c.sector).filter(Boolean))]
        const sizes = [...new Set(companies?.map((c) => c.size).filter(Boolean))]
        const cities = [...new Set(companies?.map((c) => c.city).filter(Boolean))]
        const states = [...new Set(companies?.map((c) => c.state).filter(Boolean))]

        // Obtener conteo total de empresas
        const totalCompanies = companies?.length || 0

        return NextResponse.json({
            success: true,
            filters: {
                membership_status: membershipStatuses.map((value) => ({
                    value,
                    label: getStatusLabel(value as string),
                    count: companies?.filter((c) => c.membership_status === value).length || 0,
                })),
                membership_type: membershipTypes.map((value) => ({
                    value,
                    label: getTypeLabel(value as string),
                    count: companies?.filter((c) => c.membership_type === value).length || 0,
                })),
                sector: sectors.map((value) => ({
                    value,
                    label: getSectorLabel(value as string),
                    count: companies?.filter((c) => c.sector === value).length || 0,
                })),
                size: sizes.map((value) => ({
                    value,
                    label: getSizeLabel(value as string),
                    count: companies?.filter((c) => c.size === value).length || 0,
                })),
                city: cities.map((value) => ({
                    value,
                    label: value,
                    count: companies?.filter((c) => c.city === value).length || 0,
                })),
                state: states.map((value) => ({
                    value,
                    label: value,
                    count: companies?.filter((c) => c.state === value).length || 0,
                })),
            },
            totalCompanies,
        })
    } catch (error) {
        console.error('Error en /api/companies/filters:', error)
        return NextResponse.json(
            {
                error: 'Error obteniendo filtros',
                details: error instanceof Error ? error.message : 'Error desconocido',
            },
            { status: 500 }
        )
    }
}

// Funciones helper para labels en español
function getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
        pending: 'Pendiente',
        active: 'Activo',
        inactive: 'Inactivo',
        suspended: 'Suspendido',
    }
    return labels[status] || status
}

function getTypeLabel(type: string): string {
    const labels: Record<string, string> = {
        basica: 'Básica',
        premium: 'Premium',
        enterprise: 'Enterprise',
    }
    return labels[type] || type
}

function getSectorLabel(sector: string): string {
    const labels: Record<string, string> = {
        software: 'Software',
        hardware: 'Hardware',
        telecomunicaciones: 'Telecomunicaciones',
        consultoria: 'Consultoría',
        manufactura: 'Manufactura',
        servicios: 'Servicios',
        educacion: 'Educación',
        investigacion: 'Investigación',
        otro: 'Otro',
    }
    return labels[sector] || sector
}

function getSizeLabel(size: string): string {
    const labels: Record<string, string> = {
        micro: 'Micro',
        pequena: 'Pequeña',
        mediana: 'Mediana',
        grande: 'Grande',
    }
    return labels[size] || size
}
