<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PostulacionStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'postulante_id' => 'required|integer|exists:postulante,id',
            'primera_opcion_id' => 'required|integer|exists:carrera,id',
            'segunda_opcion_id' => 'nullable|integer|exists:carrera,id|different:primera_opcion_id',
            'turno_id' => 'required|integer|exists:turno,id',
            'semestre_id' => 'required|integer|exists:semestre,id',
            'admision_id' => 'nullable|integer|exists:admision,id',
        ];
    }

    public function messages(): array
    {
        return [
            'postulante_id.required' => 'El postulante es requerido.',
            'postulante_id.exists' => 'El postulante no existe.',
            'primera_opcion_id.required' => 'La primera opción de carrera es requerida.',
            'primera_opcion_id.exists' => 'La carrera seleccionada no existe.',
            'segunda_opcion_id.different' => 'La segunda opción debe ser diferente a la primera.',
            'turno_id.required' => 'El turno es requerido.',
            'semestre_id.required' => 'El semestre es requerido.',
        ];
    }
}
