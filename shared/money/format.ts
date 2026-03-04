/**
 * Formatea un valor monetario con separadores de miles y decimales
 * 
 * @param amount - Cantidad a formatear
 * @param currency - Código de moneda (ej: 'MXN', 'USD')
 * @param options - Opciones de formateo
 * @returns String formateado con símbolo de moneda
 * 
 * @example
 * formatCurrency(5000, 'MXN')
 * // "$5,000.00 MXN"
 * 
 * formatCurrency(1234.5, 'USD', { showCurrency: false })
 * // "$1,234.50"
 * 
 * formatCurrency(999, 'MXN', { decimals: 0 })
 * // "$999 MXN"
 */
export function formatCurrency(
    amount: number,
    currency: string = 'MXN',
    options: {
        /** Mostrar código de moneda al final. Default: true */
        showCurrency?: boolean
        /** Número de decimales. Default: 2 */
        decimals?: number
        /** Locale para formateo. Default: 'es-MX' */
        locale?: string
    } = {}
): string {
    const {
        showCurrency = true,
        decimals = 2,
        locale = 'es-MX'
    } = options

    const formatted = new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    }).format(amount)

    // Si no queremos mostrar el código de moneda al final, removemos
    if (!showCurrency) {
        return formatted
    }

    // Agregar código de moneda al final si no está incluido
    if (!formatted.includes(currency)) {
        return `${formatted} ${currency}`
    }

    return formatted
}

/**
 * Formatea un valor monetario específicamente para MXN (pesos mexicanos)
 * 
 * @param amount - Cantidad a formatear
 * @param options - Opciones de formateo
 * @returns String formateado en pesos mexicanos
 * 
 * @example
 * formatMXN(5000)
 * // "$5,000.00 MXN"
 */
export function formatMXN(
    amount: number,
    options?: Omit<Parameters<typeof formatCurrency>[2], 'locale'>
): string {
    return formatCurrency(amount, 'MXN', options)
}
