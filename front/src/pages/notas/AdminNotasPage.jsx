import NotasView from '../../components/notas/NotasView'

export default function AdminNotasPage () {
  return (
    <NotasView
      grupoSelectWidth={360}
      renderGrupoOption={(g) => `${g.codigo} - ${g.materia?.nombre} (${g.turno?.nombre}) - ${g.docente?.persona?.nombre || ''}`}
    />
  )
}
