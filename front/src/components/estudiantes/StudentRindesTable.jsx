import { Fragment } from 'react'
import BadgeStatus from '../ui/BadgeStatus'

export default function StudentRindesTable ({ studentRindesFiltrados, selectedMateria, rindesPorMateria, promedioFiltrado, handleEditStart, loadingStudent }) {
  if (loadingStudent) {
    return <div className='text-center py-3'><div className='spinner-border spinner-border-sm' /></div>
  }

  return (
    <div className='table-responsive'>
      <table className='table table-hover table-striped align-middle table-sm'>
        <thead className='table-light'>
          <tr><th>Materia</th><th>Grupo</th><th>Examen</th><th>Nota</th><th>Estado</th></tr>
        </thead>
        <tbody>
          {studentRindesFiltrados.length === 0
            ? (
              <tr><td colSpan='5' className='text-muted'>Sin resultados</td></tr>
              )
            : selectedMateria
              ? (
                <>
                  {studentRindesFiltrados.map((r) => (
                    <tr key={r.id}>
                      <td>{r.examen?.grupo?.materia?.nombre || '-'}</td>
                      <td>{r.examen?.grupo?.codigo || '-'}</td>
                      <td>{r.examen?.nro || '-'}</td>
                      <td>
                        <div className='d-flex align-items-center gap-2'>
                          <strong>{r.nota ?? '-'}</strong>
                          <button className='btn btn-sm btn-outline-primary py-0 px-1' onClick={() => handleEditStart(r)} title='Editar nota'>
                            <i className='bi bi-pencil' />
                          </button>
                        </div>
                      </td>
                      <td>{r.nota >= 60 ? <BadgeStatus value='aprobado' /> : <BadgeStatus value='reprobado' />}</td>
                    </tr>
                  ))}
                  {promedioFiltrado != null && (
                    <tr className='table-active fw-bold'>
                      <td colSpan='3'>Promedio</td>
                      <td>{promedioFiltrado.toFixed(2)}</td>
                      <td>{promedioFiltrado >= 60 ? <BadgeStatus value='aprobado' /> : <BadgeStatus value='reprobado' />}</td>
                    </tr>
                  )}
                </>
                )
              : rindesPorMateria?.map((grupo) => (
                <Fragment key={grupo.nombre}>
                  {grupo.rindes.map((r) => (
                    <tr key={r.id}>
                      <td>{r.examen?.grupo?.materia?.nombre || '-'}</td>
                      <td>{r.examen?.grupo?.codigo || '-'}</td>
                      <td>{r.examen?.nro || '-'}</td>
                      <td>
                        <div className='d-flex align-items-center gap-2'>
                          <strong>{r.nota ?? '-'}</strong>
                          <button className='btn btn-sm btn-outline-primary py-0 px-1' onClick={() => handleEditStart(r)} title='Editar nota'>
                            <i className='bi bi-pencil' />
                          </button>
                        </div>
                      </td>
                      <td>{r.nota >= 60 ? <BadgeStatus value='aprobado' /> : <BadgeStatus value='reprobado' />}</td>
                    </tr>
                  ))}
                  <tr className='table-active fw-bold'>
                    <td colSpan='3'>Promedio {grupo?.nombre ?? ''}</td>
                    <td>{grupo?.promedio?.toFixed(2) ?? '-'}</td>
                    <td>{grupo?.promedio >= 60 ? <BadgeStatus value='aprobado' /> : <BadgeStatus value='reprobado' />}</td>
                  </tr>
                </Fragment>
              ))}
        </tbody>
      </table>
    </div>
  )
}
