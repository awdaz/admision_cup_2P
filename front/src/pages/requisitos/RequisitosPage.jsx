import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import cliente from '../../api/cliente';
import { toast } from 'sonner';
import Loader from '../../components/ui/Loader';

export default function RequisitosPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [requisitos, setRequisitos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await cliente.get(`/postulantes/${id}/requisitos`);
        const list = Array.isArray(data) ? data : data.data || data.requisitos || [];
        setRequisitos(list);
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const toggleRequisito = (index) => {
    setRequisitos((prev) =>
      prev.map((r, i) => (i === index ? { ...r, cumplido: !r.cumplido } : r))
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await cliente.put(`/postulantes/${id}/requisitos`, { requisitos });
      toast.success('Requisitos actualizados correctamente');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="row justify-content-center">
      <div className="col-lg-8">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="mb-0">Gestión de Requisitos</h4>
          <button className="btn btn-outline-secondary" onClick={() => navigate(`/postulantes/${id}`)}>
            <i className="bi bi-arrow-left me-1"></i>Volver
          </button>
        </div>

        <div className="card shadow-sm">
          <div className="card-header">
            <strong>Requisitos del Postulante</strong>
          </div>
          <div className="card-body">
            {requisitos.length === 0 ? (
              <p className="text-muted mb-0">No hay requisitos configurados</p>
            ) : (
              <div className="list-group list-group-flush">
                {requisitos.map((req, idx) => (
                  <div
                    key={idx}
                    className="list-group-item d-flex align-items-center gap-3"
                    style={{ cursor: 'pointer' }}
                    onClick={() => toggleRequisito(idx)}
                  >
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={!!req.cumplido}
                      onChange={() => toggleRequisito(idx)}
                      id={`req-${idx}`}
                    />
                    <label className="form-check-label flex-grow-1" htmlFor={`req-${idx}`}>
                      {req.nombre || req.requisito_nombre || `Requisito ${idx + 1}`}
                    </label>
                    <i className={`bi ${req.cumplido ? 'bi-check-circle-fill text-success' : 'bi-circle text-muted'}`}></i>
                  </div>
                ))}
              </div>
            )}
          </div>
          {requisitos.length > 0 && (
            <div className="card-footer d-flex justify-content-end gap-2">
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>Guardando...
                  </>
                ) : (
                  'Guardar Cambios'
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
