import { create } from 'zustand';
import cliente from '../api/cliente';

const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('token') || null,

  get isAuthenticated() {
    return !!get().token;
  },

  login: async (username, password) => {
    const data = await cliente.post('/login', { username, password });
    localStorage.setItem('token', data.token);
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
    set({ token: null, user: null });
  },

  fetchUser: async () => {
    try {
      const user = await cliente.get('/user');
      set({ user });
    } catch {
      set({ user: null, token: null });
      localStorage.removeItem('token');
    }
  },

  setUser: (user) => set({ user }),

  setToken: (token) => {
    localStorage.setItem('token', token);
    set({ token });
  },
}));

export default useAuthStore;
