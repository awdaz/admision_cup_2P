<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class GrupoUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = $this->route('grupo');
        return [
            'codigo' => "required|string|max:20|unique:grupo,codigo,{$id}",
            'nombre' => 'required|string|max:200',
            'cupo' => 'required|integer|min:1|max:70',
            'materia_id' => 'required|integer|exists:materia,id',
            'docente_id' => 'required|integer|exists:docente,id',
            'turno_id' => 'required|integer|exists:turno,id',
        ];
    }
}
