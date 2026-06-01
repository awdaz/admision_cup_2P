// Cliente HTTP envoltorio de fetch con manejo de tokens, errores y sesión
const BASE_URL = '/api';

// Obtiene el token JWT desde localStorage
function getToken() {
  return localStorage.getItem('token');
}

// Petición HTTP genérica con manejo de autenticación y errores
async function request(url, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Adjunta el token de autorización si existe
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${BASE_URL}${url}`, {
      ...options,
      headers,
    });

    // Si el servidor responde 401, la sesión expiró — redirige al login
    if (response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
      throw new Error('Sesión expirada');
    }

    // Si la respuesta no es exitosa, extrae el mensaje de error del cuerpo
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.detail || `Error ${response.status}`);
    }

    // Parsea el cuerpo de la respuesta como JSON (puede estar vacío)
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  } catch (error) {
    // Re-lanza errores conocidos y envuelve errores de red
    if (error.message === 'Sesión expirada') throw error;
    if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
      throw new Error('Error de conexión con el servidor');
    }
    throw error;
  }
}

// Objeto con métodos shorthand para GET, POST, PUT y DELETE
const cliente = {
  get: (url) => request(url, { method: 'GET' }),
  post: (url, data) => request(url, { method: 'POST', body: JSON.stringify(data) }),
  put: (url, data) => request(url, { method: 'PUT', body: JSON.stringify(data) }),
  del: (url) => request(url, { method: 'DELETE' }),
};

export default cliente;
