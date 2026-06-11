import { useState, useEffect } from 'react'
import useAuthStore from '../../store/authStore'
import useRindes from '../../hooks/useRindes'
import usePromedios from '../../hooks/usePromedios'
import BadgeStatus from '../../components/ui/BadgeStatus'
import { toast } from 'sonner'
import { APROBACION, str } from '../../constants'

// Caso de Uso: CU16 — Consultar nota
export default function MisNotasPage () {
  const { user } = useAuthStore()
  const { getRindesByPostulacion } = useRindes()
  const { getPromedios } = usePromedios()
  const [notas, setNotas] = useState([])
  const [promedios, setPromedios] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        const data = await getRindesByPostulacion(0)
        if (data?.postulacion) {
          setNotas(data.rindes || [])
          try {
            const prom = await getPromedios(data.postulacion.id)
            if (prom) setPromedios(prom.promedios)
          } catch { /* promedio no disponible */ }
        }
      } catch (err) { toast.error(err.message) } finally { setLoading(false) }
    })()
  }, [getRindesByPostulacion, getPromedios, user])

  if (loading) return <div className='text-center py-5'><div className='spinner-border text-primary' /></div>

  return (
    <div>
      {promedios && (
        <div className='row g-2 mb-4'>
          {[
            { label: 'Matematicas (30%)', key: 'promedio_matematicas' },
            { label: 'Fisica (30%)', key: 'promedio_fisica' },
            { label: 'Computacion (30%)', key: 'promedio_computacion' },
            { label: 'Ingles (10%)', key: 'promedio_ingles' }
          ].map((m) => {
            const val = Number(promedios[m.key])
            return (
              <div className='col-md-3' key={m.key}>
                <div className={'card ' + (val >= 60 ? 'border-success' : 'border-danger')}>
                  <div className='card-body text-center py-2'>
                    <small className='text-muted d-block'>{m.label}</small>
                    <strong className={'fs-5 ' + (val >= 60 ? 'text-success' : 'text-danger')}>{promedios[m.key] ?? '-'}</strong>
                    {val >= 60 ? <BadgeStatus value={str(APROBACION.APROBADO)} /> : <BadgeStatus value={str(APROBACION.REPROBADO)} />}
                  </div>
                </div>
              </div>
            )
          })}
          <div className='col-12'>
            <div className='d-flex align-items-center gap-3 p-2 bg-light rounded'>
              <strong className='fs-5'>Promedio General: {promedios.promedio_general ?? '-'}</strong>
              {promedios.todas_aprobadas
                ? <BadgeStatus value={str(APROBACION.APROBADO)} />
                : <BadgeStatus value={str(APROBACION.REPROBADO)} />}
            </div>
          </div>
        </div>
      )}
      {notas.length === 0
        ? (
          <div className='alert alert-info'>No tienes notas registradas.</div>
          )
        : (
          <div className='table-responsive'>
            <table className='table table-hover table-striped align-middle'>
              <thead className='table-light'>
                <tr><th>Materia</th><th>Examen</th><th>Nota</th><th>Estado</th></tr>
              </thead>
              <tbody>
                {notas.map((r) => (
                  <tr key={r.id}>
                    <td>{r.examen?.grupo?.materia?.nombre || '-'}</td>
                    <td>{r.examen?.nro || '-'}</td>
                    <td><strong>{r.nota ?? '-'}</strong></td>
                    <td>{r.nota >= 60 ? <BadgeStatus value={str(APROBACION.APROBADO)} /> : <BadgeStatus value={str(APROBACION.REPROBADO)} />}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
    </div>
  )
}
