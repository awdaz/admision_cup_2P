<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Código de recuperación</title>
</head>
<body style="font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 20px;">
    <div style="max-width: 480px; margin: 0 auto; background: #fff; border-radius: 8px; padding: 32px;">
        <h2 style="color: #0d6efd; margin-top: 0;">Recuperación de Contraseña</h2>
        <p>Hemos recibido una solicitud para restablecer tu contraseña. Usa el siguiente código:</p>
        <div style="text-align: center; padding: 16px; background: #f8f9fa; border-radius: 8px; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #0d6efd; margin: 16px 0;">
            {{ $code }}
        </div>
        <p>Este código expirará en 60 minutos. Si no solicitaste este cambio, puedes ignorar este mensaje.</p>
        <hr style="border: none; border-top: 1px solid #dee2e6; margin: 24px 0;">
        <p style="color: #6c757d; font-size: 12px;">Sistema CUP-FICCT — Universidad Autónoma Gabriel René Moreno</p>
    </div>
</body>
</html>
