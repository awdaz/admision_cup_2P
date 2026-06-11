import { useState, useEffect, useCallback, useMemo } from 'react'
import { toast } from 'sonner'
import { confirmDialog } from '../../utils/confirmDialog'
import useAdmisiones from '../../hooks/useAdmisiones'
import FilterSelect from '../../components/ui/FilterSelect'
import StatCard from '../../components/ui/StatCard'
import ProgressBar from '../../components/ui/ProgressBar'
import { ESTADOS, str } from '../../constants'

// Casos de Uso: CU11 (Controlar cupos), CU12 (Asignar grupos)
import ExportButtons from '../../components/ui/ExportButtons'

export default function AdmisionListPage () {
  const { getAdmisiones, getCupos, asignarGrupos, procesarAdmision, generarGrupos } = useAdmisiones()
  const [admisiones, setAdmisiones] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [selectedGestion, setSelectedGestion] = useState('')
  const [cupos, setCupos] = useState(null)
  const [asignando, setAsignando] = useState(false)

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

  const exportColumns = [
    { key: 'nombre', label: 'Carrera' },
    { key: 'cupo', label: 'Cupo Total' },
    { key: 'admitidos', label: 'Admitidos' },
    { key: 'vacantes', label: 'Vacantes' },
    { label: 'Ocupación', render: (c) => c.cupo > 0 ? Math.round((c.admitidos / c.cupo) * 100) + '%' : '0%' }
  ]

  return (
    <div>
      <div className='d-flex flex-wrap gap-2 mb-3 align-items-center'>
        <div style={{ flex: '0 1 clamp(140px, 20%, 250px)' }}>
          <FilterSelect value={selectedGestion} onChange={(e) => setSelectedGestion(e.target.value)} options={gestiones} />
        </div>
        {selectedAdmision && (
          <span className={`badge fs-6 bg-${selectedAdmision.estado === str(ESTADOS.ADMISION.ACTIVO) ? 'success' : selectedAdmision.estado === str(ESTADOS.ADMISION.FINALIZADA) ? 'secondary' : 'warning'}`}>
            {selectedAdmision.estado}
          </span>
        )}
        {cupos && <ExportButtons columns={exportColumns} data={cupos?.carreras} title='Cupos-Admision' />}
        {selectedAdmision?.estado === str(ESTADOS.ADMISION.ACTIVO) && (
          <div className='d-flex flex-wrap gap-2 ms-auto'>
            <button
              className='btn btn-outline-primary btn-sm'
              onClick={async () => {
                if (!await confirmDialog('¿Procesar admisión? Esto asignará carreras según promedios y cupos.', 'Procesar')) return
                try {
                  await procesarAdmision(selectedAdmision.id)
                  toast.success('Admisión procesada correctamente')
                  loadCupos(selectedAdmision.id)
                } catch (err) {
                  toast.error(err.message)
                }
              }}
            >
              <i className='bi bi-gear me-1' />Procesar Admisión
            </button>
            <button
              className='btn btn-outline-info btn-sm'
              onClick={async () => {
                if (!await confirmDialog('¿Generar grupos? Se crearán grupos por materia y turno.', 'Generar')) return
                try {
                  await generarGrupos(selectedAdmision.id)
                  toast.success('Grupos generados correctamente')
                } catch (err) {
                  toast.error(err.message)
                }
              }}
            >
              <i className='bi bi-people me-1' />Generar Grupos
            </button>
            <button
              className='btn btn-success btn-sm'
              disabled={asignando}
              onClick={async () => {
                if (!await confirmDialog('¿Asignar postulantes a grupos? Se asignarán los que cumplen requisitos y pagaron.', 'Asignar')) return
                setAsignando(true)
                try {
                  const res = await asignarGrupos(selectedAdmision.id)
                  toast.success(`Asignación completada: ${res?.total ?? 0} asignaciones`)
                } catch (err) {
                  toast.error(err.message)
                } finally {
                  setAsignando(false)
                }
              }}
            >
              {asignando
                ? <><span className='spinner-border spinner-border-sm me-1' role='status' />Asignando...</>
                : <><i className='bi bi-check2-all me-1' />Asignar a Grupos</>}
            </button>
          </div>
        )}
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
