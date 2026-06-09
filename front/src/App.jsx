import { useEffect } from 'react'
import { Toaster } from 'sonner'
import useAuthStore from './store/authStore'
import AppRouter from './router/AppRouter'

function App () {
  const { token, user, fetchUser } = useAuthStore()

  useEffect(() => {
    if (!user?.id && token) {
      fetchUser()
    }
  }, [token, user?.id, fetchUser])

  return (
    <>
      <Toaster
        position='bottom-right'
        richColors
        closeButton
        duration={4000}
      />
      <AppRouter />
    </>
  )
}

export default App
