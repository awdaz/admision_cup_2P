<?php
require __DIR__ . '/../backend/vendor/autoload.php';
$app = require_once __DIR__ . '/../backend/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;

// Find Jorge Salvador
$persona = DB::table('persona')
    ->where('nombre', 'ilike', '%jorge%')
    ->where('apellido', 'ilike', '%salvador%')
    ->first();

if (!$persona) {
    echo "Jorge Salvador not found\n";
    exit;
}

echo "Persona: {$persona->nombre} {$persona->apellido} (ID: {$persona->id})\n";

$postulante = DB::table('postulante')->where('persona_id', $persona->id)->first();
if (!$postulante) {
    echo "No postulante record\n";
    exit;
}

echo "Postulante ID: {$postulante->id}, requisitos_verificado: " . ($postulante->requisitos_verificado ? 'true' : 'false') . "\n";

$postulaciones = DB::table('postulacion')->where('postulante_id', $postulante->id)->get();
echo "Postulaciones: " . count($postulaciones) . "\n";
foreach ($postulaciones as $p) {
    echo "  ID: {$p->id}, estado: {$p->estado}, turno_id: {$p->turno_id}, admision_id: {$p->admision_id}\n";
    
    $pagos = DB::table('pago')->where('postulacion_id', $p->id)->get();
    echo "  Pagos: " . count($pagos) . "\n";
    foreach ($pagos as $pg) {
        echo "    ID: {$pg->id}, estado: {$pg->estado}, metodo: {$pg->metodo_pago}\n";
    }
    
    $grupos = DB::table('postulacion_grupo')->where('postulacion_id', $p->id)->get();
    echo "  Grupos asignados: " . count($grupos) . "\n";
    foreach ($grupos as $g) {
        $gr = DB::table('grupo')->find($g->grupo_id);
        echo "    Grupo ID: {$g->grupo_id}, materia_id: {$g->materia_id}, codigo: " . ($gr->codigo ?? '?') . "\n";
    }
}
