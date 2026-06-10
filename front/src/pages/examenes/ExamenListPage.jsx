import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { confirmDialog } from '../../utils/confirmDialog'
import useExamenes from '../../hooks/useExamenes'
import useGrupos from '../../hooks/useGrupos'
import useList from '../../hooks/useList'
import DataTable from '../../components/ui/DataTable'
import HeaderBar from '../../components/ui/HeaderBar'
import FilterSelect from '../../components/ui/FilterSelect'
import Pagination from '../../components/ui/Pagination'

export default function ExamenListPage () {
  const navigate = useNavigate()
  const { getExamenes, deleteExamen, loading: loadingHook } = useExamenes()
  const { getGrupos } = useGrupos()
  const [grupos, setGrupos] = useState([])
  const [filtroGrupo, setFiltroGrupo] = useState('')

  useEffect(() => {
    (async () => {
      const d = await getGrupos(1)
      if (d) setGrupos(d.data || d.grupos || [])
    })()
  }, [getGrupos])

  const { items: examenes, pagination, page, setPage, loading, load } = useList(
    (p, gId) => getExamenes(p, gId),
    [filtroGrupo]
  )

  const totalPages = useMemo(() =>
    Math.ceil((pagination?.total || 1) / (pagination?.per_page || 15)),
  [pagination]
  )

  const handleDelete = async (row) => {
    if (!await confirmDialog(`¿Eliminar examen ${row.nro}?`)) return
    try {
      await deleteExamen(row.id)
      load(page, filtroGrupo)
    } catch {
      /* toast handled by hook */
    }
  }

  const columns = [
    { key: 'nro', label: 'Nro' },
    { key: 'descripcion', label: 'Descripción', render: (row) => row.descripcion || '-' },
    { key: 'fecha', label: 'Fecha', render: (row) => row.fecha ? new Date(row.fecha).toLocaleDateString() : '-' },
    { key: 'materia', label: 'Materia', render: (row) => row.grupo?.materia?.nombre || '-' },
    { key: 'grupo', label: 'Grupo', render: (row) => row.grupo?.codigo || '-' },
    { key: 'porcentaje', label: '%', render: (row) => row.porcentaje ? `${row.porcentaje}%` : '-' }
  ]

  return (
    <div>
      <HeaderBar createLabel='Nuevo Examen' onCreate={() => navigate('/examenes/nuevo')} />

      <div className='d-flex flex-wrap gap-2 mb-3'>
        <div style={{ flex: '0 1 clamp(200px, 30%, 400px)' }}>
          <FilterSelect value={filtroGrupo} onChange={(e) => { setPage(1); setFiltroGrupo(e.target.value) }} options={grupos} mapOption={(g) => `${g.codigo} - ${g.materia?.nombre}`} />
        </div>
      </div>

      <div className='card shadow-sm'>
        <div className='card-body p-0'>
          <DataTable
            columns={columns}
            data={examenes}
            loading={loading || loadingHook}
            onEdit={(row) => navigate(`/examenes/${row.id}/editar`)}
            onDelete={handleDelete}
          />
        </div>
      </div>

      <Pagination page={page} totalPages={totalPages} setPage={setPage} />
    </div>
  )
}
