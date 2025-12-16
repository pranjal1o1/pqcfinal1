// ========================================
// src/hooks/usePolling.js
// ========================================
import { useEffect, useRef, useState } from 'react';

export const usePolling = (callback, interval = 3000, enabled = true) => {
    const [isPolling, setIsPolling] = useState(enabled);
    const savedCallback = useRef();

    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    useEffect(() => {
        if (!isPolling) return;

        const tick = () => {
            savedCallback.current();
        };

        const id = setInterval(tick, interval);
        return () => clearInterval(id);
    }, [interval, isPolling]);

    return {
        isPolling,
        startPolling: () => setIsPolling(true),
        stopPolling: () => setIsPolling(false),
    };
};