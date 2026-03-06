import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { theme } from '../../theme';
import { Card } from '../../components/Card';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Button } from '../../components/Button';
import { MODULES as MOCK_MODULES } from '../../data/mockData';

const SESSION_TYPES = [
  { key: 'Lecture', icon: 'book-outline' },
  { key: 'Lab', icon: 'flask-outline' },
  { key: 'Workshop', icon: 'people-outline' },
];

const AVAILABLE_ROOMS = [
  { id: '1', name: 'Room 101', capacity: 40, type: 'Lecture Hall' },
  { id: '2', name: 'Room 203', capacity: 30, type: 'Classroom' },
  { id: '3', name: 'Room 205', capacity: 50, type: 'Hall' },
];

export default function CreateSessionScreen() {
  const { user } = useAuth();
  const [module, setModule] = useState('');
  const [sessionType, setSessionType] = useState('');
  const [selectedRoom, setSelectedRoom] = useState(null);

  const modules = MOCK_MODULES.filter(m => m.professorId === 'p1').map(m => m.name);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <ScreenHeader 
        title="Create Session" 
        subtitle="Schedule a new academic activity" 
      />

      <View style={styles.content}>
        <Text style={styles.label}>Select Module</Text>
        <View style={styles.chipRow}>
          {modules.map((m) => (
            <TouchableOpacity
              key={m}
              style={[styles.chip, module === m && styles.chipActive]}
              onPress={() => setModule(m)}
              activeOpacity={0.7}
            >
              <Text style={[styles.chipText, module === m && styles.chipTextActive]}>{m}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Session Type</Text>
        <View style={styles.typeRow}>
          {SESSION_TYPES.map((t) => (
            <TouchableOpacity
              key={t.key}
              style={[styles.typeChip, sessionType === t.key && styles.typeChipActive]}
              onPress={() => setSessionType(t.key)}
              activeOpacity={0.7}
            >
              <Ionicons 
                name={t.icon} 
                size={20} 
                color={sessionType === t.key ? '#FFF' : theme.colors.textSecondary} 
              />
              <Text style={[styles.typeText, sessionType === t.key && styles.typeTextActive]}>{t.key}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Schedule Configuration</Text>
        <Card style={styles.scheduleGridCard}>
          <View style={styles.scheduleRow}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Session Day</Text>
              <TouchableOpacity style={styles.miniPicker}>
                <Text style={styles.miniPickerText}>Monday</Text>
                <Ionicons name="chevron-down" size={14} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Start Time</Text>
              <TouchableOpacity style={styles.miniPicker}>
                <Text style={styles.miniPickerText}>09:00 AM</Text>
                <Ionicons name="time-outline" size={14} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.inputGroupFull}>
            <Text style={styles.inputLabel}>Duration</Text>
            <View style={styles.durationOptions}>
              {['1h 00', '1h 30', '2h 00', '3h 00'].map(d => (
                <TouchableOpacity key={d} style={[styles.durationChip, d === '1h 30' && styles.activeDurationChip]}>
                  <Text style={[styles.durationText, d === '1h 30' && styles.activeDurationText]}>{d}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Card>

        <Text style={styles.label}>Choose Available Room</Text>
        {AVAILABLE_ROOMS.map((r) => (
          <TouchableOpacity 
            key={r.id} 
            onPress={() => setSelectedRoom(r.id)}
            activeOpacity={0.9}
          >
            <Card style={[styles.roomCard, selectedRoom === r.id && styles.selectedRoomCard]}>
              <View style={styles.roomRow}>
                <View style={[styles.roomIcon, selectedRoom === r.id && styles.selectedRoomIcon]}>
                  <Ionicons name="business" size={20} color={selectedRoom === r.id ? '#FFF' : theme.colors.primary} />
                </View>
                <View style={styles.roomInfo}>
                  <Text style={styles.roomName}>{r.name}</Text>
                  <Text style={styles.roomMeta}>{r.type} · {r.capacity} seats</Text>
                </View>
                {selectedRoom === r.id && (
                  <Ionicons name="checkmark-circle" size={24} color={theme.colors.primary} />
                )}
              </View>
            </Card>
          </TouchableOpacity>
        ))}

        <Text style={styles.label}>Session Objectives (Syllabus)</Text>
        <Card style={styles.notesCard}>
          <TextInput
            placeholder="Enter key topics to be covered (e.g. 1. Introduction, 2. Lab Setup...)"
            placeholderTextColor={theme.colors.textMuted}
            multiline
            numberOfLines={4}
            style={styles.textArea}
          />
        </Card>

        <Text style={styles.label}>Learning Resources (Optional)</Text>
        <Card style={styles.resourceCard}>
          <View style={styles.resourceHeader}>
            <Ionicons name="cloud-upload-outline" size={24} color={theme.colors.primary} />
            <Text style={styles.resourceTitle}>Attach Course Materials</Text>
          </View>
          <Text style={styles.resourceSub}>Add PDFs, Slides or Exercise sheets for students</Text>
          <TouchableOpacity style={styles.uploadBtn}>
            <Text style={styles.uploadText}>Select Files</Text>
          </TouchableOpacity>
        </Card>

        <Button 
          title="Confirm & Schedule Session" 
          disabled={!module || !sessionType || !selectedRoom}
          style={styles.submitBtn}
          onPress={() => alert('Session Created & Students Notified!')}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.lg, paddingBottom: theme.spacing.xxl },
  label: { fontSize: 13, fontWeight: '700', color: theme.colors.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: theme.spacing.sm, marginTop: theme.spacing.lg },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },
  chip: { paddingHorizontal: theme.spacing.md, paddingVertical: 10, borderRadius: theme.borderRadius.md, backgroundColor: theme.colors.card, borderWidth: 1.5, borderColor: theme.colors.border },
  chipActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  chipText: { fontSize: 14, fontWeight: '600', color: theme.colors.textSecondary },
  chipTextActive: { color: '#FFF' },
  typeRow: { flexDirection: 'row', gap: theme.spacing.sm },
  typeChip: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: theme.borderRadius.md, backgroundColor: theme.colors.card, borderWidth: 1.5, borderColor: theme.colors.border },
  typeChipActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  typeText: { fontSize: 14, fontWeight: '600', color: theme.colors.textSecondary },
  typeTextActive: { color: '#FFF' },
  scheduleGridCard: { padding: theme.spacing.md },
  scheduleRow: { flexDirection: 'row', gap: theme.spacing.md, marginBottom: theme.spacing.md },
  inputGroup: { flex: 1 },
  inputGroupFull: { marginTop: theme.spacing.md },
  inputLabel: { fontSize: 11, fontWeight: '800', color: theme.colors.textMuted, textTransform: 'uppercase', marginBottom: 6 },
  miniPicker: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: theme.colors.accent, padding: 10, borderRadius: 8, borderWidth: 1, borderColor: theme.colors.border },
  miniPickerText: { fontSize: 14, fontWeight: '600', color: theme.colors.textSecondary },
  durationOptions: { flexDirection: 'row', gap: 8, marginTop: 4 },
  durationChip: { flex: 1, paddingVertical: 8, borderRadius: 8, backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border, alignItems: 'center' },
  activeDurationChip: { backgroundColor: theme.colors.primaryLight, borderColor: theme.colors.primary },
  durationText: { fontSize: 12, fontWeight: '700', color: theme.colors.textSecondary },
  activeDurationText: { color: theme.colors.primary },
  divider: { height: 1, backgroundColor: theme.colors.border },
  roomCard: { marginBottom: theme.spacing.sm, padding: theme.spacing.sm },
  selectedRoomCard: { borderColor: theme.colors.primary, backgroundColor: theme.colors.primaryLight + '20' },
  roomRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
  roomIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: theme.colors.accent, alignItems: 'center', justifyContent: 'center' },
  selectedRoomIcon: { backgroundColor: theme.colors.primary },
  roomInfo: { flex: 1 },
  roomName: { fontSize: 16, fontWeight: '700', color: theme.colors.text },
  roomMeta: { fontSize: 13, color: theme.colors.textSecondary, marginTop: 2 },
  notesCard: { padding: theme.spacing.md, marginBottom: theme.spacing.sm },
  textArea: { fontSize: 15, color: theme.colors.text, textAlignVertical: 'top', minHeight: 100 },
  resourceCard: { padding: theme.spacing.lg, alignItems: 'center', borderStyle: 'dashed' },
  resourceHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
  resourceTitle: { fontSize: 15, fontWeight: '700', color: theme.colors.text },
  resourceSub: { fontSize: 13, color: theme.colors.textMuted, textAlign: 'center', marginBottom: theme.spacing.md },
  uploadBtn: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, backgroundColor: theme.colors.accent, borderWidth: 1, borderColor: theme.colors.border },
  uploadText: { fontSize: 12, fontWeight: '700', color: theme.colors.primary },
  submitBtn: { marginTop: theme.spacing.xl },
});
