import { useEffect } from 'react';
import { Toaster } from 'sonner';
import useAuthStore from './store/authStore';
import AppRouter from './router/AppRouter';

function App() {
  const { token, user } = useAuthStore()
  const fetchUser = useAuthStore((s) => s.fetchUser);

  useEffect(() => {
    if (!user?.id && token) {
      fetchUser();
    }
  }, []);

  return (
    <>
      <Toaster
        position="top-right"
        richColors
        closeButton
        duration={4000}
      />
      <AppRouter />
    </>
  );
}

export default App;
