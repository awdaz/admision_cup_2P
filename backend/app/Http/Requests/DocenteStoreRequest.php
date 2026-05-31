<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class DocenteStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'ci' => 'required|string|max:20|unique:persona,ci',
            'nombre' => 'required|string|max:100',
            'apellido' => 'required|string|max:100',
            'fecha_nac' => 'required|date',
            'sexo' => 'required|string|in:Masculino,Femenino,Otro',
            'email' => 'required|email|max:200|unique:persona,email',
            'telefono' => 'nullable|string|max:20',
            'direccion' => 'nullable|string|max:300',
            'ciudad' => 'nullable|string|max:100',
            'cod_docente' => 'required|string|max:50|unique:docente,cod_docente',
            'es_profesional_area' => 'boolean',
            'tiene_maestria' => 'boolean',
            'tiene_diplomado_edu_sup' => 'boolean',
        ];
    }
}
