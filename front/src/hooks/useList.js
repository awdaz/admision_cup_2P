import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

export default function useList(fetchFn, watchParams = []) {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async (p, ...extra) => {
    setLoading(true);
    try {
      const data = await fetchFn(p, ...extra);
      setItems(data.data ?? []);
      setPagination(data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [fetchFn]);

  useEffect(() => {
    load(page, ...watchParams);
  }, [page, ...watchParams, load]);

  return { items, pagination, page, setPage, loading, load, setItems };
}
