import { useState, useEffect, useCallback, useMemo } from 'react'
import { toast } from 'sonner'
import useAdmisiones from '../../hooks/useAdmisiones'
import FilterSelect from '../../components/ui/FilterSelect'
import StatCard from '../../components/ui/StatCard'
import ProgressBar from '../../components/ui/ProgressBar'

export default function AdmisionListPage () {
  const { getAdmisiones, getCupos } = useAdmisiones()
  const [admisiones, setAdmisiones] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [selectedGestion, setSelectedGestion] = useState('')
  const [cupos, setCupos] = useState(null)

  const loadAdmisiones = useCallback(async () => {
    try {
      const data = await getAdmisiones()
      const list = Array.isArray(data) ? data : (data?.data || [])
      setAdmisiones(list)
      const currentYear = String(new Date().getFullYear())
      if (list.some(a => String(a.gestion) === currentYear)) {
        setSelectedGestion(currentYear)
      } else if (list.length > 0) {
        setSelectedGestion(String(list?.[0]?.gestion ?? ''))
      }
    } catch (err) {
      toast.error(err.message)
    }
  }, [getAdmisiones])

  useEffect(() => {
    loadAdmisiones()
  }, [loadAdmisiones])

  const gestiones = useMemo(() => {
    const set = new Set(admisiones.map(a => a.gestion))
    return [...set].sort((a, b) => b - a)
  }, [admisiones])

  const admisionesFiltradas = useMemo(() => {
    if (!selectedGestion) return admisiones
    return admisiones.filter(a => String(a.gestion) === selectedGestion)
  }, [admisiones, selectedGestion])

  const loadCupos = useCallback(async (id) => {
    try {
      const data = await getCupos(id)
      if (data) setCupos(data)
    } catch (err) {
      toast.error(err.message)
    }
  }, [getCupos])

  useEffect(() => {
    if (admisionesFiltradas.length > 0) {
      const currentId = Number(selectedId)
      const stillExists = admisionesFiltradas.some(a => a.id === currentId)
      if (!stillExists) setSelectedId(admisionesFiltradas?.[0]?.id)
    } else {
      setSelectedId(null)
    }
  }, [admisionesFiltradas, selectedId])

  useEffect(() => {
    if (selectedId) {
      loadCupos(selectedId)
    }
  }, [selectedId, loadCupos])

  const selectedAdmision = admisiones.find(a => a.id === Number(selectedId))

  const r = cupos?.resumen || {}

  return (
    <div>
      <div className='row g-3 mb-4'>
        <div className='col-md-4'>
          <FilterSelect value={selectedGestion} onChange={(e) => setSelectedGestion(e.target.value)} options={gestiones} />
        </div>
        <div className='col-md d-flex align-items-center'>
          {selectedAdmision && (
            <span className={`badge fs-6 bg-${selectedAdmision.estado === 'activo' ? 'success' : selectedAdmision.estado === 'finalizada' ? 'secondary' : 'warning'}`}>
              {selectedAdmision.estado}
            </span>
          )}
        </div>
      </div>

      {cupos && (
        <>
          <div className='row g-3 mb-4'>
            <StatCard title='Admitidos' value={r.total_admitidos} color='success' variant='bg' />
            <StatCard title='Rechazados' value={r.total_rechazados} color='danger' variant='bg' />
            <StatCard title='Inscritos' value={r.total_inscritos} color='primary' variant='bg' />
            <StatCard title='Pendientes' value={r.total_pendientes} color='warning' variant='bg' />
          </div>

          <div className='table-responsive'>
            <table className='table table-hover table-striped align-middle'>
              <thead className='table-light'>
                <tr>
                  <th>Carrera</th>
                  <th>Cupo Total</th>
                  <th>Admitidos</th>
                  <th>Vacantes</th>
                  <th>Ocupación</th>
                </tr>
              </thead>
              <tbody>
                {(cupos?.carreras || []).map((c) => {
                  const pct = c.cupo > 0 ? Math.round((c.admitidos / c.cupo) * 100) : 0
                  return (
                    <tr key={c.id}>
                      <td>{c.nombre}</td>
                      <td>{c.cupo}</td>
                      <td>{c.admitidos}</td>
                      <td>{c.vacantes}</td>
                      <td>
                        <ProgressBar value={pct} height={20} />
                      </td>
                    </tr>
                  )
                })}
                {(!cupos?.carreras || cupos.carreras.length === 0) && (
                  <tr><td colSpan='5' className='text-center text-muted'>No hay datos</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
