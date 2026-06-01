import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import useHorarios from '../../hooks/useHorarios';
import useGrupos from '../../hooks/useGrupos';
import Loader from '../../components/ui/Loader';

// Días de la semana disponibles para horarios
const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export default function HorarioFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id); // true si estamos editando, false si es creación
  const navigate = useNavigate();
  const { getHorario, createHorario, updateHorario, loading } = useHorarios();
  const { getGrupos } = useGrupos();

  const [grupos, setGrupos] = useState([]); // Lista de grupos para el selector
  // Datos del formulario del horario
  const [form, setForm] = useState({
    dia: '',
    hora_inicio: '',
    hora_fin: '',
    grupo_id: '',
    aula_id: '',
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

  // Si es edición, carga los datos del horario existente
  useEffect(() => {
    if (isEdit) {
      (async () => {
        try {
          const data = await getHorario(id);
          if (data) {
            setForm({
              dia: data.dia || '',
              hora_inicio: data.hora_inicio || '',
              hora_fin: data.hora_fin || '',
              grupo_id: data.grupo_id || '',
              aula_id: data.aula_id || '',
            });
          }
        } catch (err) {
          toast.error(err.message);
        } finally {
          setPageLoading(false);
        }
      })();
    }
  }, [id, isEdit, getHorario]);

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
        await updateHorario(id, form);
      } else {
        await createHorario(form);
      }
      const msg = isEdit ? 'Horario actualizado correctamente' : 'Horario creado correctamente';
      toast.success(msg);
      navigate('/horarios');
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
        <h4 className="mb-4">{isEdit ? 'Editar Horario' : 'Nuevo Horario'}</h4>

        <div className="card shadow-sm">
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label">Día</label>
                  <select name="dia" className="form-select" value={form.dia} onChange={handleChange} required>
                    <option value="">Seleccionar...</option>
                    {DIAS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label">Hora Inicio</label>
                  <input name="hora_inicio" type="time" className="form-control" value={form.hora_inicio} onChange={handleChange} required />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Hora Fin</label>
                  <input name="hora_fin" type="time" className="form-control" value={form.hora_fin} onChange={handleChange} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Grupo</label>
                  <select name="grupo_id" className="form-select" value={form.grupo_id} onChange={handleChange} required>
                    <option value="">Seleccionar...</option>
                    {grupos.map((g) => (
                      <option key={g.id} value={g.id}>{g.codigo} - {g.materia?.nombre}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label">Aula (opcional)</label>
                  <input name="aula_id" type="number" className="form-control" value={form.aula_id} onChange={handleChange} placeholder="ID del aula" />
                </div>
              </div>

              <div className="mt-4 d-flex gap-2">
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? (
                    <><span className="spinner-border spinner-border-sm me-2"></span>Guardando...</>
                  ) : 'Guardar'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => navigate('/horarios')}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
