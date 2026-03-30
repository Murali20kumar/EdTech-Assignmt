import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ScrollView,
    Alert,
    ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../src/context/AuthContext';
import api from '@/src/services/api';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

export default function ProfileScreen() {
    const router = useRouter();
    const { logout } = useAuth();

    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState({ 
        username: 'Learner', 
        email: '...', 
        avatar: 'https://ui-avatars.com/api/?name=AI+Learner&background=7c3aed&color=fff' 
    });
    const [stats, setStats] = useState({ enrolled: 1, completed: 0, bookmarks: 0 });

    useEffect(() => {
        loadUserData();
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadUserData();
        }, [])
    );

    const loadUserData = async () => {
        try {
            const storedBookmarks = await AsyncStorage.getItem('bookmarks');
            const bookmarksArray = storedBookmarks ? JSON.parse(storedBookmarks) : [];
            setStats(prev => ({ ...prev, bookmarks: bookmarksArray.length }));
        } catch (e) {
            console.error('Local bookmark load failed:', e);
        }

        try {
            const userResponse = await api.get('/users/current-user');
            const currentUser = userResponse.data.data;

            let formattedName = currentUser.username || 'Learner';
            if (formattedName.includes('@')) {
                formattedName = formattedName.split('@')[0];
            }
            formattedName = formattedName.charAt(0).toUpperCase() + formattedName.slice(1);

            setUser({
                username: formattedName,
                email: currentUser.email,
                avatar: currentUser.avatar?.url || `https://ui-avatars.com/api/?name=${formattedName}&background=7c3aed&color=fff`
            });
        } catch (e: any) {
            console.error('Profile API fetch failed:', e.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdatePicture = () => {
        Alert.alert(
            'Update Picture',
            'In a real app, this would open your camera roll to select a new avatar image!'
        );
    };

    const handleLogout = async () => {
        await logout();
        router.replace('/auth/login');
    };

    const handleResetData = async () => {
        Alert.alert(
            'Reset App Data',
            'This will clear all bookmarks and achievements. Are you sure?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Reset',
                    style: 'destructive',
                    onPress: async () => {
                        await AsyncStorage.removeItem('bookmarks');
                        await AsyncStorage.setItem('alert_fired', 'false');
                        loadUserData();
                        Alert.alert('Success', 'Local app data has been cleared!');
                    }
                }
            ]
        );
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#7c3aed" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#111" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Profile</Text>
                <TouchableOpacity onPress={handleLogout} style={styles.logoutIcon}>
                    <MaterialCommunityIcons name="logout" size={24} color="#ef4444" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.profileCard}>
                    <View style={styles.avatarContainer}>
                        <Image source={{ uri: user.avatar }} style={styles.avatar} />
                        <TouchableOpacity style={styles.editAvatarBtn} onPress={handleUpdatePicture}>
                            <MaterialCommunityIcons name="camera-plus" size={16} color="#fff" />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.name}>{user.username}</Text>
                    <Text style={styles.email}>{user.email}</Text>
                </View>

                <Text style={styles.sectionTitle}>LEARNING STATISTICS</Text>
                <View style={styles.statsContainer}>
                    <View style={styles.statBox}>
                        <Text style={styles.statNumber}>{stats.enrolled}</Text>
                        <Text style={styles.statLabel}>Enrolled</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statBox}>
                        <Text style={styles.statNumber}>{stats.completed}</Text>
                        <Text style={styles.statLabel}>Completed</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statBox}>
                        <Text style={styles.statNumber}>{stats.bookmarks}</Text>
                        <Text style={styles.statLabel}>Bookmarks</Text>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>SETTINGS</Text>
                <TouchableOpacity style={styles.settingRow}>
                    <MaterialCommunityIcons name="bell-outline" size={24} color="#7c3aed" />
                    <Text style={styles.settingText}>Notifications</Text>
                    <MaterialCommunityIcons name="chevron-right" size={24} color="#ccc" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.settingRow}>
                    <MaterialCommunityIcons name="shield-lock-outline" size={24} color="#7c3aed" />
                    <Text style={styles.settingText}>Privacy & Security</Text>
                    <MaterialCommunityIcons name="chevron-right" size={24} color="#ccc" />
                </TouchableOpacity>

                <TouchableOpacity 
                    style={[styles.settingRow, { borderColor: '#fee2e2', backgroundColor: '#fff', marginTop: 20 }]} 
                    onPress={handleResetData}
                >
                    <MaterialCommunityIcons name="refresh" size={24} color="#ef4444" />
                    <Text style={[styles.settingText, { color: '#ef4444' }]}>Reset App Data</Text>
                    <MaterialCommunityIcons name="chevron-right" size={24} color="#fee2e2" />
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f7f5ff' },
    loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f7f5ff' },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        paddingTop: 40,
        backgroundColor: '#f7f5ff'
    },
    backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
    headerTitle: { fontSize: 20, fontWeight: '800', color: '#1e0a4a' },
    logoutIcon: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fef2f2', borderRadius: 20 },

    content: { padding: 24, paddingBottom: 60 },

    profileCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        shadowColor: '#7c3aed',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
        marginBottom: 32
    },
    avatarContainer: { position: 'relative', marginBottom: 16 },
    avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#ede9ff' },
    editAvatarBtn: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#7c3aed',
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#fff',
    },
    name: { fontSize: 24, fontWeight: '800', color: '#1e0a4a', marginBottom: 4 },
    email: { fontSize: 14, color: '#9ca3af', marginBottom: 4 },

    sectionTitle: { fontSize: 12, fontWeight: '800', color: '#b0a8d0', letterSpacing: 1.5, marginBottom: 16 },

    statsContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 16,
        paddingVertical: 20,
        marginBottom: 32,
        shadowColor: '#7c3aed',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
        elevation: 2,
    },
    statBox: { flex: 1, alignItems: 'center' },
    statNumber: { fontSize: 24, fontWeight: '900', color: '#1e0a4a', marginBottom: 4 },
    statLabel: { fontSize: 11, color: '#9ca3af', fontWeight: '600', textTransform: 'uppercase' },
    statDivider: { width: 1, backgroundColor: '#ede9ff', marginVertical: 8 },

    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1.5,
        borderColor: '#ede9ff'
    },
    settingText: { flex: 1, fontSize: 16, fontWeight: '600', color: '#1e0a4a', marginLeft: 16 },
});
