import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    Animated
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Course } from '../courses'; // Import the type from the catalog

export default function CourseDetailScreen() {
    const { id, data } = useLocalSearchParams();
    const router = useRouter();

    const [course, setCourse] = useState<Course | null>(null);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [isEnrolled, setIsEnrolled] = useState(false);

    // Fade animation setup for enroll success
    const [fadeAnim] = useState(new Animated.Value(0));

    useEffect(() => {
        if (typeof data === 'string') {
            const parsedData = JSON.parse(decodeURIComponent(data));
            setCourse(parsedData);
            checkBookmarkStatus(parsedData.id);
        }
    }, [data]);

    const checkBookmarkStatus = async (courseId: number) => {
        try {
            const storedBookmarks = await AsyncStorage.getItem('bookmarks');
            if (storedBookmarks) {
                const bookmarksArray = JSON.parse(storedBookmarks);
                setIsBookmarked(bookmarksArray.includes(courseId));
            }
        } catch (e) {
            console.error('Failed to read bookmarks:', e);
        }
    };

    const toggleBookmark = async () => {
        if (!course) return;
        try {
            setIsBookmarked(!isBookmarked);
            const storedBookmarks = await AsyncStorage.getItem('bookmarks');
            let bookmarksArray: number[] = storedBookmarks ? JSON.parse(storedBookmarks) : [];

            if (!isBookmarked) {
                bookmarksArray.push(course.id);
            } else {
                bookmarksArray = bookmarksArray.filter(bId => bId !== course.id);
            }

            await AsyncStorage.setItem('bookmarks', JSON.stringify(bookmarksArray));
        } catch (e) {
            console.error('Failed to save bookmark:', e);
            // Revert on error
            setIsBookmarked(isBookmarked);
        }
    };

    const handleEnroll = () => {
        setIsEnrolled(true);
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
        }).start();
    };

    if (!course) return null;

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView bounces={false} style={{ flex: 1 }}>
                {/* Header Image */}
                <View style={styles.imageContainer}>
                    <Image source={{ uri: course.thumbnail }} style={styles.heroImage} />
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <MaterialCommunityIcons name="arrow-left" size={24} color="#111" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.bookmarkBadge} onPress={toggleBookmark}>
                        <MaterialCommunityIcons
                            name={isBookmarked ? "bookmark" : "bookmark-outline"}
                            size={24}
                            color={isBookmarked ? "#7c3aed" : "#333"}
                        />
                    </TouchableOpacity>
                </View>

                {/* Content */}
                <View style={styles.content}>
                    <Text style={styles.title}>{course.title}</Text>

                    <View style={styles.instructorContainer}>
                        <Image source={{ uri: course.instructorAvatar }} style={styles.avatar} />
                        <View>
                            <Text style={styles.instructorLabel}>Course by</Text>
                            <Text style={styles.instructorName}>{course.instructorName}</Text>
                        </View>
                    </View>

                    <Text style={styles.sectionTitle}>About this course</Text>
                    <Text style={styles.description}>{course.description}</Text>

                    {/* Placeholder for Modules */}
                    <Text style={styles.sectionTitle}>Course Content</Text>
                    {[1, 2, 3].map((num) => (
                        <View key={num} style={styles.moduleItem}>
                            <MaterialCommunityIcons name="play-circle-outline" size={28} color="#7c3aed" />
                            <View style={styles.moduleText}>
                                <Text style={styles.moduleTitle}>Module {num}: Introduction</Text>
                                <Text style={styles.moduleDuration}>15 mins</Text>
                            </View>
                        </View>
                    ))}
                </View>
            </ScrollView>

            {/* Bottom Action Bar */}
            <View style={styles.bottomBar}>
                {isEnrolled ? (
                    <Animated.View style={[styles.successBanner, { opacity: fadeAnim }]}>
                        <MaterialCommunityIcons name="check-circle" size={20} color="#10b981" />
                        <Text style={styles.successText}>Successfully Enrolled! Check your profile.</Text>
                    </Animated.View>
                ) : (
                    <TouchableOpacity onPress={handleEnroll} activeOpacity={0.9}>
                        <LinearGradient
                            colors={['#7c3aed', '#a78bfa']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.enrollButton}
                        >
                            <Text style={styles.enrollText}>ENROLL NOW</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    imageContainer: { width: '100%', height: 280, position: 'relative' },
    heroImage: { width: '100%', height: '100%' },
    backButton: {
        position: 'absolute',
        top: 20,
        left: 20,
        backgroundColor: 'rgba(255,255,255,0.9)',
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    bookmarkBadge: {
        position: 'absolute',
        top: 20,
        right: 20,
        backgroundColor: 'rgba(255,255,255,0.9)',
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: { padding: 24, paddingBottom: 100 },
    title: { fontSize: 26, fontWeight: '800', color: '#111', marginBottom: 20, lineHeight: 32 },
    instructorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        marginBottom: 20,
    },
    avatar: { width: 44, height: 44, borderRadius: 22, marginRight: 12 },
    instructorLabel: { fontSize: 13, color: '#888', marginBottom: 2 },
    instructorName: { fontSize: 16, fontWeight: '600', color: '#222' },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111', marginBottom: 12, marginTop: 10 },
    description: { fontSize: 15, color: '#555', lineHeight: 24, marginBottom: 20 },

    moduleItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f5f5f5'
    },
    moduleText: { marginLeft: 15 },
    moduleTitle: { fontSize: 16, fontWeight: '500', color: '#333' },
    moduleDuration: { fontSize: 13, color: '#888', marginTop: 4 },

    bottomBar: {
        position: 'absolute',
        bottom: 0, width: '100%',
        backgroundColor: '#fff',
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    enrollButton: {
        height: 56,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    enrollText: { color: '#fff', fontSize: 15, fontWeight: '800', letterSpacing: 1 },
    successBanner: {
        height: 56,
        backgroundColor: '#ecfdf5',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#a7f3d0',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    successText: { color: '#065f46', fontSize: 14, fontWeight: '600' }
});
