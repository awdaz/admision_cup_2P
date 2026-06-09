export default function ProgressBar ({ value, height = 20, showLabel = true, label, className = '', barClassName = '', children, ...props }) {
  const pct = Math.min(Math.max(value || 0), 100)
  const color = pct >= 80 ? 'primary' : pct >= 50 ? 'info' : pct >= 25 ? 'success' : 'warning'
  return (
    <div className={`progress${className ? ' ' + className : ''}`} style={{ height }} {...props}>
      <div className={`progress-bar bg-${color}${barClassName ? ' ' + barClassName : ''}`} style={{ width: `${pct}%` }}>
        {children || (showLabel && (pct > 0 ? (label || `${value}%`) : ''))}
      </div>
    </div>
  )
}
