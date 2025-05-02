import { useApi } from './useApi';
import { useCallback } from 'react';

export function usePurchasesData() {
    const api = useApi();

    const load = useCallback(async () => {
        const [rawMaterials, employees, purchases] = await Promise.all([
            api.get('/api/raw-materials'),
            api.get('/api/employees'),
            api.get('/api/purchases'),
        ]);

        return { rawMaterials, employees, purchases };
    }, [api]);

    return { load };
}
