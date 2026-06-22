import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '@/context/AppContext';
import { useColors } from '@/hooks/useColors';
import { SUGGESTED_TAGS, type CommunityPost, type MediaItem } from '@/data/communityData';

const LOCATIONS = ['KLCC', 'Bangsar', 'Mont Kiara', 'TTDI', 'Desa ParkCity', 'Kiara Hill'];

function initialsFrom(name: string): string {
  return name.split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase() || 'ME';
}

export default function CreatePostScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { userProfile, addPost } = useApp();

  const [media, setMedia] = useState<MediaItem[]>([]);
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [location, setLocation] = useState<string | undefined>();

  const canPost = media.length > 0 && title.trim().length > 0;

  const ensurePermission = async () => {
    if (Platform.OS === 'web') return true;
    const { granted, canAskAgain } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) {
      Alert.alert(
        'Permission needed',
        canAskAgain
          ? 'Allow photo library access to add media to your post.'
          : 'Enable photo access for SatuRun in Settings to add media.',
      );
    }
    return granted;
  };

  const addPhotos = async () => {
    if (!(await ensurePermission())) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: 9,
      quality: 0.8,
    });
    if (result.canceled) return;
    const picked: MediaItem[] = result.assets.map(a => ({
      type: 'image',
      uri: a.uri,
      aspectRatio: a.width && a.height ? a.width / a.height : 1,
    }));
    setMedia(prev => [...prev, ...picked].slice(0, 9));
  };

  const addVideo = async () => {
    if (!(await ensurePermission())) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['videos'],
      quality: 0.8,
    });
    if (result.canceled) return;
    const a = result.assets[0];
    const item: MediaItem = {
      type: 'video',
      uri: a.uri,
      aspectRatio: a.width && a.height ? a.width / a.height : 1,
    };
    setMedia(prev => [...prev, item].slice(0, 9));
  };

  const removeMedia = (index: number) => {
    setMedia(prev => prev.filter((_, i) => i !== index));
  };

  const toggleTag = (tag: string) => {
    setTags(prev => (prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]));
  };

  const publish = () => {
    if (!canPost) return;
    const post: CommunityPost = {
      id: `post_${Date.now()}`,
      authorName: userProfile.name,
      authorHandle: `@${userProfile.name.toLowerCase().replace(/\s+/g, '')}`,
      authorInitials: initialsFrom(userProfile.name),
      authorColor: '#7FA862',
      isVerified: userProfile.isVerified,
      title: title.trim(),
      caption: caption.trim(),
      media,
      tags,
      location,
      likeCount: 0,
      commentCount: 0,
      savedCount: 0,
      createdAt: new Date().toISOString(),
      isUserCreated: true,
    };
    addPost(post);
    router.back();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10, borderBottomColor: colors.border, backgroundColor: colors.background }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <Text style={[styles.cancel, { color: colors.mutedForeground }]}>Cancel</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>New Post</Text>
        <TouchableOpacity onPress={publish} disabled={!canPost} hitSlop={8}>
          <Text style={[styles.post, { color: canPost ? colors.primary : colors.mutedForeground }]}>Post</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 40, gap: 20 }}>
          {/* Media */}
          <View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
              {media.map((m, i) => (
                <View key={i} style={styles.thumbWrap}>
                  {m.type === 'image' ? (
                    <Image source={{ uri: m.uri as string }} style={styles.thumb} contentFit="cover" />
                  ) : (
                    <View style={[styles.thumb, styles.videoThumb, { backgroundColor: colors.muted }]}>
                      <Feather name="video" size={22} color={colors.mutedForeground} />
                    </View>
                  )}
                  <TouchableOpacity onPress={() => removeMedia(i)} style={styles.removeBtn} hitSlop={6}>
                    <Feather name="x" size={13} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}

              {media.length < 9 && (
                <View style={{ gap: 8 }}>
                  <TouchableOpacity onPress={addPhotos} style={[styles.addTile, { borderColor: colors.border, backgroundColor: colors.card }]}>
                    <Feather name="image" size={20} color={colors.primary} />
                    <Text style={[styles.addTileText, { color: colors.mutedForeground }]}>Photos</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={addVideo} style={[styles.addTile, { borderColor: colors.border, backgroundColor: colors.card }]}>
                    <Feather name="video" size={20} color={colors.primary} />
                    <Text style={[styles.addTileText, { color: colors.mutedForeground }]}>Video</Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
            {media.length === 0 && (
              <Text style={[styles.hint, { color: colors.mutedForeground }]}>Add at least one photo or video.</Text>
            )}
          </View>

          {/* Title */}
          <View>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Add a title…"
              placeholderTextColor={colors.mutedForeground}
              style={[styles.titleInput, { color: colors.foreground, borderBottomColor: colors.border }]}
              maxLength={60}
            />
          </View>

          {/* Caption */}
          <TextInput
            value={caption}
            onChangeText={setCaption}
            placeholder="Share the details of your run — route, pace, how it felt…"
            placeholderTextColor={colors.mutedForeground}
            style={[styles.captionInput, { color: colors.foreground }]}
            multiline
            maxLength={1000}
          />

          {/* Tags */}
          <View style={{ gap: 10 }}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>TAGS</Text>
            <View style={styles.chips}>
              {SUGGESTED_TAGS.map(tag => {
                const active = tags.includes(tag);
                return (
                  <TouchableOpacity
                    key={tag}
                    onPress={() => toggleTag(tag)}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: active ? colors.primary : colors.card,
                        borderColor: active ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <Text style={[styles.chipText, { color: active ? colors.primaryForeground : colors.mutedForeground }]}>
                      #{tag}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Location */}
          <View style={{ gap: 10 }}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>LOCATION</Text>
            <View style={styles.chips}>
              {LOCATIONS.map(loc => {
                const active = location === loc;
                return (
                  <TouchableOpacity
                    key={loc}
                    onPress={() => setLocation(active ? undefined : loc)}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: active ? colors.primary : colors.card,
                        borderColor: active ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <Feather name="map-pin" size={11} color={active ? colors.primaryForeground : colors.mutedForeground} />
                    <Text style={[styles.chipText, { color: active ? colors.primaryForeground : colors.mutedForeground }]}>
                      {loc}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  cancel: { fontSize: 15 },
  headerTitle: { fontSize: 16, fontWeight: '700' },
  post: { fontSize: 15, fontWeight: '700' },
  thumbWrap: { position: 'relative' },
  thumb: { width: 96, height: 96, borderRadius: 12 },
  videoThumb: { alignItems: 'center', justifyContent: 'center' },
  removeBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addTile: {
    width: 96,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  addTileText: { fontSize: 12, fontWeight: '600' },
  hint: { fontSize: 12, marginTop: 10 },
  titleInput: { fontSize: 18, fontWeight: '600', paddingVertical: 8, borderBottomWidth: 1 },
  captionInput: { fontSize: 15, lineHeight: 22, minHeight: 90, textAlignVertical: 'top' },
  label: { fontSize: 10, letterSpacing: 1.5, fontWeight: '600' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
  },
  chipText: { fontSize: 12, fontWeight: '600' },
});
