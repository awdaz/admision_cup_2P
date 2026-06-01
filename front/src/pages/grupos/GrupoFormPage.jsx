import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import useGrupos from '../../hooks/useGrupos';
import useDocentes from '../../hooks/useDocentes';
import useCatalogos from '../../hooks/useCatalogos';
import Loader from '../../components/ui/Loader';

// Página de formulario para crear o editar un grupo
// Ruta: /grupos/nuevo | /grupos/:id/editar
// Acceso: Administradores
export default function GrupoFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id); // true si estamos editando, false si es creación
  const navigate = useNavigate();
  const { getGrupo, createGrupo, updateGrupo, loading } = useGrupos();
  const { getDocentes, loading: loadingDocentes } = useDocentes();
  const { getMaterias, getTurnos, materias, turnos, loading: loadingCat } = useCatalogos();

  const [docentes, setDocentes] = useState([]); // Lista de docentes para el selector
  // Datos del formulario del grupo
  const [form, setForm] = useState({
    codigo: '',
    nombre: '',
    cupo: 30,
    materia_id: '',
    docente_id: '',
    turno_id: '',
  });
  const [submitting, setSubmitting] = useState(false);  // Estado de envío
  const [pageLoading, setPageLoading] = useState(isEdit); // Carga inicial solo en edición

  // Carga catálogos (materias, turnos, docentes) al montar el componente
  useEffect(() => {
    const loadCatalogos = async () => {
      await Promise.all([getMaterias(), getTurnos()]);
      const d = await getDocentes(1, '');
      if (d) {
        setDocentes(d.data || d.docentes || []);
      }
    };
    loadCatalogos();
  }, [getMaterias, getTurnos, getDocentes]);

  // Si es edición, carga los datos del grupo existente
  useEffect(() => {
    if (isEdit) {
      (async () => {
        try {
          const data = await getGrupo(id);
          if (data) {
            setForm({
              codigo: data.codigo || '',
              nombre: data.nombre || '',
              cupo: data.cupo || 30,
              materia_id: data.materia_id || '',
              docente_id: data.docente_id || '',
              turno_id: data.turno_id || '',
            });
          }
        } catch (err) {
          toast.error(err.message);
        } finally {
          setPageLoading(false);
        }
      })();
    }
  }, [id, isEdit, getGrupo]);

  // Maneja cambios en los campos, convirtiendo "cupo" a número
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: name === 'cupo' ? Number(value) : value });
  };

  // Envía el formulario: crea o actualiza según isEdit, luego redirige al listado
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isEdit) {
        await updateGrupo(id, form);
      } else {
        await createGrupo(form);
      }
      const msg = isEdit ? 'Grupo actualizado correctamente' : 'Grupo creado correctamente';
      toast.success(msg);
      navigate('/grupos');
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
        <h4 className="mb-4">{isEdit ? 'Editar Grupo' : 'Nuevo Grupo'}</h4>

        <div className="card shadow-sm">
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label">Código</label>
                  <input name="codigo" className="form-control" value={form.codigo} onChange={handleChange} required placeholder="Ej: GRUPO-001" />
                </div>
                <div className="col-md-8">
                  <label className="form-label">Nombre</label>
                  <input name="nombre" className="form-control" value={form.nombre} onChange={handleChange} required />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Cupo</label>
                  <input name="cupo" type="number" className="form-control" value={form.cupo} onChange={handleChange} min="1" max="70" required />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Materia</label>
                  <select name="materia_id" className="form-select" value={form.materia_id} onChange={handleChange} required disabled={loadingCat}>
                    <option value="">Seleccionar...</option>
                    {materias.map((m) => (
                      <option key={m.id} value={m.id}>{m.nombre}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label">Turno</label>
                  <select name="turno_id" className="form-select" value={form.turno_id} onChange={handleChange} required disabled={loadingCat}>
                    <option value="">Seleccionar...</option>
                    {turnos.map((t) => (
                      <option key={t.id} value={t.id}>{t.nombre}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Docente</label>
                  <select name="docente_id" className="form-select" value={form.docente_id} onChange={handleChange} required disabled={loadingDocentes}>
                    <option value="">Seleccionar...</option>
                    {docentes.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.persona?.nombre} {d.persona?.apellido} ({d.cod_docente})
                      </option>
                    ))}
                  </select>
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
                <button type="button" className="btn btn-secondary" onClick={() => navigate('/grupos')}>
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
