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
        $rules = [
            'postulacion_id' => 'required|exists:postulacion,id',
            'monto' => 'required|numeric|min:0.01',
            'metodo_pago' => 'required|string|in:pasarela',
        ];

        if ($this->user() && $this->user()->tipo === 'admin') {
            $rules['postulante_id'] = 'required|exists:postulante,id';
        }

        return $rules;
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
        ];
    }
}
