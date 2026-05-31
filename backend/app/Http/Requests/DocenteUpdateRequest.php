<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class DocenteUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $docenteId = $this->route('docente');
        $personaId = null;
        if ($docenteId) {
            $docente = \App\Models\Docente::find($docenteId);
            $personaId = $docente?->persona_id;
        }

        return [
            'ci' => "required|string|max:20|unique:persona,ci,{$personaId}",
            'nombre' => 'required|string|max:100',
            'apellido' => 'required|string|max:100',
            'fecha_nac' => 'required|date',
            'sexo' => 'required|string|in:Masculino,Femenino,Otro',
            'email' => "required|email|max:200|unique:persona,email,{$personaId}",
            'telefono' => 'nullable|string|max:20',
            'direccion' => 'nullable|string|max:300',
            'ciudad' => 'nullable|string|max:100',
            'cod_docente' => "required|string|max:50|unique:docente,cod_docente,{$docenteId}",
            'es_profesional_area' => 'boolean',
            'tiene_maestria' => 'boolean',
            'tiene_diplomado_edu_sup' => 'boolean',
            'contratado' => 'boolean',
        ];
    }
}
