import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Rect, Svg } from 'react-native-svg';
import { RunningEvent } from '@/data/mockData';
import { useColors } from '@/hooks/useColors';

const QR_MATRIX = [
  [1,1,1,1,1,1,1,0,1,0,1,0,0,0,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,1,0,1,1,0,1,1,0,1,0,0,0,0,0,1],
  [1,0,1,1,1,0,1,0,0,1,0,0,1,0,1,0,1,1,1,0,1],
  [1,0,1,1,1,0,1,0,1,0,1,1,0,0,1,0,1,1,1,0,1],
  [1,0,1,1,1,0,1,0,0,0,1,0,1,0,1,0,1,1,1,0,1],
  [1,0,0,0,0,0,1,0,1,1,0,0,1,0,1,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,0,1,0,1,0,1,0,1,1,1,1,1,1,1],
  [0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0],
  [1,0,1,1,0,0,1,1,0,1,0,1,0,1,1,0,1,0,0,1,0],
  [0,1,0,0,1,1,0,1,1,0,1,1,0,0,1,0,1,1,0,0,1],
  [1,0,1,0,1,0,1,0,1,1,0,1,1,0,1,0,1,0,1,0,1],
  [0,1,1,0,0,1,0,0,1,0,0,0,1,1,0,1,0,0,1,1,0],
  [1,0,0,1,1,0,1,1,0,1,1,0,0,1,1,0,1,1,0,0,1],
  [0,0,0,0,0,0,0,0,1,1,0,1,0,0,0,0,0,0,0,0,0],
  [1,1,1,1,1,1,1,0,0,1,1,0,1,0,1,0,0,1,0,0,1],
  [1,0,0,0,0,0,1,0,1,0,0,1,0,1,0,1,1,0,1,0,0],
  [1,0,1,1,1,0,1,0,0,1,1,0,1,1,1,0,0,1,0,1,0],
  [1,0,1,1,1,0,1,0,1,0,0,1,0,0,0,1,0,1,1,0,1],
  [1,0,1,1,1,0,1,0,0,1,1,0,1,1,0,0,1,0,0,1,0],
  [1,0,0,0,0,0,1,0,1,1,0,0,1,0,1,0,0,0,1,0,1],
  [1,1,1,1,1,1,1,0,0,0,1,0,0,1,0,1,1,0,0,1,0],
];

const QR_SIZE = 196;
const CELL = QR_SIZE / 21;

interface QRModalProps {
  event: RunningEvent | null;
  visible: boolean;
  onClose: () => void;
}

export function QRModal({ event, visible, onClose }: QRModalProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  if (!event) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder, paddingBottom: Math.max(insets.bottom, 20) + 4 }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Feather name="x" size={20} color={colors.mutedForeground} />
          </TouchableOpacity>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>EVENT CHECK-IN</Text>
          <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={2}>{event.title}</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>{event.neighborhood} · {event.displayTime}</Text>

          <View style={[styles.qrWrap, { borderColor: 'rgba(204,255,0,0.3)' }]}>
            <Svg width={QR_SIZE} height={QR_SIZE}>
              {QR_MATRIX.map((row, ri) =>
                row.map((cell, ci) =>
                  cell === 1 ? (
                    <Rect key={`${ri}-${ci}`} x={ci * CELL} y={ri * CELL} width={CELL - 0.3} height={CELL - 0.3} fill="#050505" rx={0.5} />
                  ) : null
                )
              )}
            </Svg>
          </View>

          <Text style={[styles.qrNote, { color: colors.mutedForeground }]}>Show this QR code at event check-in</Text>

          <View style={[styles.idRow, { backgroundColor: colors.muted, borderColor: colors.border }]}>
            <Text style={[styles.idLabel, { color: colors.mutedForeground }]}>Event ID</Text>
            <Text style={[styles.idValue, { color: colors.foreground }]}>PACE-{event.id?.toUpperCase()}-2026</Text>
          </View>

          <TouchableOpacity onPress={onClose} style={[styles.doneBtn, { backgroundColor: '#CCFF00' }]}>
            <Text style={[styles.doneBtnText, { color: '#050505' }]}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
  },
  closeBtn: { alignSelf: 'flex-end', marginBottom: 8 },
  sectionLabel: { fontSize: 10, letterSpacing: 2, fontWeight: '600', marginBottom: 8 },
  title: { fontSize: 17, fontWeight: '700', textAlign: 'center', marginBottom: 4, lineHeight: 24 },
  subtitle: { fontSize: 12, marginBottom: 24 },
  qrWrap: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    backgroundColor: '#fff',
    marginBottom: 14,
  },
  qrNote: { fontSize: 11, textAlign: 'center', marginBottom: 16 },
  idRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 20,
  },
  idLabel: { fontSize: 11 },
  idValue: { fontSize: 12, fontWeight: '600', letterSpacing: 0.4 },
  doneBtn: { width: '100%', borderRadius: 14, paddingVertical: 15, alignItems: 'center' },
  doneBtnText: { fontSize: 15, fontWeight: '700' },
});
