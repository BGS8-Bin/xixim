import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { NotificationService } from '@/features/notifications/services/notification.service'

/**
 * POST /api/announcements/[id]/test
 * Envía un email de prueba del anuncio al usuario actual
 */
export async function POST(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const params = await props.params;
        const supabase = await createClient()

        // Verificar autenticación
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
        }

        // Obtener perfil del usuario
        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

        if (!profile || !['admin', 'editor'].includes(profile.role)) {
            return NextResponse.json(
                { error: 'No tienes permisos para realizar esta acción' },
                { status: 403 }
            )
        }

        const announcementId = params.id
        const body = await request.json()
        const { testEmail } = body

        // Verificar que el anuncio existe
        const { data: announcement, error: announcementError } = await supabase
            .from('announcements')
            .select('*')
            .eq('id', announcementId)
            .single()

        if (announcementError || !announcement) {
            return NextResponse.json({ error: 'Anuncio no encontrado' }, { status: 404 })
        }

        const recipientEmail = testEmail || user.email || profile.email

        if (!recipientEmail) {
            return NextResponse.json(
                { error: 'No se pudo determinar el email de destino' },
                { status: 400 }
            )
        }

        // Generar HTML del email (similar al CampaignService)
        const emailHtml = generateTestEmailHTML(announcement, profile)

        // Enviar email de prueba
        const result = await NotificationService.sendCustomNotification({
            to: recipientEmail,
            subject: `[PRUEBA] ${announcement.title} - XIXIM Cluster`,
            html: emailHtml,
        })

        if (result.email?.success) {
            return NextResponse.json({
                success: true,
                message: `Email de prueba enviado exitosamente a ${recipientEmail}`,
                messageId: result.email.messageId,
            })
        } else {
            return NextResponse.json(
                {
                    error: 'Error enviando email de prueba',
                    details: result.email?.error,
                },
                { status: 500 }
            )
        }
    } catch (error) {
        console.error('Error en /api/announcements/[id]/test:', error)
        return NextResponse.json(
            {
                error: 'Error enviando email de prueba',
                details: error instanceof Error ? error.message : 'Error desconocido',
            },
            { status: 500 }
        )
    }
}

function generateTestEmailHTML(announcement: any, profile: any): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .test-banner {
            background-color: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            margin-bottom: 20px;
            border-radius: 4px;
        }
        .header {
            background-color: #4F46E5;
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 8px 8px 0 0;
        }
        .content {
            background-color: #ffffff;
            padding: 30px;
            border: 1px solid #e5e7eb;
            border-top: none;
        }
        .footer {
            background-color: #f9fafb;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #6b7280;
            border-radius: 0 0 8px 8px;
        }
        .badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
            margin-bottom: 10px;
        }
        .badge-urgent { background-color: #fee2e2; color: #991b1b; }
        .badge-high { background-color: #fed7aa; color: #9a3412; }
        .badge-normal { background-color: #dbeafe; color: #1e40af; }
        .badge-low { background-color: #f3f4f6; color: #374151; }
    </style>
</head>
<body>
    <div class="test-banner">
        <strong>⚠️ Este es un email de prueba</strong>
        <p style="margin: 5px 0 0 0; font-size: 14px;">Enviado a: ${profile.first_name} ${profile.last_name} (${profile.email})</p>
    </div>

    <div class="header">
        <h1>XIXIM Cluster</h1>
        <p>Cluster de Empresas de Base Tecnológica</p>
    </div>
    <div class="content">
        ${announcement.priority === 'urgent' ? '<span class="badge badge-urgent">URGENTE</span>' : ''}
        ${announcement.priority === 'high' ? '<span class="badge badge-high">ALTA PRIORIDAD</span>' : ''}
        <h2>${announcement.title}</h2>
        ${announcement.excerpt ? `<p><strong>${announcement.excerpt}</strong></p>` : ''}
        <div>
            ${announcement.content}
        </div>
        ${announcement.image_url ? `<p><img src="${announcement.image_url}" alt="Imagen" style="max-width: 100%; height: auto; margin-top: 20px;" /></p>` : ''}
    </div>
    <div class="footer">
        <p>Este mensaje fue enviado por XIXIM Cluster</p>
        <p>Si tienes dudas, contacta a nuestro equipo</p>
    </div>
</body>
</html>
    `.trim()
}
