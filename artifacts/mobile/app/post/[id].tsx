import { Feather } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar } from '@/components/Avatar';
import { PostDetail, timeAgo } from '@/components/PostDetail';
import { useApp } from '@/context/AppContext';
import { useColors } from '@/hooks/useColors';
import { handleForAuthorName } from '@/data/communityData';

export default function PostDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { posts, comments, likedPostIds, savedPostIds, toggleLikePost, toggleSavePost, addComment } = useApp();

  const post = posts.find(p => p.id === id);
  const postComments = useMemo(
    () => comments.filter(c => c.postId === id).sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt)),
    [comments, id],
  );
  const [draft, setDraft] = useState('');

  if (!post) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <Text style={{ color: colors.mutedForeground }}>This post is no longer available.</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 12 }}>
          <Text style={{ color: colors.primary, fontWeight: '600' }}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const liked = likedPostIds.includes(post.id);
  const saved = savedPostIds.includes(post.id);

  const onLike = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleLikePost(post.id);
  };
  const onSave = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleSavePost(post.id);
  };
  const onSend = () => {
    if (!draft.trim()) return;
    addComment(post.id, draft);
    setDraft('');
  };

  const openAuthor = (handle?: string) => {
    if (!handle) return;
    router.push({ pathname: '/user/[handle]', params: { handle } });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        <PostDetail
          post={post}
          width={width}
          onOpenAuthor={() => openAuthor(post.authorHandle)}
          overlay={
            <TouchableOpacity
              onPress={() => router.back()}
              style={[styles.backBtn, { top: insets.top + 8 }]}
              hitSlop={8}
            >
              <Feather name="chevron-left" size={24} color="#fff" />
            </TouchableOpacity>
          }
        />

        <View style={styles.commentSection}>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <Text style={[styles.commentsHeader, { color: colors.foreground }]}>
            {post.commentCount} {post.commentCount === 1 ? 'comment' : 'comments'}
          </Text>

          {postComments.length === 0 ? (
            <Text style={[styles.noComments, { color: colors.mutedForeground }]}>
              No comments yet — say something nice.
            </Text>
          ) : (
            postComments.map(c => {
              const cHandle = handleForAuthorName(posts, c.authorName);
              return (
                <View key={c.id} style={styles.comment}>
                  {cHandle ? (
                    <TouchableOpacity activeOpacity={0.7} onPress={() => openAuthor(cHandle)}>
                      <Avatar uri={c.authorAvatar} initials={c.authorInitials} color={c.authorColor} size={32} textSize={11} />
                    </TouchableOpacity>
                  ) : (
                    <Avatar uri={c.authorAvatar} initials={c.authorInitials} color={c.authorColor} size={32} textSize={11} />
                  )}
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <View style={styles.commentHead}>
                      <Text style={[styles.commentName, { color: colors.foreground }]}>{c.authorName}</Text>
                      <Text style={[styles.commentTime, { color: colors.mutedForeground }]}>{timeAgo(c.createdAt)}</Text>
                    </View>
                    <Text style={[styles.commentBody, { color: colors.foreground }]}>{c.body}</Text>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Bottom action bar */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View
          style={[
            styles.bottomBar,
            { backgroundColor: colors.surface, borderTopColor: colors.border, paddingBottom: insets.bottom + 10 },
          ]}
        >
          <View style={[styles.inputPill, { backgroundColor: colors.muted }]}>
            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder="Add a comment…"
              placeholderTextColor={colors.mutedForeground}
              style={[styles.input, { color: colors.foreground }]}
              returnKeyType="send"
              onSubmitEditing={onSend}
            />
            {draft.trim().length > 0 && (
              <TouchableOpacity onPress={onSend} hitSlop={8}>
                <Feather name="send" size={18} color={colors.primary} />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity style={styles.action} onPress={onLike} hitSlop={6}>
            <Feather name="heart" size={22} color={liked ? colors.danger : colors.mutedForeground} />
            <Text style={[styles.actionCount, { color: liked ? colors.danger : colors.mutedForeground }]}>
              {post.likeCount}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.action} onPress={onSave} hitSlop={6}>
            <Feather name="bookmark" size={22} color={saved ? colors.primary : colors.mutedForeground} />
            <Text style={[styles.actionCount, { color: saved ? colors.primary : colors.mutedForeground }]}>
              {post.savedCount}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center' },
  backBtn: {
    position: 'absolute',
    left: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  commentSection: { paddingHorizontal: 20, paddingBottom: 8 },
  divider: { height: 1, marginVertical: 4 },
  commentsHeader: { fontSize: 14, fontWeight: '700' },
  noComments: { fontSize: 13, paddingVertical: 8 },
  comment: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 4 },
  commentHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  commentName: { fontSize: 13, fontWeight: '600' },
  commentTime: { fontSize: 11 },
  commentBody: { fontSize: 14, lineHeight: 20, marginTop: 2 },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  inputPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 10 : 4,
    borderRadius: 20,
  },
  input: { flex: 1, fontSize: 14, padding: 0 },
  action: { alignItems: 'center', gap: 2 },
  actionCount: { fontSize: 11, fontWeight: '600' },
});
