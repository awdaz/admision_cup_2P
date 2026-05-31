import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import usePostulantes from '../../hooks/usePostulantes';
import cliente from '../../api/cliente';
import Loader from '../../components/ui/Loader';
import Alert from '../../components/ui/Alert';

export default function PostulanteDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getPostulante, deletePostulante } = usePostulantes();
  const [postulante, setPostulante] = useState(null);
  const [requisitos, setRequisitos] = useState([]);
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const data = await getPostulante(id);
        setPostulante(data.postulante || data.persona || data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, getPostulante]);

  useEffect(() => {
    (async () => {
      try {
        const reqs = await cliente.get(`/postulantes/${id}/requisitos`);
        setRequisitos(Array.isArray(reqs) ? reqs : reqs.data || reqs.requisitos || []);
      } catch {
        // requisitos may not be available
      }
    })();
  }, [id]);

  useEffect(() => {
    (async () => {
      try {
        const pags = await cliente.get(`/pagos?postulante_id=${id}`);
        setPagos(Array.isArray(pags) ? pags : pags.data || pags.pagos || []);
      } catch {
        // pagos may not be available
      }
    })();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('¿Eliminar postulante?')) return;
    try {
      await deletePostulante(id);
      navigate('/postulantes');
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <Loader />;

  if (error) return <Alert type="danger" message={error} />;

  if (!postulante) return <Alert type="warning" message="Postulante no encontrado" />;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">Detalle del Postulante</h4>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-primary" onClick={() => navigate(`/postulantes/${id}/editar`)}>
            <i className="bi bi-pencil me-1"></i>Editar
          </button>
          <button className="btn btn-outline-danger" onClick={handleDelete}>
            <i className="bi bi-trash me-1"></i>Eliminar
          </button>
          <button className="btn btn-outline-info" onClick={() => navigate(`/postulantes/${id}/requisitos`)}>
            <i className="bi bi-check-square me-1"></i>Gestionar Requisitos
          </button>
          <button className="btn btn-outline-warning" onClick={() => navigate(`/postulaciones/nueva?postulante_id=${id}`)}>
            <i className="bi bi-file-earmark-plus me-1"></i>Postular
          </button>
          <button className="btn btn-outline-success" onClick={() => navigate(`/pagos/nuevo?postulante_id=${id}`)}>
            <i className="bi bi-credit-card me-1"></i>Registrar Pago
          </button>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-md-6">
          <div className="card shadow-sm h-100">
            <div className="card-header"><strong>Información Personal</strong></div>
            <div className="card-body">
              <table className="table table-sm table-borderless mb-0">
                <tbody>
                  <tr><td className="text-muted" style={{ width: '140px' }}>CI</td><td>{postulante.ci}</td></tr>
                  <tr><td className="text-muted">Nombre</td><td>{postulante.nombre} {postulante.apellido}</td></tr>
                  <tr><td className="text-muted">Fecha Nac.</td><td>{postulante.fecha_nac || '-'}</td></tr>
                  <tr><td className="text-muted">Sexo</td><td>{postulante.sexo === 'Masculino' ? 'Masculino' : postulante.sexo === 'Femenino' ? 'Femenino' : postulante.sexo === 'M' ? 'Masculino' : postulante.sexo === 'F' ? 'Femenino' : postulante.sexo || '-'}</td></tr>
                  <tr><td className="text-muted">Email</td><td>{postulante.email}</td></tr>
                  <tr><td className="text-muted">Teléfono</td><td>{postulante.telefono || '-'}</td></tr>
                  <tr><td className="text-muted">Dirección</td><td>{postulante.direccion || '-'}</td></tr>
                  <tr><td className="text-muted">Ciudad</td><td>{postulante.ciudad || '-'}</td></tr>
                  <tr><td className="text-muted">Colegio</td><td>{postulante.colegio_procedencia || '-'}</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card shadow-sm h-100">
            <div className="card-header"><strong>Postulación</strong></div>
            <div className="card-body">
              {postulante.postulacion ? (
                <table className="table table-sm table-borderless mb-0">
                  <tbody>
                    <tr><td className="text-muted" style={{ width: '140px' }}>Carrera</td><td>{postulante.postulacion.carrera_nombre || '-'}</td></tr>
                    <tr><td className="text-muted">Turno</td><td>{postulante.postulacion.turno_nombre || '-'}</td></tr>
                    <tr><td className="text-muted">Semestre</td><td>{postulante.postulacion.semestre_nombre || '-'}</td></tr>
                    <tr><td className="text-muted">Estado</td><td><span className="badge bg-info">{postulante.postulacion.estado || '-'}</span></td></tr>
                    <tr><td className="text-muted">Fecha</td><td>{postulante.postulacion.fecha || postulante.postulacion.created_at || '-'}</td></tr>
                  </tbody>
                </table>
              ) : (
                <p className="text-muted mb-0">Sin postulación registrada</p>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card shadow-sm">
            <div className="card-header"><strong>Requisitos</strong></div>
            <div className="card-body">
              {requisitos.length > 0 ? (
                <ul className="list-group list-group-flush">
                  {requisitos.map((req, idx) => (
                    <li key={idx} className="list-group-item d-flex align-items-center gap-2">
                      <i className={`bi ${req.cumplido ? 'bi-check-circle-fill text-success' : 'bi-circle text-muted'}`}></i>
                      {req.nombre || req.requisito_nombre || `Requisito ${idx + 1}`}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted mb-0">Sin requisitos registrados</p>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card shadow-sm">
            <div className="card-header"><strong>Pagos</strong></div>
            <div className="card-body">
              {pagos.length > 0 ? (
                <ul className="list-group list-group-flush">
                  {pagos.map((pago, idx) => (
                    <li key={idx} className="list-group-item d-flex justify-content-between align-items-center">
                      <div>
                        <strong>Bs. {pago.monto}</strong>
                        <small className="d-block text-muted">{pago.metodo_pago} - {pago.fecha || pago.created_at}</small>
                      </div>
                      <span className={`badge bg-${pago.estado === 'confirmado' ? 'success' : 'warning'}`}>
                        {pago.estado}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted mb-0">Sin pagos registrados</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
