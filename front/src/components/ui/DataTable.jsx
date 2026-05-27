export default function DataTable({ columns, data, loading, onEdit, onDelete }) {
  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

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
        <thead className="table-dark">
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
            {(onEdit || onDelete) && <th style={{ width: '120px' }}>Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={row.id || idx}>
              {columns.map((col) => (
                <td key={col.key}>
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
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
