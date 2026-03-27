import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import { MaterialCommunityIcons, AntDesign } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function LoginScreen() {
    const navigation = useNavigation<any>();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
                style={styles.innerContainer}
            >
                <View style={styles.logoContainer}>
                    <MaterialCommunityIcons name="dumbbell" size={64} color="#e63946" />
                    <Text style={styles.logoText}>MONSTER FITNESS</Text>
                    <Text style={styles.subtitle}>Unleash Your Inner Beast</Text>
                </View>

                <View style={styles.formContainer}>
                    <View style={styles.inputContainer}>
                        <MaterialCommunityIcons name="email-outline" size={24} color="#888" style={styles.icon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Email Address"
                            placeholderTextColor="#888"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={email}
                            onChangeText={setEmail}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <MaterialCommunityIcons name="lock-outline" size={24} color="#888" style={styles.icon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Password"
                            placeholderTextColor="#888"
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                        />
                    </View>

                    <TouchableOpacity style={styles.loginButton}>
                        <Text style={styles.loginButtonText}>LOGIN</Text>
                    </TouchableOpacity>

                    <View style={styles.orContainer}>
                        <View style={styles.line} />
                        <Text style={styles.orText}>OR</Text>
                        <View style={styles.line} />
                    </View>

                    <TouchableOpacity style={styles.googleButton}>
                        <AntDesign name="google" size={24} color="#000" style={styles.googleIcon} />
                        <Text style={styles.googleButtonText}>Continue with Google</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.footerContainer}>
                    <Text style={styles.footerText}>Don't have an account? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                        <Text style={styles.footerLink}>Sign Up</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a0a',
    },
    innerContainer: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 60,
    },
    logoText: {
        fontSize: 32,
        fontWeight: '900',
        color: '#e63946',
        fontStyle: 'italic',
        marginTop: 10,
        letterSpacing: 2,
    },
    subtitle: {
        color: '#888',
        fontSize: 16,
        marginTop: 8,
        letterSpacing: 1,
    },
    formContainer: {
        width: '100%',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1c1c1e',
        borderRadius: 12,
        marginBottom: 16,
        paddingHorizontal: 16,
        height: 56,
        borderWidth: 1,
        borderColor: '#2c2c2e',
    },
    icon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        color: '#fff',
        fontSize: 16,
    },
    loginButton: {
        backgroundColor: '#e63946',
        height: 56,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 16,
        shadowColor: '#e63946',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    loginButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    orContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 24,
    },
    line: {
        flex: 1,
        height: 1,
        backgroundColor: '#2c2c2e',
    },
    orText: {
        color: '#888',
        paddingHorizontal: 16,
        fontSize: 14,
    },
    googleButton: {
        flexDirection: 'row',
        height: 56,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    googleIcon: {
        marginRight: 10,
    },
    googleButtonText: {
        color: '#000',
        fontSize: 16,
        fontWeight: '700',
    },
    footerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 40,
    },
    footerText: {
        color: '#888',
        fontSize: 15,
    },
    footerLink: {
        color: '#e63946',
        fontSize: 15,
        fontWeight: 'bold',
    },
});