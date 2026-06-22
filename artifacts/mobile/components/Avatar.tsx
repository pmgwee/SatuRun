import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface AvatarProps {
  uri?: string;
  initials: string;
  color: string;
  size: number;
  textSize?: number;
}

/** Round avatar — shows a real photo when `uri` is set, otherwise colored initials. */
export function Avatar({ uri, initials, color, size, textSize }: AvatarProps) {
  const radius = size / 2;
  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={{ width: size, height: size, borderRadius: radius, backgroundColor: color }}
        contentFit="cover"
        transition={150}
      />
    );
  }
  return (
    <View style={[styles.fallback, { width: size, height: size, borderRadius: radius, backgroundColor: color }]}>
      <Text style={[styles.text, { fontSize: textSize ?? Math.round(size * 0.4) }]}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: { alignItems: 'center', justifyContent: 'center' },
  text: { color: '#fff', fontWeight: '700' },
});
