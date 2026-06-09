export default function EditarNotaModal ({ show, rinde, value, onChange, onSave, onClose, saving }) {
  if (!show) return null

  return (
    <div className='modal d-block' tabIndex='-1' style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className='modal-dialog modal-sm modal-dialog-centered'>
        <div className='modal-content'>
          <div className='modal-header py-2'>
            <h6 className='modal-title'>Editar Nota</h6>
            <button type='button' className='btn-close py-1' onClick={onClose} aria-label='Cerrar' />
          </div>
          <div className='modal-body py-3'>
            <p className='small mb-2 text-muted'>
              {rinde?.examen?.grupo?.materia?.nombre} — Examen {rinde?.examen?.nro}
              {rinde?.examen?.grupo?.codigo ? ` — ${rinde?.examen?.grupo?.codigo}` : ''}
            </p>
            <input
              type='number' step='0.01' className='form-control'
              value={value} onChange={(e) => onChange(e.target.value)}
              min='0' max='100' autoFocus
            />
          </div>
          <div className='modal-footer py-2'>
            <button className='btn btn-sm btn-secondary' onClick={onClose} disabled={saving}>Cancelar</button>
            <button className='btn btn-sm btn-primary' onClick={onSave} disabled={saving}>
              {saving ? <><span className='spinner-border spinner-border-sm me-1' />Guardando...</> : 'Guardar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
