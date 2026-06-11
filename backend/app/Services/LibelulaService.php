<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class LibelulaService
{
    protected string $appkey;
    protected string $baseUrl;
    protected string $callbackUrl;
    protected string $moneda;

    public function __construct()
    {
        $this->appkey = config('libelula.appkey');
        $this->baseUrl = config('libelula.url');
        $this->callbackUrl = config('libelula.callback_url');
        $this->moneda = config('libelula.moneda');
    }

    public function registrarDeuda(
        string $identificadorDeuda,
        string $monto,
        string $emailCliente,
        string $nombreCliente,
        string $apellidoCliente,
        string $ci,
        string $descripcion,
        ?string $fechaVencimiento = null,
    ): array {
        $payload = [
            'appkey' => $this->appkey,
            'identificador_deuda' => $identificadorDeuda,
            'monto' => $monto,
            'moneda' => $this->moneda,
            'email_cliente' => $emailCliente,
            'nombre_cliente' => $nombreCliente,
            'apellido_cliente' => $apellidoCliente,
            'ci' => $ci,
            'descripcion' => $descripcion,
            'callback_url' => $this->callbackUrl,
            'emite_factura' => false,
        ];

        if ($fechaVencimiento) {
            $payload['fecha_vencimiento'] = $fechaVencimiento;
        }

        $response = Http::post("{$this->baseUrl}/rest/deuda/registrar", $payload);

        if ($response->failed()) {
            Log::error('Libelula::registrarDeuda failed', [
                'status' => $response->status(),
                'body' => $response->body(),
                'identificador' => $identificadorDeuda,
            ]);
            throw new \Exception('Error al registrar la deuda en Libelula: ' . $response->body());
        }

        return $response->json();
    }

    public function consultarDeuda(string $identificadorDeuda): array
    {
        $response = Http::get("{$this->baseUrl}/rest/deuda/consultar", [
            'appkey' => $this->appkey,
            'identificador_deuda' => $identificadorDeuda,
        ]);

        if ($response->failed()) {
            Log::error('Libelula::consultarDeuda failed', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
            throw new \Exception('Error al consultar la deuda en Libelula');
        }

        return $response->json();
    }

    public function anularDeuda(string $identificadorDeuda): array
    {
        $response = Http::post("{$this->baseUrl}/rest/deuda/anular", [
            'appkey' => $this->appkey,
            'identificador_deuda' => $identificadorDeuda,
        ]);

        if ($response->failed()) {
            Log::error('Libelula::anularDeuda failed', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
            throw new \Exception('Error al anular la deuda en Libelula');
        }

        return $response->json();
    }
}
