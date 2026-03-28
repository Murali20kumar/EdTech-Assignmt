import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    Alert,
    ActivityIndicator,
    Animated,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../../src/services/api';
import { useAuth } from '../../src/context/AuthContext';

export default function LoginScreen() {
    const router = useRouter();
    const { login } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [focusedField, setFocusedField] = useState<'email' | 'password' | null>(null);

    // Animated values for button press
    const buttonScale = useRef(new Animated.Value(1)).current;

    const animateButtonIn = () => {
        Animated.spring(buttonScale, {
            toValue: 0.97,
            useNativeDriver: true,
        }).start();
    };

    const animateButtonOut = () => {
        Animated.spring(buttonScale, {
            toValue: 1,
            friction: 3,
            useNativeDriver: true,
        }).start();
    };

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Missing Fields', 'Please enter your email and password.');
            return;
        }

        setIsLoading(true);
        try {
            const userInput = email.trim().toLowerCase();
            const payload = userInput.includes('@') 
                ? { email: userInput, password } 
                : { username: userInput, password };

            const response = await api.post('/users/login', payload);

            const token = response.data?.data?.accessToken;
            const refreshToken = response.data?.data?.refreshToken;
            if (!token || !refreshToken) throw new Error('Token not received from server');

            setEmail('');
            setPassword('');
            await login(token, refreshToken);
            router.replace('/(tabs)');
        } catch (error: any) {
            const status = error.response?.status;
            const serverMessage = error.response?.data?.message || error.message || 'Unknown error';
            const errorMessage = `Error ${status}: ${serverMessage}`;
            
            Alert.alert('Login Failed', errorMessage, [
                { text: 'Try Again' },
                { text: 'Register', onPress: () => router.replace('/auth/register') }
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Subtle background accent */}
            <View style={styles.accentTopRight} />
            <View style={styles.accentBottomLeft} />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.inner}
            >
                {/* Header */}
                <View style={styles.headerBlock}>
                    <View style={styles.badgeRow}>
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>AI LEARNING</Text>
                        </View>
                    </View>
                    <Text style={styles.title}>Welcome{'\n'}Back.</Text>
                    <Text style={styles.subtitle}>Sign in to continue your learning journey</Text>
                </View>

                {/* Form */}
                <View style={styles.form}>
                    {/* Email */}
                    <View style={styles.fieldWrapper}>
                        <Text style={styles.label}>EMAIL</Text>
                        <View style={[
                            styles.inputRow,
                            focusedField === 'email' && styles.inputRowFocused
                        ]}>
                            <MaterialCommunityIcons
                                name="email-outline"
                                size={20}
                                color={focusedField === 'email' ? '#a78bfa' : '#555'}
                                style={styles.inputIcon}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="you@example.com"
                                placeholderTextColor="#9ca3af"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                value={email}
                                onChangeText={setEmail}
                                onFocus={() => setFocusedField('email')}
                                onBlur={() => setFocusedField(null)}
                            />
                        </View>
                    </View>

                    {/* Password */}
                    <View style={styles.fieldWrapper}>
                        <Text style={styles.label}>PASSWORD</Text>
                        <View style={[
                            styles.inputRow,
                            focusedField === 'password' && styles.inputRowFocused
                        ]}>
                            <MaterialCommunityIcons
                                name="lock-outline"
                                size={20}
                                color={focusedField === 'password' ? '#a78bfa' : '#555'}
                                style={styles.inputIcon}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="••••••••"
                                placeholderTextColor="#9ca3af"
                                secureTextEntry={!showPassword}
                                value={password}
                                onChangeText={setPassword}
                                onFocus={() => setFocusedField('password')}
                                onBlur={() => setFocusedField(null)}
                            />
                            <TouchableOpacity
                                onPress={() => setShowPassword(!showPassword)}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                <MaterialCommunityIcons
                                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                    size={20}
                                    color="#9ca3af"
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Login Button */}
                    <Animated.View style={{ transform: [{ scale: buttonScale }], marginTop: 8 }}>
                        <TouchableOpacity
                            onPressIn={animateButtonIn}
                            onPressOut={animateButtonOut}
                            onPress={handleLogin}
                            disabled={isLoading}
                            activeOpacity={1}
                        >
                            <LinearGradient
                                colors={['#3b1fa3', '#7c3aed']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.loginButton}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="#fff" size="small" />
                                ) : (
                                    <Text style={styles.loginButtonText}>SIGN IN</Text>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    </Animated.View>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <View style={styles.dividerRow}>
                        <View style={styles.divider} />
                        <Text style={styles.dividerText}>NEW TO AITV?</Text>
                        <View style={styles.divider} />
                    </View>
                    <TouchableOpacity
                        style={styles.registerButton}
                        onPress={() => router.push('/auth/register')}
                    >
                        <Text style={styles.registerButtonText}>Create an account</Text>
                        <MaterialCommunityIcons name="arrow-right" size={16} color="#a78bfa" />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f7f5ff',
    },
    // Decorative background accents
    accentTopRight: {
        position: 'absolute',
        top: -80,
        right: -80,
        width: 260,
        height: 260,
        borderRadius: 130,
        backgroundColor: '#7c3aed',
        opacity: 0.08,
    },
    accentBottomLeft: {
        position: 'absolute',
        bottom: -60,
        left: -60,
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: '#a78bfa',
        opacity: 0.06,
    },
    inner: {
        flex: 1,
        paddingHorizontal: 28,
        justifyContent: 'center',
    },

    // Header
    headerBlock: {
        marginBottom: 48,
    },
    badgeRow: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    badge: {
        borderWidth: 1,
        borderColor: '#7c3aed',
        borderRadius: 4,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    badgeText: {
        color: '#a78bfa',
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 2,
    },
    title: {
        fontSize: 48,
        fontWeight: '900',
        color: '#1e0a4a',
        lineHeight: 52,
        letterSpacing: -1,
    },
    subtitle: {
        color: '#9ca3af',
        fontSize: 15,
        marginTop: 12,
        letterSpacing: 0.2,
    },

    // Form
    form: {
        gap: 20,
    },
    fieldWrapper: {
        gap: 8,
    },
    label: {
        color: '#9ca3af',
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 2,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: '#ede9ff',
        paddingHorizontal: 16,
        height: 56,
        shadowColor: '#7c3aed',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 6,
        elevation: 1,
    },
    inputRowFocused: {
        borderColor: '#7c3aed',
        backgroundColor: '#fbfaff',
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        color: '#1e0a4a',
        fontSize: 15,
        fontWeight: '500',
    },

    // Button
    loginButton: {
        height: 56,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loginButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '800',
        letterSpacing: 3,
    },

    // Footer
    footer: {
        marginTop: 48,
        gap: 20,
    },
    dividerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 8,
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: '#ede9ff',
    },
    dividerText: {
        color: '#9ca3af',
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 2,
    },
    registerButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 16,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: '#ede9ff',
        backgroundColor: '#fff',
    },
    registerButtonText: {
        color: '#a78bfa',
        fontSize: 15,
        fontWeight: '600',
    },
});