import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    ScrollView,
    StatusBar,
    Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../src/context/AuthContext';
import api from '@/src/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

function StatCard({
    icon,
    label,
    value,
}: {
    icon: string;
    label: string;
    value: string;
}) {
    return (
        <View style={styles.statCard}>
            <MaterialCommunityIcons name={icon as any} size={22} color="#7c3aed" />
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statLabel}>{label}</Text>
        </View>
    );
}

function ActionCard({
    icon,
    label,
    sublabel,
    onPress,
}: {
    icon: string;
    label: string;
    sublabel: string;
    onPress: () => void;
}) {
    return (
        <TouchableOpacity style={styles.actionCard} onPress={onPress} activeOpacity={0.7}>
            <View style={styles.actionIconBox}>
                <MaterialCommunityIcons name={icon as any} size={22} color="#7c3aed" />
            </View>
            <View style={{ flex: 1 }}>
                <Text style={styles.actionLabel}>{label}</Text>
                <Text style={styles.actionSublabel}>{sublabel}</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#c4b5fd" />
        </TouchableOpacity>
    );
}

export default function HomeScreen() {
    const router = useRouter();
    const { logout, token } = useAuth();
    const [displayName, setDisplayName] = useState('Learner');
    const [counts, setCounts] = useState({ enrolled: 0, bookmarks: 0, completed: 0 });

    useFocusEffect(
        useCallback(() => {
            const loadStats = async () => {
                try {
                    const storedBookmarks = await AsyncStorage.getItem('bookmarks');
                    if (storedBookmarks) {
                        const bookmarksArray = JSON.parse(storedBookmarks);
                        setCounts(prev => ({ ...prev, bookmarks: bookmarksArray.length }));
                    }
                } catch (e) {
                    console.error('Failed to load home stats', e);
                }
            };
            loadStats();
        }, [])
    );

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userResponse = await api.get('/users/current-user');
                const userData = userResponse.data.data;

                let name = userData.username || 'Learner';
                if (name.includes('@')) {
                    name = name.split('@')[0];
                }
                name = name.charAt(0).toUpperCase() + name.slice(1);

                setDisplayName(name);
            } catch (error) {
                console.error('Failed to load user name', error);
            }
        };

        fetchUserData();
    }, []);

    const handleLogout = async () => {
        await logout();
        router.replace('/auth/login');
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#f7f5ff" />

            <View style={styles.accentTopRight} />
            <View style={styles.accentBottomLeft} />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.header}>
                    <View>
                        <Text style={styles.headerGreeting}>Good morning,</Text>
                        <Text style={styles.headerName}>{displayName} 👋</Text>
                    </View>
                    <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                        <MaterialCommunityIcons name="logout" size={20} color="#7c3aed" />
                    </TouchableOpacity>
                </View>

                <LinearGradient
                    colors={['#3b1fa3', '#7c3aed']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.heroBanner}
                >
                    <View style={styles.heroTextBlock}>
                        <Text style={styles.heroEyebrow}>CONTINUE LEARNING</Text>
                        <Text style={styles.heroTitle}>AI Fundamentals</Text>
                        <Text style={styles.heroSubtitle}>Welcome back, Scholar! 🎓</Text>
                    </View>
                    <View style={styles.heroIconBox}>
                        <MaterialCommunityIcons
                            name="play-circle-outline"
                            size={56}
                            color="rgba(255,255,255,0.25)"
                        />
                    </View>
                    <View style={styles.progressBarTrack}>
                        <View style={[styles.progressBarFill, { width: '40%' }]} />
                    </View>
                    <Text style={styles.progressLabel}>40% complete</Text>
                </LinearGradient>

                <View style={styles.statsRow}>
                    <StatCard icon="book-open-outline" label="Enrolled" value={counts.enrolled.toString()} />
                    <View style={styles.statDivider} />
                    <StatCard icon="bookmark-outline" label="Bookmarks" value={counts.bookmarks.toString()} />
                    <View style={styles.statDivider} />
                    <StatCard icon="check-circle-outline" label="Completed" value={counts.completed.toString()} />
                </View>

                <Text style={styles.sectionTitle}>EXPLORE</Text>

                <ActionCard
                    icon="book-multiple-outline"
                    label="Browse Courses"
                    sublabel="Discover AI learning paths"
                    onPress={() => router.push('/courses')}
                />
                <ActionCard
                    icon="bookmark-multiple-outline"
                    label="My Bookmarks"
                    sublabel="Courses you saved"
                    onPress={() => router.push('/(tabs)/explore')}
                />
                <ActionCard
                    icon="account-outline"
                    label="My Profile"
                    sublabel="View and edit your info"
                    onPress={() => router.push('/profile')}
                />

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f7f5ff',
        paddingTop: Platform.OS === 'android' ? 40 : 0,
    },

    // Soft purple tinted accents
    accentTopRight: {
        position: 'absolute',
        top: -60,
        right: -60,
        width: 220,
        height: 220,
        borderRadius: 110,
        backgroundColor: '#7c3aed',
        opacity: 0.06,
    },
    accentBottomLeft: {
        position: 'absolute',
        bottom: -50,
        left: -50,
        width: 180,
        height: 180,
        borderRadius: 90,
        backgroundColor: '#a78bfa',
        opacity: 0.07,
    },

    scrollContent: {
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 40,
    },

    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 28,
    },
    headerGreeting: {
        color: '#9ca3af',
        fontSize: 14,
        fontWeight: '500',
        letterSpacing: 0.3,
    },
    headerName: {
        color: '#1e0a4a',
        fontSize: 26,
        fontWeight: '900',
        letterSpacing: -0.5,
        marginTop: 2,
    },
    logoutBtn: {
        width: 44,
        height: 44,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: '#e8e0ff',
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#7c3aed',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 2,
    },

    heroBanner: {
        borderRadius: 20,
        padding: 24,
        marginBottom: 20,
        overflow: 'hidden',
        shadowColor: '#7c3aed',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    },
    heroTextBlock: {
        marginBottom: 20,
    },
    heroEyebrow: {
        color: 'rgba(255,255,255,0.55)',
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 2,
        marginBottom: 8,
    },
    heroTitle: {
        color: '#fff',
        fontSize: 26,
        fontWeight: '900',
        letterSpacing: -0.5,
    },
    heroSubtitle: {
        color: 'rgba(255,255,255,0.65)',
        fontSize: 14,
        marginTop: 4,
    },
    heroIconBox: {
        position: 'absolute',
        right: 20,
        top: 20,
    },
    progressBarTrack: {
        height: 4,
        backgroundColor: 'rgba(255,255,255,0.18)',
        borderRadius: 2,
    },
    progressBarFill: {
        height: 4,
        backgroundColor: '#fff',
        borderRadius: 2,
    },
    progressLabel: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 11,
        marginTop: 6,
    },

    statsRow: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 18,
        borderWidth: 1.5,
        borderColor: '#ede9ff',
        marginBottom: 32,
        paddingVertical: 20,
        shadowColor: '#7c3aed',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 3,
    },
    statCard: {
        flex: 1,
        alignItems: 'center',
        gap: 6,
    },
    statDivider: {
        width: 1,
        backgroundColor: '#ede9ff',
        marginVertical: 4,
    },
    statValue: {
        color: '#1e0a4a',
        fontSize: 24,
        fontWeight: '900',
    },
    statLabel: {
        color: '#9ca3af',
        fontSize: 11,
        fontWeight: '600',
        letterSpacing: 0.3,
    },

    sectionTitle: {
        color: '#b0a8d0',
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 2.5,
        marginBottom: 14,
    },

    actionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: '#ede9ff',
        padding: 16,
        marginBottom: 12,
        gap: 14,
        shadowColor: '#7c3aed',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    actionIconBox: {
        width: 46,
        height: 46,
        borderRadius: 12,
        backgroundColor: '#f3f0ff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionLabel: {
        color: '#1e0a4a',
        fontSize: 15,
        fontWeight: '700',
    },
    actionSublabel: {
        color: '#9ca3af',
        fontSize: 12,
        marginTop: 2,
    },
});