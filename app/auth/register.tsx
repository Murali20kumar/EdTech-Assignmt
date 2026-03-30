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
    ScrollView,
    Alert,
    ActivityIndicator,
    Animated,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../../src/services/api';

export default function RegisterScreen() {
    const router = useRouter();

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [focusedField, setFocusedField] = useState<
        'username' | 'email' | 'password' | 'confirmPassword' | null
    >(null);

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

    const handleRegister = async () => {
        if (!username || !email || !password || !confirmPassword) {
            Alert.alert('Missing Fields', 'Please fill in all fields.');
            return;
        }
        if (username.length < 3) {
            Alert.alert('Invalid Username', 'Username must be at least 3 characters.');
            return;
        }
        if (password.length < 6) {
            Alert.alert('Weak Password', 'Password must be at least 6 characters.');
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert('Password Mismatch', 'Your passwords do not match.');
            return;
        }

        setIsLoading(true);
        try {
            const response = await api.post('/users/register', {
                username: username.trim().toLowerCase(),
                email: email.trim().toLowerCase(),
                password,
            });

            if (response.data) {
                Alert.alert(
                    'Account Created!',
                    'You can now sign in with your credentials.',
                    [{ text: 'Sign In', onPress: () => router.replace('/auth/login') }]
                );
            }
        } catch (error: any) {
            const errorMessage =
                error.response?.data?.message ||
                error.response?.data?.error ||
                error.message ||
                'An unexpected error occurred';
            Alert.alert('Registration Failed', errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.accentTopRight} />
            <View style={styles.accentBottomLeft} />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContainer}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <MaterialCommunityIcons name="arrow-left" size={20} color="#a78bfa" />
                    </TouchableOpacity>

                    <View style={styles.headerBlock}>
                        <View style={styles.badgeRow}>
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>AI LEARNING</Text>
                            </View>
                        </View>
                        <Text style={styles.title}>Create{'\n'}Account.</Text>
                        <Text style={styles.subtitle}>
                            Join thousands learning AI the smart way
                        </Text>
                    </View>

                    <View style={styles.form}>

                        <View style={styles.fieldWrapper}>
                            <Text style={styles.label}>USERNAME</Text>
                            <View style={[
                                styles.inputRow,
                                focusedField === 'username' && styles.inputRowFocused,
                            ]}>
                                <MaterialCommunityIcons
                                    name="account-outline"
                                    size={20}
                                    color={focusedField === 'username' ? '#a78bfa' : '#555'}
                                    style={styles.inputIcon}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="yourhandle"
                                    placeholderTextColor="#3a3a3a"
                                    autoCapitalize="none"
                                    value={username}
                                    onChangeText={setUsername}
                                    onFocus={() => setFocusedField('username')}
                                    onBlur={() => setFocusedField(null)}
                                />
                            </View>
                        </View>

                        <View style={styles.fieldWrapper}>
                            <Text style={styles.label}>EMAIL</Text>
                            <View style={[
                                styles.inputRow,
                                focusedField === 'email' && styles.inputRowFocused,
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
                                    placeholderTextColor="#3a3a3a"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    value={email}
                                    onChangeText={setEmail}
                                    onFocus={() => setFocusedField('email')}
                                    onBlur={() => setFocusedField(null)}
                                />
                            </View>
                        </View>

                        <View style={styles.fieldWrapper}>
                            <Text style={styles.label}>PASSWORD</Text>
                            <View style={[
                                styles.inputRow,
                                focusedField === 'password' && styles.inputRowFocused,
                            ]}>
                                <MaterialCommunityIcons
                                    name="lock-outline"
                                    size={20}
                                    color={focusedField === 'password' ? '#a78bfa' : '#555'}
                                    style={styles.inputIcon}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="min. 6 characters"
                                    placeholderTextColor="#3a3a3a"
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
                                        color="#555"
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.fieldWrapper}>
                            <Text style={styles.label}>CONFIRM PASSWORD</Text>
                            <View style={[
                                styles.inputRow,
                                focusedField === 'confirmPassword' && styles.inputRowFocused,
                                confirmPassword.length > 0 &&
                                password !== confirmPassword &&
                                styles.inputRowError,
                            ]}>
                                <MaterialCommunityIcons
                                    name="lock-check-outline"
                                    size={20}
                                    color={
                                        confirmPassword.length > 0 && password !== confirmPassword
                                            ? '#ef4444'
                                            : focusedField === 'confirmPassword'
                                                ? '#a78bfa'
                                                : '#555'
                                    }
                                    style={styles.inputIcon}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="repeat password"
                                    placeholderTextColor="#3a3a3a"
                                    secureTextEntry={!showConfirmPassword}
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    onFocus={() => setFocusedField('confirmPassword')}
                                    onBlur={() => setFocusedField(null)}
                                />
                                <TouchableOpacity
                                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                >
                                    <MaterialCommunityIcons
                                        name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                                        size={20}
                                        color="#555"
                                    />
                                </TouchableOpacity>
                            </View>
                            {confirmPassword.length > 0 && password !== confirmPassword && (
                                <Text style={styles.errorHint}>Passwords do not match</Text>
                            )}
                        </View>

                        <Animated.View style={{ transform: [{ scale: buttonScale }], marginTop: 8 }}>
                            <TouchableOpacity
                                onPressIn={animateButtonIn}
                                onPressOut={animateButtonOut}
                                onPress={handleRegister}
                                disabled={isLoading}
                                activeOpacity={1}
                            >
                                <LinearGradient
                                    colors={['#7c3aed', '#a78bfa']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.registerButton}
                                >
                                    {isLoading ? (
                                        <ActivityIndicator color="#fff" size="small" />
                                    ) : (
                                        <Text style={styles.registerButtonText}>CREATE ACCOUNT</Text>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>
                        </Animated.View>
                    </View>

                    <View style={styles.footer}>
                        <View style={styles.dividerRow}>
                            <View style={styles.divider} />
                            <Text style={styles.dividerText}>ALREADY A MEMBER?</Text>
                            <View style={styles.divider} />
                        </View>
                        <TouchableOpacity
                            style={styles.loginButton}
                            onPress={() => router.replace('/auth/login')}
                        >
                            <Text style={styles.loginButtonText}>Sign in instead</Text>
                            <MaterialCommunityIcons name="arrow-right" size={16} color="#a78bfa" />
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f7f5ff',
    },

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

    scrollContainer: {
        flexGrow: 1,
        paddingHorizontal: 28,
        paddingBottom: 40,
        paddingTop: 16,
    },

    backButton: {
        width: 40,
        height: 40,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#1e1e1e',
        backgroundColor: '#111',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 32,
        marginTop: 8,
    },

    headerBlock: {
        marginBottom: 40,
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
        fontSize: 44,
        fontWeight: '900',
        color: '#1e0a4a',
        lineHeight: 48,
        letterSpacing: -1,
    },
    subtitle: {
        color: '#9ca3af',
        fontSize: 15,
        marginTop: 12,
        letterSpacing: 0.2,
    },

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
    inputRowError: {
        borderColor: '#ef4444',
        backgroundColor: '#0f0f0f',
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
    errorHint: {
        color: '#ef4444',
        fontSize: 12,
        marginTop: 4,
        marginLeft: 4,
    },

    registerButton: {
        height: 56,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    registerButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '800',
        letterSpacing: 3,
    },

    footer: {
        marginTop: 40,
        gap: 20,
    },
    dividerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: '#1a1a1a',
    },
    dividerText: {
        color: '#333',
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 2,
    },
    loginButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#1a1a1a',
    },
    loginButtonText: {
        color: '#a78bfa',
        fontSize: 15,
        fontWeight: '600',
    },
});