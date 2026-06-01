// Página principal de Notas — renderiza componentes según el rol del usuario
import { useState, useEffect } from 'react';
import useAuthStore from '../../store/authStore';
import useRindes from '../../hooks/useRindes';
import useExamenes from '../../hooks/useExamenes';
import { toast } from 'sonner';
import useGrupos from '../../hooks/useGrupos';
import { useNavigate } from 'react-router-dom';

// Componente raíz que delega en DocenteNotas, PostulanteNotas o AdminNotas según user.tipo
export default function NotasPage() {
  const user = useAuthStore((s) => s.user);
  const tipo = user?.tipo;

  if (tipo === 'postulante') return <PostulanteNotas />;
  if (tipo === 'docente') return <DocenteNotas />;
  return <AdminNotas />;
}

// Componente para que el docente registre notas de estudiantes por grupo y examen
function DocenteNotas() {
  const { getGrupos } = useGrupos();
  const { getExamenes } = useExamenes();
  const { storeRinde, loading } = useRindes();
  const [grupos, setGrupos] = useState([]);          // Lista de grupos del docente
  const [examenes, setExamenes] = useState([]);      // Exámenes del grupo seleccionado
  const [selectedExamen, setSelectedExamen] = useState(''); // Examen actualmente seleccionado
  const [estudiantes, setEstudiantes] = useState([]); // Estudiantes del grupo seleccionado
  const [notas, setNotas] = useState({});             // Mapa postulacion_id → nota

  // Carga los grupos del docente al montar el componente
  useEffect(() => {
    (async () => {
      const d = await getGrupos(1);
      if (d) setGrupos(d.data || d.grupos || []);
    })();
  }, [getGrupos]);

  // Al seleccionar un examen, carga las notas existentes de los estudiantes
  useEffect(() => {
    if (!selectedExamen) { setEstudiantes([]); return; }
    (async () => {
      try {
        const data = await getExamenes(1, selectedExamen);
        const exam = data?.data?.find((e) => e.id === Number(selectedExamen));
        if (!exam) return;
        const rindes = exam.rindes || [];
        const rindesMap = {};
        rindes.forEach((r) => {
          rindesMap[r.postulacion_id] = r.nota;
        });
        setNotas(rindesMap);
      } catch (err) {
        toast.error(err.message);
      }
    })();
  }, [selectedExamen, getExamenes]);

  // Al cambiar de grupo, resetea selecciones y carga exámenes y estudiantes
  const handleGrupoChange = async (grupoId) => {
    setSelectedExamen('');
    setEstudiantes([]);
    setNotas({});
    if (!grupoId) return;
    try {
      const data = await getExamenes(1, grupoId);
      const items = data?.data || [];
      setExamenes(items);

      const grupo = grupos.find((g) => g.id === Number(grupoId));
      const postGrupos = grupo?.postulacionGrupos || [];
      setEstudiantes(postGrupos.map((pg) => pg.postulacion));
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Actualiza el valor de la nota para un estudiante en el estado local
  const handleNotaChange = (postulacionId, value) => {
    setNotas({ ...notas, [postulacionId]: value });
  };

  // Guarda (o actualiza) la nota de un estudiante en el servidor
  const handleGuardarNota = async (postulacionId) => {
    if (!selectedExamen) return;
    try {
      await storeRinde({
        postulacion_id: postulacionId,
        examen_id: Number(selectedExamen),
        nota: Number(notas[postulacionId]),
      });
      toast.success('Nota guardada correctamente');
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div>
      <h4 className="mb-4">Registro de Notas</h4>
      <div className="row g-2 mb-3">
        <div className="col-auto">
          <select className="form-select" onChange={(e) => handleGrupoChange(e.target.value)} defaultValue="">
            <option value="" disabled>Seleccionar grupo...</option>
            {grupos.map((g) => (
              <option key={g.id} value={g.id}>{g.codigo} - {g.materia?.nombre}</option>
            ))}
          </select>
        </div>
        <div className="col-auto">
          <select className="form-select" value={selectedExamen} onChange={(e) => setSelectedExamen(e.target.value)} disabled={examenes.length === 0}>
            <option value="">Seleccionar examen...</option>
            {examenes.map((e) => (
              <option key={e.id} value={e.id}>{e.nro} - {e.fecha ? new Date(e.fecha).toLocaleDateString() : ''}</option>
            ))}
          </select>
        </div>
      </div>

      {estudiantes.length > 0 && selectedExamen && (
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>CI</th>
                <th>Postulante</th>
                <th>Nota</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {estudiantes.map((post, i) => {
                const postId = post?.id || i;
                return (
                  <tr key={postId}>
                    <td>{post?.postulante?.persona?.ci || '-'}</td>
                    <td>{post?.postulante?.persona?.nombre || ''} {post?.postulante?.persona?.apellido || ''}</td>
                    <td style={{ width: 150 }}>
                      <input
                        type="number"
                        step="0.01"
                        className="form-control form-control-sm"
                        value={notas[postId] ?? ''}
                        onChange={(e) => handleNotaChange(postId, e.target.value)}
                        min="0"
                        max="100"
                      />
                    </td>
                    <td>
                      <button className="btn btn-sm btn-success" onClick={() => handleGuardarNota(postId)} disabled={loading}>
                        <i className="bi bi-check-lg"></i>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {selectedExamen && estudiantes.length === 0 && (
        <div className="alert alert-info">No hay estudiantes inscritos en este examen.</div>
      )}
    </div>
  );
}

// Muestra las notas del postulante logueado
function PostulanteNotas() {
  const user = useAuthStore((s) => s.user);
  const { getRindesByPostulacion } = useRindes();
  const [postulaciones, setPostulaciones] = useState([]); // Postulaciones del usuario
  const [notas, setNotas] = useState({});                 // Notas obtenidas
  const [loading, setLoading] = useState(true);           // Estado de carga

  // Obtiene las notas asociadas a la postulación del usuario al cargar el componente
  useEffect(() => {
    (async () => {
      try {
        const data = await getRindesByPostulacion(0);
        if (data?.postulacion) {
          setPostulaciones([data.postulacion]);
          setNotas(data.rindes || []);
        }
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [getRindesByPostulacion, user]);

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>;

  return (
    <div>
      <h4 className="mb-4">Mis Notas</h4>
      {notas.length === 0 ? (
        <div className="alert alert-info">No tienes notas registradas.</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Materia</th>
                <th>Examen</th>
                <th>Nota</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {notas.map((r) => (
                <tr key={r.id}>
                  <td>{r.examen?.grupo?.materia?.nombre || '-'}</td>
                  <td>{r.examen?.nro || '-'}</td>
                  <td><strong>{r.nota ?? '-'}</strong></td>
                  <td>
                    {r.nota >= 51
                      ? <span className="badge bg-success">Aprobado</span>
                      : <span className="badge bg-danger">Reprobado</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// Vista genérica para administradores — enlaces rápidos a secciones relacionadas
function AdminNotas() {
  const navigate = useNavigate();
  
  useEffect(() => {
    if (typeof navigate === 'function') return;
  }, [navigate]);

  return (
    <div>
      <h4 className="mb-4">Notas</h4>
      <p>Panel de administración de notas. Puede gestionar las notas desde las secciones:</p>
      <ul>
        <li><a href="/examenes">Gestionar Exámenes</a></li>
        <li><a href="/grupos">Ver Grupos</a></li>
        <li><a href="/reportes">Reportes de Admisión</a></li>
      </ul>
    </div>
  );
}
