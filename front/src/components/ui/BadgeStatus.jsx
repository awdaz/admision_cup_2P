const defaultColors = {
  activo: 'success',
  finalizada: 'secondary',
  admitido: 'success',
  rechazado: 'danger',
  inscrito: 'info',
  pendiente: 'warning',
  confirmado: 'success',
  aprobado: 'success',
  reprobado: 'danger'
}

export default function BadgeStatus ({ value, colors = defaultColors, className = '' }) {
  if (!value) return null
  const key = value?.description ?? value
  const bg = colors[key] ?? 'secondary'
  return <span className={`badge bg-${bg} ${className}`}>{key}</span>
}
