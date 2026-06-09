export default function FormCard({ title, children, actions, disabled, className = 'mb-4' }) {
  return (
    <div className={`card shadow-sm ${className}`} style={disabled ? { opacity: 0.6, pointerEvents: 'none' } : undefined}>
      <div className="card-header d-flex justify-content-between align-items-center">
        <strong>{title}</strong>
        {actions && <div>{actions}</div>}
      </div>
      <div className="card-body">
        {children}
      </div>
    </div>
  );
}
