import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  SafeAreaView
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import api from '../src/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNotifications } from '@/src/hooks/useNotifications';

// Types
type Product = { id: number; title: string; description: string; images: string[] };
type User = { id: number; name: { first: string; last: string }; picture: { thumbnail: string } };

export type Course = {
  id: number;
  title: string;
  description: string;
  thumbnail: string;
  instructorName: string;
  instructorAvatar: string;
  isBookmarked: boolean;
};

const CourseItem = React.memo(({ item, onPress, onToggleBookmark }: { 
  item: Course; 
  onPress: () => void; 
  onToggleBookmark: (id: number) => void 
}) => (
  <TouchableOpacity
    style={styles.card}
    onPress={onPress}
  >
    <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
    <View style={styles.cardInfo}>
      <Text style={styles.title} numberOfLines={2}>{item.title}</Text>

      <View style={styles.instructorRow}>
        <Image source={{ uri: item.instructorAvatar }} style={styles.avatar} />
        <Text style={styles.instructorName}>{item.instructorName}</Text>
      </View>

      <TouchableOpacity
        style={styles.bookmarkButton}
        onPress={() => onToggleBookmark(item.id)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <MaterialCommunityIcons
          name={item.isBookmarked ? "bookmark" : "bookmark-outline"}
          size={24}
          color={item.isBookmarked ? "#7c3aed" : "#555"}
        />
      </TouchableOpacity>
    </View>
  </TouchableOpacity>
), (prev, next) => prev.item.isBookmarked === next.item.isBookmarked);

export default function CourseCatalogScreen() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { triggerInstantNotification } = useNotifications();


  useFocusEffect(
    useCallback(() => {
      // Re-hydrate bookmark status whenever we return to this screen!
      syncBookmarks();
    }, [courses])
  );

  const syncBookmarks = async () => {
    try {
      const storedBookmarks = await AsyncStorage.getItem('bookmarks');
      if (!storedBookmarks) return;
      
      const bookmarksArray: number[] = JSON.parse(storedBookmarks);
      setCourses(currentCourses => currentCourses.map(c => ({
          ...c,
          isBookmarked: bookmarksArray.includes(Number(c.id))
      })));
      setFilteredCourses(currentFiltered => currentFiltered.map(c => ({
          ...c,
          isBookmarked: bookmarksArray.includes(Number(c.id))
      })));
    } catch (e) {
      console.error('Failed to sync bookmarks:', e);
    }
  };

  // Fetch data from APIs
  const fetchData = async () => {
    try {
      // 1. Fetch random products (treat as courses)
      const productsRes = await api.get('/public/randomproducts?page=1&limit=20');
      const productsData: Product[] = productsRes.data.data.data;

      // 2. Fetch random users (treat as instructors)
      const usersRes = await api.get('/public/randomusers?page=1&limit=20');
      const usersData: User[] = usersRes.data.data.data;

      // 3. Check existing bookmarks in permanent storage
      const storedBookmarks = await AsyncStorage.getItem('bookmarks');
      const bookmarksArray: number[] = storedBookmarks ? JSON.parse(storedBookmarks) : [];

      // 4. Map them together and Hydrate the UI Status
      const mappedCourses: Course[] = productsData.map((prod, index) => {
        const instructor = usersData[index % usersData.length];
        return {
          id: prod.id,
          title: prod.title,
          description: prod.description,
          thumbnail: prod.images[0] || 'https://via.placeholder.com/150',
          instructorName: `${instructor.name.first} ${instructor.name.last}`,
          instructorAvatar: instructor.picture.thumbnail,
          isBookmarked: bookmarksArray.includes(Number(prod.id)), // Keep your choices!
        };
      });

      setCourses(mappedCourses);
      setFilteredCourses(mappedCourses);
    } catch (error) {
      console.error('Error fetching course data:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle Pull to Refresh
  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    setSearchQuery('');
    fetchData();
  }, []);

  // Handle Search
  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (text) {
      const filtered = courses.filter((course) =>
        course.title.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredCourses(filtered);
    } else {
      setFilteredCourses(courses);
    }
  };

  // Toggle Bookmark (Persistent)
  const toggleBookmark = useCallback(async (id: number) => {
    try {
      // 1. Update UI State immediately
      setCourses((prevCourses) => {
        const updatedCourses = prevCourses.map((c) =>
          c.id === id ? { ...c, isBookmarked: !c.isBookmarked } : c
        );
        setFilteredCourses(
          updatedCourses.filter((c) =>
            c.title.toLowerCase().includes(searchQuery.toLowerCase())
          )
        );
        return updatedCourses;
      });

      // 2. Save to AsyncStorage
      const storedBookmarks = await AsyncStorage.getItem('bookmarks');
      let bookmarksArray: number[] = storedBookmarks ? JSON.parse(storedBookmarks) : [];
      const isAlreadyBookmarked = bookmarksArray.includes(Number(id));

      if (!isAlreadyBookmarked) {
        bookmarksArray.push(Number(id));
        // Special task: 5 bookmarks = alert
        if (bookmarksArray.length === 5) {
          triggerInstantNotification(
            "Super Scholar! 🌟",
            "You just bookmarked your 5th course! You are on fire."
          );
        }
      } else {
        bookmarksArray = bookmarksArray.filter(bId => Number(bId) !== Number(id));
      }

      await AsyncStorage.setItem('bookmarks', JSON.stringify(bookmarksArray));
    } catch (e) {
      console.error('Failed to toggle bookmark persistently:', e);
    }
  }, [searchQuery, triggerInstantNotification]);

  const handlePressCourse = useCallback((item: Course) => {
    router.push(`/course/${item.id}?data=${encodeURIComponent(JSON.stringify(item))}` as any);
  }, [router]);

  const renderCourseItem = useCallback(({ item }: { item: Course }) => {
    return <CourseItem item={item} onPress={() => handlePressCourse(item)} onToggleBookmark={toggleBookmark} />;
  }, [handlePressCourse, toggleBookmark]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Discover Courses</Text>
      </View>

      <View style={styles.searchContainer}>
        <MaterialCommunityIcons name="magnify" size={20} color="#888" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search courses..."
          placeholderTextColor="#888"
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      {isLoading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#7c3aed" />
        </View>
      ) : (
        <FlatList
          data={filteredCourses}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderCourseItem}
          getItemLayout={(data, index) => ({ length: 280, offset: 280 * index, index })}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#7c3aed" />
          }
          ListEmptyComponent={<Text style={styles.emptyText}>No courses found.</Text>}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f5ff' },
  header: { padding: 20, paddingTop: 40 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#111' },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 16, color: '#333' },
  listContent: { paddingHorizontal: 20, paddingBottom: 20 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#888', fontSize: 16 },

  // Card Styles
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  thumbnail: { width: '100%', height: 160, backgroundColor: '#e1e1e1' },
  cardInfo: { padding: 15 },
  title: { fontSize: 18, fontWeight: '700', color: '#222', marginBottom: 12, paddingRight: 30 },
  instructorRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 24, height: 24, borderRadius: 12, marginRight: 8, backgroundColor: '#ddd' },
  instructorName: { fontSize: 14, color: '#666', fontWeight: '500' },
  bookmarkButton: { position: 'absolute', right: 15, bottom: 15 },
});
