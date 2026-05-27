<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PagoStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'postulacion_id' => 'required|exists:postulacion,id',
            'postulante_id' => 'required|exists:postulante,id',
            'monto' => 'required|numeric|min:0.01',
            'metodo_pago' => 'required|string|in:efectivo,transferencia,tarjeta,qr,pasarela',
        ];
    }

    public function messages(): array
    {
        return [
            'postulacion_id.required' => 'La postulación es obligatoria.',
            'postulacion_id.exists' => 'La postulación no existe.',
            'postulante_id.required' => 'El postulante es obligatorio.',
            'postulante_id.exists' => 'El postulante no existe.',
            'monto.required' => 'El monto es obligatorio.',
            'monto.min' => 'El monto debe ser mayor a cero.',
            'metodo_pago.required' => 'El método de pago es obligatorio.',
            'metodo_pago.in' => 'El método de pago no es válido.',
        ];
    }
}
