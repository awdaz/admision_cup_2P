export default function EmptyState ({ message = 'No hay datos', icon, alertClass = 'alert alert-info' }) {
  return (
    <div className={alertClass}>
      {icon && <i className={`${icon} me-2`} />}
      {message}
    </div>
  )
}
