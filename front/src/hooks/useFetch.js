import { useState, useEffect, useRef, useCallback } from 'react';
import cliente from '../api/cliente';

export default function useFetch(url, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  const execute = useCallback(async (overrideUrl, overrideOptions) => {
    if (abortRef.current) {
      abortRef.current.abort();
    }
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const finalUrl = overrideUrl || url;
      const result = await cliente.get(finalUrl);
      if (!controller.signal.aborted) {
        setData(result);
        setLoading(false);
      }
      return result;
    } catch (err) {
      if (!controller.signal.aborted) {
        setError(err.message);
        setLoading(false);
      }
      throw err;
    }
  }, [url]);

  useEffect(() => {
    if (url) {
      execute();
    }
    return () => {
      if (abortRef.current) {
        abortRef.current.abort();
      }
    };
  }, [url, execute]);

  return { data, loading, error, execute };
}
