import { useCallback, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';

export const useRefresh = (callback: () => void) => {
    const lastCallTime = useRef<number>(0);
    const DEBOUNCE_MS = 1000; // Prevent calls within 1 second

    useFocusEffect(
        useCallback(() => {
            const now = Date.now();
            if (now - lastCallTime.current > DEBOUNCE_MS) {
                lastCallTime.current = now;
                callback();
            }
        }, [callback])
    );
};
