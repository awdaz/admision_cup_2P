import { useState, useEffect, useCallback, useRef } from 'react'
import { toast } from 'sonner'

export default function useList (fetchFn, watchParams = []) {
  const [items, setItems] = useState([])
  const [pagination, setPagination] = useState(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const fetchFnRef = useRef(fetchFn)
  useEffect(() => { fetchFnRef.current = fetchFn })

  const load = useCallback(async (p, ...extra) => {
    setLoading(true)
    try {
      const data = await fetchFnRef.current(p, ...extra)
      setItems(data.data ?? [])
      setPagination(data)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const watchKey = JSON.stringify(watchParams)

  useEffect(() => {
    load(page, ...watchParams)
  }, [page, watchKey, load])

  return { items, pagination, page, setPage, loading, load, setItems }
}
