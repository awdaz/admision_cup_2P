// Casos de Uso: CU08 (Registrar notas), CU09 (Editar notas)
export default function TablaNotas ({ estudiantes, notas, onEditNota }) {
  if (estudiantes.length === 0) {
    return <div className='alert alert-info'>No hay estudiantes en esta vista. Use el buscador para agregar alumnos.</div>
  }
  return (
    <div className='table-responsive'>
      <table className='table table-hover table-striped align-middle'>
        <thead className='table-light'>
          <tr>
            <th>#</th><th>CI</th><th>Estudiante</th><th>Nota</th><th />
          </tr>
        </thead>
        <tbody>
          {estudiantes.map((post, i) => {
            const postId = post?.id || i
            const tieneNota = notas[postId] != null
            return (
              <tr key={postId}>
                <td>{i + 1}</td>
                <td>{post?.postulante?.persona?.ci || '-'}</td>
                <td>{post?.postulante?.persona?.nombre || ''} {post?.postulante?.persona?.apellido || ''}</td>
                <td>
                  {tieneNota
                    ? notas[postId]
                    : post?.promedio_general != null
                      ? <span>{post.promedio_general} <small className='text-muted'>(prom)</small></span>
                      : <span className='text-muted'>—</span>}
                </td>
                <td>
                  <button
                    className='btn btn-sm btn-outline-primary py-0 px-1'
                    onClick={() => onEditNota?.(post)} title={tieneNota ? 'Editar nota' : 'Agregar nota'}
                  >
                    <i className={`bi ${tieneNota ? 'bi-pencil' : 'bi-plus-lg'}`} />
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
