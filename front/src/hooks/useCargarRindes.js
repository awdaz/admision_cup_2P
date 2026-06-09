import { useState, useEffect } from 'react'
import { toast } from 'sonner'

export default function useCargarRindes (examenId, getExamenRindes) {
  const [notas, setNotas] = useState({})
  const [rindesIds, setRindesIds] = useState({})
  const [postulacionesRindes, setPostulacionesRindes] = useState([])

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!examenId) return
      try {
        const exam = await getExamenRindes(examenId)
        if (cancelled || !exam) return
        const m1 = {}; const m2 = {}
        const posts = [];
        (exam.rindes || []).forEach((r) => {
          m1[r.postulacion_id] = r.nota
          m2[r.postulacion_id] = r.id
          if (r.postulacion) posts.push(r.postulacion)
        })
        if (!cancelled) { setNotas(m1); setRindesIds(m2); setPostulacionesRindes(posts) }
      } catch (err) { if (!cancelled) toast.error(err.message) }
    })()
    return () => { cancelled = true }
  }, [examenId, getExamenRindes])

  return { notas, setNotas, rindesIds, setRindesIds, postulacionesRindes, setPostulacionesRindes }
}
