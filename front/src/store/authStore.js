// Store global de autenticación con Zustand — maneja user, token y sesión
import { create } from 'zustand';
import cliente from '../api/cliente';

// Recupera el usuario desde localStorage al iniciar la app
function loadUser() {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// Persiste o elimina el usuario en localStorage
function saveUser(user) {
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
  } else {
    localStorage.removeItem('user');
  }
}

const useAuthStore = create((set, get) => ({
  user: loadUser(),                           // Usuario autenticado (o null)
  token: localStorage.getItem('token') || null, // Token JWT almacenado

  // Getter computado que indica si hay sesión activa
  get isAuthenticated() {
    return !!get().token;
  },

  // Inicia sesión: envía credenciales, guarda token y usuario
  login: async (username, password) => {
    const data = await cliente.post('/login', { username, password });
    localStorage.setItem('token', data.token);
    saveUser(data.user || null);
    set({ token: data.token, user: data.user || null });
    return data;
  },

  // Cierra sesión: notifica al servidor y limpia el estado local
  logout: async () => {
    try {
      await cliente.post('/logout');
    } catch {
      // Ignora errores del servidor al cerrar sesión
    }
    localStorage.removeItem('token');
    saveUser(null);
    set({ token: null, user: null });
  },

  // Obtiene los datos actualizados del usuario desde el servidor
  fetchUser: async () => {
    try {
      const user = await cliente.get('/user');
      saveUser(user);
      set({ user });
    } catch {
      saveUser(null);
      localStorage.removeItem('token');
      set({ user: null, token: null });
    }
  },

  // Actualiza el usuario en el store y en localStorage
  setUser: (user) => {
    saveUser(user);
    set({ user });
  },

  // Actualiza el token en el store y en localStorage
  setToken: (token) => {
    localStorage.setItem('token', token);
    set({ token });
  },
}));

export default useAuthStore;
