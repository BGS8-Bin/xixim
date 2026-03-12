import { NotificationService } from '../features/notifications/services/notification.service';
import { loadEnvConfig } from '@next/env';

// Cargar variables de entorno desde .env.local
const projectDir = process.cwd();
loadEnvConfig(projectDir);

async function testSendGrid() {
    console.log('Testing SendGrid setup...');
    console.log(`API Key set: ${!!process.env.SENDGRID_API_KEY}`);
    console.log(`From Email: ${process.env.SENDGRID_FROM_EMAIL}`);
    console.log(`From Name: ${process.env.SENDGRID_FROM_NAME}`);

    // Reemplaza 'direccion@clustexixim.com' con tu email si quieres asegurar la entrega probando
    const testRecipient = 'direccion@clustexixim.com';

    try {
        const result = await NotificationService.sendCustomNotification({
            to: testRecipient,
            subject: 'Prueba de Integración - XIXIM SendGrid',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <h2>¡Configuración Exitosa! 🎉</h2>
                    <p>Hola,</p>
                    <p>Si estás recibiendo este correo, significa que la integración de <strong>SendGrid</strong> en tu proyecto <strong>XIXIM</strong> está funcionando correctamente.</p>
                    <p>Ya puedes comenzar a usar los envíos masivos y notificaciones.</p>
                    <hr />
                    <small>Este es un correo automático generado para pruebas del sistema.</small>
                </div>
            `,
            text: 'Si estás recibiendo este correo, tu configuración de SendGrid funciona.',
        });

        if (result.email?.success) {
            console.log('✅ Correo enviado con éxito!');
            console.log(`Message ID: ${result.email.messageId}`);
        } else {
            console.error('❌ Falló el envío del correo:');
            console.error(result.email?.error);
        }
    } catch (error) {
        console.error('Error inesperado durante la prueba:', error);
    }
}

testSendGrid();
