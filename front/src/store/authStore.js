import { create } from 'zustand';
import cliente from '../api/cliente';

function loadUser() {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveUser(user) {
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
  } else {
    localStorage.removeItem('user');
  }
}

const useAuthStore = create((set, get) => ({
  user: loadUser(),
  token: localStorage.getItem('token') || null,

  get isAuthenticated() {
    return !!get().token;
  },

  login: async (username, password) => {
    const data = await cliente.post('/login', { username, password });
    localStorage.setItem('token', data.token);
    saveUser(data.user || null);
    set({ token: data.token, user: data.user || null });
    return data;
  },

  logout: async () => {
    try {
      await cliente.post('/logout');
    } catch {
      // ignore logout errors
    }
    localStorage.removeItem('token');
    saveUser(null);
    set({ token: null, user: null });
  },

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

  setUser: (user) => {
    saveUser(user);
    set({ user });
  },

  setToken: (token) => {
    localStorage.setItem('token', token);
    set({ token });
  },
}));

export default useAuthStore;
