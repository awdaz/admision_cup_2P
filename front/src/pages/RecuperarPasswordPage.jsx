import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import cliente from '../api/cliente'
import Alert from '../components/ui/Alert'

// Caso de Uso: CU03 — Recuperar Contraseña
// Página para solicitar recuperación de contraseña
// Ruta: "/recuperar-password" — Acceso: Público (sin autenticación)
// Envía un código de 6 dígitos al correo del usuario
export default function RecuperarPasswordPage () {
  const navigate = useNavigate()
  // Nombre de usuario ingresado
  const [username, setUsername] = useState('')
  // Estado de carga mientras se envía la solicitud
  const [loading, setLoading] = useState(false)
  // Mensaje de éxito para mostrar al usuario
  const [message, setMessage] = useState('')
  // Mensaje de error si la solicitud falla
  const [error, setError] = useState('')

  // Envía el username al backend; busca el email asociado y envía código de recuperación
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)
    try {
      const res = await cliente.post('/forgot-password', { username })
      navigate(`/restablecer-password?email=${encodeURIComponent(res.email)}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='min-vh-100 d-flex align-items-center justify-content-center login-bg'>
      <div className='card shadow' style={{ maxWidth: '420px', width: '100%' }}>
        <div className='card-body p-5'>
          <div className='text-center mb-4'>
            <i className='bi bi-shield-lock' style={{ fontSize: '3rem', color: 'var(--primary)' }} />
            <h3 className='mt-2'>Recuperar Contraseña</h3>
            <p className='text-muted'>Ingrese su nombre de usuario</p>
          </div>

          <Alert type='danger' message={error} />
          <Alert type='success' message={message} />

          <form onSubmit={handleSubmit}>
            <div className='mb-4'>
              <label className='form-label'>Nombre de Usuario</label>
              <div className='input-group'>
                <span className='input-group-text'><i className='bi bi-person' /></span>
                <input
                  type='text'
                  className='form-control'
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoFocus
                />
              </div>
            </div>

            <button type='submit' className='btn btn-primary w-100' disabled={loading}>
              {loading
                ? (
                  <>
                    <span className='spinner-border spinner-border-sm me-2' role='status' />
                    Enviando...
                  </>
                  )
                : 'Enviar Instrucciones'}
            </button>
          </form>

          <div className='text-center mt-3'>
            <Link to='/login' className='text-decoration-none'>
              <i className='bi bi-arrow-left me-1' />Volver al inicio de sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
