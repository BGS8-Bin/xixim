import { CURRENCY_DEFAULT, DECIMAL_PLACES } from './constants'

/**
 * Formatea un número como moneda usando Intl.NumberFormat
 * 
 * @param amount - Cantidad a formatear
 * @param currency - Código de moneda (ISO 4217). Por defecto MXN
 * @returns String formateado como moneda
 * 
 * @example
 * formatCurrency(5000) // "$5,000.00"
 * formatCurrency(5000, 'USD') // "$5,000.00"
 * formatCurrency(1234.56, 'EUR') // "€1,234.56"
 */
export function formatCurrency(
    amount: number,
    currency: string = CURRENCY_DEFAULT
): string {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency,
        minimumFractionDigits: DECIMAL_PLACES,
        maximumFractionDigits: DECIMAL_PLACES
    }).format(amount)
}

/**
 * Formatea solo el número sin símbolo de moneda
 * 
 * @param amount - Cantidad a formatear
 * @param decimals - Número de decimales. Por defecto usa DECIMAL_PLACES
 * @returns String formateado como número
 * 
 * @example
 * formatAmount(5000) // "5,000.00"
 * formatAmount(5000, 0) // "5,000"
 * formatAmount(1234.5678, 3) // "1,234.568"
 */
export function formatAmount(
    amount: number,
    decimals: number = DECIMAL_PLACES
): string {
    return new Intl.NumberFormat('es-MX', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    }).format(amount)
}

/**
 * Formatea con símbolo de moneda + código ISO
 * Útil cuando se necesita mostrar explícitamente el tipo de moneda
 * 
 * @param amount - Cantidad a formatear
 * @param currency - Código de moneda (ISO 4217). Por defecto MXN
 * @returns String formateado como "símbolo + monto + código"
 * 
 * @example
 * formatCurrencyWithCode(5000, 'MXN') // "$5,000.00 MXN"
 * formatCurrencyWithCode(5000, 'USD') // "$5,000.00 USD"
 */
export function formatCurrencyWithCode(
    amount: number,
    currency: string = CURRENCY_DEFAULT
): string {
    const formatted = formatCurrency(amount, currency)

    // Intl.NumberFormat ya incluye el símbolo pero no siempre el código
    // Agregamos el código explícitamente para claridad
    return `${formatted} ${currency}`
}
