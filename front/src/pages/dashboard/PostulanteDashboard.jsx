import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import useReportes from '../../hooks/useReportes'
import BadgeStatus from '../../components/ui/BadgeStatus'

export default function PostulanteDashboard () {
  const { getReportePostulanteMisNotas, loading } = useReportes()
  const [data, setData] = useState(null)

  useEffect(() => {
    (async () => {
      try {
        const d = await getReportePostulanteMisNotas()
        if (d) setData(d)
      } catch (err) { toast.error(err.message) }
    })()
  }, [getReportePostulanteMisNotas])

  if (loading && !data) return <div className='text-center py-5'><div className='spinner-border text-primary' /></div>

  const postulaciones = data?.postulaciones || []

  return (
    <div>
      {postulaciones.length === 0
        ? (
          <div className='alert alert-info'>No tienes postulaciones registradas.</div>
          )
        : (
            postulaciones.map((post) => {
              const promValue = post.promedio_general
              return (
                <div key={post.id} className='mb-4 p-3 border rounded'>
                  <div className='d-flex justify-content-between align-items-center mb-3'>
                    <strong>Postulacion #{post.id}</strong>
                    <BadgeStatus value={post.estado} />
                  </div>
                  <div className='row mb-3'>
                    <div className='col-md-4'><strong>1ra Opcion:</strong> {post.primeraOpcion?.nombre || '-'}</div>
                    <div className='col-md-4'><strong>2da Opcion:</strong> {post.segundaOpcion?.nombre || '-'}</div>
                    <div className='col-md-4'><strong>Asignada:</strong> {post.carreraAsignada?.nombre || '-'}</div>
                    <div className='col-md-4'><strong>Turno:</strong> {post.turno?.nombre || '-'}</div>
                    <div className='col-md-4'><strong>Semestre:</strong> {post.semestre?.nombre || '-'}</div>
                    <div className='col-md-4'><strong>Promedio General:</strong> {promValue ?? '-'}</div>
                  </div>

                  {post.rindes && post.rindes.length > 0 && (
                    <>
                      <h6 className='text-muted'>Notas</h6>
                      <table className='table table-hover table-striped align-middle table-sm'>
                        <thead className='table-light'>
                          <tr>
                            <th>Materia</th>
                            <th>Examen</th>
                            <th>Nota</th>
                            <th>Resultado</th>
                          </tr>
                        </thead>
                        <tbody>
                          {post.rindes.map((r) => (
                            <tr key={r.id} className={r.nota >= 60 ? 'table-success' : 'table-danger'}>
                              <td>{r.examen?.grupo?.materia?.nombre || '-'}</td>
                              <td>{r.examen?.nro || '-'}</td>
                              <td><strong>{r.nota ?? '-'}</strong></td>
                              <td>{r.nota >= 60 ? <BadgeStatus value='Aprobado' colors={{ Aprobado: 'success' }} /> : <BadgeStatus value='Reprobado' colors={{ Reprobado: 'danger' }} />}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </>
                  )}

                  {post.pagos && post.pagos.length > 0 && (
                    <div className='mt-2'>
                      <h6 className='text-muted'>Pagos</h6>
                      {post.pagos.map((p) => (
                        <span key={p.id} className={'badge me-1 ' + (p.estado === 'confirmado' ? 'bg-success' : 'bg-warning')}>
                          ${p.monto} - {p.estado}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )
            })
          )}
    </div>
  )
}
