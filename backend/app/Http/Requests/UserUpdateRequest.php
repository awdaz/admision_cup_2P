<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UserUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $userId = $this->route('user');

        return [
            'username' => "required|string|max:50|unique:usuario,username,{$userId}",
            'email' => "required|email|max:200|unique:usuario,email,{$userId}",
            'tipo' => 'required|string|in:admin,postulante,docente',
            'activo' => 'boolean',
        ];
    }

    public function messages(): array
    {
        return [
            'username.unique' => 'El nombre de usuario ya está en uso.',
            'email.unique' => 'El correo electrónico ya está registrado.',
            'tipo.in' => 'El rol debe ser admin, postulante o docente.',
        ];
    }
}
