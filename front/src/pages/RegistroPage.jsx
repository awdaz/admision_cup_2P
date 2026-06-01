import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import cliente from '../api/cliente';

// Página de registro de nuevo postulante
// Ruta: "/registro" — Acceso: Público (cualquier persona)
// Formulario completo con datos personales y de acceso; al enviar llama a POST /register
export default function RegistroPage() {
  const navigate = useNavigate();
  // Objeto que agrupa todos los campos del formulario de registro
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
    username: '',
    password: '',
    password_confirmation: '',
  });
  // Indica si el formulario se está enviando al servidor
  const [submitting, setSubmitting] = useState(false);

  // Actualiza el campo correspondiente del formulario según el name del input
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Envía los datos del formulario al endpoint /register; valida que las contraseñas coincidan
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.password_confirmation) {
      toast.error('Las contraseñas no coinciden.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ci: form.ci,
        nombre: form.nombre,
        apellido: form.apellido,
        fecha_nac: form.fecha_nac,
        sexo: form.sexo,
        email: form.email,
        telefono: form.telefono,
        direccion: form.direccion,
        ciudad: form.ciudad,
        colegio_procedencia: form.colegio_procedencia,
        username: form.username,
        password: form.password,
      };

      await cliente.post('/register', payload);
      toast.success('Registro exitoso. Ahora puedes iniciar sesión.');
      navigate('/login');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-vh-100 py-4" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div className="container">
        <div className="text-center mb-4">
          <Link to="/" className="text-white text-decoration-none">
            <i className="bi bi-arrow-left me-1"></i>Volver al inicio
          </Link>
        </div>

        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card shadow">
              <div className="card-body p-4">
                <div className="text-center mb-4">
                  <i className="bi bi-person-plus text-primary" style={{ fontSize: '3rem' }}></i>
                  <h3 className="mt-2">Registro de Postulante</h3>
                  <p className="text-muted">Complete sus datos para crear una cuenta</p>
                </div>

                <form onSubmit={handleSubmit}>
                  {/* Sección de datos personales: CI, nombre, apellido, fecha nac., sexo, email, teléfono, ciudad, colegio, dirección */}
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
                      <input name="fecha_nac" type="date" className="form-control" value={form.fecha_nac} onChange={handleChange} required />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Sexo</label>
                      <select name="sexo" className="form-select" value={form.sexo} onChange={handleChange} required>
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
                    <div className="col-md-4">
                      <label className="form-label">Colegio Procedencia</label>
                      <input name="colegio_procedencia" className="form-control" value={form.colegio_procedencia} onChange={handleChange} />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Dirección</label>
                      <textarea name="direccion" className="form-control" rows="2" value={form.direccion} onChange={handleChange}></textarea>
                    </div>
                  </div>

                  {/* Sección de datos de acceso: username, contraseña y confirmación */}
                  <hr className="my-4" />
                  <h6 className="text-muted mb-3">Datos de Acceso</h6>
                  <div className="row g-3">
                    <div className="col-md-4">
                      <label className="form-label">Usuario</label>
                      <input name="username" className="form-control" value={form.username} onChange={handleChange} required />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Contraseña</label>
                      <input name="password" type="password" className="form-control" value={form.password} onChange={handleChange} required minLength="6" />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Confirmar Contraseña</label>
                      <input name="password_confirmation" type="password" className="form-control" value={form.password_confirmation} onChange={handleChange} required />
                    </div>
                  </div>

                  <div className="mt-4 d-flex gap-2">
                    <button type="submit" className="btn btn-primary px-4" disabled={submitting}>
                      {submitting ? (
                        <><span className="spinner-border spinner-border-sm me-2"></span>Registrando...</>
                      ) : (
                        <><i className="bi bi-check-lg me-1"></i>Registrarse</>
                      )}
                    </button>
                    <Link to="/login" className="btn btn-outline-secondary">
                      Ya tengo cuenta
                    </Link>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
