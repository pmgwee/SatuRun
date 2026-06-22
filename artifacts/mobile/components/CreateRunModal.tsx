import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import {
  Modal, Platform, ScrollView, StyleSheet, Switch, Text,
  TextInput, TouchableOpacity, View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '@/context/AppContext';
import { DISTANCE_OPTIONS, EventCategory, LOCATION_OPTIONS, RunningEvent } from '@/data/mockData';
import { useColors } from '@/hooks/useColors';

const CATEGORIES: EventCategory[] = ['Easy', 'Tempo', 'Trail', 'Interval', 'Night', 'Community'];
const STEP_TITLES = ['Run Details', 'Route & Distance', 'Sponsorship', 'Review & Launch'];

interface FormData {
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  distance: string;
  category: EventCategory;
  hasVoucher: boolean;
}

const EMPTY_FORM: FormData = {
  title: '', description: '', date: '', time: '',
  location: '', distance: '', category: 'Community', hasVoucher: false,
};

interface CreateRunModalProps {
  visible: boolean;
  onClose: () => void;
}

export function CreateRunModal({ visible, onClose }: CreateRunModalProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addEvent } = useApp();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [submitted, setSubmitted] = useState(false);

  const update = (key: keyof FormData, value: any) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const canProceed = () => {
    if (step === 1) return form.title.trim().length > 0;
    if (step === 2) return form.location.length > 0 && form.distance.length > 0;
    return true;
  };

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStep(s => Math.min(4, s + 1));
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStep(s => Math.max(1, s - 1));
  };

  const handleSubmit = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const newEvent: RunningEvent = {
      id: `user_${Date.now()}`,
      title: form.title || 'My Community Run',
      organizer: 'Alex Chen',
      organizerHandle: '@alexchen',
      organizerInitials: 'AC',
      organizerColor: '#7FA862',
      isVerified: false,
      location: form.location || 'TTDI Park',
      neighborhood: form.location.split(' ')[0] || 'TTDI',
      coordinates: { x: 155, y: 183 },
      distance: form.distance || '5KM',
      pace: '6:00 /km',
      category: form.category,
      date: '2026-07-20',
      time: '07:00',
      displayTime: form.time || '7:00 AM',
      participantsCount: 1,
      maxParticipants: 30,
      hasVoucher: form.hasVoucher,
      voucherDescription: form.hasVoucher ? 'ZUS Coffee Voucher upon completion' : undefined,
      tags: [form.category],
      isUserCreated: true,
    };
    addEvent(newEvent);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setStep(1);
      setForm(EMPTY_FORM);
      onClose();
    }, 2000);
  };

  const handleClose = () => {
    setStep(1);
    setForm(EMPTY_FORM);
    setSubmitted(false);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={[styles.sheet, { backgroundColor: colors.card, paddingBottom: Math.max(insets.bottom, 16) + 8 }]}>
          <TouchableOpacity onPress={handleClose} style={styles.handleArea}>
            <View style={[styles.handle, { backgroundColor: colors.border }]} />
          </TouchableOpacity>

          <View style={styles.header}>
            <View>
              <Text style={[styles.headerTitle, { color: colors.foreground }]}>{STEP_TITLES[step - 1]}</Text>
              <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>Step {step} of 4</Text>
            </View>
            <TouchableOpacity onPress={handleClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Feather name="x" size={20} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>

          <View style={styles.stepsRow}>
            {[1, 2, 3, 4].map(s => (
              <View
                key={s}
                style={[
                  styles.stepBar,
                  { backgroundColor: s <= step ? colors.primary : colors.muted, flex: s === step ? 2 : 1 },
                ]}
              />
            ))}
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {submitted ? (
              <View style={styles.successView}>
                <View style={[styles.successIcon, { backgroundColor: colors.primarySoft }]}>
                  <Feather name="check" size={32} color={colors.accentInk} />
                </View>
                <Text style={[styles.successTitle, { color: colors.foreground }]}>Run Created</Text>
                <Text style={[styles.successSub, { color: colors.mutedForeground }]}>
                  Your event is now live on the Discover map
                </Text>
              </View>
            ) : step === 1 ? (
              <View style={styles.stepContent}>
                <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Run Title *</Text>
                <TextInput
                  style={[styles.input, { color: colors.foreground, backgroundColor: colors.muted, borderColor: colors.border }]}
                  value={form.title}
                  onChangeText={v => update('title', v)}
                  placeholder="e.g. Saturday Morning Social Run"
                  placeholderTextColor={colors.mutedForeground}
                />
                <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea, { color: colors.foreground, backgroundColor: colors.muted, borderColor: colors.border }]}
                  value={form.description}
                  onChangeText={v => update('description', v)}
                  placeholder="Tell runners what to expect..."
                  placeholderTextColor={colors.mutedForeground}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
                <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Date</Text>
                <TextInput
                  style={[styles.input, { color: colors.foreground, backgroundColor: colors.muted, borderColor: colors.border }]}
                  value={form.date}
                  onChangeText={v => update('date', v)}
                  placeholder="e.g. July 20, 2026"
                  placeholderTextColor={colors.mutedForeground}
                />
                <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Time</Text>
                <TextInput
                  style={[styles.input, { color: colors.foreground, backgroundColor: colors.muted, borderColor: colors.border }]}
                  value={form.time}
                  onChangeText={v => update('time', v)}
                  placeholder="e.g. 7:00 AM"
                  placeholderTextColor={colors.mutedForeground}
                />
                <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Category</Text>
                <View style={styles.chipRow}>
                  {CATEGORIES.map(cat => (
                    <TouchableOpacity
                      key={cat}
                      onPress={() => update('category', cat)}
                      style={[
                        styles.chip,
                        {
                          backgroundColor: form.category === cat ? colors.primary : colors.muted,
                          borderColor: form.category === cat ? colors.primary : colors.border,
                        },
                      ]}
                    >
                      <Text style={{ color: form.category === cat ? colors.primaryForeground : colors.mutedForeground, fontSize: 12, fontWeight: '500' }}>
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ) : step === 2 ? (
              <View style={styles.stepContent}>
                <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Choose Location *</Text>
                {LOCATION_OPTIONS.map(loc => (
                  <TouchableOpacity
                    key={loc}
                    onPress={() => update('location', loc)}
                    style={[
                      styles.locationOption,
                      {
                        backgroundColor: form.location === loc ? colors.primarySoft : colors.muted,
                        borderColor: form.location === loc ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <Feather name="map-pin" size={14} color={form.location === loc ? colors.accentInk : colors.mutedForeground} />
                    <Text style={{ color: form.location === loc ? colors.accentInk : colors.foreground, marginLeft: 10, fontSize: 13, fontWeight: '500', flex: 1 }}>
                      {loc}
                    </Text>
                    {form.location === loc && <Feather name="check" size={14} color={colors.accentInk} />}
                  </TouchableOpacity>
                ))}
                <Text style={[styles.fieldLabel, { color: colors.mutedForeground, marginTop: 16 }]}>Distance *</Text>
                <View style={styles.chipRow}>
                  {DISTANCE_OPTIONS.map(d => (
                    <TouchableOpacity
                      key={d}
                      onPress={() => update('distance', d)}
                      style={[
                        styles.chip,
                        {
                          backgroundColor: form.distance === d ? colors.primary : colors.muted,
                          borderColor: form.distance === d ? colors.primary : colors.border,
                        },
                      ]}
                    >
                      <Text style={{ color: form.distance === d ? colors.primaryForeground : colors.mutedForeground, fontSize: 12, fontWeight: '500' }}>
                        {d}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ) : step === 3 ? (
              <View style={styles.stepContent}>
                <View style={[styles.sponsorCard, { backgroundColor: colors.muted, borderColor: colors.border }]}>
                  <View style={styles.sponsorHeader}>
                    <View style={[styles.sponsorAvatar, { backgroundColor: '#0EA5E9' }]}>
                      <Text style={{ color: '#fff', fontWeight: '700', fontSize: 11 }}>ZC</Text>
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={[styles.sponsorName, { color: colors.foreground }]}>ZUS Coffee Partnership</Text>
                      <Text style={[styles.sponsorSub, { color: colors.mutedForeground }]}>Verified Brand Partner</Text>
                    </View>
                    <Switch
                      value={form.hasVoucher}
                      onValueChange={v => update('hasVoucher', v)}
                      trackColor={{ false: colors.border, true: colors.primaryBorder }}
                      thumbColor={form.hasVoucher ? colors.primary : colors.mutedForeground}
                    />
                  </View>
                  {form.hasVoucher && (
                    <View style={[styles.voucherPreview, { borderTopColor: colors.border }]}>
                      <Feather name="gift" size={14} color={colors.accentInk} />
                      <Text style={{ color: colors.accentInk, fontSize: 12, fontWeight: '500', flex: 1 }}>
                        ZUS Coffee Voucher awarded to all finishers
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.sponsorNote, { color: colors.mutedForeground }]}>
                  Attaching a sponsor reward increases average event attendance by 42%.
                </Text>
              </View>
            ) : (
              <View style={styles.stepContent}>
                <View style={[styles.previewCard, { backgroundColor: colors.muted, borderColor: colors.border }]}>
                  <Text style={[styles.previewTitle, { color: colors.foreground }]}>{form.title || 'Untitled Run'}</Text>
                  {[
                    { icon: 'map-pin', text: form.location || '—' },
                    { icon: 'navigation', text: `${form.distance || '—'} · ${form.category}` },
                    { icon: 'calendar', text: `${form.date || '—'} at ${form.time || '—'}` },
                  ].map(item => (
                    <View key={item.icon} style={styles.previewRow}>
                      <Feather name={item.icon as any} size={13} color={colors.mutedForeground} />
                      <Text style={[styles.previewText, { color: colors.mutedForeground }]}>{item.text}</Text>
                    </View>
                  ))}
                  {form.hasVoucher && (
                    <View style={styles.previewRow}>
                      <Feather name="gift" size={13} color={colors.accentInk} />
                      <Text style={{ color: colors.accentInk, fontSize: 13 }}>ZUS Coffee Voucher included</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.previewNote, { color: colors.mutedForeground }]}>
                  Your event will appear on the Discover map immediately after publishing.
                </Text>
              </View>
            )}
          </ScrollView>

          {!submitted && (
            <View style={styles.footer}>
              {step > 1 && (
                <TouchableOpacity
                  onPress={handleBack}
                  style={[styles.backBtn, { borderColor: colors.border }]}
                >
                  <Text style={[styles.backBtnText, { color: colors.foreground }]}>Back</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={step === 4 ? handleSubmit : handleNext}
                disabled={!canProceed()}
                style={[
                  styles.nextBtn,
                  {
                    backgroundColor: canProceed() ? colors.primary : colors.muted,
                    flex: step > 1 ? 0.65 : 1,
                  },
                ]}
              >
                <Text style={[styles.nextBtnText, { color: canProceed() ? colors.primaryForeground : colors.mutedForeground }]}>
                  {step === 4 ? 'Publish Run' : 'Continue'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.62)' },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '92%' },
  handleArea: { alignItems: 'center', paddingVertical: 12 },
  handle: { width: 36, height: 4, borderRadius: 2 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingHorizontal: 20, paddingBottom: 14,
  },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  headerSub: { fontSize: 12, marginTop: 2 },
  stepsRow: { flexDirection: 'row', gap: 4, paddingHorizontal: 20, marginBottom: 20 },
  stepBar: { height: 3, borderRadius: 2 },
  body: { paddingHorizontal: 20 },
  stepContent: { paddingBottom: 24 },
  fieldLabel: { fontSize: 12, fontWeight: '500', letterSpacing: 0.4, marginBottom: 8, marginTop: 14 },
  input: { borderRadius: 10, borderWidth: 1, padding: 14, fontSize: 14 },
  textArea: { height: 80 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  locationOption: {
    flexDirection: 'row', alignItems: 'center',
    padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 8,
  },
  sponsorCard: { borderRadius: 14, borderWidth: 1, overflow: 'hidden', marginBottom: 14 },
  sponsorHeader: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  sponsorAvatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  sponsorName: { fontSize: 14, fontWeight: '600' },
  sponsorSub: { fontSize: 11, marginTop: 2 },
  voucherPreview: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1,
  },
  sponsorNote: { fontSize: 12, lineHeight: 18 },
  previewCard: { borderRadius: 14, borderWidth: 1, padding: 16, marginBottom: 14, gap: 10 },
  previewTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  previewRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  previewText: { fontSize: 13 },
  previewNote: { fontSize: 12, lineHeight: 18 },
  successView: { alignItems: 'center', paddingVertical: 44, gap: 12 },
  successIcon: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center' },
  successTitle: { fontSize: 22, fontWeight: '700' },
  successSub: { fontSize: 14, textAlign: 'center' },
  footer: { flexDirection: 'row', gap: 12, paddingHorizontal: 20, paddingTop: 16 },
  backBtn: { flex: 0.3, borderRadius: 14, paddingVertical: 16, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  backBtnText: { fontSize: 15, fontWeight: '600' },
  nextBtn: { borderRadius: 14, paddingVertical: 16, alignItems: 'center', justifyContent: 'center' },
  nextBtnText: { fontSize: 15, fontWeight: '700' },
});
