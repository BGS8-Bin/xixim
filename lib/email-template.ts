/**
 * Utilidades compartidas de template de email
 * Usadas tanto en el servidor (campaign.service.ts) como en el cliente (preview)
 */

const PRIORITY_BADGES: Record<string, string> = {
  urgent: `<tr><td style="background:#ffffff;padding:16px 40px 0;border-left:1px solid #e2e8f0;border-right:1px solid #e2e8f0;">
    <div style="display:inline-block;background:#fee2e2;color:#991b1b;font-size:12px;font-weight:700;padding:6px 16px;border-radius:20px;letter-spacing:0.5px;text-transform:uppercase;">🚨 URGENTE</div>
  </td></tr>`,
  high: `<tr><td style="background:#ffffff;padding:16px 40px 0;border-left:1px solid #e2e8f0;border-right:1px solid #e2e8f0;">
    <div style="display:inline-block;background:#fed7aa;color:#9a3412;font-size:12px;font-weight:700;padding:6px 16px;border-radius:20px;letter-spacing:0.5px;text-transform:uppercase;">⚡ Alta Prioridad</div>
  </td></tr>`,
}

/**
 * Envuelve contenido HTML en el template profesional de XIXIM
 */
export function wrapInEmailTemplate(contentHtml: string, priority?: string): string {
  const priorityBadge = priority ? (PRIORITY_BADGES[priority] || '') : ''

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#f1f5f9;min-height:100vh;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#0B1B42 0%,#0d2260 60%,#0a1a3a 100%);padding:36px 40px;border-radius:12px 12px 0 0;text-align:center;border-bottom:4px solid #00D2FF;">
              <img src="https://uzliavlaicwnehnjvkuv.supabase.co/storage/v1/object/public/announcements/logocluster.png" alt="XIXIM Cluster" style="max-height:120px;height:auto;display:block;margin:0 auto;filter:brightness(0) invert(1);" onerror="this.onerror=null; this.style.display='none'; this.nextElementSibling.style.display='block';" />
              <!-- Fallback Text -->
              <div style="display:none;">
                <p style="margin:0 0 6px;font-size:30px;font-weight:800;color:#ffffff;letter-spacing:-1.5px;line-height:1;">XIXIM</p>
                <p style="margin:0;color:#00D2FF;font-size:11px;letter-spacing:2.5px;text-transform:uppercase;font-weight:700;">Cluster Empresarial</p>
              </div>
            </td>
          </tr>

          ${priorityBadge}

          <!-- Contenido -->
          <tr>
            <td style="background:#ffffff;padding:40px;border-left:1px solid #e2e8f0;border-right:1px solid #e2e8f0;color:#374151;font-size:15px;line-height:1.75;">
              ${contentHtml}
            </td>
          </tr>

          <!-- Separador -->
          <tr>
            <td style="background:#ffffff;padding:0 40px;border-left:1px solid #e2e8f0;border-right:1px solid #e2e8f0;">
              <div style="height:1px;background:#e2e8f0;"></div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;padding:24px 40px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px;text-align:center;">
              <p style="margin:0 0 4px;color:#64748b;font-size:12px;line-height:1.6;">
                Este mensaje fue enviado por <strong>XIXIM Cluster de Innovación y Tecnología Durango</strong>
              </p>
              <p style="margin:0;color:#94a3b8;font-size:11px;">
                Si tienes dudas, contacta a nuestro equipo directamente.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

/**
 * Genera el HTML del contenido de un anuncio (sin el wrapper)
 * Aplica estilos inline para compatibilidad con clientes de email
 */
export function generateAnnouncementContent(params: {
  title: string
  excerpt?: string | null
  content: string
  imageUrl?: string | null
}): string {
  const { title, excerpt, content, imageUrl } = params

  let html = `<h2 style="margin:0 0 20px;font-size:22px;font-weight:700;color:#0f172a;line-height:1.3;">${title}</h2>`

  if (excerpt) {
    html += `<p style="margin:0 0 24px;font-size:15px;color:#0B1B42;line-height:1.6;font-weight:500;padding:14px 18px;background:#F0FBFF;border-left:4px solid #00D2FF;border-radius:0 6px 6px 0;">${excerpt}</p>`
  }

  html += `<div style="color:#374151;font-size:15px;line-height:1.75;">${content}</div>`

  if (imageUrl) {
    html += `<div style="margin-top:24px;"><img src="${imageUrl}" alt="Imagen del anuncio" style="max-width:100%;height:auto;border-radius:8px;display:block;" /></div>`
  }

  return html
}
