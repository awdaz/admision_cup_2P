<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UserStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'username' => 'required|string|max:50|unique:usuario,username',
            'email' => 'required|email|max:200|unique:usuario,email',
            'password' => 'required|string|min:6',
            'tipo' => 'required|string|in:admin,postulante,docente',
            'persona_id' => 'required|integer|exists:persona,id',
            'activo' => 'boolean',
        ];
    }

    public function messages(): array
    {
        return [
            'username.unique' => 'El nombre de usuario ya está en uso.',
            'email.unique' => 'El correo electrónico ya está registrado.',
            'tipo.in' => 'El rol debe ser admin, postulante o docente.',
            'persona_id.exists' => 'La persona seleccionada no existe.',
        ];
    }
}
