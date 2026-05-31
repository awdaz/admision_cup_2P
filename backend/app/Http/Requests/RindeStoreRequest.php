<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RindeStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'postulacion_id' => 'required|integer|exists:postulacion,id',
            'examen_id' => 'required|integer|exists:examen,id',
            'nota' => 'required|numeric|min:0|max:100',
        ];
    }

    public function messages(): array
    {
        return [
            'nota.max' => 'La nota no puede ser mayor a 100.',
            'nota.min' => 'La nota no puede ser menor a 0.',
        ];
    }
}
