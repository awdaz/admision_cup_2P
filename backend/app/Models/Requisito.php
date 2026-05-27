<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Requisito extends Model
{
    use HasFactory;

    protected $table = 'requisito';

    public $timestamps = false;

    protected $fillable = [
        'nombre',
        'descripcion',
    ];

    public function postulanteRequisitos()
    {
        return $this->hasMany(PostulanteRequisito::class, 'requisito_id');
    }
}
