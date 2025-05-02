// src/hooks/useApi.js
import axios from 'axios';
import { useNotifier } from './useNotifier';

function parseError(err) {
    const error = err?.response?.data?.error;
    if (typeof error === 'string') return error;
    if (typeof error === 'object') return error.message || JSON.stringify(error);
    return err.message || 'Неизвестная ошибка';
}

export function useApi() {
    const { show } = useNotifier();

    const handle = async (promise, onSuccess, customErrorMessage) => {
        try {
            const res = await promise;
            if (onSuccess) onSuccess(res);
            return res.data;
        } catch (err) {
            const msg = parseError(err);
            show(customErrorMessage || `Ошибка: ${msg}`, 'error');
            throw err; // можно не бросать, если не нужно обрабатывать
        }
    };

    return {
        get: (url, onSuccess, msg) => handle(axios.get(url), onSuccess, msg),
        post: (url, data, onSuccess, msg) => handle(axios.post(url, data), onSuccess, msg),
        put: (url, data, onSuccess, msg) => handle(axios.put(url, data), onSuccess, msg),
        del: (url, onSuccess, msg) => handle(axios.delete(url), onSuccess, msg),
    };
}
