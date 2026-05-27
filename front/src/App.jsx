import { useEffect } from 'react';
import useAuthStore from './store/authStore';
import AppRouter from './router/AppRouter';

function App() {
  const token = useAuthStore((s) => s.token);
  const fetchUser = useAuthStore((s) => s.fetchUser);

  useEffect(() => {
    if (token) {
      fetchUser();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return <AppRouter />;
}

export default App;
