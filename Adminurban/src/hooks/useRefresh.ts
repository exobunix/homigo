import { useEffect } from 'react';

export const useRefresh = (callback: () => void) => {
    useEffect(() => {
        callback();
    }, []);
};
