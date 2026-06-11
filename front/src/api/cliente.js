import { CABECERA_HTTP, ALMACENAMIENTO, ERROR_API, str } from '../constants'

const BASE_URL = '/api'

function getToken () {
  return localStorage.getItem(str(ALMACENAMIENTO.TOKEN))
}

async function request (url, options = {}) {
  const token = getToken()
  const headers = {
    [str(CABECERA_HTTP.CONTENT_TYPE)]: str(CABECERA_HTTP.JSON),
    ...options.headers
  }

  if (token) {
    headers[str(CABECERA_HTTP.AUTHORIZATION)] = `${str(CABECERA_HTTP.BEARER)} ${token}`
  }

  try {
    const response = await fetch(`${BASE_URL}${url}`, {
      ...options,
      headers
    })

    if (response.status === 401) {
      localStorage.removeItem(str(ALMACENAMIENTO.TOKEN))
      window.location.href = '/login'
      throw new Error(str(ERROR_API.SESION_EXPIRADA))
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || errorData.detail || `Error ${response.status}`)
    }

    const text = await response.text()
    return text ? JSON.parse(text) : null
  } catch (error) {
    if (error.message === str(ERROR_API.SESION_EXPIRADA)) throw error
    if (
      error.name === str(ERROR_API.TYPE_ERROR) &&
      error.message === str(ERROR_API.FETCH_FALLIDO)
    ) {
      throw new Error('Error de conexión con el servidor', { cause: error })
    }
    throw new Error(error.message, { cause: error })
  }
}

// Objeto con métodos shorthand para GET, POST, PUT y DELETE
const cliente = {
  get: (url) => request(url, { method: 'GET' }),
  post: (url, data) => request(url, { method: 'POST', body: JSON.stringify(data) }),
  put: (url, data) => request(url, { method: 'PUT', body: JSON.stringify(data) }),
  del: (url) => request(url, { method: 'DELETE' })
}

export default cliente
