import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import usePostulaciones from '../../hooks/usePostulaciones';
import useCatalogos from '../../hooks/useCatalogos';
import { toast } from 'sonner';
import usePostulantes from '../../hooks/usePostulantes';
import Loader from '../../components/ui/Loader';
import FormPageLayout from '../../components/ui/FormPageLayout';
import SubmitButton from '../../components/ui/SubmitButton';
import CancelButton from '../../components/ui/CancelButton';

export default function PostulacionFormPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedId = searchParams.get('postulante_id');

  const { createPostulacion } = usePostulaciones();
  const { getCarreras, getTurnos, getSemestres } = useCatalogos();
  const { getPostulante, getPostulantes } = usePostulantes();

  const [carreras, setCarreras] = useState([]);
  const [turnos, setTurnos] = useState([]);
  const [semestres, setSemestres] = useState([]);
  const [selectedPostulante, setSelectedPostulante] = useState(null);
  const [loadingPage, setLoadingPage] = useState(true);
  const [postulantes, setPostulantes] = useState([]);

  const [form, setForm] = useState({
    postulante_id: preselectedId || '',
    primera_opcion_id: '',
    segunda_opcion_id: '',
    turno_id: '',
    semestre_id: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [car, tur, sem, postRes] = await Promise.all([
          getCarreras(),
          getTurnos(),
          getSemestres(),
          !preselectedId ? getPostulantes(1, '', 1000) : Promise.resolve(null),
        ]);
        setCarreras(Array.isArray(car) ? car : []);
        setTurnos(Array.isArray(tur) ? tur : []);
        setSemestres(Array.isArray(sem) ? sem : []);
        if (postRes?.data) setPostulantes(postRes.data);

        if (preselectedId) {
          const p = await getPostulante(preselectedId);
          const pData = p.postulante || p.persona || p;
          setSelectedPostulante(pData);
          setForm((prev) => ({ ...prev, postulante_id: pData.id }));
        }
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoadingPage(false);
      }
    })();
  }, []);

  const postulantesFiltrados = useMemo(() => {
    if (!busqueda.trim()) return postulantes;
    const s = busqueda.toLowerCase();
    return postulantes.filter((p) => {
      const per = p.persona || {};
      return (per.ci || '').toLowerCase().includes(s) ||
             (per.nombre || '').toLowerCase().includes(s) ||
             (per.apellido || '').toLowerCase().includes(s);
    });
  }, [postulantes, busqueda]);

  const handleSeleccionarPostulante = (postulante) => {
    setSelectedPostulante(postulante);
    const post = postulante.postulacion;
    setForm({
      postulante_id: postulante.id,
      primera_opcion_id: post?.primera_opcion_id || '',
      segunda_opcion_id: post?.segunda_opcion_id || '',
      turno_id: post?.turno_id || '',
      semestre_id: post?.semestre_id || '',
    });
    setBusqueda('');
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

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
    <FormPageLayout title="Nueva Postulación">

        {selectedPostulante ? (
          <div className="card shadow-sm mb-4">
            <div className="card-header d-flex justify-content-between align-items-center">
              <strong>Postulante</strong>
              {!preselectedId && (
                <button className="btn btn-sm btn-outline-secondary" onClick={() => { setSelectedPostulante(null); setForm({ ...form, postulante_id: '' }); }}>
                  Cambiar
                </button>
              )}
            </div>
            <div className="card-body">
              <p className="mb-0">
                <strong>{selectedPostulante.persona?.nombre} {selectedPostulante.persona?.apellido}</strong>
                <span className="mx-2">|</span>
                CI: {selectedPostulante.persona?.ci}
                {selectedPostulante.codigo && <><span className="mx-2">|</span>Código: {selectedPostulante.codigo}</>}
              </p>
            </div>
          </div>
        ) : !preselectedId && (
          <div className="card shadow-sm mb-4">
            <div className="card-header"><strong>Seleccionar Postulante</strong></div>
            <div className="card-body">
              <input type="text" className="form-control mb-2" placeholder="Filtrar por CI, nombre o apellido..."
                value={busqueda} onChange={(e) => setBusqueda(e.target.value)} autoFocus />
              {postulantes.length > 0 && (
                <ul className="list-group" style={{ maxHeight: 300, overflowY: 'auto' }}>
                  {postulantesFiltrados.length === 0 ? (
                    <li className="list-group-item text-muted">Sin resultados</li>
                  ) : (
                    postulantesFiltrados.map((p) => (
                      <li key={p.id} className="list-group-item list-group-item-action" role="button"
                        onClick={() => handleSeleccionarPostulante(p)} style={{ cursor: 'pointer' }}>
                        <strong>{p.persona?.ci}</strong> - {p.persona?.nombre} {p.persona?.apellido}
                      </li>
                    ))
                  )}
                </ul>
              )}
            </div>
          </div>
        )}

        <div className="card shadow-sm">
          <div className="card-header"><strong>Datos de Postulación</strong></div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Primera Opción</label>
                  <select name="primera_opcion_id" className="form-select" value={form.primera_opcion_id} onChange={handleChange} required>
                    <option value="">-- Seleccionar --</option>
                    {carreras.map((c) => (
                      <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label">Segunda Opción (opcional)</label>
                  <select name="segunda_opcion_id" className="form-select" value={form.segunda_opcion_id} onChange={handleChange}>
                    <option value="">-- Seleccionar --</option>
                    {carreras.filter(c => String(c.id) !== String(form.primera_opcion_id)).map((c) => (
                      <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label">Turno</label>
                  <select name="turno_id" className="form-select" value={form.turno_id} onChange={handleChange} required>
                    <option value="">-- Seleccionar --</option>
                    {turnos.map((t) => (
                      <option key={t.id} value={t.id}>{t.nombre}</option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label">Semestre</label>
                  <select name="semestre_id" className="form-select" value={form.semestre_id} onChange={handleChange} required>
                    <option value="">-- Seleccionar --</option>
                    {semestres.map((s) => (
                      <option key={s.id} value={s.id}>{s.semestre} - {s.anio}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4 d-flex gap-2">
                <SubmitButton loading={submitting} label="Registrar Postulación" loadingLabel="Registrando..." disabled={!form.postulante_id} />
                <CancelButton to="/postulantes" />
              </div>
            </form>
          </div>
        </div>
    </FormPageLayout>
  );
}
