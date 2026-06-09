// Página de formulario para crear o editar un usuario
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import cliente from '../../api/cliente';
import Loader from '../../components/ui/Loader';
import FormPageLayout from '../../components/ui/FormPageLayout';
import SubmitButton from '../../components/ui/SubmitButton';
import CancelButton from '../../components/ui/CancelButton';

export default function UserFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();    // Si hay id en la URL, estamos en modo edición
  const isEdit = Boolean(id);    // Bandera que indica si se edita o crea un usuario

  // Estado del formulario con valores por defecto
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    tipo: 'postulante',
    persona_id: '',
    activo: true,
  });

  const [personas, setPersonas] = useState([]);       // Lista de personas disponibles (sin usar actualmente)
  const [searchPersona, setSearchPersona] = useState(''); // Término para buscar persona por CI
  const [loading, setLoading] = useState(false);       // Estado del envío del formulario
  const [pageLoading, setPageLoading] = useState(isEdit); // Carga inicial en modo edición

  // En modo edición, carga los datos del usuario existente al montar el componente
  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        const data = await cliente.get(`/users/${id}`);
        const user = data.user || data;
        setForm({
          username: user.username || '',
          email: user.email || '',
          password: '',
          tipo: user.tipo || 'postulante',
          persona_id: user.persona_id || '',
          activo: user.activo ?? true,
        });
      } catch (err) {
        toast.error(err.message);
      } finally {
        setPageLoading(false);
      }
    })();
  }, [id, isEdit]);

  // Busca una persona por CI y asigna su ID al formulario
  const handleBuscarPersona = async () => {
    if (!searchPersona.trim()) return;
    try {
      const data = await cliente.get(`/postulantes/buscar/${searchPersona.trim()}`);
      const p = data.postulante || data.persona || data;
      if (p && p.persona) {
        setForm((prev) => ({ ...prev, persona_id: p.persona.id }));
        toast.success(`Persona encontrada: ${p.persona.nombre} ${p.persona.apellido}`);
      } else if (p && p.id && p.nombre) {
        setForm((prev) => ({ ...prev, persona_id: p.id }));
        toast.success(`Persona encontrada: ${p.nombre} ${p.apellido}`);
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Actualiza el campo del formulario que disparó el evento
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  // Envía el formulario: crea o actualiza el usuario según isEdit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit) {
        await cliente.put(`/users/${id}`, form);
        if (form.password) {
          await cliente.put(`/users/${id}/change-password`, { password: form.password });
        }
        toast.success('Usuario actualizado correctamente');
      } else {
        await cliente.post('/users', form);
        toast.success('Usuario creado correctamente');
      }
      navigate('/usuarios');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) return <Loader />;

  return (
    <FormPageLayout>
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Usuario</label>
                  <input name="username" className="form-control" value={form.username} onChange={handleChange} required maxLength={50} />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Email</label>
                  <input name="email" type="email" className="form-control" value={form.email} onChange={handleChange} required maxLength={200} />
                </div>

                <div className="col-md-6">
                  <label className="form-label">{isEdit ? 'Nueva Contraseña (dejar vacío para mantener)' : 'Contraseña'}</label>
                  <input name="password" type="password" className="form-control" value={form.password} onChange={handleChange} minLength={6} />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Rol</label>
                  <select name="tipo" className="form-select" value={form.tipo} onChange={handleChange} required>
                    <option value="admin">Administrador</option>
                    <option value="docente">Docente</option>
                    <option value="postulante">Postulante</option>
                  </select>
                </div>

                {!isEdit && (
                  <>
                    <div className="col-12">
                      <label className="form-label">Persona Asociada</label>
                      <div className="input-group">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Buscar por CI"
                          value={searchPersona}
                          onChange={(e) => setSearchPersona(e.target.value)}
                        />
                        <button type="button" className="btn btn-outline-secondary" onClick={handleBuscarPersona}>
                          <i className="bi bi-search"></i>
                        </button>
                      </div>
                      {form.persona_id && <small className="text-success">Persona ID: {form.persona_id}</small>}
                    </div>
                  </>
                )}

                {isEdit && (
                  <div className="col-12">
                    <div className="form-check">
                      <input name="activo" type="checkbox" className="form-check-input" checked={form.activo} onChange={handleChange} id="chkActivo" />
                      <label className="form-check-label" htmlFor="chkActivo">Cuenta activa</label>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 d-flex gap-2">
                <SubmitButton loading={loading} label={isEdit ? 'Actualizar Usuario' : 'Crear Usuario'} />
                <CancelButton to="/usuarios" />
              </div>
            </form>
    </FormPageLayout>
  );
}
