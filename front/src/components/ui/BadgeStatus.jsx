const defaultColors = {
  activo: 'success',
  finalizada: 'secondary',
  admitido: 'success',
  rechazado: 'danger',
  inscrito: 'info',
  pendiente: 'warning',
  confirmado: 'success',
  aprobado: 'success',
  reprobado: 'danger',
};

export default function BadgeStatus({ value, colors = defaultColors, className = '' }) {
  if (!value) return null;
  const bg = colors[value] || 'secondary';
  return <span className={`badge bg-${bg} ${className}`}>{value}</span>;
}
