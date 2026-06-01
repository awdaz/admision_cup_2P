<?php

return [

    // Rutas a las que se aplicará CORS (API y cookie CSRF de Sanctum)
    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    // Métodos HTTP permitidos ('*' = todos)
    'allowed_methods' => ['*'],

    // Orígenes específicos permitidos (frontend en desarrollo)
    'allowed_origins' => [
        'http://localhost:5173',
        'http://localhost:3000',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:3000',
    ],

    // Patrones de orígenes permitidos (cualquier puerto en localhost/127.0.0.1)
    'allowed_origins_patterns' => ['/^http:\/\/localhost:\d+$/', '/^http:\/\/127\.0\.0\.1:\d+$/'],

    // Encabezados HTTP permitidos en la solicitud ('*' = todos)
    'allowed_headers' => ['*'],

    // Encabezados expuestos al cliente (vacío = ninguno)
    'exposed_headers' => [],

    // Tiempo (segundos) que el navegador puede cachear la respuesta preflight
    'max_age' => 0,

    // Permite el envío de cookies / credenciales en solicitudes entre dominios
    'supports_credentials' => true,
];
