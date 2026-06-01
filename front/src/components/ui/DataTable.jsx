// Componente de tabla reutilizable con soporte para carga, columnas personalizadas y acciones
export default function DataTable({ columns, data, loading, onEdit, onDelete }) {
  // Muestra spinner mientras se cargan los datos
  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  // Muestra mensaje cuando no hay registros
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-5">
        <p className="text-muted mb-0">No hay registros</p>
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="table table-striped table-hover align-middle mb-0">
        {/* Cabecera generada a partir del array de columnas */}
        <thead className="table-dark">
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
            {/* Columna de acciones visible si hay callbacks onEdit u onDelete */}
            {(onEdit || onDelete) && <th style={{ width: '120px' }}>Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={row.id || idx}>
              {/* Renderiza cada celda: usa col.render si existe, si no muestra row[col.key] */}
              {columns.map((col) => (
                <td key={col.key}>
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
              {/* Botones de editar y/o eliminar por fila */}
              {(onEdit || onDelete) && (
                <td>
                  <div className="btn-group btn-group-sm">
                    {onEdit && (
                      <button className="btn btn-outline-primary" onClick={() => onEdit(row)} title="Editar">
                        <i className="bi bi-pencil"></i>
                      </button>
                    )}
                    {onDelete && (
                      <button className="btn btn-outline-danger" onClick={() => onDelete(row)} title="Eliminar">
                        <i className="bi bi-trash"></i>
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
