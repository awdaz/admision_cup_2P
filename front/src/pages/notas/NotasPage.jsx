import { useState, useEffect, useRef, useMemo } from 'react';
import useAuthStore from '../../store/authStore';
import useRindes from '../../hooks/useRindes';
import useExamenes from '../../hooks/useExamenes';
import usePromedios from '../../hooks/usePromedios';
import usePostulaciones from '../../hooks/usePostulaciones';
import { toast } from 'sonner';
import useGrupos from '../../hooks/useGrupos';
import useCatalogos from '../../hooks/useCatalogos';
import BadgeStatus from '../../components/ui/BadgeStatus';

export default function NotasPage() {
  const { user } = useAuthStore();
  const tipo = user?.tipo;
  if (tipo === 'postulante') return <PostulanteNotas />;
  if (tipo === 'docente') return <DocenteNotas />;
  return <AdminNotas />;
}

function TablaNotas({ estudiantes, notas, onEditNota, onSeleccionarEstudiante }) {
  if (estudiantes.length === 0) {
    return <div className="alert alert-info">No hay estudiantes en esta vista. Use el buscador para agregar alumnos.</div>;
  }
  return (
    <div className="table-responsive">
      <table className="table table-hover table-striped align-middle">
        <thead className="table-light">
          <tr>
            <th>#</th><th>CI</th><th>Postulante</th><th>Nota</th>
          </tr>
        </thead>
        <tbody>
          {estudiantes.map((post, i) => {
            const postId = post?.id || i;
            return (
              <tr key={postId} role="button" onClick={() => onSeleccionarEstudiante?.(post)} style={{ cursor: 'pointer' }}>
                <td>{i + 1}</td>
                <td>{post?.postulante?.persona?.ci || '-'}</td>
                <td>{post?.postulante?.persona?.nombre || ''} {post?.postulante?.persona?.apellido || ''}</td>
                <td>
                  <div className="d-flex align-items-center gap-2">
                    {notas[postId] != null ? notas[postId] : post?.promedio_general != null
                      ? <span>{post.promedio_general} <small className="text-muted">(prom)</small></span>
                      : <span className="text-muted">—</span>}
                    {notas[postId] != null && (
                      <button className="btn btn-sm btn-outline-primary py-0 px-1"
                        onClick={(e) => { e.stopPropagation(); onEditNota?.(post); }} title="Editar nota">
                        <i className="bi bi-pencil"></i>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function EditarNotaModal({ show, rinde, value, onChange, onSave, onClose, saving }) {
  if (!show) return null;

  return (
    <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-sm modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header py-2">
            <h6 className="modal-title">Editar Nota</h6>
            <button type="button" className="btn-close py-1" onClick={onClose} aria-label="Cerrar"></button>
          </div>
          <div className="modal-body py-3">
            <p className="small mb-2 text-muted">
              {rinde?.examen?.grupo?.materia?.nombre} — Examen {rinde?.examen?.nro}
              {rinde?.examen?.grupo?.codigo ? ` — ${rinde.examen.grupo.codigo}` : ''}
            </p>
            <input type="number" step="0.01" className="form-control"
              value={value} onChange={(e) => onChange(e.target.value)}
              min="0" max="100" autoFocus />
          </div>
          <div className="modal-footer py-2">
            <button className="btn btn-sm btn-secondary" onClick={onClose} disabled={saving}>Cancelar</button>
            <button className="btn btn-sm btn-primary" onClick={onSave} disabled={saving}>
              {saving ? <><span className="spinner-border spinner-border-sm me-1" />Guardando...</> : 'Guardar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function useCargarRindes(examenId, getExamenRindes) {
  const [notas, setNotas] = useState({});
  const [rindesIds, setRindesIds] = useState({});
  const [postulacionesRindes, setPostulacionesRindes] = useState([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!examenId) return;
      try {
        const exam = await getExamenRindes(examenId);
        if (cancelled || !exam) return;
        const m1 = {}; const m2 = {};
        const posts = [];
        (exam.rindes || []).forEach((r) => {
          m1[r.postulacion_id] = r.nota;
          m2[r.postulacion_id] = r.id;
          if (r.postulacion) posts.push(r.postulacion);
        });
        if (!cancelled) { setNotas(m1); setRindesIds(m2); setPostulacionesRindes(posts); }
      } catch (err) { if (!cancelled) toast.error(err.message); }
    })();
    return () => { cancelled = true; };
  }, [examenId, getExamenRindes]);

  return { notas, setNotas, rindesIds, setRindesIds, postulacionesRindes, setPostulacionesRindes };
}

function DocenteNotas() {
  const { getGrupos, getGrupo } = useGrupos();
  const { getExamenes, getExamenRindes } = useExamenes();
  const { storeRinde, updateRinde, getRindesByPostulacion } = useRindes();
  const { getPostulaciones } = usePostulaciones();
  const { getMaterias } = useCatalogos();
  const [materias, setMaterias] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [examenes, setExamenes] = useState([]);
  const [selectedMateria, setSelectedMateria] = useState('');
  const [selectedTurno, setSelectedTurno] = useState('');
  const [selectedGrupo, setSelectedGrupo] = useState('');
  const [selectedExamen, setSelectedExamen] = useState('');
  const [estudiantes, setEstudiantes] = useState([]);
  const { notas, setNotas, rindesIds, setRindesIds } = useCargarRindes(selectedExamen, getExamenRindes);
  const [busqueda, setBusqueda] = useState('');
  const [resultadosBusqueda, setResultadosBusqueda] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [filtroSinNota, setFiltroSinNota] = useState(false);
  const [selectedPostulacion, setSelectedPostulacion] = useState(null);
  const [studentRindes, setStudentRindes] = useState([]);
  const [loadingStudent, setLoadingStudent] = useState(false);
  const searchRef = useRef(null);
  const [modalRinde, setModalRinde] = useState(null);
  const [modalNotaValue, setModalNotaValue] = useState('');
  const [savingModal, setSavingModal] = useState(false);

  useEffect(() => {
    (async () => {
      const d = await getMaterias();
      setMaterias(d || []);
    })();
  }, [getMaterias]);

  const gruposFiltrados = useMemo(() => {
    let gs = grupos;
    if (selectedTurno) gs = gs.filter((g) => String(g.turno_id) === String(selectedTurno));
    return gs;
  }, [grupos, selectedTurno]);

  const turnosGrupo = useMemo(() => {
    const map = {};
    grupos.forEach((g) => { if (g.turno) map[g.turno.id] = g.turno; });
    return Object.values(map);
  }, [grupos]);

  const gruposStudent = useMemo(() => {
    if (!studentRindes.length) return [];
    let r = studentRindes;
    if (selectedMateria) r = r.filter((x) => String(x.examen?.grupo?.materia_id) === String(selectedMateria));
    if (selectedTurno) r = r.filter((x) => String(x.examen?.grupo?.turno_id) === String(selectedTurno));
    const map = {};
    r.forEach((x) => { if (x.examen?.grupo) map[x.examen.grupo.id] = x.examen.grupo; });
    return Object.values(map);
  }, [studentRindes, selectedMateria, selectedTurno]);

  const turnosStudent = useMemo(() => {
    if (!studentRindes.length) return [];
    let r = studentRindes;
    if (selectedMateria) r = r.filter((x) => String(x.examen?.grupo?.materia_id) === String(selectedMateria));
    if (selectedGrupo) r = r.filter((x) => String(x.examen?.grupo_id) === String(selectedGrupo));
    const map = {};
    r.forEach((x) => { if (x.examen?.grupo?.turno) map[x.examen.grupo.turno.id] = x.examen.grupo.turno; });
    return Object.values(map);
  }, [studentRindes, selectedMateria, selectedGrupo]);

  const examenesStudent = useMemo(() => {
    if (!studentRindes.length) return [];
    let r = studentRindes;
    if (selectedMateria) r = r.filter((x) => String(x.examen?.grupo?.materia_id) === String(selectedMateria));
    if (selectedGrupo) r = r.filter((x) => String(x.examen?.grupo_id) === String(selectedGrupo));
    if (selectedTurno) r = r.filter((x) => String(x.examen?.grupo?.turno_id) === String(selectedTurno));
    const map = {};
    r.forEach((x) => { if (x.examen) map[x.examen.id] = x.examen; });
    return Object.values(map);
  }, [studentRindes, selectedMateria, selectedGrupo, selectedTurno]);

  const studentRindesFiltrados = useMemo(() => {
    if (!studentRindes.length) return [];
    let r = studentRindes;
    if (selectedMateria) r = r.filter((x) => String(x.examen?.grupo?.materia_id) === String(selectedMateria));
    if (selectedGrupo) r = r.filter((x) => String(x.examen?.grupo_id) === String(selectedGrupo));
    if (selectedTurno) r = r.filter((x) => String(x.examen?.grupo?.turno_id) === String(selectedTurno));
    if (selectedExamen) r = r.filter((x) => String(x.examen_id) === String(selectedExamen));
    return r;
  }, [studentRindes, selectedMateria, selectedGrupo, selectedTurno, selectedExamen]);

  const handleMateriaChange = async (id) => {
    setSelectedMateria(id);
    setSelectedTurno('');
    if (selectedPostulacion) return;
    setSelectedGrupo(''); setSelectedExamen(''); setEstudiantes([]); setNotas({});
    setGrupos([]);
    if (!id) return;
    try {
      const d = await getGrupos(1, { materia_id: id, per_page: 200 });
      if (d) setGrupos(d.data || d.grupos || []);
    } catch (err) { toast.error(err.message); }
  };

  const handleTurnoChange = (id) => {
    setSelectedTurno(id);
  };

  const handleGrupoChange = async (grupoId) => {
    setSelectedGrupo(grupoId);
    if (selectedPostulacion) {
      setSelectedExamen(''); setEstudiantes([]); setNotas({});
      return;
    }
    setSelectedPostulacion(null);
    setStudentRindes([]);
    setSelectedExamen(''); setEstudiantes([]); setNotas({});
    if (!grupoId) return;
    try {
      const [examenesData, grupo] = await Promise.all([
        getExamenes(1, grupoId),
        getGrupo(grupoId),
      ]);
      setExamenes(examenesData?.data || []);
      setEstudiantes((grupo?.postulacion_grupos || []).map((pg) => pg.postulacion));
      if (grupo?.turno_id) setSelectedTurno(String(grupo.turno_id));
    } catch (err) { toast.error(err.message); }
  };

  const handleLimpiar = () => {
    setBusqueda('');
    setResultadosBusqueda([]);
    setSelectedPostulacion(null);
    setStudentRindes([]);
    setSelectedMateria('');
    setSelectedTurno('');
    setSelectedGrupo('');
    setSelectedExamen('');
    setEstudiantes([]);
    setNotas({});
    setGrupos([]);
  };

  const estudiantesFiltrados = filtroSinNota
    ? estudiantes.filter((e) => notas[e.id] == null)
    : estudiantes;

  const handleBuscar = async () => {
    if (!busqueda.trim()) return;
    setBuscando(true);
    try {
      const res = await getPostulaciones(1, { search: busqueda });
      setResultadosBusqueda(res?.data || []);
    } catch (err) { toast.error(err.message); }
    finally { setBuscando(false); }
  };

  const handleSeleccionarEstudiante = async (postulacion) => {
    const nombre = `${postulacion.postulante?.persona?.nombre || ''} ${postulacion.postulante?.persona?.apellido || ''}`.trim();
    setResultadosBusqueda([]);
    setBusqueda(nombre || postulacion.postulante?.persona?.ci || '');
    setSelectedPostulacion(postulacion);
    setSelectedGrupo('');
    setSelectedExamen('');
    setEstudiantes([]);
    setNotas({});
    setLoadingStudent(true);
    try {
      const data = await getRindesByPostulacion(postulacion.id);
      setStudentRindes(data?.rindes || []);
    } catch (err) { toast.error(err.message); }
    finally { setLoadingStudent(false); }
  };

  const handleEditStart = (rindeOrPost) => {
    if (selectedPostulacion) {
      setModalRinde(rindeOrPost);
      setModalNotaValue(rindeOrPost.nota ?? '');
    } else {
      const grupo = grupos.find(g => String(g.id) === String(selectedGrupo));
      const examen = examenes.find(e => String(e.id) === String(selectedExamen));
      setModalRinde({
        id: rindesIds[rindeOrPost.id],
        postulacion_id: rindeOrPost.id,
        nota: notas[rindeOrPost.id] ?? '',
        examen: {
          nro: examen?.nro,
          grupo: grupo ? {
            codigo: grupo.codigo,
            materia: grupo.materia || { nombre: '' }
          } : null
        }
      });
      setModalNotaValue(notas[rindeOrPost.id] ?? '');
    }
  };

  const handleModalSave = async () => {
    if (!modalRinde) return;
    setSavingModal(true);
    try {
      const notaVal = Number(modalNotaValue);
      let saved = false;
      if (modalRinde.id) {
        await updateRinde(modalRinde.id, { nota: notaVal });
        saved = true;
      } else if (selectedExamen) {
        await storeRinde({ postulacion_id: modalRinde.postulacion_id, examen_id: Number(selectedExamen), nota: notaVal });
        saved = true;
      }
      setModalRinde(null);
      if (saved) {
        toast.success('Nota actualizada correctamente');
        if (selectedPostulacion) {
          const data = await getRindesByPostulacion(selectedPostulacion.id);
          setStudentRindes(data?.rindes || []);
        } else if (selectedExamen) {
          const exam = await getExamenRindes(selectedExamen);
          if (exam) {
            const m1 = {}; const m2 = {};
            (exam.rindes || []).forEach((r) => { m1[r.postulacion_id] = r.nota; m2[r.postulacion_id] = r.id; });
            setNotas(m1);
            setRindesIds(m2);
          }
        }
      } else {
        toast.error('Seleccione un examen para registrar la nota');
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSavingModal(false);
    }
  };

  const handleModalClose = () => {
    setModalRinde(null);
    setModalNotaValue('');
  };

  const turnosDisponibles = selectedPostulacion ? turnosStudent : turnosGrupo;

  return (
    <div>
      <div className="d-flex flex-wrap gap-2 mb-2">
        <div className="input-group" style={{ minWidth: 250 }} ref={searchRef}>
          <input type="text" className="form-control form-control-sm" placeholder="Agregar Alumno — CI, nombre o apellido..."
            value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleBuscar()} />
          <button className="btn btn-sm btn-outline-primary" onClick={handleBuscar} disabled={buscando}>
            {buscando ? <span className="spinner-border spinner-border-sm" /> : <i className="bi bi-search" />}
          </button>
          <button className="btn btn-sm btn-outline-secondary" onClick={handleLimpiar} title="Limpiar filtros">
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
        <select className="form-select form-select-sm" style={{ width: 220 }} value={selectedMateria || ''} onChange={(e) => handleMateriaChange(e.target.value)}>
          <option value="">Materia...</option>
          {materias.map((m) => (
            <option key={m.id} value={m.id}>{m.nombre}</option>
          ))}
        </select>
        <select className="form-select form-select-sm" style={{ width: 300 }} value={selectedGrupo || ''} onChange={(e) => handleGrupoChange(e.target.value)}
          disabled={!selectedPostulacion && (!selectedMateria || gruposFiltrados.length === 0)}>
          <option value="">Grupo...</option>
          {selectedPostulacion
            ? gruposStudent.map((g) => (
              <option key={g.id} value={g.id}>{g.codigo} - {g.materia?.nombre} ({g.turno?.nombre})</option>
            ))
            : gruposFiltrados.map((g) => (
              <option key={g.id} value={g.id}>{g.codigo} - {g.materia?.nombre} ({g.turno?.nombre})</option>
            ))}
        </select>
        <select className="form-select form-select-sm" style={{ width: 160 }} value={selectedTurno || ''} onChange={(e) => handleTurnoChange(e.target.value)}
          disabled={!selectedPostulacion && (!selectedMateria || turnosDisponibles.length === 0)}>
          <option value="">Turno...</option>
          {turnosDisponibles.map((t) => (
            <option key={t.id} value={t.id}>{t.nombre}</option>
          ))}
        </select>
        <select className="form-select form-select-sm" style={{ width: 320 }} value={selectedExamen || ''} onChange={(e) => setSelectedExamen(e.target.value)}
          disabled={!selectedPostulacion && (!selectedMateria || examenes.length === 0)}>
          <option value="">Examen...</option>
          {selectedPostulacion
            ? examenesStudent.map((e) => (
              <option key={e.id} value={e.id}>{e.nro} - {e.descripcion || 'Examen #' + e.nro}</option>
            ))
            : examenes.map((e) => (
              <option key={e.id} value={e.id}>{e.nro} - {e.descripcion || ('Examen #' + e.nro)} ({e.fecha ? new Date(e.fecha).toLocaleDateString() : ''}) - {e.porcentaje}%</option>
            ))}
        </select>
      </div>
      {resultadosBusqueda.length > 0 && (
        <ul className="list-group mb-2" style={{ maxHeight: 200, overflowY: 'auto' }}>
          {resultadosBusqueda.map((p) => (
            <li key={p.id} className="list-group-item list-group-item-action py-1" role="button" onClick={() => handleSeleccionarEstudiante(p)} style={{ cursor: 'pointer' }}>
              <small>{p.postulante?.persona?.ci} - {p.postulante?.persona?.nombre} {p.postulante?.persona?.apellido}</small>
            </li>
          ))}
        </ul>
      )}
      {(selectedPostulacion || selectedGrupo) ? (
        <>
          {selectedGrupo && selectedExamen && (
            <div className="d-flex justify-content-end mb-2">
              <div className="form-check form-switch">
                <input className="form-check-input" type="checkbox" id="filtroSinNotaDoc"
                  checked={filtroSinNota} onChange={(e) => setFiltroSinNota(e.target.checked)} />
                <label className="form-check-label small" htmlFor="filtroSinNotaDoc">Solo sin nota</label>
              </div>
            </div>
          )}
          {selectedPostulacion ? (
            loadingStudent ? (
              <div className="text-center py-3"><div className="spinner-border spinner-border-sm"></div></div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover table-striped align-middle table-sm">
                  <thead className="table-light">
                    <tr><th>Materia</th><th>Grupo</th><th>Examen</th><th>Nota</th><th>Estado</th></tr>
                  </thead>
                  <tbody>
                    {studentRindesFiltrados.length === 0 ? (
                      <tr><td colSpan="5" className="text-muted">Sin resultados</td></tr>
                    ) : studentRindesFiltrados.map((r) => (
                      <tr key={r.id}>
                        <td>{r.examen?.grupo?.materia?.nombre || '-'}</td>
                        <td>{r.examen?.grupo?.codigo || '-'}</td>
                        <td>{r.examen?.nro || '-'}</td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <strong>{r.nota ?? '-'}</strong>
                            <button className="btn btn-sm btn-outline-primary py-0 px-1" onClick={() => handleEditStart(r)} title="Editar nota">
                              <i className="bi bi-pencil"></i>
                            </button>
                          </div>
                        </td>
                        <td>{r.nota >= 60 ? <BadgeStatus value="aprobado" /> : <BadgeStatus value="reprobado" />}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : (
            <TablaNotas estudiantes={estudiantesFiltrados} notas={notas} onEditNota={handleEditStart} onSeleccionarEstudiante={handleSeleccionarEstudiante} />
          )}
        </>
      ) : (
        <div className="alert alert-secondary">Seleccione un grupo o busque un estudiante.</div>
      )}
      <EditarNotaModal show={!!modalRinde} rinde={modalRinde}
        value={modalNotaValue} onChange={setModalNotaValue}
        onSave={handleModalSave} onClose={handleModalClose} saving={savingModal} />
    </div>
  );
}

function PostulanteNotas() {
  const { user } = useAuthStore();
  const { getRindesByPostulacion } = useRindes();
  const { getPromedios } = usePromedios();
  const [notas, setNotas] = useState([]);
  const [promedios, setPromedios] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await getRindesByPostulacion(0);
        if (data?.postulacion) {
          setNotas(data.rindes || []);
          try {
            const prom = await getPromedios(data.postulacion.id);
            if (prom) setPromedios(prom.promedios);
          } catch { /* promedio no disponible */ }
        }
      } catch (err) { toast.error(err.message); }
      finally { setLoading(false); }
    })();
  }, [getRindesByPostulacion, getPromedios, user]);

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>;

  return (
    <div>
      {promedios && (
        <div className="row g-2 mb-4">
          {[
            { label: 'Matematicas (30%)', key: 'promedio_matematicas' },
            { label: 'Fisica (30%)', key: 'promedio_fisica' },
            { label: 'Computacion (30%)', key: 'promedio_computacion' },
            { label: 'Ingles (10%)', key: 'promedio_ingles' },
          ].map((m) => {
            const val = Number(promedios[m.key]);
            return (
              <div className="col-md-3" key={m.key}>
                <div className={"card " + (val >= 60 ? 'border-success' : 'border-danger')}>
                  <div className="card-body text-center py-2">
                    <small className="text-muted d-block">{m.label}</small>
                    <strong className={"fs-5 " + (val >= 60 ? 'text-success' : 'text-danger')}>{promedios[m.key] ?? '-'}</strong>
                    {val >= 60 ? <BadgeStatus value="aprobado" /> : <BadgeStatus value="reprobado" />}
                  </div>
                </div>
              </div>
            );
          })}
          <div className="col-12">
            <div className="d-flex align-items-center gap-3 p-2 bg-light rounded">
              <strong className="fs-5">Promedio General: {promedios.promedio_general ?? '-'}</strong>
{promedios.todas_aprobadas
                ? <BadgeStatus value="aprobado" />
                : <BadgeStatus value="reprobado" />}
            </div>
          </div>
        </div>
      )}
      {notas.length === 0 ? (
        <div className="alert alert-info">No tienes notas registradas.</div>
      ) : (
        <div className="table-responsive">
<table className="table table-hover table-striped align-middle">
            <thead className="table-light">
              <tr><th>Materia</th><th>Examen</th><th>Nota</th><th>Estado</th></tr>
            </thead>
            <tbody>
              {notas.map((r) => (
                <tr key={r.id}>
                  <td>{r.examen?.grupo?.materia?.nombre || '-'}</td>
                  <td>{r.examen?.nro || '-'}</td>
                  <td><strong>{r.nota ?? '-'}</strong></td>
                  <td>{r.nota >= 60 ? <BadgeStatus value="aprobado" /> : <BadgeStatus value="reprobado" />}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function AdminNotas() {
  const { getGrupos, getGrupo } = useGrupos();
  const { getExamenes, getExamenRindes } = useExamenes();
  const { storeRinde, updateRinde, getRindesByPostulacion } = useRindes();
  const { getPostulaciones } = usePostulaciones();
  const { getMaterias } = useCatalogos();
  const [materias, setMaterias] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [examenes, setExamenes] = useState([]);
  const [selectedMateria, setSelectedMateria] = useState('');
  const [selectedTurno, setSelectedTurno] = useState('');
  const [selectedGrupo, setSelectedGrupo] = useState('');
  const [selectedExamen, setSelectedExamen] = useState('');
  const [estudiantes, setEstudiantes] = useState([]);
  const { notas, setNotas, rindesIds, setRindesIds } = useCargarRindes(selectedExamen, getExamenRindes);
  const [busqueda, setBusqueda] = useState('');
  const [resultadosBusqueda, setResultadosBusqueda] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [filtroSinNota, setFiltroSinNota] = useState(false);
  const [selectedPostulacion, setSelectedPostulacion] = useState(null);
  const [studentRindes, setStudentRindes] = useState([]);
  const [loadingStudent, setLoadingStudent] = useState(false);
  const searchRef = useRef(null);
  const [modalRinde, setModalRinde] = useState(null);
  const [modalNotaValue, setModalNotaValue] = useState('');
  const [savingModal, setSavingModal] = useState(false);

  useEffect(() => {
    (async () => {
      const d = await getMaterias();
      setMaterias(d || []);
    })();
  }, [getMaterias]);

  const gruposFiltrados = useMemo(() => {
    let gs = grupos;
    if (selectedTurno) gs = gs.filter((g) => String(g.turno_id) === String(selectedTurno));
    return gs;
  }, [grupos, selectedTurno]);

  const turnosGrupo = useMemo(() => {
    const map = {};
    grupos.forEach((g) => { if (g.turno) map[g.turno.id] = g.turno; });
    return Object.values(map);
  }, [grupos]);

  const gruposStudent = useMemo(() => {
    if (!studentRindes.length) return [];
    let r = studentRindes;
    if (selectedMateria) r = r.filter((x) => String(x.examen?.grupo?.materia_id) === String(selectedMateria));
    if (selectedTurno) r = r.filter((x) => String(x.examen?.grupo?.turno_id) === String(selectedTurno));
    const map = {};
    r.forEach((x) => { if (x.examen?.grupo) map[x.examen.grupo.id] = x.examen.grupo; });
    return Object.values(map);
  }, [studentRindes, selectedMateria, selectedTurno]);

  const turnosStudent = useMemo(() => {
    if (!studentRindes.length) return [];
    let r = studentRindes;
    if (selectedMateria) r = r.filter((x) => String(x.examen?.grupo?.materia_id) === String(selectedMateria));
    if (selectedGrupo) r = r.filter((x) => String(x.examen?.grupo_id) === String(selectedGrupo));
    const map = {};
    r.forEach((x) => { if (x.examen?.grupo?.turno) map[x.examen.grupo.turno.id] = x.examen.grupo.turno; });
    return Object.values(map);
  }, [studentRindes, selectedMateria, selectedGrupo]);

  const examenesStudent = useMemo(() => {
    if (!studentRindes.length) return [];
    let r = studentRindes;
    if (selectedMateria) r = r.filter((x) => String(x.examen?.grupo?.materia_id) === String(selectedMateria));
    if (selectedGrupo) r = r.filter((x) => String(x.examen?.grupo_id) === String(selectedGrupo));
    if (selectedTurno) r = r.filter((x) => String(x.examen?.grupo?.turno_id) === String(selectedTurno));
    const map = {};
    r.forEach((x) => { if (x.examen) map[x.examen.id] = x.examen; });
    return Object.values(map);
  }, [studentRindes, selectedMateria, selectedGrupo, selectedTurno]);

  const studentRindesFiltrados = useMemo(() => {
    if (!studentRindes.length) return [];
    let r = studentRindes;
    if (selectedMateria) r = r.filter((x) => String(x.examen?.grupo?.materia_id) === String(selectedMateria));
    if (selectedGrupo) r = r.filter((x) => String(x.examen?.grupo_id) === String(selectedGrupo));
    if (selectedTurno) r = r.filter((x) => String(x.examen?.grupo?.turno_id) === String(selectedTurno));
    if (selectedExamen) r = r.filter((x) => String(x.examen_id) === String(selectedExamen));
    return r;
  }, [studentRindes, selectedMateria, selectedGrupo, selectedTurno, selectedExamen]);

  const handleMateriaChange = async (id) => {
    setSelectedMateria(id);
    setSelectedTurno('');
    if (selectedPostulacion) return;
    setSelectedGrupo(''); setSelectedExamen(''); setEstudiantes([]); setNotas({});
    setGrupos([]);
    if (!id) return;
    try {
      const d = await getGrupos(1, { materia_id: id, per_page: 200 });
      if (d) setGrupos(d.data || d.grupos || []);
    } catch (err) { toast.error(err.message); }
  };

  const handleTurnoChange = (id) => {
    setSelectedTurno(id);
  };

  const handleGrupoChange = async (grupoId) => {
    setSelectedGrupo(grupoId);
    if (selectedPostulacion) {
      setSelectedExamen(''); setEstudiantes([]); setNotas({});
      return;
    }
    setSelectedPostulacion(null);
    setStudentRindes([]);
    setSelectedExamen(''); setEstudiantes([]); setNotas({});
    if (!grupoId) return;
    try {
      const [examenesData, grupo] = await Promise.all([
        getExamenes(1, grupoId),
        getGrupo(grupoId),
      ]);
      setExamenes(examenesData?.data || []);
      setEstudiantes((grupo?.postulacion_grupos || []).map((pg) => pg.postulacion));
      if (grupo?.turno_id) setSelectedTurno(String(grupo.turno_id));
    } catch (err) { toast.error(err.message); }
  };

  const handleLimpiar = () => {
    setBusqueda('');
    setResultadosBusqueda([]);
    setSelectedPostulacion(null);
    setStudentRindes([]);
    setSelectedMateria('');
    setSelectedTurno('');
    setSelectedGrupo('');
    setSelectedExamen('');
    setEstudiantes([]);
    setNotas({});
    setGrupos([]);
  };

  const estudiantesFiltrados = filtroSinNota
    ? estudiantes.filter((e) => notas[e.id] == null)
    : estudiantes;

  const handleBuscar = async () => {
    if (!busqueda.trim()) return;
    setBuscando(true);
    try {
      const res = await getPostulaciones(1, { search: busqueda });
      setResultadosBusqueda(res?.data || []);
    } catch (err) { toast.error(err.message); }
    finally { setBuscando(false); }
  };

  const handleSeleccionarEstudiante = async (postulacion) => {
    const nombre = `${postulacion.postulante?.persona?.nombre || ''} ${postulacion.postulante?.persona?.apellido || ''}`.trim();
    setResultadosBusqueda([]);
    setBusqueda(nombre || postulacion.postulante?.persona?.ci || '');
    setSelectedPostulacion(postulacion);
    setSelectedGrupo('');
    setSelectedExamen('');
    setEstudiantes([]);
    setNotas({});
    setLoadingStudent(true);
    try {
      const data = await getRindesByPostulacion(postulacion.id);
      setStudentRindes(data?.rindes || []);
    } catch (err) { toast.error(err.message); }
    finally { setLoadingStudent(false); }
  };

  const handleEditStart = (rindeOrPost) => {
    if (selectedPostulacion) {
      setModalRinde(rindeOrPost);
      setModalNotaValue(rindeOrPost.nota ?? '');
    } else {
      const grupo = grupos.find(g => String(g.id) === String(selectedGrupo));
      const examen = examenes.find(e => String(e.id) === String(selectedExamen));
      setModalRinde({
        id: rindesIds[rindeOrPost.id],
        postulacion_id: rindeOrPost.id,
        nota: notas[rindeOrPost.id] ?? '',
        examen: {
          nro: examen?.nro,
          grupo: grupo ? {
            codigo: grupo.codigo,
            materia: grupo.materia || { nombre: '' }
          } : null
        }
      });
      setModalNotaValue(notas[rindeOrPost.id] ?? '');
    }
  };

  const handleModalSave = async () => {
    if (!modalRinde) return;
    setSavingModal(true);
    try {
      const notaVal = Number(modalNotaValue);
      let saved = false;
      if (modalRinde.id) {
        await updateRinde(modalRinde.id, { nota: notaVal });
        saved = true;
      } else if (selectedExamen) {
        await storeRinde({ postulacion_id: modalRinde.postulacion_id, examen_id: Number(selectedExamen), nota: notaVal });
        saved = true;
      }
      setModalRinde(null);
      if (saved) {
        toast.success('Nota actualizada correctamente');
        if (selectedPostulacion) {
          const data = await getRindesByPostulacion(selectedPostulacion.id);
          setStudentRindes(data?.rindes || []);
        } else if (selectedExamen) {
          const exam = await getExamenRindes(selectedExamen);
          if (exam) {
            const m1 = {}; const m2 = {};
            (exam.rindes || []).forEach((r) => { m1[r.postulacion_id] = r.nota; m2[r.postulacion_id] = r.id; });
            setNotas(m1);
            setRindesIds(m2);
          }
        }
      } else {
        toast.error('Seleccione un examen para registrar la nota');
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSavingModal(false);
    }
  };

  const handleModalClose = () => {
    setModalRinde(null);
    setModalNotaValue('');
  };

  const turnosDisponibles = selectedPostulacion ? turnosStudent : turnosGrupo;

  return (
    <div>
      <div className="d-flex flex-wrap gap-2 mb-2">
        <div className="input-group" style={{ minWidth: 250 }} ref={searchRef}>
          <input type="text" className="form-control form-control-sm" placeholder="Agregar Alumno — CI, nombre o apellido..."
            value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleBuscar()} />
          <button className="btn btn-sm btn-outline-primary" onClick={handleBuscar} disabled={buscando}>
            {buscando ? <span className="spinner-border spinner-border-sm" /> : <i className="bi bi-search" />}
          </button>
          <button className="btn btn-sm btn-outline-secondary" onClick={handleLimpiar} title="Limpiar filtros">
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
        <select className="form-select form-select-sm" style={{ width: 220 }} value={selectedMateria || ''} onChange={(e) => handleMateriaChange(e.target.value)}>
          <option value="">Materia...</option>
          {materias.map((m) => (
            <option key={m.id} value={m.id}>{m.nombre}</option>
          ))}
        </select>
        <select className="form-select form-select-sm" style={{ width: 360 }} value={selectedGrupo || ''} onChange={(e) => handleGrupoChange(e.target.value)}
          disabled={!selectedPostulacion && (!selectedMateria || gruposFiltrados.length === 0)}>
          <option value="">Grupo...</option>
          {selectedPostulacion
            ? gruposStudent.map((g) => (
              <option key={g.id} value={g.id}>{g.codigo} - {g.materia?.nombre} ({g.turno?.nombre}) - {g.docente?.persona?.nombre || ''}</option>
            ))
            : gruposFiltrados.map((g) => (
              <option key={g.id} value={g.id}>{g.codigo} - {g.materia?.nombre} ({g.turno?.nombre}) - {g.docente?.persona?.nombre || ''}</option>
            ))}
        </select>
        <select className="form-select form-select-sm" style={{ width: 160 }} value={selectedTurno || ''} onChange={(e) => handleTurnoChange(e.target.value)}
          disabled={!selectedPostulacion && (!selectedMateria || turnosDisponibles.length === 0)}>
          <option value="">Turno...</option>
          {turnosDisponibles.map((t) => (
            <option key={t.id} value={t.id}>{t.nombre}</option>
          ))}
        </select>
        <select className="form-select form-select-sm" style={{ width: 320 }} value={selectedExamen || ''} onChange={(e) => setSelectedExamen(e.target.value)}
          disabled={!selectedPostulacion && (!selectedMateria || examenes.length === 0)}>
          <option value="">Examen...</option>
          {selectedPostulacion
            ? examenesStudent.map((e) => (
              <option key={e.id} value={e.id}>{e.nro} - {e.descripcion || 'Examen #' + e.nro}</option>
            ))
            : examenes.map((e) => (
              <option key={e.id} value={e.id}>{e.nro} - {e.descripcion || ('Examen #' + e.nro)} ({e.fecha ? new Date(e.fecha).toLocaleDateString() : ''}) - {e.porcentaje}%</option>
            ))}
        </select>
      </div>
      {resultadosBusqueda.length > 0 && (
        <ul className="list-group mb-2" style={{ maxHeight: 200, overflowY: 'auto' }}>
          {resultadosBusqueda.map((p) => (
            <li key={p.id} className="list-group-item list-group-item-action py-1" role="button" onClick={() => handleSeleccionarEstudiante(p)} style={{ cursor: 'pointer' }}>
              <small>{p.postulante?.persona?.ci} - {p.postulante?.persona?.nombre} {p.postulante?.persona?.apellido}</small>
            </li>
          ))}
        </ul>
      )}
      {(selectedPostulacion || selectedGrupo) ? (
        <>
          {selectedGrupo && selectedExamen && (
            <div className="d-flex justify-content-end mb-2">
              <div className="form-check form-switch">
                <input className="form-check-input" type="checkbox" id="filtroSinNotaAdmin"
                  checked={filtroSinNota} onChange={(e) => setFiltroSinNota(e.target.checked)} />
                <label className="form-check-label small" htmlFor="filtroSinNotaAdmin">Solo sin nota</label>
              </div>
            </div>
          )}
          {selectedPostulacion ? (
            loadingStudent ? (
              <div className="text-center py-3"><div className="spinner-border spinner-border-sm"></div></div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover table-striped align-middle table-sm">
                  <thead className="table-light">
                    <tr><th>Materia</th><th>Grupo</th><th>Examen</th><th>Nota</th><th>Estado</th></tr>
                  </thead>
                  <tbody>
                    {studentRindesFiltrados.length === 0 ? (
                      <tr><td colSpan="5" className="text-muted">Sin resultados</td></tr>
                    ) : studentRindesFiltrados.map((r) => (
                      <tr key={r.id}>
                        <td>{r.examen?.grupo?.materia?.nombre || '-'}</td>
                        <td>{r.examen?.grupo?.codigo || '-'}</td>
                        <td>{r.examen?.nro || '-'}</td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <strong>{r.nota ?? '-'}</strong>
                            <button className="btn btn-sm btn-outline-primary py-0 px-1" onClick={() => handleEditStart(r)} title="Editar nota">
                              <i className="bi bi-pencil"></i>
                            </button>
                          </div>
                        </td>
                        <td>{r.nota >= 60 ? <BadgeStatus value="aprobado" /> : <BadgeStatus value="reprobado" />}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : (
            <TablaNotas estudiantes={estudiantesFiltrados} notas={notas} onEditNota={handleEditStart} onSeleccionarEstudiante={handleSeleccionarEstudiante} />
          )}
        </>
      ) : (
        <div className="alert alert-secondary">Seleccione un grupo o busque un estudiante.</div>
      )}
      <EditarNotaModal show={!!modalRinde} rinde={modalRinde}
        value={modalNotaValue} onChange={setModalNotaValue}
        onSave={handleModalSave} onClose={handleModalClose} saving={savingModal} />
    </div>
  );
}
