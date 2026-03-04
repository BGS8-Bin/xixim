'use client'

import { useState, useEffect } from 'react'
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible'
import type { CampaignFilters } from '@/lib/types/database'

interface FilterOption {
    value: string
    label: string
    count: number
}

interface AvailableFilters {
    membership_status: FilterOption[]
    membership_type: FilterOption[]
    sector: FilterOption[]
    size: FilterOption[]
    city: FilterOption[]
    state: FilterOption[]
}

interface AudienceSelectorProps {
    filters: CampaignFilters
    sendToAllCompanies: boolean
    onFiltersChange: (filters: CampaignFilters) => void
    onSendToAllChange: (sendToAll: boolean) => void
    totalCompaniesCount?: number
}

export function AudienceSelector({
    filters,
    sendToAllCompanies,
    onFiltersChange,
    onSendToAllChange,
    totalCompaniesCount,
}: AudienceSelectorProps) {
    const [availableFilters, setAvailableFilters] = useState<AvailableFilters | null>(null)
    const [loading, setLoading] = useState(true)
    const [isFiltersOpen, setIsFiltersOpen] = useState(!sendToAllCompanies)

    useEffect(() => {
        fetchAvailableFilters()
    }, [])

    useEffect(() => {
        if (sendToAllCompanies) {
            setIsFiltersOpen(false)
        } else {
            setIsFiltersOpen(true)
        }
    }, [sendToAllCompanies])

    const fetchAvailableFilters = async () => {
        try {
            setLoading(true)
            const response = await fetch('/api/companies/filters')
            const data = await response.json()

            if (data.success) {
                setAvailableFilters(data.filters)
            }
        } catch (error) {
            console.error('Error cargando filtros:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleFilterChange = (
        filterType: keyof CampaignFilters,
        value: string,
        checked: boolean
    ) => {
        const currentValues = filters[filterType] || []

        const newValues = checked
            ? [...currentValues, value as any]
            : currentValues.filter((v) => v !== value)

        onFiltersChange({
            ...filters,
            [filterType]: newValues,
        })
    }

    const getSelectedCount = () => {
        if (sendToAllCompanies) {
            return totalCompaniesCount || 0
        }

        // Calcular estimado basado en filtros
        let count = totalCompaniesCount || 0

        if (filters.membership_status && filters.membership_status.length > 0) {
            count = filters.membership_status.reduce((sum, status) => {
                const option = availableFilters?.membership_status.find((o) => o.value === status)
                return sum + (option?.count || 0)
            }, 0)
        }

        return count
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {/* Opción: Todas las empresas */}
            <div className="flex items-start space-x-3 rounded-lg border p-4">
                <Checkbox
                    id="all-companies"
                    checked={sendToAllCompanies}
                    onCheckedChange={(checked) => onSendToAllChange(checked as boolean)}
                />
                <div className="flex-1">
                    <Label
                        htmlFor="all-companies"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                        Enviar a todas las empresas afiliadas
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                        {totalCompaniesCount || 0} empresas registradas en el sistema
                    </p>
                </div>
            </div>

            {/* Filtros avanzados */}
            <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
                <CollapsibleTrigger asChild>
                    <Button
                        variant="outline"
                        className="w-full justify-between"
                        disabled={sendToAllCompanies}
                    >
                        <span>Filtros avanzados</span>
                        <ChevronsUpDown className="h-4 w-4" />
                    </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-4 mt-4">
                    {/* Estado de membresía */}
                    {availableFilters?.membership_status &&
                        availableFilters.membership_status.length > 0 && (
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Estado de Membresía</Label>
                                <div className="space-y-2">
                                    {availableFilters.membership_status.map((option) => (
                                        <div key={option.value} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`status-${option.value}`}
                                                checked={filters.membership_status?.includes(
                                                    option.value as any
                                                )}
                                                onCheckedChange={(checked) =>
                                                    handleFilterChange(
                                                        'membership_status',
                                                        option.value,
                                                        checked as boolean
                                                    )
                                                }
                                                disabled={sendToAllCompanies}
                                            />
                                            <Label
                                                htmlFor={`status-${option.value}`}
                                                className="text-sm font-normal flex items-center gap-2 cursor-pointer"
                                            >
                                                {option.label}
                                                <Badge variant="secondary" className="text-xs">
                                                    {option.count}
                                                </Badge>
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                    {/* Tipo de membresía */}
                    {availableFilters?.membership_type &&
                        availableFilters.membership_type.length > 0 && (
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Tipo de Membresía</Label>
                                <div className="space-y-2">
                                    {availableFilters.membership_type.map((option) => (
                                        <div key={option.value} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`type-${option.value}`}
                                                checked={filters.membership_type?.includes(
                                                    option.value as any
                                                )}
                                                onCheckedChange={(checked) =>
                                                    handleFilterChange(
                                                        'membership_type',
                                                        option.value,
                                                        checked as boolean
                                                    )
                                                }
                                                disabled={sendToAllCompanies}
                                            />
                                            <Label
                                                htmlFor={`type-${option.value}`}
                                                className="text-sm font-normal flex items-center gap-2 cursor-pointer"
                                            >
                                                {option.label}
                                                <Badge variant="secondary" className="text-xs">
                                                    {option.count}
                                                </Badge>
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                    {/* Sector */}
                    {availableFilters?.sector && availableFilters.sector.length > 0 && (
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Sector</Label>
                            <div className="space-y-2">
                                {availableFilters.sector.map((option) => (
                                    <div key={option.value} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`sector-${option.value}`}
                                            checked={filters.sector?.includes(option.value as any)}
                                            onCheckedChange={(checked) =>
                                                handleFilterChange(
                                                    'sector',
                                                    option.value,
                                                    checked as boolean
                                                )
                                            }
                                            disabled={sendToAllCompanies}
                                        />
                                        <Label
                                            htmlFor={`sector-${option.value}`}
                                            className="text-sm font-normal flex items-center gap-2 cursor-pointer"
                                        >
                                            {option.label}
                                            <Badge variant="secondary" className="text-xs">
                                                {option.count}
                                            </Badge>
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Tamaño */}
                    {availableFilters?.size && availableFilters.size.length > 0 && (
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Tamaño de Empresa</Label>
                            <div className="space-y-2">
                                {availableFilters.size.map((option) => (
                                    <div key={option.value} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`size-${option.value}`}
                                            checked={filters.size?.includes(option.value as any)}
                                            onCheckedChange={(checked) =>
                                                handleFilterChange(
                                                    'size',
                                                    option.value,
                                                    checked as boolean
                                                )
                                            }
                                            disabled={sendToAllCompanies}
                                        />
                                        <Label
                                            htmlFor={`size-${option.value}`}
                                            className="text-sm font-normal flex items-center gap-2 cursor-pointer"
                                        >
                                            {option.label}
                                            <Badge variant="secondary" className="text-xs">
                                                {option.count}
                                            </Badge>
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </CollapsibleContent>
            </Collapsible>

            {/* Resumen de selección */}
            <div className="rounded-lg bg-muted p-4">
                <p className="text-sm font-medium">Destinatarios seleccionados:</p>
                <p className="text-2xl font-bold mt-1">{getSelectedCount()} empresas</p>
            </div>
        </div>
    )
}
