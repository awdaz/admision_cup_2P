import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import cliente from '../../api/cliente';
import usePostulaciones from '../../hooks/usePostulaciones';
import useCatalogos from '../../hooks/useCatalogos';
import { toast } from 'sonner';
import usePostulantes from '../../hooks/usePostulantes';
import Loader from '../../components/ui/Loader';

// Página de formulario para crear una nueva postulación
// Ruta: /postulaciones/nuevo (con ?postulante_id opcional para preseleccionar)
// Acceso: Administradores y personal de registro
export default function PostulacionFormPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedId = searchParams.get('postulante_id'); // ID de postulante preseleccionado vía query param

  const { createPostulacion } = usePostulaciones();
  const { getCarreras, getTurnos, getSemestres } = useCatalogos();
  const { getPostulante, getPostulantes } = usePostulantes();

  // Catálogos cargados desde la API
  const [carreras, setCarreras] = useState([]);      // Lista de carreras disponibles
  const [turnos, setTurnos] = useState([]);          // Lista de turnos (mañana/tarde/noche)
  const [semestres, setSemestres] = useState([]);    // Lista de semestres académicos
  const [admisiones, setAdmisiones] = useState([]);  // Lista de admisiones activas
  const [postulantes, setPostulantes] = useState([]); // Lista de postulantes (para selector)
  const [postulante, setPostulante] = useState(null); // Postulante preseleccionado (datos completos)
  const [loadingPage, setLoadingPage] = useState(true); // Estado de carga inicial de datos

  // Datos del formulario de postulación
  const [form, setForm] = useState({
    postulante_id: preselectedId || '',
    primera_opcion_id: '',
    segunda_opcion_id: '',
    turno_id: '',
    semestre_id: '',
    admision_id: '',
  });

  const [submitting, setSubmitting] = useState(false); // Estado de envío del formulario

  // Carga inicial: catálogos (carreras, turnos, semestres), postulantes y admisiones activas
  // Si viene un postulante_id en la URL, también carga sus datos completos
  useEffect(() => {
    (async () => {
      try {
        const [car, tur, sem, postList] = await Promise.all([
          getCarreras(),
          getTurnos(),
          getSemestres(),
          getPostulantes(1, ''),
        ]);
        setCarreras(Array.isArray(car) ? car : []);
        setTurnos(Array.isArray(tur) ? tur : []);
        setSemestres(Array.isArray(sem) ? sem : []);
        const plist = postList.data || postList.postulantes || postList || [];
        setPostulantes(Array.isArray(plist) ? plist : []);

        const adm = await cliente.get('/admisiones?estado=activa');
        setAdmisiones(Array.isArray(adm) ? adm : []);

        if (preselectedId) {
          const p = await getPostulante(preselectedId);
          const pData = p.postulante || p.persona || p;
          setPostulante(pData);
          setForm((prev) => ({ ...prev, postulante_id: pData.id }));
        }
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoadingPage(false);
      }
    })();
  }, []);

  // Maneja cambios en los campos del formulario actualizando el estado
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Envía el formulario: llama a createPostulacion y redirige al postulante
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createPostulacion(form);
      toast.success('Postulación registrada correctamente');
      navigate('/postulantes/' + form.postulante_id);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingPage) return <Loader />;

  return (
    <div className="row justify-content-center">
      <div className="col-lg-8">
        <h4 className="mb-4">Nueva Postulación</h4>

        {/* Tarjeta informativa del postulante preseleccionado (se muestra cuando se pasa postulante_id en la URL) */}
        {postulante && (
          <div className="card shadow-sm mb-4">
            <div className="card-header"><strong>Postulante</strong></div>
            <div className="card-body">
              <p className="mb-0">
                <strong>{postulante.nombre} {postulante.apellido}</strong>
                <span className="mx-2">|</span>
                CI: {postulante.ci}
                {postulante.codigo && <><span className="mx-2">|</span>Código: {postulante.codigo}</>}
              </p>
            </div>
          </div>
        )}

        <div className="card shadow-sm">
          <div className="card-header"><strong>Datos de Postulación</strong></div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                {/* Selector de postulante: solo visible cuando no viene preseleccionado por URL */}
                {!preselectedId && (
                  <div className="col-12">
                    <label className="form-label">Postulante</label>
                    <select name="postulante_id" className="form-select" value={form.postulante_id} onChange={handleChange} required>
                      <option value="">-- Seleccionar --</option>
                      {postulantes.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.ci} - {p.nombre} {p.apellido}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Primera opción de carrera (obligatorio) */}
                <div className="col-md-6">
                  <label className="form-label">Primera Opción</label>
                  <select name="primera_opcion_id" className="form-select" value={form.primera_opcion_id} onChange={handleChange} required>
                    <option value="">-- Seleccionar --</option>
                    {carreras.map((c) => (
                      <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                  </select>
                </div>

                {/* Segunda opción de carrera (opcional), excluye la carrera seleccionada en primera opción */}
                <div className="col-md-6">
                  <label className="form-label">Segunda Opción (opcional)</label>
                  <select name="segunda_opcion_id" className="form-select" value={form.segunda_opcion_id} onChange={handleChange}>
                    <option value="">-- Seleccionar --</option>
                    {carreras.filter(c => String(c.id) !== String(form.primera_opcion_id)).map((c) => (
                      <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                  </select>
                </div>

                {/* Turno al que postula (mañana, tarde, noche) */}
                <div className="col-md-4">
                  <label className="form-label">Turno</label>
                  <select name="turno_id" className="form-select" value={form.turno_id} onChange={handleChange} required>
                    <option value="">-- Seleccionar --</option>
                    {turnos.map((t) => (
                      <option key={t.id} value={t.id}>{t.nombre}</option>
                    ))}
                  </select>
                </div>

                {/* Semestre académico en el que se postula */}
                <div className="col-md-4">
                  <label className="form-label">Semestre</label>
                  <select name="semestre_id" className="form-select" value={form.semestre_id} onChange={handleChange} required>
                    <option value="">-- Seleccionar --</option>
                    {semestres.map((s) => (
                      <option key={s.id} value={s.id}>{s.semestre} - {s.anio}</option>
                    ))}
                  </select>
                </div>

                {/* Admisión activa a la que se asocia la postulación (opcional) */}
                <div className="col-md-4">
                  <label className="form-label">Admisión (opcional)</label>
                  <select name="admision_id" className="form-select" value={form.admision_id} onChange={handleChange}>
                    <option value="">-- Seleccionar --</option>
                    {admisiones.map((a) => (
                      <option key={a.id} value={a.id}>{a.nro} - {a.gestion}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4 d-flex gap-2">
                <button type="submit" className="btn btn-primary" disabled={submitting || !form.postulante_id}>
                  {submitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>Registrando...
                    </>
                  ) : 'Registrar Postulación'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => navigate('/postulantes')}>
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
