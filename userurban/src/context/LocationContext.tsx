import React, { createContext, useState, useContext } from 'react';

export interface Address {
    id: string;
    type: string; // 'Home', 'Office', etc.
    address: string;
    city: string;
    isDefault: boolean;
    coordinates?: {
        latitude: number;
        longitude: number;
    };
}

interface LocationContextType {
    location: string;
    setLocation: (location: string) => void;
    fullAddress: string;
    setFullAddress: (address: string) => void;
    city: string;
    setCity: (city: string) => void;
    addresses: Address[];
    addAddress: (address: Address) => void;
    removeAddress: (id: string) => void;
    updateAddress: (id: string, updatedAddress: Partial<Address>) => void;
    selectAddress: (id: string) => void;
    refreshUserData: () => Promise<void>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [location, setLocation] = useState('New Delhi, India');
    const [fullAddress, setFullAddress] = useState('New Delhi, India');
    const [city, setCity] = useState('New Delhi');
    const [addresses, setAddresses] = useState<Address[]>([]);

    React.useEffect(() => {
        const loadUserData = async () => {
            try {
                const { api } = require('../services/api');
                // We might not have a token yet if this runs too early, but api.getProfile handles it?
                // Actually, we should probably wait or retry?
                // For now, let's try to fetch. If 401, it's fine.
                // But better: AppNavigator calls checkAuth. checkAuth sets token.
                // If we run this after checkAuth, it works.
                // Since LocationProvider is likely wrapping AppNavigator, it mounts FIRST.
                // So this useEffect runs FIRST. checkAuth hasn't run yet.
                // So this will fail 401.

                // We need a way to trigger this load.
                // Let's export a function from Context to load data?
                // Or just rely on the fact that when user logs in, they might go to a screen that fetches?
                // But the user wants "data already in database used that".
                // This implies global state (LocationContext) should be populated.

                // Let's add a `refreshUserData` function to the context and call it from AppNavigator?
            } catch (e) {
                console.log('Error loading user data', e);
            }
        };
        // loadUserData(); 
    }, []);

    const refreshUserData = async () => {
        try {
            const { api } = require('../services/api');
            const response = await api.getProfile();
            if (response.success && response.data) {
                const user = response.data;
                if (user.savedAddresses && user.savedAddresses.length > 0) {
                    setAddresses(user.savedAddresses);
                    const defaultAddr = user.savedAddresses.find((a: any) => a.isDefault) || user.savedAddresses[0];
                    if (defaultAddr) {
                        setCity(defaultAddr.city);
                        setFullAddress(defaultAddr.address);
                        setLocation(defaultAddr.city);
                    }
                }
            }
        } catch (error) {
            console.log('Error refreshing user data:', error);
        }
    };

    const addAddress = (newAddress: Address) => {
        // ... existing code
        setAddresses((prev) => {
            // ... existing code
            const exists = prev.some(a => a.id === newAddress.id);
            if (exists) {
                return prev.map(a => {
                    if (a.id === newAddress.id) {
                        return { ...newAddress, isDefault: newAddress.isDefault };
                    }
                    return newAddress.isDefault ? { ...a, isDefault: false } : a;
                });
            }
            const updated = newAddress.isDefault
                ? prev.map(a => ({ ...a, isDefault: false }))
                : prev;
            return [...updated, newAddress];
        });
    };

    const removeAddress = (id: string) => {
        setAddresses((prev) => prev.filter((a) => a.id !== id));
    };

    const updateAddress = (id: string, updatedAddress: Partial<Address>) => {
        setAddresses((prev) => prev.map((a) => a.id === id ? { ...a, ...updatedAddress } : a));
    };

    const selectAddress = (id: string) => {
        setAddresses((prev) => prev.map((a) => ({
            ...a,
            isDefault: a.id === id
        })));

        const selected = addresses.find(a => a.id === id);
        if (selected) {
            setLocation(selected.city); // Or format it nicely
            setFullAddress(selected.address);
            setCity(selected.city);
        }
    };

    return (
        <LocationContext.Provider value={{
            location, setLocation,
            fullAddress, setFullAddress,
            city, setCity,
            addresses, addAddress, removeAddress, updateAddress, selectAddress,
            refreshUserData
        }}>
            {children}
        </LocationContext.Provider>
    );
};

export const useLocation = () => {
    const context = useContext(LocationContext);
    if (!context) {
        throw new Error('useLocation must be used within a LocationProvider');
    }
    return context;
};
