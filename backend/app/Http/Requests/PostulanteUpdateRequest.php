<?php

namespace App\Http\Requests;

use App\Models\Postulante;
use Illuminate\Foundation\Http\FormRequest;

class PostulanteUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $postulanteId = $this->route('postulante');
        $postulante = Postulante::find($postulanteId);
        $personaId = $postulante?->persona_id;

        return [
            'ci' => 'required|string|max:20|unique:persona,ci,' . $personaId,
            'nombre' => 'required|string|max:100',
            'apellido' => 'required|string|max:100',
            'fecha_nac' => 'required|date',
            'sexo' => 'nullable|string|in:Masculino,Femenino,Otro',
            'email' => 'required|email|max:200|unique:persona,email,' . $personaId,
            'telefono' => 'nullable|string|max:20',
            'direccion' => 'nullable|string|max:300',
            'ciudad' => 'nullable|string|max:100',
            'colegio_procedencia' => 'nullable|string|max:200',
        ];
    }

    public function messages(): array
    {
        return [
            'ci.required' => 'El CI es obligatorio.',
            'ci.unique' => 'Este CI ya está registrado.',
            'nombre.required' => 'El nombre es obligatorio.',
            'apellido.required' => 'El apellido es obligatorio.',
            'fecha_nac.required' => 'La fecha de nacimiento es obligatoria.',
            'email.required' => 'El email es obligatorio.',
            'email.unique' => 'Este email ya está registrado.',
        ];
    }
}
