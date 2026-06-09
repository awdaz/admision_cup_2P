import { toast } from 'sonner'

export function confirmDialog (message, confirmLabel = 'Confirmar') {
  return new Promise((resolve) => {
    toast.info(message, {
      duration: Infinity,
      action: {
        label: confirmLabel,
        onClick: () => resolve(true)
      },
      cancel: {
        label: 'Cancelar',
        onClick: () => resolve(false)
      }
    })
  })
}
