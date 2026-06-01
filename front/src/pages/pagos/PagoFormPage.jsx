import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import usePagos from '../../hooks/usePagos';
import usePostulantes from '../../hooks/usePostulantes';
import Loader from '../../components/ui/Loader';

// Página de formulario para registrar un nuevo pago
// Ruta: /pagos/nuevo (con ?postulante_id opcional)
// Acceso: Administradores y personal de cobros
export default function PagoFormPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedId = searchParams.get('postulante_id'); // ID de postulante preseleccionado vía query param

  const { createPago, loading: pagoLoading } = usePagos();
  const { getPostulantes, buscarPostulante } = usePostulantes();
  const [postulantes, setPostulantes] = useState([]);         // Lista completa de postulantes
  const [selectedPostulante, setSelectedPostulante] = useState(null); // Postulante seleccionado actualmente
  const [searchCi, setSearchCi] = useState('');               // Texto ingresado para búsqueda por CI
  // Datos del formulario de pago
  const [form, setForm] = useState({
    postulante_id: preselectedId || '',
    monto: '',
    metodo_pago: 'efectivo',
  });
  const [submitting, setSubmitting] = useState(false);  // Estado de envío del formulario
  const [pageLoading, setPageLoading] = useState(true);  // Estado de carga inicial

  // Carga la lista de postulantes al montar el componente
  // Si se proporcionó postulante_id en la URL, lo selecciona automáticamente
  useEffect(() => {
    (async () => {
      try {
        const data = await getPostulantes(1, '');
        const list = data.data || data.postulantes || data || [];
        setPostulantes(Array.isArray(list) ? list : []);
        if (preselectedId) {
          const found = (Array.isArray(list) ? list : []).find((p) => String(p.id) === preselectedId);
          if (found) setSelectedPostulante(found);
        }
      } catch (err) {
        toast.error(err.message);
      } finally {
        setPageLoading(false);
      }
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Busca un postulante por CI en la API y lo selecciona automáticamente
  const handleBuscarCi = async () => {
    if (!searchCi.trim()) return;
    try {
      const data = await buscarPostulante(searchCi.trim());
      const p = data.postulante || data.persona || data;
      if (p) {
        setSelectedPostulante(p);
        setForm((prev) => ({ ...prev, postulante_id: p.id }));
      } else {
        toast.error('Postulante no encontrado');
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Selecciona un postulante desde el dropdown de la lista
  const handleSelectPostulante = (e) => {
    const id = e.target.value;
    setForm((prev) => ({ ...prev, postulante_id: id }));
    const found = postulantes.find((p) => String(p.id) === id);
    setSelectedPostulante(found || null);
  };

  // Maneja cambios genéricos en los campos del formulario
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Envía el formulario: crea el pago y redirige al listado
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createPago(form);
      toast.success('Pago registrado correctamente');
      navigate('/pagos');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (pageLoading) return <Loader />;

  return (
    <div className="row justify-content-center">
      <div className="col-lg-8">
        <h4 className="mb-4">Nuevo Pago</h4>

        {/* Sección de selección de postulante: búsqueda por CI o selección desde lista */}
        <div className="card shadow-sm mb-4">
          <div className="card-header"><strong>Seleccionar Postulante</strong></div>
          <div className="card-body">
            <div className="row g-3 align-items-end">
              {/* Búsqueda rápida por número de CI */}
              <div className="col-md-5">
                <label className="form-label">Buscar por CI</label>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    value={searchCi}
                    onChange={(e) => setSearchCi(e.target.value)}
                    placeholder="Ingrese CI"
                  />
                  <button className="btn btn-outline-secondary" onClick={handleBuscarCi}>
                    <i className="bi bi-search"></i>
                  </button>
                </div>
              </div>
              <div className="col-md-1 text-center">
                <span className="text-muted">o</span>
              </div>
              {/* Selección desde el listado completo de postulantes */}
              <div className="col-md-6">
                <label className="form-label">Seleccionar de la lista</label>
                <select className="form-select" value={form.postulante_id} onChange={handleSelectPostulante}>
                  <option value="">-- Seleccionar --</option>
                  {postulantes.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.ci} - {p.nombre} {p.apellido}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Información resumen del postulante seleccionado */}
            {selectedPostulante && (
              <div className="mt-3 p-3 bg-light rounded">
                <strong>Postulante: </strong>
                {selectedPostulante.nombre} {selectedPostulante.apellido}
                <span className="mx-2">|</span>
                <strong>CI: </strong>{selectedPostulante.ci}
                {selectedPostulante.postulacion && (
                  <>
                    <span className="mx-2">|</span>
                    <strong>Carrera: </strong>{selectedPostulante.postulacion.carrera_nombre || '-'}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Formulario de datos del pago: monto y método de pago */}
        <div className="card shadow-sm">
          <div className="card-header"><strong>Datos del Pago</strong></div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Monto (Bs.)</label>
                  <input
                    name="monto"
                    type="number"
                    step="0.01"
                    className="form-control"
                    value={form.monto}
                    onChange={handleChange}
                    required
                    min="0"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Método de Pago</label>
                  <select name="metodo_pago" className="form-select" value={form.metodo_pago} onChange={handleChange} required>
                    <option value="efectivo">Efectivo</option>
                    <option value="transferencia">Transferencia</option>
                    <option value="tarjeta">Tarjeta</option>
                    <option value="qr">QR</option>
                    <option value="pasarela">Pasarela</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 d-flex gap-2">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting || !form.postulante_id}
                >
                  {submitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>Registrando...
                    </>
                  ) : (
                    'Registrar Pago'
                  )}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => navigate('/pagos')}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
