import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { storage } from '../utils/storage';

interface AuthContextData {
    token: string | null;
    isLoggedIn: boolean;
    isLoading: boolean;
    login: (token: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        loadStorageData();
    }, []);

    const loadStorageData = async () => {
        try {
            const storedToken = await storage.getToken();
            if (storedToken) {
                setToken(storedToken);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (newToken: string) => {
        console.log(' TOKEN SAVED TO STORAGE:');
        console.log(newToken);
        await storage.setToken(newToken);
        setToken(newToken);
    };

    const logout = async () => {
        console.log('TOKEN DELETED FROM STORAGE');
        await storage.removeToken();
        setToken(null);
    };

    const value = {
        token,
        isLoggedIn: !!token,
        isLoading,
        login,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
