import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import useExamenes from '../../hooks/useExamenes';
import useGrupos from '../../hooks/useGrupos';
import Loader from '../../components/ui/Loader';

// Página de formulario para crear o editar un examen
// Ruta: /examenes/nuevo | /examenes/:id/editar
// Acceso: Administradores y docentes
export default function ExamenFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id); // true si estamos editando, false si es creación
  const navigate = useNavigate();
  const { getExamen, createExamen, updateExamen, loading } = useExamenes();
  const { getGrupos } = useGrupos();

  const [grupos, setGrupos] = useState([]); // Lista de grupos para el selector
  // Datos del formulario del examen
  const [form, setForm] = useState({
    nro: '',
    descripcion: '',
    fecha: '',
    grupo_id: '',
    porcentaje: '',
  });
  const [submitting, setSubmitting] = useState(false);  // Estado de envío
  const [pageLoading, setPageLoading] = useState(isEdit); // Carga inicial solo en edición

  // Carga la lista de grupos para el selector al montar
  useEffect(() => {
    (async () => {
      const d = await getGrupos(1);
      if (d) setGrupos(d.data || d.grupos || []);
    })();
  }, [getGrupos]);

  // Si es edición, carga los datos del examen existente
  useEffect(() => {
    if (isEdit) {
      (async () => {
        try {
          const data = await getExamen(id);
          if (data) {
            setForm({
              nro: data.nro || '',
              descripcion: data.descripcion || '',
              fecha: data.fecha ? data.fecha.slice(0, 10) : '',
              grupo_id: data.grupo_id || '',
              porcentaje: data.porcentaje || '',
            });
          }
        } catch (err) {
          toast.error(err.message);
        } finally {
          setPageLoading(false);
        }
      })();
    }
  }, [id, isEdit, getExamen]);

  // Maneja cambios genéricos en los campos del formulario
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Envía el formulario: crea o actualiza según isEdit, luego redirige al listado
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isEdit) {
        await updateExamen(id, form);
      } else {
        await createExamen(form);
      }
      const msg = isEdit ? 'Examen actualizado correctamente' : 'Examen creado correctamente';
      toast.success(msg);
      navigate('/examenes');
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
        <h4 className="mb-4">{isEdit ? 'Editar Examen' : 'Nuevo Examen'}</h4>

        <div className="card shadow-sm">
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label">Nro</label>
                  <input name="nro" className="form-control" value={form.nro} onChange={handleChange} required />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Fecha</label>
                  <input name="fecha" type="date" className="form-control" value={form.fecha} onChange={handleChange} required />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Porcentaje (%)</label>
                  <input name="porcentaje" type="number" step="0.01" className="form-control" value={form.porcentaje} onChange={handleChange} min="0" max="100" required />
                </div>
                <div className="col-md-8">
                  <label className="form-label">Descripción</label>
                  <input name="descripcion" className="form-control" value={form.descripcion} onChange={handleChange} />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Grupo</label>
                  <select name="grupo_id" className="form-select" value={form.grupo_id} onChange={handleChange} required>
                    <option value="">Seleccionar...</option>
                    {grupos.map((g) => (
                      <option key={g.id} value={g.id}>{g.codigo} - {g.materia?.nombre} ({g.docente?.persona?.nombre})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4 d-flex gap-2">
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? (
                    <><span className="spinner-border spinner-border-sm me-2"></span>Guardando...</>
                  ) : 'Guardar'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => navigate('/examenes')}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
