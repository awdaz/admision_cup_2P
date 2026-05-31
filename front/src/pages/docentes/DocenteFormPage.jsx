import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import useDocentes from '../../hooks/useDocentes';
import Loader from '../../components/ui/Loader';

export default function DocenteFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { getDocente, createDocente, updateDocente, loading } = useDocentes();

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
    cod_docente: '',
    es_profesional_area: false,
    tiene_maestria: false,
    tiene_diplomado_edu_sup: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [pageLoading, setPageLoading] = useState(isEdit);

  useEffect(() => {
    if (isEdit) {
      (async () => {
        try {
          const data = await getDocente(id);
          if (data) {
            const p = data.persona || data;
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
              cod_docente: data.cod_docente || '',
              es_profesional_area: data.es_profesional_area ?? false,
              tiene_maestria: data.tiene_maestria ?? false,
              tiene_diplomado_edu_sup: data.tiene_diplomado_edu_sup ?? false,
            });
          }
        } catch (err) {
          toast.error(err.message);
        } finally {
          setPageLoading(false);
        }
      })();
    }
  }, [id, isEdit, getDocente]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isEdit) {
        await updateDocente(id, form);
      } else {
        await createDocente(form);
      }
      const msg = isEdit ? 'Docente actualizado correctamente' : 'Docente creado correctamente';
      toast.success(msg);
      navigate('/docentes');
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
        <h4 className="mb-4">{isEdit ? 'Editar Docente' : 'Nuevo Docente'}</h4>

        <div className="card shadow-sm">
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <h6 className="text-muted mb-3">Datos Personales</h6>
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
                    <option value="Otro">Otro</option>
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
                <div className="col-12">
                  <label className="form-label">Dirección</label>
                  <textarea name="direccion" className="form-control" rows="2" value={form.direccion} onChange={handleChange}></textarea>
                </div>
              </div>

              <hr className="my-4" />
              <h6 className="text-muted mb-3">Datos Laborales</h6>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Código Docente</label>
                  <input name="cod_docente" className="form-control" value={form.cod_docente} onChange={handleChange} required />
                </div>
                <div className="col-12">
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" name="es_profesional_area" id="es_profesional_area" checked={form.es_profesional_area} onChange={handleChange} />
                    <label className="form-check-label" htmlFor="es_profesional_area">Es profesional del área</label>
                  </div>
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" name="tiene_maestria" id="tiene_maestria" checked={form.tiene_maestria} onChange={handleChange} />
                    <label className="form-check-label" htmlFor="tiene_maestria">Tiene maestría</label>
                  </div>
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" name="tiene_diplomado_edu_sup" id="tiene_diplomado_edu_sup" checked={form.tiene_diplomado_edu_sup} onChange={handleChange} />
                    <label className="form-check-label" htmlFor="tiene_diplomado_edu_sup">Tiene diplomado en educación superior</label>
                  </div>
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
                <button type="button" className="btn btn-secondary" onClick={() => navigate('/docentes')}>
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
