<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ExamenStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nro' => 'required|string|max:20',
            'descripcion' => 'nullable|string|max:500',
            'fecha' => 'required|date',
            'grupo_id' => 'required|integer|exists:grupo,id',
            'porcentaje' => 'required|numeric|min:0|max:100',
        ];
    }
}
