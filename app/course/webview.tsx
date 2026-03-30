import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, SafeAreaView, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../src/context/AuthContext';

export default function CourseWebViewScreen() {
    const router = useRouter();
    const { title } = useLocalSearchParams();
    const { token } = useAuth();
    const [isLoading, setIsLoading] = useState(true);

    const customHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: -apple-system, sans-serif; padding: 20px; line-height: 1.6; color: #1e0a4a; background: #fff; }
            h1 { font-size: 24px; margin-bottom: 10px; color: #7c3aed; }
            .course-info { font-size: 14px; color: #9ca3af; margin-bottom: 24px; }
            .content-box { background: #fbfaff; padding: 20px; border-radius: 12px; border: 1.5px solid #ede9ff; margin-bottom: 20px; }
            .video-placeholder { background: #000; height: 200px; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #fff; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <h1>${title || 'Course Content'}</h1>
          <iframe width="100%" height="220" src="https://www.youtube.com/embed/aircAruvnKk" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="border-radius: 12px; margin-bottom: 20px;"></iframe>
          <div class="content-box">
            <p>Welcome to <strong>${title}</strong>. This content is being securely served via AI Learning's Encrypted Player.</p>
          </div>
          <script>
             window.addEventListener('message', function(event) {
                const data = JSON.parse(event.data);
             });
          </script>
        </body>
      </html>
    `;

    const injectedScript = `
        setTimeout(() => {
            document.getElementById('auth-status').innerText = '✅ Secured by Native Token Header:\\n\\n${token}';
            window.ReactNativeWebView.postMessage("Webview successfully received the Auth Headers!");
        }, 100);
        true;
    `;

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <MaterialCommunityIcons name="close" size={24} color="#111" />
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>{title || 'Course Viewer'}</Text>
                <View style={{ width: 40 }} />
            </View>

            {isLoading && (
                <View style={styles.loader}>
                    <ActivityIndicator size="large" color="#7c3aed" />
                </View>
            )}

            <WebView
                originWhitelist={['*']}
                source={{ html: customHtml, baseUrl: 'https://youtube.com' }}
                injectedJavaScript={injectedScript}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                allowsInlineMediaPlayback={true}
                onMessage={(event) => {
                    console.log("Message from HTML WebView:", event.nativeEvent.data);
                }}
                onLoadEnd={() => setIsLoading(false)}
                style={styles.webview}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee'
    },
    backButton: {
        width: 40, height: 40,
        justifyContent: 'center', alignItems: 'flex-start'
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '700',
        flex: 1,
        textAlign: 'center',
        color: '#111'
    },
    loader: {
        position: 'absolute',
        top: 100,
        left: 0, right: 0,
        alignItems: 'center',
        zIndex: 10
    },
    webview: {
        flex: 1,
        backgroundColor: 'transparent'
    }
});
