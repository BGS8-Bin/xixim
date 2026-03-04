import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

/**
 * POST /api/admin/create-user
 * Proxy hacia la Supabase Edge Function "create-user".
 * La Edge Function usa la service_role key inyectada por Supabase
 * — no necesitamos gestionarla aquí.
 */
export async function POST(request: NextRequest) {
    try {
        // Obtener la sesión del admin solicitante para reenviar su JWT
        const serverSupabase = await createClient()
        const { data: { session }, error: sessionError } = await serverSupabase.auth.getSession()

        if (sessionError || !session) {
            return NextResponse.json({ error: "No autenticado" }, { status: 401 })
        }

        const body = await request.json()

        // Llamar a la Edge Function con el JWT del usuario
        const edgeFunctionUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/create-user`

        const response = await fetch(edgeFunctionUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                // La Edge Function verifica JWT — pasamos la sesión del admin
                "Authorization": `Bearer ${session.access_token}`,
                "apikey": process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            },
            body: JSON.stringify(body),
        })

        const result = await response.json()

        return NextResponse.json(result, { status: response.status })
    } catch (err) {
        console.error("[create-user proxy] Error:", err)
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
    }
}
