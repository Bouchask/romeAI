import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, ActivityIndicator, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { theme } from '../../theme';
import { Card } from '../../components/Card';
import { ScreenHeader } from '../../components/ScreenHeader';
import { Button } from '../../components/Button';
import { ApiService } from '../../services/api';

const SESSION_TYPES = [
  { key: 'Cours', icon: 'book-outline', roomMatch: ['Classroom', 'Amphi'] },
  { key: 'TD', icon: 'flask-outline', roomMatch: ['Classroom', 'TD'] },
  { key: 'TP', icon: 'people-outline', roomMatch: ['Lab', 'TP'] },
];

const getNextTeachingDays = () => {
  const days = [];
  let current = new Date();
  while (days.length < 6) {
    current.setDate(current.getDate() + 1);
    if (current.getDay() !== 0) {
      const name = current.toLocaleDateString('en-US', { weekday: 'long' });
      const dateStr = current.toISOString().split('T')[0];
      const shortDate = current.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      days.push({ name, date: dateStr, label: `${name} (${shortDate})` });
    }
  }
  return days;
};

export default function CreateSessionScreen({ navigation }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [myModules, setMyModules] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [availableDays, setAvailableDays] = useState([]);

  // Form State
  const [selectedModule, setSelectedModule] = useState(null);
  const [sessionType, setSessionType] = useState('Cours');
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedDayObj, setSelectedDayObj] = useState(null);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('11:00');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [modules, allRooms] = await Promise.all([
        ApiService.getModules(),
        ApiService.getRooms()
      ]);
      setMyModules(modules.filter(m => m.professor_id === user.id));
      setRooms(allRooms.filter(r => r.status === 'active'));
      const nextDays = getNextTeachingDays();
      setAvailableDays(nextDays);
      setSelectedDayObj(nextDays[0]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Dynamic Room Filtering based on sessionType
  const filteredRooms = rooms.filter(r => {
    const typeObj = SESSION_TYPES.find(t => t.key === sessionType);
    return typeObj.roomMatch.includes(r.type) || r.type === 'Classroom';
  });

  const handleCreate = async () => {
    if (!selectedModule || !selectedRoom || !selectedDayObj) {
      const msg = 'Select module, room and date';
      if (Platform.OS === 'web') alert(msg); else Alert.alert('Validation', msg);
      return;
    }

    if (endTime <= startTime) {
      const msg = 'End time must be after start time';
      if (Platform.OS === 'web') alert(msg); else Alert.alert('Invalid Time', msg);
      return;
    }

    setCreating(true);
    try {
      await ApiService.addSession({
        module_id: selectedModule.id,
        room_id: selectedRoom.id,
        type: sessionType,
        day: selectedDayObj.name,
        date: selectedDayObj.date,
        start_time: startTime,
        end_time: endTime
      });
      
      const successMsg = 'Session scheduled successfully!';
      if (Platform.OS === 'web') alert(successMsg); else Alert.alert('Success', successMsg);
      navigation.goBack();
    } catch (err) {
      const msg = typeof err === 'string' ? err : 'Error during scheduling';
      if (Platform.OS === 'web') alert(msg); else Alert.alert('Scheduling Error', msg);
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={theme.colors.primary} /></View>;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <ScreenHeader title="Schedule Class" subtitle="Planning & Conflict Check" />

      <View style={styles.content}>
        <Text style={styles.label}>1. Select Module</Text>
        <View style={styles.chipRow}>
          {myModules.map((m) => (
            <TouchableOpacity
              key={m.id}
              style={[styles.chip, selectedModule?.id === m.id && styles.chipActive]}
              onPress={() => setSelectedModule(m)}
            >
              <Text style={[styles.chipText, selectedModule?.id === m.id && styles.chipTextActive]}>{m.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>2. Session Type</Text>
        <View style={styles.typeRow}>
          {SESSION_TYPES.map((t) => (
            <TouchableOpacity
              key={t.key}
              style={[styles.typeChip, sessionType === t.key && styles.typeChipActive]}
              onPress={() => { setSessionType(t.key); setSelectedRoom(null); }}
            >
              <Ionicons name={t.icon} size={20} color={sessionType === t.key ? '#FFF' : theme.colors.textSecondary} />
              <Text style={[styles.typeText, sessionType === t.key && styles.typeTextActive]}>{t.key}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>3. Timing & Date</Text>
        <Card style={styles.scheduleCard}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Date (Next 6 Days)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dayScroll}>
              {availableDays.map(d => (
                <TouchableOpacity 
                  key={d.date} 
                  style={[styles.dayChip, selectedDayObj?.date === d.date && styles.activeDay]} 
                  onPress={() => setSelectedDayObj(d)}
                >
                  <Text style={[styles.dayText, selectedDayObj?.date === d.date && styles.activeDayText]}>{d.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          
          <View style={styles.timeRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>Start Time</Text>
              <TextInput 
                style={styles.input} 
                value={startTime} 
                onChangeText={setStartTime} 
                type={Platform.OS === 'web' ? 'time' : 'default'}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>End Time</Text>
              <TextInput 
                style={styles.input} 
                value={endTime} 
                onChangeText={setEndTime} 
                type={Platform.OS === 'web' ? 'time' : 'default'}
              />
            </View>
          </View>
        </Card>

        <Text style={styles.label}>4. Choose Compatible Room</Text>
        {filteredRooms.length === 0 ? <Text style={styles.emptyText}>No compatible rooms available for {sessionType}.</Text> :
          filteredRooms.map((r) => (
            <TouchableOpacity key={r.id} onPress={() => setSelectedRoom(r)}>
              <Card style={[styles.roomCard, selectedRoom?.id === r.id && styles.selectedRoomCard]}>
                <View style={styles.roomRow}>
                  <Ionicons name="business" size={20} color={selectedRoom?.id === r.id ? theme.colors.primary : theme.colors.textMuted} />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.roomName}>{r.name} ({r.capacity} seats)</Text>
                    <View style={styles.amenitiesRow}>
                      <View style={styles.amenity}>
                        <Ionicons name="wifi" size={12} color={r.has_wifi ? theme.colors.success : theme.colors.textMuted} />
                        <Text style={styles.amenityText}>Wi-Fi</Text>
                      </View>
                      <View style={styles.amenity}>
                        <Ionicons name="videocam" size={12} color={r.has_projector ? theme.colors.primary : theme.colors.textMuted} />
                        <Text style={styles.amenityText}>Projector</Text>
                      </View>
                    </View>
                  </View>
                  {selectedRoom?.id === r.id && <Ionicons name="checkmark-circle" size={24} color={theme.colors.primary} />}
                </View>
              </Card>
            </TouchableOpacity>
          ))
        }

        <Button title="Schedule Session" loading={creating} onPress={handleCreate} style={styles.submitBtn} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.lg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  label: { fontSize: 12, fontWeight: '800', color: theme.colors.textMuted, textTransform: 'uppercase', marginBottom: 12, marginTop: 24 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border },
  chipActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  chipText: { fontSize: 13, fontWeight: '600', color: theme.colors.textSecondary },
  chipTextActive: { color: '#FFF' },
  typeRow: { flexDirection: 'row', gap: 10 },
  typeChip: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: 12, backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border },
  typeChipActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  typeText: { fontSize: 14, fontWeight: '600', color: theme.colors.textSecondary },
  typeTextActive: { color: '#FFF' },
  scheduleCard: { padding: 16 },
  inputLabel: { fontSize: 10, fontWeight: '800', color: theme.colors.textMuted, marginBottom: 8 },
  dayScroll: { flexDirection: 'row', marginBottom: 16 },
  dayChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 15, backgroundColor: theme.colors.accent, marginRight: 8, borderWidth: 1, borderColor: theme.colors.border },
  activeDay: { backgroundColor: theme.colors.primaryLight, borderColor: theme.colors.primary },
  dayText: { fontSize: 12, fontWeight: '700', color: theme.colors.textSecondary },
  activeDayText: { color: theme.colors.primary },
  timeRow: { flexDirection: 'row', gap: 16 },
  input: { backgroundColor: theme.colors.accent, padding: 12, borderRadius: 8, fontSize: 14, borderWidth: 1, borderColor: theme.colors.border },
  roomCard: { marginBottom: 8, padding: 12 },
  selectedRoomCard: { borderColor: theme.colors.primary, backgroundColor: theme.colors.primaryLight + '10' },
  roomRow: { flexDirection: 'row', alignItems: 'center' },
  roomName: { fontSize: 15, fontWeight: '700', color: theme.colors.text },
  amenitiesRow: { flexDirection: 'row', gap: 12, marginTop: 4 },
  amenity: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  amenityText: { fontSize: 11, color: theme.colors.textMuted },
  emptyText: { color: theme.colors.textMuted, textAlign: 'center', marginTop: 10, fontSize: 14 },
  submitBtn: { marginTop: 32 }
});
