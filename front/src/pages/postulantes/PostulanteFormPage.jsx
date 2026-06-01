import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import usePostulantes from '../../hooks/usePostulantes';
import Loader from '../../components/ui/Loader';

// Página de formulario para crear o editar un postulante
// Rutas: "/postulantes/nuevo" (crear) y "/postulantes/:id/editar" (editar)
// Acceso: Usuarios autenticados
export default function PostulanteFormPage() {
  const { id } = useParams();
  // Si hay id en la URL, estamos en modo edición
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { getPostulante, createPostulante, updatePostulante, loading } = usePostulantes();

  // Objeto que agrupa todos los campos editables del postulante
  const [form, setForm] = useState({
    ci: '',
    nombre: '',
    apellido: '',
    fecha_nac: '',
    sexo: '',
    email: '',
    telefono: '',
    direccion: '',
    ciudad: '',
    colegio_procedencia: '',
  });
  // Indica si el formulario se está guardando
  const [submitting, setSubmitting] = useState(false);
  // Indica si los datos iniciales están cargando (solo en modo edición)
  const [pageLoading, setPageLoading] = useState(isEdit);

  // En modo edición, carga los datos del postulante existente al montar el componente
  useEffect(() => {
    if (isEdit) {
      (async () => {
        try {
          const data = await getPostulante(id);
          if (data) {
            const p = data.postulante || data.persona || data;
            setForm({
              ci: p.ci || '',
              nombre: p.nombre || '',
              apellido: p.apellido || '',
              fecha_nac: p.fecha_nac ? p.fecha_nac.slice(0, 10) : '',
              sexo: p.sexo || '',
              email: p.email || '',
              telefono: p.telefono || '',
              direccion: p.direccion || '',
              ciudad: p.ciudad || '',
              colegio_procedencia: p.colegio_procedencia || '',
            });
          }
        } catch (err) {
          toast.error(err.message);
        } finally {
          setPageLoading(false);
        }
      })();
    }
  }, [id, isEdit, getPostulante]);

  // Actualiza el campo correspondiente en el estado del formulario
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Envía el formulario: crea o actualiza según el modo, luego redirige al listado
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isEdit) {
        await updatePostulante(id, form);
      } else {
        await createPostulante(form);
      }
      const msg = isEdit ? 'Postulante actualizado correctamente' : 'Postulante creado correctamente';
      toast.success(msg);
      navigate('/postulantes');
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
        <h4 className="mb-4">{isEdit ? 'Editar Postulante' : 'Nuevo Postulante'}</h4>

        <div className="card shadow-sm">
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label">CI</label>
                  <input name="ci" className="form-control" value={form.ci} onChange={handleChange} required />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Nombre</label>
                  <input name="nombre" className="form-control" value={form.nombre} onChange={handleChange} required />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Apellido</label>
                  <input name="apellido" className="form-control" value={form.apellido} onChange={handleChange} required />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Fecha Nacimiento</label>
                  <input name="fecha_nac" type="date" className="form-control" value={form.fecha_nac} onChange={handleChange} />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Sexo</label>
                  <select name="sexo" className="form-select" value={form.sexo} onChange={handleChange}>
                    <option value="">Seleccionar...</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Femenino">Femenino</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label">Email</label>
                  <input name="email" type="email" className="form-control" value={form.email} onChange={handleChange} required />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Teléfono</label>
                  <input name="telefono" className="form-control" value={form.telefono} onChange={handleChange} />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Ciudad</label>
                  <input name="ciudad" className="form-control" value={form.ciudad} onChange={handleChange} />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Colegio Procedencia</label>
                  <input name="colegio_procedencia" className="form-control" value={form.colegio_procedencia} onChange={handleChange} />
                </div>
                <div className="col-12">
                  <label className="form-label">Dirección</label>
                  <textarea name="direccion" className="form-control" rows="2" value={form.direccion} onChange={handleChange}></textarea>
                </div>
              </div>

              <div className="mt-4 d-flex gap-2">
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>Guardando...
                    </>
                  ) : (
                    'Guardar'
                  )}
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
