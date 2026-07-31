import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

interface AuthContextType {
    admin: any;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    updateAdmin: (updatedData: any) => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkLogin();
    }, []);

    const checkLogin = async () => {
        try {
            const token = await AsyncStorage.getItem('adminToken');
            if (token) {
                const response = await api.getProfile();
                if (response.success) {
                    setAdmin(response.data);
                } else {
                    await AsyncStorage.removeItem('adminToken');
                }
            }
        } catch (error) {
            console.error('Check login error:', error);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        const response = await api.login(email, password);
        if (response.success) {
            await AsyncStorage.setItem('adminToken', response.data.token);
            setAdmin(response.data);
        } else {
            throw new Error(response.message);
        }
    };

    const logout = async () => {
        await AsyncStorage.removeItem('adminToken');
        setAdmin(null);
    };

    const updateAdmin = (updatedData: any) => {
        setAdmin(updatedData);
    };

    return (
        <AuthContext.Provider value={{ admin, loading, login, logout, updateAdmin }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
