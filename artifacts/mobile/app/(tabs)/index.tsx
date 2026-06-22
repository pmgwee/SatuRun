import { Feather } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { Alert, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EventBottomSheet } from '@/components/EventBottomSheet';
import { FilterChips } from '@/components/FilterChips';
import { MapWebView } from '@/components/MapWebView';
import { useTheme } from '@/context/ThemeContext';
import { useApp } from '@/context/AppContext';
import { RunningEvent } from '@/data/mockData';
import { useColors } from '@/hooks/useColors';

const FILTERS = ['All', 'Morning Pace', 'Night Trails', 'Beginner Friendly', 'Community Run', 'Elite'];

interface SelectedArea { events: RunningEvent[]; neighborhood: string }

export default function DiscoverScreen() {
  const colors = useColors();
  const { isDark, toggleTheme } = useTheme();
  const insets = useSafeAreaInsets();
  const { events, joinedEventIds } = useApp();
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedArea, setSelectedArea] = useState<SelectedArea | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  const filteredEvents = useMemo(() => {
    const q = query.trim().toLowerCase();
    return events.filter(e => {
      let pass = true;
      if (activeFilter === 'Morning Pace') pass = e.time < '12:00';
      else if (activeFilter === 'Night Trails') pass = e.time >= '18:00';
      else if (activeFilter === 'Beginner Friendly') pass = e.category === 'Easy' || e.category === 'Community';
      else if (activeFilter === 'Community Run') pass = e.category === 'Community';
      else if (activeFilter === 'Elite') pass = e.category === 'Tempo' || e.category === 'Interval';
      if (!pass) return false;
      if (!q) return true;
      return (
        e.title.toLowerCase().includes(q) ||
        e.organizer.toLowerCase().includes(q) ||
        e.neighborhood.toLowerCase().includes(q) ||
        e.location.toLowerCase().includes(q)
      );
    });
  }, [events, activeFilter, query]);

  const showNotifications = () => {
    const now = Date.now();
    const upcoming = events.filter(
      e => joinedEventIds.includes(e.id) && new Date(`${e.date}T${e.time}:00`).getTime() > now,
    );
    Alert.alert(
      'Notifications',
      upcoming.length
        ? `You have ${upcoming.length} upcoming run${upcoming.length > 1 ? 's' : ''}:\n\n` +
            upcoming.slice(0, 4).map(e => `• ${e.title} — ${e.displayTime}`).join('\n')
        : "You're all caught up. Join a run to get reminders here.",
    );
  };

  const toggleSearch = () =>
    setSearchOpen(o => {
      const next = !o;
      if (!next) setQuery('');
      return next;
    });

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
            <TouchableOpacity
              style={[styles.iconBtn, { backgroundColor: searchOpen ? colors.primary : colors.card, borderColor: colors.cardBorder }]}
              onPress={toggleSearch}
              activeOpacity={0.7}
            >
              <Feather name="search" size={18} color={searchOpen ? colors.primaryForeground : colors.foreground} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.iconBtn, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
              onPress={showNotifications}
              activeOpacity={0.7}
            >
              <Feather name="bell" size={18} color={colors.foreground} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.iconBtn, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
              onPress={toggleTheme}
              activeOpacity={0.7}
            >
              <Feather name={isDark ? 'sun' : 'moon'} size={18} color={colors.foreground} />
            </TouchableOpacity>
          </View>
        </View>

        {searchOpen && (
          <View style={[styles.searchRow, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Feather name="search" size={16} color={colors.mutedForeground} />
            <TextInput
              autoFocus
              value={query}
              onChangeText={setQuery}
              placeholder="Search runs, organizers, areas…"
              placeholderTextColor={colors.mutedForeground}
              style={[styles.searchInput, { color: colors.foreground }]}
              returnKeyType="search"
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Feather name="x" size={16} color={colors.mutedForeground} />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* Map fills all remaining space */}
      <View style={{ flex: 1, position: 'relative' }}>
        <MapWebView
          events={filteredEvents}
          onAreaPress={handleAreaPress}
        />

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
  searchRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginTop: 12, paddingHorizontal: 14, height: 44,
    borderRadius: 12, borderWidth: 1,
  },
  searchInput: { flex: 1, fontSize: 14, paddingVertical: 0 },
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
