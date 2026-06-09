import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import usePostulantes from '../../hooks/usePostulantes';
import cliente from '../../api/cliente';
import Loader from '../../components/ui/Loader';
import Alert from '../../components/ui/Alert';
import BadgeStatus from '../../components/ui/BadgeStatus';
import FormCard from '../../components/ui/FormCard';

// Página de detalle de un postulante
// Ruta: "/postulantes/:id" — Acceso: Usuarios autenticados
// Muestra información personal, postulación, requisitos y pagos del postulante
export default function PostulanteDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getPostulante, deletePostulante } = usePostulantes();
  // Datos completos del postulante (incluyendo postulacion)
  const [postulante, setPostulante] = useState(null);
  // Lista de requisitos asociados al postulante
  const [requisitos, setRequisitos] = useState([]);
  // Lista de pagos realizados por el postulante
  const [pagos, setPagos] = useState([]);
  // Indica si los datos están cargando
  const [loading, setLoading] = useState(true);
  // Mensaje de error si la carga falla
  const [error, setError] = useState('');

  // Al montar, carga los datos del postulante desde el backend
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

  // Carga la lista de requisitos del postulante
  useEffect(() => {
    (async () => {
      try {
        const reqs = await cliente.get(`/postulantes/${id}/requisitos`);
        setRequisitos(Array.isArray(reqs) ? reqs : reqs.data || reqs.requisitos || []);
      } catch {
        // Si falla, los requisitos simplemente no se muestran
      }
    })();
  }, [id]);

  // Carga los pagos asociados al postulante
  useEffect(() => {
    (async () => {
      try {
        const pags = await cliente.get(`/pagos?postulante_id=${id}`);
        setPagos(Array.isArray(pags) ? pags : pags.data || pags.pagos || []);
      } catch {
        // Si falla, los pagos simplemente no se muestran
      }
    })();
  }, [id]);

  // Confirma y elimina el postulante, luego redirige al listado
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
        <div className="d-flex justify-content-end mb-4">
          {/* Botones de acción: editar, eliminar, gestionar requisitos, postular, registrar pago */}
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
          <FormCard title="Información Personal" className="h-100">
              <table className="table table-hover table-striped align-middle table-sm table-borderless">
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
          </FormCard>
        </div>

        <div className="col-md-6">
          <FormCard title="Postulación" className="h-100">
              {postulante.postulacion ? (
<table className="table table-hover table-striped align-middle table-sm table-borderless">
                  <tbody>
                    <tr><td className="text-muted" style={{ width: '140px' }}>Carrera</td><td>{postulante.postulacion.carrera_nombre || '-'}</td></tr>
                    <tr><td className="text-muted">Turno</td><td>{postulante.postulacion.turno_nombre || '-'}</td></tr>
                    <tr><td className="text-muted">Semestre</td><td>{postulante.postulacion.semestre_nombre || '-'}</td></tr>
                    <tr><td className="text-muted">Estado</td><td><BadgeStatus value={postulante.postulacion.estado} /></td></tr>
                    <tr><td className="text-muted">Fecha</td><td>{postulante.postulacion.fecha || postulante.postulacion.created_at || '-'}</td></tr>
                  </tbody>
                </table>
              ) : (
                <p className="text-muted mb-0">Sin postulación registrada</p>
              )}
          </FormCard>
        </div>

        <div className="col-md-6">
          <FormCard title="Requisitos" className="">
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
          </FormCard>
        </div>

        <div className="col-md-6">
          <FormCard title="Pagos" className="">
              {pagos.length > 0 ? (
                <ul className="list-group list-group-flush">
                  {pagos.map((pago, idx) => (
                    <li key={idx} className="list-group-item d-flex justify-content-between align-items-center">
                      <div>
                        <strong>Bs. {pago.monto}</strong>
                        <small className="d-block text-muted">{pago.metodo_pago} - {pago.fecha || pago.created_at}</small>
                      </div>
                      <BadgeStatus value={pago.estado} colors={{ rechazado: 'warning' }} />
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted mb-0">Sin pagos registrados</p>
              )}
          </FormCard>
        </div>
      </div>
    </div>
  );
}
