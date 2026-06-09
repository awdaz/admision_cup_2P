export default function TablaNotas ({ estudiantes, notas, onEditNota, onSeleccionarEstudiante }) {
  if (estudiantes.length === 0) {
    return <div className='alert alert-info'>No hay estudiantes en esta vista. Use el buscador para agregar alumnos.</div>
  }
  return (
    <div className='table-responsive'>
      <table className='table table-hover table-striped align-middle'>
        <thead className='table-light'>
          <tr>
            <th>#</th><th>CI</th><th>Estudiante</th><th>Nota</th>
          </tr>
        </thead>
        <tbody>
          {estudiantes.map((post, i) => {
            const postId = post?.id || i
            return (
              <tr key={postId} role='button' onClick={() => onSeleccionarEstudiante?.(post)} style={{ cursor: 'pointer' }}>
                <td>{i + 1}</td>
                <td>{post?.postulante?.persona?.ci || '-'}</td>
                <td>{post?.postulante?.persona?.nombre || ''} {post?.postulante?.persona?.apellido || ''}</td>
                <td>
                  <div className='d-flex align-items-center gap-2'>
                    {notas[postId] != null
                      ? notas[postId]
                      : post?.promedio_general != null
                        ? <span>{post.promedio_general} <small className='text-muted'>(prom)</small></span>
                        : <span className='text-muted'>—</span>}
                    {notas[postId] != null && (
                      <button
                        className='btn btn-sm btn-outline-primary py-0 px-1'
                        onClick={(e) => { e.stopPropagation(); onEditNota?.(post) }} title='Editar nota'
                      >
                        <i className='bi bi-pencil' />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
