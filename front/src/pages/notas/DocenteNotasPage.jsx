import NotasView from '../../components/notas/NotasView'

export default function DocenteNotasPage () {
  return (
    <NotasView
      grupoSelectWidth={300}
      renderGrupoOption={(g) => `${g.codigo} - ${g.materia?.nombre} (${g.turno?.nombre})`}
    />
  )
}
