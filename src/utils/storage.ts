import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'auth_token';

// SecureStore → for sensitive data (token)
export const storage = {
    setToken: async (token: string): Promise<boolean> => {
        try {
            await SecureStore.setItemAsync(TOKEN_KEY, token);
            return true;
        } catch (error) {
            console.error('Error saving token', error);
            return false;
        }
    },

    getToken: async (): Promise<string | null> => {
        try {
            return await SecureStore.getItemAsync(TOKEN_KEY);
        } catch (error) {
            console.error('Error getting token', error);
            return null;
        }
    },

    removeToken: async (): Promise<boolean> => {
        try {
            await SecureStore.deleteItemAsync(TOKEN_KEY);
            return true;
        } catch (error) {
            console.error('Error removing token', error);
            return false;
        }
    }
};

// AsyncStorage → for non-sensitive app data (bookmarks, preferences)
export const appStorage = {
    setItem: async (key: string, value: string): Promise<boolean> => {
        try {
            await AsyncStorage.setItem(key, value);
            return true;
        } catch (error) {
            console.error('Error saving data', error);
            return false;
        }
    },

    getItem: async (key: string): Promise<string | null> => {
        try {
            return await AsyncStorage.getItem(key);
        } catch (error) {
            console.error('Error getting data', error);
            return null;
        }
    },

    removeItem: async (key: string): Promise<boolean> => {
        try {
            await AsyncStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error removing data', error);
            return false;
        }
    }
};