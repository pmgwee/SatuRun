import { Feather } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EventBottomSheet } from '@/components/EventBottomSheet';
import { FilterChips } from '@/components/FilterChips';
import { MapCanvas } from '@/components/MapCanvas';
import { useApp } from '@/context/AppContext';
import { RunningEvent } from '@/data/mockData';
import { useColors } from '@/hooks/useColors';

const FILTERS = ['All', 'Morning Pace', 'Night Trails', 'Beginner Friendly', 'Community Run', 'Elite'];

interface SelectedArea { events: RunningEvent[]; neighborhood: string }

export default function DiscoverScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { events } = useApp();
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedArea, setSelectedArea] = useState<SelectedArea | null>(null);
  const [mapSize, setMapSize] = useState({ width: 0, height: 0 });
  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      if (activeFilter === 'All') return true;
      if (activeFilter === 'Morning Pace') return e.time < '12:00';
      if (activeFilter === 'Night Trails') return e.time >= '18:00';
      if (activeFilter === 'Beginner Friendly') return e.category === 'Easy' || e.category === 'Community';
      if (activeFilter === 'Community Run') return e.category === 'Community';
      if (activeFilter === 'Elite') return e.category === 'Tempo' || e.category === 'Interval';
      return true;
    });
  }, [events, activeFilter]);

  const handleAreaPress = (areaEvents: RunningEvent[], neighborhood: string) => {
    setSelectedArea({ events: areaEvents, neighborhood });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header — compact, no extra gaps */}
      <View style={[
        styles.header,
        {
          paddingTop: topPad + 6,
          borderBottomColor: colors.border,
          backgroundColor: colors.background,
        },
      ]}>
        <View style={styles.locationRow}>
          <View>
            <Text style={[styles.locationLabel, { color: colors.mutedForeground }]}>Location</Text>
            <TouchableOpacity style={styles.locationBtn} activeOpacity={0.7}>
              <Feather name="map-pin" size={14} color={colors.primary} />
              <Text style={[styles.locationText, { color: colors.foreground }]}>Kuala Lumpur</Text>
              <Feather name="chevron-down" size={14} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={[styles.iconBtn, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <Feather name="search" size={18} color={colors.foreground} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.iconBtn, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <Feather name="bell" size={18} color={colors.foreground} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Map fills all remaining space */}
      <View
        style={{ flex: 1, position: 'relative' }}
        onLayout={e => {
          const { width, height } = e.nativeEvent.layout;
          if (width > 10 && height > 10) {
            setMapSize({ width, height });
          }
        }}
      >
        {mapSize.width > 0 && (
          <MapCanvas
            events={filteredEvents}
            onAreaPress={handleAreaPress}
            canvasWidth={mapSize.width}
            canvasHeight={mapSize.height}
          />
        )}

        {/* Filter chips float on top of map */}
        <View style={styles.filterOverlay} pointerEvents="box-none">
          <FilterChips
            filters={FILTERS}
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
          />
        </View>

        {/* Count pill floats at bottom of filter strip */}
        <View style={[styles.countPill, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <View style={[styles.countDot, { backgroundColor: colors.primary }]} />
          <Text style={[styles.countText, { color: colors.foreground }]}>
            <Text style={{ color: colors.primary, fontWeight: '700' }}>{filteredEvents.length}</Text>
            {' '}runs near you
          </Text>
        </View>

        {selectedArea && (
          <EventBottomSheet
            events={selectedArea.events}
            neighborhood={selectedArea.neighborhood}
            onClose={() => setSelectedArea(null)}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 8, borderBottomWidth: 1 },
  locationRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  locationLabel: { fontSize: 11, marginBottom: 3, letterSpacing: 0.4 },
  locationBtn: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  locationText: { fontSize: 18, fontWeight: '700' },
  headerActions: { flexDirection: 'row', gap: 8 },
  iconBtn: {
    width: 38, height: 38, borderRadius: 19,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1,
  },
  filterOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 5,
  },
  countPill: {
    position: 'absolute',
    top: 54,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    left: '50%',
    marginLeft: -72,
    zIndex: 5,
  },
  countDot: { width: 6, height: 6, borderRadius: 3 },
  countText: { fontSize: 13 },
});
