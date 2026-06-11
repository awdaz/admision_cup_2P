import NotasView from '../../components/estudiantes/NotasView'

// Casos de Uso: CU08 (Registrar notas), CU09 (Editar notas)
export default function DocenteEstudiantes () {
  return (
    <NotasView
      grupoSelectWidth={300}
      renderGrupoOption={(g) => `${g.codigo} - ${g.materia?.nombre} (${g.turno?.nombre})`}
    />
  )
}
