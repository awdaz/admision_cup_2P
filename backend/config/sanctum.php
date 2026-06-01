<?php

use Illuminate\Cookie\Middleware\EncryptCookies;
use Illuminate\Foundation\Http\Middleware\ValidateCsrfToken;
use Laravel\Sanctum\Http\Middleware\AuthenticateSession;
use Laravel\Sanctum\Sanctum;

return [

    // ================================================================
    // Dominios con estado (stateful)
    // ================================================================
    // Las solicitudes provenientes de estos dominios/hosts recibirán
    // cookies de autenticación de API (SPA). Incluye entornos locales
    // y de producción.
    // ================================================================

    'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', sprintf(
        '%s%s',
        'localhost,localhost:3000,127.0.0.1,127.0.0.1:8000,::1',
        Sanctum::currentApplicationUrlWithPort(),
        // Sanctum::currentRequestHost(),
    ))),

    // ================================================================
    // Guards de autenticación
    // ================================================================
    // Guards que Sanctum verificará al autenticar una solicitud.
    // Si ninguno puede autenticar, se usará el token Bearer.
    // ================================================================

    'guard' => ['web'],

    // ================================================================
    // Minutos de expiración de tokens
    // ================================================================
    // Tiempo en minutos hasta que un token emitido se considera
    // expirado. Anula el valor del atributo "expires_at" del token.
    // null = los tokens no expiran.
    // ================================================================

    'expiration' => null,

    // ================================================================
    // Prefijo de tokens
    // ================================================================
    // Permite prefijar tokens para aprovechar escáneres de seguridad
    // en plataformas como GitHub que detectan tokens en repositorios.
    // ================================================================

    'token_prefix' => env('SANCTUM_TOKEN_PREFIX', ''),

    // ================================================================
    // Middleware de Sanctum
    // ================================================================
    // Personalización del middleware que Sanctum utiliza al procesar
    // solicitudes de SPA (primera parte).
    // ================================================================

    'middleware' => [
        'authenticate_session' => AuthenticateSession::class,
        'encrypt_cookies' => EncryptCookies::class,
        'validate_csrf_token' => ValidateCsrfToken::class,
    ],

];
