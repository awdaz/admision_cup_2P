import NotasView from '../../components/estudiantes/NotasView'

export default function AdminEstudiantes () {
  return (
    <NotasView
      grupoSelectWidth={360}
      renderGrupoOption={(g) => `${g.codigo} - ${g.materia?.nombre} (${g.turno?.nombre}) - ${g.docente?.persona?.nombre || ''}`}
    />
  )
}
