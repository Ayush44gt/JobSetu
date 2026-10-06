import api, { getErrorMessage } from '@/lib/api'
import { useCallback, useEffect, useState } from 'react'

// loads `url` (with optional query params) and exposes data, loading, error and a refetch
const useFetch = (url, params) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(Boolean(url));
    const [error, setError] = useState("");
    const [reloadKey, setReloadKey] = useState(0);
    const paramsKey = JSON.stringify(params || {});

    useEffect(() => {
        if (!url) return;
        let ignore = false;
        const fetchData = async () => {
            setLoading(true);
            setError("");
            try {
                const res = await api.get(url, { params: JSON.parse(paramsKey) });
                if (!ignore) setData(res.data);
            } catch (err) {
                if (!ignore) setError(getErrorMessage(err));
            } finally {
                if (!ignore) setLoading(false);
            }
        }
        fetchData();
        return () => { ignore = true; }
    }, [url, paramsKey, reloadKey]);

    const refetch = useCallback(() => setReloadKey((key) => key + 1), []);

    return { data, setData, loading, error, refetch };
}

export default useFetch
