import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { confirmDialog } from '../../utils/confirmDialog'
import useHorarios from '../../hooks/useHorarios'
import useGrupos from '../../hooks/useGrupos'
import useCatalogos from '../../hooks/useCatalogos'
import HeaderBar from '../../components/ui/HeaderBar'
import FilterSelect from '../../components/ui/FilterSelect'
import { DIAS_SEMANA, str } from '../../constants'

const DIAS = DIAS_SEMANA.map(str)

export default function HorarioListPage () {
  const navigate = useNavigate()
  const { getHorarios, deleteHorario, loading } = useHorarios()
  const { getGrupos } = useGrupos()
  const { getMaterias } = useCatalogos()
  const [horarios, setHorarios] = useState([])
  const [grupos, setGrupos] = useState([])
  const [materias, setMaterias] = useState([])
  const [filtroMateria, setFiltroMateria] = useState('')
  const [filtroGrupo, setFiltroGrupo] = useState('')
  const [filtroDia, setFiltroDia] = useState('')

  useEffect(() => {
    (async () => {
      const d = await getGrupos(1, { per_page: 500 })
      if (d) setGrupos(d.data || d.grupos || [])
    })()
  }, [getGrupos])

  useEffect(() => {
    (async () => {
      const d = await getMaterias()
      if (d) setMaterias(Array.isArray(d) ? d : [])
    })()
  }, [getMaterias])

  const load = useCallback(async () => {
    try {
      const params = {}
      if (filtroGrupo) params.grupo_id = filtroGrupo
      if (filtroDia) params.dia = filtroDia
      if (filtroMateria) params.materia_id = filtroMateria
      const data = await getHorarios(params)
      if (data) {
        setHorarios(Array.isArray(data) ? data : data.data || data.horarios || [])
      }
    } catch (err) {
      toast.error(err.message)
    }
  }, [getHorarios, filtroGrupo, filtroDia, filtroMateria])

  // Recarga al cambiar filtros
  useEffect(() => {
    load()
  }, [load])

  // Elimina un horario previa confirmación y recarga la lista
  const handleDelete = async (row) => {
    if (!await confirmDialog(`¿Eliminar horario de ${row.dia} ${row.hora_inicio}-${row.hora_fin}?`)) return
    try {
      await deleteHorario(row.id)
      load()
    } catch (err) {
      toast.error(err.message)
    }
  }

  return (
    <div>
      <HeaderBar createLabel='Nuevo Horario' onCreate={() => navigate('/horarios/nuevo')} />

      {/* Filtros: materia, grupo y día */}
      <div className='d-flex flex-wrap gap-2 mb-3'>
        <div style={{ flex: '0 1 clamp(140px, 20%, 250px)' }}>
          <FilterSelect value={filtroMateria} onChange={(e) => { setFiltroMateria(e.target.value); setFiltroGrupo('') }} options={materias} mapOption={(m) => m.nombre} />
        </div>
        <div style={{ flex: '0 1 clamp(200px, 25%, 350px)' }}>
          <FilterSelect value={filtroGrupo} onChange={(e) => setFiltroGrupo(e.target.value)} options={grupos} mapOption={(g) => `${g.codigo} - ${g.materia?.nombre}`} />
        </div>
        <div style={{ flex: '0 1 clamp(120px, 15%, 200px)' }}>
          <FilterSelect value={filtroDia} onChange={(e) => setFiltroDia(e.target.value)} options={DIAS} mapOption={(d) => d} />
        </div>
        <button className='btn btn-outline-secondary' onClick={load}><i className='bi bi-funnel' /> Filtrar</button>
      </div>

      {/* Tabla de horarios con indicador de carga y estado vacío */}
      {loading
        ? (
          <div className='text-center py-5'>
            <div className='spinner-border text-primary' />
          </div>
          )
        : horarios.length === 0
          ? (
            <div className='alert alert-info'>No hay horarios registrados.</div>
            )
          : (
            <div className='table-responsive'>
              <table className='table table-hover table-striped align-middle'>
                <thead className='table-light'>
                  <tr>
                    <th>Día</th>
                    <th>Inicio</th>
                    <th>Fin</th>
                    <th>Grupo</th>
                    <th>Materia</th>
                    <th>Aula</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {horarios.map((h) => (
                    <tr key={h.id}>
                      <td>{h.dia}</td>
                      <td>{h.hora_inicio}</td>
                      <td>{h.hora_fin}</td>
                      <td>{h.grupo?.codigo || '-'}</td>
                      <td>{h.grupo?.materia?.nombre || '-'}</td>
                      <td>{h.aula?.nombre || '-'}</td>
                      <td>
                        {/* Botones de acción: editar y eliminar */}
                        <button className='btn btn-sm btn-outline-primary me-1' onClick={() => navigate(`/horarios/${h.id}/editar`)}>
                          <i className='bi bi-pencil' />
                        </button>
                        <button className='btn btn-sm btn-outline-danger' onClick={() => handleDelete(h)}>
                          <i className='bi bi-trash' />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            )}
    </div>
  )
}
