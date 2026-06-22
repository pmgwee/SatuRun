import { Image } from 'expo-image';
import { useVideoPlayer, VideoView } from 'expo-video';
import React, { useState } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useColors } from '@/hooks/useColors';
import type { MediaItem } from '@/data/communityData';

const MIN_AR = 0.65;
const MAX_AR = 1.4;

function VideoSlide({ uri, width, height }: { uri: string; width: number; height: number }) {
  const player = useVideoPlayer(uri, p => {
    p.loop = true;
    p.muted = false;
  });
  return (
    <VideoView
      player={player}
      style={{ width, height }}
      contentFit="cover"
      nativeControls
      allowsFullscreen
    />
  );
}

interface MediaCarouselProps {
  media: MediaItem[];
  width: number;
}

export function MediaCarousel({ media, width }: MediaCarouselProps) {
  const colors = useColors();
  const [index, setIndex] = useState(0);

  // All slides share one height, derived from the first item's (clamped) aspect ratio.
  const ar = Math.min(MAX_AR, Math.max(MIN_AR, media[0]?.aspectRatio || 1));
  const height = Math.round(width / ar);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / width);
    if (i !== index) setIndex(i);
  };

  return (
    <View style={{ width, height }}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScroll}
      >
        {media.map((item, i) =>
          item.type === 'video' ? (
            <VideoSlide key={i} uri={item.uri} width={width} height={height} />
          ) : (
            <Image
              key={i}
              source={{ uri: item.uri }}
              style={{ width, height }}
              contentFit="cover"
              transition={200}
            />
          ),
        )}
      </ScrollView>

      {media.length > 1 && (
        <View style={styles.dots}>
          {media.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                { backgroundColor: i === index ? colors.primary : 'rgba(255,255,255,0.55)' },
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  dots: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
});
