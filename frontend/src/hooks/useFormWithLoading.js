// src/hooks/useFormWithLoading.js
import { useState } from 'react';

export function useFormWithLoading() {
    const [loading, setLoading] = useState(false);

    // async wrapper
    const wrap = async (fn) => {
        setLoading(true);
        try {
            await fn();
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        setLoading, // если нужно вручную
        wrap,       // async wrapper
    };
}
