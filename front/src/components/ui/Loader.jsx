export default function Loader({ text = 'Cargando...' }) {
  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
      <div className="text-center">
        <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">{text}</span>
        </div>
        <p className="text-muted">{text}</p>
      </div>
    </div>
  );
}
