export default function StatCard({ title, value, color, icon, variant = 'border', colClass = 'col-md-3', className = '' }) {
  if (variant === 'bg') {
    return (
      <div className={colClass}>
        <div className={`card text-bg-${color}`}>
          <div className="card-body text-center">
            <h5>{value ?? 0}</h5>
            <p className="mb-0">{title}</p>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className={colClass}>
      <div className={`card border-start border-4 border-${color} shadow-sm h-100 ${className}`}>
        <div className="card-body">
          <div className="d-flex align-items-center">
            {icon && <i className={`${icon} fs-2 me-3 text-${color}`}></i>}
            <div>
              <p className="card-text text-muted mb-0">{title}</p>
              <h3 className="card-title mb-0">{value ?? 0}</h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
