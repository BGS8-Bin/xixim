import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

// Este endpoint usa el service role key para bypassear RLS
// ya que las solicitudes de admisión vienen de usuarios no autenticados

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )

    const { error } = await supabaseAdmin.from("admission_requests").insert(body)

    if (error) {
      console.error("Error inserting admission request:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (err) {
    console.error("Unexpected error in admissions API:", err)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
