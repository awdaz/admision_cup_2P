import { create } from 'zustand'
import cliente from '../api/cliente'
import { ALMACENAMIENTO, str } from '../constants'

function loadUser () {
  try {
    const raw = localStorage.getItem(str(ALMACENAMIENTO.USUARIO))
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function saveUser (user) {
  if (user) {
    localStorage.setItem(str(ALMACENAMIENTO.USUARIO), JSON.stringify(user))
  } else {
    localStorage.removeItem(str(ALMACENAMIENTO.USUARIO))
  }
}

const useAuthStore = create((set, get) => ({
  user: loadUser(),
  token: localStorage.getItem(str(ALMACENAMIENTO.TOKEN)) || null,

  get isAuthenticated () {
    return !!get().token
  },

  login: async (username, password) => {
    const data = await cliente.post('/login', { username, password })
    localStorage.setItem(str(ALMACENAMIENTO.TOKEN), data?.token)
    saveUser(data?.user || null)
    set({ token: data?.token, user: data?.user || null })
    return data
  },

  logout: async () => {
    try {
      await cliente.post('/logout')
    } catch {
    }
    localStorage.removeItem(str(ALMACENAMIENTO.TOKEN))
    saveUser(null)
    set({ token: null, user: null })
  },

  fetchUser: async () => {
    try {
      const user = await cliente.get('/user')
      saveUser(user)
      set({ user })
    } catch {
      saveUser(null)
      localStorage.removeItem(str(ALMACENAMIENTO.TOKEN))
      set({ user: null, token: null })
    }
  },

  setUser: (user) => {
    saveUser(user)
    set({ user })
  },

  setToken: (token) => {
    localStorage.setItem(str(ALMACENAMIENTO.TOKEN), token)
    set({ token })
  }
}))

export default useAuthStore
