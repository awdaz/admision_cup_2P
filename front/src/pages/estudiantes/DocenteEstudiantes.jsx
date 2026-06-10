import NotasView from '../../components/estudiantes/NotasView'

export default function DocenteEstudiantes () {
  return (
    <NotasView
      grupoSelectWidth={300}
      renderGrupoOption={(g) => `${g.codigo} - ${g.materia?.nombre} (${g.turno?.nombre})`}
    />
  )
}
